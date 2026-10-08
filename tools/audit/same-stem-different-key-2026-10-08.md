# Question bank: items for Capt. Pahil to rule on (8 Oct 2026)

Written by `npx tsx tools/audit/bank-duplicates.mts <this file>`. Regenerate it, do not edit it by hand.
No key was changed and no winner was picked to produce this list. PENDING INDEPENDENT AUDIT.

```
raw copies after declared corrections: 4533
left out, need a figure: 77
held back, contradict a declared correction on the same stem: 5
hidden, same stem as a live copy but a different keyed answer: 22 copies of 19 live questions
  of which the hidden copy has the same set of options as the live one (the two keys contradict): 2
dropped as true duplicates (same stem, same keyed answer): 102
  of which the dropped copy had a different set of options: 34
live bank (ALL_QUESTIONS): 4327
stems with more than one live copy (must be 0): 0
kept copies that gained a subject from a dropped duplicate: 35
live short-stem questions (under 10 letters and digits): 18
live questions with a repeated or empty option: 4
(subject, chapterId) pairs matching no chapter: 58 (2342 question-subject pairs); questions with no chapterId: 17
```

## 1. Same stem, different keyed answer

Two sources carry the same question and key it differently. The copy marked LIVE is the one students
see, and it is the one they saw before 8 Oct 2026 (the first copy in source order). The copy marked
HIDDEN is not shown anywhere and was not shown before. Nothing here was decided by the loader: for each
pair the ruling needed is which key is right. If the hidden key is the right one, the live copy needs a
declared correction in lib/answer-corrections.ts.

### 1a. Options are the same set: the two keys contradict each other

**If variation is West, then:**

- LIVE, air-navigation+atpl-navigation / nav-2: keyed **True North is West of Magnetic North**
  - options: [x] True North is West of Magnetic North ; [ ] Compass North is West of Magnetic North ; [ ] True North is East of Magnetic North ; [ ] Magnetic North is West of Compass North
- HIDDEN, air-navigation / nav-15: keyed **True North is East of Magnetic North**
  - options: [ ] True North is West of Magnetic North ; [ ] Compass North is West of Magnetic North ; [x] True North is East of Magnetic North ; [ ] Magnetic North is West of Compass North
- HIDDEN, air-navigation+atpl-navigation / nav-2: keyed **True North is East of Magnetic North**
  - options: [ ] True North is West of Magnetic North ; [ ] Compass North is West of Magnetic North ; [x] True North is East of Magnetic North ; [ ] Magnetic North is West of Compass North
  - stem as printed in this copy: If variation is West; then:

**The wind velocity is 359/25. An aircraft is heading 180 at a TAS of 198 knots. (All directions are True). What is its track and ground speed?**

- LIVE, air-navigation / nav-33: keyed **180 223**
  - options: [ ] 179 223 ; [ ] 179 220 ; [ ] 180 220 ; [x] 180 223
- HIDDEN, air-navigation+atpl-navigation / nav-4: keyed **180.223**
  - options: [x] 180.223 ; [ ] 179.220 ; [ ] 180.220 ; [ ] 179.223

### 1b. Options differ between the copies

**If ELR = SALR = DALR, the atmosphere is:**

- LIVE, meteorology+atpl-meteorology / met-8: keyed **Indifferent (neutral)**
  - options: [ ] Stable ; [ ] Unstable ; [x] Indifferent (neutral)
- HIDDEN, meteorology+atpl-meteorology / met-9: keyed **Indifferent**
  - options: [ ] Stable ; [x] Indifferent ; [ ] Unstable
  - stem as printed in this copy: If ELR = SALR = DALR the atmosphere is

**What shape and colour is a landing direction indicator?**

- LIVE, air-regulations+atpl-air-regulations / ar-7: keyed **A white or orange capital T; land along the stem towards the crosspiece**
  - options: [ ] A white capital T; land along the stem towards the crosspiece ; [ ] An orange or red windsock, land towards the mast ; [x] A white or orange capital T; land along the stem towards the crosspiece ; [ ] An orange wedge shape in 3 dimensions, land towards the point of the wedge
- HIDDEN, air-regulations+atpl-air-regulations / ar-7: keyed **A white or orange capital T; land along the stem towards the crospiece**
  - options: [ ] A white capital T; land along the stem towards the crosspiece ; [ ] An orange or red windsock, land towards the mast ; [x] A white or orange capital T; land along the stem towards the crospiece ; [ ] An orange wedge shape in 3 dimensions, land towards the point of the wedge

**Flight time/flight duty time limitations shall be applicable to:**

- LIVE, air-regulations+atpl-air-regulations / ar-9: keyed **all flight crew personnel**
  - options: [ ] Pilots only ; [ ] Pilots and cabin crews only ; [ ] P-i-C and Co-pilot ; [x] all flight crew personnel
- HIDDEN, air-regulations+atpl-air-regulations / ar-9: keyed **P-i-c, Co-pilot, Flt Engg & Navigators only**
  - options: [x] P-i-c, Co-pilot, Flt Engg & Navigators only ; [ ] Pilots and cabin crews only ; [ ] P-i-C and Co-pilot only ; [ ] all crew personnel

**When two aircraft are converging at approximately the same altitude, which statement applies?**

- LIVE, air-regulations+atpl-air-regulations / ar-3: keyed **Gliders shall give way to balloons.**
  - options: [ ] Gliders shall give way to helicopters ; [ ] Aeroplanes shall give way to helicopters ; [ ] Helicopters shall give way to aeroplanes . ; [x] Gliders shall give way to balloons.
- HIDDEN, air-regulations+atpl-air-regulations / ar-3: keyed **Helicopters shall give way to gliders.**
  - options: [ ] Gliders shall give way to helicopters. ; [ ] Aeroplanes shall give way to helicopters. ; [ ] Helicopters shall give way to aeroplanes. ; [x] Helicopters shall give way to gliders.
- HIDDEN, air-regulations+atpl-air-regulations / ar-3: keyed **. Power-driven heavier -than-air aircraft shall give way to Gliders.**
  - options: [ ] Gliders shall give way to helicopters. ; [ ] Aeroplanes shall give way to power-driven heavier -than-air aircraft. ; [ ] Gliders shall give way to aeroplanes. ; [x] . Power-driven heavier -than-air aircraft shall give way to Gliders.
  - stem as printed in this copy: When two aircraft are converging at approximately the same altitude ,which statement applies ?
- HIDDEN, air-regulations+atpl-air-regulations / ar-3: keyed **Power-driven heavier -than-air aircraft shall give way to Gliders**
  - options: [ ] Gliders shall give way to helicopters. ; [ ] Aero planes shall give way to power-driven heavier -than-air aircraft. ; [ ] Gliders shall give way to aeroplanes. ; [x] Power-driven heavier -than-air aircraft shall give way to Gliders

**Minimum crew required on private aircraft is:**

- LIVE, air-regulations+atpl-air-regulations / ar-9: keyed **As specified in the certificate of the Airworthiness**
  - options: [ ] One pilot. ; [ ] Two pilots ; [x] As specified in the certificate of the Airworthiness ; [ ] The flight instructor along with private pilot.
- HIDDEN, air-regulations+atpl-air-regulations / ar-9: keyed **As specified in it’s certificate of the Airworthiness.**
  - options: [ ] One pilot. ; [ ] Two pilots, ; [x] As specified in it’s certificate of the Airworthiness. ; [ ] The flight instructor along with private pilot.

**Flight must invariably be conducted in accordance with Instrument Flight Rules, even during broad day light, when aircraft are flown.:**

- LIVE, air-regulations+atpl-air-regulations / ar-6: keyed **At or above F150.**
  - options: [x] At or above F150. ; [ ] Within controlled airspace. ; [ ] At or above F 200. ; [ ] In designated areas or designated routes.
- HIDDEN, air-regulations+atpl-air-regulations / ar-6: keyed **In class A airspace**
  - options: [ ] In class ‘D’ airspace ; [ ] Within controlled airspace. ; [x] In class A airspace ; [ ] In designated areas or designated routes.
  - stem as printed in this copy: Flight must invariably be conducted in accordance with Instrument Flight Rules, even during broad day light, when aircraft are flown:

**Decision altitude is related to:**

- LIVE, air-regulations+atpl-air-regulations / ar-4: keyed **Precision app**
  - options: [x] Precision app ; [ ] Non precision app ; [ ] Circling app ; [ ] both ‘a’& ’b’
- HIDDEN, air-regulations+atpl-air-regulations / ar-4: keyed **Precision Approaches &**
  - options: [x] Precision Approaches & ; [ ] Non precision approaches ; [ ] Circling approaches ; [ ] Both
  - stem as printed in this copy: Decision Altitude is related to:

**OCA is determined after taking into account margin for:**

- LIVE, air-regulations+atpl-air-regulations / ar-4: keyed **Terrine clearance**
  - options: [x] Terrine clearance ; [ ] Pilot error ; [ ] Operational congregations ; [ ] Weather considerations.
- HIDDEN, air-regulations+atpl-air-regulations / ar-4: keyed **Terrain clearance**
  - options: [x] Terrain clearance ; [ ] Pilot error ; [ ] Operational considerations ; [ ] Weather considerations.

**The aim of a compass swing is:**

- LIVE, air-navigation+atpl-navigation / nav-2: keyed **To find deviation, eliminate or reduce coefficients, and record residual deviation**
  - options: [ ] Only to find deviation on the cardinal headings and calculate coefficients ; [ ] Only to record residual deviation and prepare a compass correction card ; [x] To find deviation, eliminate or reduce coefficients, and record residual deviation ; [ ] None of the above
- HIDDEN, instrumentation / inst-16: keyed **answers 1, 2 and 3 are all correct**
  - options: [ ] only answer 1 is correct ; [ ] answers 1 and 3 are correct ; [x] answers 1, 2 and 3 are all correct ; [ ] none of the above answers are correct

**A VOR radial is defined as:**

- LIVE, air-navigation+atpl-navigation / nav-10: keyed **A bearing FROM the VOR**
  - options: [ ] A bearing TO the VOR ; [x] A bearing FROM the VOR ; [ ] The aircraft heading to reach the VOR ; [ ] A great circle from the VOR
- HIDDEN, radio-navigation / rnav-8: keyed **Magnetic bearing FROM the station to the aircraft (QDR)**
  - options: [ ] Magnetic heading to fly to the station ; [ ] True bearing from aircraft to station ; [ ] Magnetic heading of the aircraft ; [x] Magnetic bearing FROM the station to the aircraft (QDR)

**Conversion angle is:**

- LIVE, air-navigation+atpl-navigation / nav-3: keyed **Half the convergency**
  - options: [ ] Equal to convergency ; [x] Half the convergency ; [ ] Twice the convergency ; [ ] Equal to the change of longitude
- HIDDEN, air-navigation+atpl-navigation / nav-1: keyed **0.5 convergency**
  - options: [ ] convergency ; [ ] 4 times convergency ; [ ] twice convergency ; [x] 0.5 convergency

**If it is 0700 hours Standard Time in Kuwait, what is the Standard Time in Algeria?**

- LIVE, air-navigation / nav-33: keyed **0500 hours**
  - options: [x] 0500 hours ; [ ] 0900 hours ; [ ] 1200 hours ; [ ] 0300 hours
- HIDDEN, air-navigation+atpl-navigation / nav-1: keyed **0500**
  - options: [x] 0500 ; [ ] 0900 ; [ ] 1200 ; [ ] 0300

**The chart that is generally used for navigation in polar areas is based on a:**

- LIVE, air-navigation+atpl-navigation / nav-3: keyed **Stereographic projection**
  - options: [ ] Direct Mercator projection ; [ ] Gnomonic projection ; [ ] Lambert conformal projection ; [x] Stereographic projection
- HIDDEN, air-navigation+atpl-navigation / nav-3: keyed **Stereographical projection**
  - options: [x] Stereographical projection ; [ ] Direct Mercator projection ; [ ] Gnomonic projection ; [ ] Lambert conformal projection

**A rhumb line is:**

- LIVE, air-navigation+atpl-navigation / nav-5: keyed **A line on the Earth which cuts all meridians at the same angle**
  - options: [ ] The vertex of a conformal polyformic projection ; [ ] A straight line on a Lambert's conformal chart ; [x] A line on the Earth which cuts all meridians at the same angle ; [ ] The shortest distance between two points on the Earth's surface
- HIDDEN, air-navigation+atpl-navigation / nav-3: keyed **a line on the surface of the earth cutting all meridians at the same angle**
  - options: [ ] the shortest distance between two points on a Polyconic projection ; [x] a line on the surface of the earth cutting all meridians at the same angle ; [ ] any straight line on a Lambert projection ; [ ] a line convex to the nearest pole on a Mercator projection
  - stem as printed in this copy: A Rhumb line is:

**Which of the following differences in latitude will give the biggest difference in the initial great circle track and the mean great circle track between two points separated by 10° change of longitude?**

- LIVE, air-navigation / nav-33: keyed **60N and 60N**
  - options: [ ] 60N and 60S ; [x] 60N and 60N ; [ ] 30S and 30N ; [ ] 30S and 25S
- HIDDEN, air-navigation+atpl-navigation / nav-3: keyed **60N and 55N**
  - options: [ ] 60N and 60S ; [x] 60N and 55N ; [ ] 30S and 30N ; [ ] 30S and 25S
  - stem as printed in this copy: Which of the following differences in latitude will give the biggest difference in the initial Great Circle track and the mean Great Circle track between two points separated by 10° change of longitude?

**Course 040°(T), TAS 120 kt, Wind speed = 30 knots. From which direction will the wind give the greatest drift?**

- LIVE, air-navigation / nav-33: keyed **245°(T)**
  - options: [ ] 220°(T) ; [ ] 230°(T) ; [ ] 235°(T) ; [x] 245°(T)
- HIDDEN, air-navigation+atpl-navigation / nav-4: keyed **240°T**
  - options: [ ] 215° ; [ ] 230°T ; [ ] 235°T ; [x] 240°T
  - stem as printed in this copy: Course 040°T, TAS 120 kt, Wind speed 30 knots. From which direction will the wind give the greatest drift:

**By what amount must you change your rate of descent given a 10-knot increase in headwind on a 3° glide slope?**

- LIVE, air-navigation+atpl-navigation / nav-5: keyed **50 ft/min decrease**
  - options: [ ] 50 ft/min increase ; [ ] 30 ft/min increase ; [x] 50 ft/min decrease ; [ ] 30 ft/min decrease
- HIDDEN, air-navigation+atpl-navigation / nav-5: keyed **50 feet per minute increase** (this copy has a repeated or empty option)
  - options: [ ] 50 feet per minute increase ; [ ] 30 feet per minute increase ; [x] 50 feet per minute increase ; [ ] 30 feet per minute decrease
  - stem as printed in this copy: By what amount must you change your rate of descent given a 10 knot increase in headwind on a 3° glideslope:

### 1c. Held back: a declared correction already rules on this stem

These copies are NOT live. lib/answer-corrections.ts carries a ruling for the stem, a copy keyed to the
ruled answer is live, and this other copy keys something else. They were not live before 8 Oct either.

**Which of the following occurrences to an aircraft in flight should be considered an aviation accident?**

- LIVE, air-regulations+atpl-air-regulations / ar-8: keyed **A passenger suffers second degree burns from a loose gallery kettle**
  - options: [ ] An engine disintegrates but causes no further damage ; [ ] A wingtip is broken off in a collision ; [ ] One passenger is stabbed by another ; [x] A passenger suffers second degree burns from a loose gallery kettle
- HIDDEN, air-regulations+atpl-air-regulations / ar-8: keyed **An undercarriage leg requires replacement after a heavy landing**
  - options: [ ] An extinguished engine fire damages the engine oil system ; [ ] One pilot is incapacitated by food poisoning for 36 hours ; [x] An undercarriage leg requires replacement after a heavy landing ; [ ] An aborted take-off bursts 6 tyres

**In separation between IFR and IFR is provided in______class of Airspace.**

- LIVE, air-regulations+atpl-air-regulations / ar-6: keyed **C, D & E**
  - options: [ ] B ; [ ] A & B ; [x] C, D & E ; [ ] D, E,F & G
- HIDDEN, air-regulations+atpl-air-regulations / ar-6: keyed **‘D’**
  - options: [x] ‘D’ ; [ ] A & B ; [ ] D& F ; [ ] D, E,F & G

**The maximum permitted flight time for flight crew is :**

- LIVE, air-regulations+atpl-air-regulations / ar-9: keyed **1000 hours in any 365 consecutive days**
  - options: [ ] 69 hours in the 27days prior to the flight ; [ ] 100 hours in the 27days before the current flight ; [x] 1000 hours in any 365 consecutive days ; [ ] 1200 hours in the year upto end of the month prior to present flight
- HIDDEN, air-regulations+atpl-air-regulations / ar-9: keyed **100 hours in the 27days before the current flight**
  - options: [ ] 69 hours in the 27days prior to the flight ; [x] 100 hours in the 27days before the current flight ; [ ] 1000 hours in the year up to the end of the month prior to the present flight ; [ ] 1200 hours in the year up to end of the month prior to present flight

**An aircraft on a reciprocal track will be separated by:**

- LIVE, air-regulations+atpl-air-regulations / ar-3: keyed **10 mins before and after the estimated time of passing**
  - options: [ ] 15 mins at the time of crossing levels ; [ ] 15 mins at the time climb is initiated ; [x] 10 mins before and after the estimated time of passing ; [ ] 10 mins at the time the climb is initiated
- HIDDEN, air-regulations+atpl-air-regulations / ar-3: keyed **10 mins after the time levels are crossed**
  - options: [ ] 15 mins at the time of crossing levels ; [ ] 15 mins at the time climb is initiated ; [x] 10 mins after the time levels are crossed ; [ ] 10 mins at the time the climb is initiated

**Met report contains**

- LIVE, air-regulations+atpl-air-regulations / ar-13: keyed **Air temp, turbulence, wind**
  - options: [x] Air temp, turbulence, wind ; [ ] Air temp, clouds above, turbulence ; [ ] Air temp, cabin pressure, winds
- HIDDEN, air-regulations+atpl-air-regulations / ar-13: keyed **Air temp, turbulence, spot mind**
  - options: [x] Air temp, turbulence, spot mind ; [ ] Air temp, clouds above, turbulence ; [ ] Air temp, cabin pressure, minds

## 2. Kept copies that gained a subject from a dropped duplicate

The kept copy now also counts toward the gained subject (subject pool, mock tests). It keeps its own
chapter id, so it does not appear in the dropped copy's chapter. Where the two chapters differ and the
gained subject has its own chapter bank, that chapter is still one question short.

| Stem | Kept copy | Gained subject(s) | Dropped copy was filed under |
|---|---|---|---|
| Deviation due to coefficient A is mainly caused by: | nav-2 | instrumentation | instrumentation / inst-16 |
| Ohm's law states: | tg-34 | radio-telephony | radio-telephony / rtf-7 |
| The value of variation: | nav-15 | atpl-navigation | air-navigation+atpl-navigation / nav-2 |
| The angle between True North and Magnetic North is known as: | nav-15 | atpl-navigation | air-navigation+atpl-navigation / nav-2 |
| Isogonal lines converge as follows: | nav-15 | atpl-navigation | air-navigation+atpl-navigation / nav-2 |
| An aircraft flies a great circle track from 56°N 070°W to 62°N 110°E. The total distance travelled is: | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-3 |
| You are flying 090°(C) heading. Deviation is 2W and Variation is 12E. Your TAS is 160 knots. You are flying th | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-4 |
| In which months is the difference between apparent noon and mean noon the greatest? | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-1 |
| On a direct Mercator chart, great circles are shown as: | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-3 |
| Your pressure altitude is FL55, the QNH is 998, and the SAT is +30°(C). What is density altitude? | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-4 |
| On a particular take-off, you can accept up to 10 knots tailwind. The runway QDM is 047, the variation is 17°E | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-4 |
| The pressure alt is 29 000 feet and the SAT is -55°(C). What is density altitude? | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-4 |
| How does scale change on a normal Mercator chart? | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-3 |
| Ground speed is 540 knots. 72 NM to go. What is time to go? | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-4 |
| An aircraft at FL370 is required to commence descent at 120 NM from a VOR and to cross the facility at FL130.  | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-5 |
| The angle between the plane of the Equator and the plane of the Ecliptic is: | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-1 |
| Position A is at 70S 030W, position B is 70S 060E. What is the great circle track of B from A, measured at A? | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-3 |
| A straight line is drawn on a North Polar Stereographic chart joining Point A (7000N 06000W) to Point B (7000N | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-3 |
| You leave A to fly to B, 475 NM away, at 1000 hours. Your ETA at B is 1130. At 1040, you are 190 NM from A. Wh | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-4 |
| An aircraft is at 5530N 03613W, where the variation is 15W. It is tuned to a VOR located at 5330N 03613W, wher | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-3 |
| An aircraft’s compass must be swung: | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-2 |
| Civil Twilight occurs between: | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-1 |
| What is the effect on the Mach number and TAS in an aircraft that is climbing with constant CAS? | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-5 |
| An aircraft at position 0000N/S 16327W flies a track of 225°(T) for 70 NM. What is its new position? | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-5 |
| What is the meaning of the term ‘standard time’? | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-1 |
| Isogonals are lines of equal: | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-2 |
| On a direct Mercator chart, a rhumb line appears as a: | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-3 |
| Given: IAS 120 kt FL80 OAT +20°(C) What is the TAS? | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-4 |
| The distance between two waypoints is 200 NM. To calculate compass heading the pilot used 2°E magnetic variati | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-5 |
| Given: True course 300° Drift 8°R Variation 10°W Deviation -4° Calculate the compass heading. | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-4 |
| Given: True track 180° Drift 8°R Compass Heading 195° Deviation -2° Calculate the variation. | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-4 |
| Given the following: Magnetic heading: 060° Magnetic variation: 8°W Drift angle: 4° right What is the true tra | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-4 |
| Given: Half way between two reporting points the navigation log gives the following information: TAS 360 kt W/ | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-5 |
| Given: TAS = 485 kt, OAT = ISA +10°C, FL410. Calculate the Mach Number. | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-4 |
| Fuel flow per hr is 22 US.gal, total fuel on board is 83 imp.gal. What is the endurance? | nav-33 | atpl-navigation | air-navigation+atpl-navigation / nav-4 |

## 3. Left out because the question needs a figure the site cannot show

Predicate: `needsMissingFigure` in lib/questions.ts. They return when the figure exists and the
question pages can show it. `npx tsx tools/audit/figure-stems.mts` prints every stem that mentions a
picture, kept or left out, for re-reading after a new source is added.

| Filed under | Stem |
|---|---|
| instrumentation / inst-5 | The diagram below shows a simple altimeter. The parts labelled A, B, C and D are: |
| instrumentation / inst-16 | In the diagram below, the compass heading of the aircraft is ......., the magnetic heading ....... and the true heading ....... |
| instrumentation / inst-22 | The displays marked A, B, C, and D (refer to Annex A) are respectively: |
| instrumentation / inst-22 | Refer to display E (expanded ILS). The correct statement is: |
| instrumentation / inst-22 | On display D (Plan mode) the track from ZAPPO to BANTU is: |
| instrumentation / inst-22 | On display C (expanded VOR/ILS) the centre of the weather returns is: |
| instrumentation / inst-22 | The drawing shows the (i)... displaying (ii)... and (iii)... (i) EADI / PFD / ND / EHSI (ii) 600 ft RA / 600 kt / 600 ft (iii) 200 ft DH / 200 ft AGL |
| instrumentation / inst-22 | Symbols A, C, and E (in the symbol diagram) are best described respectively as: |
| radio-navigation / rnav-16 | Best action to insert accurate IRS position using POS INIT page (Appendix A): |
| air-navigation+atpl-navigation / nav-1 | (Refer to figure 061-14) When it is 1000 Standard Time in Kuwait, the Standard time in Algeria : |
| air-navigation+atpl-navigation / nav-1 | (Refer to figures 061-13 and 061-15) An aircraft takes off from Guam at 2300 Standard Time on 30 April local date. After a flight of 11 HR 15 MIN it lands at Los Angeles (California). What is the Standard Time and local date of arrival (assume summer time rules apply)? |
| air-navigation+atpl-navigation / nav-1 | (Refer to figures 061-13 and 061-15) At 1200 Standard Time on the 10th of July in Queensland, Australia, what is the Standard Time in Hawaii, USA? |
| air-navigation+atpl-navigation / nav-1 | (Refer to figure 061-12) The UTC of sunrise on 6 December at WINNIPEG (Canada) (49° 50'N 097° 30'W) is: |
| air-navigation+atpl-navigation / nav-1 | (Refer to figure 061-04) Given: TAS is 120 kt ATA 'X' 1232 UTC ETA 'Y' 1247 UTC ATA 'Y' is 1250 UTC What is ETA 'Z'? |
| air-navigation+atpl-navigation / nav-1 | (Refer to figures 061-13 and 061-15) If it is 1200 Standard Time on 10th July in Queensland, Australia, the Standard Time in Hawaii, USA is: |
| air-navigation+atpl-navigation / nav-1 | (Refer to figures 061-13 and 061-15) What is the Standard Time in Hawaii when it is 0600 ST on the 16th July in Queensland, Australia? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) Given: SHA VOR N5243.3 W00853.1 CON VOR N5354.8 W00849.1 Aircraft position N5330 W00800. Which of the following lists two radials that are applicable to the aircraft position? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) What is the radial and DME distance from CON VOR/DME (N5354.8 W00849.1) to position N5400 W00800? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual – chart (E(LO)1 or figure 061-11) What is the radial and DME distance from BEL VOR/DME (N5439.7 W00613.8) to position N5410 W00710? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) Which of the following lists all the aeronautical chart symbols shown at position N5318.0 W00626.9? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) Given: CRK VOR/DME (N5150.4 W00829.7) Kerry aerodrome (N5210.9 W00931.4) What is the CRK radial and DME distance when overhead Kerry aerodrome? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) What is the average track (oT) and distance between CRN NDB (N5318.1 W00856.5) and EKN NDB (N5423.6 W00738.7)? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-10) What are the average magnetic course and distance between position N6000 W02000 and Sumburg VOR (N5955 W 00115)? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) What feature is shown on the chart at position N5351 W009017? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) Given: CRN VOR (N5318.1 W00856.5) DME 18 NM SHA VOR (N5243.3 W00853.1) DME 30 NM Aircraft heading 270o(M) Both DME distances decreasing What is the aircraft position? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual – chart (E(LO)1 or figure 061-11) Which of the following lists all the aeronautical chart symbols shown at position N5150.4 W00829.7? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) At position 5211N 00931W, which of the following denotes all the symbols? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-10) What are the initial true course and distance between positions N5800 W01300 and N6600 E00200? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual chart – E(LO)1 or figure 061-11) Given: SHA VOR (N5243.3 W00853.1) radial 223° CRK VOR (5150.4 W00829.7) radial 322° What is the aircraft position: |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-10) An aircraft on radial 315° at a range of 150 NM from MYGGENES NDB (N6206 W00732) is at position? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) Given: CON VOR/DME (5354.8 W00849.1) Castlebar aerodrome (N5351 W00917) What is the CON radial and DME distance when overhead Castlebar aerodrome |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-09) At 1215 UTC LAJES VORTAC (38° 46'N 027° 05'W) RMI reads 178°, range 135 NM. Calculate the aircraft position at 1215 UTC: |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-07) Assume a North polar stereographic chart whose grid is aligned with the Greenwich meridian. An aircraft flies from the geographic North pole for a distance of 480 NM along the 110°E meridian, then follows a grid track of 154° for a distance of 300 NM. Its position is now approximately: |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-10) An aircraft on radial 110° at a range of 120 NM from SAXAVORD VOR (N6050 W00050) is at position: |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-06) Complete line 5 of the 'FLIGHT NAVIGATION LOG' positions 'J' to 'K'. What is the HDGo (M) and ETA? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-06) Complete line 4 of the 'FLIGHT NAVIGATION LOG' positions 'G' to 'H'. What is the HDGo (M) and ETA? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-03) Which of the aeronautical chart symbols indicates a VOR/DME? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-03) Which of the aeronautical chart symbols indicates a DME? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-03) Which of the aeronautical chart symbols indicates an NDB? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-03) Which of the aeronautical chart symbols indicates a basic, non-specified, navigation aid? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) Which aeronautical chart symbol indicates a flight Information Region (FIR) boundary? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) Which aeronautical chart symbol indicates a Control Zone boundary? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-03) Which of the aeronautical chart symbols indicates a TACAN? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) Which aeronautical chart symbol indicates a group of unlighted obstacles? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) Which aeronautical chart symbol indicates a group of lighted obstacles? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) Which aeronautical chart symbol indicates an exceptionally high unlighted obstacle? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) What is the meaning of aeronautical chart symbol number 16? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) Which aeronautical chart symbol indicates a lightship? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) Which aeronautical chart symbol indicates a lighted obstacle? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) Which aeronautical chart symbol indicates an unlighted obstacle? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) Which aeronautical chart symbol indicates a Waypoint? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) Which aeronautical chart symbol indicates a compulsory reporting point? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) Which aeronautical chart symbol indicates a non-compulsory reporting point? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) Which aeronautical chart symbol indicates the boundary of advisory airspace? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) Which aeronautical chart symbol indicates an uncontrolled route? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-01) Which aeronautical chart symbol indicates an aeronautical ground light? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) SHA VOR (5243N 00853W) 205° radial CRK VOR (5150N 00829W) 317° radial What is the position of the aircraft? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) Your radial from the SHA VOR (5243N 00853W) is 120° M. From CRK VOR (5151N 00830W) 033° M. What is your position? |
| air-navigation+atpl-navigation / nav-3 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) What is the lat and long of the SHA VOR (5243N 00853W) 239M/36nm radial/range? |
| air-navigation+atpl-navigation / nav-3 | (Refer to figure 061-10) Which of the following beacons is 185 NM from AKRABERG (N6124 W00640)? |
| air-navigation+atpl-navigation / nav-4 | (Refer to figure 061-09) 1300 UTC DR position 37o30N 021o30W alter heading PORTO SANTO NDB (33o03N 016o23W) TAS 450 kt, Forecast W/V 360°/30 kt. Calculate the ETA at PORTO SANTO NDB: |
| air-navigation+atpl-navigation / nav-5 | (Refer to figure 061-01) What is the symbol for an unlighted obstacle? |
| air-navigation+atpl-navigation / nav-5 | (Refer to figure 061-01) What is the chart symbol for a lightship? |
| air-navigation+atpl-navigation / nav-5 | (Refer to figure 061-01) Which of the following is the symbol for an exceptionally high (over 1000 feet AGL) lighted obstruction? |
| air-navigation+atpl-navigation / nav-5 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) You are on a heading of 105°, deviation 3 E WTD NDB (5211.3N 00705.0W) bears 013R, CRK VOR (5150.4N 00829.7W) QDM is 211. What is your position? |
| air-navigation+atpl-navigation / nav-5 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) Kerry (5210.9N 00932.0W) is 41 nm DME, Galway 5318.1N 00856.5W) is 50 nm DME. What is your position? |
| air-navigation+atpl-navigation / nav-5 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) An aircraft is on the 025 radial from Shannon VOR (SHA, 5243N 00853W) at 49 DME. What is its position? |
| air-navigation+atpl-navigation / nav-5 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) What is the mean true track and distance from the BAL VOR (5318N 00627W) to CFN NDB (5520N 00820W)? |
| air-navigation+atpl-navigation / nav-5 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) You are at position 5340N 00840W. What is the QDR from the SHA VOR (5243N 00853W)? |
| air-navigation+atpl-navigation / nav-5 | Refer to figure 061-02) What is the True bearing of point A from point B? |
| air-navigation+atpl-navigation / nav-5 | (Refer to figure 061-11) Given: CON VOR (N5354.8 W00849.1) DME 30 NM CRN VOR (N 5318.1 W00856.5) DME 25 NM Aircraft heading 270o(M) Both DME distances decreasing What is the aircraft position? |
| air-navigation+atpl-navigation / nav-5 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) What are the symbols at Galway Carnmore (5318.1N 00856.5W)? |
| air-navigation+atpl-navigation / nav-5 | (Refer to Jeppesen Student Manual – chart E(LO)1 or figure 061-11) The airport at 5211N 00932W is: |
| air-navigation+atpl-navigation / nav-5 | (Refer to figure 061-06) Complete line 6 of the 'FLIGHT NAVIGATION LOG', positions 'L' to 'M'. what is the HDGo (M) and ETA? |
| air-navigation+atpl-navigation / nav-5 | (Refer to figure 061-06) Complete line 3 of the 'FLIGHT NAVIGATION LOG', positions 'E' to 'F'. What is the HDGo (M) and ETA? |
| air-navigation+atpl-navigation / nav-5 | (Refer to figure 061-06) Complete line 2 of the 'FLIGHT NAVIGATION LOG', positions 'C' to 'D'. What is the HDGo (M) and ETA? |
| air-navigation+atpl-navigation / nav-5 | (Refer to figures 061-06 and 061-05) Complete line 1 of the 'FLIGHT NAVIGATION LOG'; positions 'A' to 'B'. What is the HDGo (M) and ETA? |

## 4. Short-stem questions that are live again

The old loader deleted every stem under 10 letters and digits. Most of these are sound. A few read
like a stem that was cut short when it was extracted: those want a look.

| Filed under | Stem | Keyed answer | Options |
|---|---|---|---|
| meteorology+atpl-meteorology / met-6 | A gale is: | Persistent strong winds exceeding 33 kt, associated with a depression | Winds ≥44 kt with a thunderstorm ; A brief increase lasting minutes with a CB/dust storm ; Persistent strong winds exceeding 33 kt, associated with a depression |
| meteorology+atpl-meteorology / met-8 | The DALR is: | The rate at which an unsaturated parcel cools as it ascends | The rate at which an unsaturated parcel cools as it ascends ; The rate at which temperature falls with height in the environment ; The rate at which a saturated ascending parcel cools |
| air-regulations+atpl-air-regulations / ar-4 | UTC means | Coordinated Universal Time | Universal Time Check ; Coordinated Universal Time ; United Time Check ; None of the above |
| air-regulations+atpl-air-regulations / ar-4 | TMA means | Terminal Control Area | Terminal Maintenance Area ; The main Apron ; Terminal Control Area ; None of the above |
| air-regulations+atpl-air-regulations / ar-3 | 360º (M) is a: | East bound track in Semicircular system. | East bound track in Semicircular system. ; West bound track in Semicircular system ; North bound track in Semicircular system ; South bound track in Semicircular system |
| air-regulations+atpl-air-regulations / ar-4 | STAR is a: | Designated IFR arrival route | Designated IFR arrival route ; Designated VFR arrival route ; Designated arrival route ; All of the above |
| air-regulations+atpl-air-regulations / ar-10 | Hypoxia | Increases with altitude | Increases with altitude ; Is normally experienced below 8000 feet ; Is due to over breathing |
| air-regulations+atpl-air-regulations / ar-6 | OCA | Used in establishing compliance with appropriate obstacle clearance criteria. | Is specified to facilitate safe holding heights ; Used in establishing compliance with appropriate obstacle clearance criteria. ; Meets obstructions clearance criteria for take offs ; Is used to designate obstacle clearance along ATS routes |
| air-regulations+atpl-air-regulations / ar-8 | FDR | Maximum 1 hr of the oldest recording requires to be erased for testing | Min 1 hr of the oldest recording requires to be erased for testing ; Max I hr can be erased ; Last I hr can be erased ; Maximum 1 hr of the oldest recording requires to be erased for testing |
| air-regulations+atpl-air-regulations / ar-1 | ICAO is: | An independent and autonomous agency, with a constituency status in the UNO | An independent and autonomous agency, with a constituency status in the UNO ; A part and parcel of UNO as a non-specialised agency ; Not associated with UNO at all |
| technical-general / tg-8 | A slat is: | A movable aerofoil section that forms part of the leading edge | A fixed gap in the leading edge ; A movable aerofoil section that forms part of the leading edge ; A hinged section of the trailing edge ; An upper-surface spoiler panel |
| air-regulations / ar-25 | Smoking: | Reduces capacity to carry oxygen resulting in hypoxia at lower altitudes. | Has decreased susceptibility to Carbon Monoxide poisoning. ; Results in a 'masked hangover', rendering pilot unfit for flying. ; Reduces capacity to carry oxygen resulting in hypoxia at lower altitudes. |
| radio-telephony / rtf-4 | QDM is the: | Magnetic heading to steer (zero wind) to the station | Magnetic heading to steer (zero wind) to the station ; Magnetic bearing from the station ; True bearing from the station ; Distance to the station |
| radio-telephony / rtf-4 | QTE is a: | True bearing from the station | Magnetic heading to the station ; True bearing from the station ; Pressure setting ; Request to change frequency |
| radio-telephony / rtf-4 | QSY means: | Change frequency | Say again ; Change frequency ; Standby ; Report position |
| radio-telephony / rtf-6 | A METAR is a: | Routine observed aerodrome weather report | Routine observed aerodrome weather report ; Aerodrome forecast ; Pilot report ; NOTAM |
| radio-telephony / rtf-19 | A vector is: | A heading assigned by the controller, usually with a reason | A squawk code ; A heading assigned by the controller, usually with a reason ; A frequency ; A clearance to land |
| air-navigation+atpl-navigation / nav-5 | In an IRS: | accelerometers and platform are both strapped down | the accelerometers are strapped down but the platform is gyro stabilised ; the platform is strapped down but the accelerometers are gyro-stabilised ; accelerometers and platform are both gyro-stabilised ; accelerometers and platform are both strapped down |

## 5. Live questions with a repeated or empty option

Not edited: the missing distractor has to come from the source paper, and inventing one is not allowed.

- air-regulations+atpl-air-regulations / ar-6: **At an aerodrome special VFR may be authorized when**
  - options: [x] Visibility falls below 5 km or cloud ceiling is less than 1500 feet ; [ ] Visibility falls below 8 km or cloud ceiling is less than 1500 feet ; [ ] Visibility falls below 8 km or cloud ceiling is less than 1500 feet ; [ ] Visibility falls below 8 km or cloud ceiling is less than 1000 feet
- radio-navigation / rnav-15: **The DME frequency band is:**
  - options: [ ] 108–118 MHz ; [ ] 329–335 MHz ; [ ] 329–335 MHz ; [x] 960–1215 MHz
- radio-telephony / rtf-24: **What is the standard ICAO phonetic word for the number 3?**
  - options: [ ] THREE ; [ ] TREE ; [x] TREE
- air-navigation+atpl-navigation / nav-4: **The great circle distance between position A (59o34.1N 008o08.4E) and B (30o25.9N 171o51.6W) is:**
  - options: [x] 5,400 NM ; [ ] 10,800 NM ; [ ] 2,700 NM ; [ ] 10,800 NM

## 6. (subject, chapterId) pairs that match no chapter in lib/subjects.ts

Not remapped. For the Air Regulations subjects the bank uses the old 13-chapter ids on purpose and
lib/questions.ts routes site chapters to them, so those rows are expected. The ATPL Meteorology and
ATPL Navigation rows mean every chapter of those subjects is served the whole subject pool.
Rows with a chapter id from another subject (instrumentation | nav-2, radio-telephony | tg-34) and the
atpl-navigation rows for nav-15 and nav-33 come from section 2: a kept copy gained that subject.

| Subject | chapterId in the bank | Questions |
|---|---|---|
| air-regulations | sar | 41 |
| atpl-air-regulations | ar-1 | 74 |
| atpl-air-regulations | ar-10 | 76 |
| atpl-air-regulations | ar-11 | 1 |
| atpl-air-regulations | ar-12 | 6 |
| atpl-air-regulations | ar-13 | 40 |
| atpl-air-regulations | ar-2 | 28 |
| atpl-air-regulations | ar-3 | 76 |
| atpl-air-regulations | ar-4 | 64 |
| atpl-air-regulations | ar-5 | 42 |
| atpl-air-regulations | ar-6 | 113 |
| atpl-air-regulations | ar-7 | 84 |
| atpl-air-regulations | ar-8 | 43 |
| atpl-air-regulations | ar-9 | 128 |
| atpl-air-regulations | sar | 41 |
| atpl-meteorology | met-1 | 56 |
| atpl-meteorology | met-10 | 20 |
| atpl-meteorology | met-11 | 25 |
| atpl-meteorology | met-12 | 23 |
| atpl-meteorology | met-13 | 44 |
| atpl-meteorology | met-14 | 33 |
| atpl-meteorology | met-15 | 31 |
| atpl-meteorology | met-16 | 5 |
| atpl-meteorology | met-17 | 12 |
| atpl-meteorology | met-18 | 37 |
| atpl-meteorology | met-19 | 24 |
| atpl-meteorology | met-2 | 50 |
| atpl-meteorology | met-20 | 27 |
| atpl-meteorology | met-21 | 23 |
| atpl-meteorology | met-22 | 15 |
| atpl-meteorology | met-23 | 10 |
| atpl-meteorology | met-24 | 2 |
| atpl-meteorology | met-25 | 22 |
| atpl-meteorology | met-26 | 3 |
| atpl-meteorology | met-28 | 10 |
| atpl-meteorology | met-3 | 37 |
| atpl-meteorology | met-4 | 11 |
| atpl-meteorology | met-5 | 10 |
| atpl-meteorology | met-6 | 44 |
| atpl-meteorology | met-7 | 20 |
| atpl-meteorology | met-8 | 40 |
| atpl-meteorology | met-9 | 16 |
| atpl-navigation | nav-1 | 103 |
| atpl-navigation | nav-10 | 10 |
| atpl-navigation | nav-11 | 10 |
| atpl-navigation | nav-12 | 10 |
| atpl-navigation | nav-15 | 3 |
| atpl-navigation | nav-2 | 94 |
| atpl-navigation | nav-3 | 134 |
| atpl-navigation | nav-33 | 30 |
| atpl-navigation | nav-4 | 224 |
| atpl-navigation | nav-5 | 175 |
| atpl-navigation | nav-6 | 10 |
| atpl-navigation | nav-7 | 10 |
| atpl-navigation | nav-8 | 10 |
| atpl-navigation | nav-9 | 10 |
| instrumentation | nav-2 | 1 |
| radio-telephony | tg-34 | 1 |

Questions with no chapterId at all: 17.
