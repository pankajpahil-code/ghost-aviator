// Verified explanations for Air Regulations ar-4 (Air Traffic Services).
//
// Same discipline as explanations-ar-5.mjs: an entry exists here only if the
// rule was read in a primary source and the citation names where.
//
// NOTE ON THIS CHAPTER. It is filed as "Air Traffic Services", but the questions
// are mostly NOT Annex 11 material — this batch is visual and light signals,
// which ICAO Annex 2 Appendix 1 specifies exactly. Verified 2026-08-06 against
// Annex 2, Tenth Edition, Appendix 1, sections 3, 4.1.1 and 4.2.
//
// All eight keys below were checked against the source and all eight were
// already correct; nothing in this batch required an answer change.

export const AR4_EXPLANATIONS = [
  // ═══════════════════════════════════════════════════════════════════════════
  // Batch 2, verified 2026-08-08 against ICAO Doc 4444 (PANS-ATM), the 432-page
  // copy at C:\Users\Admin\Downloads\Telegram Desktop\4444 Air Traffic
  // Management.pdf. Every paragraph below was read in that document.
  // ═══════════════════════════════════════════════════════════════════════════
  {
    stem: "Wake turbulence separation minima for Take off, if a light aircraft is to take off behind a heavy or a medium aircraft is:",
    expect: "2 minutes",
    cite: "PANS-ATM 5.8.3.1",
    exp: `Two minutes. The departing minimum applies to a LIGHT or MEDIUM aircraft taking off behind a HEAVY, and to a LIGHT taking off behind a MEDIUM — the same two minutes in each case.

It is conditional on the runway geometry, and that is the part worth learning: it applies when the aircraft use the same runway, parallel runways separated by less than 760 m (2 500 ft), or crossing runways where the second aircraft's projected path will cross the first's at the same altitude or less than 300 m (1 000 ft) below.

Know the category boundaries too, because a question can hinge on them: HEAVY is 136 000 kg or more, MEDIUM is less than 136 000 kg but more than 7 000 kg, and LIGHT is 7 000 kg or less — all on maximum certificated take-off mass. The three-minute figure that appears as a distractor is real, but it belongs to the arrival case, not departure.`,
  },
  {
    stem: "The minimum wake turbulence time separation for a heavy aircraft to land behind a heavy aircraft is",
    expect: "not required",
    cite: "PANS-ATM 5.8.2.1.1",
    exp: `There is no time-based wake turbulence minimum for this pairing, and the reason is that the rule only protects an aircraft from something heavier than itself. The arrival minima are stated as exactly two cases: a MEDIUM behind a HEAVY gets 2 minutes, and a LIGHT behind a HEAVY or a MEDIUM gets 3 minutes.

HEAVY behind HEAVY appears in neither, so no wake turbulence separation is prescribed — the following aircraft is as capable of handling the vortex as the one that made it. The same logic explains the other silences in the table: MEDIUM behind MEDIUM and LIGHT behind LIGHT are not listed either.

Not prescribed is not the same as no hazard. Where separation is not applied the controller still issues a caution of possible wake turbulence, and the pilot-in-command remains responsible for judging whether the spacing behind a heavier aircraft is acceptable — and for asking for more if it is not.`,
  },
  {
    stem: "Position report shall be made after every _______, where no standard reporting points exist .",
    expect: "first report after 30 mins and subsequent after 60 mins",
    cite: "PANS-ATM 4.11.1.2",
    exp: `The rule is deliberately asymmetric, which is why the single-interval options are all wrong. On routes **not** defined by designated significant points, position reports are made as soon as possible after the first half hour of flight, and at hourly intervals after that.

The early first report exists to confirm the flight is where it planned to be while the error is still small; once that is established, hourly is enough. Contrast the other case: on routes that **are** defined by designated significant points, you report over — or as soon as possible after — each compulsory reporting point, with no clock involved at all.

In both cases ATS may ask for additional reports at shorter intervals, and may exempt a flight from routine reports altogether where it already has adequate position data from radar, ADS-B or ADS-C.`,
  },

  // ---- Appendix 1, 4.1.1 Light and pyrotechnic signals ----
  {
    stem: "A continuous red beam directed at an aircraft from the ATC tower means :",
    expect: "Do not land, give way to other aircraft and continue circling",
    cite: "ICAO Annex 2, Appendix 1, 4.1.1",
    exp: `Every light signal means one thing to an aircraft in flight and a different thing to one on the ground — that is the first hurdle in this table, and most wrong answers come from mixing the two columns. A steady red to an aircraft in flight means give way to other aircraft and continue circling. To an aircraft on the ground the same steady red simply means stop. Note what it does NOT mean: the aerodrome is not closed and not unserviceable — you are being sequenced, not turned away.`,
  },
  {
    stem: "A series of red flashes sent to an aircraft in flight means :",
    expect: "Aerodrome unsafe, do not land",
    cite: "ICAO Annex 2, Appendix 1, 4.1.1",
    exp: `Red flashes in flight mean the aerodrome is unsafe — do not land. Hold the pair together so you can never confuse them: steady red is about other traffic and you keep circling; flashing red is about the aerodrome itself and you do not land at all. On the ground, the same series of red flashes means taxi clear of the landing area in use.`,
  },
  {
    stem: "Series of Red flashes from control tower when aircraft is in flight means:",
    expect: "Aerodrome is unsafe, do not land",
    cite: "ICAO Annex 2, Appendix 1, 4.1.1",
    exp: `Red flashes in flight mean the aerodrome is unsafe — do not land. Hold the pair together so you can never confuse them: steady red is about other traffic and you keep circling; flashing red is about the aerodrome itself and you do not land at all. On the ground, the same series of red flashes means taxi clear of the landing area in use.`,
  },
  {
    stem: "A flashing white light directed at an aircraft on the maneuvering area of an airport means",
    expect: "Return to starting point on the airport.",
    cite: "ICAO Annex 2, Appendix 1, 4.1.1",
    exp: `The question specifies an aircraft on the manoeuvring area, so read the ground column: a series of white flashes means return to your starting point on the aerodrome. To an aircraft in flight the same signal means something quite different — land at this aerodrome and proceed to the apron. White is the only signal colour whose two meanings are not obviously related, so it is worth learning as a pair.`,
  },
  {
    stem: "A series of red and green projectiles fired at an interval of 10 sec means",
    expect: "All of the above are correct",
    cite: "ICAO Annex 2, Appendix 1, 3",
    exp: `This is not an aerodrome signal at all — it is a warning to an unauthorised aircraft. Projectiles discharged from the ground at ten-second intervals, each bursting to show red and green lights or stars, tell you that you are flying in, or are about to enter, a restricted, prohibited or danger area, and that you must take whatever remedial action is needed. The signal does not distinguish between the three kinds of airspace, which is exactly why all three options are correct.`,
  },

  // ---- Appendix 1, 4.2 Visual ground signals ----
  {
    stem: "A horizontal red square panel with one yellow diagonal means:",
    expect: "Special precaution while landing should be taken because of the bad state of the Maneuvering area",
    cite: "ICAO Annex 2, Appendix 1, 4.2.2",
    exp: `Count the diagonals — that is the whole question. ONE yellow diagonal on a red square panel means special precautions must be observed when approaching to land or landing, because of the bad state of the manoeuvring area or for some other reason. You may still land; you must be careful. TWO yellow diagonals on the same red panel is the harder signal: landings are prohibited, and the prohibition is likely to be prolonged.`,
  },
  {
    stem: "A horizontal white dumbbell displayed in signal area means:",
    expect: "Aircraft are required to land, take off and taxi on runway and taxiways only.",
    cite: "ICAO Annex 2, Appendix 1, 4.2.3.1",
    exp: `A plain white dumb-bell in the signal area means aircraft must land, take off AND taxi on runways and taxiways only — nothing on the grass. Learn its variant alongside it: the same dumb-bell with a black bar across each circular end relaxes the taxi requirement, so landings and take-offs stay on runways but other manoeuvres need not be confined to runways and taxiways.`,
  },
  {
    stem: "What does a white dumbbell in the signal area mean?",
    expect: "Make all take-offs, landings and taxiing on runways & taxiways only.",
    cite: "ICAO Annex 2, Appendix 1, 4.2.3.1",
    exp: `A plain white dumb-bell in the signal area means aircraft must land, take off AND taxi on runways and taxiways only — nothing on the grass. Learn its variant alongside it: the same dumb-bell with a black bar across each circular end relaxes the taxi requirement, so landings and take-offs stay on runways but other manoeuvres need not be confined to runways and taxiways.`,
  },
];

/**
 * ar-4 is 69 questions and this batch covers 8. What remains, and why:
 *
 *   - Aerodrome markings, PAPI, runway centre-line stripe widths, HAT/HAA:
 *     ICAO Annex 14, which is not on this machine.
 *   - Decision Altitude, OCA, approach minima, RVR conversions:
 *     PANS-OPS Doc 8168 — only the Captain's own Chapter 12 notes are on disk,
 *     not the document itself.
 *   - Definitions (MEA, TMA, UTC, alternate aerodrome, prohibited area):
 *     several ARE in Annex 2 Chapter 1 and can be done in the next pass; they
 *     were left out of this batch only to keep it to one verified source area.
 *   - Public-transport departure minima: Indian operational rules, needs a CAR.
 */
