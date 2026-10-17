# Instrumentation answer-key removal pass — Independent Audit A

- **Commit audited:** `01c06c5` — "Answer keys: instrumentation removal pass (24 chapters)"
- **Parent:** `9e6e666` — "Answer keys: air-regulations removal pass (12 chapters + ar-19)"
- **Repo:** `D:\pk\_wt\ak-grids`, branch `ak-fix-issues-2026-10-17` — the audit itself made no changes to the repo.
  **Concurrent-activity note:** during the audit another session advanced HEAD `01c06c5` → `e13356a`
  ("Answer keys: removal reports…", +2 report `.md` files only, no content changes) and left an untracked
  `tools/audit/fix-seams-2026-10-17.mjs` (follow-up seam cosmetics; not part of the audited commit, not
  applied). Re-verified at the end of the audit: `git diff --quiet 01c06c5 -- public/content/instrumentation`
  still exits 0, i.e. the audited content on disk is still byte-identical to `01c06c5`, so all
  working-tree-based checks below remain valid for the audited commit.
- **Audit date:** 2026-10-17
- **Scope:** exactly `public/content/instrumentation/*/notes.html` changes in `01c06c5` + the two added files
  `tools/audit/remove-answer-key-inst.mjs` and `tools/audit/answer-key-archive/inst-removed-blocks-2026-10-17.json`.
  Everything else (incl. `9e6e666`) excluded.
- **Method:** read-only; all checks reproduced independently with own scripts in
  `C:\Users\Admin\AppData\Local\Temp\opencode\`
  (`verify-instrumentation.mjs`, `coverage-check-v2.mjs`, `residual-key-scan.mjs`, `anchor-sweep.mjs`,
  `anchor-check.mjs`, `final-checks.mjs`). Builder logs under `_pk-docs\` were **not** used as evidence.

## Verdict summary

| # | Checklist item | Verdict |
|---|---|---|
| 1 | Commit touches only 24 content files + 2 tool files | **PASS** |
| 2 | Null diffs: worktree == commit; inst-34/40 == parent | **PASS** |
| 3 | Archive integrity (blocks == parent slices, sha1, bytes; rewords == parent/current lines) | **PASS** (with LF/CRLF note) |
| 4 | Guard `--check` / `--list` == claimed counts | **PASS** (exact match, exit 0) |
| 5 | Residual scans (phrase / letter-sequence) | **PASS** (all hits innocuous; no mini-keys) |
| 6 | Byte hygiene + line-count deltas | **PASS** (all 24 files) |
| 7 | Tag balance zero drift + seams | **PASS** (cosmetic seam notes recorded) |
| 8 | Anything else (mojibake, anchors, stray tags, whitespace) | **PASS** |
| + | Coverage claim 223/223 inline | **PASS — independently reproduced exactly** |

**Overall verdict: PASS.** No SEVERE, MAJOR, or functional MINOR defects. Details below.

---

## 1. Commit shape — PASS

Commands:

```
git show --stat 01c06c5
git show --name-status --format= 01c06c5
git diff --numstat 9e6e666 01c06c5 -- public/content/instrumentation
```

- 26 files: **24 modified content files** (`inst-1..17`, `inst-24`, `inst-31`, `inst-35`, `inst-36..39` — all
  `notes.html`) + **2 added tool files** exactly as claimed. No other paths touched.
- Totals `763 insertions(+), 212 deletions(-)` reconcile exactly:
  deletions = 25 archive cut lines (193) + 19 reworded lines = 212;
  insertions = 19 rewords + 499 archive JSON + 245 tool script = 763.
- Per-file numstat equals archive arithmetic for all 24 files: `deletions = cutLines + rewords`,
  `insertions = rewords` (e.g. `inst-31: -8/+1` = cuts 7 + reword 1; `inst-39: -18/+1` = cut 17 + reword 1).

## 2. Null diffs — PASS

```
git diff 01c06c5 -- public/content/instrumentation          -> empty (exit 0)
git diff 9e6e666 01c06c5 -- …/inst-34 …/inst-40             -> empty (exit 0)
```

Working tree is byte-identical to `01c06c5` for the audited paths; `inst-34` and `inst-40` are byte-identical
to the parent (also confirmed via blob-hash equality: `inst-34` `39a15d8…`, `inst-40` `fcc1081…` both times).
The change is applied and committed; nothing is left dangling in the worktree.

## 3. Archive integrity — PASS (LF/CRLF caveat stated)

Independent reconstruction (`verify-instrumentation.mjs`): for each of the **25 blocks** I read the parent
blob (`git show 9e6e666:…`), split into lines, and compared the slice `lines[start..end]` with `b.removed`:

- **Newline state:** parent **git blobs are LF**; the working tree is **CRLF** (`core.autocrlf=true`).
  Every `removed` text equals the slice reconstructed with **CRLF** joins (and the last line is blank, so the
  text ends with `\r\n`); for the two single-line cuts (`inst-31 L20`, `inst-35 L333`) there is no trailing
  newline. This is exactly the working-tree bytes the tool operated on; no mismatch under either convention
  was found.
- All **25/25 sha1** values and all **25/25 byte counts** recomputed and matched.
- Total archived bytes **10,528 — exact match** to the claim.
- Ranges are within file bounds and non-overlapping; block inventory matches the claim:
  17 heading+tables in `inst-1..17` (11 + 6) + 5 heading+tables (`inst-24, 36, 37, 38, 39`) +
  `inst-31` 2 blocks (6-line block containing `<h2>Quick Answer Keys</h2>`, two one-line
  `class="answer-key"` divs, both Paper H3s; plus the 1-line dead CSS rule `.answer-key { … }` — a complete
  self-contained rule, **not** an orphaned selector) + `inst-35` 1 one-line div = **25 blocks**.
- **19/19 rewords:** every `oldLine` equals the parent line, every `newLine` equals the current line
  (same number; only `inst-31 L101` correctly lands at current `L94` because 7 cut lines precede it).
  Re-deriving each `newLine` from `oldLine` by applying the recorded `transforms` (each from-string exactly
  once) reproduces it exactly.
- **Nothing deleted beyond the archive:** per-file line-count delta == sum of that file's cut lengths for
  all 24 files (see item 6), and numstat deletion arithmetic above shows no other hunks exist.

## 4. Guard — PASS (exact match, exit 0)

```
cd D:\pk\_wt\ak-grids
node tools\audit\answer-key-guard.mjs --check   # exit 0; "STRICT … clean"; "Guard OK."
node tools\audit\answer-key-guard.mjs --list
# BEFORE (parent tree extracted to temp, git archive 9e6e666):
node tools\audit\answer-key-guard.mjs           # exit 0
```

- **AFTER:** STRICT (meteorology, radio-navigation, air-navigation) clean; instrumentation
  **21 occurrence(s) in 2 file(s)** — exactly `inst-34` L371/L387/L388 (3, deliberate annotations, literal
  "answer key") + `inst-40` 18 lines (L38, 39, 76, 81, 227, 228, 229, 316, 317, 386, 387, 474, 475, 595,
  596, 643, 644, 663). No other instrumentation files.
- **BEFORE (parent, reproduced):** instrumentation **67 occurrence(s) in 26 file(s)** — exact match.
- air-regulations **22/9** and human-performance **1/1** on the current tree match the claim (this commit
  touches neither path).
- `--check` exits **0** in both cases (report-only outside STRICT; build is not blocked).

## 5. Residual scans — PASS

Own patterns over all 40 chapters (`residual-key-scan.mjs`; current + parent):

- **(a) key-ish `/answer[- ]?key|answerkey|answer grid|key grid/i`:** 24 raw line hits on the current tree —
  `inst-34` L371/387/388 and `inst-40` (21 lines, of which 3 are HTML comments). Zero hits in the 24 edited
  files. The guard's published **21** is the same set after comment stripping (18 non-comment `inst-40`
  lines + 3 `inst-34` lines) — consistent, not a discrepancy.
- **(b) letter-sequence `/[0-9]{1,3}\s*[-–—]\s*[a-dA-D]\b/g`:** 12 hits total, all judged:
  - `inst-2:141`, `inst-10:94`, `inst-17:191`, `inst-17:209`, `inst-22:174`, `inst-23:104`,
    `inst-26:244/248/269` — figure captions of the form “Fig. N — **A** static vent” (indefinite article).
  - `inst-17:377` — the statement list “1 - **a** directional gyro 2 - **a** vertical axis gyro …” inside a
    matching question; the letters are the article “a”, and the actual choice letters live in the
    `q-options` list. **Innocuous.**
  - No genuine `N-letter` mini-key remains in any of the 24 edited files (the parent had 146 such hits).
- Broader `/\bkey\b/i` sweep across the 24 edited files: all 106 hits are headings/prose (“Key Rule”,
  “KEY FORMULAS”, `e.key` JS, “Key Topic” table headers), plus two intentional “source key” mentions
  retained adjacent to their question (`inst-5:652`, `inst-31:94`; see INFO-2). No `Answers: 1-a …`-style
  enumeration remains.

## 6. Byte hygiene & line-count deltas — PASS

All 24 edited files re-read from disk (`verify-instrumentation.mjs`):

- **Valid UTF-8, BOM-less, NUL-free, CRLF-only** in all 24 (e.g. `inst-1` crlf=315, `inst-2` crlf=316,
  `inst-31` crlf=252; loneLf=0, loneCr=0 each). The 2 added tool files are valid UTF-8, BOM-less, **LF**
  (consistent with sibling tool files in the index; see INFO-3).
- **Per-file line delta = cut total** for every file, and rewords never changed counts, e.g.
  `inst-1 322→316 (Δ6, cuts 6)`, `inst-12 692→677 (Δ15, cuts 15)`, `inst-31 260→253 (Δ7, cuts 7)`,
  `inst-39 789→772 (Δ17, cuts 17)`. No extra or missing lines anywhere.

## 7. Tag balance & seams — PASS (cosmetic seam notes)

- Net balance (`<div>`, `<table>`, `<section>`, `<style>` — plus `<h3>`, `<p>`, `<strong>`, comments as
  extra): **zero drift vs parent for all 24 files** (all nets equal, e.g. div 0/0, table 0/0, section 0/0,
  style 0/0).
- **No double blank lines introduced anywhere:** the consecutive-empty-line lists are identical parent vs
  current in every edited file. Checked every cut seam explicitly.
- Seam cosmetics (recorded, not defects):
  - `inst-1..5`, `inst-12..17`, `inst-24`, `inst-36..39`: a blank line remains before the watermark footer
    (e.g. `inst-1` C291 blank, C292 watermark).
  - `inst-6..11`: the previous block's `</div>` is now immediately followed by the watermark div with no
    blank line — `inst-6` C342/C343, `inst-7` C489/C490, `inst-8` C315/C316, `inst-9` C419/C420,
    `inst-10` C479/C480, `inst-11` C498/C499. The removed block contained the blank that used to sit after
    the table; parent also had no blank above the removed `<h3>`. Purely formatting.
  - `inst-31`: blank line then `<h2>Paper 1 — Questions &amp; Explanations</h2>` at the seam; `inst-35`:
    `<h3>Practice Questions (Chapter 35)</h3>` then blank line.

## 8. Anything else — PASS

- **Mojibake / invisible chars:** none. Full per-character scan of all 40 chapters for control chars,
  DEL/C1, zero-width/format chars U+2000–200F/U+2028–202F/U+2060–206F, BOM-in-text U+FEFF, PUA,
  variation selectors: **zero hits**; no U+FFFD anywhere (the “�” seen once in a console dump was
  PowerShell failing to render `✓` U+2713 in `inst-31`; file is valid UTF-8).
- **Anchors:** no new dangling `#anchors` in any edited file; no removed block contained any `id=`
  attribute (so no page target was deleted). `inst-31`/`inst-35` individually clean.
- **Whitespace:** `git diff --check 9e6e666 01c06c5 -- public/content/instrumentation tools/audit` → exit 0.
- Tool JSON parses cleanly, schema keys `pass/date/blocks/rewords/updatedAt`; tool script reviewed — it
  hard-checks CRLF/BOM, tag-balanced slices, exact-once transforms, dry-run default, post-write verifies.

## Coverage claim (223/223) — PASS, independently reproduced

`coverage-check-v2.mjs` parsed **all key entries from the archive blocks** (all formats: `<thead>/<tbody>`,
bare `<th>Qn</th>` header rows, `<tr><td>N</td><td>letter</td>`, one-line `1-d 2-b …` lists, with the
`inst-31 L20` CSS rule correctly yielding no pairs) and matched each against the current file:

- **167 pairs** (inst-1..17, 24, 35..39) matched to inline `Correct Answer: (x)` markers by question number
  (no duplicate question numbers exist per file, so matching is positional, not mere co-occurrence).
- **56 pairs** (inst-31) matched **in sequence** against its `class="correct"` option markers
  (56 markers, exact sequence match both papers).
- **Total = 223 — exact match to the claim**, every block ALL-MATCH, zero misses.
- Spot check of removed “Key Topic” hints (`inst-12` Q1–Q4) shows the hint content is present in the inline
  explanations.

## Defects

- **SEVERE:** none.
- **MAJOR:** none.
- **MINOR (cosmetic only):** seam formatting in `inst-6..11` — the closing `</div>` of the preceding block
  is directly followed by `<div class="watermark">` with no blank line (current lines: inst-6 L342/343,
  inst-7 L489/490, inst-8 L315/316, inst-9 L419/420, inst-10 L479/480, inst-11 L498/499). No double blank
  lines were introduced; the alternative (keeping a blank) would match the other 18 files but is purely
  presentational.
- **INFO-1 — CRLF/LF coupling:** parent blobs are LF (`core.autocrlf=true` checkout makes the working tree
  CRLF). The archive text and sha1 were computed over the CRLF working-tree bytes. That is correct for this
  repo/checkout, but the archive would not byte-match a LF checkout of the same commit without
  normalization — worth knowing for any future re-verification on another platform.
- **INFO-2 — prose answer mentions retained:** `inst-5:652` (“trust the source key: (b) 3390 ft”) and
  `inst-31:94` (“The source key gives b”) keep one question’s letter inside its own explanation block.
  This is the documented reword target (“→ inline answers / source key”), adjacent to the question, and
  does not trip the guard.
- **INFO-3 — new tool files are LF while content files are CRLF**; matches the convention of sibling
  `tools/audit/*.mjs` and archive JSON in the index (no BOM either).
- **INFO-4 — count nuance:** the “21 occurrences” figure is the guard’s comment-stripped, per-line count;
  a raw regex over current files yields 24 phrase lines (the 3 extra are HTML comment lines in `inst-40`).
  Not a discrepancy in the claim, just different counting semantics.
- **INFO-5 — concurrent repo activity during the audit (not in scope):** HEAD advanced to `e13356a`
  (report markdown only) and an untracked `tools/audit/fix-seams-2026-10-17.mjs` appeared, which plans to
  (a) insert the blank line back at exactly the six inst-6..11 seams recorded as MINOR above and (b) remove
  an ar-11 double blank from the earlier air-regulations pass (out of this audit’s scope). It was NOT part
  of `01c06c5`, has NOT been applied, and was not treated as evidence; it merely coincides with this audit’s
  MINOR finding.

## Overall verdict: **PASS**

Every auditable claim of commit `01c06c5` was reproduced from first principles and held exactly: the commit
touches only the 24 named content chapters and the 2 added tool files; the worktree matches the commit;
`inst-34`/`inst-40` are byte-identical to the parent; all 25 archived blocks are verbatim, sha1/byte-exact
slices of the parent files (10,528 bytes total) with no overlaps and no unarchived deletions; all 19 rewords
are exact 1:1 line replacements whose old/new text matches parent/current; the guard reads 67/26 → 21/2
(inst-34 3 lines + inst-40 18 lines), STRICT scopes stay clean, and `--check` exits 0; residual phrase and
letter-sequence scans find no surviving keys in the edited files; all 24 files are UTF-8, BOM-less, CRLF,
with zero tag-balance drift and no double blank lines; and the coverage claim was independently
reproduced at exactly 223/223 entries inline. The only findings are cosmetic (a lost blank line at six
seams) and informational; none affects correctness, integrity, or the removal goal.
