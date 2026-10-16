# App Phase 2 — Review mode + weak-area analytics (plan + evidence log)

*Created 17 Oct 2026 on branch `pwa-20261017` (worktree `D:\pk\_wt\pwa-20261017`),
continuing the app programme of `PWA_PLAN.md` (Phase 1: installable app + offline
core — built, pushed for the Captain's preview checks).*

**Status: built on this branch; builder's self-checks recorded below (17 Oct 2026),
and the branch is pushed for the Captain's preview (preview only — nothing in
production). Nothing here is audited; the builder does not certify its own work
(CONTRACT clause 4).**

## What Phase 1 left on the table

Exam Mode already saves every sitting (score, per-chapter breakdown) and the
performance dashboard already shows the trend + weakest chapters. But the
question-by-question review (correct answer, your answer, explanation) exists
only in the moment after submitting — leave the page and it is gone. A student
cannot later sit down with a past paper and study what they got wrong.

Weak-area analytics are read-only bars: they name the weak chapter but offer no
way to act on it (study the chapter, or see the exact questions missed).

## What Phase 2 adds

1. **Persistent review per sitting.** When Exam Mode records an attempt, it
   also saves a compact answer trace. A new review page reconstructs the full
   answer review at any later date:
   `/dashboard/review/[attemptId]`, linked from every Recent Attempt on the
   dashboard (and from the result screen right after submitting).
   Filters: All / Wrong / Unanswered / Flagged; each question links to its
   chapter notes; a "weakest in this sitting" strip at the bottom.

2. **Weak areas become actionable.** Dashboard weak-chapter rows link to the
   chapter's notes page ("Revise →") instead of being dead text.

3. **The October audit's exam-history sync defect — already repaired on main.**
   No code needed; verified below. Phase 2 keeps it that way (the new field must
   never break the sync path).

## How the answer trace is stored (design, decisions taken)

- **Device-local only.** The trace rides in the existing
  `ga-exam-history-v1` localStorage record (`ExamAttempt.review`). It is NOT
  added to the Supabase row: that would need a schema migration on a table
  whose live schema the Oct 8 audit marked BLOCKED, and the sync path must not
  break for students mid-flight. Sync keeps carrying score + breakdown as
  today; a review is available on the device that sat the paper. (If the
  Captain wants cross-device review later, that is a deliberate DB change —
  his call, Phase 4+.)
- **Identity = the bank's own stem key.** `DemoQuestion` has no id; the bank's
  de-dupe already treats the normalised stem (`stemKey`) as the question's
  identity, and `collapseWithReport` guarantees at most ONE live copy per key
  in `ALL_QUESTIONS`. The trace therefore stores, per question in sitting
  order: `{ k: stemKey, a: chosen option index | null, f?: flagged }`.
  Measured 4.4 KB for a 50-question sitting (3.8 KB of trace — ≈76 B per question,
  ≈8 KB for a 90-question paper); the 50-attempt cap bounds it (≈0.4 MB worst
  case at 90 questions, inside a 5 MB localStorage budget).
- **Review shows TODAY's verified keys.** Questions are re-resolved against
  the live bank, so a corrected answer key shows corrected (the site's
  verification promise). If the current keys score the sitting differently
  from what was recorded, the page says so plainly ("answer keys were revised
  since this sitting"). A question no longer in the bank renders a labelled
  placeholder, not a silent gap.
- **Old sittings** (recorded before this feature) have no trace: the dashboard
  row keeps its old behaviour (link to the paper page), and the review page,
  if reached by URL, explains and offers a retake.
- **Privacy/protection:** under `/dashboard`, so `robots: noindex` (inherited)
  and the service worker's PRIVATE_PATHS rule (already `/^\/dashboard(\/|$)/`)
  keeps it out of every cache. Unchanged rules; nothing to add.
- **No new npm dependencies. No package.json edits.**

## Files

| File | What it is |
|---|---|
| `lib/exam-review.mjs` + `.d.mts` | Pure matcher: trace + live pool → review items; stats; sanitises hand-edited storage |
| `lib/exam-review.test.mjs` | node:test suite (runs under `npm test`) |
| `lib/chapter-links.ts` | chapterId → notes-route resolver (+ hook); bank-free fast path, bank-coupled air-regs translation on demand |
| `lib/exam-history.ts` | `ExamAttempt.review?: ReviewEntry[]` (type from exam-review.d.mts) |
| `lib/questions.ts` | `stemKey` exported (the identity key) |
| `lib/air-regs-chapter-label.ts` | + track-aware bank-id inversion (`siteChaptersServedByBankId`) |
| `app/exam/ExamRunner.tsx` | records the trace; result screen links to the saved review |
| `app/dashboard/WeakChapterBars.tsx` | extracted from the dashboard page; rows become links when resolvable |
| `app/dashboard/page.tsx` | uses the extracted bars; Recent Attempts link to reviews |
| `app/dashboard/review/[attemptId]/page.tsx` + `AttemptReview.tsx` | the review page (server metadata + client reader) |
| `tools/pwa/review-selftest.mts` | builder's self-check against the real bank (labels itself as a self-check) |

## Evidence log

*Builder's self-checks only. Per CONTRACT clause 4 this is NOT an independent
audit — the builder cannot certify its own work.*

- [x] Exam-history sync defect (audit item, ~line 168) — already repaired on
      `origin/main` before this branch was cut.
      ```
      CLAIM:        The Oct 8 audit's exam-history sync defect is already fixed on
                    the Phase 2 base (origin/main); no Phase 2 code change repairs it.
      HOW CHECKED:  git merge-base --is-ancestor 00dcbcc origin/main ;
                    git log --oneline --follow -- lib/exam-history-sync.ts
                    lib/exam-history.ts ; read both files whole.
      RAW OUTPUT:   00dcbcc IS an ancestor of origin/main
                    00dcbcc Thu Oct 8 16:32:26 2026 +0530 Security batch b5: bound
                    Gini path, widen price guard, harden webhook, keep exam attempts
                    lib/exam-history.ts +59: pending ids now PERSISTED under
                    "ga-exam-history-pending-v1"; comment: "Until 2026-10-08 they
                    lived in a module-level Set that was emptied before the upload
                    was attempted". lib/exam-history-sync.ts +66: pushPending()
                    inspects the insert result and calls confirmPendingIds(settled)
                    only after a confirmed upload / duplicate / aged-out attempt.
      PROVES:       The two failure modes the audit named (in-memory pending set lost
                    on reload; ids drained before the upsert succeeded) are both
                    addressed in the current base: pending ids survive a tab close,
                    and a failed upload leaves them pending for retry.
      DOES NOT PROVE: That the live Supabase table accepts the inserts (schema
                    BLOCKED in the audit), nor that no other sync defect exists.
                    Read from source, not executed against a Supabase instance.
      ```
- [x] `npm test` — 533/533 pass (whole `lib/**/*.test.mjs` suite), including
      the new `lib/exam-review.test.mjs` (10 tests).
- [x] `npx tsc --noEmit` — exit 0.
- [x] `npx eslint app lib` — exit 0.
- [x] `npx tsx tools/pwa/review-selftest.mts` — exit 0, `PROBLEMS: 0`
      (bank-coupled self-check: unique stem keys across all 4326 live questions;
      every Exam paper pool resolves and scores identically through the matcher;
      Air Regs bank-id inversion round-trips both tracks). Log:
      `tools/pwa/_captures/selftest-phase2.log`.
- [x] `npm run build` — exit 0 (repo audit + sitemap first, `PROBLEMS: 0`,
      1,657 pages; the review route classed `ƒ` dynamic as intended). Log:
      `tools/pwa/_captures/build-phase2.log`.
- [x] Browser test on the production build (`npx next start`): sat
      air-regulations (answered 10 / flagged 2 / 40 blank) → recorded 3/50 →
      result screen links the review → review page filters 50/7/40/2, answer
      highlighting, chapter links click through → dashboard review row, retake
      icon, weak-row links. Deliberate-failure runs on tampered localStorage:
      pre-Phase-2 attempt without trace, a question gone from the bank
      (labelled placeholder), revised answer keys (drift note), unknown attempt
      id. Full record: `tools/pwa/_captures/evidence-phase2-local.md`.
- [x] Preview deploy — `ef44387` pushed to `origin/pwa-20261017`; the Vercel
      preview was Ready in ~3 min. The branch alias
      (`https://ghost-aviator-git-pwa-20261017-pankajpahil-codes-projects.vercel.app`)
      was verified serving Phase 2: the exam page carries the "Every sitting is
      saved" bullet, and the review route answers with its SSR shell + title.
      Previews sit behind Vercel Deployment Protection for anonymous visitors;
      the Captain's signed-in session passes it.
- [ ] Captain's checks.

## Open for the Captain (nothing blocks Phase 2)

- Cross-device review needs a real DB column on `exam_attempts` — deliberately
  not done (audit marks the live schema BLOCKED; a failed migration attempt
  must not risk the working sync). Say the word and it becomes a small Phase 4
  item with a migration file for review.
- The dashboard's weak rows aggregate attempts across CPL and ATPL; for Air
  Regulations bank ids the label has always been shown in CPL chapter terms
  (pre-existing). Phase 2 makes the link agree with the label shown. If the
  Captain wants ATPL attempts to speak in ATPL chapter terms there, that is a
  separate small change to the aggregation.
