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

## Suggestions

1. **Independent audit** of the 521 before the label comes off — the theory sections (autoflight, EICAS/ECAM,
   TCAS, engine instruments) rest on reasoning, not on a worked number.
2. **The 20 JAR recorder/GPWS-rule items** could come back if checked against the DGCA CARs on disk
   (`D:\05 Air Regulations\Books\DGCA CARs AIP and statutes - official downloads\`).
3. **The 45 figure questions** need the figures cropped from the book and an image field the runners can show.
