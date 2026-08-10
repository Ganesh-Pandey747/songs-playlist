import { Track } from '../playlists';
import { PlaybackBackend, PlaybackSink } from './playback-backend';
import { resolvePreview } from './preview-lookup';

/**
 * Plays the same queue as `YouTubeBackend`, but through an `<audio>` element
 * pointed at Apple's preview CDN instead of an embedded player — which is what
 * makes it ad-free. Clips run about 30 seconds.
 *
 * Each track is resolved on demand rather than up front: a fifty-track playlist
 * would otherwise fire fifty searches the moment the mode is switched on, and
 * the endpoint rate-limits. The next track is prefetched while the current one
 * plays, so stepping forward is usually instant.
 */
export class PreviewBackend implements PlaybackBackend {
  private readonly audio = new Audio();
  private index = 0;
  /** Bumped on every load so a slow lookup can't hijack a newer track. */
  private generation = 0;
  private consecutiveSkips = 0;
  private destroyed = false;

  constructor(
    private readonly tracks: readonly Track[],
    private readonly sink: PlaybackSink,
  ) {
    this.audio.preload = 'auto';

    const pushDuration = () => this.sink.setDuration(this.audio.duration || 0);
    this.audio.addEventListener('loadedmetadata', pushDuration);
    this.audio.addEventListener('durationchange', pushDuration);
    this.audio.addEventListener('timeupdate', () => this.sink.setTime(this.audio.currentTime));
    this.audio.addEventListener('play', () => {
      this.consecutiveSkips = 0;
      this.sink.setPlaying(true);
      this.sink.setError(null);
    });
    this.audio.addEventListener('pause', () => this.sink.setPlaying(false));
    this.audio.addEventListener('waiting', () => this.sink.setBuffering(true));
    this.audio.addEventListener('playing', () => this.sink.setBuffering(false));
    this.audio.addEventListener('canplay', () => this.sink.setBuffering(false));
    this.audio.addEventListener('ended', () => this.next(true));
    this.audio.addEventListener('error', () => {
      // A dead CDN link behaves like a missing match: move along.
      if (!this.audio.src) return;
      this.skip('Clip unavailable — skipping');
    });
  }

  start(index: number, autoplay: boolean): void {
    this.sink.setQueue(this.tracks);
    this.load(index, autoplay);
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
    if (!Number.isFinite(this.audio.duration)) return;
    this.audio.currentTime = Math.max(0, Math.min(this.audio.duration, seconds));
    this.sink.setTime(this.audio.currentTime);
  }

  position(): number {
    return this.audio.currentTime;
  }

  setVolume(level: number): void {
    this.audio.volume = level;
  }

  destroy(): void {
    this.destroyed = true;
    this.generation++;
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
  }

  private wrap(index: number): number {
    const count = this.tracks.length;
    return count ? ((index % count) + count) % count : 0;
  }

  /** Advances past a track with no playable clip, but never past a full lap. */
  private skip(message: string): void {
    if (this.consecutiveSkips >= this.tracks.length) {
      this.sink.setPlaying(false);
      this.sink.setBuffering(false);
      this.sink.setError('No ad-free clip found for this playlist');
      return;
    }
    this.consecutiveSkips++;
    this.sink.setError(message);
    this.next(true);
  }

  private load(index: number, autoplay: boolean): void {
    this.index = this.wrap(index);
    const generation = ++this.generation;

    this.audio.pause();
    this.sink.setIndex(this.index);
    this.sink.setNowPlaying(null);
    this.sink.setTime(0);
    this.sink.setDuration(0);
    this.sink.setError(null);

    const track = this.tracks[this.index];
    if (!track) return;

    this.sink.setBuffering(true);
    void resolvePreview(track.id, track.title).then((match) => {
      if (this.destroyed || generation !== this.generation) return;

      if (!match) {
        this.sink.setBuffering(false);
        this.skip('No ad-free clip — skipping');
        return;
      }

      this.audio.src = match.url;
      this.audio.load();
      // Apple names the performer; the snapshot only knows the upload channel.
      this.sink.setNowPlaying({ title: track.title, artist: match.artist });
      if (autoplay) this.play();
      else this.sink.setBuffering(false);

      this.prefetch(this.index + 1);
    });
  }

  /** Warms the cache for the following track so `next` doesn't wait on a search. */
  private prefetch(index: number): void {
    const track = this.tracks[this.wrap(index)];
    if (track) void resolvePreview(track.id, track.title);
  }
}
