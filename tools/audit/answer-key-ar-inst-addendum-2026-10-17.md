# Addendum audit — seam fix + audit records (17 Oct 2026)

- **Repo:** `D:\pk\_wt\ak-grids` (branch checked out at `5de0cbc`; read-only audit — nothing in the repo was modified, staged, or committed)
- **Scope:** post-audit commits `b80841f` (seam fixes) and `5de0cbc` (audit records) after the rebase onto main `d9bab74`, plus rebase-integrity checks
- **Method:** own commands from the worktree; three throw-away Node scripts under `C:\Users\Admin\AppData\Local\Temp\opencode\` (`ar-inst-bytes.mjs`, `eol-check.mjs`, `archive-sums.mjs`); no writes inside the repo
- **Audit record sources compared against:** `C:\Users\Admin\Documents\Default Project\_pk-audit\{ar,inst}-audit-{A,B}-2026-10-17.md`
- **Chain (parents):** `5de0cbc → b80841f → b7b1bb0 → d3a8d8a → 94708cb → d9bab74 → 9773039` (verified via `git log --format="%h %p %s"`)

Result summary: **A PASS · B PASS · C PASS (one briefing-expectation mismatch, no repo defect) · D PASS** — 0 SEVERE, 0 MAJOR, 0 MINOR findings in the two audited commits; 3 INFO items recorded in §E.

---

## A) Seam-fix commit `b80841f` (vs parent `b7b1bb0`) — PASS

### A1. Diff scope and hunks

`git diff --stat b7b1bb0 b80841f`:

```
 public/content/air-regulations/ar-11/notes.html   |  1 -
 public/content/instrumentation/inst-10/notes.html |  1 +
 public/content/instrumentation/inst-11/notes.html |  1 +
 public/content/instrumentation/inst-6/notes.html  |  1 +
 public/content/instrumentation/inst-7/notes.html  |  1 +
 public/content/instrumentation/inst-8/notes.html  |  1 +
 public/content/instrumentation/inst-9/notes.html  |  1 +
 tools/audit/fix-seams-2026-10-17.mjs              | 98 +++++++++++++++++++++++
 8 files changed, 104 insertions(+), 1 deletion(-)
```

`git diff --numstat b7b1bb0 b80841f`:

```
0       1       public/content/air-regulations/ar-11/notes.html
1       0       public/content/instrumentation/inst-10/notes.html
1       0       public/content/instrumentation/inst-11/notes.html
1       0       public/content/instrumentation/inst-6/notes.html
1       0       public/content/instrumentation/inst-7/notes.html
1       0       public/content/instrumentation/inst-8/notes.html
1       0       public/content/instrumentation/inst-9/notes.html
98      0       tools/audit/fix-seams-2026-10-17.mjs
```

Exactly 8 files; ar-11 −1 line; inst-6..11 +1 line each; the new tool file (+98 lines). Inspection of the complete `git diff` shows **only** these hunks and nothing else:

- **ar-11** — removes exactly ONE blank line between the `.note-tag` CSS rule and the `/* ── QUICK FACTS ── */` comment (was: two consecutive blank lines; now: one).
- **inst-6..11** — each adds exactly ONE blank line between the closing `</div>` and `<div class="watermark">Ghost Aviator</div>`.
- **tools/audit/fix-seams-2026-10-17.mjs** — new 98-line dry-run-by-default fix script targeting exactly these seven edits (anchor-validated, `--apply` required to write).

Confirmed against the actual file bytes (worktree == `b80841f` for these paths: `git diff b80841f HEAD -- public/content` is empty, exit 0):

```
ar-11 L740: ".note-tag { … }"
ar-11 L741: ""
ar-11 L742: "/* ── QUICK FACTS ── */"

inst-6  L342 "</div>"  L343 ""  L344 "<div class=\"watermark\">Ghost Aviator</div>"
inst-7  L489 "</div>"  L490 ""  L491 watermark
inst-8  L315 "</div>"  L316 ""  L317 watermark
inst-9  L419 "</div>"  L420 ""  L421 watermark
inst-10 L479 "</div>"  L480 ""  L481 watermark
inst-11 L498 "</div>"  L499 ""  L500 watermark
```

### A2. Byte hygiene of the 7 HTML files (UTF-8 / BOM / EOL)

| file | bytes | valid UTF-8 | BOM | CRLF | lone LF | lone CR | last byte |
|---|---|---|---|---|---|---|---|
| ar-11/notes.html | 230,063 | yes | no | 4224 | 0 | 0 | 0x0a |
| inst-6/notes.html | 33,502 | yes | no | 367 | 0 | 0 | 0x0a |
| inst-7/notes.html | 41,063 | yes | no | 514 | 0 | 0 | 0x0a |
| inst-8/notes.html | 28,216 | yes | no | 340 | 0 | 0 | 0x0a |
| inst-9/notes.html | 38,415 | yes | no | 444 | 0 | 0 | 0x0a |
| inst-10/notes.html | 44,640 | yes | no | 504 | 0 | 0 | 0x0a |
| inst-11/notes.html | 44,956 | yes | no | 523 | 0 | 0 | 0x0a |

All clean. `git ls-files --eol` for these seven files: `i/lf  w/crlf  attr/` — consistent with the repo-wide `core.autocrlf=true` convention (no `.gitattributes`). The new `fix-seams-2026-10-17.mjs` contains no repo writes besides its guarded `--apply` path.

### A verdict: **PASS** — the commit changes exactly the seven intended seams (+ the fix tool), nothing else.

---

## B) Audit-records commit `5de0cbc` (vs parent `b80841f`) — PASS

### B1. Commit shape

`git diff --stat b80841f 5de0cbc`:

```
 tools/audit/answer-key-ar-audit-A-2026-10-17.md   | 224 +++++++++++++++++
 tools/audit/answer-key-ar-audit-B-2026-10-17.md   | 161 ++++++++++++
 tools/audit/answer-key-inst-audit-A-2026-10-17.md | 225 +++++++++++++++++
 tools/audit/answer-key-inst-audit-B-2026-10-17.md | 288 ++++++++++++++++++++++
 tools/audit/answer-key-removal-ar-2026-10-17.md   |   7 +-
 tools/audit/answer-key-removal-inst-2026-10-17.md |   7 +-
 6 files changed, 910 insertions(+), 2 deletions(-)
```

`--name-status`: 4× `A` (new audit reports) + 2× `M` (removal reports); `--numstat`: 224/0, 161/0, 225/0, 288/0, 6/1, 6/1. Exactly the expected 6 files.

### B2. sha256 — new files vs `_pk-audit` sources

The naive **working-tree** sha256 comparison mismatches, and the cause is a single, fully-measured representation difference: the `_pk-audit` sources are pure **LF**, while the repo working tree is pure **CRLF** (`core.autocrlf=true` checkout translation; +1 byte per line = the observed deltas 224/161/225/288). Comparing the **committed git blobs** (the actual repository artifacts) gives byte-identical equality with the sources for all four files:

| file | blob@5de0cbc sha256 | blob == source? | worktree sha256 | worktree EOL / bytes |
|---|---|---|---|---|
| answer-key-ar-audit-A-2026-10-17.md | `fbb692dfbf52cc89c50889859e0587384aa24094344ffa76e7238f2524aad450` (19,721 B) | **YES** | `c8b5a695…52a3c5f9` | CRLF / 19,945 B |
| answer-key-ar-audit-B-2026-10-17.md | `2efe1b8056f1bdd3f0844e52c6646e7ed900bc8507abfdc9fcaed7a234cdb82b` (15,473 B) | **YES** | `040b07a5…9a9d61b2` | CRLF / 15,634 B |
| answer-key-inst-audit-A-2026-10-17.md | `8630258263604afb4c591d048b8edc5b5ffec74deff462554571102cc14ead4d` (15,316 B) | **YES** | `835e7783…2418fd08` | CRLF / 15,541 B |
| answer-key-inst-audit-B-2026-10-17.md | `99a2efd44e66b68dfa3ccf4567a53a81e1449ecee5baf015343f757666e6be1e` (18,139 B) | **YES** | `e7fefb17…a6f1ea7` | CRLF / 18,427 B |

(Source files: `loneLF=224/161/225/288`, `crlf=0`; worktree files: `crlf=224/161/225/288`, `loneLF=0`. Worktree-vs-source content is equal modulo EOL for all four; blob-vs-source is byte-equal without any normalization.) This exact LF-blob/CRLF-checkout nuance is already documented in the audit reports themselves (ar-audit-A INFO-1, inst-audit-A INFO-1/3, inst-audit-B INFO-4).

### B3. Modified removal reports — diffs are exactly the placeholder replacement

Each of the two modified files has **one hunk, 6 insertions / 1 deletion**, replacing the placeholder paragraph

> "See `tools/audit/…-audit-A…` and `…-audit-B…` — to be appended/committed when the audit agents return."

with the two-bullet outcome summary + a "Post-audit follow-up" line. No other edits anywhere in either file. Spot-check of summary vs actual audit-report claims (all verified by reading the four reports):

| Summary claim | Audit evidence | Match |
|---|---|---|
| ar 289/289 coverage | ar-A coverage table: 289/289 independently reproduced; ar-B §2: 289/289 POST and PRE | ✓ |
| inst 223/223 coverage | inst-A coverage: 167 + 56 = 223 exact; inst-B §1.3: 223, zero mismatches | ✓ |
| guard 99/18 → 22/9 (ar), 67/26 → 21/2 (inst, inst-34 ×3 + inst-40 ×18) | ar-A §4; inst-A §4; re-confirmed live in §C | ✓ |
| 15,851 / 10,528 bytes; 13 / 25 blocks; 260 / 193 block lines; 11 / 19 rewords | recomputed from committed archive JSON: ar = 13 blocks / 260 lines / 15,851 B / 11 rewords; inst = 25 blocks / 193 lines / 10,528 B / 19 rewords | ✓ |
| MINOR: ar-11 double blank; MINOR: inst-6..11 watermark seam; both "fixed in the post-audit seam-fix commit" | ar-A Defects MINOR 1 + ar-B MINOR 1; inst-A Defects MINOR + inst-B MINOR-1; fixes verified in §A | ✓ |
| ar: commit scope 13 files + 2 tools; worktree == audited commit; byte-exact reconstruction; ar-19 Q1 history (4c21ef1 → 8a2ca03); zero dangling refs; rewords 11/11; blockers ar-3/12/16 byte-identical | ar-A §1/§2/§3/§5/§6; ar-B §2/§3/§4/§6 | ✓ |
| inst: 24 files + 2 tools; numstat arithmetic; inst-34/40 blob-identical; archive byte-exact; 12 letter-seq hits innocuous; byte hygiene + line deltas; whole-diff reconstruction; 167 Format A + 56 inst-31 (1–40/1–16); rewords 19/19; inst-35 5-of-6 INFO | inst-A §1–§6, coverage; inst-B §1–§7, INFO-1 | ✓ |

### B verdict: **PASS** — four new audit files are byte-identical to the `_pk-audit` sources at the blob level (worktree differs only by the repo-wide CRLF checkout convention), and the two removal-report edits are exactly the placeholder→summary replacement, with every quoted number matching the underlying audit reports.

---

## C) Guard + coverage — PASS (one briefing-expectation mismatch, no repo defect)

### C1. Guard

`node tools/audit/answer-key-guard.mjs --check` → **exit 0**, output:

```
STRICT (meteorology, radio-navigation, air-navigation): clean - no answer-key text or grid classes.

PENDING (report-only, other subjects - each awaits its own pass):
  air-regulations: 22 occurrence(s) in 9 file(s)
  instrumentation: 21 occurrence(s) in 2 file(s)
  human-performance: 1 occurrence(s) in 1 file(s)

Guard OK.
```

Exactly as expected: STRICT clean; ar 22/9; inst 21/2; hp 1/1.

### C2. Optional dry-run sanity — behavior differs from the briefing text, but matches documented design

`node tools/audit/remove-answer-key-ar.mjs` (no `--apply`): **47 validation failures, exit 1**, tail `"47 validation failure(s) - nothing written."` — e.g. `!! FAIL ar-2 L983: expectStart not found: Consolidated Answer Key`, `!! FAIL ar-11 L742: expectStart not found: ANSWER KEY TABLE`.

`node tools/audit/remove-answer-key-inst.mjs` (no `--apply`): **84 validation failures, exit 1**, tail `"84 validation failure(s) - nothing written."` — e.g. `!! FAIL inst-6 L343: expectStart not found: <h3>Answer Key</h3>`.

The addendum briefing expected "all edits SKIP"; the scripts are instead **fail-closed**: at the tip every anchor is already gone, so each edit reports a validation failure and nothing is written (double-apply is impossible; both scripts exit 1). This is exactly the documented design — ar-audit-A INFO-6 states the script "cannot be re-run in dry-run at the tip (its coordinates reference the pre-apply tree); this is by design". **Not a repo defect; the briefing's expectation was inaccurate.** Repo state after both runs: `git status --porcelain` still empty (no writes occurred).

### C verdict: **PASS** (guard exactly as claimed; dry-run re-run is fail-closed/no-write, consistent with the committed audit documentation).

---

## D) Rebase integrity — PASS

- `git diff 93c7165 b80841f -- public/content tools` → **empty** (exit 0) — seam-era content/tools preserved pre→post rebase.
- `git diff c3c32c6 5de0cbc -- public/content tools` → **empty** (exit 0) — audit-era content/tools preserved.
- `git diff --stat c3c32c6 5de0cbc` → exactly the main move:

```
 app/about/page.tsx  |  1 +
 lib/testimonials.ts | 39 +++++++++++++++++++++++++++++++++++++++++++++++
 2 files changed, 40 insertions(+)
```

  (`git diff --numstat`: `1 0 app/about/page.tsx`, `39 0 lib/testimonials.ts`.) The same delta is what `git diff --stat 9773039 d9bab74` reports for the main move — identical, nothing else.
- Extra cross-checks: `git diff 9e6e666 94708cb -- public/content tools` → empty; `git diff 01c06c5 d3a8d8a -- public/content tools` → empty; `git diff e13356a b7b1bb0 -- public/content tools` → empty (all exit 0). `git diff b80841f HEAD -- public/content` → empty (exit 0).
- `git rev-parse HEAD` → `5de0cbca111834a3c772fae1bb222abcf4d0d4ea` (equals `5de0cbc`).
- `git status --porcelain` → **clean** (empty), verified both at the start and after all audit operations. No untracked files inside the repo.

**D verdict: PASS.**

---

## E) Verdict and findings

| Section | Result |
|---|---|
| A — seam-fix commit `b80841f` (8 files, exact hunks, byte hygiene) | **PASS** |
| B — audit-records commit `5de0cbc` (6 files, blob byte-equality, report diffs) | **PASS** |
| C — guard `--check` exit 0 with exact counts; dry-run re-run safety | **PASS** (see INFO-2) |
| D — rebase content preservation, main-move diff, HEAD/status | **PASS** |

**Defects:** none SEVERE, none MAJOR, none MINOR in the two audited commits.

**INFO items (observations, no action required for these commits):**

1. **EOL representation between `_pk-audit` sources and repo files.** The committed blobs are byte-identical (sha256) to the LF sources; the working tree renders CRLF under the repo-wide `core.autocrlf=true` convention (no `.gitattributes`). Any future byte-level verifier must compare blobs (or normalize EOL) to avoid false mismatches — consistent with the audits' own INFO notes.
2. **Briefing expectation vs tool behavior on the optional dry-run.** The removal scripts do not print "SKIP" on re-run at the tip; they fail-closed with validation-failure listings, exit 1, and write nothing. This is the documented design (ar-audit-A INFO-6) and proves double-apply safety; nothing in the repo contradicts it.
3. **Pre-existing wording nuance in the ar removal report (unchanged by these commits):** its header says "13, 15,851 bytes, 271 lines" while the block table and archive sum to 260 block lines; 271 is the count of total deleted lines in the `9e6e666` diff (260 cut lines + 11 reword old lines). The audit summaries correctly use 260 block lines. Present before and after both audited commits; cosmetic only.

**Verdict (one paragraph):** The seam-fix commit `b80841f` and the audit-records commit `5de0cbc` are exactly what they claim to be, and the rebase onto main `d9bab74` preserved content perfectly. The seam fix touches exactly 8 files (ar-11 minus one blank line at the CSS seam; inst-6..11 plus one blank line above the watermark; the new guarded fix tool), all seven HTML files being valid UTF-8, BOM-less, pure CRLF; the audit-records commit adds four new reports whose committed blobs are byte-for-byte sha256-identical to the `_pk-audit` sources and edits the two removal reports only by replacing the "Independent audits" placeholder with summaries whose every quoted figure (289/289 ar, 223/223 inst, guard 99/18→22/9 and 67/26→21/2, 15,851/10,528 bytes, both MINOR seam findings) matches the underlying audit reports; the guard exits 0 with exactly the claimed counts, the post-rebase content is byte-identical to the pre-rebase era (empty diffs at both stages, with only the known +40-line main move), and HEAD is `5de0cbc` with a clean worktree. All checks PASS; there are no defects beyond three informational notes, of which only the CRLF/LF representation nuance and the documented fail-closed re-run behavior deserve a reader's attention.

*Audit performed read-only against `D:\pk\_wt\ak-grids`; temp helper scripts lived only under `C:\Users\Admin\AppData\Local\Temp\opencode\`, and the repo worktree remained clean (`git status --porcelain` empty) throughout.*
