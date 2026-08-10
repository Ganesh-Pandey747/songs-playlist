# सफ़र — Safar

A one-page immersive music experience built with **Angular 22**, inspired by
[safaraudio.netlify.app](https://safaraudio.netlify.app/): a full-bleed editorial illustration, a
live clock, and a floating translucent player.

**Live: https://ganesh-pandey747.github.io/songs-playlist/**

## Run it

The Angular 22 CLI needs Node **≥ 22.22.3** (or 24.x / 26.x). A `.nvmrc` pins 24.

```bash
nvm use            # the repo's Node version
npm install
npm start          # http://localhost:4200
npm run build      # production bundle in dist/safar
```

## Deploying

Every push to `main` publishes to GitHub Pages via
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). This needs **Settings → Pages →
Build and deployment → Source: "GitHub Actions"** set once on the repo; the workflow's default
token isn't allowed to turn Pages on by itself.

The site lives at a repo subpath,
so the workflow builds with `--base-href /songs-playlist/` and copies `index.html` to `404.html` —
Pages has no rewrite rules, so without that fallback a refresh on `/music` would 404 instead of
reaching the Angular router.

## Playlists

| Section       | YouTube playlist                                | Tracks |
| ------------- | ----------------------------------------------- | ------ |
| **Safar**     | "Banger songs play in bus"                      | 50     |
| **Bus Drive** | "Bus Driver ki Playlist"                        | 54     |
| **Saloon**    | "banger songs that play at indian barber shops" | 62     |

Each section has its own illustrated scene, and they crossfade when you switch. Switching keeps
volume and resumes playing if music was already going.

> The three playlists overlap: Bus Drive is Safar's 50 songs (reordered) plus 4 extras, and Saloon
> shares a good number with both.

## What's in the page

- **Three illustrated scenes** — a city bus at a roadside stop, a night highway drive, and a
  neighbourhood barbershop, drawn as inline SVG. All stay mounted and crossfade, so switching never
  flashes an empty background.
- **Real playback** — play/pause, previous/next, drag or click to seek, per-track queue, volume.
- **Live clock** on the viewer's local time, with a blinking colon.
- **Playlist popover** with the section switcher, the queue, and a volume slider.
- **Autoplay fallback** — browsers block unmuted autoplay, so a "Tap to start the journey" prompt
  appears when the attempt is refused.
- **OS media keys** through the Media Session API, so the lock screen shows the current track.
- **Keyboard shortcuts** — `space`/`k` play-pause, `←`/`→` seek ±5s, `↑`/`↓` volume, `n` next,
  `p` previous, `m` mute.

## How playback works

`PlayerService` holds all playback state as signals and forwards commands to one of two backends,
chosen by the active playlist's `source.kind`:

- **`youtube`** → [`YouTubeBackend`](src/app/music/playback/youtube-backend.ts) streams a real
  playlist through the YouTube IFrame Player API. The playlist is the source of truth for order and
  contents, so editing it on YouTube changes the app. YouTube reports no `timeupdate`, so the
  position is polled every 250 ms; videos whose owner disallows embedding are skipped
  automatically. The iframe is a real 320×180 player parked off-screen — the illustration is the
  interface.
- **`audio`** → [`AudioBackend`](src/app/music/playback/audio-backend.ts) plays media files through
  a single `HTMLAudioElement`. No section uses it at the moment; it stays as the path for music you
  host yourself.

Both report state through the same `PlaybackSink`, so there is exactly one writer per value.
Playback state is exposed to components read-only, and nothing optimistically flips `isPlaying` —
it changes only when the source says so, so the UI can't disagree with what you hear.

## Changing the music

**A YouTube playlist**: edit the `playlistId` in [`playlists.ts`](src/app/music/playlists.ts). The
`SNAPSHOT` arrays next to it are only there to show readable names in the queue before anything
plays; a video that isn't in the snapshot still plays and takes its name from the player. To
refresh a snapshot, copy `[videoId, title, channel]` rows from the playlist page.

**Your own files**: drop them into `public/audio/`, then give the section an `audio` source instead:

```ts
source: {
  kind: 'audio',
  tracks: [{ id: 'mine-1', title: 'My Track', artist: 'Me', src: 'audio/my-track.mp3' }],
},
```

Raw YouTube titles carry a lot of upload furniture ("… Full Video Song | Movie | Singers"), so
[`clean-title.ts`](src/app/music/clean-title.ts) trims them for display. It runs on both the
snapshots and live player data, so there is one implementation and no drift.

## Structure

```
src/app/
  app.routes.ts                       '' → /music (lazy-loaded)
  music/
    music-page.{ts,html,scss}         hero shell, badge, autoplay prompt, shortcuts
    player.service.ts                 playback state as signals, backend dispatch
    playlists.ts                      playlist data + YouTube snapshots
    clean-title.ts                    tidies YouTube titles for display
    playback/
      playback-backend.ts             PlaybackBackend + PlaybackSink contracts
      youtube-backend.ts              YouTube IFrame Player API
      audio-backend.ts                HTMLAudioElement
    components/
      hero-scene/                     the three SVG scenes + crossfade
      live-clock/                     top-left clock
      player-bar/                     glass player, controls, drag-to-seek
      playlist-menu/                  section switcher, queue, volume
```

## Note on the hidden player

The YouTube iframe is kept off-screen so the illustration can fill the page, which is how the
reference site does it too. YouTube's terms expect an embedded player to be visible, so if you
plan to publish this, either surface the iframe or switch those sections to `audio` sources you
have the rights to.
