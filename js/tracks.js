/*
  ALBUMS & TRACKS
  ---------------
  Three albums, tracked in one shared player. Each track's `album` field
  must match a key in ALBUMS exactly — that's how the player groups the
  list and labels each divider.

  `src` should point to a file in the /audio folder (or a full URL if
  you're hosting audio elsewhere, e.g. R2 or Cloudflare Stream).

  Some tracks point at short placeholder tones so the player works out of
  the box — swap in the real mp3s with the same filenames (or update
  `src`) before you launch. See audio/README.md.
*/
const ALBUMS = {
  "Discounted Lucky Stars": {
    year: "2002",
    cover: "images/album-cover-discounted-lucky-stars.png",
  },
  "Enter the Daydream": {
    year: "2004",
    cover: "images/album-cover-enter-the-daydream.png",
  },
  "Seventeen Minute Hole": {
    year: "2006",
    cover: "images/album-cover-seventeen-minute-hole.png",
  },
};

const TRACKS = [
  // ---- Seventeen Minute Hole, 2006 ----
  { title: "Sink or Swim", album: "Seventeen Minute Hole", src: "audio/track-19-sink-or-swim.mp3" },
  { title: "Test Run", album: "Seventeen Minute Hole", src: "audio/track-20-test-run.mp3" },
  { title: "Parting Breath", album: "Seventeen Minute Hole", src: "audio/track-17-parting-breath.mp3" },
  { title: "Any Time You Like", album: "Seventeen Minute Hole", src: "audio/track-01-any-time-you-like.mp3" },
  { title: "First Day", album: "Seventeen Minute Hole", src: "audio/track-05-first-day.mp3" },
  { title: "Human Being", album: "Seventeen Minute Hole", src: "audio/track-14-human-being.mp3" },
  { title: "Weary Wanderers", album: "Seventeen Minute Hole", src: "audio/track-18-weary-wanderers.mp3" },
  { title: "Here I am Home", album: "Seventeen Minute Hole", src: "audio/track-21-here-i-am-home.mp3" },

  // ---- Enter the Daydream, 2004 ----
  { title: "Spin", album: "Enter the Daydream", src: "audio/track-15-spin.mp3" },
  { title: "Under One Sun", album: "Enter the Daydream", src: "audio/track-09-under-one-sun.mp3" },
  { title: "Breaking Out", album: "Enter the Daydream", src: "audio/track-16-breaking-out.mp3" },
  { title: "Round & Round", album: "Enter the Daydream", src: "audio/track-13-round-and-round.mp3" },
  { title: "Giants & Gnomes", album: "Enter the Daydream", src: "audio/track-12-giants-and-gnomes.mp3" },
  { title: "We Are Change", album: "Enter the Daydream", src: "audio/track-04-we-are-change.mp3" },
  { title: "The Trees Believe", album: "Enter the Daydream", src: "audio/track-10-the-trees-believe.mp3" },

  // ---- Discounted Lucky Stars, 2002 ----
  { title: "Rise Again", album: "Discounted Lucky Stars", src: "audio/track-22-rise-again.mp3" },
  { title: "We Can Be Free", album: "Discounted Lucky Stars", src: "audio/track-02-we-can-be-free.mp3" },
  { title: "The Evening", album: "Discounted Lucky Stars", src: "audio/track-06-the-evening.mp3" },
  { title: "Black Hole", album: "Discounted Lucky Stars", src: "audio/track-08-black-hole.mp3" },
  { title: "All I Want", album: "Discounted Lucky Stars", src: "audio/track-07-all-i-want.mp3" },
  { title: "Light of the Lion", album: "Discounted Lucky Stars", src: "audio/track-03-light-of-the-lion.mp3" },
  { title: "Storm", album: "Discounted Lucky Stars", src: "audio/track-11-storm.mp3" },
];
