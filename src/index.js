// Cloudflare Worker (with static assets) — src/index.js
//
// This one script does two jobs:
//   1. Serves the static site (index.html, css, js, images, audio) via the
//      built-in ASSETS binding that "Workers with static assets" provides
//      automatically — no extra config needed beyond [assets] in wrangler.toml.
//   2. Handles two small API routes for the visitor counter and per-track
//      play counts, backed by two KV namespaces (VISITOR_COUNT, TRACK_PLAYS).

const TRACK_ID_RE = /^[a-z0-9-]+\.mp3$/;

async function handleHit(request, env) {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });

  if (!env.VISITOR_COUNT) {
    return new Response(JSON.stringify({ error: "not_configured" }), { status: 200, headers });
  }

  const cookie = request.headers.get("Cookie") || "";
  const alreadyCounted = /(?:^|;\s*)foab_seen=1(?:;|$)/.test(cookie);

  let count = parseInt((await env.VISITOR_COUNT.get("total")) || "0", 10);
  if (Number.isNaN(count)) count = 0;

  if (!alreadyCounted) {
    count += 1;
    await env.VISITOR_COUNT.put("total", String(count));
    headers.append("Set-Cookie", "foab_seen=1; Max-Age=31536000; Path=/; SameSite=Lax");
  }

  return new Response(JSON.stringify({ count }), { headers });
}

async function readPlayCounts(env) {
  const raw = await env.TRACK_PLAYS.get("counts");
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

async function handlePlaysGet(env) {
  const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store" });
  if (!env.TRACK_PLAYS) {
    return new Response(JSON.stringify({ error: "not_configured" }), { status: 200, headers });
  }
  const counts = await readPlayCounts(env);
  return new Response(JSON.stringify({ counts }), { headers });
}

async function handlePlaysPost(request, env) {
  const headers = new Headers({ "Content-Type": "application/json", "Cache-Control": "no-store" });
  if (!env.TRACK_PLAYS) {
    return new Response(JSON.stringify({ error: "not_configured" }), { status: 200, headers });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "bad_request" }), { status: 400, headers });
  }

  const track = body && body.track;
  if (typeof track !== "string" || !TRACK_ID_RE.test(track)) {
    return new Response(JSON.stringify({ error: "invalid_track" }), { status: 400, headers });
  }

  const counts = await readPlayCounts(env);
  counts[track] = (counts[track] || 0) + 1;
  await env.TRACK_PLAYS.put("counts", JSON.stringify(counts));

  return new Response(JSON.stringify({ counts }), { headers });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/hit" && request.method === "GET") {
      return handleHit(request, env);
    }
    if (url.pathname === "/api/plays" && request.method === "GET") {
      return handlePlaysGet(env);
    }
    if (url.pathname === "/api/plays" && request.method === "POST") {
      return handlePlaysPost(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
