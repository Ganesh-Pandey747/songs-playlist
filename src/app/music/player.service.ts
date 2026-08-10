import { Injectable, computed, effect, signal } from '@angular/core';
import { AudioBackend } from './playback/audio-backend';
import { NowPlaying, PlaybackBackend, PlaybackSink } from './playback/playback-backend';
import { PreviewBackend } from './playback/preview-backend';
import { YouTubeBackend } from './playback/youtube-backend';
import { DEFAULT_PLAYLIST_ID, PLAYLISTS, Playlist, PlaylistId, Track } from './playlists';

/** Seconds of playback after which "previous" restarts the track instead of stepping back. */
const RESTART_THRESHOLD = 3;

const UNKNOWN_TRACK: Track = { id: 'unknown', title: 'सफ़र', artist: 'Loading…' };

const AD_FREE_KEY = 'safar.ad-free';

function readStoredAdFree(): boolean {
  try {
    return localStorage.getItem(AD_FREE_KEY) === 'true';
  } catch {
    return false;
  }
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Single owner of playback for the app. Holds the state as signals and forwards
 * commands to whichever backend the active playlist needs — the YouTube IFrame
 * player for `youtube` playlists, an `<audio>` element for `audio` ones.
 *
 * `youtube` playlists have a second mode: with ad-free playback on, the same
 * queue runs through `PreviewBackend`, which plays ~30 second clips from Apple's
 * preview CDN so nothing can be advertised between tracks.
 */
@Injectable({ providedIn: 'root' })
export class PlayerService {
  readonly playlists = PLAYLISTS;

  private readonly playlistId = signal<PlaylistId>(DEFAULT_PLAYLIST_ID);
  private readonly trackIndex = signal(0);
  /** Ad-free clips instead of full YouTube videos. Remembered between visits. */
  private readonly adFree = signal(readStoredAdFree());
  /** The backend's own view of the queue; falls back to the snapshot. */
  private readonly liveQueue = signal<readonly Track[] | null>(null);
  /** Title/artist for tracks the snapshot doesn't cover. */
  private readonly live = signal<NowPlaying | null>(null);

  // Playback state is written only by the sink below, so components get it
  // read-only.
  private readonly playing = signal(false);
  private readonly buffering = signal(false);
  private readonly position = signal(0);
  private readonly length = signal(0);
  private readonly level = signal(0.8);
  private readonly failure = signal<string | null>(null);
  private readonly started = signal(false);

  readonly isPlaying = this.playing.asReadonly();
  readonly isBuffering = this.buffering.asReadonly();
  readonly currentTime = this.position.asReadonly();
  readonly duration = this.length.asReadonly();
  readonly volume = this.level.asReadonly();
  readonly errorMessage = this.failure.asReadonly();
  /** False until the first successful play — drives the "tap to start" prompt. */
  readonly hasStarted = this.started.asReadonly();
  readonly activeTrackIndex = this.trackIndex.asReadonly();
  readonly isAdFree = this.adFree.asReadonly();

  /** Ad-free mode only has clips for YouTube queues; hosted audio is already clean. */
  readonly canGoAdFree = computed(() => this.activePlaylist().source.kind === 'youtube');

  readonly activePlaylist = computed<Playlist>(
    () => this.playlists.find((p) => p.id === this.playlistId()) ?? this.playlists[0],
  );
  readonly queue = computed<readonly Track[]>(
    () => this.liveQueue() ?? this.activePlaylist().source.tracks,
  );
  readonly track = computed<Track>(() => {
    const fromQueue = this.queue()[this.trackIndex()];
    const fromSource = this.live();
    // Snapshot titles are already tidy, so prefer them; fall back to whatever
    // the source reports for tracks we have no snapshot entry for.
    if (fromQueue && !fromQueue.title.startsWith('Track ')) {
      // A snapshot's artist is the uploading channel. In ad-free mode the match
      // carries the actual performer, which is the better of the two.
      return this.adFree() && fromSource ? { ...fromQueue, artist: fromSource.artist } : fromQueue;
    }
    if (fromSource) return { id: fromQueue?.id ?? 'live', ...fromSource };
    return fromQueue ?? UNKNOWN_TRACK;
  });

  readonly progress = computed(() => {
    const total = this.duration();
    return total > 0 ? Math.min(100, (this.currentTime() / total) * 100) : 0;
  });
  readonly currentTimeLabel = computed(() => formatTime(this.currentTime()));
  readonly durationLabel = computed(() => formatTime(this.duration()));

  private readonly sink: PlaybackSink = {
    setPlaying: (value) => {
      this.playing.set(value);
      if (value) this.started.set(true);
    },
    setBuffering: (value) => this.buffering.set(value),
    setTime: (seconds) => this.position.set(seconds),
    setDuration: (seconds) => this.length.set(seconds),
    setError: (message) => this.failure.set(message),
    setIndex: (index) => this.trackIndex.set(index),
    setQueue: (tracks) => this.liveQueue.set(tracks),
    setNowPlaying: (value) => this.live.set(value),
  };

  private backend: PlaybackBackend;

  constructor() {
    this.backend = this.createBackend(this.activePlaylist());
    this.backend.setVolume(this.level());
    this.backend.start(0, false);

    // Keep the OS/lock-screen media controls in step with the current track.
    effect(() => this.syncMediaSession(this.track()));
    this.registerMediaSessionHandlers();
  }

  /** Attempts playback without a gesture; false means the browser refused. */
  tryAutoplay(): Promise<boolean> {
    return this.backend.tryAutoplay();
  }

  play(): void {
    this.backend.play();
  }

  pause(): void {
    this.backend.pause();
  }

  toggle(): void {
    if (this.isPlaying()) this.pause();
    else this.play();
  }

  next(autoplay = this.isPlaying()): void {
    this.backend.next(autoplay);
  }

  previous(): void {
    if (this.backend.position() > RESTART_THRESHOLD) {
      this.seekTo(0);
      return;
    }
    this.backend.previous(this.isPlaying());
  }

  selectTrack(index: number): void {
    if (index < 0 || index >= this.queue().length) return;
    this.backend.selectIndex(index, this.isPlaying() || this.hasStarted());
  }

  selectPlaylist(id: PlaylistId): void {
    if (id === this.activePlaylist().id) return;

    const resume = this.isPlaying() || this.hasStarted();
    this.playlistId.set(id);
    this.rebuild(0, resume);
  }

  toggleAdFree(): void {
    this.setAdFree(!this.adFree());
  }

  /**
   * Swaps the source under the current track, holding position in the queue.
   * Playback carries over only if it was already running, so flipping the switch
   * on a paused player leaves it paused.
   */
  setAdFree(value: boolean): void {
    if (value === this.adFree() || !this.canGoAdFree()) return;

    this.adFree.set(value);
    try {
      localStorage.setItem(AD_FREE_KEY, String(value));
    } catch {
      // Preference just won't survive the session.
    }
    this.rebuild(this.trackIndex(), this.isPlaying());
  }

  /** Seeks by fraction of the track (0–1), as produced by the progress bar. */
  seekToRatio(ratio: number): void {
    const total = this.duration();
    if (!Number.isFinite(total) || total <= 0) return;
    this.seekTo(Math.max(0, Math.min(1, ratio)) * total);
  }

  seekTo(seconds: number): void {
    this.backend.seekTo(seconds);
  }

  nudge(deltaSeconds: number): void {
    const total = this.duration() || 0;
    const target = this.backend.position() + deltaSeconds;
    this.seekTo(Math.max(0, total > 0 ? Math.min(total, target) : target));
  }

  setVolume(value: number): void {
    const clamped = Math.max(0, Math.min(1, value));
    this.level.set(clamped);
    this.backend.setVolume(clamped);
  }

  toggleMute(): void {
    this.setVolume(this.volume() > 0 ? 0 : 0.8);
  }

  /** Tears the current backend down and starts a fresh one at `index`. */
  private rebuild(index: number, autoplay: boolean): void {
    this.backend.destroy();
    this.resetPlaybackState();
    this.backend = this.createBackend(this.activePlaylist());
    this.backend.setVolume(this.level());
    this.backend.start(index, autoplay);
  }

  private createBackend(playlist: Playlist): PlaybackBackend {
    const source = playlist.source;
    if (source.kind === 'audio') return new AudioBackend(source.tracks, this.sink);
    return this.adFree()
      ? new PreviewBackend(source.tracks, this.sink)
      : new YouTubeBackend(source.tracks, this.sink);
  }

  private resetPlaybackState(): void {
    this.playing.set(false);
    this.buffering.set(false);
    this.position.set(0);
    this.length.set(0);
    this.failure.set(null);
    this.trackIndex.set(0);
    this.liveQueue.set(null);
    this.live.set(null);
  }

  private syncMediaSession(track: Track): void {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: this.activePlaylist().name,
    });
  }

  private registerMediaSessionHandlers(): void {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.setActionHandler('play', () => this.play());
    navigator.mediaSession.setActionHandler('pause', () => this.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
    navigator.mediaSession.setActionHandler('nexttrack', () => this.next(true));
  }
}
