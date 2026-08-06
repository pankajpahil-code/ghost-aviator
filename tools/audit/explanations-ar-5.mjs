// Verified explanations for Air Regulations ar-5 (Separation Methods and Minima).
//
// SCOPE DISCIPLINE — read before adding to this file.
// An explanation is answer-key-grade content. A confidently-worded wrong rule
// does more damage than the "Correct answer: B" placeholder it replaces, because
// a student will believe it and carry it into the exam. So an entry belongs here
// ONLY if the rule was read in the primary source, and the citation names the
// paragraph. Everything else stays a placeholder and goes on the FLAGGED list at
// the bottom of this file until the source to settle it is on disk.
//
// Verified 2026-08-06 against ICAO Doc 4444 (PANS-ATM), 15th ed., Chapter 5,
// paragraph by paragraph. Every `cite` below was read, not recalled.
//
// Keys are normalised question stems (see key() in apply-explanations.mjs).

export const AR5_EXPLANATIONS = [
  // ---- 5.3.2 Vertical separation minimum ----
  {
    stem: "Above flight level 290 the minimum vertical separation between aircraft on reciprocal tracks in RVSM area is",
    expect: "1000 feet up to F410",
    cite: "PANS-ATM 5.3.2 b)",
    exp: `RVSM is the exception, and it has a ceiling. The standard minimum is 1000 ft below FL290 and 2000 ft at or above it — but inside designated RVSM airspace the 1000 ft minimum is extended upward to FL410. Above FL410 it reverts to 2000 ft, so the band in which 1000 ft applies is FL290 to FL410 inclusive. Note the minimum does not depend on the tracks being reciprocal; it is the same figure whatever the relative direction.`,
  },
  {
    stem: "Above 30000 ft the vertical separation between aircraft on reciprocal tracks will be:",
    expect: "1000ft or 2000ft depending on whether or not the aircraft are in RVSM airspace",
    cite: "PANS-ATM 5.3.2 a) and b)",
    exp: `This is the properly worded version of the question, and the answer is "it depends". At or above FL290 the general minimum is 2000 ft. Inside designated RVSM airspace, and only for aircraft approved for it, the minimum stays at 1000 ft up to FL410. So 30 000 ft alone does not fix the answer — you must know whether the airspace is RVSM.`,
  },
  {
    stem: "Separation above F410 is:",
    expect: "2000’",
    cite: "PANS-ATM 5.3.2 b)",
    exp: `FL410 is the top of the RVSM band. The reduced 1000 ft minimum applies below FL410; at or above that level the minimum goes back to 2000 ft. The reason is practical — altimetry error grows with altitude, and above FL410 the height-keeping performance that makes 1000 ft safe can no longer be assured.`,
  },
  {
    stem: "The Min. Separation above F 290 is:",
    expect: "2000’",
    cite: "PANS-ATM 5.3.2 a)",
    exp: `This question is asking for the general rule: a nominal 1000 ft below FL290, and a nominal 2000 ft at or above it. Keep that as your default. The 1000 ft you may be thinking of applies only inside designated RVSM airspace, and only up to FL410 — an exception, not the rule.`,
  },
  {
    stem: "Vertical separation in RVSM airspace",
    expect: "is decreased",
    cite: "PANS-ATM 5.3.2 b)",
    exp: `Reduced Vertical Separation Minimum does what its name says: it halves the minimum from 2000 ft to 1000 ft between FL290 and FL410, which roughly doubles the number of usable cruising levels in that band. The trade is equipment and approval — the aircraft must hold height accurately enough to justify the reduction.`,
  },

  // ---- 5.4.2.2 Longitudinal separation, aircraft climbing or descending ----
  {
    stem: "If a climbing a/c is crossing the level of another a/c the separation required is",
    expect: "15 Mins",
    cite: "PANS-ATM 5.4.2.2.2.1 a)",
    exp: `While an aircraft is passing through the level of another on the same track, vertical separation does not exist for a period — so longitudinal separation has to cover the gap. The minimum is 15 minutes. It reduces to 10 minutes where navigation aids allow frequent checks of position and speed, and to 5 minutes if the level change is begun within 10 minutes of the second aircraft reporting over an exact reporting point. Note the answer is a time, not a distance — that is what the other options are testing.`,
  },
  {
    stem: "Separation between climbing A/C, which is on crossing track of another A/C is",
    expect: "15 mins",
    cite: "PANS-ATM 5.4.2.2.2.2 a)",
    exp: `Same principle as the same-track case, applied where the tracks cross: 15 minutes while vertical separation does not exist, reducing to 10 minutes only where navigation aids permit frequent determination of position and speed. There is no 5-minute provision for crossing tracks — that concession exists only on the same track.`,
  },
  {
    stem: "Separation between climbing a/c , which is on crossing track of another a/c is:",
    expect: "15mins",
    cite: "PANS-ATM 5.4.2.2.2.2 a)",
    exp: `Same principle as the same-track case, applied where the tracks cross: 15 minutes while vertical separation does not exist, reducing to 10 minutes only where navigation aids permit frequent determination of position and speed. There is no 5-minute provision for crossing tracks — that concession exists only on the same track.`,
  },
  {
    stem: "An aircraft is on a track of 030º (M) and reports crossing a point at 0412 Hrs at F370. Other aircraft at F370 on a track of 100º(M) can cross the same point not earlier than:",
    expect: "0427 hrs",
    cite: "PANS-ATM 5.4.2.2.1.2 a)",
    exp: `Work it in two steps. First, what geometry? The tracks differ by 70°, so these are crossing tracks, and both aircraft are at F370 — the same level, with no vertical separation available. Second, what minimum? For aircraft on crossing tracks at the same level, 15 minutes is required at the point of intersection. So 0412 + 15 = 0427. The "0417 if 40 kts faster" option is bait from a different rule — the 3-minute same-track concession — which does not apply to crossing tracks.`,
  },
  {
    stem: "An ac at F390 crosses a point at 0210 hrs wishes to descent to F310. There is reciprocal traffic estimating to cross same point at 0300hrs maintaining F 330. By what time the descending aircraft should reach F310 if both aircraft maintain same speed?",
    expect: "0225 hrs",
    cite: "PANS-ATM 5.4.2.2.3",
    exp: `Two steps again. First, when do they pass? One aircraft is over the point at 0210, the other estimates it at 0300, and both hold the same speed — so they meet midway in time, at 0235. Second, what does the rule demand? On reciprocal tracks, vertical separation must exist for at least 10 minutes before and after the estimated passing time. The descending aircraft must therefore be established at F310, clear below F330, by 0235 − 10 = 0225. Reaching F310 any later leaves the two aircraft inside the protected window.`,
  },

  // ---- 5.5 Separation of aircraft holding in flight ----
  {
    stem: "The lateral separation reqd. if an A/C is holding at a level",
    expect: "5 mins",
    cite: "PANS-ATM 5.5.2",
    exp: `Five minutes is the right figure, though the question calls it the wrong thing. The rule is not a lateral minimum: unless lateral separation already exists, VERTICAL separation must be applied between an aircraft holding and any other aircraft — arriving, departing or en route — whenever that other aircraft comes within five minutes flying time of the holding area. So five minutes is the trigger that forces vertical separation, not a horizontal minimum in its own right.`,
  },
  {
    stem: "Lateral separation between two aircraft, one climbing and another holding is",
    expect: "5 mins",
    cite: "PANS-ATM 5.5.2",
    exp: `The same holding rule. A climbing aircraft is simply "other traffic" as far as the hold is concerned: unless lateral separation exists, vertical separation must be applied once it is within five minutes flying time of the holding area. Remember it as a protected bubble of five minutes around the hold.`,
  },
];

/**
 * Questions in ar-5 that were NOT given an explanation, and why. These stay as
 * placeholders on purpose. Do not "finish the chapter" by writing plausible text
 * for them — get the source, then write.
 *
 * NEEDS INDIA AIP (transition altitude/level are national, not ICAO):
 *   - "Minimum transition altitude in for an aerodrome is"        (4000 ft AMSL?)
 *   - "Transition altitude at an aerodrome is above _____ Msl in" (4000 ft AMSL?)
 *   - "Lowest Transition Level in is:"                            (FL50?)
 *   - "Outside controlled airspace above 3000’AMSL"               (national rule)
 *   - "The highest flight level that can be flown in is"
 *
 * NEEDS ICAO ANNEX 2 (Rules of the Air — not on this machine):
 *   - interception: "military aeroplane flies alongside you and rocks its wings"
 *   - "Minimum vertical separation in mountainous area" (a terrain-clearance
 *     rule, 2000 ft within 8 km — and NOT a separation minimum at all, so the
 *     explanation must correct the premise, which needs the primary text)
 *
 * NEEDS ICAO ANNEX 11 (ATS — not on this machine):
 *   - "Air Traffic Advisory Service is provided in airspace classified as"
 *   - "The air traffic service which prevents the collision between aircraft"
 *   - the Air Traffic Advisory Service definition question
 *
 * DAMAGED STEMS — a word was deleted from these by an earlier process (probably a
 * place name), leaving them unanswerable as printed. Repair before explaining:
 *   - "You are descending from F-200 to 12000 over . 13000’ will be reported as"
 *   - the four transition-altitude stems listed above, all missing "in <country>"
 *
 * EXACT DUPLICATES still in the bank (two carry a leaked "Q24R."/"Q25R." prefix
 * in the stem, which the July repair pass missed because it only matched a
 * digits-then-dot pattern):
 *   - "Q24R. An aircraft is on a track of 030º (M) ..."
 *   - "Q25R. An ac at F390 crosses a point at 0210 hrs ..."
 *   - the two "non-RVSM aircraft in RVSM airspace" copies
 *   - the two "climbing on crossing track" copies (both explained above)
 *
 * ALTIMETRY questions (pressure altitude, QNH/QFE/QNE, transition layer
 * reporting) are verifiable from first principles and standard doctrine, but no
 * altimetry primary source is on disk, so they are deliberately left for the
 * next batch rather than written from memory.
 */
export const AR5_FLAGGED_COUNT = 34;
