# Fear of Beards — band site

A static, no-build website: streaming/downloadable audio player, photo
gallery, and bio, styled after a screen-printed show flyer. No frameworks,
no build step — just HTML, CSS, and vanilla JS, which makes it a very cheap
and simple fit for Cloudflare Pages.

```
site/
├── index.html
├── css/styles.css
├── js/
│   ├── tracks.js      ← edit this to change the tracklist
│   ├── player.js       (streaming player logic — shouldn't need edits)
│   └── main.js          (small page effects)
├── images/             (logos + band photos, already processed)
└── audio/
    ├── README.md       ← how to swap in real tracks
    └── *.mp3           (placeholder tones — replace before launch)
```

## Before you launch

1. **Replace the placeholder audio.** See `audio/README.md`. The current
   mp3s are short tones so the player is demoable, not real songs.
2. **Edit the copy.** The bio, tour years, and stats in the "About" section
   of `index.html` are invented placeholder copy — swap in your real story.
3. **Swap the contact links.** `hello@fearofbeards.example`, Bandcamp, and
   MySpace links in the footer are placeholders.
4. **Photo captions.** The captions in the "Evidence" section are guesses
   based on the images — edit to match reality.

## Deploying to Cloudflare Pages

**Option A — drag and drop (fastest, no git needed)**
1. Go to the Cloudflare dashboard → **Workers & Pages** → **Create** →
   **Pages** → **Upload assets**.
2. Drag this whole `site` folder in (or a zip of its contents).
3. Cloudflare gives you a `*.pages.dev` URL immediately. Add a custom
   domain afterward under the project's **Custom domains** tab if you own
   one.

**Option B — connect a git repo (best if you'll keep editing)**
1. Push this folder to a GitHub/GitLab repo.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** →
   **Connect to Git**, pick the repo.
3. Build settings: no build command needed, no framework preset — just set
   the **build output directory** to the repo root (or wherever
   `index.html` lives).
4. Every push to your main branch auto-deploys.

No environment variables, no server, no database — it's a fully static
site, so either option is a straightforward few-minute deploy.

## Browser support

Uses the standard HTML5 `<audio>` element and native `<input type="range">`
sliders — works in all current browsers, no polyfills needed.

