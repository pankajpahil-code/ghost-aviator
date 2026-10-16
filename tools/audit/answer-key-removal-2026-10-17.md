# Answer-key removal — CPL Meteorology (stage 1 of the site-wide pass)

**Captain's direction.** The inline answer attached to each question is the
single visible answer source. Hardcoded answer-key tables are removed from
the notes; keys belong to the question dataset, never to a table on a page.

**Status.** Done for CPL Meteorology and merged to `main` on 17 Oct 2026
(`110265d..dcf1f1b`). Live-verified the same hour: no answer-key heading on the
met-1/2/4/5/13/26/28 pages; inline answers intact.

## What was removed (25 chapters, 30 blocks, 296 lines)

Chapters: met-1 … met-21, met-24, met-25, met-26, met-28.
(met-22, met-23, met-27, met-29 never had a key grid; nothing to remove.)

- 25 answer grids/tables ("Answer Key — Chapter N", "Q&A Answer Key",
  "Textbook Answer Key", "TAF/ROFOR Answer Key", the met-4/met-5
  `answer-grid` cell variants, plus the met-8/met-9 one-row letter maps);
- 1 "📘 Answer Key: Q1=b, Q2=c …" box (met-5, right under the Q&A heading);
- 2 redundancy lists "(Answers from textbook Q1–20: b b b d …)" (met-8/9);
- 2 dead `.answer-grid` CSS blocks (met-4/5) and 1 red-box note that only
  explained the removed grid's asterisks (met-15);
- 2 sentences trimmed to their non-key part (met-4 instructions line,
  met-28 Q&A lead-in) — the surrounding text was kept.

Nothing is lost: every removed block is quarantined verbatim in
`tools/audit/answer-key-archive/met-removed-grids-2026-10-17.json`.

## Evidence that the grids were stale — met-13

The removed met-13 grid disagreed with the inline (bank-verified) answers on
**13 of its 35 entries**: Q9, Q11, Q16, Q17, Q19, Q22, Q24, Q26, Q29, Q30,
Q32, Q33, Q34. The grid also listed Q23, for which the page has no question.
Reproduction: `node tools/audit/remove-answer-key-grids.mjs` (dry run) and the
archive JSON above.

Visual proof (workspace, not repo):
`_pk-docs/artifacts/met-13-live-BEFORE-answer-key-2026-10-17.png` (grid live),
`_pk-docs/artifacts/met-13-worktree-AFTER-no-grid-2026-10-17.png` (grid gone,
page flows straight to Mnemonics).

## How it was done safely

`tools/audit/remove-answer-key-grids.mjs` verified every block against
markers, balanced `<table>`/`<div>` counts and "no non-key heading swallowed"
before writing; any mismatch aborts with zero writes. A post-edit residual
scan confirms no key text remains (only the two descriptive lead-ins the
source scrub deliberately writes: "Practice questions with verified answer
key." in met-2/met-3 — kept, they carry no answers).

## Guard against reappearance

`tools/audit/answer-key-guard.mjs` scans every `notes.html`:
meteorology = STRICT (any answer-key text or grid class is a violation),
all other subjects = report-only until their pass is done.
It is wired into `npm run build` as `--check`, so a key grid cannot silently
return to the meteorology notes.

## What remains (follow-up passes, one subject at a time)

Inventory: `tools/audit/answer-key-inventory-2026-10-17.tsv` (95 files).
Guard currently reports: radio-navigation 9 files, air-regulations 18,
instrumentation 26, air-navigation 17, human-performance 1.

Cases needing a per-question inline-coverage check BEFORE removal:
- **air-navigation**: nav-13…nav-18 "Answer Key Summary" grids, nav-19/20/22/24
  quick keys, nav-6; nav-16 already known to lack inline answers on some
  questions — its grid may be the only source there.
- **radio-navigation**: rnav-1…rnav-7 grids — rnav-7's page shows no inline
  answers at all; removal there needs the answers moved inline first, or the
  chapter keeps its table until then.
- **instrumentation**: inst-2…inst-17 "with answer key: 1-b, 2-c…" summaries,
  inst-24/31/36–40 — several of these are a chapter's only answer listing.
- **air-regulations**: consolidated tables (ar-2/3/12/14/17) mostly duplicate
  the inline green-correct marks — likely safe; editorial mentions (ar-26,
  nav-cx3-5/6) left alone.
- **human-performance**: hpl-26 — an inline note inside a `<details>` answer;
  nothing to remove.

When a subject's pass completes, add it to `STRICT_DIRS` in the guard.
When every subject is clean, the build already enforces the rule everywhere.
