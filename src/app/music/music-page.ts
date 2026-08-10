import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HeroScene } from './components/hero-scene/hero-scene';
import { LiveClock } from './components/live-clock/live-clock';
import { PlayerBar } from './components/player-bar/player-bar';
import { PlayerService } from './player.service';

@Component({
  selector: 'app-music-page',
  imports: [HeroScene, LiveClock, PlayerBar],
  templateUrl: './music-page.html',
  styleUrl: './music-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onKeydown($event)',
  },
})
export class MusicPage {
  protected readonly player = inject(PlayerService);

  /** Shown when the browser refuses autoplay, which is the common case. */
  protected readonly showStartPrompt = signal(false);
  protected readonly sceneId = computed(() => this.player.activePlaylist().id);

  constructor() {
    void this.player.tryAutoplay().then((started) => this.showStartPrompt.set(!started));
  }

  protected start(): void {
    void this.player.play();
    this.showStartPrompt.set(false);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    // Sliders and text fields own their keys entirely.
    if (target?.closest('input, textarea, [role="slider"]')) return;
    // Space/Enter on a focused button already activates it — don't toggle twice.
    if (target?.closest('button') && (event.key === ' ' || event.key === 'Enter')) return;

    switch (event.key) {
      case ' ':
      case 'k':
        event.preventDefault();
        this.player.toggle();
        this.showStartPrompt.set(false);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.player.nudge(5);
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.player.nudge(-5);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.player.setVolume(this.player.volume() + 0.1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.player.setVolume(this.player.volume() - 0.1);
        break;
      case 'n':
        this.player.next(true);
        break;
      case 'p':
        this.player.previous();
        break;
      case 'm':
        this.player.toggleMute();
        break;
    }
  }
}
