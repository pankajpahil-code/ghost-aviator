// ADAPT — Attitudes & Airmanship (the personality module).
//
// Capt. Pahil's ruling, 2026-08-09: this module TEACHES AND SCORES. What
// follows is how it does that without inventing psychometrics.
//
// ── The line this module does not cross ────────────────────────────────────
//
// We have no validated instrument, no normative sample and no psychologist. So
// nothing here scores a student against a population, and nothing here returns
// a verdict on their suitability. What it does instead:
//
//   * every scored dimension is anchored to a PUBLISHED framework — the FAA's
//     five hazardous attitudes and their published antidotes, taught in
//     aeronautical decision-making and already inside the DGCA human
//     performance syllabus. We supply original scenarios; the framework and the
//     antidotes are not ours and are not invented.
//   * the output is a PROFILE PLUS COACHING, in exactly the way a hazardous-
//     attitude inventory is used in a training debrief — "this is the one that
//     showed up most for you, here is its antidote" — never "you are unsuitable".
//   * a consistency index is reported, because that IS purely a fact about the
//     student's own answers and needs no psychology to be true.
//   * responses never leave the device.
//
// DRAFT FOR THE CAPTAIN'S REVIEW: the scenarios below are written by a model.
// The framework is published and the mapping is mechanical, but the wording is
// student-facing teaching material and his voice is the brand. Nothing here
// should carry weight until he has read it.

/**
 * The five hazardous attitudes and their published antidotes, as taught in
 * aeronautical decision-making. The antidote wording is the standard one — it
 * is meant to be memorised verbatim, so it is reproduced rather than reworded.
 */
export const ATTITUDES = {
  "anti-authority": {
    key: "anti-authority",
    name: "Anti-authority",
    reads: "Don't tell me.",
    meaning: "Rules are for other people, or for people who need them. Resentment of procedure and of being told.",
    antidote: "Follow the rules. They are usually right.",
    coaching: "The rule you resent is usually the one written after somebody died. When a procedure irritates you, find out what it was written for before you decide it does not apply to you.",
  },
  impulsivity: {
    key: "impulsivity",
    name: "Impulsivity",
    reads: "Do something — quickly!",
    meaning: "The urge to act at once, before thinking the situation through.",
    antidote: "Not so fast. Think first.",
    coaching: "Almost nothing in an aeroplane needs your hands in the first two seconds. Aviate, then navigate, then communicate — and the first of those is usually 'do nothing sudden'.",
  },
  invulnerability: {
    key: "invulnerability",
    name: "Invulnerability",
    reads: "It won't happen to me.",
    meaning: "Accidents happen to other pilots. A quiet belief that you are the exception.",
    antidote: "It could happen to me.",
    coaching: "Every accident report was written about someone who believed what you believe. Read one properly and notice how ordinary the crew were.",
  },
  macho: {
    key: "macho",
    name: "Macho",
    reads: "I can do it.",
    meaning: "Taking chances to prove capability — to others, or to yourself.",
    antidote: "Taking chances is foolish.",
    coaching: "Nobody is watching, and if they are, they are not the ones who will be in the wreckage. The impressive pilot is the one who turned back early and bored everyone.",
  },
  resignation: {
    key: "resignation",
    name: "Resignation",
    reads: "What's the use?",
    meaning: "A sense that the situation is out of your hands, so effort is pointless.",
    antidote: "I'm not helpless. I can make a difference.",
    coaching: "You always have something left — a control, a frequency, a decision. Resignation is the only hazardous attitude that guarantees the outcome it fears.",
  },
};

export const ATTITUDE_KEYS = Object.keys(ATTITUDES);

/**
 * Scenarios. Each offers exactly one response per hazardous attitude, and the
 * student marks which is MOST like them and which is LEAST — a forced choice,
 * so it cannot be answered by agreeing with everything.
 *
 * `pairOf` marks scenarios written to probe the same ground from a different
 * angle. Answering a pair incongruently is not "cheating" and is never
 * punished — it is reported, because noticing your own inconsistency is the
 * point of the exercise.
 */
export const SCENARIOS = [
  {
    id: "p1",
    situation: "You are number two for departure. The aircraft ahead reports a bird strike on the runway and the tower asks everyone to hold. You are already twenty minutes behind schedule.",
    options: {
      "anti-authority": "A runway inspection for one bird is overcautious. I would ask to depart from an intersection and get going.",
      impulsivity: "I would call the tower straight away and push for an immediate departure before the queue builds up.",
      invulnerability: "Bird remains are a hazard in theory, but the chance of my aircraft hitting anything is tiny.",
      macho: "My aircraft can handle debris that would worry a lighter type. I would take it.",
      resignation: "Once ATC starts inspecting a runway the delay is out of my hands, so there is no point doing anything.",
    },
  },
  {
    id: "p2",
    situation: "En route, the weather at your destination has deteriorated below your personal minima, though it remains above the published minima for the approach.",
    options: {
      "anti-authority": "Personal minima are a private invention. The published minima are the real limit.",
      impulsivity: "I would commence the approach immediately and decide when I see the runway.",
      invulnerability: "I have flown approaches like this before without difficulty. It will be fine.",
      macho: "Turning back over a bit of weather is not what a competent pilot does.",
      resignation: "The weather will do what it does. I would carry on and hope it lifts.",
    },
  },
  {
    id: "p3",
    situation: "During the walk-around you find a small amount of oil on the cowling. The engineer says it is within limits and signs it off, but something about it bothers you.",
    options: {
      "anti-authority": "The paperwork is signed, so the matter is closed whatever I think.",
      impulsivity: "I would wipe it down, take off, and see whether it comes back.",
      invulnerability: "Minor seepage is normal. It is not going to be my engine that fails.",
      macho: "Raising it again would look as though I do not trust my own judgement about a trivial defect.",
      resignation: "If the engineer has released it there is nothing more I can do about it.",
    },
    pairOf: "p6",
  },
  {
    id: "p4",
    situation: "You are a first officer. The captain, who is far more experienced than you, is setting up an approach in a way you believe is wrong.",
    options: {
      "anti-authority": "Seniority does not make him right. I would tell him he is doing it wrong.",
      impulsivity: "I would reach across and change the setting before it goes any further.",
      invulnerability: "He has done thousands of these. Whatever he is doing will work out.",
      macho: "I would fly my own way on my sector and show him how it should be done.",
      resignation: "He is the captain. If he wants it that way there is nothing I can usefully say.",
    },
  },
  {
    id: "p5",
    situation: "Halfway through a training flight the weather closes in faster than forecast and your instructor asks what you want to do.",
    options: {
      "anti-authority": "The forecast was wrong, which is exactly why I do not put much weight on them.",
      impulsivity: "I would turn immediately towards the nearest field without working anything out first.",
      invulnerability: "Conditions like this look worse than they are. I would continue as planned.",
      macho: "I would press on. Handling deteriorating weather is what the training is for.",
      resignation: "I would ask the instructor to take over, since he will decide anyway.",
    },
  },
  {
    id: "p6",
    situation: "On the ground you notice a small crack in a cabin window trim. It is cosmetic as far as you can tell, and reporting it will almost certainly delay the flight.",
    options: {
      "anti-authority": "The reporting requirement is written for structural cracks, not trim. I would not enter it.",
      impulsivity: "I would make the decision on the spot and go, rather than hold everyone up deliberating.",
      invulnerability: "Trim cracks are everywhere on old airframes and nothing ever comes of them.",
      macho: "I am experienced enough to tell cosmetic from structural without a second opinion.",
      resignation: "Whatever I write will be overruled by someone above me, so it hardly matters.",
    },
    pairOf: "p3",
  },
];

/** How many scenarios form a consistency pair. */
export const PAIRS = SCENARIOS.filter((s) => s.pairOf).length / 2;

/**
 * Score a completed questionnaire.
 *
 * `responses` is one entry per scenario:
 *   { id, most: <attitudeKey>, least: <attitudeKey> }
 *
 * The profile counts how often each attitude was chosen as MOST like the
 * student, less the times it was chosen as LEAST. That is an ipsative tally —
 * it says which attitudes are strongest RELATIVE TO EACH OTHER for this person,
 * and deliberately not how they compare to anybody else.
 */
export function scoreProfile(responses = []) {
  const byId = new Map(
    responses
      .filter((r) => r && typeof r.id === "string")
      .map((r) => [r.id, r])
  );

  const tally = Object.fromEntries(ATTITUDE_KEYS.map((k) => [k, { most: 0, least: 0, net: 0 }]));
  let answered = 0;

  for (const scenario of SCENARIOS) {
    const r = byId.get(scenario.id);
    if (!r) continue;
    const most = ATTITUDE_KEYS.includes(r.most) ? r.most : null;
    const least = ATTITUDE_KEYS.includes(r.least) ? r.least : null;
    if (!most || !least || most === least) continue;
    answered++;
    tally[most].most++;
    tally[least].least++;
  }
  for (const k of ATTITUDE_KEYS) tally[k].net = tally[k].most - tally[k].least;

  if (answered === 0) {
    return { answered: 0, total: SCENARIOS.length, complete: false, tally, dominant: null, consistency: null, pairsChecked: 0 };
  }

  // Consistency: did the paired scenarios draw the same attitude?
  let pairsChecked = 0;
  let pairsCongruent = 0;
  const seenPairs = new Set();
  for (const scenario of SCENARIOS) {
    if (!scenario.pairOf) continue;
    const key = [scenario.id, scenario.pairOf].sort().join("|");
    if (seenPairs.has(key)) continue;
    seenPairs.add(key);
    const a = byId.get(scenario.id);
    const b = byId.get(scenario.pairOf);
    if (!a || !b || !a.most || !b.most) continue;
    pairsChecked++;
    if (a.most === b.most) pairsCongruent++;
  }

  const ranked = ATTITUDE_KEYS
    .map((k) => ({ key: k, ...tally[k] }))
    .sort((x, y) => y.net - x.net || y.most - x.most);

  // A "dominant" attitude only means something if it actually stood out. When
  // the tally is flat, saying one of them is dominant would be reading tea
  // leaves and then coaching against them.
  const dominant = ranked[0].net > 0 && ranked[0].net > ranked[1].net ? ATTITUDES[ranked[0].key] : null;

  return {
    answered,
    total: SCENARIOS.length,
    complete: answered === SCENARIOS.length,
    tally,
    ranked,
    dominant,
    pairsChecked,
    consistency: pairsChecked === 0 ? null : pairsCongruent / pairsChecked,
  };
}
