import { ChangeDetectionStrategy, Component, computed, input, linkedSignal } from '@angular/core';
import { PLAYLISTS, PlaylistId } from '../../playlists';

/** Playlists that share the night-street illustration rather than owning one. */
const NIGHT_SCENES = new Set<PlaylistId>(['emraan', 'awarapan', 'rohan']);

const wordmarkFor = (id: PlaylistId): string =>
  PLAYLISTS.find((playlist) => playlist.id === id)?.wordmark ?? '';

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

  /** True while any of the playlists sharing the night-street scene is active. */
  readonly isNightScene = computed(() => NIGHT_SCENES.has(this.scene()));

  /**
   * Which word the shared night-street scene paints.
   *
   * Every other scene has its word baked in, but this one is used by more than
   * one playlist, so it reads the name from the catalogue. It keeps the last
   * word it showed once the active playlist moves to a scene of its own: the
   * crossfade runs for 0.8s, and swapping the word on the way out would be
   * visible for all of it.
   */
  readonly nightWordmark = linkedSignal<PlaylistId, string>({
    source: this.scene,
    computation: (id, previous) =>
      NIGHT_SCENES.has(id) ? wordmarkFor(id) : (previous?.value ?? wordmarkFor('emraan')),
  });
}
