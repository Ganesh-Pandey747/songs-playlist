import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';

/** Top-left editorial clock, ticking on the viewer's local time. */
@Component({
  selector: 'app-live-clock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="digits">{{ parts().hours }}</span>
    <span class="colon" [class.blink]="parts().showColon">:</span>
    <span class="digits">{{ parts().minutes }}</span>
    <span class="period">{{ parts().period }}</span>
  `,
  styles: `
    :host {
      position: absolute;
      top: 28px;
      left: 32px;
      z-index: 20;
      display: inline-flex;
      align-items: baseline;
      gap: 3px;
      color: #fff;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
      pointer-events: none;
    }

    .digits,
    .colon {
      font-size: 1.5rem;
      font-weight: 600;
      line-height: 1;
      letter-spacing: 0.02em;
      font-variant-numeric: tabular-nums;
    }

    .colon {
      opacity: 0.55;
      transition: opacity 0.4s ease;
    }

    .colon.blink {
      opacity: 1;
    }

    .period {
      margin-left: 3px;
      font-size: 0.8rem;
      font-weight: 400;
      letter-spacing: 0.06em;
      color: rgba(255, 255, 255, 0.72);
    }

    @media (max-width: 767px) {
      :host {
        top: 18px;
        left: 20px;
      }

      .digits,
      .colon {
        font-size: 1.25rem;
      }
    }
  `,
})
export class LiveClock {
  private readonly now = signal(new Date());

  protected readonly parts = computed(() => {
    const date = this.now();
    const hours24 = date.getHours();
    const hours12 = hours24 % 12 || 12;
    return {
      hours: hours12.toString().padStart(2, '0'),
      minutes: date.getMinutes().toString().padStart(2, '0'),
      period: hours24 < 12 ? 'am' : 'pm',
      showColon: date.getSeconds() % 2 === 0,
    };
  });

  constructor() {
    const timer = setInterval(() => this.now.set(new Date()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}
