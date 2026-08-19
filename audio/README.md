# Audio files

The 5 mp3s in this folder are **placeholder tones**, not real songs — they're
short sine-wave clips so the player, scrubber, and downloads all work the
moment you open the site. Swap them out before you launch.

## To add your real tracks

1. Export your songs as `.mp3` (or `.m4a` / `.ogg` — any format `<audio>`
   supports in modern browsers; mp3 has the widest compatibility).
2. Keep file sizes reasonable for streaming — 128–192kbps mp3 is a good
   balance of quality and load time for lo-fi/indie recordings.
3. Drop the files into this `audio/` folder.
4. Open `js/tracks.js` and update the `src` for each track to match your
   filenames (and edit the `title`/`note` fields to match your real
   tracklist).

You don't need to touch any other file — the tracklist, player, and
download links are all generated from `js/tracks.js`.

## Hosting larger catalogues

Cloudflare Pages works fine for a handful of mp3s directly in the repo, but
if you're hosting a large back-catalogue (dozens of tracks, high-bitrate
files, live bootlegs, etc.), consider:

- **Cloudflare R2** — put the files in a public R2 bucket and point each
  track's `src` at the R2 public URL instead of a local path. Keeps your
  Pages deploy small and fast.
- **Cloudflare Stream** (if you ever add video) is a separate product and
  isn't needed here — R2 + this HTML5 player is enough for an audio site.

## A note on the "download all as .zip" link

The footer link in `index.html` (`#downloadAllLink`) is a placeholder — zipping
files client-side or pre-building a zip is a nice follow-up but isn't wired
up yet. Easiest options:
- Pre-build a `session-tapes.zip` locally and drop it in `audio/`, then
  point the link at it directly.
- Or remove the sentence in `index.html` if you'd rather keep individual
  downloads only.
