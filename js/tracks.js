/*
  ALBUMS & TRACKS
  ---------------
  Two albums, tracked in one shared player. Each track's `album` field must
  match a key in ALBUMS exactly — that's how the player groups the list and
  labels each divider.

  `src` should point to a file in the /audio folder (or a full URL if
  you're hosting audio elsewhere, e.g. R2 or Cloudflare Stream).

  The tracks currently point at short placeholder tones so the player
  works out of the box — swap in the real mp3s with the same filenames
  (or update `src`) before you launch. See audio/README.md.
*/
const ALBUMS = {
  "Seventeen Minute Hole": {
    year: "2005",
    cover: "images/album-cover-seventeen-minute-hole.png",
  },
  "Discounted Lucky Stars": {
    year: "2003",
    cover: "images/album-cover-discounted-lucky-stars.png",
  },
};

const TRACKS = [
  // ---- Seventeen Minute Hole, 2005 ----
  { title: "Breaking Out", album: "Seventeen Minute Hole", src: "audio/track-16-breaking-out.mp3" },
  { title: "First Day", album: "Seventeen Minute Hole", src: "audio/track-05-first-day.mp3" },
  { title: "Spin", album: "Seventeen Minute
