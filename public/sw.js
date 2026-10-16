/* Ghost Aviator — service worker (PWA Phase 1), created 17 Oct 2026.
 *
 * What this is: the app-shell + offline-notes layer for ghostaviator.com, so a
 * student on a cheap phone with patchy data can install the site as an app and
 * open chapters they have already read, offline.
 *
 * The rules it lives by (Captain's rulings, 17 Oct 2026):
 *   • TIME-LIMITED (30 days): a cached chapter page is quietly re-fetched while
 *     online; nothing here is a permanent copy of the Captain's teaching.
 *   • NO BULK DOWNLOAD: only pages the student actually opened get cached.
 *     There is no "download all" and no raw-file caching. The raw chapter
 *     HTML documents (the notes.html files under /content/) 308-redirect on
 *     the site anyway; this worker never fetches them.
 *   • PROTECTION STAYS ON: what is cached is exactly the rendered page the
 *     browser received (watermark + protection layer included), never an
 *     unmarked source document.
 *   • AUTH STAYS OUT: /dashboard, /login, /signup, /api, /embed, /widget are
 *     never cached, and any response carrying Set-Cookie is never cached.
 *   • A DEAD END IS NEVER SHOWN RAW: network down, or an in-between link
 *     answering 5xx, becomes the offline card (or the saved copy) — never a
 *     bare "502 Bad Gateway" to a student.
 *   • ONE JOB: it caches. It never rewrites, injects or invents content.
 *
 * Versioning: bump VERSION for any behaviour change. Old caches are deleted on
 * activate. A new version waits until the student taps "Refresh" (see
 * app/components/Pwa.tsx) so a lesson page never reloads mid-read.
 */

const VERSION = "v1";
const K = {
  shell: "ga-shell-" + VERSION,
  pages: "ga-pages-" + VERSION,
  assets: "ga-assets-" + VERSION,
  images: "ga-images-" + VERSION,
};

const APP_DOC_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const IMAGE_CACHE_MAX_ENTRIES = 400;
const OFFLINE_URL = "/offline";
const STAMP_HEADER = "x-ga-cached-at";

// Precached at install: the offline page and the app icons. Deliberately tiny —
// install must not download content nobody asked for.
const PRECACHE_SHELL = [OFFLINE_URL, "/icons/icon-192.png", "/icons/icon-512.png"];

// Never cached: account surfaces and per-user routes (student privacy), and the
// embed/widget endpoints (served to third-party sites under their own headers).
const PRIVATE_PATHS = [
  /^\/dashboard(\/|$)/,
  /^\/login(\/|$)/,
  /^\/signup(\/|$)/,
  /^\/api\//,
  /^\/embed\//,
  /^\/widget(\/|$)/,
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(K.shell).then((cache) => cache.addAll(PRECACHE_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set(Object.values(K));
      for (const name of await caches.keys()) {
        // Only ever touch caches this worker created ("ga-" prefix). Anything
        // else on the origin is someone else's storage and is left alone.
        if (name.startsWith("ga-") && !keep.has(name)) await caches.delete(name);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(event));
    return;
  }

  // Build output is content-hashed and immutable; icons rarely change. Fonts,
  // styles and scripts from our own origin follow the same rule.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script"
  ) {
    event.respondWith(cacheFirst(request, K.assets));
    return;
  }

  // Chapter diagrams and other images: cache on first view, bounded in size.
  if (request.destination === "image") {
    event.respondWith(cacheFirstImage(request));
    return;
  }
});

function isPrivate(pathname) {
  return PRIVATE_PATHS.some((re) => re.test(pathname));
}

async function handleNavigation(event) {
  const request = event.request;
  const url = new URL(request.url);

  if (isPrivate(url.pathname)) {
    // Live network, and if that fails, the offline card. Nothing about an
    // account surface is ever stored on the device.
    try {
      const response = await fetch(request);
      if (response.status >= 500) return offlinePage();
      return response;
    } catch {
      return offlinePage();
    }
  }

  const cache = await caches.open(K.pages);
  const cached = await cache.match(request);

  if (cached) {
    const cachedAt = Number(cached.headers.get(STAMP_HEADER) || 0);
    const age = Date.now() - cachedAt;

    if (age < APP_DOC_MAX_AGE_MS) {
      // Serve the saved copy instantly, refresh it in the background while
      // online so the next visit carries any corrected answer quickly.
      event.waitUntil(refreshDocument(request).catch(() => {}));
      return stripStamp(cached);
    }

    // Older than 30 days: try to replace it. If the network is down, an old
    // copy still beats a dead end for a student mid-revision.
    try {
      const fresh = await refreshDocument(request);
      if (fresh.status >= 500) return stripStamp(cached);
      return fresh;
    } catch {
      return stripStamp(cached);
    }
  }

  // Not cached yet: go to the network and save a copy of what came back.
  try {
    const response = await refreshDocument(request);
    // Seen live (17 Oct): with the server stopped, an in-between link
    // answered 502 instead of failing — fetch saw a normal response. A 5xx
    // means "no live copy", so the student gets the offline card.
    if (response.status >= 500) return offlinePage();
    return response;
  } catch {
    return offlinePage();
  }
}

// Fetch a navigation and cache the result when it is worth caching. Returns the
// live Response to the page; the cache receives a stamped copy.
async function refreshDocument(request) {
  const response = await fetch(request);

  const setCookie = response.headers.get("set-cookie");
  const cacheControl = response.headers.get("cache-control") || "";
  if (response.ok && !setCookie && !/no-store/i.test(cacheControl)) {
    const body = await response.clone().blob();
    const headers = new Headers();
    for (const [key, value] of response.headers) {
      const lower = key.toLowerCase();
      if (lower === "set-cookie" || lower === STAMP_HEADER) continue;
      headers.set(key, value);
    }
    headers.set(STAMP_HEADER, String(Date.now()));
    const cache = await caches.open(K.pages);
    await cache.put(request, new Response(body, { status: response.status, statusText: response.statusText, headers }));
  }

  return response;
}

// A cached response carries the bookkeeping stamp header; the page should never
// see it, so it is stripped on the way out.
async function stripStamp(response) {
  const headers = new Headers(response.headers);
  headers.delete(STAMP_HEADER);
  return new Response(await response.blob(), {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    await cache.put(request, response.clone());
  }
  return response;
}

async function cacheFirstImage(request) {
  const cache = await caches.open(K.images);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    await cache.put(request, response.clone());
    // Simple bound: oldest entries (insertion order) go first. Without this a
    // student who reads a whole subject would accumulate every diagram ever
    // viewed, forever.
    const keys = await cache.keys();
    if (keys.length > IMAGE_CACHE_MAX_ENTRIES) {
      for (const key of keys.slice(0, keys.length - IMAGE_CACHE_MAX_ENTRIES)) {
        await cache.delete(key);
      }
    }
  }
  return response;
}

async function offlinePage() {
  const cached = await caches.match(OFFLINE_URL);
  if (cached) return cached;
  // Should not normally happen (the offline page is precached at install), but
  // a fallback beats a browser error page.
  return new Response(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Offline - Ghost Aviator</title></head><body style="background:#0a0f14;color:#e2e8f0;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="text-align:center;padding:24px"><h1 style="font-size:20px">No connection right now</h1><p style="color:#94a3b8">Reconnect and refresh to continue studying.</p></div></body></html>',
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
