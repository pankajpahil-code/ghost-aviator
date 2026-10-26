# Instruments practice bank — check and upload, 2026-10-25

Source: the instruments question book the Captain supplied (scanned PDF, 1,087 questions in 22 sections),
plus an HTML copy of the same 1,000 questions built by another agent.
Output: `lib/generated/ins-practice.ts` (`INS_PRACTICE`), source label "Instruments practice bank".
**Not independently audited.** Built by one model; it needs a second pass before the PENDING label comes off.

## What was found

| | count |
|---|---|
| Questions in the book | 1,087 |
| Already on the site (same question, any wording) | 50 |
| Repeated inside the book (one copy kept) | 240 |
| Need a figure the site does not show | 45 |
| Question or options garbled in the scan | 43 |
| European (JAR-OPS) recorder/certification rules, not checked against a DGCA CAR | 20 |
| Two defensible answers, or the stem does not decide it | 168 |
| **Published** | **521** |

**The HTML copy's answer key is unreliable.** It agreed with the book's own printed key on only about a third
of questions. It was not used for any key.

**The book's key was read from the scan, and the scan is noisy.** Every published key was decided from the
physics and from the book's own worked explanation, not from the key letter alone. Where the scan's key letter
differs from the decision, the item carries a note (5 items, all single-reading scan errors where the book's own
worked text supports the published key).

**Corrected (4):**
- AUTOFLIGHT 24 — speed hold in climb vs altitude hold: book key c (statements 2, 3) is wrong; statement 3 has
  the pitch channel holding speed while it is holding altitude or the glide path. Keyed d (1, 4).
- CRP5 1 — TAS at 15,000 ft ISA, CAS 145: 183 kt (scan key read 148 kt).
- CRP5 2 — TAS at 20,000 ft ISA+5, CAS 200: about 273 kt (scan key read 239 kt).
- PITOT STATICS 7 — stem pointed at a table on a book page; reworded to stand alone.

**Edited for the site (no change of meaning):** OCR repairs (VN0→VNO, 1AS→IAS, EAV→E/W, nib/inh→hPa, etc.),
options that ran together in the scan were separated, and three items where two options were identical had one
replaced with a distinct wrong option (WARN/REC 40, ENGINE 49, EICAS/ECAM 20). FUEL 7: the scan lost the second
temperature ("15 °C to 4?? °C"); it now reads "to 5 °C" — the answer (no change in a compensated system) does
not depend on the number.

## Where they went

Chapter-wise into Instrumentation (`inst-*`), and the 12 flight-computer items into Air Navigation `nav-cx3-6`
(CX-3: True Airspeed and Altitude). Section-to-chapter mapping is in `scripts/classify_ins.py`, with per-item
overrides in the decision files.

## Files

- `dec/*.py` — every decision, one file per section: key, explanation, note, or the drop reason.
- `decisions.json` — all 1,087 items with status (VERIFIED / CORRECTED / DROPPED) and reason.
- `published.json` — the 521 published items as generated.
- `scripts/` — parse, dedupe, classify, key reading, apply (`apply_ins.py`) and generate (`gen_ins.py`).

## Independent audit, 2026-10-25 (same day)

Three auditors, none of whom saw the builder's reasoning, checked all 521 against the two instrumentation
manuals and re-worked every calculation (73 numerical items). Their tables are in `audit/result_A..C.md`;
every finding was checked against the reference before anything changed. Fixes are in `dec/d98_audit.py`.

- **No answer key confirmed wrong.** All 73 calculations held.
- **9 taken off the site:**
  - **Gyro drift signs (GYRO 85–88).** The book and the manuals use opposite sign conventions, and both
    signs are offered as options.
  - **Radio altimeter height limit (RADIO ALTIMETERS 22).** The book keys "overlapping sweep cycles", but
    the manuals' sweep timing rules that out. Held for the Captain's ruling.
  - **EICAS cancel/recall (EICAS/ECAM 23).** The manual's wording matches a different option.
  - **AUTOFLIGHT 58.** The source says no option is exact.
  - **COMPASS 11.** H against H+Z sensitivity.
  - **EFIS 71.** The stem's deviation threshold is wrong.
- **10 explanations corrected.** These include: EPR inlet pressure (ram effect raises it), resistive probes,
  water in capacitive tanks, weather-radar magenta, EAS at lift-off, and the earth-rate/transport-wander
  wording (no longer states a sign the manuals contradict).
- **About 30 text defects repaired.** Examples: duplicate options, "INS gyros strapped down" missing its
  blank, OCR garbles.
- **Published after the audit: 512.** Site total 5,193.

## The Captain's ruling, 2026-10-26: "check oxford book source for answers"

Six of the nine held questions were settled from the Oxford instrumentation book (both text-extracted
editions in `D:/03 Instruments/Books`) and restored, keyed to it:

- **Gyro drift signs (GYRO 83–88).** Oxford convention: a decreasing DGI reading is minus, an increasing one
  plus. Its worked examples give "−15 × sin 60° (decreasing)" and "+15 × sin 25° (increasing) = +6.34°/hr".
  The convention is now stated in each stem; 83 and 84 had their correct option re-signed to match.
- **EICAS/ECAM 23 → d.** Oxford: "Pushing the CANCEL switch removes only the caution and advisory messages…
  the warning messages cannot be cancelled. The RECALL switch is used to bring back the caution and advisory
  messages."
- **COMPASS 11 → a.** Oxford: sensitivity "depends on the strength of the external field (H) and on the
  magnetic moment of the magnet".
- **EFIS 71 → d.** Oxford: "Deviation beyond normal localizer and glide slope limits cause the scales to change
  colour to amber and the pointer to flash". The stem's unsupported "1/5 dot" figure was removed.

Still off the site:
- **RADIO ALTIMETERS 22.** Oxford gives the 0–2,500 ft range and "of the order of one watt" but never states
  the reason for the limit.
- **AUTOFLIGHT 58.** Oxford says only that the subscale does not change the ALT HOLD reference, which does not
  decide between a and d.

Live after the ruling: 519, site total 5,200.

## Suggestions

1. **Independent audit** of the 521 before the label comes off — the theory sections (autoflight, EICAS/ECAM,
   TCAS, engine instruments) rest on reasoning, not on a worked number.
2. **The 20 JAR recorder/GPWS-rule items** could come back if checked against the DGCA CARs on disk
   (`D:\05 Air Regulations\Books\DGCA CARs AIP and statutes - official downloads\`).
3. **The 45 figure questions** need the figures cropped from the book and an image field the runners can show.
