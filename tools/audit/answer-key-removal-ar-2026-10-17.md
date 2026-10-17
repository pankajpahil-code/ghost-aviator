# Air-regulations — hardcoded answer-key removal pass (2026-10-17)

Commit: `9e6e666` (parent `9773039`). Tool: `tools/audit/remove-answer-key-ar.mjs` (dry-run + `--apply`, byte-exact, re-run-safe, CRLF/BOM-preserving).
Archive (nothing deleted): `tools/audit/answer-key-archive/ar-removed-blocks-2026-10-17.json` — 13 blocks + 11 rewords, verbatim.

## Coverage gate (builder re-verification on this tree, 2026-10-17)

`_pk-tools/ar-coverage-check.mjs` — every removed entry must already exist inline (highlighted green + ✓) in the same page:

- 12 files, **289/289 entries matched, 0 missing, 0 mismatched**: ar-2 15, ar-6 10, ar-7 12, ar-11 53, ar-14 25, ar-15 5, ar-17 109, ar-19 10, ar-20 14, ar-21 10, ar-22 5, ar-23 21.
- ar-19 inclusion (beyond the recon's 11 removal-safe files): its only flagged conflict (Q1 highlight vs grid) was resolved in the 17 Oct fix pass (`8a2ca03`, highlight corrected to A per grid + explanation + source key); fresh gate then read 10/10 — removal-safe.
- Blockers kept untouched: **ar-3** (89 unmatched), **ar-12** (88 unmatched), **ar-16** (0 inline — questions not printed; grids are the only answer source).

## Removed blocks (13, 15,851 bytes; 260 block lines + 11 reword swaps = 271 deleted diff lines)

| File | Range (orig. lines) | Lines | Bytes | Content |
|---|---|---|---|---|
| ar-2 | L983–995 | 13 | 676 | H3 "Consolidated Answer Key — All 15 Questions" + 15-entry grid |
| ar-6 | L1231–1237 | 7 | 340 | box-violet mini-key (10 entries) |
| ar-7 | L1830–1858 | 29 | 1,423 | comment + wrapper + "Quick Answer Key" + 12-entry table |
| ar-11 | L4150–4221 | 72 | 4,747 | part-header "Official Answer Key / DGCA SOURCE" + ak-grid box (53 entries) |
| ar-11 | L742–746 | 5 | 466 | dead CSS (`/* ANSWER KEY TABLE */` + `.ak-grid/.ak-cell/.ak-num/.ak-ans`) |
| ar-14 | L2142–2159 | 18 | 879 | "Table 12.1 — Master Answer Key" + two tables (Q1–13 / Q14–25) |
| ar-15 | L986–991 | 6 | 472 | bare Q1–Q5 grid (found structurally; no phrase) |
| ar-17 | L2219–2246 | 28 | 3,098 | comment + H3 "Consolidated Answer Key — All 109 Questions" + 109-entry grid |
| ar-19 | L1187–1197 | 11 | 460 | H3 "Answer Key (Per Source Textbook)" + 10-entry table |
| ar-20 | L1264–1279 | 16 | 583 | H3 "Quick-Reference Answer Key" + 14-entry table |
| ar-21 | L1239–1257 | 19 | 733 | comment + H3 "Quick Answer Key" + 10-entry table |
| ar-22 | L1318–1331 | 14 | 889 | H3 "D. Answer Key — Quick Self-Test Review" + 5-entry table |
| ar-23 | L1669–1690 | 22 | 1,085 | H3 "10.4 Answer Key Summary" + 21-entry (2 tables) |

All slices tag-balanced (div/table/section/style net 0); per-file token balance drift = 0; seams verified single-blank.

## Rewords (11)

1. ar-2 L432 (TOC): "Practice Question Bank — 15 MCQs + Answer Key" → "…15 MCQs".
2. ar-2 L890: dropped stale "A consolidated answer key grid follows." (grid gone).
3. ar-11 L2922 (cover): "53 MCQs + Official Answer Key" → "53 MCQs with Inline Answers".
4. ar-17 L450 (TOC): "…109 MCQs + Answer Key" → "…109 MCQs".
5. ar-17 L1542: dropped stale "A consolidated answer key grid follows at the very end."
6. ar-22 L410 (TOC) + 7. ar-22 L1229 (H2): "Master Reference Tables & Answer Key" → "Master Reference Tables" (tables remain).
8. ar-23 L263 (TOC) + 9. ar-23 L1620 (H2): "Master Reference Tables · Mnemonics · Answer Key" → "…· Mnemonics".
10. ar-23 L1691: "10.5 Final Exam-Day Cheat Card" → "10.4 …" (renumber after removing the old 10.4; no other 10.x refs exist).
11. ar-26 L956: "the master answer-key consolidated cross-reference" → "a consolidated cross-reference of all worked answers".

## Survivors (by design)

- Deliberate source-key annotations: ar-5 L1561, ar-6 L1272 (qa-answer), ar-11 L3664 + L4004, ar-13 L1995, ar-19 L1047 + L1052, ar-26 L814. (Their fate is part of the blocker-phase/STRICT decision for air-regulations.)
- Blockers: ar-3 (3 lines), ar-12 (4), ar-16 (7).

## Guard

- Before: `air-regulations: 99 occurrence(s) in 18 file(s)` (incl. ar-15 structural).
- After: **`air-regulations: 22 occurrence(s) in 9 file(s)`** = ar-3 3, ar-5 1, ar-6 1, ar-11 2, ar-12 4, ar-13 1, ar-16 7, ar-19 2, ar-26 1. Structural detector: clean (ar-15 grid gone).
- STRICT dirs (meteorology, radio-navigation, air-navigation): still clean. `--check` exit 0.
- Broad residual scan (`_pk-tools/ar-residual-scan.mjs`, patterns beyond the guard's): only the intended survivors above.

## Verification artifacts (workspace)

- `_pk-docs/ar-removal-dryrun-log.txt`, `_pk-docs/ar-removal-apply-log.txt` (per-edit before/after evidence + post-write checks).
- `_pk-docs/ar-guard-after.txt`, `_pk-docs/guard-list-ar-after.txt`, `_pk-docs/ar-residual-scan.txt`.

## Independent audits

Both independent audits returned **PASS** (builder never audits own work); full reports committed under `tools/audit/`:

- **Audit A — repo/scope** (`answer-key-ar-audit-A-2026-10-17.md`): commit scope exact (13 air-regulations files + 2 tool files, no other content); worktree == audited commit; archive reconstructs every file byte-exactly (13 blocks / 260 lines / 15,851 bytes; sha1s and byte counts exact); guard 99/18 → 22/9 reproduced per-file; residual scans classify every hit; byte hygiene clean (UTF-8, BOM-less, CRLF); coverage 289/289 independently reproduced. MINOR: ar-11 double blank at the CSS cut seam (fixed in the post-audit seam-fix commit). INFO: the archive stores the CRLF checkout representation while parent git blobs are LF (`autocrlf=true`) — content exact modulo EOL.
- **Audit B — content fidelity** (`answer-key-ar-audit-B-2026-10-17.md`): all 289 removed (Q → letter) pairs match the inline answers 1:1 in POST and PRE (0 mismatches / 0 missing across all 13 blocks); the full diff contains only the archived deletions + reword swaps; ar-19's Q1 history verified (single historical divergence at `4c21ef1`, resolved by `8a2ca03`); zero dangling refs; rewords 11/11 byte-exact and truthful; blockers ar-3/12/16 byte-identical to parent.

Post-audit follow-up: the ar-11 seam fix (in a shared seam-fix commit — see the team log for the commit chain).

## Open items after this pass

1. Key-flip rulings (rnav-15 Q3 / rnav-19 Q3 + dataset exp cleanup) — still with the Captain.
2. Air-regulations blockers ar-3 / ar-12 / ar-16: questions are not printed inline → removing their grids would lose the only answer source until the full question set is imported.
3. Deliberate source-key annotations above: reword only if a blanket no-phrase STRICT policy is adopted for air-regulations.
