# Content-Fidelity Audit B — Instrumentation Answer-Key Removal Pass

- **Repo:** `D:\pk\_wt\ak-grids` (read-only)
- **Audited changes:** commit `01c06c5` vs parent `9e6e666` (24 instrumentation chapters)
- **Auditor:** independent (did not write the change), adversarial content-fidelity review
- **Date:** 2026-10-17
- **Scope:** `public/content/instrumentation/<chapter>/notes.html`
- **Verdict: PASS**

> Note: partway through the audit the repo HEAD advanced to `e13356a`
> ("Answer keys: removal reports for air-regulations and instrumentation passes"),
> which adds only two files under `tools/audit/` (`answer-key-removal-ar-2026-10-17.md`,
> `answer-key-removal-inst-2026-10-17.md`). `git diff 01c06c5 HEAD -- public/content/instrumentation`
> is empty, so all content findings below apply unchanged to the current tree.

---

## 1. Method (what was actually tested)

1. **Archive integrity.** For each of the 25 recorded cuts in
   `tools/audit/answer-key-archive/inst-removed-blocks-2026-10-17.json`:
   recomputed SHA-1 of the archived `removed` text, compared it byte-for-byte with the
   parent blob (`git show 9e6e666:...`) at the recorded line range, and confirmed the
   text no longer occurs anywhere in the post file. **All 25/25: sha1 OK, pre-slice exact, absent in post.**
2. **Whole-diff attribution (strongest check).** Independently applied the archived edits
   (cuts + the recorded old→new line transforms) to the parent blob and compared the
   result with the post file. **All 24/24 files: reconstruction byte-identical** (CRLF
   join; post files are uniformly CRLF, no BOM, no mixed endings). This proves the entire
   diff is exactly the 25 cuts + 19 rewords — nothing else was added, removed, or altered.
3. **Key→inline fidelity.** Parsed (question → letter) out of every removed block
   (table header/data formats, the two inst-31 one-line sequences, the inst-35 one-line
   div) and parsed the inline answers out of the post markup
   (Format A: `Correct Answer: <strong>(x)</strong>…` — both `(x) text</strong>` and
   `(x)</strong> text` variants; Format C: the single `<li class="correct">…</li>` per
   `<ol class="opts">`, attributed by nearest preceding `<h2>Paper N —`). Inline answers
   were also parsed from the parent blob and found identical pre↔post.
   - Total removed key entries: **223** (matches the builder's claim), every one matching
     the inline answer 1:1 with the same letter. Zero mismatches.
   - inst-31: 40/40 (Paper 1) + 16/16 (Paper 2) `class="correct"` markers, sequences
     1..40 and 1..16 strictly sequential, exactly one correct option per question.
4. **Rewords, seams, dangling refs, survivors** as detailed below.

---

## 2. Per-file PASS/FAIL

`cut(s)` = parent-file line range(s) removed. `pairs` = removed key entries.
`inline` = inline answer count for the same questions. `verify` = pairs match inline letter-for-letter.

| # | file | cut(s) (pre) | pairs | inline | verify | rewords (pre line) | verdict |
|---|------|--------------|-------|--------|--------|--------------------|---------|
| 1 | inst-1 | 292–297 | 5 | 5 | 5/5 | — | PASS |
| 2 | inst-2 | 293–298 | 8 | 8 | 8/8 | L185 | PASS |
| 3 | inst-3 | 601–606 | 8 | 8 | 8/8 | L365 | PASS |
| 4 | inst-4 | 564–569 | 9 | 9 | 9/9 | L310 | PASS |
| 5 | inst-5 | 702–707 | 7 | 7 | 7/7 | L482, L652 | PASS |
| 6 | inst-6 | 343–346 | 9 | 9 | 9/9 | L225 | PASS |
| 7 | inst-7 | 490–493 | 9 | 9 | 9/9 | L361 | PASS |
| 8 | inst-8 | 316–319 | 6 | 6 | 6/6 | — | PASS |
| 9 | inst-9 | 420–423 | 7 | 7 | 7/7 | L307 | PASS |
| 10 | inst-10 | 480–483 | 9 | 9 | 9/9 | L352 | PASS |
| 11 | inst-11 | 499–502 | 9 | 9 | 9/9 | L363 | PASS |
| 12 | inst-12 | 653–667 | 10 | 10 | 10/10 | L392 | PASS |
| 13 | inst-13 | 578–591 | 9 | 9 | 9/9 | L335 | PASS |
| 14 | inst-14 | 447–457 | 6 | 6 | 6/6 | L285 | PASS |
| 15 | inst-15 | 245–252 | 3 | 3 | 3/3 | L157 | PASS |
| 16 | inst-16 | 453–464 | 7 | 7 | 7/7 | L261 | PASS |
| 17 | inst-17 | 566–576 | 6 | 6 | 6/6 | L371 | PASS |
| 18 | inst-24 | 525–535 | 6 | 6 | 6/6 | — | PASS |
| 19 | inst-31 | 20; 48–53 | 40+16=56 | 40+16 | 56/56 | L101 | PASS |
| 20 | inst-35 | 333 | 5 | **6** (Q6 had no key entry) | 5/5 | — | PASS (see INFO-1) |
| 21 | inst-36 | 475–485 | 6 | 6 | 6/6 | — | PASS |
| 22 | inst-37 | 421–430 | 5 | 5 | 5/5 | L263 | PASS |
| 23 | inst-38 | 650–660 | 6 | 6 | 6/6 | — | PASS |
| 24 | inst-39 | 748–764 | 12 | 12 | 12/12 | L453 | PASS |

Counts per chapter match the claimed removal inventory exactly
(inst-1..17 = 5,8,8,9,7,9,9,6,7,9,9,10,9,6,3,7,6; inst-24 = 6; inst-36 = 6; inst-37 = 5;
inst-38 = 6; inst-39 = 12; inst-31 = 40 + 16; inst-35 = 5).

Every block verified, e.g.:

- inst-1: `<th>Q1…Q5</th>` / `<td>b</td><td>c</td><td>b</td><td>b</td><td>b</td>` → inline
  `Q1 (b)`, `Q2 (c)`, `Q3 (b)`, `Q4 (b)`, `Q5 (b)`. 5/5.
- inst-12 Q3: key `c` ↔ inline `Correct Answer: <strong>(c) Flying south … true heading decreases…</strong>`.
  (Full 10/10 mapping in §6.)
- inst-31 Paper 1 Q40 key `d` ↔ Paper 1 is exactly 40 questions; the 40th `class="correct"` li is option (d).
  Paper 2 key `15-b` ↔ `<li class="correct">auto-trim and elevators ✓` (4th-list item index b). 56/56.
- inst-35 key `1-a 2-b 3-a 4-c 5-d` ↔ inline Q1 (a), Q2 (b), Q3 (a), Q4 (c), Q5 (d). 5/5.

No content mismatches were found, so no pre/inline/post byte triple is owed; the one
count nuance is documented in INFO-1 with bytes.

---

## 3. Rewords (19 lines) — reviewed in full context (6 lines each side)

Structural checks per entry: old line present in parent at the recorded line; new line present
exactly once in post at the expected shifted line; old line gone; no `answer … key` phrase
remains in any of the 24 files (regex `answer[-\s_]*key`, case-insensitive).

| file | line (pre→post) | new text (short) | judgment |
|------|-----------------|------------------|----------|
| inst-2 | 185→185 | "…with the source answers shown inline and instructor explanations added." | truthful: 8 q-blocks follow, each with `Correct Answer:` + explanation |
| inst-3 | 365→365 | "8 questions with inline answers and explanations." | file has 8 CA lines, each with explanation. Count correct |
| inst-4 | 310→310 | "9 questions with inline answers and explanations." | 9 CA. Count correct |
| inst-5 | 482→482 | "7 questions with inline answers and explanations." | 7 CA. Count correct |
| inst-5 | 652→652 | "…The source key states (b) 3390. … trust the source key: **(b) 3390 ft**." | **both** old phrases replaced; sentence reads correctly; retains the deliberate source-key deliberation; agrees with inline Q7 `(b) Zero; 300 ft; 3390 ft` |
| inst-6 | 225→225 | "Questions 1–9 with inline answers." | 9 CA; count correct |
| inst-7 | 361→361 | "Questions 1–9 with inline answers." | 9 CA; count correct |
| inst-9 | 307→307 | "Questions 1–7 with inline answers." | 7 CA; count correct |
| inst-10 | 352→352 | "Questions 1–9 with inline answers." | 9 CA; count correct |
| inst-11 | 363→363 | "Questions 1–9 with inline answers." | 9 CA; count correct |
| inst-12 | 392→392 | "All 10 questions below, with inline answers and explanations." | 10 CA; count correct |
| inst-13 | 335→335 | "Source questions reproduced verbatim, with the source answers shown inline." | 9 CA; correct |
| inst-14 | 285→285 | same pattern | 6 CA; correct |
| inst-15 | 157→157 | same pattern | 3 CA; correct |
| inst-16 | 261→261 | same pattern | 7 CA; correct |
| inst-17 | 371→371 | "…with the source answers shown inline. Note: Q6 source answer confirmed as (a) = statements 2, 3, and 5." | inline Q6 = `(a)`; note retained accurately |
| inst-31 | 101→94 | "…The source key gives **b**. Note: the source key says \"b\" … as given in the source key." | consistent with the attached q-block (Paper 1 Q14, `class="correct"` = option b) and with the removed key's `14-b` |
| inst-37 | 263→263 | "…given with their answers shown inline. Explanations are instructor-generated." | 5 CA; correct |
| inst-39 | 453→453 | "…given with their answers shown inline. Explanations are instructor-generated." | 12 CA; correct |

Targeted verifications requested:

- **(a) "with inline answers and explanations" / "with inline answers"** (inst-3,4,5,12,6,7,9,10,11):
  in every file the reworded box is immediately followed by qa-blocks in which each question has
  a `Correct Answer: <strong>(x)</strong>` block (first one within 6–14 lines; counts equal to
  question counts). Statement is true.
- **(b) "with the source answers shown inline"** (inst-2,13,14,15,16,17): same — per-question CA
  blocks follow each box. True.
- **(c) inst-5 L652:** old bytes contained `The source answer key states (b) 3390.` and
  `trust the source answer key:`; post bytes contain `The source key states (b) 3390.` and
  `trust the source key:` — both occurrences replaced exactly once, nothing else changed on the
  line, and the deliberation sentence remains grammatical and coherent.
- **(d) inst-31 L94 (post):** amber box now "The source key gives **b**…", attached to Paper 1
  Q14 whose inline correct answer is option (b); removed key had `14-b`. Consistent.

No reword changed a question, an option, or an answer letter. All 19 rewords are cosmetic/claim
scoping only.

---

## 4. Seams (25 cuts, inspected 6 lines before/after in raw post bytes)

All 25 joins are clean. In inst-1..17, inst-24 and inst-36..39 the removed key table sat at the
**end of the document body**, directly before the trailing `<div class="watermark">…</div>` +
anti-copy `<style>/<script>` block; after the cut the preceding master-reference `<table>` (or box)
is followed by one blank line and then the watermark block. Representative join (inst-2):

```
B 291: <div class="box amber">"P S D"…</div>
B 292: (blank)
~~~~ cut removed: <h3>Answer key</h3> + table + blank ~~
A 293: <div class="watermark">Ghost Aviator</div>
A 294: (blank)
A 295: <style id="ga-protect-css">
```

- No orphaned `<h3>`, comments, wrappers, or empty lines left behind; div/table/section/style
  open/close counts are balanced in all 24 files.
- **inst-6/7/8/9/10/11** (the "table directly after `</div>`" note): the removed block was the
  last element after `</div>`; result is `</div>` immediately followed by the watermark line.
  Valid HTML, no leftover fragment — only a cosmetic loss of one blank line (see MINOR-1).
- **inst-31 CSS rule (pre L20):** removed line sat between `.amber-box {…}` and `.reg-value {…}`;
  the rule was self-contained (single line, balanced braces). Post style block is intact and
  balanced; `.correct { color: #2e7d32; … }` and `.opts` remain; zero `answer-key` tokens remain.
- **inst-31 section (pre L48–53):** now flows blue-box intro (L45) → blank → `<h2>Paper 1 —
  Questions & Explanations</h2>` (L47) → q-blocks. Exactly the intended structure.
- **inst-35 (pre L333):** `<h3>Practice Questions (Chapter 35)</h3>` → blank → first qa-block.
  Clean.

---

## 5. Dangling references

- No occurrences of `answer key`, `quick answer`, `see the key`, `answers at the end`,
  `key below/above`, etc. remain in **any** of the 24 edited files (case-insensitive scan);
  `the key` hits that exist are ordinary English ("the key relationship", "the key thresholds"),
  none referencing removed material.
- No removed block contained an `id=`, `href=`, or `<a>` element, so no anchor target was lost.
- Anchor integrity: every `href="#X"` in all 24 files resolves to an `id="X"`/`name="X"` in the
  same file (0 broken of ~500 hrefs; inst-31 has 0 hrefs). No TOC/quick-nav entry points at a
  removed heading (`Quick Answer Keys`, `Answer key`, `Answer Key Summary`, `Q&A Answer Key`,
  `Answer Key — Source Questions` all had no ids and no inbound links).
- Site-wide scan of `public/`: `answer[-_]key`-/`answer-key table`-type tokens remain only in
  `public/content/instrumentation/inst-40/notes.html` (intentional blocker) and
  `public/content/air-regulations/ar-16/notes.html` (outside this pass's scope, pre-existing).

---

## 6. Spot-checks (hand mappings)

### inst-31 Paper 2 — all 16 entries (key from removed div ↔ inline `class="correct"` option)

| Q | key | inline | inline answer text (short) | Q | key | inline | inline answer text (short) |
|---|-----|--------|----------------------------|---|-----|--------|----------------------------|
| 1 | a | a | maintains its altitude | 9 | c | c | fail-operational |
| 2 | b | b | manoeuvre the aircraft in the air… | 10 | b | b | the autopilot is manually disengaged… |
| 3 | b | b | ensures…take-over is smooth… | 11 | a | a | α-floor reached |
| 4 | d | d | operates only in conjunction with the autopilot | 12 | d | d | decouples from the VOR… |
| 5 | b | b | a two axis autopilot | 13 | a | a | trimmed out before engaging… |
| 6 | b | b | Both statements are correct | 14 | d | d | attitude at the time of release |
| 7 | d | d | Neither statement is correct | 15 | b | b | auto-trim and elevators |
| 8 | d | d | normal, alternate and direct laws | 16 | c | c | altitude hold and heading mode |

Raw evidence samples: Q3 `<li class="correct">ensures that when the autopilot is engaged, the
take-over is smooth and without snatching ✓`; Q9 `<li class="correct">fail-operational ✓`.

### inst-39 — all 12 entries

Q1 c↔c (primary engine display continuously shows the engine…), Q2 a↔a (ECAM, fourth mode
manual), Q3 c↔c (operational, status and maintenance), Q4 a↔a (compact message on upper DU),
Q5 b↔b (left DU checklist…), Q6 d↔d (top left of upper DU), Q7 c↔c (either EICAS or ECAM not
both), Q8 b↔b (checklist left DU / synoptic right or lower DU), Q9 d↔d (ECAM), Q10 d↔d (boxed =
other sub-systems affected = ECAM), Q11 a↔a (primary display, red), Q12 c↔c (EICAS, only primary
engine instruments). **12/12.**

### inst-12 — all 10 entries (with the Key Topic column of the removed table)

Q1 b↔b (DGI = horizontal-axis tied gyro), Q2 d↔d (latitude nut / bias weight precession),
Q3 c↔c (flying south → DGI over-corrects → heading decreases), Q4 c↔c (formula
`−15 sin lat °/h` — inline: "Correct Answer: <strong>(c) −15 sine latitude in degrees per
hour</strong>"), Q5 b↔b (5 DGI errors), Q6 c↔c (yawing plane; air jets; torque motor),
Q7 c↔c (caging = reset + prevent toppling), Q8 b↔b (air jets on outer gimbal), Q9 d↔d (85°
pitch and roll), Q10 a↔a (gimballing error disappears on return to level flight).
**10/10**; sampled Key-Topic items were re-derivable from the inline explanations.

---

## 7. Survivors

- **inst-40** and **inst-34 are byte-identical to the parent** — blob hashes equal for
  `9e6e666` and `01c06c5` (`inst-34: 39a15d84…`, `inst-40: fcc1081f…`), `git diff` between the
  two commits over these paths is empty, working tree clean.
- **inst-34 annotations** (the 3 "reference answer key" occurrences) still agree with the page:
  - Q1: annotation `Reference answer key: d.` ↔ inline `Correct Answer: <strong>(d)</strong> A downwards transmitting radio beam`.
  - Q2: inline `<strong>(d)</strong> (reference key: b)` plus the explanation/instructor-note that
    document the source-key discrepancy (source key shows `b`, which matches Mode 4B wording;
    deliberately flagged as a known quirk). Consistent, intentional, untouched.
- inst-40 blocker state: no change; its master answer-key section (`<a href="#answer-keys">Master
  Answer Keys</a>`, 399 answers with no inline source) remains as-is.

---

## 8. Defects

**SEVERE:** none.
**MAJOR:** none.
**MINOR:**
- **MINOR-1 (cosmetic):** In inst-6/7/8/9/10/11 the removed key block had no blank line before it
  and its trailing blank was part of the cut, so the post file now has `</div>` immediately
  followed by the `<div class="watermark">` line (no separating blank). HTML/CSS are unaffected
  (the watermark is `display:none`-style boilerplate), just slightly tighter source formatting.

**INFO:**
- **INFO-1 (pre-existing completeness, not caused by the pass):** inst-35's removed one-line key
  covered 5 of the 6 questions. Pre block bytes:
  `<div class="answer-key" style="…">Answers: 1-a  2-b  3-a  4-c  5-d</div>`.
  Inline Q6 (unchanged in post bytes): `Correct Answer: <strong>(c)</strong> 400 ft AGL`.
  No answer was lost — the block never contained Q6.
- **INFO-2 (bookkeeping):** the builder's guard note expects "inst-40 (18 lines)". A naive
  case-insensitive count of `answer[-\s_]*key` in inst-40 yields 24 occurrences across 21 lines
  (including CSS `.answer-key-table` selectors and the TOC link `#answer-keys`). inst-40 was not
  touched by this pass (byte-identical), so this is a guard-numbering nuance only.
- **INFO-3:** repo HEAD advanced to `e13356a` during the audit (adds only the two pass report
  files under `tools/audit/`); instrumentation content unchanged vs `01c06c5`.
- **INFO-4:** post files remain uniformly CRLF with no BOM; the parent blobs in git are LF
  (autocrlf=true) — the archive stores CRLF slices, matching the working-tree bytes the pass edited.

---

## 9. Overall verdict

**PASS.**

- All 25 recorded cuts remove exactly the archived bytes from the parent (sha1-verified), and
  reconstruction from parent + archive reproduces every post file byte-for-byte — the diff
  contains nothing but the claimed removals and rewords.
- All 223 removed key entries match the inline answers 1:1 letter-for-letter
  (inst-31's 56 via its `class="correct"` markers); no question lost an answer; no answer letter
  changed. Pre↔post inline answers are identical.
- All 19 reworded lines are grammatical, truthful about the page's actual inline-answer content,
  and free of residual/dangling references; the inst-5 source-key deliberation and inst-31
  discrepancy note are preserved with sensible wording.
- Survivors (inst-34, inst-40) untouched; inst-34's discrepancy annotations remain coherent.
- Only one cosmetic spacing nit (MINOR-1) and documentation-level INFO items; no action required
  for content fidelity.
