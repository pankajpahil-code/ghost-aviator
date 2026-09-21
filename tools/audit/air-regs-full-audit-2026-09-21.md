# Air Regulations question bank: full audit (second pass), 21 Sept 2026

**Auditor:** Claude Opus 5 (independent: I did not write these questions)
**Scope:** every question the site serves under CPL and ATPL Air Regulations. That is 923 questions
after the site's de-duplication (IDs from `tools/audit/_dump-ar-all.mts`).
**Row-by-row verdicts:** `air-regs-full-audit-2026-09-21.tsv` (same folder).
**Nothing on the site was changed and nothing was committed.** Every correction is a proposal for the
Captain's ruling.

## Why there is a second pass

The first pass marked **145 questions BLOCKED** ("source not on disk") and moved on. That was a
half-finished job. The Captain rightly named the quarantine and incubation questions: the Aircraft
(Public Health) Rules are a free public statute that nobody went to get. This pass went and got the
sources:

- **DGCA CARs, downloaded from dgca.gov.in:**
  - Rules of the Air **9-C-I (2024)**, ATS 9-E-I (2026), AIS 9-I-I, SAR 9-S-I, minimum flight altitudes 9-R-I
  - Aerodrome Design **4-B-I (Dec 2025)**
  - All Weather Operations **8-C-I (Rev 2, 2026)**
  - Operations: CAT 8-O-II, GA 8-O-III, EDTO 8-S-I
  - Flight recorders 2-I-V and 2-I-VI, registration 2-F-I, documents on board 2-X-VII
  - Licensing and medical CARs in Series 7, FDTL 7-J-III, incidents 5-C-I
- **Statutes:**
  - Aircraft (Public Health) Rules 1954 (Health Ministry copy)
  - **Bharatiya Vayuyan Adhiniyam 2024**, which replaced the Aircraft Act 1934
  - **Aircraft (Investigation of Accidents and Incidents) Rules 2025**
  - Aircraft Rules 1937
- **AIP India AMDT 09/2026:** all GEN and ENR sections, plus AD 1.
- **Other official material:** AAI charges schedule, and FAA AIM chapters 2, 4, 7 and 8 with AC 90-48C, AC 120-90 and 14 CFR (for FAA-origin questions).
- **Textbooks and notes:** air law, ops, human-factors and navigation textbooks (verification only); the Captain's own notes.

## Result

| Status | Count |
|---|---|
| VERIFIED against a source read in this audit | **747** (81%) |
| **CORRECTED: keyed answer wrong, right option present (proposed)** | **26** |
| FLAGGED: outdated rule, no correct option, two right options, or the bank contradicts itself | 123 |
| DROPPED: text broken by extraction | 7 |
| CONSISTENT: answer looks right, but no document found stating it | 11 |
| BLOCKED: no source found after searching | 9 |

Blocked went from 145 to 9. Every one of the remaining 20 lists what was searched (section 6).

## 1. My own first-pass errors, reported first

1. **#407, formation flying.** I "corrected" the key from *Cannot fly* to *prior arrangement*, citing ICAO
   Annex 2. **DGCA Rules of the Air 3.1.8 says "No civil aircraft shall be flown in formation."**
   The bank's key was right for India. The correction is withdrawn.
2. **#539 / #763, en-route terrain clearance width.** I "corrected" 20 NM to 10 km from AIP GEN 3.3.
   **CAR 9-R-I 1.2 says 1000 ft clearance "within the route width of 20 nautical miles"**, which matches the
   key. The two official sources disagree. These are now FLAGGED for the Captain, not corrected.
3. The first pass cited a **2005 copy of Annex 2** as current. The 2024 DGCA Rules of the Air changes at
   least the ETA-revision threshold (3 → **2 minutes**) and the TAS deviation wording. #35 is now a correction.

The lesson is the same both times: an ICAO answer is not automatically the Indian answer. Check the
DGCA CAR first.

## 2. Proposed corrections (26)

| # | Site ch. | Question | Now | Should be | Source |
|---|---|---|---|---|---|
| 568 | ar-3 | Green light arc from the front | port | **starboard (A)** | CAR 9-C-I App 6 |
| 399 | ar-3 | When does a give-way aircraft alter LEFT | overtaking on ground | **never (D)** | CAR 9-C-I 3.2.2 = Annex 2 |
| 86 | ar-3 | Jaipur VFR, sunset 1318 | 2h46 | **3h06 (D)** | CAR 9-C-I 4.3: VFR until **sunset + 20 min** |
| 590 | ar-1 | Earliest VFR take-off, sunrise 0550 | 0550 | **0530 (A)** | CAR 9-C-I 4.3: from **sunrise − 20 min** |
| 35 | ar-18 | Inform ATC if ETA changes by | 3 min | **2 min (D)** | CAR 9-C-I 3.6.2.2 d) |
| 220, 387, 731 | ar-18 | Air-report Section 2 | met info | **operational info** | Doc 4444 4.12 |
| 133 | ar-9/11 | Regular AIP amendments | April, yearly | **as required (D)** | CAR 9-I-I 6.3.1.1 + AIRAC |
| 359 | ar-4 | Why wake is max after take-off | thrust | **high AoA, weight (C)** | FAA AIM 7-4 |
| 433 | ar-7/12 | Cat II height | 50 ft | **100 ft (C)** | CAR 8-C-I (Cat II DH ≥ 30 m) |
| 532 | ar-9/11 | RFF principal objective | extinguish fire | **save lives (D)** | CAR 4-B-I 9.2 |
| 245 | ar-13 | Cabin crew, 215 seats | 7 | **5 (B)** | Aircraft Rules 38B |
| 254 | ar-13 | Mathura refinery radius | 10 NM | **10 km (B)** | Aircraft Rules Sch I; AIP ENR 5.1 |
| 529 | ar-13 | "8 stripes each side" | 30 m | **60 m (C)** | CAR 4-B-I 5.2.4.5 |
| 251 | ar-13 | Typhus incubation | 5 days | **14 days (D)** | Public Health Rules 2(15) |
| 268 | ar-13 | Incident notification | 48 h | **24 h (A)** | Investigation Rules **2025** r.4(1) |
| 216 | ar-13 | FDP extension | 4 h | **2 h (B)** | CAR 7-J-III 16.1 |
| 550 | ar-13 | 120 h PIC in 29 days, what on day 30 | 8 h supernumerary | **6 h co-pilot (B)** | Aircraft Rules 42A (co-pilot time at 80%) |
| 464 | ar-13 | Day-VFR fuel, propeller aircraft | alternate + 45 min | **destination + 30 min (B)** | CAR 8-O-III 2.2.3.6 c) |
| 455, 616 | ar-22/25 | Oxygen for ALL crew and passengers | 700 hPa | **620 hPa (A)** | CAR 8-O-II 4.3.9.1 |
| 528 | ar-22/25 | Pressurised aeroplane oxygen | crew only | **crew and passengers (B)** | CAR 8-O-II 4.3.9.2 |
| 723 | ar-2/14/15 | ATPL aged 28, medical | 6 months | **12 months (B)** | Aircraft Rules 39C(5) |
| 852 | ar-23 | Cockpit noise, SHELL interface | L–L | **L–Environment (B)** | HPL textbook ch.14 |
| 905 | ar-25 | Flicker from rotors/props | "no harm" | **flicker vertigo (B)** | HPL textbook |

## 3. Law that changed underneath the bank

- **Aircraft Act 1934 → Bharatiya Vayuyan Adhiniyam 2024.** s.39 still bars trespass/nuisance suits for flight
  at a reasonable height. That supports the "cannot be sued" answers (#78, #403, #435).
- **Accident/incident notification → Investigation Rules 2025 r.4(1): both within 24 hours.** #268 is corrected;
  #631 has no correct option.
- **VFR hours → sunrise −20 to sunset +20** (CAR 9-C-I 4.3). The bank's sunrise/sunset timing questions are all affected.
- **Cat II/III → CAR 8-C-I 2026:** Cat II RVR ≥ **300 m**, and no IIIA/IIIB split. The 350 m and 200 m keys are outdated
  (#452, #453, #482, #617, #716).
- **FDTL → CAR 7-J-III:** the old domestic/international hours-and-landings tables are gone (#92, #424, #520, #738,
  #754, #143, #553, #412, #541, #765).
- **Licence validity → 10 years** (G.S.R. 733(E), 2023): #574, #621 have no current option.
- **Registration → CAR 2-F-I 7.3:** the certificate is valid until the date printed on it. "Till destroyed" is outdated
  (#581, #728, #740).
- **CVR → last 2 hours** (CAR 2-I-VI 4.3.1): #120 has no correct option.
- **Demolition Rules 1994 → replaced by 2026 Rules** (#263, #510 need rewording).
- **"Default minima for operators who haven't filed" (3.7 km)** no longer exists in CAR 8-C-I (#107, #283, #320).
- **Anti-collision lights "above 5700 kg"** has no current basis. CAR 8-O-II 6.10 requires them on all aeroplanes at
  night (#225, #297, #336, #365).
- **Route designator colours** are obsolete. CAR 9-E-I App 1 uses letters only (#128, #610).

## 4. The bank contradicts itself

- Night: 20 vs 30 minutes (#226, #289, #393, #513 vs #710, #752). The 20 minutes is VFR (CAR 9-C-I 4.3). The 30 minutes is the
  licensing/logging definition (Aircraft Rules Sch. II para 4).
- Cabin crew for 215 seats: #245 vs #394. Typhus: #251 vs #423. Threshold stripes: #529 vs #427.
- Oxygen: #172 (620) vs #455/#616 (700).
- Flight plan for "all flights" (#378, #542) vs "all except local" (#589, #712, #764).
- Airspace classes #269/#458 vs #373. IMC hand-off #753 vs #662/#691.

## 5. Recommended drops (broken text)

#10, #20, #292, #426, #438, #462, #651: the stem or the correct option was split during extraction.

## 6. What is still open (20), and what was searched

- **BLOCKED (9):**
  - #463 (50 m holding distance): Rules of the Air CAR, aerodrome CAR, Doc 4444, air-law textbook.
  - #795 (who initiates convention implementation): Captain's Ch.1 notes, BVA 2024.
  - #548 (lowest transition level, stem lost "India"): AIP ENR 1.7, CAR 9-C-I, CAR 9-E-I. No fixed value is published.
  - #331 (forced-landing take-off rule): Aircraft Rules, Investigation Rules 2025, CAR 5-C-I.
  - #432 and #766 (who clears a pilot after an incident): same sources plus the Captain's accident notes.
  - #638 (flight plan retention period): CAR 8-O-II, 8-O-III.
  - #869 and #874 (physiology phrasing): HPL textbook, FAA AIM 8-1.
- **CONSISTENT, no document found (11):** #134, #670 (centrifugal-force sensation); #448, #592 (circling OCA/H
  higher than precision); #502, #916 (hypothermia definition); #855, #860, #871, #878, #880. The answers look right,
  but I didn't find them stated in a held source.

## What this audit does NOT prove

- **VERIFIED means the keyed option matches the cited source.** It does not mean the stem is well written. Many stems
  still carry typos or dropped words.
- **Some verdicts rest on FAA or UK sources** where no Indian or ICAO text was found. Every one is labelled in the TSV:
  navigation-light failure (UK Rules of the Air), FDR test erasure (14 CFR 121.343), and the FAA-origin human-factors items.
- **The 15 NM international-border rule (#236, #271, #346, #774)** is verified only against the Captain's own ATS notes.
  The regulation behind it was not located in the AIP or CARs searched.
- **Doc 4444 on disk is the 2007 edition.** Separation minima were cross-checked with CAR 9-E-I and the AIP where they
  overlap, but not every paragraph was.
- **This is one auditor's pass.** Under the two-pass rule, the 26 corrections should get a second check before
  they're applied.

## To apply, once the Captain has ruled

Add each accepted change to `verify-repair.mjs`'s `INTENTIONAL` list, then edit the bank. Run
`node tools/audit/verify-repair.mjs`: it must show 0 undeclared answer changes. Then build and push.
