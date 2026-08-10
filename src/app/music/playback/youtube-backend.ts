import { cleanTitle } from '../clean-title';
import { Track } from '../playlists';
import { PlaybackBackend, PlaybackSink } from './playback-backend';

/** The slice of the YouTube IFrame Player API this backend uses. */
interface YouTubePlayer {
  loadVideoById(videoId: string): void;
  cueVideoById(videoId: string): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(percent: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  getVideoData(): { title?: string; author?: string; video_id?: string };
  getPlayerState(): number;
  destroy(): void;
}

interface YouTubeApi {
  Player: new (host: HTMLElement, options: unknown) => YouTubePlayer;
}

const STATE = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 } as const;

/** Videos whose owner disallows embedding, or that no longer exist. */
const SKIPPABLE_ERRORS = new Set([100, 101, 150]);
const POLL_INTERVAL_MS = 250;
const AUTOPLAY_GRACE_MS = 1500;

let apiPromise: Promise<YouTubeApi> | null = null;

/** Loads the IFrame API script once per page and resolves with `window.YT`. */
function loadYouTubeApi(): Promise<YouTubeApi> {
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const holder = window as unknown as {
      YT?: YouTubeApi;
      onYouTubeIframeAPIReady?: () => void;
    };
    if (holder.YT?.Player) {
      resolve(holder.YT);
      return;
    }

    const previous = holder.onYouTubeIframeAPIReady;
    holder.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (holder.YT) resolve(holder.YT);
      else reject(new Error('YouTube API loaded without a player'));
    };

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => reject(new Error('Could not reach YouTube'));
    document.head.appendChild(script);
  });

  return apiPromise;
}

/**
 * Plays a list of YouTube videos through the IFrame Player API, one video at a
 * time via `loadVideoById`.
 *
 * It deliberately does not use YouTube's own playlist handling. Loading by
 * playlist id (`listType: 'playlist'`) fails with error 150 on some playlists —
 * the player reports ready but `getPlaylist()` returns null, so there is
 * nothing to play or even skip to. Queueing ids up front fixes that, but then
 * `nextVideo()` still does not reliably advance past a video that failed to
 * load, which strands the whole queue behind one un-embeddable upload. Holding
 * the index here and loading each video explicitly makes skipping deterministic.
 */
export class YouTubeBackend implements PlaybackBackend {
  private player: YouTubePlayer | null = null;
  private host: HTMLElement | null = null;
  private timer: number | null = null;
  private index = 0;
  private consecutiveSkips = 0;
  private volume = 0.8;
  private pendingPlay = false;
  private destroyed = false;

  constructor(
    private readonly tracks: readonly Track[],
    private readonly sink: PlaybackSink,
  ) {}

  start(index: number, autoplay: boolean): void {
    this.index = this.wrap(index);
    this.pendingPlay = autoplay;
    this.sink.setQueue(this.tracks);
    this.sink.setIndex(this.index);
    void this.mount();
  }

  play(): void {
    if (!this.player) {
      this.pendingPlay = true;
      return;
    }
    this.player.playVideo();
  }

  pause(): void {
    this.player?.pauseVideo();
  }

  /** YouTube gives no promise, so watch for a state change within a grace period. */
  async tryAutoplay(): Promise<boolean> {
    this.pendingPlay = true;
    try {
      await this.mount();
    } catch {
      return false;
    }
    if (!this.player) return false;

    this.player.playVideo();
    const deadline = Date.now() + AUTOPLAY_GRACE_MS;
    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      if (this.player?.getPlayerState() === STATE.PLAYING) return true;
    }
    return this.player?.getPlayerState() === STATE.PLAYING;
  }

  next(autoplay: boolean): void {
    this.load(this.index + 1, autoplay);
  }

  previous(autoplay: boolean): void {
    this.load(this.index - 1, autoplay);
  }

  selectIndex(index: number, autoplay: boolean): void {
    if (index < 0 || index >= this.tracks.length) return;
    // An explicit pick is a fresh start for the skip budget.
    this.consecutiveSkips = 0;
    this.load(index, autoplay);
  }

  seekTo(seconds: number): void {
    this.player?.seekTo(seconds, true);
    this.sink.setTime(seconds);
  }

  position(): number {
    return this.player?.getCurrentTime() ?? 0;
  }

  setVolume(level: number): void {
    this.volume = level;
    this.player?.setVolume(Math.round(level * 100));
  }

  destroy(): void {
    this.destroyed = true;
    this.stopPolling();
    this.player?.destroy();
    this.player = null;
    this.host?.remove();
    this.host = null;
  }

  private wrap(index: number): number {
    const count = this.tracks.length;
    return count ? ((index % count) + count) % count : 0;
  }

  private load(index: number, autoplay: boolean): void {
    this.index = this.wrap(index);
    this.pendingPlay = autoplay;
    this.sink.setIndex(this.index);
    this.sink.setTime(0);
    this.sink.setDuration(0);

    const videoId = this.tracks[this.index]?.id;
    if (!videoId || !this.player) return;

    if (autoplay) this.player.loadVideoById(videoId);
    else this.player.cueVideoById(videoId);
  }

  private async mount(): Promise<void> {
    if (this.player || this.destroyed) return;

    let api: YouTubeApi;
    try {
      api = await loadYouTubeApi();
    } catch {
      this.sink.setError('Could not reach YouTube');
      throw new Error('YouTube API unavailable');
    }
    if (this.destroyed || this.player) return;

    // A real-sized player kept off-screen: the illustration is the interface.
    this.host = document.createElement('div');
    this.host.className = 'yt-player-host';
    this.host.setAttribute('aria-hidden', 'true');
    const mountPoint = document.createElement('div');
    this.host.appendChild(mountPoint);
    document.body.appendChild(this.host);

    this.player = new api.Player(mountPoint, {
      width: 320,
      height: 180,
      videoId: this.tracks[this.index]?.id,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        origin: window.location.origin,
      },
      events: {
        onReady: () => this.onReady(),
        onStateChange: (event: { data: number }) => this.onStateChange(event.data),
        onError: (event: { data: number }) => this.onError(event.data),
      },
    });
  }

  private onReady(): void {
    if (!this.player) return;
    this.player.setVolume(Math.round(this.volume * 100));
    this.syncTrack();
    if (this.pendingPlay) this.player.playVideo();
  }

  private onStateChange(state: number): void {
    switch (state) {
      case STATE.PLAYING:
        this.consecutiveSkips = 0;
        this.sink.setPlaying(true);
        this.sink.setBuffering(false);
        this.sink.setError(null);
        this.syncTrack();
        this.startPolling();
        break;
      case STATE.PAUSED:
        this.sink.setPlaying(false);
        this.stopPolling();
        break;
      case STATE.BUFFERING:
        this.sink.setBuffering(true);
        this.syncTrack();
        break;
      case STATE.ENDED:
        this.stopPolling();
        this.next(true);
        break;
      case STATE.CUED:
        this.syncTrack();
        break;
    }
  }

  private onError(code: number): void {
    if (!SKIPPABLE_ERRORS.has(code)) {
      this.sink.setError('YouTube could not play this track');
      return;
    }
    // Some uploads block embedding. Walk the queue for one that plays, but no
    // further than a full lap so an all-blocked playlist can't loop forever.
    if (this.consecutiveSkips >= this.tracks.length) {
      this.sink.setPlaying(false);
      this.sink.setBuffering(false);
      this.sink.setError('No track here can be played outside YouTube');
      return;
    }
    this.consecutiveSkips++;
    this.sink.setError('Not playable here — skipping');
    this.next(true);
  }

  private syncTrack(): void {
    if (!this.player) return;

    const duration = this.player.getDuration();
    if (duration > 0) this.sink.setDuration(duration);

    // Prefer the snapshot's tidied name; fall back to what the player reports.
    const data = this.player.getVideoData();
    this.sink.setNowPlaying(
      data?.title ? { title: cleanTitle(data.title), artist: data.author ?? 'YouTube' } : null,
    );
  }

  private startPolling(): void {
    if (this.timer !== null) return;
    this.timer = window.setInterval(() => {
      if (!this.player) return;
      this.sink.setTime(this.player.getCurrentTime() || 0);
      const duration = this.player.getDuration();
      if (duration > 0) this.sink.setDuration(duration);
    }, POLL_INTERVAL_MS);
  }

  private stopPolling(): void {
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
  }
}
