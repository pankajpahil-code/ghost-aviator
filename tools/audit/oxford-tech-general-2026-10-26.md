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
- Rejected questions with malformed option sets, repeated options, or a dependency on a figure/diagram the site cannot display.
- Rejected exact stem duplicates already present in the live bank.
- Removed within-source duplicate stem groups during selection.
- Removed one ambiguous valve-overlap question where two answer options were defensible.
- Every selected answer was taken from the Oxford answer grid.
- Every explanation was authored locally. The Oxford source supplies answer letters only; it does not supply explanations.
- Every selected stem was normalised and compared against the existing bank and against the other Oxford batch.
- Every selected question was checked for a valid answer index, four distinct options, a non-stub explanation, a chapter mapping, and no figure dependency.

## Imported batch 1

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

## Imported batch 2

**84 questions** selected from the remaining clean Oxford candidates:

| Chapter | Questions |
|---|---:|
| tg-1 The Atmosphere and Its Properties | 5 |
| tg-2 Fundamental Aerodynamic Principles | 15 |
| tg-3 The Aerofoil and Subsonic Airflow | 4 |
| tg-4 Lift, Drag, and the Angle of Attack | 5 |
| tg-5 Three-Dimensional Airflow and Wing Design | 5 |
| tg-6 A Deeper Dive into Drag | 7 |
| tg-7 Stalling, Spinning, and Recovery | 18 |
| tg-8 High-Lift Devices | 5 |
| tg-9 Aircraft Stability | 1 |
| tg-10 Aircraft Controls | 10 |
| tg-11 Introduction to the Piston Engine and the Otto Cycle | 6 |
| tg-32 Ice and Rain Protection | 3 |

Batch 2 focuses on the thin areas of the bank: wing-tip vortices and wake turbulence, ground effect, aspect ratio, stall patterns and warning devices, tailplane icing, control balancing and trim, climb/glide/turn mechanics, windshear, and propellers.

Rejected before import:

- Near-duplicates of batch 1 or the live bank, including the ground-effect lift item, the wake-vortex circulation item, the aspect-ratio definition, and the lift/drag perpendicular-to-flight-path item.
- Questions with OCR page-grid text embedded in an option.
- Figure-dependent items.
- Items with an ambiguous or clearly wrong printed answer, including:
  - the 16:1 headwind glide-ratio item, where the printed answer ignored the effect of wind on ground distance;
  - the ASI-calibration item that described calibration by ISA sea-level **temperature** rather than density;
  - the static-pressure item that defined pressure as the product of the mass of air;
  - the conservation-of-energy item whose printed answer pointed to the principle of continuity.

## Combined Oxford total

**187 questions** in the live bank:

| Chapter | Questions |
|---|---:|
| tg-1 The Atmosphere and Its Properties | 10 |
| tg-2 Fundamental Aerodynamic Principles | 26 |
| tg-3 The Aerofoil and Subsonic Airflow | 8 |
| tg-4 Lift, Drag, and the Angle of Attack | 9 |
| tg-5 Three-Dimensional Airflow and Wing Design | 5 |
| tg-6 A Deeper Dive into Drag | 11 |
| tg-7 Stalling, Spinning, and Recovery | 26 |
| tg-8 High-Lift Devices | 9 |
| tg-9 Aircraft Stability | 1 |
| tg-10 Aircraft Controls | 14 |
| tg-11 Introduction to the Piston Engine and the Otto Cycle | 36 |
| tg-12 Engine Components and Construction | 16 |
| tg-13 Carburetion and Mixture Control | 1 |
| tg-14 Aviation Gasoline (AVGAS) and Combustion | 4 |
| tg-15 Engine Cooling Systems | 1 |
| tg-16 Engine Lubrication Systems | 1 |
| tg-17 Induction Icing and Ignition Systems | 1 |
| tg-18 Supercharging and Turbocharging | 2 |
| tg-32 Ice and Rain Protection | 6 |

By source:

- Oxford ATPL Principles of Flight question bank — 134
- Oxford ATPL Powerplant question bank — 53

## Result

- Live bank: **4,326 → 4,513 questions**
- Technical General pool: **184 → 371 questions**
- Every imported question survives the live de-dupe: **187/187**
- No duplicate stem against the pre-import bank.
- No duplicate stem between batch 1 and batch 2.
- No missing or short explanation.
- No invalid answer index.
- No repeated option.
- No figure-dependent question.

## Verification run

- `npx tsx tools/audit/oxford-tech-general.mts` — PASS (187/187 live)
- `npx tsx tools/audit/question-artifacts.mts` — clean (4,513 questions)
- `npx tsc --noEmit` — PASS
- `npm run lint` — 0 errors; 4 pre-existing warnings in unrelated audit scripts
- `npm run build` — PASS; 1,663 static pages; 679 sitemap entries; 108 video nodes
- Production smoke test:
  - `GET /cpl/technical-general/tg-5/questions` returned 200 and served the new wing-tip-vortex, wake-turbulence, aspect-ratio, density, and density-altitude questions with explanations.
  - `GET /cpl/technical-general/tg-9/questions` returned 200 and served the new stability question with its explanation.

## Commit and push

Committed and pushed to `feat/ai-first-trust-pages` after the verification run above, under the Captain's instruction to commit and push the question-bank work. No deploy was made.
