import { cleanTitle } from '../clean-title';
import { Track } from '../playlists';
import { PlaybackBackend, PlaybackSink } from './playback-backend';

/** The slice of the YouTube IFrame Player API this backend uses. */
interface YouTubePlayer {
  playVideo(): void;
  pauseVideo(): void;
  nextVideo(): void;
  previousVideo(): void;
  playVideoAt(index: number): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(percent: number): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlaylist(): string[] | null;
  getPlaylistIndex(): number;
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
const MAX_CONSECUTIVE_SKIPS = 6;
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
 * Streams a real YouTube playlist through the IFrame Player API.
 *
 * The playlist is the source of truth for order and contents; `snapshot` only
 * supplies readable titles, so a video added to the playlist later still plays
 * (its name then comes from the player itself).
 */
export class YouTubeBackend implements PlaybackBackend {
  private player: YouTubePlayer | null = null;
  private host: HTMLElement | null = null;
  private timer: number | null = null;
  private lastIndex = -1;
  private consecutiveSkips = 0;
  private volume = 0.8;
  private startIndex = 0;
  private pendingPlay = false;
  private destroyed = false;
  private readonly titles: ReadonlyMap<string, Track>;

  constructor(
    private readonly playlistId: string,
    snapshot: readonly Track[],
    private readonly sink: PlaybackSink,
  ) {
    this.titles = new Map(snapshot.map((track) => [track.id, track]));
  }

  start(index: number, autoplay: boolean): void {
    this.startIndex = index;
    this.pendingPlay = autoplay;
    this.sink.setIndex(index);
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
      const state = this.player?.getPlayerState();
      if (state === STATE.PLAYING) return true;
    }
    return this.player?.getPlayerState() === STATE.PLAYING;
  }

  next(autoplay: boolean): void {
    this.pendingPlay = autoplay;
    this.player?.nextVideo();
  }

  previous(autoplay: boolean): void {
    this.pendingPlay = autoplay;
    this.player?.previousVideo();
  }

  selectIndex(index: number, autoplay: boolean): void {
    this.pendingPlay = autoplay;
    if (!this.player) {
      this.startIndex = index;
      this.sink.setIndex(index);
      return;
    }
    this.player.playVideoAt(index);
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
      playerVars: {
        listType: 'playlist',
        list: this.playlistId,
        index: this.startIndex,
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
    this.publishQueue();
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
        // In playlist mode YouTube advances on its own; the poll picks up the
        // new index. Only the last track of the playlist actually stops here.
        this.sink.setPlaying(false);
        break;
      case STATE.CUED:
        this.publishQueue();
        this.syncTrack();
        break;
    }
  }

  private onError(code: number): void {
    if (!SKIPPABLE_ERRORS.has(code)) {
      this.sink.setError('YouTube could not play this track');
      return;
    }
    if (this.consecutiveSkips >= MAX_CONSECUTIVE_SKIPS) {
      this.sink.setError('Several tracks in a row cannot be embedded');
      return;
    }
    this.consecutiveSkips++;
    this.sink.setError('Not embeddable here — skipping');
    this.next(true);
  }

  /** Maps the live playlist ids onto readable names from the snapshot. */
  private publishQueue(): void {
    const ids = this.player?.getPlaylist();
    if (!ids?.length) return;

    this.sink.setQueue(
      ids.map(
        (id, i) =>
          this.titles.get(id) ?? {
            id,
            title: `Track ${i + 1}`,
            artist: 'YouTube',
          },
      ),
    );
  }

  private syncTrack(): void {
    if (!this.player) return;

    const index = this.player.getPlaylistIndex();
    if (index >= 0) {
      this.lastIndex = index;
      this.sink.setIndex(index);
    }

    const duration = this.player.getDuration();
    if (duration > 0) this.sink.setDuration(duration);

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

      // YouTube advances the playlist by itself, so watch for the jump.
      const index = this.player.getPlaylistIndex();
      if (index >= 0 && index !== this.lastIndex) this.syncTrack();
    }, POLL_INTERVAL_MS);
  }

  private stopPolling(): void {
    if (this.timer === null) return;
    clearInterval(this.timer);
    this.timer = null;
  }
}
