# Answer-key cleanup — 2026-10-26

**Scope:** Air Regulations, Instrumentation, Human Performance & Limitations notes.
**Branch:** `feat/ai-first-trust-pages`
**Status:** applied locally, verified, **not committed / not pushed / not deployed**.

## What changed

The rule remains: the inline answer attached to each question is the single visible answer source. Separate answer-key tables belong to the question dataset, not to a notes page.

### Air Regulations

- Removed the three remaining blocker key tables:
  - `ar-3` — 106-question key grid.
  - `ar-12` — 102-question complete key table.
  - `ar-16` — two key tables covering all 22 practice questions.
- Added 22 inline answers to `ar-16`, one per question, in the same order as the removed key tables. Verified 1:1: Q1–Q22 = A, A, A, B, A, C, B, B, A, C, C, A, C, B, B, C, A, C, C, B, A, A.
- Reworded the source-key prose across `ar-5`, `ar-6`, `ar-11`, `ar-12`, `ar-13`, `ar-16`, `ar-19`, `ar-26`, and `ar-3`. Inline answers and explanations were preserved.
- Updated the `ar-12` and `ar-3` headings/TOC labels so they no longer promise a complete answer key. `ar-12` now says “Selected practice questions with inline answers.”

### Instrumentation

- Removed six full source-key tables from `inst-40`:
  - Flight Instruments (164 answers)
  - Automatic Flight (58)
  - Warning & Recording (33)
  - Engine Instruments (52)
  - Specimen Questions (55)
  - Specimen Examination Paper (55)
- Removed the dead `.answer-key-table` CSS.
- Kept every selected worked answer and explanation. `inst-40` now states that it contains selected key questions with worked explanations, and points students to the practice question bank for the full timed sets.
- Reworded source-key prose in `inst-34`, `inst-40`, `inst-5`, and `inst-31`. No inline answer or explanation was removed.

### Human Performance & Limitations

- Reworded three key references in `hpl-26` (the DCS note, the Otis Barotraumas note, and the cover instruction). The inline answers and explanations are unchanged.

## Guard

`tools/audit/answer-key-guard.mjs` now treats all six cleaned subjects as build-failing:

```
meteorology, radio-navigation, air-navigation,
air-regulations, instrumentation, human-performance
```

`--check` passes with no answer-key phrase or grid-class hits, and `--list` reports `PENDING: none anywhere`.

## Archive

Every removed block and every scripted rewording is preserved verbatim in:

`tools/audit/answer-key-archive/pending-removed-blocks-2026-10-26.json`

- 10 removed blocks, each with line range, byte count, and SHA-1.
- 27 reworded lines with old and new text.

The later synonym/label edits on `inst-40`, `inst-5`, `inst-31`, `ar-26`, and `hpl-26` are visible in the Git diff; they are prose changes only.

## Verification

| Check | Result |
| --- | --- |
| `node tools/audit/answer-key-guard.mjs --check` | PASS — six strict subjects clean |
| `npx tsc --noEmit` | PASS |
| `npm run lint` | 0 errors; 4 pre-existing unused-variable warnings in older audit scripts |
| `npm run build` | PASS — 1,678 static pages |
| Question artifact guard | PASS — 4,583 questions |
| Oxford Technical General guard | PASS — 257/257 live after de-dupe |
| Sitemap guard | PASS — 682 entries, 609 with lastmod, 108 video nodes, 0 problems |
| Notes-page smoke test | PASS — 14 changed pages served 200 with no answer-key or synonym hits |

Smoke-tested pages:

- `/cpl/air-regulations/ar-3/notes`
- `/cpl/air-regulations/ar-5/notes`
- `/cpl/air-regulations/ar-6/notes`
- `/cpl/air-regulations/ar-11/notes`
- `/cpl/air-regulations/ar-12/notes`
- `/cpl/air-regulations/ar-13/notes`
- `/cpl/air-regulations/ar-16/notes`
- `/cpl/air-regulations/ar-19/notes`
- `/cpl/air-regulations/ar-26/notes`
- `/cpl/instrumentation/inst-5/notes`
- `/cpl/instrumentation/inst-31/notes`
- `/cpl/instrumentation/inst-34/notes`
- `/cpl/instrumentation/inst-40/notes`
- `/atpl/human-performance/hpl-26/notes`

Human Performance is an ATPL subject, so its correct route is under `/atpl/`, not `/cpl/`.

## Notes before commit

- `lib/generated/lastmod.ts` has not been regenerated for these notes changes. Run `npm run build:lastmod` after approval and include the regenerated file in the commit.
- A broader synonym scan found explanatory “source key” prose in previously cleaned Air Navigation and Radio Navigation notes. These are verification notes, not key tables, and were outside this pass. If the Captain wants the word “key” removed from that prose too, treat it as a separate synonym sweep.
- No commit, push, or deploy has been performed.
