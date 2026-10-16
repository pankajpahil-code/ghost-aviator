# Answer-key removal — Radio Navigation (stage 2 of the site-wide pass)

**Captain's direction.** The inline answer attached to each question is the
single visible answer source. Hardcoded answer-key tables are removed from
the notes; keys belong to the question dataset, never to a table on a page.

**Status.** Done and merged to `main` on 17 Oct 2026 (`abacbeb..4da462f`).
Live-verified the same hour: rnav-7's grid gone on the live page (deploy poll
10 clean — key text 0, grid classes 0, all 21 inline answers intact); rnav-1
clean (12 inline answers); rnav-19 box gone (243 inline answers); met-13
re-checked, still clean. Guard is STRICT for radio-navigation (build-enforced).

**Correction to the stage-1 note about rnav-7.** The met report warned that
"rnav-7's page shows no inline answers at all". That was a marker-format miss,
not reality: rnav-1..7 carry full inline answer panels in the form
`Correct Answer: <strong>(x)</strong>` + explanation (rnav-1 adds a ✅).
Per-question coverage was verified before removal — see below.

## What was removed (9 chapters, 18 blocks, +3/−139 lines)

- 7 "Answer Key — Chapter N" grids (rnav-1..7): 58 Q→letter cells total
  (12/8/4/4/3/6/21 per chapter);
- their dead CSS: rnav-1's 17-line `/* ===== ANSWER KEY ===== */` block, and
  rnav-2..7 four single-line `.answer-key-grid`/`.ak-cell` rules each;
- 1 "66-Question Specimen Exam — Answer Key" box (rnav-19): 66 Q→letter pairs;
- 2 inline sentences reworded to drop the phrase "answer key" (rnav-15 and
  rnav-19 notes; meaning preserved — see findings).

Everything removed is quarantined verbatim (18 entries):
`tools/audit/answer-key-archive/rnav-removed-blocks-2026-10-17.json`.

## Coverage proof (the gate before removal)

- **Grids vs inline answers:** for each chapter the grid answers were extracted
  and compared with that chapter's inline answers — **58/58 identical,
  0 mismatches, no grid-only questions.** The grids carried no unique
  information; the inline answers are the surviving source.
- **rnav-19 specimen box:** **41 of its 66 answers contradicted** the
  same-numbered inline answers (62% wrong). "Specimen" appears nowhere else on
  the page — no questions exist for that box. Stale/orphaned surface; removed.
  The chapter's 243 revision questions keep their inline answers.

## How it was done safely

`tools/audit/remove-answer-key-rnav.mjs` — byte-exact edits only (CRLF, no BOM),
per-edit anchors (heading + container + balanced close + Q-sequence 1..N; box
pair sequence 1..66; exact CSS rule patterns), tag-delta assertion
(div/table/details/span deltas must balance), all-or-nothing per file.

Post-apply audits:
- residual scan: "answer key" text and grid classes → **0** across all 20
  radio-navigation chapters;
- inline answers intact: 12/8/4/4/3/6/21 across rnav-1..7; 19 answer panels on
  rnav-15; 243 on rnav-19;
- tag-delta audit across the 9 edited files — all deltas balanced;
- guard `--check` passes with radio-navigation in STRICT scope.

Reproduce: `node tools/audit/remove-answer-key-rnav.mjs` (dry run, fails fast
if anything moved) and `node tools/audit/answer-key-guard.mjs --check`.

Live verification log (workspace, not repo):
`_pk-docs/live-verify-rnav-2026-10-17.txt`; rendered-DOM before/after extracts:
`_pk-docs/rnav-visual-evidence-2026-10-17.txt`.

## Findings for the Captain (content notes — conservative edits only)

1. **rnav-15 Q3 (DME, 1290 μs).** Dataset answer (b) 104.3 NM. The old note
   was self-contradictory ("closest answer is b at 100.3 / use
   (1290−50)/12 = 103.3"). Page note now reads: 100.3 = delay-corrected,
   (b) 104.3 = raw 1290 μs, intended answer (b). The same muddled text still
   lives in `lib/generated/oxford-radio-nav.ts` (~L1405) — dataset wording
   review suggested.
2. **rnav-19 Q3.** Inline answer (c) 134; the displayed computation
   (√400 + √9000 → 141 NM) is nearest to (d) 140. The (kept) note explains a
   325/8000 ft variant giving exactly 134 = (c). A content ruling is suggested
   for page + dataset copy.
3. **rnav-3** footer carries a pre-existing unbalanced `</div>`
   (130/131 before → 117/118 after; delta unchanged by this pass). Source
   hygiene item; render unaffected.
4. **Kept on purpose:** rnav-6 "LOS calculation" reference table and rnav-11
   "Requirement / Calculation / Answer" table — numeric worked examples, no
   lettered keys.

## Guard

`radio-navigation` added to `STRICT_DIRS` in
`tools/audit/answer-key-guard.mjs`; `--check` passes (met + rnav clean; wired
into `npm run build`). Report-only subjects remain: air-regulations 99/18,
instrumentation 67/26, air-navigation 35/17, human-performance 1/1.

## Next passes

Air Navigation first (nav-16 gap needs a look), then instrumentation,
air-regulations, human-performance.
