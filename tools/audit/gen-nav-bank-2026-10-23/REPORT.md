# General Navigation 1,000-question bank: check, dedupe, publish (2026-10-23)

Source handed over: `D:\question bank\` (a 1,000-question General Navigation bank built by another agent,
with a "certified" key, six chapter PDFs and an HTML portal). The question text was taken from the
clean Word copy of the same book in `D:\01 Air Navigation\Books` (KW Gen. Nav.docx); the answer key
and worked solutions were read from the scanned book PDF in `D:\question bank\` (answer pages 123-337) with two OCR engines. Nothing in this folder names the book on the site:
`decisions.json` and `published.json` carry no source name, the generated bank uses
`source: "General Navigation practice bank"`.

STATUS: built and checked by one model (Claude Opus 5.5). NOT independently audited (CONTRACT clause 4).

## Numbers

| | count |
|---|---|
| questions in the bank | 1,000 |
| already on the site (same stem and same numbers) | 430 |
| repeats inside the bank itself | 33 |
| Plotting: need the chart the questions are set on, held back | 96 |
| checked one by one | 441 |
| published | **365** (343 VERIFIED, 22 CORRECTED) |
| dropped, with the reason in `decisions.json` | 76 |

Site total 4,326 -> 4,684. Seven existing copies (hidden chapters nav-3/4/5, placeholder
explanations) were replaced by the new copies; all seven keyed the same answer.

## How each key was checked

- Numerical (PSR/PET, scale, descents, departure, great circles, wind triangle, TAS): re-worked from
  the question's own numbers by script (`scripts/build_*.py`, `scripts/dec_*.py`); the published
  explanation is the actual working with that question's numbers, and the keyed option is the one
  nearest the computed value. Every one also compared with the book's key.
- Theory: book key read from the scan (two OCR engines; header letter cross-checked against the
  book's own working where they disagreed), then reasoned through; explanation written fresh.

## Errors found in the BOOK's own key (corrected, each with working in decisions.json)

PSR&PET 33, 43, 83 (book divides by TAS instead of groundspeed, or multiplies by the wrong groundspeed),
PSR&PET 81 and 114 (wrong letter), Circles 68 (mean of 60S and 55N taken as 57.5 deg), CRP5 46 (wind from
the right of the nose keyed as right drift). Descents 18, 27, 31, 98: header letter disagrees with the
book's own working; keyed to the working.

## Errors in the Word copy (stems/options restored to the book's data)

PSR&PET 40, 50, 102, 118; Scale 27, 32, 33, 38; Descents 5, 49, 66, 67, 100; Circles 91, 101;
Time 44; CRP5 1, 37, 67, 104, 111, 112, 116; duplicate options fixed in Scale 59, 72, CRP5 35, 116.
Many "time" options were labelled NM and vice versa; units corrected.

## Dropped (76), by reason

- Two defensible answers: rule of thumb (5 x GS, 1 in 60) and exact geometry point to different
  options (Descents 11, 51, 58, 62, 77), or two options correct as printed (Magnetism 8, 25).
- No correct option / options do not fit the stem (PSR&PET 58, Circles 89, Descents 34, 64, Circles 32).
- Needs a figure, chart-symbol sheet or Air Almanac extract the site does not show (Chart Theory 30-47,
  INS 80/94/115/148, Time 14/15/17/23-26/35). Plus the 96 Plotting questions (Jeppesen E(LO)1 chart).
- Repeats of another question in the same section (most of the 32 INS drops; Magnetism 77, 88, 94).
- Sources disagree on the answer (INS 58 Schuler damping, INS 76/90/111 B737 position-entry check).

## The folder's "certified" key is not reliable

Against the checked keys of the 365 published questions it disagrees on 121 (33%). Against the
book's own key (456 questions where both OCR readings agree) it disagrees on 165 (36%). Its CRP5
section keys 101 of 125 as "a". Its explanations are templates ("Substituting the given values
gives X") that assert the keyed number without working it. Its README and PDFs name the source
book. **Do not publish anything from `D:\question bank\` as it stands.**

## Chapter placement

Instrumentation questions (INS, IRS, FMS, EFIS, compass errors, aircraft magnetism, remote compass)
went to the Instrumentation chapters, following the 16 Oct reclassification that moved those topics
there. PSR/PET went to the new chapter `nav-cp-pnr` (Ch. 18), whose notes were written fresh for this
change and checked against the flight-planning reference's PET and PSR chapters.

## Independent audit, 2026-10-24

Three auditor agents that did not build the bank re-checked all 365 published questions and the
CP/PNR notes, recomputing every numerical item and reading the book scan and the reference books
themselves (full tables: `audit_table_B.md`, `audit_table_C.md`).

- PSR/PET (102) and CP/PNR notes: 0 wrong keys, no wrong formula or number. All 5 CORRECTED items upheld.
- Scale and Descents (126): 0 wrong keys. All 9 CORRECTED items upheld. 2 ambiguous (rule of thumb
  against exact geometry).
- Theory and flight computer (137): **1 wrong key, CIRCLES#68**. The builder kept the Word copy's
  mistyped option c (60S and 55N) and re-keyed a; the book prints 60N and 55N, keyed c. 2 ambiguous,
  1 impossible stem, 1 wrong explanation method. 2 not found in the reference books (INS#7, INS#32).

Fixed after the audit: CIRCLES#68 restored and keyed c. Dropped CIRCLES#84 (impossible stem),
CHART THEORY#25 (the reference book and the source disagree), INS#106 (the reference answer is not
offered), DESCENTS#37 and SCALE#36 (repeats). Stems now name the method or leg in DESCENTS#78/#95
and PSR&PET#30/#33/#55/#80/#83. Explanations rewritten for the polar stereographic items (exact
convergency of 1), PSR radius-of-action items (full wind triangle), DESCENTS#12 and the "nearest
option" wording. Four stem-changed items relabelled CORRECTED. Notes: removed the unsupported
"Radius of Action" name and the dangling cross-reference, and added a crosswind warning.

Published after the audit: **360**. For the Captain's ruling: CHART THEORY#25 (transverse Mercator
convergency) and INS#106 (737 CDU message priorities). Not reference-checked: INS#7 and INS#32
(published; the key matches the source and the physics).
