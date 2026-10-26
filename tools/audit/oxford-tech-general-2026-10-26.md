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
- Every selected stem was normalised and compared against the existing bank and against the other Oxford batches.
- Every selected question was checked for a valid answer index, four distinct options, a non-stub explanation, a chapter mapping, and no figure dependency.

## Imported batch 1

**103 questions**, all mapped to `technical-general`:

| Chapter | Questions |
|---|---:|
| tg-1 The Atmosphere and Its Properties | 5 |
| tg-2 Fundamental Aerodynamic Principles | 7 |
| tg-3 The Aerofoil and Subsonic Airflow | 4 |
| tg-4 Lift, Drag, and the Angle of Attack | 4 |
| tg-6 A Deeper Dive into Drag | 4 |
| tg-7 Stalling, Spinning, and Recovery | 5 |
| tg-8 High-Lift Devices | 4 |
| tg-10 Aircraft Controls | 4 |
| tg-11 Introduction to the Piston Engine and the Otto Cycle | 27 |
| tg-12 Engine Components and Construction | 16 |
| tg-13 Carburetion and Mixture Control | 1 |
| tg-14 Aviation Gasoline (AVGAS) and Combustion | 4 |
| tg-15 Engine Cooling Systems | 1 |
| tg-16 Engine Lubrication Systems | 1 |
| tg-17 Induction Icing and Ignition Systems | 1 |
| tg-18 Supercharging and Turbocharging | 2 |
| tg-32 Ice and Rain Protection | 3 |
| tg-37 Flight Mechanics: Climb, Glide and Turns | 4 |
| tg-38 Propellers | 3 |
| tg-39 Windshear and Microbursts | 3 |

By source:

- Oxford ATPL Principles of Flight question bank — 50
- Oxford ATPL Powerplant question bank — 53

## Imported batch 2

**84 questions** selected from the remaining clean Oxford candidates:

| Chapter | Questions |
|---|---:|
| tg-1 The Atmosphere and Its Properties | 5 |
| tg-2 Fundamental Aerodynamic Principles | 5 |
| tg-3 The Aerofoil and Subsonic Airflow | 4 |
| tg-4 Lift, Drag, and the Angle of Attack | 5 |
| tg-5 Three-Dimensional Airflow and Wing Design | 5 |
| tg-6 A Deeper Dive into Drag | 7 |
| tg-7 Stalling, Spinning, and Recovery | 12 |
| tg-8 High-Lift Devices | 5 |
| tg-9 Aircraft Stability | 1 |
| tg-10 Aircraft Controls | 10 |
| tg-32 Ice and Rain Protection | 3 |
| tg-37 Flight Mechanics: Climb, Glide and Turns | 10 |
| tg-38 Propellers | 6 |
| tg-39 Windshear and Microbursts | 6 |

Batch 2 focuses on wing-tip vortices and wake turbulence, ground effect, aspect ratio, stall patterns and warning devices, tailplane icing, control balancing and trim, climb/glide/turn mechanics, windshear, and propellers.

## Imported batch 3

**70 questions** selected from the remaining clean Oxford candidates:

| Chapter | Questions |
|---|---:|
| tg-1 The Atmosphere and Its Properties | 4 |
| tg-2 Fundamental Aerodynamic Principles | 9 |
| tg-3 The Aerofoil and Subsonic Airflow | 6 |
| tg-4 Lift, Drag, and the Angle of Attack | 5 |
| tg-6 A Deeper Dive into Drag | 4 |
| tg-7 Stalling, Spinning, and Recovery | 8 |
| tg-8 High-Lift Devices | 2 |
| tg-10 Aircraft Controls | 10 |
| tg-32 Ice and Rain Protection | 1 |
| tg-37 Flight Mechanics: Climb, Glide and Turns | 11 |
| tg-38 Propellers | 5 |
| tg-39 Windshear and Microbursts | 5 |

Batch 3 fills the foundational and applied gaps: work, power, inertia and kinetic energy; ISA and airspeed measurement; Bernoulli and continuity; aerofoil terminology and pressure distribution; lift, drag and aspect-ratio relationships; stall warning and stall speed; control balancing, irreversible controls and artificial feel; load factor, turns and glide performance; microburst recognition and recovery; propeller slip, blade angle and constant-speed operation.

Rejected before import:

- Near-duplicates of batch 1, batch 2 or the live bank, including the ground-effect lift item, the wake-vortex circulation item, the aspect-ratio definition, the lift/drag perpendicular-to-flight-path item, the dynamic-pressure definition, and the wake-turbulence wind-condition item.
- Questions with OCR page-grid text embedded in an option.
- Figure-dependent items.
- Items with an ambiguous or clearly wrong printed answer, including:
  - the 16:1 headwind glide-ratio item, where the printed answer ignored the effect of wind on ground distance;
  - the ASI-calibration item that described calibration by ISA sea-level **temperature** rather than density;
  - the static-pressure item that defined pressure as the product of the mass of air;
  - the conservation-of-energy item whose printed answer pointed to the principle of continuity.

## Dedicated chapter structure

The first pass had grouped three Oxford topics under the nearest existing chapter. That made the chapter titles misleading: propeller questions sat under the piston-engine chapter, flight mechanics under fundamental aerodynamics, and windshear under stalling. All three batches are now mapped as follows:

- **tg-37 Flight Mechanics: Climb, Glide and Turns** — 25 questions
- **tg-38 Propellers** — 14 questions
- **tg-39 Windshear and Microbursts** — 14 questions

The three new chapters are practice-question chapters. Their notes tiles are marked unavailable until dedicated notes are published, so the subject page does not advertise a notes page that would open a stub. The old chapters no longer carry the moved questions.

## Combined Oxford total

**257 questions** in the live bank:

| Chapter | Questions |
|---|---:|
| tg-1 The Atmosphere and Its Properties | 14 |
| tg-2 Fundamental Aerodynamic Principles | 21 |
| tg-3 The Aerofoil and Subsonic Airflow | 14 |
| tg-4 Lift, Drag, and the Angle of Attack | 14 |
| tg-5 Three-Dimensional Airflow and Wing Design | 5 |
| tg-6 A Deeper Dive into Drag | 15 |
| tg-7 Stalling, Spinning, and Recovery | 25 |
| tg-8 High-Lift Devices | 11 |
| tg-9 Aircraft Stability | 1 |
| tg-10 Aircraft Controls | 24 |
| tg-11 Introduction to the Piston Engine and the Otto Cycle | 27 |
| tg-12 Engine Components and Construction | 16 |
| tg-13 Carburetion and Mixture Control | 1 |
| tg-14 Aviation Gasoline (AVGAS) and Combustion | 4 |
| tg-15 Engine Cooling Systems | 1 |
| tg-16 Engine Lubrication Systems | 1 |
| tg-17 Induction Icing and Ignition Systems | 1 |
| tg-18 Supercharging and Turbocharging | 2 |
| tg-32 Ice and Rain Protection | 7 |
| tg-37 Flight Mechanics: Climb, Glide and Turns | 25 |
| tg-38 Propellers | 14 |
| tg-39 Windshear and Microbursts | 14 |

By source:

- Oxford ATPL Principles of Flight question bank — 204
- Oxford ATPL Powerplant question bank — 53

## Result

- Live bank: **4,326 → 4,583 questions**
- Technical General pool: **184 → 441 questions**
- Every imported question survives the live de-dupe: **257/257**
- Dedicated TG chapters added for the three previously misplaced topics.
- No duplicate stem against the pre-import bank.
- No duplicate stem between batch 1, batch 2 and batch 3.
- No missing or short explanation.
- No invalid answer index.
- No repeated option.
- No figure-dependent question.

## Verification run

- `npx tsx tools/audit/oxford-tech-general.mts` — PASS (257/257 live)
- `npx tsx tools/audit/question-artifacts.mts` — clean (4,583 questions)
- `npx tsc --noEmit` — PASS
- `npm run lint` — 0 errors; 4 pre-existing warnings in unrelated audit scripts
- `npm run build` — PASS; 1,678 static pages; 682 sitemap entries; 609 with lastmod; 108 video nodes
- Production smoke test:
  - `GET /cpl/technical-general/tg-2/questions` returned 200 and served the new work, inertia and rotation questions with explanations.
  - `GET /cpl/technical-general/tg-6/questions` returned 200 and served the new parasite-drag and aspect-ratio questions with explanations.
  - `GET /cpl/technical-general/tg-10/questions` returned 200 and served the new control-balance and artificial-feel questions with explanations.
  - `GET /cpl/technical-general/tg-37/questions` returned 200 and served the new load-factor and turn questions with explanations.
  - `GET /cpl/technical-general/tg-38/questions` returned 200 and served the new propeller-slip and counter-rotating questions with explanations.
  - `GET /cpl/technical-general/tg-39/questions` returned 200 and served the new microburst and windshear-recovery questions with explanations.
- `npm run build:lastmod` — regenerated the sitemap dates from git history; the sitemap audit reports 0 problems.

## Commit and push

Committed and pushed to `feat/ai-first-trust-pages` after the verification run above, under the Captain's instruction to commit and push the question-bank work. No deploy was made.
