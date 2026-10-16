# Phase 1 local evidence — 17 Oct 2026

Builder's self-checks. Per CONTRACT clause 4 this is **not** an independent audit.
Worktree: `D:\pk\_wt\pwa-20261017`, branch `pwa-20261017` (base `origin/main @ 110265d`).
Server: production build via `npx next start -p 3100` on `http://127.0.0.1:3100`.

## A. Static checks

- `node --check public/sw.js` — exit 0.
- `npx tsc --noEmit` — exit 0 (earlier this session).
- `npm run build` — exit 0; runs the repo audit + sitemap first (672 URLs, PROBLEMS: 0).
  Log: `build-20261017.log` (this folder).

## B. Endpoints (server up)

| Request | Status | Notes |
|---|---|---|
| GET `/` | 200 | HTML contains `<link rel="manifest" href="/manifest.webmanifest"/>` |
| GET `/sw.js` | 200 | `Cache-Control: no-cache`; contains the 5xx fallback |
| GET `/manifest.webmanifest` | 200 | name "Ghost Aviator - DGCA CPL & ATPL Prep", short_name "Ghost Aviator", display `standalone`, theme `#0a0f14`, 4 icons, 3 shortcuts |
| GET `/offline` | 200 | |
| Shortcut targets `/notes`, `/question-bank`, `/mock-test` | 200 each | manifest shortcuts are live |

## C. Browser run (fresh profile state: all workers unregistered, all caches cleared)

1. After reload, the worker registers (`scope http://127.0.0.1:3100/`), reaches
   `activated`, and controls the page. Precache `ga-shell-v1` contains `/offline`.
2. Visit `/cpl/meteorology/met-1/notes` while online → cached in `ga-pages-v1`
   (stored response is HTTP 200, 278,766 bytes of HTML, real chapter content,
   carries the internal freshness stamp `x-ga-cached-at`).
   Cache keys after the visit: `/guides`, `/cpl/meteorology/met-1/notes`.
3. Offline matrix — local server process killed (confirmed: connection refused via
   curl), same browser, same origin:

| URL | Cache state | Result |
|---|---|---|
| `/cpl/meteorology/met-1/notes` | saved, stamp artificially aged to 31 days (expired) | Full render from cache: h1 "Atmosphere", 43,524 chars of visible text, no load error |
| `/resources` | never visited | Offline card: title "Offline — Ghost Aviator", h1 "No connection right now" |
| `/dashboard` | private path, never cached | Offline card: same |

- `navigator.onLine` stayed `true` throughout (a dead local server does not set the
  browser's offline flag), so the "Offline" pill correctly did not appear — expected
  here; a real phone in airplane mode fires the `offline` event the pill listens for.
- In this environment, when the server is down an in-between link answers HTTP 502:
  `fetch` **resolves** with a 502 response instead of throwing. The first run showed
  "502 Bad Gateway" reaching the student on an uncached URL. `sw.js` was corrected to
  treat 5xx navigations as "no live copy": saved copy if one exists, else the offline
  card. Rows 2–3 above are the post-fix behaviour; row 1 additionally exercises the
  expired-copy branch (5xx → serve the saved copy).

## D. Not covered at runtime (stated honestly)

- The 30-day *refresh-on-schedule* path with a healthy server (time cannot be
  advanced here). The expired-copy branch itself was exercised by backdating the
  stamp in the cache; refresh timing is code-reviewed, not time-tested.
- `browser.screenshot` is unavailable in this environment ("Screenshot needs a
  visible tab"); evidence above is serialized DOM/cache state, not images.
- iOS Safari behaviour (Share → Add to Home Screen) is untested; Android/Chromium
  is the target for Phase 1.

## E. Defects found and fixed during testing

- `public/sw.js` header comment contained `*/` inside a block comment, producing a
  syntax error the moment the file was first served (worker failed to install).
  Comment reworded; `node --check` clean since.
- 5xx navigation responses now fall back to the saved copy / offline card instead of
  passing "502 Bad Gateway" through to the student (see C.3).

## F. Icon set (Captain's call, 17 Oct 2026)

- The final icons composite Gini's own artwork (`public/gini/sprites/happy.webp`,
  untouched) on the brand dark (#0a0f14), rendered by `tools/pwa/icon-lab.html`
  served through `serve-lab.mjs` (same-origin `/gini/` route; canvas untainted).
- Any-purpose: 106% width, centred, rounded corners (radius 116 at 512).
  Maskable: 72% width inside the safe zone, artwork's bottom edge faded into the
  plate so no hard cut shows.
- Outputs verified as real PNGs of the right size: `icon-192` 192×192,
  `icon-512` 512×512, `maskable-192` 192×192, `maskable-512` 512×512.
  Review sheet (both variants + 36–96 px legibility strip):
  `tools/pwa/_captures/gini-icon-sheet.png`.
