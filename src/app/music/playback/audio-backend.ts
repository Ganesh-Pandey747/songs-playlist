import { AudioTrack } from '../playlists';
import { PlaybackBackend, PlaybackSink } from './playback-backend';

/**
 * Plays plain media files through a single `HTMLAudioElement`. Element events
 * are the source of truth — nothing here optimistically reports "playing".
 */
export class AudioBackend implements PlaybackBackend {
  private readonly audio = new Audio();
  private index = 0;

  constructor(
    private readonly tracks: readonly AudioTrack[],
    private readonly sink: PlaybackSink,
  ) {
    // No `crossOrigin` — the demo hosts send no CORS headers, and plain
    // playback doesn't need them (the equaliser is CSS, not Web Audio).
    this.audio.preload = 'metadata';

    const pushDuration = () => this.sink.setDuration(this.audio.duration || 0);
    this.audio.addEventListener('loadedmetadata', pushDuration);
    this.audio.addEventListener('durationchange', pushDuration);
    this.audio.addEventListener('timeupdate', () => this.sink.setTime(this.audio.currentTime));
    this.audio.addEventListener('play', () => {
      this.sink.setPlaying(true);
      this.sink.setError(null);
    });
    this.audio.addEventListener('pause', () => this.sink.setPlaying(false));
    this.audio.addEventListener('waiting', () => this.sink.setBuffering(true));
    this.audio.addEventListener('playing', () => this.sink.setBuffering(false));
    this.audio.addEventListener('canplay', () => this.sink.setBuffering(false));
    this.audio.addEventListener('ended', () => this.next(true));
    this.audio.addEventListener('error', () => {
      this.sink.setBuffering(false);
      this.sink.setPlaying(false);
      this.sink.setError('Track unavailable — check your connection');
    });
  }

  start(index: number, autoplay: boolean): void {
    this.index = index;
    this.sink.setQueue(this.tracks);
    this.load(autoplay);
  }

  play(): void {
    void this.audio
      .play()
      .catch(() => this.sink.setError('Playback blocked — press play to start'));
  }

  pause(): void {
    this.audio.pause();
  }

  async tryAutoplay(): Promise<boolean> {
    try {
      await this.audio.play();
      return true;
    } catch {
      return false;
    }
  }

  next(autoplay: boolean): void {
    this.index = (this.index + 1) % this.tracks.length;
    this.load(autoplay);
  }

  previous(autoplay: boolean): void {
    this.index = (this.index - 1 + this.tracks.length) % this.tracks.length;
    this.load(autoplay);
  }

  selectIndex(index: number, autoplay: boolean): void {
    if (index < 0 || index >= this.tracks.length) return;
    this.index = index;
    this.load(autoplay);
  }

  seekTo(seconds: number): void {
    this.audio.currentTime = seconds;
    this.sink.setTime(seconds);
  }

  position(): number {
    return this.audio.currentTime;
  }

  setVolume(level: number): void {
    this.audio.volume = level;
  }

  destroy(): void {
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
  }

  private load(autoplay: boolean): void {
    this.sink.setIndex(this.index);
    this.sink.setNowPlaying(null);
    this.sink.setTime(0);
    this.sink.setDuration(0);
    this.sink.setError(null);
    this.audio.src = this.tracks[this.index].src;
    this.audio.load();
    if (autoplay) this.play();
  }
}
