# Oxford Technical General import — 26 Oct 2026

## Source

`D:\06 Technical General\Questions\Question Banks and Undated Papers\OXFORD QUESTIONS-TECHNICAL GENERAL.pdf`

The PDF contains the Oxford ATPL **Principles of Flight** question bank (chapters 1–9, 11–13, 15–17) and the **Powerplant** chapter 2 question bank. Each chapter has a numbered answer grid.

## What was checked

- Parsed 603 questions from the cleanly numbered segments.
- Rejected segments where the question numbering and answer grid did not align:
  - Stability (chapter 10): question 24 missing; 23 parsed questions against 31 answer letters.
  - High Speed Flight (chapter 13): 27 parsed questions against 29 answer letters.
  - Revision Questions (chapter 17): 182 mixed questions requiring separate classification.
- Rejected 14 questions with malformed option sets, 10 questions that need a figure/diagram the site cannot display, and 4 questions with repeated options.
- Rejected 3 exact stem duplicates already present in the live bank.
- Removed 4 within-source duplicate stem groups during selection.
- Removed one ambiguous valve-overlap question where two answer options were defensible.
- Every selected answer was taken from the Oxford answer grid.
- Every explanation was authored locally. The Oxford source supplies answer letters only; it does not supply explanations.
- Every selected stem was normalised and compared against the existing 4,326-question bank.
- Every selected question was checked for a valid answer index, four distinct options, a non-stub explanation, a chapter mapping, and no figure dependency.

## Imported batch

**103 questions**, all mapped to `technical-general`:

| Chapter | Questions |
|---|---:|
| tg-1 The Atmosphere and Its Properties | 5 |
| tg-2 Fundamental Aerodynamic Principles | 11 |
| tg-3 The Aerofoil and Subsonic Airflow | 4 |
| tg-4 Lift, Drag, and the Angle of Attack | 4 |
| tg-6 A Deeper Dive into Drag | 4 |
| tg-7 Stalling, Spinning, and Recovery | 8 |
| tg-8 High-Lift Devices | 4 |
| tg-10 Aircraft Controls | 4 |
| tg-11 Introduction to the Piston Engine and the Otto Cycle | 30 |
| tg-12 Engine Components and Construction | 16 |
| tg-13 Carburetion and Mixture Control | 1 |
| tg-14 Aviation Gasoline (AVGAS) and Combustion | 4 |
| tg-15 Engine Cooling Systems | 1 |
| tg-16 Engine Lubrication Systems | 1 |
| tg-17 Induction Icing and Ignition Systems | 1 |
| tg-18 Supercharging and Turbocharging | 2 |
| tg-32 Ice and Rain Protection | 3 |

By source:

- Oxford ATPL Principles of Flight question bank — 50
- Oxford ATPL Powerplant question bank — 53

## Result

- Live bank: **4,326 → 4,429 questions**
- Technical General pool: **184 → 287 questions**
- Every imported question survives the live de-dupe: **103/103**
- No duplicate stem against the pre-import bank.
- No missing or short explanation.
- No invalid answer index.
- No repeated option.
- No figure-dependent question.

## Verification run

- `npx tsx tools/audit/oxford-tech-general.mts` — PASS
- `npx tsx tools/audit/question-artifacts.mts` — clean (4,429 questions)
- `npx tsc --noEmit` — PASS
- `npm run lint` — 0 errors; 4 pre-existing warnings in unrelated audit scripts
- `npm run build` — PASS; 1,663 static pages; 679 sitemap entries; 108 video nodes
- Production smoke test: `GET /cpl/technical-general/tg-11/questions` returned 200 and served a new question plus its explanation.

No commit, push, or deploy was made.
