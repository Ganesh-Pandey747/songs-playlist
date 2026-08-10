import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'music',
    title: 'सफ़र — Safar',
    loadComponent: () => import('./music/music-page').then((m) => m.MusicPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'music' },
  { path: '**', redirectTo: 'music' },
];
