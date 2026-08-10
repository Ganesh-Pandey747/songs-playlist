import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PlaylistId } from '../../playlists';

/**
 * Full-bleed editorial illustration behind the player. Both scenes stay mounted
 * and crossfade, so switching playlists never flashes an empty background.
 */
@Component({
  selector: 'app-hero-scene',
  templateUrl: './hero-scene.html',
  styleUrl: './hero-scene.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroScene {
  readonly scene = input.required<PlaylistId>();
  /** Adds a slow drift to the artwork while audio is playing. */
  readonly animate = input(false);
}
