import { Track } from '../playlists';

export interface NowPlaying {
  readonly title: string;
  readonly artist: string;
}

/**
 * How a backend pushes its state up into `PlayerService`. Backends never read
 * state back, so there is exactly one writer per value.
 */
export interface PlaybackSink {
  setPlaying(value: boolean): void;
  setBuffering(value: boolean): void;
  setTime(seconds: number): void;
  setDuration(seconds: number): void;
  setError(message: string | null): void;
  setIndex(index: number): void;
  /** Replaces the queue once the backend knows the real contents. */
  setQueue(tracks: readonly Track[]): void;
  /** Title/artist as reported by the source, for tracks not in the snapshot. */
  setNowPlaying(value: NowPlaying | null): void;
}

/**
 * A playable source. Each backend owns its own position in the queue, because
 * YouTube tracks that itself and we must not fight it.
 */
export interface PlaybackBackend {
  /** Loads `index`, and plays it when `autoplay` is set. */
  start(index: number, autoplay: boolean): void;
  play(): void;
  pause(): void;
  /** Resolves false when the browser refuses playback without a gesture. */
  tryAutoplay(): Promise<boolean>;
  next(autoplay: boolean): void;
  previous(autoplay: boolean): void;
  selectIndex(index: number, autoplay: boolean): void;
  seekTo(seconds: number): void;
  /** Current position in seconds, read straight from the source. */
  position(): number;
  /** Volume as 0–1. */
  setVolume(level: number): void;
  destroy(): void;
}
