# Audit A — repo/scope/byte-exactness — content-fix pass 2026-10-17

**Auditor:** Audit A (independent; read-only)
**Worktree:** `D:\pk\_wt\ak-grids` — branch `ak-fix-issues-2026-10-17`
**Range audited:** `26c6627..HEAD` (`8a2932a` → `831eb94` → `26c6627`)
**Method:** read-only git (`status/log/show/diff/ls-tree`), read-only node runs, dry-run only (no `--apply`, no state-changing git). Final state capture: 2026-10-17 10:06:32 (+0530). Helper scripts were written only to the session temp dir (`C:\Users\Admin\AppData\Local\Temp\opencode\`), never to the worktree.

## Summary verdict

**PASS WITH CONCERNS**

Every substantive check passes: scope is exactly the mandated 14 files; all 15 edits are byte-exact, surgical, and independently verifiable against both the report and the archive; the apply script is re-run-safe (15/15 SKIP, 0 failures); the guard runs clean in STRICT scope and reports the expected PENDING counts; the structural extension finds exactly the one expected ar-15 grid and nothing in STRICT subjects; the archive is valid and complete; the guard diff is pure additions with existing logic untouched; and the worktree is clean at final capture with the commit order correct.

The concerns are non-defect: (1) a transient zero-byte untracked file `-Context` appeared in the worktree root mid-session (created 10:00:43, gone by 10:06:32, never tracked, cause not reproducible from any command run by this audit — see Discrepancies); (2) cosmetic documentation-labeling nuances in the fix report; (3) deliberately-open items (rnav-15/19 key-flip rulings) that were intentionally not changed. No defect was found in any audited byte.

## Check-by-check table

| # | Check | Command(s) | Result | Verdict |
|---|-------|-----------|--------|---------|
| 1 | Scope | `git diff --stat 26c6627..HEAD`; `git diff --name-status 26c6627..HEAD` | Exactly 14 files: M×10 content (nav-cx3-9, ar-3, ar-16, ar-18, ar-19, ar-25, inst-40, rnav-3, rnav-15, rnav-19) + M `tools/audit/answer-key-guard.mjs` + A `tools/audit/apply-content-fixes-2026-10-17.mjs` + A `tools/audit/answer-key-archive/content-fixes-2026-10-17.json` + A `tools/audit/content-fixes-2026-10-17.md`. Totals 592 insertions / 15 deletions. Nothing else changed or added. | PASS |
| 2 | Byte-exactness | `git diff 26c6627..HEAD -- <each content file>`; `git diff --check`; `--numstat` vs `--ignore-cr-at-eol --numstat`; node before/after presence checks | All 15 edits match report + archive exactly; hunks are surgical (max 4 changed lines in any file; 13 ins / 14 del across the 10 content files); `--check` exits 0 with no whitespace errors; no EOL churn (ignore-cr-at-eol diff identical for all files except ar-25, whose *only* change is the appended CRLF); no encoding damage (valid UTF-8, no BOM, no U+FFFD; `✓` U+2713 intact). Post-state strings verified — see "Detailed evidence" below. | PASS |
| 3 | Re-run safety | `node tools\audit\apply-content-fixes-2026-10-17.mjs` (dry-run, no `--apply`) | `DRY-RUN - 15 edit(s), 0 failure(s)`; 14× `[SKIP: already applied]` + 1× `[SKIP: already ends with newline]` (ar25-final-newline); exit code 0; worktree unchanged after the run. | PASS |
| 4 | Guard | `node tools\audit\answer-key-guard.mjs`; `node tools\audit\answer-key-guard.mjs --check`; `$LASTEXITCODE` | Report: `STRICT (meteorology, radio-navigation, air-navigation): clean`; PENDING air-regulations 99/18 files, instrumentation 67/26, human-performance 1/1. `--check`: exit 0 and prints `Guard OK.` Both match the expected figures exactly. | PASS |
| 5 | Guard extension sanity | `node tools\audit\answer-key-guard.mjs --list \| Select-String -Pattern "structural"` | Exactly **one** structural hit: `public/content/air-regulations/ar-15/notes.html:987  [structural] bare answer grid: header Q1,Q2,Q3,Q4,Q5 + letters C,B,B,C,B` (source table L986–991; letters row L989). Zero structural hits in meteorology / radio-navigation / air-navigation. | PASS |
| 6 | Archive integrity | `node` JSON.parse + per-record presence check | Valid JSON (UTF-8, no BOM); 15 edit records, each with `id`/`file`/`note`/`before`/`after`; 10 distinct files; `ar25-final-newline` has `before = "</html>"`, `after = "</html>\r\n"`. Independently verified all 15: `after` present in the current file and `before` absent (15/15 PASS; the ar-25 `before` is present only as a substring of the appended result, which is expected). | PASS |
| 7 | Clean state | `git status --porcelain`; `git log --oneline -3` | Log: `8a2932a` → `831eb94` → `26c6627`, branch `ak-fix-issues-2026-10-17`, HEAD `8a2932a`. Final porcelain: **empty**. Footnote: a transient zero-byte `-Context` file existed 10:00:43–~10:06 and was removed by an external actor/environment (this audit ran no delete); it never touched tracked content. See Discrepancies. | PASS (final state; transient artifact — see note) |
| 8 | Guard file coherence | `git diff 26c6627..HEAD -- tools/audit/answer-key-guard.mjs`; `--numstat` | Pure additions: **106 insertions, 0 deletions** (5 hunks). Added: header-comment paragraph (structural detection rationale), `cellTexts()` + `structuralGridHits()` functions, per-file `strippedLines`/`hitLines` tracking and merge of structural hits into strict/pending, and the `--list` flag block. No existing line altered — line-scan, `KEY_TEXT`, `GRID_CLASS`, `ALLOWED_TEXT`, `STRICT_DIRS` (meteorology/radio-navigation/air-navigation), pending reporting, and `--check` exit behavior are unchanged. | PASS |

## Detailed evidence

**Check 2 — post-state strings (all verified at the stated lines):**
- `inst-40` L478: `…<td>9</td><td>c</td><td>10</td><td>b</td><td>11</td><td>d</td>…` (Q10 c→b). L648: `…<td>11</td><td>b</td><td>w1</td>…` (Q11 c→b).
- `ar-3` L2142: `<li class="correct-ans">✓ A) Taxiing need not be confined to the taxiways</li>`; L2141 old highlight on C removed. L2165: `<li class="correct-ans">✓ C) Not land because the airport is not available for landing</li>`; L2164 old highlight on A removed. Net `correct-ans` count unchanged: 18 → 18.
- `ar-16` L1778 contains `<strong>Q7 (B) / Q16 (C):</strong>`; the old `Q7 / Q16 (C)` string is absent.
- `ar-19` L1047: `<div class="correct">✓ A) … help the judges …— per textbook answer key</div>`; L1048: B option plain (`<div>B) …</div>`). Net `class="correct"` count unchanged: 10 → 10.
- `ar-18` L1797: `<h2>32. Exam-Prep Quick Cards</h2>`; the old "— Answer Key Highlights" heading is absent.
- `rnav-15` L297 and `rnav-19` L57 both contain "as per the source key"; keyed answers (b)/(c) preserved with both derivations stated.
- `rnav-3`: `<div` 117 / `</div>` 117 (was 117/118); the single removed line is the first of two byte-identical consecutive `</div>`s (old L704; removing either yields identical bytes), watermark block intact.
- `nav-cx3-9` L505 comment now reads "applied per table row"; `<tr>` count 44/44 (was 45/44, the false positive being the literal `<tr>` inside the CSS comment).
- `ar-25`: file now ends `</html>\r\n` (previously no final newline).

**Check 2 — cross-check report ↔ archive:** the report's 12 numbered fix rows map to the archive's 15 records exactly; three rows bundle a two-part move each (`ar3-Q3-highlight-to-A(-2)`, `ar3-Q6-highlight-to-C(-2)`, `ar19-Q1-highlight-to-A(-2)`). Every archive record's `after` string is present and its `before` string absent in the committed files.

**Check 3 — dry-run detail:** statuses were exactly 14× `[SKIP: already applied]` and 1× `[SKIP: already ends with newline]`; the script's write path (`--apply`) and archive dump were never invoked; `git status --porcelain` was empty immediately before and after the run.

**Check 4/5 — guard detail:** STRICT section reports clean; the only structural hit corpus-wide is ar-15 L987 (letters C,B,B,C,B), a real bare grid with no key phrase and no grid class; no structural entries appear under any STRICT subject.

**Check 6 — archive detail:** `generatedAt` 2026-10-17T04:24:13.677Z; `report` points to `tools/audit/content-fixes-2026-10-17.md`; the ar-25 record's parsed `after` value is `</html>` + CRLF.

## Discrepancies found

1. **Transient untracked file `-Context` (environmental, not a commit defect).** At audit start and after the dry-run/guard phase, `git status --porcelain` was empty. A zero-byte file named `-Context` was created in the worktree root at **10:00:43** (observed present at 10:03:42 and in a direct listing, untracked, not ignored). It was **gone by the final capture at 10:06:32**, removed by an external actor/environment — this audit ran no delete command. The creation mechanism could not be reproduced (the session's only `-Context` token was a `Select-String -Context 0,6` probe; a controlled re-run of that command shape did not create the file, and a repeat in a scratch directory also did not). No tracked file was affected, and no other file in the tree was created or modified in the session window. **Action:** none required now (tree is clean); if such a file ever reappears before the report is committed, delete it (`Remove-Item -LiteralPath '.\-Context'`) rather than using `git add -A`.
2. **Cosmetic — report table count vs edits.** `content-fixes-2026-10-17.md` says "15 edits in 10 content files" but numbers 12 table rows; the three two-part moves (ar-3 Q3, ar-3 Q6, ar-19 Q1) make 12 rows = 15 archive records. Internally consistent; no change needed.
3. **Cosmetic — rnav-3 line label.** The report/archive cite "L705" for the removed `</div>`; the byte-removed line is the first of two byte-identical consecutive `</div>`s (old L704). The outcome is byte-for-byte identical either way (117/117, DOM unchanged); label only.
4. **Cosmetic — report stat sentence.** The report's "exactly 10 content files + guard; plus the new tool + archive" omits the report file itself (14 files total). No impact.

## Residual risks / notes

- **Open rulings (deliberate, outside this pass):** rnav-15 Q3 and rnav-19 Q3 key-flips remain for the Captain; the pages now state both derivations and preserve the source key. This is a content-fidelity question for Audit B, not a byte-exactness defect.
- **Structural detector is heuristic:** shape-based detection (3+ `Q<n>`/sequential `1..N` header cells + same-count A–D letter row, 15-line dedup window). Mandate-level sanity was verified (exactly one corpus hit, none in STRICT, ar-15 hit real); no synthetic positive/negative tests were run because that would require writing files into a read-only worktree.
- **Guard exit behavior unchanged by design:** report mode exits 0 even with PENDING hits; `--check` gates on STRICT only and exits 0 here because STRICT is clean.
- **Encoding:** all ten content files and the archive are valid UTF-8 with no BOM and no replacement characters; the `✓`, `—`, `×`, `√` characters are intact.
- **Verification limits:** no browser rendering or visual checks were performed (byte/DOM-independent checks only); no `--apply` run; no commit or push.
- **Final state:** branch `ak-fix-issues-2026-10-17`, HEAD `8a2932a`, `git status --porcelain` empty, range contains exactly the two audited commits.

---

## Audit A addendum — commit f2decc8

**Verdict: PASS** — all six checks clean; no discrepancies found. Read-only verification (git + dry-run node only), 2026-10-17, branch `ak-fix-issues-2026-10-17`, range `8a2932a..f2decc8`.

| # | Check | Command | Result | Verdict |
|---|-------|---------|--------|---------|
| 1 | Scope | `git diff --stat 8a2932a..f2decc8`; `git diff --name-status 8a2932a..f2decc8` | Exactly the 7 mandated files: M rnav-15, M rnav-19, M archive JSON, M apply tool, M fix report, A `answer-key-fix-audit-A-2026-10-17.md`, A `answer-key-fix-audit-B-2026-10-17.md` (165 ins / 10 del). Nothing else. | PASS |
| 2 | Byte-exactness (content) | `git diff 8a2932a..f2decc8 -- <both rnav files>`; `git diff --check 8a2932a..f2decc8`; `--numstat` vs `--ignore-cr-at-eol --numstat` | Exactly one changed line per file — the Q3 answer div, matching the intended final text (rnav-15: `…12.36 &asymp; 104.4 NM &rarr; nearest option (b) 104.3 NM…`; rnav-19: `…corresponds to the 325 ft / 8000 ft variant: 1.23×(18+89) &asymp; 132 NM &rarr; nearest option (c) 134 NM…`). No other hunks; numstat 1/1 each; ignore-cr identical (no EOL churn); `--check` exit 0; valid UTF-8, no BOM/U+FFFD. | PASS |
| 3 | Re-run safety | `node tools\audit\apply-content-fixes-2026-10-17.mjs` (dry-run) | `DRY-RUN - 17 edit(s), 0 failure(s)`; 16× `[SKIP: already applied]` + 1× `[SKIP: already ends with newline]` (ar25); exit 0; no writes. | PASS |
| 4 | Archive | node JSON.parse + per-record presence checks | 17 records, ids unique; `rnav15-Q3-note`/`rnav19-Q3-note` carry their final text as `after` (incl. `&asymp; 104.4 NM` / `&asymp; 132 NM`, and no false `=134 NM` equality); `rnav15-Q3-approx`/`rnav19-Q3-variant` present; all 4 rnav records `after` present / `before` absent in current files; all 17 records independently verified (17/17). | PASS |
| 5 | Guard | `node tools\audit\answer-key-guard.mjs --check`; `--list \| Select-String "structural"` | `--check` exit 0 + `Guard OK.` (STRICT clean; PENDING unchanged 99/18, 67/26, 1/1). Structural list still exactly **one** hit: `ar-15/notes.html:987` (C,B,B,C,B). | PASS |
| 6 | State | `git status --porcelain`; `git log --oneline -2` | Porcelain empty; log `f2decc8` on `8a2932a`. | PASS |

**Discrepancies:** none. Supporting review: the apply-tool diff updates records 11–12 `replace` to the final text and adds records 16–17 (coherent with the archive and dry-run), and the fix-report update documents the follow-up; both added audit reports are valid UTF-8 (no BOM/replacement chars) and end with a newline.
