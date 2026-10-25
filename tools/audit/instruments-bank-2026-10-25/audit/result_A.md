# Independent audit, packet A (197 instrument questions)

Auditor did not build this bank. Only items that are NOT OK are listed. Every numerical item was re-worked
with exact ISA formulas (troposphere P = 1013.25(1 - 6.8756e-6 h)^5.2559, T = 288.15 - 0.0019812 h,
LSS = 38.97 sqrt(K), compressible CAS/Mach relations). References: ref_instr_book05.txt (book05),
ref_instr_oxford.txt (ref2).

| id | verdict | correct letter | evidence | suggested fix |
|---|---|---|---|---|
| RADIO ALTIMETERS\|22 | WRONG_KEY | a (but see fix: a and b are near-duplicates) | Key d says the height limit exists because "signal from different modulation cycles will overlap". Both references give the sweep rate: ref2 line ~8671 "The total sweep of the carrier frequency is automatically varied ± 50 MHz 300 times a second" (book05 line 10342, same words). One sweep period = 1/300 s = 3.33 ms. Round trip at the 2500 ft limit (ref2 "can be used between zero and 2500 feet") is 5,000 ft = 1,524 m, i.e. 5.1 microseconds, about 1/650 of one sweep. Echoes from different cycles would only overlap at a height of roughly c x T / 2 = 500 km. So d cannot be the reason for a 2,500 ft limit. What both references do state is the very low power: "Radiated power generated is of the order of one watt" (ref2 ~8683, book05 10354), i.e. the echo from greater heights is too weak. The scanned key is not available (OCR for this item is only the generic principle). | Change key to a. Reword b, because "too weak" and "undetectable" are the same idea, e.g. b "At greater heights the beam becomes too narrow to reach the ground". Explanation: "A radio altimeter radiates only about one watt. Above about 2,500 ft the echo is too weak to be measured reliably." Captain's ruling recommended, since this goes against the published key. |
| AIRSPEEDS\|3 | AMBIGUOUS | (c / equivalent airspeed d is defensible) | Lift = ½ρV²·S·CL, so the same weight lifts off at the same *dynamic pressure*, which is by definition the same **EAS** (d), not CAS. CAS corresponds to impact pressure qc, which includes compressibility. At lift-off speeds the difference is under 1 kt, so the bank's CAS (a) is the conventional exam answer, and the source's own worked text argues CAS. The explanation also says "the same dynamic pressure, which the ASI shows as the same calibrated airspeed", which is not exact. | Keep a, but change the explanation to: "...needs the same dynamic pressure, i.e. the same EAS. At take-off speeds EAS and CAS are practically equal, so the aircraft lifts off at the same CAS whatever the airfield altitude." Or replace option d with a distractor that is not also true. |
| PITOT STATICS\|34 | TEXT_DEFECT | key c unaffected | Options a "(1), (2), (4), (5), (7)" and b "(I), (2), (4), (5), (7)" are the same list (an OCR "I" for "1"). A student sees two identical options. | Replace b with a different wrong set, e.g. "(1), (3), (5), (6), (7)". |
| PITOT STATICS\|14 | TEXT_DEFECT | key a unaffected | Stem: "The response time ... may be **increased** by adding a...". An accelerometer *reduces* response time (ref2: the IVSI accelerometer unit "responds quickly to a change of altitude", added "To overcome the problem of lag"). Read literally, the stem asks what makes the VSI slower. | "The response of a vertical speed indicator may be speeded up (its lag reduced) by adding a:" |
| ALTEMETER\|38 | TEXT_DEFECT | key b unaffected | "What will a **cabin** altimeter read with QFE set" — a cabin altimeter is a different instrument (cabin pressure altitude). The worked text is about the ordinary altimeter. Likely OCR. | "What will an altimeter read with QFE set?" |
| TEMP\|4 | TEXT_DEFECT | key a unaffected | Options garbled: a "SAT(1 + (0.2 x K x M2)" (unbalanced bracket, M2 for M²); c "SAT/0-0.2 M2)" is not readable. | a "TAT = SAT (1 + 0.2 K M²)"; b "TAT = SAT / (1 + 0.2 K M²)"; c "TAT = SAT / (1 − 0.2 M²)"; d "TAT = SAT (1 − K M²)". |
| PITOT STATICS\|6 | TEXT_DEFECT | key b unaffected | "(!)" printed for "(i)" in the stem and option d; option c "time t -t" for "t − Δt". | Restore (i) and Δt. |
| RADIO ALTIMETERS\|8 | TEXT_DEFECT | key c unaffected | Option b "I HI (Ultra High Frequency)" — should be "UHF". | "UHF (Ultra High Frequency)". |
| MACH\|32 | TEXT_DEFECT | key c unaffected | Option d "(Ps-PT)/Pi" — "Pi" is OCR, almost certainly PT. | "(PS − PT)/PT". |
| ALTEMETER\|21 | TEXT_DEFECT | key d unaffected | "If ON H is 999 hPa" — QNH. | "If QNH is 999 hPa". |
| ALTEMETER\|29 | TEXT_DEFECT | key b unaffected | "pressure altitude of the Held" — field. | "of the field". |
| PITOT STATICS\|29 | TEXT_DEFECT | key b unaffected | "(VS!)" for VSI. | "(VSI)". |
| RADIO ALTIMETERS\|3 | TEXT_DEFECT | key c unaffected | Option c "nn-board". | "on-board". |
| ASI\|57, ASI\|62 | TEXT_DEFECT (cosmetic) | keys unaffected | Options end "...than VFE-" / "...than VLE-" (stray hyphen). | Remove hyphen. |
| PITOT STATICS\|7 | TEXT_DEFECT (cosmetic) | key a unaffected | Option c "1013.25 h". | "1013.25 hPa". |
| MACH\|25 | BAD_EXPLANATION (minor) | key b correct | Explanation: "ISA at 25 000 ft = 15 - 2 x 25 = -34.5 C". 15 − 2 × 25 = −35; −34.5 comes from 1.98 °C/1000 ft. The answer (238.65 K → 601.9 kt → 602) is right; the line of arithmetic shown to the student is not. | "15 − 1.98 × 25 = −34.5 °C". |
| ALTEMETER\|6 | BAD_EXPLANATION (minor) | key d correct | The stem gives **TAS** 100 kt and a descent slope; the explanation says "ROD = groundspeed x angle / 60...". A slope through the air mass is set by TAS, and the VSI does not see wind. Exact: 100 × 6076/60 × sin 3° = 530 ft/min → −500 nearest. | Replace "groundspeed" with "TAS". |

## Items checked and found OK that are worth recording (not findings)

- ALTEMETER|20 (density altitude): exact working gives SAT −41.2 °C, ISA dev +3.2, density altitude 30,381 ft. No option is exact; b (30,472) is nearest, and is what 118 ft/°C × 4 °C gives using ISA −45 °C. The explanation already says this honestly. OK.
- ALTEMETER|21: exact = 25,391 ft (subscale offset at ~27.7 ft/hPa near MSL), still 25,400. OK.
- ALTEMETER|30: exact QFE 847 hPa → 850. OK.
- CRP5|1: exact compressible TAS 182 kt → 183. CRP5|2: exact 273.0 kt. CRP5|8: exact M 0.757 → 0.76. OK.
- ALTEMETER|3 (servo altimeter ±30 ft at MSL): ref2 tolerance table "Typical Servo Altimeter ... Tolerance (feet) +30" at 0 ft. OK.
- PITOT STATICS|34 key c (1,2,5,6,7) matches ref2 Q38 option d "TAT, static pressure, electric power, pitot pressure, AoA", and ref2 "AOA may also be an input to the ADC". OK (text defect only, above).
- TEMP|3 (Rosemount K ≈ 1.0): book05 "a high recovery factor of approximately 1.00". TEMP|20 (heater prevents icing): book05 "A heating element is mounted integral with the probe to prevent the formation of ice". OK.
- RADIO ALTIMETERS|2: ref2 "The height pointer disappears behind a mask ... when there is any fault in the transmitted signal". RADIO ALTIMETERS|27: ref2 "can be used between zero and 2500 feet". RADIO ALTIMETERS|6/26: ref2 "installation delay is therefore adjusted to compensate for residual height and cable length". OK.

## Coverage

Checked 197 of 197; numerical re-worked: 48 (all calculation items: ISA pressure/temperature, density altitude, QNH/QFE/pressure-altitude, true altitude, LSS, Mach/TAS, TAT/SAT, CAS→TAS and CAS→Mach, VSI rate of descent); theory checked against references: 149 (pressure-error, blockage logic, ASI markings, Mach/CAS/TAS trends, VSI/IVSI, radio altimeter, temperature sensing — checked against the references where they cover it and against physics where they do not).

Could not decide from the references alone (decided on physics / the source's worked text, not on a reference quote): VSI|2 (partly blocked static → under-read; neither reference covers a *partial* static blockage — ref2 says only "Any blockages of the static line or vent will cause the needle to return to zero"); ASI|57 (VFO not marked, "less than VFE" — neither reference defines VFO; the source's worked text says "usually less than VFE", and on some types VFO equals VFE); PITOT STATICS|36, ALTEMETER|66, VSI|9 (ground effect on static pressure — the phrase does not occur in either reference; ref2 does say flaps/gear and angle-of-attack changes disturb the static vents); PITOT STATICS|2 / ALTEMETER|62 (sign of uncorrected position error at high speed depends on vent location; keyed answer is the conventional one).
