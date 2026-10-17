# Instrumentation — hardcoded answer-key removal pass (2026-10-17)

Commit: `01c06c5` (parent `9e6e666`). Tool: `tools/audit/remove-answer-key-inst.mjs` (dry-run + `--apply`, byte-exact, re-run-safe, CRLF/BOM-preserving).
Archive (nothing deleted): `tools/audit/answer-key-archive/inst-removed-blocks-2026-10-17.json` — 25 blocks + 19 rewords, verbatim.

## Coverage gate (builder re-verification on this tree, 2026-10-17)

`_pk-tools/inst-coverage-check.mjs`:

- 24 removal-safe files, **223/223 entries matched, 0 missing, 0 mismatched** (Format A `Correct Answer: <strong>(x)</strong>`; inst-31 via 56 `class="correct"` markers, Paper 1 Q1–40 + Paper 2 Q1–16).
- **inst-40 kept (blocker)**: 417 grid entries, only 16 with inline sources, 399 with no inline answer anywhere on the page (questions mostly not printed). One heading (`Master Answer Keys — All Sections`, L663, + TOC L76) still has no grid under it — part of the inst-40 policy decision.
- **inst-34 kept (deliberate)**: no grid; 3 "reference answer key" annotations documenting source-key discrepancies.

## Removed blocks (25, 10,528 bytes, 193 lines)

| File(s) | Content removed |
|---|---|
| inst-1..17 (17 files) | heading ("Answer key" / "Source Answer Key" / "Answer Key [Summary]") + key table (5,8,8,9,7,9,9,6,7,9,9,10,9,6,3,7,6 entries) |
| inst-24 | H3 "Q&A Answer Key" + 6-entry table |
| inst-31 | L48–53: H2 "Quick Answer Keys" + Paper 1/Paper 2 headings + two one-line `div.answer-key` letter sequences (40 + 16 entries); L20: dead CSS `.answer-key {...}` |
| inst-35 | one-line `div.answer-key` ("Answers: 1-a 2-b 3-a 4-c 5-d") |
| inst-36/37/38/39 | heading ("Answer Key" / "Answer Key — Source Questions") + key table (6/5/6/12 entries) |

All slices tag-balanced; per-file token balance drift = 0; seams verified single-blank.

## Rewords (19) — no de-facto letter sequences left

- inst-2 L185: box lead-in — dropped the inline letter sequence → "with the source answers shown inline…".
- inst-3/4/5 L365/L310/L482: "N questions with answer key: <letters>" → "with inline answers and explanations."
- inst-5 L652 (Q&A deliberation): "The source answer key states (b)…" / "trust the source answer key:" → "source key" (attribution kept; the visible deliberation text itself remains a QA backlog item).
- inst-6/7/9/10/11: "Questions 1–N with answer key." → "with inline answers."
- inst-12 L392 / inst-13/14/15/16/17 L335/L285/L157/L261/L371: box lead-ins with full letter sequences → "with inline answers and explanations." / "with the source answers shown inline." (inst-17 keeps its Q6 confirmation note).
- inst-31 L101: "The answer key gives b / the key says / as given in the answer key" → "source key" wording.
- inst-37 L263 / inst-39 L453: "given with their answer key" → "given with their answers shown inline".

## Survivors (by design)

- inst-34 L371/L387/L388 (deliberate source-key annotations).
- inst-40 in full (18 guard lines + 3 raw HTML comments).

## Guard

- Before: `instrumentation: 67 occurrence(s) in 26 file(s)`.
- After: **`instrumentation: 21 occurrence(s) in 2 file(s)`** = inst-34 (3) + inst-40 (18).
- STRICT dirs still clean; air-regulations 22/9 and human-performance 1/1 unchanged; `--check` exit 0.
- Residual scan (`_pk-tools/inst-residual-scan.mjs`): KEY hits only in inst-34/inst-40; **letter-sequence mini-key scan: 0 hits across all 40 files**.

## Verification artifacts (workspace)

- `_pk-docs/inst-removal-dryrun-log.txt`, `_pk-docs/inst-removal-apply-log.txt`, `_pk-docs/inst-guard-after.txt`, `_pk-docs/inst-residual-scan.txt`, `_pk-docs/inst-coverage-2026-10-17-fresh.txt`, `_pk-docs/inst-regions-2026-10-17.txt`.

## Independent audits

See `tools/audit/answer-key-inst-audit-A-2026-10-17.md` (repo/scope) and `tools/audit/answer-key-inst-audit-B-2026-10-17.md` (content fidelity) — to be appended/committed when the audit agents return.

## Open items after this pass

1. inst-40 policy: import the full question set (then gates + removal), or keep grids as the only source. Its 2 old grid↔inline mismatches (D-Q10, F-Q11) were fixed in the 17 Oct content-fix pass; the raw recon list should be re-run before any inst-40 decision.
2. inst-40 L663 grid-less "Master Answer Keys" heading + L76 TOC anchor — fate follows the policy decision.
3. inst-34 discrepancy annotations — keep per recon §5b (or reword under a blanket no-phrase policy).
4. inst-5 L652 visible internal-deliberation text (beyond grid scope) — QA backlog.
