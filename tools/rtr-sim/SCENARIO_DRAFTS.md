# RTR(A) Simulator — Six Scenario Scripts

**STATUS: DRAFT for Capt. Pahil's review. Nothing here publishes until he approves each
scenario.** Drafted 2026-07-19 by Claude Fable 5 per `RTR_SIMULATOR_DESIGN.md` §8.

**Sources cited per exchange:**
- `[ChNN §x.y]` — *The Complete RTR(A) Examination Book* (the Captain's own book, the
  authoritative teaching source; chapter files in `D:/antigravity/rtr a/`).
- `[CAR III(n)]` — CAR Series G Part VI, Section 7 (dated 27.11.2025), Annexure A syllabus,
  Part III Radio Telephony item (n). (Scanned PDF in `Downloads\rtr`, transcribed visually
  2026-07-19.)
- `[9432 §x.y]` — ICAO Doc 9432 *Manual of Radiotelephony*, 4th ed. 2007; `[4444 §12.x]` —
  ICAO Doc 4444 PANS-ATM Ch.12 phraseologies; `[A10-II §5.3.x]` — Annex 10 Vol II (Jul 2016,
  Am.92). All three now on disk in `C:\Users\Admin\Downloads\radio fable reference\`.

**VERIFICATION PASS 2026-07-19 (Fable, against the primary ICAO sources above):**
- **Confirmed near-verbatim by ICAO models:** radio-check format [9432 §2.7]; taxi +
  give-way [9432 §4.4 model]; conditional line-up condition-first-and-last [9432 §4.5];
  go-around & pilot "going around" [9432 §4.8.3]; runway-vacated reporting [9432 §4.4];
  position-report element order [9432 §3.4.1]; "looking out"/"traffic in sight" [9432 §6.4];
  clock-code traffic descriptors [4444 §12.4.1.8]; MAYDAY/PAN-PAN ×3 and message elements
  [9432 §9.2.1, A10-II §5.3.2.1]; squawk-7700 note [9432 §9.2.1.2]; silence imposition &
  termination structure [9432 §9.2.2–9.2.3, A10-II §5.3.2.2/5.3.2.5.3]; braking action
  "medium to poor" [4444 §12 runway-report]; QNH-only readback of a weather transmission
  [9432 §10.1 model].
- **Corrections applied in this revision (v2):**
  1. RVR values follow the WHOLE-HUNDREDS rule ("six hundred"), NOT digit-by-digit
     [9432 §2.4.3 lists RVR under the hundred/thousand rule; §10.2 model]. Values changed
     to clean hundreds; readback downgraded from CRITICAL to good-practice (ICAO model
     acknowledges RVR with "roger" [9432 §10.2]; RVR is not on the mandatory-readback list).
  2. Hold phrase is "EXPECT FURTHER CLEARANCE AT (time)" [9432 §8.7 model]; "onward
     clearance" kept as an accepted variant (the concept term the book uses).
  3. Avoiding action: ICAO transmission is "TURN LEFT/RIGHT IMMEDIATELY HEADING (xxx) TO
     AVOID TRAFFIC (clock, distance)" [4444 §12.4.1.8 e]; the spoken prefix "avoiding
     action" is UK CAP413/common practice, not ICAO — kept as an accepted ATC variant,
     **Captain to decide which the sim voices by default**.
  4. Conditional line-up now includes "and wait" [9432 §4.5 model: "BEHIND THE LANDING
     AIRBUS LINE UP AND WAIT BEHIND"].
  5. Level instructions include "TO" ("climb TO flight level…", "descend TO … feet") per
     every 9432 model dialogue; pilot readbacks accepted with or without "to".
  6. Distress-silence beats now use the aeronautical signals only: "ALL STATIONS …
     STOP TRANSMITTING, MAYDAY" and "ALL STATIONS … DISTRESS TRAFFIC ENDED"
     [9432 §9.2.2–9.2.3, A10-II §5.3.2.2/5.3.2.5.3]. SEELONCE MAYDAY / SEELONCE FEENEE are
     the MARITIME mobile-service signals (RTR written syllabus item I(iv)) — moved to the
     debrief as taught knowledge, not ATC dialogue.
- **⚠️ For the Captain — two candidate errata in the published book (your call, with the
  working shown, per the covenant):** (a) Ch21's exam-trap line "…but still spoken digit by
  digit" for RVR contradicts both its own transcript ("six hundred metres") and 9432 §2.4.3;
  (b) Ch20 §20.4 presents SEELONCE MAYDAY/FEENEE as the standard aeronautical signal with
  "STOP TRANSMITTING MAYDAY" as the alternative — Annex 10 Vol II and 9432 use STOP
  TRANSMITTING/DISTRESS TRAFFIC ENDED for aeronautical RT; SEELONCE belongs to the maritime
  procedure (still examinable in the written paper). Also a style note: the book's
  transcripts omit "TO" in level instructions; ICAO models include it.

**Conventions (consistent across scenarios, following the book's own transcripts):**
- Stations: Delhi Delivery/Ground/Tower/Approach, Chennai Control — the book's convention.
- Frequencies: Ground 121.9 · Tower 118.1 · Approach 119.3 · Control 127.5.
- Callsigns: VT-ABC (Type 1, trainer) and "Ghostair" + flight number (Type 3, the book's own
  fictional telephony designator). No real airline names.
- All numeric values are chosen to exercise the number rules [Ch13 §13.4–13.5] and are spoken
  digit-by-digit in the expected responses (QNH, squawk, headings, FL, frequencies).

**Scoring legend (engine semantics per design doc §5):**
- `CRITICAL` — safety-critical readback slot: wrong value = safety error (branch to ATC
  correction/probe); missing = deduction + `onMiss` probe branch.
- `minor` — format/order/callsign-placement slips; deduction only.
- `probe` — the branch ATC takes when a slot is missed, exactly as a WPC examiner would.
- Every expected response ends with the pilot's callsign [Ch14 §14.7 — minor if missing].
- The canonical mandatory-readback list: route clearances; runway clearances (enter/land/
  take off/backtrack/cross/hold short); runway in use; levels; headings; speeds; QNH/QFE;
  squawk; frequency changes [Ch14 §14.7; CAR III(i)].

**Review request to the Captain:** correct any phrase, value, station or sequencing against
how the WPC practical actually runs. Strike or rewrite freely — these are your scenarios;
this file is only the first officer's draft of them.

---

## SCN-1 — VFR Departure (radio check → taxi → conditional line-up → take-off → leaving the zone)

*Aircraft:* Cessna 172, **VT-ABC** (Type 1 callsign). *ATIS Charlie:* RWY 27, wind 270°/08 kt,
QNH 1013. *Exam mapping:* CAR III(i) test procedures + call signs, III(iii) aerodrome control.
*Teaches:* radio check & readability scale, taxi ≠ runway entry, "departure" vs "take-off",
conditional clearances, circuit departure reports.

1. **PILOT (expected):** "Delhi Ground, VT-ABC, radio check on one two one decimal nine."
   — slots: station+self order `minor` [Ch14 §14.5], phrase "radio check" + frequency `CRITICAL`
   [Ch13 §13.8, Ch14 §14.8; CAR III(i)]
   **ATC:** "VT-ABC, Delhi Ground, readability five."
   **PILOT:** "VT-ABC, readability five also." — slot: own readability report `minor` [Ch13 §13.8]

2. **PILOT:** "Delhi Ground, VT-ABC, Cessna 172 at the flying club apron, VFR to the north,
   request taxi, information Charlie." — slots: type/position/intentions `minor`, ATIS ident
   `minor` [Ch15 §15.2]
   **ATC:** "VT-ABC, taxi to holding point Alfa One runway two seven via taxiway Bravo,
   QNH one zero one three."
   **PILOT:** "Taxi to holding point Alfa One runway two seven via Bravo, QNH one zero one
   three, VT-ABC." — slots: holding point `CRITICAL`, runway `CRITICAL`, QNH value `CRITICAL`
   [Ch15 §15.4; Ch14 §14.7]
   *probe (QNH missed):* ATC: "VT-ABC, confirm QNH?" *probe (wrong QNH read back):* ATC:
   "VT-ABC, negative, QNH one zero one three, read back."

3. **ATC:** "VT-ABC, give way to the King Air crossing left to right, then continue."
   **PILOT:** "Giving way to the King Air, VT-ABC." — slot: give-way acknowledged `CRITICAL`
   (a "wilco, VT-ABC" also accepted) [Ch15 §15.4; CAR III(iii)]

4. **PILOT:** "Delhi Tower, VT-ABC, holding point Alfa One, ready for departure."
   — slot: the word **"departure"** — saying "ready for take-off" = `minor` error, flagged in
   debrief with the rule: "take-off" only when a take-off clearance is issued or cancelled
   [Ch15 §15.5 exam trap; CAR III(iii)]

5. **ATC:** "VT-ABC, behind the landing Cessna, line up runway two seven and wait, behind."
   **PILOT:** "Behind the landing Cessna, lining up and waiting behind runway two seven,
   VT-ABC." *(also accepted: "…line up runway two seven and wait behind, VT-ABC")*
   — slots: condition FIRST **and** the word "behind" repeated at the END `CRITICAL` (a
   conditional clearance read back without the condition is the classic practical fail),
   runway `CRITICAL` [Ch15 §15.5 worked example; Ch14 §14.7; 9432 §4.5 model]
   *probe (condition dropped):* ATC: "VT-ABC, I say again, BEHIND the landing Cessna, line up
   runway two seven behind — read back the condition."

6. **ATC:** "VT-ABC, wind two seven zero degrees eight knots, runway two seven, cleared for
   take-off."
   **PILOT:** "Runway two seven, cleared for take-off, VT-ABC." — slots: runway `CRITICAL`,
   "cleared for take-off" `CRITICAL`; wind readback NOT required (reading it back = no penalty)
   [Ch15 §15.5; Ch14 §14.7]

7. **ATC:** "VT-ABC, report leaving the zone."
   **PILOT:** "Wilco, VT-ABC." — slot: WILCO (not "roger" — an instruction to comply) `minor`
   [Ch13 §13.7 exam trap]
   **PILOT (later):** "VT-ABC, leaving the zone to the north, two thousand feet."
   — slots: position/direction + altitude in whole thousands `minor` [Ch17 §17.2; Ch13 §13.4
   Rule 2]
   **ATC:** "VT-ABC, roger, frequency change approved, good day." *(end)*

---

## SCN-2 — IFR Clearance Delivery → Start → Push-back → Taxi → Take-off

*Aircraft:* A320-class, **"Ghostair two zero five"** (Type 3 — flight number digit by digit,
never abbreviated [Ch14 §14.3–14.4]). Delhi, stand 21, IFR to Mumbai. *ATIS Delta:* RWY 27,
QNH 1013. *Exam mapping:* CAR III(i) issue of clearance & read-back, III(iii) start/push/taxi.
*Teaches:* the full-route-clearance readback contract, start ≠ push ≠ taxi, frequency transfer.

1. **PILOT:** "Delhi Delivery, Ghostair two zero five, stand two one, request IFR clearance
   to Mumbai, information Delta." [Ch15 §15.2]
   **ATC:** "Ghostair two zero five, cleared to Mumbai via PAPA two departure, climb to
   flight level one zero zero, squawk four three two one."
   **PILOT:** "Cleared to Mumbai via PAPA two departure, climb flight level one zero zero,
   squawk four three two one, Ghostair two zero five."
   — slots: clearance limit `CRITICAL`, SID `CRITICAL`, level (digit-by-digit "one zero zero")
   `CRITICAL`, squawk `CRITICAL` — the whole clearance is a mandatory full readback
   [Ch15 §15.2; Ch14 §14.7; Ch13 §13.5]
   **ATC:** "Ghostair two zero five, read-back correct, contact Ground one two one decimal
   nine when ready."
   **PILOT:** "Ground one two one decimal nine, Ghostair two zero five." — slot: frequency
   `CRITICAL` [Ch14 §14.6–14.7]
   *probe (any clearance slot missed):* ATC: "Ghostair two zero five, negative, I say again
   …[full clearance]… read back."

2. **PILOT:** "Delhi Ground, Ghostair two zero five, stand two one, request start-up."
   **ATC:** "Ghostair two zero five, start-up approved."
   **PILOT:** "Start-up approved, Ghostair two zero five." [Ch15 §15.3]
   *(Engine note in debrief: start-up approved ≠ permission to move [Ch15 §15.3 exam trap].)*

3. **PILOT:** "Request push-back."
   **ATC:** "Ghostair two zero five, push-back approved, facing south."
   **PILOT:** "Push-back approved, facing south, Ghostair two zero five." — slot: facing
   direction `CRITICAL` [Ch15 §15.3]

4. **PILOT:** "Ghostair two zero five, request taxi."
   **ATC:** "Ghostair two zero five, taxi to holding point Alfa One runway two seven via
   taxiway Bravo, QNH one zero one three."
   **PILOT:** full readback — holding point/runway/QNH `CRITICAL` as SCN-1(2) [Ch15 §15.4]

5. **ATC:** "Ghostair two zero five, hold short of runway three three, give way to the A320
   crossing right to left." *(a crossing runway on the taxi route)*
   **PILOT:** "Holding short of runway three three, giving way to the A320, Ghostair two zero
   five." — slots: hold short + runway `CRITICAL` (runway-boundary instruction — mandatory
   readback) [Ch15 §15.4 exam trap; Ch14 §14.7; CAR III(iii)]

6. **ATC:** "Ghostair two zero five, contact Tower one one eight decimal one."
   **PILOT:** "Tower one one eight decimal one, Ghostair two zero five." `CRITICAL` [Ch14 §14.6]
   **PILOT (new frequency):** "Delhi Tower, Ghostair two zero five, holding point Alfa One,
   ready for departure." [Ch14 §14.6; Ch15 §15.5]

7. **ATC:** "Ghostair two zero five, line up runway two seven and wait."
   **PILOT:** "Line up runway two seven and wait, Ghostair two zero five." — slots: line-up +
   runway + "and wait" `CRITICAL` [Ch15 §15.5]

8. **ATC:** "Ghostair two zero five, wind two seven zero degrees one zero knots, runway two
   seven, cleared for take-off."
   **PILOT:** "Runway two seven, cleared for take-off, Ghostair two zero five." `CRITICAL`
   *(end)* [Ch15 §15.5]

---

## SCN-3 — En-route: Position Reports, Level Change, Holding

*Aircraft:* **"Ghostair Alfa Bravo Charlie"** (Type 2), IFR on airway W15, FL150,
Chennai Control 127.5. *Exam mapping:* CAR III(ii) position reporting & level instructions,
III(vii) area control & holding. *Teaches:* the position-report order, report-reaching
discipline, holding clearance + EAT.

1. **PILOT (after sector handoff):** "Chennai Control, Ghostair Alfa Bravo Charlie, flight
   level one five zero, estimating PAPA at four two."
   **ATC:** "Ghostair Alfa Bravo Charlie, Chennai Control, roger, report PAPA." [Ch18 §18.1–18.2]

2. **PILOT (over PAPA):** "Chennai Control, Ghostair Alfa Bravo Charlie, PAPA at four two,
   flight level one five zero, estimating ROMEO at five five, SIERRA next."
   — slots in ORDER: position `CRITICAL` → time `CRITICAL` → level `CRITICAL` → next point +
   estimate `CRITICAL` → the one after `minor`. Wrong order = `minor` each; time as minutes
   only [Ch18 §18.2; Ch13 §13.6; CAR III(ii)]
   *probe (level missed):* ATC: "Ghostair Alfa Bravo Charlie, say your level."

3. **PILOT:** "Ghostair Alfa Bravo Charlie, request climb flight level one nine zero."
   **ATC:** "Ghostair Alfa Bravo Charlie, climb to flight level one nine zero, report
   reaching."
   **PILOT:** "Climb to flight level one nine zero, will report reaching, Ghostair Alfa
   Bravo Charlie." *(readback without "to" accepted)* — slots: level `CRITICAL`,
   report-reaching `minor` [Ch18 §18.3; Ch14 §14.7; 9432 §3.3 models]

4. **PILOT (later):** "Ghostair Alfa Bravo Charlie, reaching flight level one nine zero."
   **ATC:** "Ghostair Alfa Bravo Charlie, roger, maintain flight level one nine zero."
   **PILOT:** "Maintain flight level one nine zero, Ghostair Alfa Bravo Charlie." `CRITICAL`
   *(debrief note: "climb" vs "maintain" are different instructions — read back exactly what
   was said [Ch18 §18.3 exam trap])*

5. **ATC:** "Ghostair Alfa Bravo Charlie, hold at SIERRA, flight level one nine zero, expect
   further clearance at one five."
   **PILOT:** "Hold at SIERRA, flight level one nine zero, expect further clearance at one
   five, Ghostair Alfa Bravo Charlie." *("onward clearance" accepted as variant)* — slots:
   fix `CRITICAL`, level `CRITICAL`, time `CRITICAL` [Ch18 §18.5; 9432 §8.7 model "EXPECT
   FURTHER CLEARANCE AT 02"]
   *probe (time missed):* ATC: "Ghostair Alfa Bravo Charlie, confirm expected clearance
   time?"

6. **ATC:** "Ghostair Alfa Bravo Charlie, cleared SIERRA direct BUBKO, descend flight level
   one one zero, contact Chennai Control one three two decimal four."
   **PILOT:** full readback — routing + level + frequency `CRITICAL` *(end)* [Ch18 §18.4;
   Ch14 §14.6–14.7]

---

## SCN-4 — Radar Arrival: Identification, Traffic, Avoiding Action, Vectors to ILS

*Aircraft:* **"Ghostair Alfa Bravo Charlie"**, IFR inbound Delhi, FL100, Approach 119.3.
*ATIS Golf:* ILS RWY 27, QNH 1013. *Exam mapping:* CAR III(iv) surveillance phraseology,
III(vi) approach control & vectors to final. *Teaches:* squawk/ident, "expect" ≠ clearance,
traffic info replies, avoiding action, the vector-to-ILS sequence.

1. **PILOT:** "Delhi Approach, Ghostair Alfa Bravo Charlie, flight level one zero zero,
   inbound PAPA, information Golf." [Ch17 §17.3]
   **ATC:** "Ghostair Alfa Bravo Charlie, Delhi Approach, squawk four three two one and ident."
   **PILOT:** "Squawk four three two one, identing, Ghostair Alfa Bravo Charlie." — slot:
   squawk digits `CRITICAL` [Ch19 §19.1, §19.4; Ch14 §14.7]

2. **ATC:** "Ghostair Alfa Bravo Charlie, identified one five miles north of the field,
   descend to flight level six zero, expect ILS approach runway two seven."
   **PILOT:** "Descend to flight level six zero, expect ILS runway two seven, Ghostair Alfa
   Bravo Charlie." — slots: level `CRITICAL`; **trap:** a readback of "CLEARED ILS" =
   `CRITICAL` error (branch: ATC "negative, expect ILS — I say again, EXPECT")
   [Ch17 §17.3 "expect vs clearance"; Ch19 §19.1]

3. **ATC:** "Ghostair Alfa Bravo Charlie, traffic, two o'clock, four miles, crossing left to
   right, type unknown."
   **PILOT:** "Looking out, Ghostair Alfa Bravo Charlie." → *(sim reveals traffic)* →
   "Traffic in sight, Ghostair Alfa Bravo Charlie." — slots: looking out / in sight `minor`
   [Ch19 §19.3; CAR III(iv)]

4. **ATC:** "Ghostair Alfa Bravo Charlie, turn left immediately heading three six zero to
   avoid traffic, one o'clock, two miles." *(ICAO wording [4444 §12.4.1.8 e]; common-practice
   variant with "avoiding action" prefix [Ch19 §19.3] also available — Captain picks the
   sim's default voice line)*
   **PILOT:** "Left immediately heading three six zero, Ghostair Alfa Bravo Charlie."
   *(accepted: "left heading three six zero" / with "avoiding action" echoed)*
   — slots: IMMEDIATE readback, heading `CRITICAL`; delay > a beat = flagged in debrief
   [Ch19 §19.3; Ch14 §14.7; 9432 §6.4 model "RIGHT HEADING 110"]

5. **ATC:** "Ghostair Alfa Bravo Charlie, clear of traffic, resume own navigation direct
   PAPA."
   **PILOT:** "Resume own navigation direct PAPA, Ghostair Alfa Bravo Charlie." `minor`
   [Ch19 §19.2, §19.6]

6. **ATC:** "Ghostair Alfa Bravo Charlie, turn left heading two one zero, descend to two
   thousand five hundred feet, QNH one zero one three."
   **PILOT:** "Left heading two one zero, descend two thousand five hundred feet, QNH one
   zero one three, Ghostair Alfa Bravo Charlie." — slots: heading `CRITICAL`, altitude (whole
   thousands form) `CRITICAL`, QNH `CRITICAL` [Ch17 §17.4; Ch13 §13.4–13.5; Ch14 §14.7]

7. **ATC:** "Ghostair Alfa Bravo Charlie, closing the localizer from the left, turn left
   heading two five zero, cleared ILS approach runway two seven, report established."
   **PILOT:** "Left heading two five zero, cleared ILS approach runway two seven, wilco,
   Ghostair Alfa Bravo Charlie." — slots: heading `CRITICAL`, approach clearance + runway
   `CRITICAL`, wilco `minor` [Ch17 §17.4]

8. **PILOT:** "Ghostair Alfa Bravo Charlie, established ILS runway two seven."
   **ATC:** "Ghostair Alfa Bravo Charlie, contact Tower one one eight decimal one."
   **PILOT:** "Tower one one eight decimal one, Ghostair Alfa Bravo Charlie." `CRITICAL`
   *(end)* [Ch17 §17.4; Ch14 §14.6]

---

## SCN-5 — Weather Arrival: RVR, Wind Shear, Go-Around, Land & Vacate

*Aircraft:* **"Ghostair one zero eight"**, established ILS RWY 27, Delhi Tower 118.1, low
visibility, wet runway. *Exam mapping:* CAR III(iii) final/landing/go-around/after landing,
III(ix) RVR & runway surface. *Teaches:* continue approach ≠ cleared to land, RVR readback,
caution advisories, the go-around, vacating discipline.

1. **PILOT:** "Delhi Tower, Ghostair one zero eight, ILS runway two seven."
   **ATC:** "Ghostair one zero eight, Delhi Tower, continue approach, RVR runway two seven,
   touchdown six hundred metres, midpoint five hundred metres, stop-end four hundred metres."
   **PILOT:** "Continue approach, RVR six hundred, five hundred, four hundred metres,
   Ghostair one zero eight." *(for the RVR part, "roger" is also accepted — the ICAO model
   acknowledges RVR with "roger" [9432 §10.2] and RVR is not a mandatory-readback item;
   full readback taught as best practice)* — slots: "continue approach" (NOT "cleared to
   land") `CRITICAL`; RVR values IF read back must be correct and in order (wrong value =
   `CRITICAL`) [Ch21 §21.2; Ch15 §15.7; CAR III(ix); 9432 §2.4.3 whole-hundreds rule + §10.2]

2. **ATC:** "Ghostair one zero eight, wind two four zero degrees one eight knots gusting two
   eight, QNH one zero zero nine, caution wind shear reported on short final."
   **PILOT:** "Wind two four zero one eight gusting two eight, QNH one zero zero nine,
   copied wind shear caution, Ghostair one zero eight." — slots: QNH `CRITICAL` (it changed
   from ATIS 1013 — the trap), caution acknowledged `minor` [Ch21 §21.5; Ch14 §14.7]
   *probe (old QNH read back):* ATC: "Ghostair one zero eight, negative, QNH one zero ZERO
   nine, read back."

3. **ATC:** "Ghostair one zero eight, runway two seven wet, braking action reported medium
   to poor."
   **PILOT:** "Runway two seven wet, braking action medium to poor, Ghostair one zero eight."
   `minor` [Ch21 §21.4]

4. **ATC:** "Ghostair one zero eight, wind two four zero degrees one five knots, runway two
   seven, cleared to land."
   **PILOT:** "Runway two seven, cleared to land, Ghostair one zero eight." `CRITICAL`
   [Ch15 §15.7; Ch14 §14.7]

5. **ATC (short final):** "Ghostair one zero eight, go around, I say again, go around,
   vehicle on the runway."
   **PILOT:** "Going around, Ghostair one zero eight." — slot: "going around" IMMEDIATE
   `CRITICAL` [Ch15 §15.8]
   **ATC:** "Ghostair one zero eight, climb straight ahead to two thousand feet, contact
   Approach one one nine decimal three."
   **PILOT:** "Climb straight ahead two thousand feet, Approach one one nine decimal three,
   Ghostair one zero eight." — slots: altitude + frequency `CRITICAL` [Ch15 §15.8; Ch14 §14.6]

6. *(Compressed re-vector — Approach:)* **ATC:** "Ghostair one zero eight, turn left heading
   two five zero, cleared ILS approach runway two seven, when established contact Tower."
   **PILOT:** readback heading + clearance `CRITICAL` [Ch17 §17.4]

7. **ATC (Tower):** "Ghostair one zero eight, wind two four zero degrees one two knots,
   runway two seven, cleared to land."
   **PILOT:** "Runway two seven, cleared to land, Ghostair one zero eight." `CRITICAL`

8. **ATC (after landing):** "Ghostair one zero eight, vacate next left, contact Ground one
   two one decimal nine."
   **PILOT:** "Vacate next left, Ground one two one decimal nine, Ghostair one zero eight."
   `CRITICAL` (frequency) [Ch15 §15.9]
   **PILOT (fully clear):** "Delhi Ground, Ghostair one zero eight, runway vacated, request
   taxi to stand." — *debrief note: "runway vacated" only when the WHOLE aircraft is past the
   holding point [Ch15 §15.9 exam trap]* *(end)*

---

## SCN-6 — Urgency → Distress: PAN-PAN, MAYDAY, Silence Procedures

*Aircraft:* **VT-ABC**, Cessna 172, cross-country at 5,500 ft, Delhi Approach 119.3.
*Exam mapping:* CAR III(viii) distress & urgency. *Teaches:* PAN vs MAYDAY and the
escalation ("if in doubt, MAYDAY is never wrong" [Ch20 §20.1]), the distress-message format,
squawk 7700, silence imposition/termination awareness.

1. *(Sim event: engine running rough.)*
   **PILOT (expected urgency call):** "PAN-PAN PAN-PAN PAN-PAN, Delhi Approach, VT-ABC,
   engine running rough, request diversion for precautionary landing, two zero miles south
   of the field, five thousand five hundred feet."
   — slots: PAN-PAN ×3 `CRITICAL` (once or twice = `minor`; "MAYDAY" here accepted with
   debrief note — never penalise escalating), station `minor`, callsign `CRITICAL`, nature
   `CRITICAL`, intentions `CRITICAL`, position+level `CRITICAL` [Ch20 §20.5, §20.1; CAR III(viii)]
   *probe (position missed):* ATC: "VT-ABC, say your position."

2. **ATC:** "VT-ABC, Delhi Approach, roger your PAN, cleared direct to the field, descend to
   three thousand five hundred feet, QNH one zero one three, number one, medical and fire
   services alerted."
   **PILOT:** "Cleared direct, descend three thousand five hundred feet, QNH one zero one
   three, VT-ABC." — slots: altitude + QNH `CRITICAL` [Ch20 §20.5; Ch14 §14.7]

3. *(Sim event: engine FAILS.)*
   **PILOT (expected distress message):** "MAYDAY MAYDAY MAYDAY, Delhi Approach, VT-ABC,
   engine failure, attempting forced landing, one five miles south of the field, four
   thousand feet, heading three six zero, two persons on board."
   — slots: MAYDAY ×3 `CRITICAL`, callsign `CRITICAL`, nature `CRITICAL`, intentions
   `CRITICAL`, position `CRITICAL`, level+heading `minor`, POB `minor` — "nature · intentions
   · position" are the three things ATC most needs [Ch20 §20.2 transcript & mnemonic]
   *(Sim scores unprompted squawk 7700 on the transponder widget as `minor` bonus;
   if unset —)* **ATC probe:** "VT-ABC, squawk seven seven zero zero." → **PILOT:** "Squawk
   seven seven zero zero, VT-ABC." [Ch20 §20.1; Ch19 §19.4]

4. **ATC:** "VT-ABC, Delhi Approach, MAYDAY received, wind two seven zero degrees eight
   knots, runway two seven, you are number one, all other traffic standing by."
   **PILOT:** "Roger, VT-ABC." — minimal acknowledgement accepted; fly the aircraft first
   [Ch20 §20.3]

5. *(Another station calls with a routine request — sim plays it.)*
   **ATC (to that station):** "All stations, Delhi Approach, STOP TRANSMITTING, MAYDAY."
   — *awareness beat, not scored: the student hears silence imposed* [Ch20 §20.4; 9432
   §9.2.2; A10-II §5.3.2.2 — debrief teaches SEELONCE MAYDAY as the maritime-service
   equivalent, still examinable in the written paper, syllabus item I(iv)]

6. **ATC:** "VT-ABC, field at your twelve o'clock, one zero miles, cleared to land runway
   two seven, no traffic."
   **PILOT:** "Cleared to land runway two seven, VT-ABC." `CRITICAL` [Ch15 §15.7]

7. *(Safe landing.)* **ATC (broadcast):** "All stations, Delhi Approach, DISTRESS TRAFFIC
   ENDED." — *awareness beat: silence lifted* [Ch20 §20.4; 9432 §9.2.3; A10-II §5.3.2.5.3 —
   debrief teaches SEELONCE FEENEE as the maritime equivalent] *(end — debrief
   walks the full distress-message format and the PAN→MAYDAY escalation decision.)*

---

## Notes for the build (Phase A/B, after Captain approval)

- Every `CRITICAL`/`minor`/`probe` above maps 1:1 onto the JSON schema in
  `RTR_SIMULATOR_DESIGN.md` §4. Convert only APPROVED scenarios.
- The number-normalization layer must accept both spoken-digit and figure forms for every
  numeric slot above [Ch13 §13.4–13.5], and the phonetic alphabet for VT-ABC [Ch13 §13.2].
  RVR/altitude/visibility values normalize under the whole-hundreds/thousands rule
  [9432 §2.4.3]; level readbacks accepted with or without "to".
- Forbidden-phrase list (flag + teach in debrief, never hard-fail): "over and out"
  [Ch13 §13.7 exam trap], "roger" in reply to a yes/no question or an instruction to comply
  [Ch13 §13.7], "take-off" outside clearance readback [Ch15 §15.5].
- SCN-2/5 use Type 3 callsigns — the engine must NOT accept an abbreviated flight number
  [Ch14 §14.4].
- Student-facing strings contain no source/author names; this file is Captain-review-only
  and carries citations by design. The build guard applies to the generated JSON, not here.
