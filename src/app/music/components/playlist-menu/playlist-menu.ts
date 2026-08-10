import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { PlayerService } from '../../player.service';
import { PlaylistId } from '../../playlists';

/** Popover above the player: playlist switcher, queue, and volume. */
@Component({
  selector: 'app-playlist-menu',
  templateUrl: './playlist-menu.html',
  styleUrl: './playlist-menu.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaylistMenu {
  protected readonly player = inject(PlayerService);

  readonly open = input(false);
  readonly dismiss = output<void>();

  protected choosePlaylist(id: PlaylistId): void {
    this.player.selectPlaylist(id);
  }

  protected chooseTrack(index: number): void {
    this.player.selectTrack(index);
    this.dismiss.emit();
  }

  protected onVolumeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.player.setVolume(Number(input.value) / 100);
  }
}
