# Answer-key removal — Air Navigation (stage 3 of the site-wide pass)

**Captain's direction.** The inline answer attached to each question is the
single visible answer source. Hardcoded answer-key tables are removed from
the notes; keys belong to the question dataset, never to a table on a page.

**Status.** Done on branch `ak-grid-nav-2026-10-17` (base `f39a61a`, met +
rnav live). **Not yet pushed** — this is the evidence summary for the go
decision. Guard is STRICT for air-navigation (build-enforced) on the branch.

## What was removed (18 files, +26/−241 lines)

**12 hardcoded answer-key tables/grids — 182 Q→answer entries total:**

| File | Removed | Entries |
|---|---|---|
| nav-6 | "D. Answer Key" 75-question keytable (5×15) + dead key-CSS | 75 |
| nav-13 | "Answer Key Summary" table (Q1–5, incl. 4(a)/4(b)) | 6 |
| nav-14 | "Answer Key Summary — No ⚑ Flags" (Q1–11) | 11 |
| nav-15 | "Answer Key — Q1–Q14" (letters) | 14 |
| nav-16 | "Answer Key — No ⚑ Flags" (Q1–12) | 12 |
| nav-17 | "Answer Key — No ⚑ Flags" (Q1–5) | 5 |
| nav-18 | "Answer Key — No ⚑ Flags" (Q1–8) | 8 |
| nav-19 | "Quick Answer Key" grid (Q1–10, with ⚑ cells) | 10 |
| nav-20 | "Quick Answer Key" grid (Q1–10) | 10 |
| nav-21 | "Quick Answer Summary" grid (Q1–15) | 15 |
| nav-22 | "Answer Key Summary" grid (Q1–6, with footer note) | 6 |
| nav-24 | "Quick Answer Key" grid (Q1–10 + ⚑ note) | 10 |

**5 dead key-CSS blocks:** `.ans-key`/`.key-grid`/`.key-cell` rules in
nav-19/20/21/22/24, plus nav-6's `/* Answer key grid */` + `.keytable`/
`.krow-*`/`.keyfix` block.

**nav-6 editorial fix:** Part D removed → Part E renumbered to D
("D. Final Revision — Read This The Night Before"); intro paragraph letters
made consistent (two references). The print page-break div is kept.

**25 prose mentions reworded** (meaning preserved; nothing else changed):
nav-6 (intro), nav-9, nav-13 (intro line), nav-19 ×2, nav-22 ×3 lines
(9 instances), nav-31, nav-cx3-5 ×5 (incl. one phrase wrapped across a line
break), nav-cx3-6 ×4, nav-cx3-8a ×1, nav-cx3-9 ×5. Vocabulary used is the
chapters' own established one: "source key" (cf. nav-13 "source key",
nav-17 "Source key: …"). The two "the book's own key" spots avoid
"book's own source key" redundancy.

Everything removed is quarantined verbatim (18 blocks + 25 rewords,
14,570 bytes):
`tools/audit/answer-key-archive/nav-removed-blocks-2026-10-17.json`.

## Coverage proof (the gate before removal)

Per-question inline-coverage check run **before** any edit
(`_pk-docs/nav-coverage-report.txt`), then re-run after; inline counts
identical before/after, grids 0:

- **nav-6:** 75/75; all 65 lettered answers MATCH; the 10 grid cells that
  show only ⚠ (Q1,3,4,5,12,25,30,31,63,73) mirror the inline ⚠ quality
  boxes (AMBIGUOUS / FLAGGED / PENDING) which stay — the grid added nothing.
- **nav-13:** 6/6 incl. Q4(a) first crossing 140°W/160°(T), second 040°E/
  020°(T), and Q4(b) 040°E/200°(T) — all present inline.
- **nav-14:** 11/11 multi-part numeric values verified line by line.
- **nav-15:** 14/14 letters MATCH (grid covered Q1–14; inline has 15 blocks).
- **nav-16:** 12/12 — **the "known gap" from stage 1 is disproven**; every
  one of the 12 answers exists inline ("Answer: 7°L" format).
- **nav-17:** 5/5; the grid's `[TE=12, CA=7]` / `[TE=8, CA=6]` annotations
  also live in the inline instructor notes.
- **nav-18:** 8/8. **nav-19:** 10/10 letters (Q3/Q4 ⚑ key-retention notes
  stay inline). **nav-20:** 10/10 (Q8 "16° / 125° ⚑" note stays inline).
- **nav-21:** 15/15 (Q1–10 numeric, Q11–15 letters d,c,c,c,d MATCH).
- **nav-22:** 6/6; the grid's "(key)" values are carried by the inline
  instructor notes ("Accept the key value … in examinations") — unchanged.
- **nav-24:** 10/10 letters; the Q4 note pointed to the inline instructor
  note, which stays.

## How it was done safely

`tools/audit/remove-answer-key-nav.mjs` — byte-exact line-range edits
(CRLF, BOM-less, round-trip asserted), per-edit expectations (start/end
anchors), per-cut tag-balance assertion (div/table/section/style), every
transform must occur exactly once, descending application per file,
all-or-nothing. Dry run validates everything and prints every removed
line first.

Post-apply audits:
- the tool's own post-write checks caught a partial-apply defect on the
  first run (cuts validated but not applied); files were restored with
  `git checkout` and cleanly re-applied. Final run: all 18 files
  `phrase=0; classes=0; balance ok` and "All post-write checks passed";
- residual scan across all 30 air-navigation chapters: "answer"+"key"
  occurrences **0** (was 43 in 17 files);
- independent tag-delta audit (HEAD vs worktree, 8 tag types): **all deltas
  balanced**;
- coverage re-run: inline answer counts identical, grids 0, no problems;
- guard `--check` passes with air-navigation in STRICT scope.

Reproduce: `node tools/audit/remove-answer-key-nav.mjs` (dry run; fails
fast if anything moved) and `node tools/audit/answer-key-guard.mjs --check`.

## Findings for the Captain (content notes — conservative edits only)

1. **nav-21 blind spot (fixed).** Its grid was headed "Quick Answer
   Summary" — no phrase text — and used the `.ans-key` class family the
   guard did not know. It was found by structure during recon. The guard's
   `GRID_CLASS` now also matches `ans-key|key-grid|key-cell|keytable|
   krow-[qa]|keyfix`, so this class of grid can never hide again.
2. **nav-16 gap disproven.** Stage 1 suspected missing inline answers;
   12/12 answers are inline in "Answer: …" form. Its grid is gone safely.
3. **nav-6 quality flags.** Q12 (AMBIGUOUS a/c), Q25 (terminology),
   Q30/Q31 (PENDING DGCA), Q73 (wing vs whole-aircraft AC), Q1–5 worked
   examples: inline ⚠ boxes are richer than the grid's bare ⚠ and remain.
   The removed note "Q1 to Q5 are worked examples and have no lettered
   answer." is quarantined in the archive.
4. **nav-22 key-vs-computed divergences** (Q4/Q5/Q6) and the nav-19 Q3/Q4,
   nav-20 Q8 key-retention notes stay verbatim inline — only the grid
   duplicates were removed.
5. **nav-cx3-9** carries a pre-existing `<tr>` imbalance (45/44, open vs
   close) — unchanged by this pass; source hygiene item, render unaffected
   (the same class of item as rnav-3's footer `</div>`).

## Guard

`air-navigation` added to `STRICT_DIRS`; `GRID_CLASS` widened (finding 1);
`--check` passes (met + rnav + air-navigation clean; wired into
`npm run build`). Report-only subjects remain: air-regulations 99/18,
instrumentation 67/26, human-performance 1/1.

## Next passes

Instrumentation, then air-regulations, then human-performance; each gets its
own recon → coverage check → removal → audits → guard flip, and its own go
for the live push.

## Independent team audits (added post-commit 23d17fd)

Two fresh-context audit agents (house rule: the builder never audits its own
work) reviewed this branch. Full reports committed beside this one:
`answer-key-nav-audit-A-2026-10-17.md` (repo/scope) and
`answer-key-nav-audit-B-2026-10-17.md` (content fidelity).

- **Audit A (repo/scope): 8/9 claims fully verified** — exact 22-path diff,
  clean tree, guard `--check` exit 0 with STRICT clean and the expected
  PENDING counts, STRICT_DIRS/GRID_CLASS source lines, 0/0 phrase+class
  matches across all 30 chapters, 18/18 files BOM-less/CRLF-consistent,
  archive 18 blocks / 25 rewords / 14,570 bytes. One **descriptive
  contradiction** (nil substantive): the delta script diffs HEAD↔worktree, so
  a post-commit re-run shows no deltas; the auditor re-ran the same logic with
  the true `f39a61a` base and reproduced all-balanced deltas (sole anomaly
  nav-cx3-9 `tr` 45/44 unchanged, exactly as claimed).
- **Audit B (content fidelity): zero contradictions.** 18/18 blocks
  byte-exact (string + sha1 + length); HEAD-BASE + cuts + rewords
  reconstructs every current file **byte-for-byte (18/18)**; 25/25 rewords
  exact and unique; independent coverage parsing (no builder tooling):
  nav-16 12/12, nav-21 15/15, nav-6 65/65 letters with symbol set exactly
  {1,3,4,5,12,25,30,31,63,73} (marked inline: 6 literal ⚠ flags + 4
  worked-example notes), nav-13 all three required answers, and 24/24
  seeded-random entries across the other 8 files; every archived block matches
  a current guard regex (re-insertion fails the build); `git diff --numstat`
  accounting reconciles exactly (241 deleted / 26 inserted).

Sign-off: the removal set is a faithful, fully-accounted change and the
removed answers are provably present inline. Awaiting the Captain's push go.
