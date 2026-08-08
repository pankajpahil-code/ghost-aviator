// Verified explanations for Air Regulations ar-3 (Rules of the Air).
//
// SCOPE DISCIPLINE — read before adding to this file.
// An explanation is answer-key-grade content. A confidently-worded wrong rule
// does more damage than the "Correct answer: B" placeholder it replaces, because
// a student will believe it and carry it into the exam. An entry belongs here
// ONLY if the rule was read in the primary source and the citation names the
// paragraph. Everything else stays a placeholder and goes on the FLAGGED list at
// the bottom until the source to settle it is on disk.
//
// Verified 2026-08-08 against ICAO Annex 2 (Rules of the Air), Tenth Edition,
// July 2005 — the copy on disk at D:\pk. Every `cite` below was read in that
// document, not recalled. Annex 2 is the right authority for an Indian CPL
// paper because Rule 16 of the Aircraft Rules, 1937 requires compliance with the
// Rules of the Air issued by the Director-General in accordance with Annex 2.
//
// A NEAR-MISS WORTH RECORDING: 3.2.2.3 was very nearly written up as having only
// sub-paragraphs a) to c), which would have made the marked answer to the
// helicopter give-way question look wrong. The document is two-column, and the
// first text extraction had silently dropped d) — "power-driven aircraft shall
// give way to aircraft which are seen to be towing other aircraft or objects".
// The marked answer was right and the extraction was incomplete. Read the source
// properly before calling an answer key wrong.
//
// Keys are normalised question stems (see key() in apply-explanations.mjs).

export const AR3_EXPLANATIONS = [
  // ──────────────── Cruising levels (Appendix 3) ────────────────
  {
    stem: "An aircraft is following a track of 179º (M) on a VFR plan. The choice of flight levels available to the pilot are:",
    expect: "55, 75, 95, 115, 135, 155, 175, 195, 215, 235, 255, 275",
    cite: "Annex 2, Appendix 3",
    exp: `Work it in two steps. First the semicircle: a magnetic track of 179° falls in the 000°–179° band, so you are on the "eastbound" side of the table. Second the rule of flight: IFR takes the whole thousands in that band (FL 10, 30, 50, 70…), and VFR sits 500 ft above them (FL 35, 55, 75, 95…). So a VFR flight tracking 179° uses odd thousands plus 500.

Check the boundary rather than guessing it — 179° is inside the band, 180° is not. One degree either side of that line moves you to the other set of levels entirely.

Note the listed answer begins at FL55; the table's series for this band actually starts at FL35. FL35 belongs to the same series, but of the four options only this one follows the correct odd-plus-500 pattern, so it is the answer intended.`,
  },
  {
    stem: "An aircraft is following a track of 179º (M) on a VFR plan . The choice of flight levels available to the pilot is:",
    expect: "55, 75, 95, 115, 135, 155, 175, 195, 215, 235, 255, 275",
    cite: "Annex 2, Appendix 3",
    exp: `Same question as the one above, printed twice in the bank with slightly different spacing. Track 179° (M) is in the 000°–179° half of the table, and VFR levels in that half are the odd thousands plus 500: FL 35, 55, 75, 95, 115 and so on upward.

The distractors are worth reading closely, because each fails for a different reason. A list of whole odd thousands is the IFR series, not VFR. A list that jumps from 95 to 155 has simply dropped levels out of the middle. A list containing FL295 is wrong because that band's VFR series stops well below it.`,
  },
  {
    stem: "While flying on a magnetic track of 140 degrees the aircraft on VFR plan will select the following levels:",
    expect: "95",
    cite: "Annex 2, Appendix 3",
    exp: `Track 140° (M) lies in the 000°–179° band. VFR in that band takes odd thousands plus 500, so FL 95 is a valid level and the answer.

Test each distractor against the table and the reason becomes obvious. FL 80 and FL 70 are whole thousands, so they are IFR levels — and 80 belongs to the opposite band anyway. FL 85 has the right "plus 500" shape but sits on the even series, which is the 180°–359° half. Getting the semicircle right is what separates 95 from 85.`,
  },
  {
    stem: "FL 145 can be used:",
    expect: "by westbound aircraft on VFR plan",
    cite: "Annex 2, Appendix 3",
    exp: `Read the level backwards to find who owns it. FL 145 is an even thousand plus 500, and in the table that combination appears in one place only: the VFR column of the 180°–359° band. That is the westbound half.

So two things must both be true — the flight is VFR, and the track is between 180° and 359°. An eastbound VFR flight would be at FL 135 or 155; an IFR flight in either direction would be on whole thousands. Only one option satisfies both conditions.`,
  },
  {
    stem: "An aircraft cruising VFR in level flight above F 290 on a track of 290 deg M shall be flown at",
    expect: "F320, F360, F400, F440",
    cite: "Annex 2, Appendix 3 b)",
    exp: `Above FL 290 the tables change shape, and which table you use matters. Where a 1 000 ft vertical separation minimum is applied between FL 290 and FL 410 — RVSM airspace — the table carries no VFR levels above FL 285 at all. So a VFR flight above FL 290 is being examined under the other table, the one for non-RVSM areas, where levels above FL 290 are spaced 4 000 ft apart within each direction.

Track 290° (M) puts you in the 180°–359° band. Reading the VFR column of that band upward from FL 290 gives FL 320, 360, 400, 440 — the answer. The rival option FL 310, 350, 390, 430 is the IFR series for the same band, and FL 300, 340, 380, 420 is the IFR series for the other one.`,
  },
  {
    stem: "Semi-circular rules starts from flight level:",
    expect: "10",
    cite: "Annex 2, Appendix 3",
    exp: `The tables of cruising levels begin at FL 10 — that is the lowest level printed in the 000°–179° column, with FL 20 the lowest in the 180°–359° column. So the direction-based system of levels starts at FL 10, not at some higher threshold.

FL 150 and FL 290 are tempting because both are genuine dividing lines elsewhere in the regulations — FL 290 in particular is where the vertical separation minimum changes and where the RVSM band begins. Neither has anything to do with where the semicircular tables start.`,
  },

  // ──────────────── Right-of-way (3.2.2) ────────────────
  {
    stem: "When two aircraft are approaching head on, the rules of the air require that",
    expect: "Both aircraft alter heading to starboard",
    cite: "Annex 2, 3.2.2.2",
    exp: `The rule is symmetrical: when two aircraft approach head-on, or approximately so, and there is a danger of collision, **each** shall alter its heading to the right. Neither has right of way, and nothing in the rule depends on size, type or who saw whom first.

The symmetry is the whole point. If the rule gave way to one aircraft, both crews would have to agree on which — in the seconds available, from opposing cockpits. Because both turn the same way relative to themselves, the two aircraft diverge whether or not either pilot knows the other has seen him. Starboard is simply the seaman's word for right.`,
  },
  {
    stem: "The pilot of an aircraft which has the right of way must do certain things to reduce the risk of collision. Apart from monitoring the other aircraft’ actions, what else must he do?",
    expect: "Maintain heading and speed only",
    cite: "Annex 2, 3.2.2",
    exp: `Having right of way is an obligation, not a licence. The rule says the aircraft that has the right of way shall maintain its heading and speed — so that the aircraft giving way has something predictable to avoid.

Note carefully what is *not* in that list: altitude. You are not required to hold your level, which is why "heading, speed and altitude" is wrong. And the same paragraph adds the clause that matters most — nothing in these rules relieves the pilot-in-command of the responsibility to take whatever action, including a collision-avoidance manoeuvre in response to an ACAS resolution advisory, will best avert a collision. Right of way never obliges you to hold course into a collision.`,
  },
  {
    stem: "The pilot of an aircraft that has the right of way must do certain things to reduce the risk of collision. Apart from monitoring the other aircraft’ actions, what else must he do?",
    expect: "Maintain heading and speed only",
    cite: "Annex 2, 3.2.2",
    exp: `Duplicate of the question above, with "which" changed to "that". The requirement on the aircraft holding right of way is to maintain its heading and speed — nothing is said about altitude, which is what rules out the option listing all three.

Predictability is the reason. The pilot giving way is judging a closing geometry; if the other aircraft also manoeuvres, that judgement is worthless. But the duty is not absolute: the same paragraph preserves the pilot-in-command's responsibility to take whatever action best averts a collision, ACAS resolution advisories included.`,
  },
  {
    stem: "When two aircraft are converging at approximately the same altitude, which statement applies?",
    expect: "Gliders shall give way to balloons.",
    cite: "Annex 2, 3.2.2.3 c)",
    exp: `The general converging rule is that the aircraft with the other on its right gives way. Then come the exceptions, and they form a strict order of manoeuvrability: power-driven heavier-than-air aircraft give way to airships, gliders and balloons; airships give way to gliders and balloons; gliders give way to balloons.

A balloon therefore has right of way over everything, which is only sensible — it cannot steer. Read the hierarchy downward from the least controllable and the answer follows: a glider gives way to a balloon. The options putting helicopters and aeroplanes in some order relative to each other are inventing a distinction the rule does not draw; both are power-driven heavier-than-air aircraft and sit on the same rung.`,
  },
  // Two more questions share the stem above word-for-word but offer different
  // option sets, so a different sub-paragraph of 3.2.2.3 supplies each answer.
  // All three statements are true; the bank is testing different rungs of the
  // same hierarchy. (This is why apply-explanations.mjs keys on stem + answer.)
  {
    stem: "When two aircraft are converging at approximately the same altitude, which statement applies?",
    expect: "Helicopters shall give way to gliders.",
    cite: "Annex 2, 3.2.2.3 a)",
    exp: `A helicopter is a power-driven heavier-than-air aircraft, and sub-paragraph a) requires that class to give way to airships, gliders and balloons. So a helicopter gives way to a glider.

The hierarchy runs from most manoeuvrable to least: power-driven heavier-than-air aircraft, then airships, then gliders, then balloons — each giving way to everything below it. Nothing in the rule separates helicopters from aeroplanes; both are power-driven heavier-than-air and occupy the same rung, which is why any option asking you to rank one against the other is wrong.`,
  },
  {
    stem: "When two aircraft are converging at approximately the same altitude, which statement applies?",
    expect: "Power-driven heavier -than-air aircraft shall give way to Gliders",
    cite: "Annex 2, 3.2.2.3 a)",
    exp: `This is the rule stated in its own words: power-driven heavier-than-air aircraft shall give way to airships, gliders and balloons. An aeroplane or a helicopter therefore gives way to a glider.

The underlying logic is manoeuvrability. A glider is trading height for distance and cannot simply add power to resolve a conflict, so the aircraft that can is the one required to. Follow the same reasoning one rung further and you get sub-paragraph c) — gliders give way to balloons, which cannot steer at all — and sub-paragraph d), which puts an aircraft towing another in the same protected position.`,
  },
  {
    stem: "To which of the following must the pilot of a helicopter give way if it is on a converging course with him and there is a risk of collision?",
    expect: "A glider, a balloon, an airship or an aero plane towing a glider.",
    cite: "Annex 2, 3.2.2.3 a) and d)",
    exp: `A helicopter is a power-driven heavier-than-air aircraft, so sub-paragraph a) applies: it gives way to airships, gliders and balloons. But the list does not stop there. Sub-paragraph d) adds that power-driven aircraft shall give way to aircraft seen to be towing other aircraft or objects.

That fourth item is the one candidates miss, and it is why the shorter option naming only glider, balloon and airship is incomplete. A tug on tow has an aircraft on a cable behind it and almost no ability to manoeuvre — the same logic that puts balloons at the top of the hierarchy puts a towing combination there too.`,
  },
  {
    stem: "Two aircraft of the same category are approaching an airport for the purpose of landing. The right-of-way belongs to the aircraft.",
    expect: "at the lower altitude ,but the pilot shall not take advantage of this rule to cut in front of or to to overtake the other aircraft.",
    cite: "Annex 2, 3.2.2.5.2",
    exp: `When two or more heavier-than-air aircraft are approaching an aerodrome to land, the one at the higher level gives way to the one at the lower level. So the lower aircraft has right of way — but the rule immediately qualifies it, and the qualification is half the answer.

The lower aircraft shall not use the rule to cut in front of, or overtake, an aircraft that is in the final stages of an approach to land. Without that clause a pilot could descend below someone established on final and claim priority, which would turn a safety rule into a queue-jumping device. Any option offering the bare "lower aircraft has right of way" without the qualification is incomplete.`,
  },
  {
    stem: "Two aircraft of the different category are approaching an airport for the purpose of landing. The right-of-way belongs to the aircraft",
    expect: "At the lower altitude, but the pilot shall not take advantage of this rule to cut in front of or to overtake the other aircraft",
    cite: "Annex 2, 3.2.2.5.2",
    exp: `The same rule as for two aircraft of the same category — the wording of 3.2.2.5.2 does not distinguish between categories. Aircraft at the higher level give way to aircraft at the lower level, and the lower aircraft must not use that priority to cut in front of, or overtake, one in the final stages of an approach.

There is one category distinction in the paragraph, and it is worth knowing even though it is not among the options here: power-driven heavier-than-air aircraft shall give way to gliders. A glider approaching to land cannot go around.`,
  },

  // ──────────────── Airspace and VMC ────────────────
  {
    stem: "A prohibited area is an area over which:",
    expect: "Flight of aircraft is totally prohibited.",
    cite: "Annex 2, Chapter 1 — Definitions",
    exp: `Take the definition literally: a prohibited area is an airspace of defined dimensions, above the land areas or territorial waters of a State, within which the flight of aircraft is prohibited. Not restricted, not discouraged — prohibited.

The value of this question is the contrast with its neighbour in the same list of definitions. A **restricted** area has identical wording except that flight within it is "restricted in accordance with certain specified conditions" — meaning you may enter if you satisfy the stated conditions. Prohibited admits no such conditions. Examiners test the pair together, so learn them together.`,
  },
  {
    stem: "In VMC the vertical distance from cloud base is ________",
    expect: "1000’",
    cite: "Annex 2, Table 3-1",
    exp: `The VMC minima table gives the distance from cloud as 1 500 m horizontally and 300 m — 1 000 ft — vertically. That vertical figure is constant at and above 10 000 ft AMSL and in the band below 10 000 ft down to 3 000 ft AMSL (or 1 000 ft above terrain, whichever is higher).

What changes between those bands is the flight visibility, not the cloud clearance: 8 km at and above 10 000 ft, 5 km below it. Below 3 000 ft AMSL the requirement changes shape completely — in the lower classes it becomes "clear of cloud and with the surface in sight" rather than a measured distance. So 1 000 ft vertically is the figure to carry, with the caveat that it stops applying in the lowest band.`,
  },
  {
    stem: "When two aircraft are converging at approximately the same altitude",
    expect: "The aircraft that has the other on its right shall give way.",
    cite: "Annex 2, 3.2.2.3",
    exp: `This is the general converging rule, before any of the exceptions: when two aircraft converge at approximately the same level, the one that has the other **on its right** gives way.

A quick way to hold it: you give way to traffic on your right, the same convention as a road junction in a right-hand-drive country. The exceptions in a) to d) then override it purely on aircraft type — power-driven heavier-than-air gives way to airships, gliders and balloons regardless of which side they are on. Note also 3.2.2.1: an aircraft obliged to keep out of the way must avoid passing over, under or in front of the other unless it passes well clear, so "descend to avoid" is not a licence to slide underneath.`,
  },
  {
    stem: "Two a/c of same category converging…",
    expect: "Aircraft on the left will give way",
    cite: "Annex 2, 3.2.2.3",
    exp: `Same rule, stated from the other side of the geometry. The aircraft that has the other on its right must give way — so of the two, it is the one on the **left** that gives way, because from its cockpit the other aircraft is on the right.

Work it from your own cockpit rather than from a plan view and you will not get this backwards: if the other aircraft is on your right, you give way. Both aircraft being of the same category matters only in that it removes the type-based exceptions; the general rule then decides it.`,
  },

  // ──────────────── IFR levels and minimum altitudes ────────────────
  {
    stem: "For an IFR flt on a track of 180º (M) , FL to be selected is",
    expect: "F 240",
    cite: "Annex 2, Appendix 3",
    exp: `Check the boundary first, because this question is built on it. A track of 180° (M) falls in the 180°–359° band — the band runs *from* 180°, so 180° itself is westbound, not eastbound. One degree less and the answer changes completely.

IFR flights in that band take the even whole thousands: FL 20, 40, 60 … 200, 220, 240. So FL 240 is valid. FL 230 is an even-band VFR level's neighbour from the *other* band's IFR series, FL 250 belongs to the 000°–179° IFR series, and FL 255 has the "plus 500" shape that marks a VFR level.`,
  },
  {
    stem: "Cruising level available on a magnetic track of 300 degrees are",
    expect: "125, 145, 165, 185",
    cite: "Annex 2, Appendix 3",
    exp: `Track 300° (M) is in the 180°–359° band. The levels offered — 125, 145, 165, 185 — are even thousands plus 500, which is the VFR series for that band.

Compare the distractors against the table and each fails cleanly: 115, 135, 155, 175 is the VFR series for the *opposite* band; 110, 130, 150, 160 mixes whole thousands from both bands; and 125, 165, 185, 205 has the right shape but skips 145, so it is not a complete series.`,
  },
  {
    stem: "What is the minimum cruise altitude under IFR (over non-mountainous terrain) allowed by ICAO?",
    expect: "1000 feet above the highest fixed object within 8 km of its position",
    cite: "Annex 2, 5.1.2 b)",
    exp: `Two numbers matter here and candidates usually remember only one. Away from high terrain and mountainous areas, an IFR flight shall be at least 300 m (1 000 ft) above the highest obstacle within **8 km** of the estimated position of the aircraft.

The 8 km is the part that gets lost. Every wrong option here keeps the 1 000 ft and shrinks the radius — 600 m, 2 000 m — which is why reading only as far as "1 000 feet" will cost you the mark. And know the companion figure: over high terrain or in mountainous areas it becomes 600 m (2 000 ft) above the highest obstacle within the same 8 km. All of this applies only where the State has not published a minimum flight altitude of its own, and never overrides what is needed for take-off or landing.`,
  },

  // ──────────────── VMC minima (Table 3-1) ────────────────
  {
    stem: "Minimum visibility required to fly at 12000’ for a VFR flt is",
    expect: "8 kms",
    cite: "Annex 2, Table 3-1",
    exp: `12 000 ft is above 10 000 ft AMSL, and that is the band where the flight visibility requirement steps up to 8 km. Below 10 000 ft it is 5 km.

The reason for the step is closing speed. There is no 250 kt speed limit above 10 000 ft, so aircraft converge faster and need to be seen sooner. Note that only the visibility changes at that boundary — the distance from cloud stays 1 500 m horizontally and 300 m (1 000 ft) vertically in both bands.`,
  },
  {
    stem: "Visibility required for VFR flight below 3000’ or 1000’ terrain clearance is",
    expect: "5 km",
    cite: "Annex 2, Table 3-1",
    exp: `In the lowest band — at and below 900 m (3 000 ft) AMSL, or 300 m (1 000 ft) above terrain, whichever is higher — the flight visibility requirement is 5 km.

What changes in this band is the cloud clearance, not the visibility: instead of a measured 1 500 m horizontally and 1 000 ft vertically, the requirement becomes "clear of cloud and with the surface in sight". There is also a relief provision: where the ATS authority so prescribes, visibility may be reduced to not less than 1 500 m for flights slow enough to see and avoid traffic, and helicopters may be permitted below 1 500 m on the same reasoning. That relief is why 1.6 km looks plausible — but it is a permitted exception, not the requirement.`,
  },
  {
    stem: "Minimum vertical distance from clouds for a VFR flt is:",
    expect: "1000’",
    cite: "Annex 2, Table 3-1",
    exp: `The vertical distance from cloud is 300 m — 1 000 ft — and the horizontal distance is 1 500 m. Those figures hold at and above 10 000 ft AMSL and in the band below it down to 3 000 ft AMSL (or 1 000 ft above terrain, whichever is higher).

Keep the pair together: 1 500 m horizontally, 1 000 ft vertically. The trap in this question is the option offering 1 500 ft — the 1 500 is real but it belongs to the horizontal figure and it is metres, not feet.`,
  },
  {
    stem: "Minimum vertical distance from cloud for VFR flight within controlled space is.",
    expect: "1000 ft",
    cite: "Annex 2, Table 3-1",
    exp: `1 000 ft, which is 300 m. The table gives the vertical distance from cloud as 300 m (1 000 ft) across classes B to E, the controlled airspace in which VFR is permitted, and it does not vary with class.

Read the units on the options carefully — 1 000 m and 500 m are there to catch a candidate who has memorised "300 m / 1 000 ft" as a single blur and reaches for whichever number appears first. The horizontal figure, 1 500 m, is the only one properly expressed in metres.`,
  },

  // ──────────────── Visual signals (Appendix 1) ────────────────
  {
    stem: "A series of red and green pyrotechnics fired towards and aircraft indicate",
    expect: "all above are correct",
    cite: "Annex 2, Appendix 1, Section 3",
    exp: `The signal covers all three area types at once, which is why "all of the above" is right. By day and by night, a series of projectiles discharged from the ground at ten-second intervals, each bursting to show red and green lights or stars, warns an unauthorised aircraft that it is flying in — or is about to enter — a **restricted, prohibited or danger area**, and that it must take whatever remedial action is needed.

So the signal does not distinguish between the three. It tells you that you should not be where you are; identifying which kind of area it is, and getting out of it, is then your problem.`,
  },
  {
    stem: "Red and green flashes fired at an interval of 10 sacs indicate.",
    expect: "Over prohibited area, restricted area or danger area.",
    cite: "Annex 2, Appendix 1, Section 3",
    exp: `The ten-second interval is the identifying detail. Projectiles fired from the ground every ten seconds, each showing red and green lights or stars on bursting, warn an unauthorised aircraft that it is in, or about to enter, a restricted, prohibited or danger area.

Do not confuse this with the aerodrome light signals in the next section of the same appendix. There, a **red pyrotechnic** — red alone, no green, no ten-second series — means "notwithstanding any previous instructions, do not land for the time being". Different signal, different section, different meaning.`,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// FLAGGED — NOT written, and why. Do not invent entries for these.
//
// NAVIGATION LIGHT ARCS (roughly 9 questions in this chapter: relative bearing
//   of 100°/270°, steady vs flashing red, red-and-green head-on, what an
//   overtaking pilot sees, crossing left-to-right). Annex 2 3.2.3 requires the
//   lights but explicitly defers their CHARACTERISTICS to Annex 6 and Annex 8
//   and to the Airworthiness Manual (Doc 9760). None of those is on disk, and
//   Schedule IV of the Aircraft Rules, 1937 — the Indian Rules of the Air — is
//   listed in that document's contents but its text is not included in the copy
//   we hold. The arcs (green to starboard, red to port, white astern, and the
//   angles at which each is visible) therefore cannot be cited yet. They are
//   standard and well known, but "well known" is not a source.
//
// INDIAN-SPECIFIC LIMITS. Annex 2 3.1.7 says only that acrobatic flight is
//   conducted "under conditions prescribed by the appropriate authority" — it
//   sets no height and no distance from an aerodrome. So the questions asking
//   for 2 000 ft AGL, or "within 2 nm of the aerodrome perimeter", need the DGCA
//   rule, not Annex 2. Same for the FL 150 IFR-mandatory question, the aerial
//   work sunset margin, and the force-landing reporting question.
//
// AIRMANSHIP / HUMAN-FACTORS ITEMS (best way to use the eyes at night, why most
//   midair collisions happen on clear days, retinal growth on a collision
//   course, no apparent relative motion). These are true and teachable, but they
//   are not regulation, so there is no paragraph to cite. They want a human
//   performance reference before anything is written.
// ─────────────────────────────────────────────────────────────────────────────
