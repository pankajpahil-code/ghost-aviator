# Content-Fidelity Audit (B) — Air-Regulations "Answer Key" Removal Pass

- **Auditor role:** independent subagent, adversarial content-fidelity audit (read-only)
- **Repo:** `D:\pk\_wt\ak-grids` (worktree clean during audit)
- **Audited commit:** `9e6e666` — "Answer keys: air-regulations removal pass (12 chapters + ar-19)"; **parent:** `9773039`
- **Note on worktree state:** HEAD has since advanced to `e13356a` (two later commits: `01c06c5` instrumentation pass, `e13356a` report files only). `git diff 9e6e666 HEAD -- public/content/air-regulations/` is **empty** and `git status --porcelain` is empty, so every byte read during this audit equals `9e6e666`.
- **Archive under test:** `tools/audit/answer-key-archive/ar-removed-blocks-2026-10-17.json` (13 blocks + 11 rewords)
- **Method:** archive blocks re-extracted from `git show 9773039:<file>` and compared byte-for-byte; removed (question → letter) pairs parsed from every block and compared against independently parsed inline answer markup in both POST (9e6e666) and PRE (9773039) states; all 289 removed pairs cross-checked 1:1. Dangling-reference and residual-string scans, TOC/anchor integrity, reword context review, seam inspection, HTML tag-balance deltas, survivor checks, and hand spot-checks were run separately. Scripts were written under `C:\Users\Admin\AppData\Local\Temp\opencode\ar-audit\`; nothing in the repo was modified.

## Verdict

**PASS** — all 289 removed (Q → answer) pairs survive inline with identical letters in the POST state; in the PRE state all pairs also matched (the only historical divergence, ar-19 Q1, was fixed by the prior pass `8a2ca03`, as claimed). No dangling references, no broken anchors, no orphaned markup. Defects found: 0 SEVERE, 0 MAJOR, 1 MINOR (cosmetic), 4 INFO.

## 1. Archive integrity (13/13 blocks)

Each archived block was re-sliced from `9773039` at its stated line range. All 13 blocks are **byte-exact** (`sha1` ✓, `bytes` ✓, `preSliceExact` ✓) and **absent from POST** (`post.includes(removed)` = false; no significant line of any block survives). The removed markup contains **no `id=` anchors**, so no anchor removals.

| Block | PRE lines | sha1/bytes/slice | absent in POST |
|---|---|---|---|
| ar-2 (15 answers) | 983–995 | ✓ | ✓ |
| ar-6 (10) | 1231–1237 | ✓ | ✓ |
| ar-7 (12) | 1830–1858 | ✓ | ✓ |
| ar-11, Q1–Q53 key | 4150–4221 | ✓ | ✓ |
| ar-11, now-unused `.ak-grid` CSS | 742–746 | ✓ | ✓ |
| ar-14 (25, two tables 13+12) | 2142–2159 | ✓ | ✓ |
| ar-15 (5) | 986–991 | ✓ | ✓ |
| ar-17 (109) | 2219–2246 | ✓ | ✓ |
| ar-19 (10) | 1187–1197 | ✓ | ✓ |
| ar-20 (14) | 1264–1279 | ✓ | ✓ |
| ar-21 (10) | 1239–1257 | ✓ | ✓ |
| ar-22 (5) | 1318–1331 | ✓ | ✓ |
| ar-23 (21, two tables 11+10) | 1669–1690 | ✓ | ✓ |

Pair counts match the build claim exactly: ar-2=15, ar-6=10, ar-7=12, ar-11=53, ar-14=25 (Q1–13 + Q14–25), ar-15=5 (C,B,B,C,B), ar-17=109, ar-19=10, ar-20=14, ar-21=10, ar-22=5, ar-23=21 (Q1–11 + Q12–21). **Total 289 pairs.**

## 2. Answer fidelity — per-file results

All removed pairs were compared against inline answers parsed from the page's own markup (conventions vary per chapter and were inspected first in raw HTML). Result: **289/289 match in POST, 289/289 match in PRE; 0 mismatches, 0 missing, 0 multi-answer contradictions.**

| File | Inline convention used as reference | Removed | POST match | PRE match | Result |
|---|---|---|---|---|---|
| ar-2 | `li.correct > span.opt` (e.g. `<li class="correct"><span class="opt">B</span>…`) | 15 | 15/15 | 15/15 | **PASS** |
| ar-6 | `div.qa-option.correct > div.opt-letter` **and** `div.qa-answer "Answer: X"` (both markers agree on all 10) | 10 | 10/10 | 10/10 | **PASS** |
| ar-7 | `div.qa-option.correct` ("B) …") | 12 | 12/12 | 12/12 | **PASS** |
| ar-11 | Part R `li.opt-correct > span.opt-letter` + `<span class="ans-tag">CORRECT</span>` | 53 | 53/53 | 53/53 | **PASS** |
| ar-14 | `span.ans "Correct Answer: X"` (both tables) | 25 | 25/25 | 25/25 | **PASS** |
| ar-15 | `div.opt.correct > span.tag` | 5 | 5/5 | 5/5 | **PASS** |
| ar-17 | `li.correct > span.opt` | 109 | 109/109 | 109/109 | **PASS** |
| ar-19 | `div.correct "✓ X)"`, `answer-explain "Answer: X."` agrees Q2–10 | 10 | 10/10 | 10/10 | **PASS** |
| ar-20 | `div.answer "X —"` | 14 | 14/14 | 14/14 | **PASS** |
| ar-21 | `li.correct > span.opt-letter "X)"` | 10 | 10/10 | 10/10 | **PASS** |
| ar-22 | `div.qa-answer … "✓ Correct Answer: (X)"` | 5 | 5/5 | 5/5 | **PASS** |
| ar-23 | same as ar-22 | 21 | 21/21 | 21/21 | **PASS** |

No inline answers were deleted or altered by the pass: the inline (Q→letter) maps in PRE and POST are identical for all 12 cut files, and the full `git diff 9773039 9e6e666` contains **only** the 13 archived block deletions plus the 11 reword line swaps — nothing else.

### ar-19 Q1 story — verified

- At `4c21ef1` (before the prior fix pass) the inline marker was **B** while the (then-present) block keyed **A**:
  - pre-fix inline: `<div class="correct">✓ B) Prevention of accidents or incidents and to help the manufacturers in design <span …>— <i>per textbook answer key</i></span></div>`
  - block: `<td>A</td><td>C</td><td>B</td>…` (Q1=A)
- Commit `8a2ca03` ("Content fixes: resolve flagged answer conflicts…") states: *"ar-19: Q1 highlight B->A (grid + explanation agree)"* and its diff flips the highlight to `✓ A)`.
- So the claim "only ar-19 Q1, fixed in a prior pass" holds exactly: a historical scan at `4c21ef1` of all 12 cut files against their blocks shows exactly **one** divergence (ar-19 Q1, B vs A); at the parent `9773039` there are **zero** divergences. No other removal file ever diverged.
- The ar-19 explanation text (post L1052) is consistent: `<b>Textbook Answer: A.</b> Per the answer key supplied in the source material, the correct option is listed as <b>A</b>.`

### ar-11 two question banks (clarification, not a defect)

ar-11 contains *Practice MCQs — Chapter 11* (Q1–Q60, own inline answers) and *Part R — DGCA Exam MCQ Bank* (Q1–Q53). The removed key ("Q1 to Q53") belonged to **Part R** and matched its inline answers **53/53**. The 33 index-level letter differences between the Practice set and the Part R key are not contradictions: the two banks are different questions at the same index (e.g. Practice Q2 = "At which aerodrome is a signaling lamp mandatory?" vs Part R Q2 = "'Clearway' is a defined rectangular area…"). Pre-existing content, untouched by the pass, and the removed key never keyed the Practice set.

## 3. Dangling references (all 13 files, POST)

- Residual-string scan for every removed title across all touched files: `Consolidated Answer Key`, `Quick-Reference Answer Grid`, `Quick Answer Key`, `Official Answer Key`, `Answer Key Summary`, `Quick-Reference Answer Key`, `Master Answer Key`, `Answer Key (Per Source Textbook)`, `Answer Key — Quick Self-Test Review`, `Answer Key Grid`, `ak-grid` → **0 hits**. (ar-14 `Table 12.1 — Master Answer Key`: no reference in ar-14; the only "Table 12.1" left anywhere is ar-17's unrelated, pre-existing *"Table 12.1 — Types of Non-Routine Landing"*.)
- `ak-grid`/`ak-cell` class references after the CSS cut: **0** in ar-11 (the removed CSS block is fully unused).
- Internal link integrity: every `href="#…"` in all 13 files resolves; **0 missing targets**. No anchors were removed.
- No "see below / key follows / grid follows / as above" style promise remains. The only "reveal" prose is ar-23 L1109 ("cover the answer panel … then reveal") which describes the still-present inline `answer-reveal` panels.

TOC/target checks for the touched TOCs:

| TOC entry (POST) | Target | Check |
|---|---|---|
| ar-2 L432 `Practice Question Bank &mdash; 15 MCQs` | `#s9` → L887 `<h2 class="sec" id="s9">…15 MCQs</h2>` | id ×1, href ×1, text matches target |
| ar-17 L450 `Practice Question Bank &mdash; 109 MCQs` | `#s16` → L1539 `id="s16"` | id ×1, href ×1, matches |
| ar-22 L410 `Master Reference Tables` | `#master-ref` → L1228 `id="master-ref"`, L1229 `<h2>Master Reference Tables</h2>` | id ×1, href ×1, matches |
| ar-23 L263 `Master Reference Tables · Mnemonics` | `#ref-tables` → L1619 `id="ref-tables"`, L1620 `<h2>10. Master Reference Tables · Mnemonics</h2>` | id ×1, href ×1, matches |

## 4. Rewords (11/11 verified)

For every reword: `oldLine` is byte-exact at the archive's stated PRE line (13/13 for cuts too), `oldLine` occurs **0** times in POST, `newLine` occurs **exactly 1** time, and the 6-line context is grammatical and truthful.

| # | File | New line (POST) | Judgement |
|---|---|---|---|
| 1 | ar-2 L890 | "…marked &#10003;, with a one-line rationale." (stale "answer key grid follows" drop removed) | ✓ truthful; no stale promise |
| 2 | ar-2 L432 | TOC "Practice Question Bank &mdash; 15 MCQs" | ✓ matches heading; target exists |
| 3 | ar-11 L2917 | "PART R / 53 MCQs with Inline Answers" | ✓ **verified truthful**: Part R shows 53 `li.opt-correct` + 53 `ans-tag CORRECT` green markers |
| 4 | ar-17 L1542 | "…then reveal." (grid sentence removed) | ✓ |
| 5 | ar-17 L450 | TOC "…109 MCQs" | ✓ |
| 6 | ar-22 L1229 | `<h2>Master Reference Tables</h2>` | ✓ heading sequence now A/B/C only (L1231/1262/1301), no "D." gap or dangling letter |
| 7 | ar-22 L410 | TOC "Master Reference Tables" | ✓ |
| 8 | ar-23 L1669 | `<h3>10.4 Final Exam-Day Cheat Card</h3>` | ✓ **numbering clean**: 10.1→10.2→10.3→10.4 (L1622/1636/1653/1669); no duplicate 10.4, no residual "10.5" anywhere; TOC has no 10.x listing |
| 9 | ar-23 L1620 | `<h2>10. Master Reference Tables · Mnemonics</h2>` | ✓ |
| 10 | ar-23 L263 | TOC "Master Reference Tables · Mnemonics" | ✓ |
| 11 | ar-26 L956 | "…plus a consolidated cross-reference of all worked answers…" | ✓ plausible; no longer promises a "master answer-key" |

## 5. Seams (13/13 cuts)

Read raw HTML, 6+ lines either side, POST state. Every cut removed a complete element; surrounding structure is valid, no orphaned heading/comment/wrapper, no stray `</div>`/`-->`, spacing sensible. HTML tag-balance delta check per file: the POST↔PRE delta for `div/table/section/ul/ol/thead/tbody/tr/td/th` exactly equals the tags contained in the removed blocks — nothing extra was cut, nothing left half-open.

Representative seams:
- ar-2: Q15 block → blank → `<div class="footer">` (question list intact).
- ar-6: `chapter-title/source` → blank → `<!-- Q1 -->` (the removed key box sat before the questions; list intact).
- ar-7: last question → blank → complete `<!-- FOOTER -->` 3-line comment.
- ar-11: `</div><!-- end mcq-section -->` → blank → `<!-- FINAL MASTER SUMMARY -->`; CSS cut leaves `.note-tag` → blank → `/* ── QUICK FACTS ── */`.
- ar-14: Q25 (`Correct Answer: A`) → blank → `<div class="foot">`.
- ar-15: last question → blank → `</section>`.
- ar-17: Q109 → blank → `<div class="footer">`.
- ar-19: last question → blank → `</section>` → blank → `<!-- FOOTER -->`.
- ar-20: last MCQ → blank → complete `FINAL SUMMARY / KEY TAKEAWAYS` comment.
- ar-21: last question → blank → complete `FINAL WRAP-UP NOTE` comment (the removed block's own comment header was removed in full; the two "====" lines still present in the file belong to *this* complete comment).
- ar-22: glossary `</table>` → blank → `<div class="box box-green">` → `</section>`.
- ar-23: mnemonics `</table>` → blank → `<h3>10.4 Final Exam-Day Cheat Card</h3>`.

## 6. Survivors

| Survivor | Status |
|---|---|
| ar-11 L3664 "Correct answers from the official answer key are shown in green." | ✓ still true — Part R has 53 green `opt-correct` options (`opt-correct { color:var(--green); }` L737–738) + 53 `ans-tag CORRECT` badges; Practice section has 60 more. Well ≥3 verified. |
| ar-11 L4004 `<span class="ans-tag">CORRECT (per Answer Key)</span>` (Q38 option C) | ✓ consistent: removed key Q38 = C, inline = C |
| ar-5 L1561 "…Correct DGCA answer per answer key = B (2000ft)." | ✓ present; ar-5 byte-untouched |
| ar-6 L1272 "…per the answer key provided in the document, A is correct…" | ✓ present and coherent (refers to source document); ar-6's removal did not delete this line |
| ar-13 L1995 "…the answer key says A… the answer given in the book is A." | ✓ present; ar-13 byte-untouched |
| ar-19 L1047 "…— per textbook answer key" and L1052 "Per the answer key supplied in the source material…" | ✓ present; consistent with block Q1=A |
| ar-26 L814 note "The official answer key marks (B) as correct, but…" | ✓ present; self-contained (explains the source-key nuance; promises nothing removed) |
| Blockers ar-3 / ar-12 / ar-16 | ✓ `git diff 9773039 9e6e666 -- <files>` is **empty** (byte-identical, keys retained: ar-3 "ANSWER KEY (All 106 Questions…)", ar-12 "Complete Answer Key (All 102 Questions)", ar-16 `<table class="answer-key …">`) |

## 7. Hand spot-checks (removed letter vs actual inline markup)

15 entries read directly from the raw question/answer markup:

- **ar-14** (block letters: 4=B, 7=B, 12=C, 14=C, 22=A): L1981 `Correct Answer: B`; L2003 `B`; L2041 `C`; L2057 `C`; L2115 `A` → **all match**.
- **ar-23** (2=B, 9=C, 13=B, 15=C, 21=A): L1150 `✓ Correct Answer: (B) Liveware – Software`; L1318 `(C)`; L1414 `(B)`; L1462 `(C)`; L1606 `(A) GPWS` → **all match**.
- **ar-17** (9=B, 44=B, 67=C, 98=A, 109=B): L1599 `<li class="correct"><span class="opt">B</span>Shell crackers`; L1811 `B`; L1954 `C`; L2146 `A`; L2215 `B` → **all match**.

## Defects

**SEVERE:** none.
**MAJOR:** none.

**MINOR**
1. ar-11 CSS seam leaves a double blank line at POST L741–742 (between `.note-tag` and `/* ── QUICK FACTS ── */`). Cosmetic only; no structural effect.

**INFO**
1. Claim-counting nit (no content impact): the archive holds **13 blocks for 12 chapters** — 12 answer-key tables/grids (14 rendered tables, since ar-14 and ar-23 each had two) plus 1 now-unused `.ak-grid` CSS block; ar-26 was reword-only. The phrasing "13 tables/grids from 13 chapters" and the commit title "(12 chapters + ar-19)" are loose, but nothing is missing or miscounted in the archive itself.
2. ar-6 L1272 says "per the answer key provided in the document" — reads naturally as the source document but could be misread as a page-level key; harmless, consistent with intentional "source key" annotations.
3. ar-11 contains two MCQ banks (Practice Q1–60 vs Part R Q1–53) whose same-index answers differ for 33 indexes; verified pre-existing and explained by different question texts — not caused by, nor affected by, this pass.
4. Worktree HEAD has advanced past `9e6e666` (to `e13356a`) with report-file commits only; air-regulations content is byte-identical between `9e6e666` and HEAD, so the audited commit remains authoritative for this pass.

## Evidence artifacts (temp, not part of repo)

Scripts and raw outputs: `C:\Users\Admin\AppData\Local\Temp\opencode\ar-audit\` — `cut-verify.json` (block byte checks), `removed-pairs.json` (parsed block keys), `compare-results.json` (POST/PRE pair comparison), `diff-a/b/c.txt` (full change diff), `seams-out.txt` (seam printouts), `spot-out.txt` (hand spot-checks).

*Audit performed read-only against `D:\pk\_wt\ak-grids`; no files in the repo or any other project directory were modified, and nothing was committed or pushed.*
