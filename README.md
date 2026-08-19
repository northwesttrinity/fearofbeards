# Fear of Beards — band site

A static, no-build website: streaming/downloadable audio player, photo
gallery, and bio, styled after a screen-printed show flyer. No frameworks,
no build step — just HTML, CSS, and vanilla JS, which makes it a very cheap
and simple fit for Cloudflare Pages.

```
site/
├── index.html
├── wrangler.toml       ← Cloudflare Worker config (KV bindings live here)
├── .assetsignore       ← keeps non-site files out of the static upload
├── src/index.js        ← Worker script: serves the site + the counter API
├── css/styles.css
├── js/
│   ├── tracks.js      ← edit this to change the tracklist
│   ├── player.js       (streaming player logic — shouldn't need edits)
│   └── main.js          (small page effects)
├── images/             (logos + band photos, already processed)
└── audio/
    ├── README.md       ← how to swap in real tracks
    └── *.mp3           (your tracks)
```

## Before you launch

1. **Edit the copy.** The bio, tour years, and stats in the "About" section
   of `index.html` are invented placeholder copy — swap in your real story.
2. **Swap the contact links.** `hello@fearofbeards.example`, Bandcamp, and
   MySpace links in the footer are placeholders.
3. **Photo captions.** The captions in the "Evidence" section are guesses
   based on the images — edit to match reality.

## Deploying to Cloudflare

This project is set up as a **Cloudflare Worker with static assets** —
Cloudflare's current recommended approach for a site like this, which
replaced the older, separate "Pages" product for new projects. A single
Worker script (`src/index.js`) serves your static files and handles two
small API routes for the counters described further down.

**Deploy via a connected GitHub repo (recommended):**
1. Push this folder to a GitHub repo.
2. Cloudflare dashboard → **Workers & Pages** → **Create**, connect the
   repo.
3. In the project's **Settings → Builds & deployments**, set the
   **Deploy command** to exactly `npx wrangler deploy` (leave the build
   command blank — there's no build step).
4. Every push to your main branch auto-deploys. For a single small file
   change, GitHub's own "Add file" / "Create new file" / "Upload files"
   buttons work fine too — you don't need git installed for every edit,
   just for the initial push.

No environment variables, no separate server, no database beyond the two
small KV namespaces described below — everything else is static files.

## Browser support

Uses the standard HTML5 `<audio>` element and native `<input type="range">`
sliders — works in all current browsers, no polyfills needed.

## Optional: visitor counter & track play counts

The footer's "VISITOR NO." counter and the "N plays" line under each track
in the tracklist are powered by a small Cloudflare Worker script
(`src/index.js`) backed by two Workers KV namespaces. Both are entirely
optional — if you skip this setup, they just stay hidden and the page
looks intentional either way.

**This project deploys as a Cloudflare Worker with static assets** (Cloudflare's
current recommended approach, which unifies static hosting and small bits
of server logic in one deployment — it's what replaced the older,
separate "Pages" product for new projects). Practically, that means:

- `wrangler.toml` defines the project (`main = "src/index.js"`, and an
  `[assets]` block pointing at the site's static files).
- `src/index.js` is a single script that does two things: serves the
  static site as-is for every normal request, and handles two small API
  routes (`/api/hit`, `/api/plays`) for the counters.
- `.assetsignore` keeps non-site files (this repo's own `.git`, `src`,
  `wrangler.toml`) from being uploaded as if they were part of the website.

**Setup (one-time, in the Cloudflare dashboard):**
1. **Storage & Databases → KV** → create two namespaces, e.g.
   `fear-of-beards-visitors` and `fear-of-beards-plays`. Copy each
   namespace's ID (a long hex string, not its name).
2. Paste those two IDs into `wrangler.toml` in this repo, under
   `kv_namespaces` — one block for `VISITOR_COUNT`, one for `TRACK_PLAYS`.
   (Already done in this copy of the project — only needed again if you
   create fresh namespaces of your own.)
3. In your Cloudflare project → **Settings → Builds & deployments**, the
   **Deploy command** must be exactly `npx wrangler deploy` (no "pages" in
   it — this project is a Worker, not a Pages project, even though it's
   Git-connected the same way).
4. Push to GitHub (or use the web "Add file" / "Create new file" buttons).
   Cloudflare redeploys automatically within a minute or two.

**How the visitor counter works:** the first time a browser hits the site,
the Worker sets a long-lived cookie and increments a total in KV. Return
visits from that browser just read the count. No IP addresses or personal
data are stored.

**How play counts work:** every time a track starts playing, the front end
posts the track's filename to `/api/plays`, which increments a count for
that file in a single KV blob and returns the updated totals. Reading all
18 counts (on page load) is one KV read; each play is one read + one
write. There's a very small chance of a lost increment if two people
start a track in the same instant (last write wins) — an acceptable
trade-off for a fan site, not something to rely on for exact numbers.

One note: the footer's "no tracking, no accounts" line was updated to
mention the one cookie the visitor counter sets, so the copy stays honest.
Feel free to reword either the counters or that line however you'd like.
