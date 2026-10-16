# Ghost Aviator app (PWA) — Phase 1: plan + evidence log

*Created 17 Oct 2026 on branch `pwa-20261017` (worktree `D:\pk\_wt\pwa-20261017`),
based on `origin/main @ 110265d` (the Captain approved this base; note that
`origin/main` has since moved to `dcf1f1b` — answer-key grid removal — to be
reconciled at push time, not silently).*

**Status: Phase 1 built; icon set finalised (Gini — Captain's call, 17 Oct);
local evidence recorded (below). Install chip kept as designed; pushing the
branch for a Vercel preview now (Captain's approval, 17 Oct). Nothing in
production.**

## What Phase 1 adds (all new files + 2 small edits)

| File | What it is |
|---|---|
| `public/sw.js` | Service worker: offline pages (30-day limit), cache-first assets/images, auth surfaces never cached |
| `app/manifest.ts` | Web app manifest — name, icons, shortcuts, dark theme colour |
| `app/offline/page.tsx` | The offline card (noindex, precached) |
| `app/components/Pwa.tsx` | Registers the worker; quiet install + update + offline offers |
| `app/layout.tsx` | +2 lines: import + `<Pwa />` |
| `next.config.ts` | +7 lines: `/sw.js` served `no-cache` (never stale) |
| `tools/pwa/icon-lab.html` + `serve-lab.mjs` | Icon rendering from the site's own art (final: Gini composite; no invented art) |

No new npm dependencies. `package.json` untouched on purpose — the main
checkout has an in-flight edit by another agent.

## Captain's rulings (17 Oct 2026, this session)

- **Offline = time-limited (30 days)**, refreshed while online; no
  download/export affordances; protection layer included in every cached page.
- **PWA first**; a real APK / Play Store path can follow later on the same work.
- **Build directly here** — Google AI Studio is not used for this (signed out;
  no access to the real content anyway).
- **Evidence first** — no push until the Captain sees local evidence.
- **App icon = Gini** — the character's own artwork (17 Oct 2026), not a new
  mark; the first-pass ghost-mark icons are replaced.
- **Install chip kept as designed; push to preview approved** (17 Oct 2026).

## Phase ladder (order matters)

1. **Installable app + offline core** ← this branch.
2. Review mode + weak-area analytics on `/dashboard` (and repair the known
   exam-history sync defect from the Oct 8 audit).
3. Exam-mode CBT UI (palette, flag, timer, submit flow).
4. Push notifications — needs the Captain's call on topics (new chapters?
   weekly questions?) and VAPID key setup.
5. Polish audit for the extras that partly exist: dark theme, site search.

## Evidence log

*Builder's self-checks only. Per CONTRACT clause 4 this is **not** an
independent audit — the builder (this agent) cannot certify its own work.*

- [x] `npx tsc --noEmit` — exit 0 (17 Oct 2026).
- [x] Icons — first pass from the site's ghost mark; final set (Captain's call)
      composites Gini's own artwork (`public/gini/sprites/happy.webp`) on the
      brand dark; looked at, not assumed (512/192 + maskable; small sizes
      checked 36–96 px; sheet: `tools/pwa/_captures/gini-icon-sheet.png`).
- [x] `npm run build` — exit 0; repo audit + sitemap first (672 URLs,
      PROBLEMS: 0). Log: `tools/pwa/_captures/build-20261017.log`
- [x] `curl` local — `/` 200, `/sw.js` 200 (`Cache-Control: no-cache`),
      `/manifest.webmanifest` 200 (name/short_name/icons/shortcuts valid; all
      three shortcut URLs 200), `/offline` 200.
- [x] Browser test — worker registers/activates/controls; chapter cached
      (278,766 bytes). With the server killed: the chapter renders from cache
      (even with its stamp aged to 31 days → expired branch), while uncached
      and private URLs show the offline card. One defect found & fixed: with
      the server dead, an in-between link answered HTTP 502 and the raw
      "502 Bad Gateway" page reached the student; `sw.js` now treats 5xx as
      "no live copy". Full record: `tools/pwa/_captures/evidence-phase1-local.md`.
- [ ] Captain's checks passed — pushed preview URL:

## Open decisions for the Captain

- **App icon** — resolved 17 Oct: Gini (character artwork composited on the
  brand dark). `manifest.ts` + `public/icons/` updated; the lab can re-render
  any variant.
- **Install chip**: bottom-centre, appears after 15 s, dismissible for 60 days.
  Veto if it covers anything on a small phone.
- **Push topics** (Phase 4): decide before any push work starts.
