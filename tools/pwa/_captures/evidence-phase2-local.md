# Phase 2 local evidence — 17 Oct 2026

Builder's self-checks. Per CONTRACT clause 4 this is **not** an independent audit.
Worktree: `D:\pk\_wt\pwa-20261017`, branch `pwa-20261017` @ `6094d23`
(= `origin/pwa-20261017`; `origin/main @ f39a61a` is contained in it at test time).
Server: production build via `npx next start -p 3100` on `http://127.0.0.1:3100`.

## A. Static checks

- `node --test lib/exam-review.test.mjs` — 10/10 pass.
- `npm test` — 533/533 pass (whole `lib/**/*.test.mjs` suite).
- `npx tsc --noEmit` — exit 0 (including the new `tools/pwa/review-selftest.mts`).
- `npx eslint app lib --ext .ts,.tsx` — exit 0.
- `npx tsx tools/pwa/review-selftest.mts` — exit 0, `PROBLEMS: 0`. Log:
  `selftest-phase2.log` (this folder). Against the **real bank**:
  4326 live questions all carry unique, non-empty stem keys; every Exam paper
  pool (7 papers, including the 899-question air-regulations and the
  2321-question composite-met-nav) resolves 100% through the trace matcher and
  scores identical to the recorded result; a vanished question degrades only
  itself; the Air Regs bank-id inversion round-trips all 26 CPL + 8 ATPL site
  chapters; every CPL/ATPL chapter resolves to a notes route + label; the trace
  survives the JSON round-trip unchanged.
- `npm run build` — exit 0 (repo audit + sitemap first, `PROBLEMS: 0`,
  1,657 static pages). `/dashboard/review/[attemptId]` is correctly classified
  `ƒ` (server-rendered on demand — it reads device-local data, so it must not be
  prerendered). Log: `build-phase2.log` (this folder).

## B. Browser run — one real sitting end to end

Sat the **air-regulations** paper (50 Q, 120 min) on the production build:
answered Q1–Q10 (option A each time), flagged Q2 + Q5, left the other 40 blank,
jumped to Q50 via the palette, submitted.

- Recorded attempt `4c682d79-2274-433b-90c0-70c8925951ab`: **3/50 correct (6%),
  FAIL, track cpl**. Result screen offers `review this sitting` →
  `/dashboard/review/4c682d79-2274-433b-90c0-70c8925951ab`.
- Trace in `ga-exam-history-v1` (read raw from localStorage):
  50 entries in sitting order; 10 × `a:0`; 40 × `a:null` (no `f` key on
  untouched entries); `f:true` on exactly Q2 and Q5; `k` values are normalised
  stems. Sizes: whole attempt 4,437 bytes, trace 3,807 bytes
  (≈76 B/question → ≈8 KB for a 90-question paper).

## C. Review page (the sitting above)

- Title "Review a sitting", h1 "Air Regulations", recorded standing shown:
  6% / 3/50 / FAIL.
- Filter pills: **All (50) / Wrong (7) / Unanswered (40) / Flagged (2)** —
  consistent with 10 answered, 3 right (10−3 = 7 wrong, 40 blank).
- 50 question cards; option highlighting counted in the DOM: exactly **50 green
  option rows** (one correct per card) and **7 red** (the misses); 40 "left
  blank" tags; 2 "flagged" tags.
- Filter behaviour (headless counts after clicks): Wrong → 7 cards,
  Flagged → 2, Unanswered → 40, All → 50.
- Chapter links: 64 resolved anchors, including the bank-id translations
  (e.g. stored `ar-9` → joined label "Ch.9 Aeronautical Information Services /
  Ch.11 Visual Aids for Navigation"; `ar-7` → "Ch.7 … / Ch.12 …";
  `ar-26`/`ar-13`/`ar-3`/`ar-1` singles). Click-through tested:
  "Air Regs · Ch.18 Communications →" landed on `/cpl/air-regulations/ar-18/notes`
  (h1 "Communications").
- No drift note and no missing note on the recorded sitting's own data (today's
  keys agree with the sitting) — correct.
- Note: the review route shows its pending shell briefly on first load while the
  question-bank client chunk parses (same chunk Exam Mode itself uses). Cards
  appeared within a few seconds in this environment; not stopwatch-timed.

## D. Dashboard

- Recent Attempts row: main link and a "Review" pill → the review URL;
  the retake icon links to `/exam/air-regulations` (aria/title
  "Retake Air Regulations").
- Weakest Chapters: all 6 rows are links carrying the "revise →" cue, resolved
  through the same chapter-link module — including joined labels for bank ids
  (`ar-9`, `ar-7`) and the own-bank case (`ar-25`→Ch.26). The aggregation and
  CPL-terms labels are pre-existing behaviour, unchanged.

## E. Deliberate-failure tests (storage backed up first, restored byte-for-byte after)

| # | Case | Setup | Result |
|---|---|---|---|
| 1 | Sitting from before Phase 2 (no trace) | injected synthetic rtr-part1 attempt, 62% | Dashboard row links to `/exam/rtr-part1` — **no Review pill**. Its review URL: h1 "No saved answer review for this sitting", recorded line "RTR(A) Part 1 · 16 Oct 2026 · 62% (31/50)", retake link offered. |
| 2 | Question gone from the bank | replaced one blank entry's `k` with a garbage key (Q41) | Header note: "1 question from this sitting is no longer in the question bank and can't be shown." Pills: All (50) / Wrong (7) / **Unanswered (39)** / Flagged (2). Q41 renders: "This question is no longer in the question bank, so it can't be reviewed here. Your sitting's score already counted it." Placeholder appears only under All (Unanswered view: 39 cards, 0 placeholders). |
| 3 | Answer keys revised since the sitting | flipped Q5's chosen answer from its correct option (A) to a wrong one (B) | Note: "The answer keys have been revised since this sitting — today's verified keys give 2/50. The review below shows the current answers." Wrong 7→8; recorded standing still shows 6% / FAIL; the card highlights A green (today's key) vs B red (the recorded choice). |
| 4 | Unknown attempt id | `/dashboard/review/00000000-0000-4000-8000-000000000000` | h1 "This sitting isn't on this device" + link back to the dashboard. |

Restore: the original history JSON was written back from the backup and the
backup key removed; final page state All (50) / Wrong (7) / Unanswered (40) /
Flagged (2) with no notes; storage holds the single original attempt again.

## F. Service-worker privacy

`caches.keys()` = `ga-shell-v1`, `ga-pages-v1`, `ga-assets-v1`, `ga-images-v1`;
**zero** cached requests containing `/dashboard` — the existing
`PRIVATE_PATHS` rule (`/^\/dashboard(\/|$)/`) covers the new review route
without changes.

## G. Stated honestly — not covered here

- `browser.screenshot` is still unavailable in this environment ("Screenshot
  needs a visible tab"); the evidence above is serialized DOM / storage / cache
  state, not images.
- No ATPL sitting was sat; ATPL-track review links are covered by the
  bank-coupled self-check (8 ATPL Air Regs site chapters round-trip), not by a
  live ATPL attempt.
- During setup an old zombie `next start` (started 01:35, serving a mixed stale
  build — its `/dashboard/review/*` probe returned 404) was found on port 3100;
  it was killed and every test above ran against a fresh server started from the
  verified build (`/dashboard/review/*` probe 200). No result above came from
  the stale server.
- Review data is device-local by design; a second origin/device will answer
  "This sitting isn't on this device" (see E.4).
