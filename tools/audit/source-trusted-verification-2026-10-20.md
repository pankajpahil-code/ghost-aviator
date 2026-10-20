# Source & trusted-content verification after the ar + inst push — 20 Oct 2026

**Trigger:** Captain: "push and verify against actual source and aviation trusted content."

**Push:** `ca74730..92e6d17` (6 commits — ar `10d86fc`, inst `fd9eb00`, reports `e15f7de`,
seam fixes `ec7ddd7`, audit records `80d03d7`, addendum record `92e6d17`), rebased onto the
Captain's `ca74730`. Our paths are diff-proven byte-identical to the audited pre-rebase tip:
`git diff 65e6588 HEAD -- public/content tools/audit` = empty.

**Live:** the `/cpl/air-regulations/ar-23/notes` sentinel switched to "10.4 Final Exam-Day
Cheat Card" (deployment `bom1::ksdh4-179245370722`, age 0). **43 live targets + 5 repo-side
checks PASS** (`_pk-docs/live-verify-ar-inst-2026-10-17.txt`).

Run 1 of the live verifier reported 7 ar failures; all were verifier artifacts, proven before
changing anything: the Next.js RSC payload embeds the rendered notes again inside `<script>`
tags, doubling raw phrase counts, and the inline-answer markers for ar-6/7/11 (`qa-answer`,
`qa-option correct`, `opt-correct`) were missing from the tool. Script-stripped live counts
equal the audited repo files exactly (ar-5 1, ar-6 1, ar-7 0, ar-11 2, ar-13 1, ar-19 2,
ar-26 1); ar-7's inline markers are `class="qa-option correct"` (13), ar-6's `qa-answer` (10),
ar-11's `opt-correct` (113). The tool now counts rendered HTML only; run 2 is all green.

No content was edited during this verification. Everything below is read-only evidence plus a
rulings list.

---

## 1. Trusted-content source of truth — the declared corrections layer

`lib/answer-corrections.ts` is the one place an answer is changed on purpose; every entry
carries its citation (DGCA CAR, ICAO Doc, FAA AIM, Aircraft Rules, SHELL/Human Performance).

```
npx tsx tools/audit/check-corrections.mts
→ 178 corrections (30 hides), 0 failing
→ 0 live copies of a corrected question not reached by the layer
  (5 acknowledged with a reason; 17 already key the right answer but lack the new explanation)
```

Log: `_pk-docs/check-corrections-2026-10-20.txt`.

## 2. Air regulations — actual-source status

Independent full audit (`tools/audit/air-regs-full-audit-2026-09-21.md`, 923 questions):
747 verified against sources read in that audit (DGCA CARs, AIP India, Aircraft Rules 1937,
Investigation Rules 2025, ICAO Annexes, FAA AIM); 26 corrections applied. The second batch
resolved **all 123 flagged questions and the 7 drops** (76 rewritten, 8 re-keyed, 18 confirmed
with citations, 29 hidden); blocked questions went 145 → 9.

The removal pass changed no answers: all 289 removed (Q → letter) pairs match each page's
inline answers 1:1 (independent audit B). The surviving ar-16 "Answer Key" table is the
documented blocker (its questions are not printed inline — the grid is the page's only source).

## 3. Instrumentation — notes pages vs the effective quiz bank

New tool: `tools/audit/source-fidelity-inst.mts`. It parses all 277 `qa-block` questions on 37
chapters and compares the option the page keys with the option the post-correction bank
(`ALL_QUESTIONS`) keys. Comparison is on answer TEXT, tolerant of option order, subscripts,
roman numerals and number words; paraphrased stems are paired conservatively and labelled.

```
TOTAL: blocks=277 parsed=277 matched=257/277 key-equal=256/257 paraphrase-paired=2
       reordered-letter=0 bank-questions=264
```

- **One divergence: inst-2 Q3** — page (d) "position, manoeuvre-induced, instrument" vs bank
  (b) "Position, manoeuvre-induced". Trusted content supports (b): a pressure head has
  position error and manoeuvre-induced error; instrument error belongs to the instrument, not
  the head. The page's explanation argues the opposite ("pressure head/instrument combination").
- 20 questions have no chapter-bank counterpart: 19 page-only (inst-1 paraphrases ×4, diagram
  questions in inst-5/16/22, extra practice in inst-37/40) and 1 cross-chapter pair (inst-16 Q6
  = nav-2, verified to key the same answer).
- Not machine-checkable: inst-20/21 (no questions), inst-31 (paper-based sections).

Log: `_pk-docs/source-fidelity-inst-2026-10-20.txt`.

## 4. Corrections visible on the static notes pages

New tool: `tools/audit/corrections-on-pages.mts`. It finds every correction question that also
appears on a notes page and classifies the page's marked answer as UPDATED / STALE / OTHER.

```
148 declared (hides skipped) · 37 edit-only (keyed text unchanged) · 102 not on notes pages
9 questions found on notes pages: UPDATED 2 | STALE 3 | OTHER 4
```

- **UPDATED (2):** ar-7 priority-to-land ("critical shortage of fuel"), nav-15 variation West.
- **STALE (3) — all ar-23 Human Factors.** The quiz bank already keys the correction; the
  static page still teaches the superseded answer:
  - Q5 High noise in a cockpit: page keys **(a) Liveware–Liveware**; correction keys
    Liveware–Environment (SHELL). The page's exam-tip box repeats L–L.
  - Q6 Inefficient warning system: page keys **(c) Liveware–Software**; correction rewrites
    the option to Liveware–Hardware and keys it.
  - Q16 Introducing automation: page keys **(b) "…increases workload"**; correction rewrites
    to "…changes the nature of workload".
- **Manual review of the 4 unclassified found 2 more real conflicts:**
  - **ar-13 Q18 registration validity** — page Q&A and "Exam Point" box answer "till it is
    cancelled by DGCA"; the correction (current rule) is "till the date indicated on the
    Certificate of Registration". The page is outdated and does not print the correct option.
  - **rnav-14 Q3 Mode S** — page marks **(d) "uses VHF frequencies"**, while its own
    explanation describes (c) "eliminates garbling by selective addressing" (the corrected
    answer). The page contradicts itself and (d) is factually wrong.
  - ar-16 Q10 — known blocker (no inline answers by design); ar-25 oxygen question is not on
    the page.

Log: `_pk-docs/corrections-on-pages-2026-10-20.txt`.

## 5. Rulings required (page content, not yet edited)

| # | Page | Page says now | Declared / trusted answer | Nature |
|---|---|---|---|---|
| 1 | inst-2 Q3 | (d) position, manoeuvre-induced, **instrument** | (b) position, manoeuvre-induced | page vs bank; trusted theory supports the bank |
| 2 | rnav-14 Q3 | **(d) uses VHF frequencies** (explanation argues (c)) | (c) eliminates garbling by selective addressing | unambiguous page bug |
| 3 | ar-13 Q18 + exam box | "till it is cancelled by DGCA" | "till the date indicated on the Certificate of Registration" | outdated rule |
| 4 | ar-23 Q5 noise | (a) Liveware–Liveware | Liveware–Environment (SHELL correction) | **source key vs SHELL** — authority conflict |
| 5 | ar-23 Q6 warning system | (c) Liveware–Software | Liveware–Hardware (SHELL correction) | source key vs SHELL |
| 6 | ar-23 Q16 automation | "…increases workload" | "…changes the nature of workload" | source wording vs HF teaching |

Standing opens, unchanged: rnav-15 Q3 / rnav-19 Q3 source key vs formula (ruling pending);
met-13 Q23 ((b) 40 mm vs one source's (c) 60 mm) and blank Q34(c); ar-3/ar-12/ar-16
question-set import.

For #4–#6 the site currently contradicts itself: the quiz bank keys the correction while the
notes page teaches the older source key. The Captain's ruling decides which authority the site
follows for each.

## 6. Residual scope

- The instrumentation sweep is complete. Air-regulations pages use five different answer
  markups and many paraphrased stems, so a **full ar notes page↔bank sweep is still open**;
  the corrections-visible scan only covers questions that have a declared correction. The inst
  tool proves the approach; an ar version is the recommended next audit pass.
- Page-vs-bank divergences can exist without a declared correction (inst-2 Q3 is one), so the
  sweep above is a lower bound, not a proof of full agreement, outside instrumentation.

## Artifacts

- Tools: `tools/audit/source-fidelity-inst.mts`, `tools/audit/corrections-on-pages.mts`
  (read-only; `npx tsx` via the main checkout's tsx binary).
- Logs: `_pk-docs/check-corrections-2026-10-20.txt`,
  `_pk-docs/source-fidelity-inst-2026-10-20.txt`,
  `_pk-docs/corrections-on-pages-2026-10-20.txt`,
  `_pk-docs/live-verify-ar-inst-2026-10-17.txt` (run 1 + appended run 2).
- Live verifier calibration: `_pk-tools/live-verify-ar-inst-2026-10-17.mjs` now strips
  `<script>/<style>` before counting and recognises the real inline-answer markers.
