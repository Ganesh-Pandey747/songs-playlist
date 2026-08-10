import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PlayerService } from '../../player.service';
import { PlaylistMenu } from '../playlist-menu/playlist-menu';

/** Floating translucent player docked to the bottom of the hero. */
@Component({
  selector: 'app-player-bar',
  imports: [PlaylistMenu],
  templateUrl: './player-bar.html',
  styleUrl: './player-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerBar {
  protected readonly player = inject(PlayerService);

  protected readonly menuOpen = signal(false);
  /** Non-null while the user drags the progress thumb. */
  private readonly scrubPercent = signal<number | null>(null);

  /** Progress the bar should paint: the drag position wins over playback time. */
  protected readonly shownPercent = computed(() => this.scrubPercent() ?? this.player.progress());

  protected readonly shownPercentRounded = computed(() => Math.round(this.shownPercent()));

  protected readonly shownTimeLabel = computed(() => {
    const scrub = this.scrubPercent();
    if (scrub === null) return this.player.currentTimeLabel();
    const seconds = (scrub / 100) * this.player.duration();
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  });

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected onScrubStart(event: PointerEvent): void {
    const track = event.currentTarget as HTMLElement;
    track.setPointerCapture(event.pointerId);
    this.scrubPercent.set(this.percentFromEvent(event, track));
  }

  protected onScrubMove(event: PointerEvent): void {
    if (this.scrubPercent() === null) return;
    this.scrubPercent.set(this.percentFromEvent(event, event.currentTarget as HTMLElement));
  }

  protected onScrubEnd(event: PointerEvent): void {
    const percent = this.scrubPercent();
    if (percent === null) return;
    this.scrubPercent.set(null);
    this.player.seekToRatio(percent / 100);
    (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
  }

  /** Arrow keys scrub; handled here so the page-level shortcuts don't double-fire. */
  protected onScrubKeydown(event: KeyboardEvent): void {
    const step = event.key === 'ArrowLeft' ? -5 : event.key === 'ArrowRight' ? 5 : 0;
    if (step === 0) return;
    event.preventDefault();
    event.stopPropagation();
    this.player.nudge(step);
  }

  private percentFromEvent(event: PointerEvent, track: HTMLElement): number {
    const rect = track.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
  }
}
