import { Injectable, computed, effect, signal } from '@angular/core';
import { AudioBackend } from './playback/audio-backend';
import { NowPlaying, PlaybackBackend, PlaybackSink } from './playback/playback-backend';
import { YouTubeBackend } from './playback/youtube-backend';
import { DEFAULT_PLAYLIST_ID, PLAYLISTS, Playlist, PlaylistId, Track } from './playlists';

/** Seconds of playback after which "previous" restarts the track instead of stepping back. */
const RESTART_THRESHOLD = 3;

const UNKNOWN_TRACK: Track = { id: 'unknown', title: 'सफ़र', artist: 'Loading…' };

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
 */
@Injectable({ providedIn: 'root' })
export class PlayerService {
  readonly playlists = PLAYLISTS;

  private readonly playlistId = signal<PlaylistId>(DEFAULT_PLAYLIST_ID);
  private readonly trackIndex = signal(0);
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
    if (fromQueue && !fromQueue.title.startsWith('Track ')) return fromQueue;
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
    this.backend.destroy();
    this.resetPlaybackState();
    this.playlistId.set(id);
    this.backend = this.createBackend(this.activePlaylist());
    this.backend.setVolume(this.level());
    this.backend.start(0, resume);
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

  private createBackend(playlist: Playlist): PlaybackBackend {
    const source = playlist.source;
    return source.kind === 'youtube'
      ? new YouTubeBackend(source.playlistId, source.tracks, this.sink)
      : new AudioBackend(source.tracks, this.sink);
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
