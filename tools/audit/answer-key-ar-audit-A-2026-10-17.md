# Audit A — Repo/Scope audit: air-regulations answer-key removal pass

- **Repo:** `D:\pk\_wt\ak-grids` (branch `ak-fix-issues-2026-10-17`)
- **Audited commit:** `9e6e666c0d2cf167128dd7ba2f364d0a59f2e502` — "Answer keys: air-regulations removal pass (12 chapters + ar-19)"
- **Parent:** `977303938350249d80d4d40a535b332b753944df`
- **Worktree HEAD at audit time:** `e13356a5991e6cc94813c94d6868b6949c8213b5` (two later commits: `01c06c5` instrumentation pass, `e13356a` reports)
- **Scope:** exactly this commit's changes to `public/content/air-regulations/*/notes.html` plus the two added files (`tools/audit/remove-answer-key-ar.mjs`, `tools/audit/answer-key-archive/ar-removed-blocks-2026-10-17.json`)
- **Auditor:** independent Repo/Scope audit agent (did not write the change); adversarial verification
- **Constraints observed:** READ-ONLY on `D:\pk\_wt\ak-grids` (no writes, no staging/commits); `D:\pk\ghost-aviator` untouched; all audit scripts under `C:\Users\Admin\AppData\Local\Temp\opencode\ar-audit\`
- **Environment:** Windows / PowerShell, Node v24.19.0, git 2.52.0.windows.1, `core.autocrlf=true`, no `.gitattributes`

> Bottom line: **every checklist item passes after independent reproduction; coverage 289/289 reproduced; one cosmetic MINOR defect (double blank in ar-11).** Details and the one important representation caveat (archive stored in CRLF form vs LF git blobs) below.

---

## Audit scripts (all in `C:\Users\Admin\AppData\Local\Temp\opencode\ar-audit\`)

| Script | Purpose |
|---|---|
| `archive-audit2.mjs` | Archive JSON vs parent blob + current commit; full reconstruction |
| `replay-parent-guard.mjs` + `git archive`/`tar` mirrors | Reproduce guard BEFORE counts on parent content |
| `residual-scan.mjs` | Own regex + own structural grid detector over all 25 notes chapters |
| `extras-audit.mjs` | Missing notes.html, anchors, ar-23 renumber, table cells, tag balance, double blanks, byte hygiene |
| `coverage-check.mjs` | Independent 289-entry inline-coverage check |
| `ar11-dup-check.mjs`, `ar11-bank-check.mjs` | ar-11 duplicate-Q bank disambiguation |
| `final-checks.mjs`, `comment-check.mjs` | Mojibake, comment state, guard-set equality |
| `make-crlf-mirror.mjs` + dry-run | Reproduce builder dry-run against a CRLF copy of the parent tree |

Reproduction pattern for parent state (no repo writes):
`git -C D:\pk\_wt\ak-grids archive --format=tar 9773039 <paths> -o parent.tar` → `tar -xf parent.tar -C <temp mirror>` → run the unmodified guard script from the mirror.

---

## Checklist results

### 1. Commit scope — **PASS**

```
> git diff --name-status 9773039 9e6e666
M public/content/air-regulations/ar-11/notes.html
M public/content/air-regulations/ar-14/notes.html
M public/content/air-regulations/ar-15/notes.html
M public/content/air-regulations/ar-17/notes.html
M public/content/air-regulations/ar-19/notes.html
M public/content/air-regulations/ar-2/notes.html
M public/content/air-regulations/ar-20/notes.html
M public/content/air-regulations/ar-21/notes.html
M public/content/air-regulations/ar-22/notes.html
M public/content/air-regulations/ar-23/notes.html
M public/content/air-regulations/ar-26/notes.html
M public/content/air-regulations/ar-6/notes.html
M public/content/air-regulations/ar-7/notes.html
A tools/audit/answer-key-archive/ar-removed-blocks-2026-10-17.json
A tools/audit/remove-answer-key-ar.mjs
```

15 files total: 13 content files (exactly the claimed set ar-2, ar-6, ar-7, ar-11, ar-14, ar-15, ar-17, ar-19, ar-20, ar-21, ar-22, ar-23, ar-26) + the 2 expected tool files. **No other content directory touched** (meteorology, radio-navigation, air-navigation, instrumentation, human-performance all absent from the diff).

### 2. Working tree identical to the commit for these files — **PASS (with NOTE)**

```
> git diff 9e6e666 -- public/content/air-regulations      # empty, exit 0
> git status --porcelain                                   # (first run) empty
```

- `git diff --name-only 9e6e666 HEAD -- public/content/air-regulations` is also empty: the two later commits on the branch changed only instrumentation + reports; the scoped content at the worktree tip is byte-for-byte the 9e6e666 state (EOL-normalized; see item 6).
- **NOTE:** during the audit an untracked file appeared in the worktree: `?? tools/audit/fix-seams-2026-10-17.mjs` (created 11:23–11:24 local, after my first `git status`). It is not part of 9e6e666, not mine, contains no changes to scoped files, and its content references the ar-11 double-blank MINOR (item 7) as a planned follow-up. It does not affect this audit. **Also:** worktree HEAD is `e13356a`, not the audited `9e6e666` — this matters only for guard count context (item 4).

### 3. Archive integrity vs parent + current — **PASS (with explicit EOL note)**

Archive JSON: `pass=air-regulations`, `date=2026-10-17`, `updatedAt=2026-10-17T05:27:16.320Z` (commit time 05:30:44 UTC — consistent), 13 blocks, 11 rewords.

**Line endings found (stated as required):**
- Parent git blobs (`git show 9773039:...`) are **LF-only** for all 13 files (0 CRLF, 0 lone CR in every blob).
- The on-disk worktree is **CRLF** (`core.autocrlf=true`, no `.gitattributes`), so the checkout representation of the parent is also CRLF.
- The archive `removed` strings are **CRLF** — i.e. verbatim to the worktree bytes the builder read.

**Verification (my script `archive-audit2.mjs`):**
- For every one of the 13 blocks: `removed` == parent slice `lines[start..end]` joined as CRLF (exact byte equality, including the trailing blank line); the slice is content-identical to the LF blob slice modulo EOL.
- For every block, my computed `sha1` of the CRLF parent slice == archive `sha1`, and `byteLength(removed)` == archive `bytes` — all 13 match. (E.g. ar-2: `c3d57a01…4308`, 676 bytes; ar-11 L4150-4221: `e7936e0b…d692`, 4747 bytes.)
- For every one of the 11 rewords: `oldLine` == parent line at that line number; `newLine` == **current** line at the post-cut position (ar-11 L2922→post-cut L2917, ar-23 L1691→post-cut L1669 — later cuts shift earlier line numbers); the recorded `transforms` replay exactly.
- **Strongest check — reconstruction:** applying the archive's cuts + rewords (descending order) to each parent file reproduces the current file **byte-exactly** (in LF space) for all 13 files. Conclusion: the diff equals the archive exactly; nothing else changed.
- Totals: 13 blocks / 260 lines / **15,851 bytes** == claim; 11 rewords == claim; 13 distinct edited files == claim.
- Block distribution: ar-11 has **2** blocks; ar-26 has **0** blocks (reword-only) — so "13 blocks across 12 files / 13 files edited incl. ar-26" both hold (see INFO-3).

Caveat (INFO-1): a verifier naively comparing the raw `git show` (LF) blob bytes to the archive strings will see mismatches and different sha1s; the archive is deliberately in the CRLF (working-tree) form, and the 15,851-byte figure is the CRLF count.

### 4. Guard — **PASS**

From the worktree:

```
> node tools/audit/answer-key-guard.mjs --check      # exit code 0
STRICT (meteorology, radio-navigation, air-navigation): clean - no answer-key text or grid classes.

> node tools/audit/answer-key-guard.mjs --list
  air-regulations: 22 occurrence(s) in 9 file(s)
```

The 22 listed air-regulations lines are exactly the claimed set — per-file counts computed from the output:
`ar-3:3, ar-5:1, ar-6:1, ar-11:2, ar-12:4, ar-13:1, ar-16:7, ar-19:2, ar-26:1` = **22 in 9 files**.

BEFORE/AFTER/controls (guard replayed unmodified against byte-real parent/commit content in temp mirrors):
- Parent `9773039`: air-regulations **99/18**, instrumentation **67/26**, human-performance **1/1** (matches all BEFORE claims).
- At `9e6e666`: air-regulations **22/9**, instrumentation **67/26**, human-performance **1/1** (controls unchanged by this commit).
- Tip/worktree: air-regulations **22/9** (line set identical to 9e6e666 — verified set equality), human-performance 1/1, instrumentation **21/2** because of the *later* commit `01c06c5` (instrumentation removal pass) — see INFO-2. STRICT dirs are clean on the real worktree where all directories are present (the temp mirror for parent lacks STRICT dirs, so its "clean" line is vacuous there; but this commit does not touch STRICT dirs, so "remain clean" is guaranteed by diff scope).

Classification of each of the 22 remaining lines (all read in full):

| Line | Class |
|---|---|
| ar-3:516 TOC "Practice Questions & Answer Key" | blocker-material (chapter keeps key table at L2247) |
| ar-3:2113 "30. Practice Questions & Answer Key" header | blocker-material |
| ar-3:2247 "📋 ANSWER KEY (All 106 Questions from the PDF)" | blocker-material |
| ar-5:1561 "…Correct DGCA answer per answer key = B (2000ft)." | deliberate source-key annotation |
| ar-6:1272 "…per the answer key provided in the document, A is correct" | deliberate annotation (kept by design) |
| ar-11:3664 "Correct answers from the official answer key are shown in green." | deliberate annotation (kept by design) |
| ar-11:4004 "CORRECT (per Answer Key)" inline option tag | deliberate annotation (kept by design) |
| ar-12:342 / 1968 / 2061 / 2064 (bank title, h2, "Complete Answer Key", caption) | blocker-material |
| ar-13:1995 "…the answer key says A: 3h 06min…" | deliberate source-key annotation |
| ar-16:375 `.answer-key td.c` CSS | blocker (CSS class) |
| ar-16:444 / 1554 / 1556 / 1756 / 1757 / 1766 (TOC, h2, lead, h3, 2 × `class="answer-key"` tables) | blocker-material |
| ar-19:1047 "— per textbook answer key" | deliberate annotation (kept by design) |
| ar-19:1052 "Per the answer key supplied in the source material…" | deliberate annotation (kept by design) |
| ar-26:814 "official answer key marks (B) as correct…" | deliberate annotation (kept by design) |

### 5. Residual scan with my own pattern — **PASS**

My pattern (own regex): `/answer[- ]?key|answerkey|answer grid|ak-(grid|cell|num|ans)|key[ -]?grid|quick[ -]?answer|ans-key|key-cell|keytable|krow-[qa]|keyfix|answer-key-grid|answer-grid|answer-cell/i`, comment-aware, over all **25** chapters with `notes.html`.

- 23 raw hits = the 22 guard lines + 1 hit **inside an HTML comment** (`ar-12:2060 <!-- Answer Key Table -->`, correctly ignored by the guard's comment-stripping).
- In the 13 edited files, the only hits are exactly the allowed ones: `ar-6:1272`, `ar-11:3664`, `ar-11:4004`, `ar-19:1047`, `ar-19:1052`, `ar-26:814`. **No unexpected hit in any edited file.**
- All remaining hits are in non-edited files (ar-3, ar-5, ar-12, ar-13, ar-16), classified in item 4.
- My independent structural bare-grid detector (header row of `Qn`/sequential numbers ≥3 cells followed by a same-count letter row) found exactly 2 candidates, both in ar-16 (blocker tables L1757-1765, L1766-1774); **zero in the 13 edited files**.
- Line-level cross-check of my non-comment hits vs the guard's lines at 9e6e666: exact match.
- Additional targeted scans of edited files: `<td>A-D</td>` letter cells and numeric cells remaining are legitimate definition lists (`a/b/c/d`) and regulation tables (visibility, weights, numbers) — inspected, no residual grids; key-class tokens (`ak-*`, `answer-key*`, `key-grid`, …) count = **0** in every edited file.

### 6. Byte hygiene + line-count deltas — **PASS**

For **all 13** edited files (on-disk bytes): valid UTF-8 (decode→re-encode round-trip, zero U+FFFD), **BOM-less**, **pure CRLF** (lone LF = 0, lone CR = 0), and on-disk content == commit blob converted to CRLF (no hidden worktree edits).

Line-count deltas (parent lines − current lines) must equal lines removed by cuts (ar-23 renumber replaces within a line, no delta):

| file | parent→current lines | delta | cut lines | status |
|---|---|---|---|---|
| ar-2 | 1025→1012 | 13 | 13 | ✓ |
| ar-6 | 1492→1485 | 7 | 7 | ✓ |
| ar-7 | 1896→1867 | 29 | 29 | ✓ |
| ar-11 | 4303→4226 | 77 | 72+5=77 | ✓ |
| ar-14 | 2195→2177 | 18 | 18 | ✓ |
| ar-15 | 1078→1072 | 6 | 6 | ✓ |
| ar-17 | 2276→2248 | 28 | 28 | ✓ |
| ar-19 | 1233→1222 | 11 | 11 | ✓ |
| ar-20 | 1345→1329 | 16 | 16 | ✓ |
| ar-21 | 1301→1282 | 19 | 19 | ✓ |
| ar-22 | 1364→1350 | 14 | 14 | ✓ |
| ar-23 | 1743→1721 | 22 | 22 | ✓ (incl. 10.5→10.4 same-line renumber) |
| ar-26 | 985→985 | 0 | 0 | ✓ (reword only) |

(Line counts are LF-blob counts; the on-disk CRLF files have the same line counts.)

### 7. Tag balance + blank lines at seams — **PASS, one MINOR**

- `div`/`table`/`section`/`style` open vs close counts: for every edited file, parent net = current net = **0 drift** (all four tags balanced in both states).
- Double blank lines: parent 3 → current 4 in **ar-11** only; the new pair is at **current ar-11 lines 741–742** — the seam of the removed CSS chunk (parent had blank L741, CSS L742–746, blank L747; removing the CSS collapses two blanks into adjacent ones). All other files: double-blank counts unchanged. **MINOR (cosmetic)** — see Defects.
- Cut seams otherwise clean: e.g. ar-2 L982 blank → L983 footer; ar-7 L1829 blank → L1830 next comment; ar-21 L1238 blank → L1239 FINAL WRAP-UP comment (all correctly separated).

### 8. Anything else unexpected — **PASS (notes only)**

- **No mojibake:** zero U+FFFD; the `Ã…`/`â€` sequence counts are unchanged parent→current in every edited file. The mojibake seen in the builder log tail (e.g. `A[U+FFFD] Mnemonics`) is console-encoding noise only — the actual archive/file text contains proper `·` (U+00B7) and `–` (U+2013); my dry-run reproduction printed them correctly.
- **Comments:** no unterminated HTML comments in any edited file; comment-region counts dropped by exactly the removed comment blocks (ar-7, ar-11, ar-17, ar-21 each −1); stray literal `-->` sequences in prose are unchanged.
- **Anchors:** no **new** orphan `href="#…"` targets introduced in any edited file (removed blocks contained no referenced ids).
- **ar-23 renumber:** current file contains exactly one `10.4` (the renumbered "10.4 Final Exam-Day Cheat Card"); `10.5` count 0; no stale cross-references.
- **Builder dry-run reproduction:** running the committed `remove-answer-key-ar.mjs` (dry-run, no `--apply`) against a CRLF copy of the parent tree (in temp): exit 0, **0 FAIL lines**, output ends `TOTAL removed: 15851 bytes across 13 blocks` / `Dry run complete - no files written.` — reproduces the claimed builder dry-run byte-for-byte in substance.
- **ar-11 duplicate Q-numbers (adversarial deep-dive):** ar-11 contains two MCQ banks (`Q1..Q60` "Multiple Choice Questions — Visual Aids for Navigation" and `Q1..Q53` "Official Question Bank — Chapter 11 MCQs"). 33 of the duplicated Q-numbers have different letters between the banks. The removed official key (adjacent to the official bank) matches the **official bank exactly 53/53 single-letter**, and matches the practice bank only 20/53. So the removal is internally consistent; recorded here to prevent future mis-verification.

---

## Coverage claim (289/289) — **PASS, independently reproduced**

Not in the numbered checklist but claimed, so verified: for each removed block I extracted `(question, letter)` pairs with my own parsers and compared against inline answers in the same page at 9e6e666:

| file | removed entries | inline matches |
|---|---|---|
| ar-2 | 15 | 15/15 |
| ar-6 | 10 | 10/10 |
| ar-7 | 12 | 12/12 |
| ar-11 | 53 | 53/53 (exact, against the correct official bank) |
| ar-14 | 25 | 25/25 |
| ar-15 | 5 | 5/5 |
| ar-17 | 109 | 109/109 |
| ar-19 | 10 | 10/10 |
| ar-20 | 14 | 14/14 |
| ar-21 | 10 | 10/10 |
| ar-22 | 5 | 5/5 |
| ar-23 | 21 | 21/21 |
| **total** | **289** | **289/289** |

(E.g. ar-2 inline `<li class="correct"><span class="opt">B</span>`; ar-17 109 `class="correct"` options; ar-19 `✓ A)` divs; ar-23 `✓ Correct Answer: <strong>(B)</strong>`; ar-20 `.answer` lines.) The builder's coverage-gate tool itself is not part of the commit, so its exact implementation could not be re-run — but the claimed outcome is reproduced with an independent implementation.

---

## Defects

**SEVERE:** none.

**MAJOR:** none.

**MINOR:**
1. `public/content/air-regulations/ar-11/notes.html` **L741–L742**: a new double blank line was introduced at the CSS-cut seam (parent had a blank before and after the removed 5-line CSS chunk). Cosmetic only; an untracked follow-up script (`tools/audit/fix-seams-2026-10-17.mjs`, not mine, not committed) already targets this exact line. Fix suggestion: delete one of the two blank lines (L742).

**INFO:**
1. **EOL representation of the archive.** Parent git blobs are LF (autocrlf=true, no .gitattributes); the archive stores the CRLF worktree form (`removed`, `sha1`, `bytes` all over CRLF text; the 15,851-byte total is the CRLF count). Content is exactly equal modulo EOL, and reconstruction is exact, but any future verifier comparing raw `git show` bytes to the archive must normalize EOL or it will see false mismatches.
2. **Guard controls are commit-bound.** At the audited commit, instrumentation was 67/26 (unchanged); at the branch tip the guard reports instrumentation 21/2 due to the later `01c06c5` instrumentation pass. The commit's claim is correct for its own boundary; don't re-verify against the tip without accounting for that commit. air-regulations is identical at both.
3. **Claim wording nuance.** "13 key blocks" = 13 blocks spread over 12 files (ar-11 has two cut blocks); "13 content files edited" includes ar-26, which has zero blocks (reword only). Both numbers are true but measure different things.
4. **Stale comment in a blocker chapter:** `ar-12:2060 <!-- Answer Key Table -->` remains (ar-12 is an untouched blocker; the guard strips comments, so it is not a guard hit). Pre-existing, out of scope.
5. **ar-11 dual question banks** with conflicting letters for 33 duplicated Q-numbers (see item 8). Not caused by this commit; matters only for coverage re-verification.
6. The builder's dry-run log and apply log under `_pk-docs\` are claims; I reproduced the dry-run and reconstructed the apply result from the archive, so their substance is confirmed. The apply script itself cannot be re-run in dry-run at the tip (its coordinates reference the pre-apply tree); this is by design and does not affect the audit.

---

## Overall verdict: **PASS**

All eight checklist items pass after independent reproduction: the commit touches exactly the expected 15 files (13 air-regulations notes + 2 tools files), the working tree for those files is byte-identical to the commit (modulo the repo-wide `autocrlf=true` LF↔CRLF convention), and the archive is self-consistent and complete — all 13 blocks match the parent slices in the CRLF checkout representation (sha1 and byte counts exact, content exact modulo EOL), all 11 rewords match parent/current lines, and parent + archive edits reconstruct all 13 current files byte-exactly, so nothing was removed beyond the archive. The guard reproduces 99/18 → 22/9 for air-regulations with exactly the claimed remaining lines (all classified as blocker-material or deliberate source-key annotations), STRICT dirs clean, and coverage is 289/289 by an independent parser (including an exact 53/53 disambiguation against the correct ar-11 question bank). Byte hygiene (UTF-8, BOM-less, pure CRLF) and tag balance (zero drift) hold for all edited files, line-count deltas equal the cuts, and the builder's dry-run reproduces. The only substantive finding is one cosmetic MINOR double blank at ar-11 L741–742; plus several INFO-level notes (notably the archive's CRLF representation and the tip-vs-commit guard context) that do not undermine the pass.
