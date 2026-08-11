// ADAPT — English Language item generators.
//
// Screening batteries test English because ICAO requires it and because a
// misheard clearance kills people. The sub-skills tested are sentence
// structure, vocabulary, and reading for detail.
//
// ── Why these are generated, and where the risk sits ────────────────────────
//
// English cannot be generated the way arithmetic can: there is no formula for a
// sentence. What CAN be generated safely is the class of items whose answer is
// fixed by a GRAMMATICAL RULE rather than by taste — agreement, tense sequence,
// countability, comparative vs superlative — plus comprehension items where the
// passage is assembled from known facts, so the correct answer is whatever we
// put in the passage.
//
// The risk therefore moves from the item to the rule tables below, exactly as
// it moved to the generators in maths.mjs. The tables are small, explicit, and
// unit-tested. Nothing here depends on a model's opinion about what "sounds
// right": every answer is derivable from a stated rule, and every distractor
// names the rule it breaks.
//
// NOTE FOR THE CAPTAIN: the sentences are authored templates. They are
// deliberately plain, aviation-flavoured and free of idiom, but they are the
// one place in ADAPT where wording is a matter of judgement rather than
// computation — worth your eye before this module carries any weight.

import { makeRng, irange, pick, shuffle } from "../rng.mjs";

export const FAMILIES = [
  "subject-verb-agreement",
  "tense-sequence",
  "countability",
  "comparison",
  "brief-comprehension",
];

/** Difficulty tier per family — 1 Foundation, 2 Intermediate, 3 Advanced. See maths.mjs TIERS. */
export const TIERS = {
  "subject-verb-agreement": 1,
  "countability": 1,
  "tense-sequence": 2,
  "comparison": 2,
  "brief-comprehension": 3,
};


/** Build a 4-option item from text options. The numeric builder in mcq.mjs cannot serve here. */
function textItem(rnd, { id, family, stem, correct, wrong, solution, meta }) {
  const cells = shuffle(rnd, [{ text: correct, why: null, correct: true }, ...wrong.map((w) => ({ ...w, correct: false }))]);
  if (new Set(cells.map((c) => c.text)).size !== cells.length) {
    throw new Error(`${family}: duplicate option text in "${stem}"`);
  }
  return {
    id,
    family,
    stem,
    options: cells.map((c) => c.text),
    answerIndex: cells.findIndex((c) => c.correct),
    optionNotes: cells.map((c) => c.why),
    solution,
    meta,
  };
}

// ── 1. Subject–verb agreement ──────────────────────────────────────────────
//
// The teaching point is that the verb agrees with the HEAD of the subject, not
// with whatever noun happens to sit closest to it. Every item therefore puts a
// prepositional phrase of the opposite number between the two.

const SV_SUBJECTS = [
  { head: "The box", number: "sing", tail: "of spare parts", tailNumber: "plur" },
  { head: "The list", number: "sing", tail: "of waypoints", tailNumber: "plur" },
  { head: "The set", number: "sing", tail: "of charts", tailNumber: "plur" },
  { head: "The bundle", number: "sing", tail: "of manuals", tailNumber: "plur" },
  { head: "The pallets", number: "plur", tail: "of freight", tailNumber: "sing" },
  { head: "The copies", number: "plur", tail: "of the flight plan", tailNumber: "sing" },
  { head: "The engineers", number: "plur", tail: "from the maintenance base", tailNumber: "sing" },
  { head: "The reports", number: "plur", tail: "from the tower", tailNumber: "sing" },
];

const SV_PREDICATES = [
  "stored in the forward hold.",
  "already on board.",
  "ready for the crew.",
  "checked before every departure.",
];

function subjectVerbAgreement(rnd, id) {
  const s = pick(rnd, SV_SUBJECTS);
  const predicate = pick(rnd, SV_PREDICATES);
  const singular = s.number === "sing";
  const correct = singular ? "is" : "are";
  const attractor = singular ? "are" : "is";
  return textItem(rnd, {
    id,
    family: "subject-verb-agreement",
    stem: `${s.head} ${s.tail} ____ ${predicate}`,
    correct,
    wrong: [
      { text: attractor, why: `The verb agrees with "${s.head.toLowerCase()}", not with "${s.tail.replace(/^of |^from /, "")}". Words between the subject and the verb do not change its number.` },
      { text: singular ? "were" : "was", why: "Wrong number and wrong tense — the sentence is about now, not the past." },
      { text: "be", why: "The bare form cannot stand as the main verb of a statement." },
    ],
    solution: `The subject is "${s.head}", which is ${singular ? "singular" : "plural"}, so the verb is "${correct}". "${s.tail}" only describes it.`,
    meta: { head: s.head, number: s.number },
  });
}

// ── 2. Tense sequence ──────────────────────────────────────────────────────
//
// When one past action finishes before another, the earlier one takes the past
// perfect. The rule decides the answer; nothing here is a matter of ear.

// Each scenario names its own two actors. An earlier version reused "the crew"
// for both clauses and produced "By the time the crew started the engines, the
// crew had obtained the clearance" — grammatical, and clumsy enough that a
// student would notice.
const TENSE_SCENARIOS = [
  { verb: "complete", past: "completed", object: "the checklist", actor: "the crew", late: "the aircraft reached the holding point" },
  { verb: "obtain", past: "obtained", object: "the clearance", actor: "the first officer", late: "the engines were started" },
  { verb: "file", past: "filed", object: "the flight plan", actor: "the dispatcher", late: "the passengers boarded" },
  { verb: "check", past: "checked", object: "the weather", actor: "the captain", late: "the load sheet was signed" },
  { verb: "brief", past: "briefed", object: "the approach", actor: "the crew", late: "the aircraft left the cruise level" },
];

function tenseSequence(rnd, id) {
  const s = pick(rnd, TENSE_SCENARIOS);
  const { verb, past, object } = s;
  return textItem(rnd, {
    id,
    family: "tense-sequence",
    stem: `By the time ${s.late}, ${s.actor} ____ ${object}.`,
    correct: `had ${past}`,
    wrong: [
      { text: `has ${past}`, why: "The present perfect links to now. Both actions here are in the past." },
      { text: `${verb}s`, why: "The present simple cannot describe something finished before a past event." },
      { text: `will have ${past}`, why: "The future perfect points forward; this sentence looks back." },
    ],
    solution: `Both actions are in the past, and this one finished first, so it takes the past perfect: "had ${past}".`,
    meta: { verb },
  });
}

// ── 3. Countability ────────────────────────────────────────────────────────
//
// Countable and uncountable nouns take different quantifiers. Membership of
// each list is a fact about the language, not a judgement.

const UNCOUNTABLE = ["fuel", "baggage", "traffic", "turbulence", "visibility", "paperwork"];
const COUNTABLE = ["passengers", "runways", "delays", "waypoints", "aircraft on the ground", "approaches"];

function countability(rnd, id) {
  const uncountable = rnd() < 0.5;
  const noun = pick(rnd, uncountable ? UNCOUNTABLE : COUNTABLE);
  const askMuch = rnd() < 0.5;

  const correct = askMuch ? (uncountable ? "much" : "many") : (uncountable ? "less" : "fewer");
  const opposite = askMuch ? (uncountable ? "many" : "much") : (uncountable ? "fewer" : "less");
  // "The second sector had ..." rather than "There was/were ...": the latter
  // needs its own subject-verb agreement, and an earlier version shipped "There
  // was fewer waypoints" — an agreement error inside an English test.
  const stem = askMuch
    ? `How ____ ${noun} did the flight carry?`
    : `The second sector had ____ ${noun} than the first.`;

  return textItem(rnd, {
    id,
    family: "countability",
    stem,
    correct,
    wrong: [
      { text: opposite, why: `"${noun}" is ${uncountable ? "uncountable" : "countable"}, so it takes "${correct}", not "${opposite}".` },
      { text: askMuch ? "amount of" : "lesser", why: askMuch ? "This does not fit the question form — \"How amount of\" is not English." : "\"Lesser\" means inferior in quality, not smaller in quantity." },
      { text: askMuch ? "number" : "little", why: askMuch ? "\"How number\" is not English; the quantifier itself is what belongs in the gap." : "This form does not fit a comparison between two sectors." },
    ],
    solution: `"${noun}" is ${uncountable ? "uncountable" : "countable"}, so the correct quantifier is "${correct}".`,
    meta: { noun, uncountable, askMuch },
  });
}

// ── 4. Comparative vs superlative ──────────────────────────────────────────
//
// Two things compare; three or more take the superlative. The count in the
// sentence decides the answer.

// Plurals are stated, never derived. Appending "s" gave "approachs" — a
// spelling error in an English test, which is about the worst place for one.
const COMPARE_SETS = [
  { plural: "runways", adj: "long", comp: "longer", sup: "longest" },
  { plural: "approaches", adj: "short", comp: "shorter", sup: "shortest" },
  { plural: "routes", adj: "direct", comp: "more direct", sup: "most direct" },
  { plural: "diversions", adj: "suitable", comp: "more suitable", sup: "most suitable" },
];

function comparison(rnd, id) {
  const s = pick(rnd, COMPARE_SETS);
  const count = pick(rnd, [2, 3, 4]);
  const superlative = count > 2;
  const correct = superlative ? `the ${s.sup}` : `the ${s.comp}`;
  const wrongForm = superlative ? `the ${s.comp}` : `the ${s.sup}`;
  const word = count === 2 ? "two" : count === 3 ? "three" : "four";
  return textItem(rnd, {
    id,
    family: "comparison",
    stem: `Of the ${word} ${s.plural} available, the first is ____.`,
    correct,
    wrong: [
      { text: wrongForm, why: superlative ? `With ${word} items you compare all of them, so the superlative is needed.` : "With only two items the comparative is used, not the superlative." },
      { text: `more ${s.sup}`, why: "A double comparison — use either the comparative or the superlative, never both." },
      { text: `${s.adj}est than`, why: "This mixes a superlative ending with the comparative word \"than\"." },
    ],
    solution: `${word === "two" ? "Two items are compared with the comparative" : `More than two items take the superlative`}, so the answer is "${correct}".`,
    meta: { count, superlative },
  });
}

// ── 5. Reading a briefing for detail ───────────────────────────────────────
//
// The passage is assembled from facts we choose, so the correct answer is known
// by construction and the distractors are the other real values in the same
// briefing — which is what makes it a reading test rather than a guess.

const AERODROMES = ["Jaipur", "Udaipur", "Indore", "Bhopal", "Nagpur", "Raipur", "Vadodara", "Rajkot"];

/**
 * Three distinct wrong times for the flight-time question.
 *
 * Candidates are tried in teaching order and each is kept only if it is new and
 * is not the answer; the offsets after the first three exist so the function
 * cannot run short whatever `minutes` and `level` roll. Values are kept
 * positive — "-5 minutes" is not a distractor, it is a bug on display.
 */
function timeDistractors(minutes, level) {
  const out = [];
  const seen = new Set([minutes]);
  for (const v of [level, minutes + 10, minutes - 8, minutes + 15, minutes - 12, minutes + 25, minutes + 4, minutes - 3]) {
    if (v <= 0 || seen.has(v)) continue;
    seen.add(v);
    out.push(`${v} minutes`);
    if (out.length === 3) break;
  }
  return out;
}

function briefComprehension(rnd, id) {
  // Four of each: two appear in the briefing, the spares are type-matched
  // distractors. An earlier version padded from a mixed pool and offered a
  // runway number as the answer to "which aerodrome is the alternate?" — which
  // a student can eliminate without reading a word of the passage.
  const rwys = shuffle(rnd, ["09", "27", "18", "36", "13", "31"]).slice(0, 4);
  const places = shuffle(rnd, AERODROMES).slice(0, 4);
  const level = irange(rnd, 8, 24) * 10;
  const minutes = irange(rnd, 35, 95);
  const fuel = irange(rnd, 9, 26) * 100;

  const passage =
    `Departure is from runway ${rwys[0]} at ${places[0]}. ` +
    `The cruise level is FL${level} and the planned flight time is ${minutes} minutes. ` +
    `The destination is ${places[1]} and the nominated alternate is ${places[2]}. ` +
    `Total fuel on board is ${fuel} kg. Arrival is expected on runway ${rwys[1]}.`;

  // Every distractor is the same KIND of thing as the answer: aerodromes for an
  // aerodrome question, runways for a runway question, minutes for a time.
  const questions = [
    { q: "Which aerodrome is the nominated alternate?", a: places[2],
      pool: [places[0], places[1], places[3]],
      why: "That aerodrome is named in the briefing, but not as the alternate." },
    { q: "Which runway is the arrival expected on?", a: rwys[1],
      pool: [rwys[0], rwys[2], rwys[3]],
      why: "That is a runway, but not the one the arrival is expected on." },
    // The pool is built rather than written out, because two of the three
    // obvious distractors can COLLIDE. `level` runs 80-240 and `minutes` runs
    // 35-95, so a paper that rolled minutes=70 and level=80 produced
    // `minutes + 10` and `level` as the same string, the duplicate was dropped,
    // and the item threw with "only 2 distractors" — killing the whole paper
    // for that student. It was rare enough to survive review and every test
    // until a change asked this family for more items per paper.
    //
    // The flight-level-read-as-minutes distractor is kept FIRST because it is
    // the one that teaches something: it is the mistake of reading FL180 off
    // the briefing as the answer to a time question.
    { q: "What is the planned flight time?", a: `${minutes} minutes`,
      pool: timeDistractors(minutes, level),
      why: "That figure is not the planned flight time." },
    { q: "What is the total fuel on board?", a: `${fuel} kg`,
      pool: [`${fuel + 200} kg`, `${fuel - 300} kg`, `${fuel + 500} kg`],
      why: "That is not the figure given for fuel on board." },
  ];
  const chosen = pick(rnd, questions);

  const wrong = [];
  const seen = new Set([chosen.a]);
  for (const v of chosen.pool) {
    if (seen.has(v)) continue;
    seen.add(v);
    wrong.push({ text: v, why: chosen.why });
  }
  if (wrong.length !== 3) throw new Error(`brief-comprehension: only ${wrong.length} distractors for "${chosen.q}"`);

  return textItem(rnd, {
    id,
    family: "brief-comprehension",
    stem: `${passage}\n\n${chosen.q}`,
    correct: chosen.a,
    wrong,
    solution: `The briefing states it directly: ${chosen.a}.`,
    meta: { level, minutes, fuel },
  });
}

const GENERATORS = {
  "subject-verb-agreement": subjectVerbAgreement,
  "tense-sequence": tenseSequence,
  countability,
  comparison,
  "brief-comprehension": briefComprehension,
};

/** Generate one item of a named family. Same (family, seed) -> identical item. */
export function generateItem(family, seed) {
  const gen = GENERATORS[family];
  if (!gen) throw new RangeError(`unknown english family: ${family}`);
  return gen(makeRng(seed), `${family}-${seed >>> 0}`);
}
