// ADAPT — Aviation Maths item generators.
//
// ── Why these are GENERATED rather than authored ───────────────────────────
// Everywhere else on this site, a question carries a marked answer that a human
// must verify against an authoritative source before it can teach (Iron Rule 1).
// A generated item has no marked answer to distrust: the generator rolls the
// inputs, COMPUTES the result, and emits the worked solution alongside it. The
// item is correct by construction, and it never repeats.
//
// The honest trade — and it is the whole risk of this file: the danger moves
// from the item to the generator. One bug here is a wrong answer at scale, not
// a wrong answer once. So:
//   1. every family is unit-tested by INDEPENDENT recomputation, not by
//      re-running the same expression the generator used;
//   2. every family is bounded so its values stay mentally tractable — the real
//      screening forbids calculators, and an item needing one is not practice,
//      it is arithmetic punishment;
//   3. every distractor is a NAMED common error, so a wrong pick teaches
//      something. Random noise as a distractor teaches nothing.
//
// Values are chosen so the answer lands exactly on a whole number wherever the
// arithmetic allows it. Where rounding is genuinely part of the skill (the
// crosswind family), the stem says so and the solution shows the rounding.

import { makeRng, irange, istep, pick, shuffle } from "../rng.mjs";

/** Family identifiers. Stable — attempt history and weak-area analysis key on these. */
export const FAMILIES = [
  "time-enroute",
  "distance-covered",
  "ground-speed",
  "fuel-required",
  "fuel-endurance",
  "fuel-burn-rate",
  "rate-of-descent",
  "volume-to-mass",
  "crosswind-component",
  "fuel-remaining",
];

// ── Formatting ─────────────────────────────────────────────────────────────

/**
 * Thousands-separated, at most `dp` decimals, trailing zeros trimmed.
 *
 * Grouping is deliberately international (500,000) and NOT the Indian lakh
 * convention (5,00,000). Our students are Indian, but altitudes, masses and
 * rates are international quantities — no AFM, chart or flight plan anywhere
 * writes a rate of descent as 5,00,000 ft/min, and seeing one would make the
 * paper look broken. Rupee figures elsewhere on this site correctly use lakh
 * grouping; this is the other case.
 */
function num(n, dp = 0) {
  const rounded = Number(n.toFixed(dp));
  return rounded.toLocaleString("en-US", { maximumFractionDigits: dp });
}

/** Minutes as the way a pilot says it: 95 -> "1 h 35 min". */
function hhmm(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

// ── Option assembly ────────────────────────────────────────────────────────

/**
 * Render a value the way it will appear on the option button.
 *
 * Precision is adaptive because the distractors are deliberately of a different
 * magnitude to the answer: "forgot to multiply by 60" turns 70 min into 1.17,
 * and printing that as a flat "1" both hides the error being taught and risks
 * colliding with another distractor.
 */
function fmtValue(v) {
  if (Number.isInteger(v)) return num(v, 0);
  const abs = Math.abs(v);
  if (abs < 10) return num(v, 2);
  if (abs < 100) return num(v, 1);
  return num(v, 0);
}

/**
 * Build a 4-option MCQ from a correct value and a list of named common errors.
 *
 * Distractors are filtered for non-positive values (a negative fuel figure is
 * not a plausible wrong answer, it is a giveaway) and for collision — and the
 * collision test is on the RENDERED STRING, not on the underlying number. Two
 * distinct values that both print as "1" are one option as far as the student
 * is concerned, and shipping the same text twice on one question is the kind of
 * defect that makes a whole paper look untrustworthy.
 *
 * If too few named errors survive, the shortfall is padded with proportional
 * near-misses — deliberately last, because a named error is always the better
 * teacher.
 */
/**
 * A distractor is "plausible" if it is within a factor of 5 of the answer.
 *
 * Several of the taught errors — using minutes as hours, multiplying instead of
 * dividing — land 60x out. They are genuine errors and worth showing, but a
 * student who eliminates purely on magnitude should not be able to crack the
 * whole item that way. So at most ONE wildly-out option is allowed per
 * question; a second is dropped in favour of a near-miss, which forces the
 * arithmetic to actually be done.
 */
const PLAUSIBLE_FACTOR = 5;
const isPlausible = (value, answer) =>
  value >= answer / PLAUSIBLE_FACTOR && value <= answer * PLAUSIBLE_FACTOR;

function mcq(rnd, { id, family, stem, answer, unit, errors, solution, meta }) {
  const taken = new Set([fmtValue(answer)]);
  const chosen = [];
  let wildUsed = 0;

  for (const e of errors) {
    if (!Number.isFinite(e.value) || e.value <= 0) continue;
    const shown = fmtValue(e.value);
    if (taken.has(shown)) continue;
    const wild = !isPlausible(e.value, answer);
    if (wild && wildUsed >= 1) continue;
    if (wild) wildUsed++;
    taken.add(shown);
    chosen.push(e);
    if (chosen.length === 3) break;
  }

  // Pad with proportional near-misses if the named errors collided.
  const padFactors = [1.25, 0.8, 1.5, 0.6, 1.1, 0.9, 1.35, 0.7];
  for (let i = 0; chosen.length < 3 && i < padFactors.length; i++) {
    let v = answer * padFactors[i];
    if (Number.isInteger(answer)) v = Math.round(v);
    if (!Number.isFinite(v) || v <= 0) continue;
    const shown = fmtValue(v);
    if (taken.has(shown)) continue;
    taken.add(shown);
    chosen.push({ value: v, why: null });
  }

  const cells = shuffle(rnd, [
    { value: answer, correct: true, why: null },
    ...chosen.map((e) => ({ value: e.value, correct: false, why: e.why })),
  ]);

  return {
    id,
    family,
    stem,
    unit,
    options: cells.map((c) => `${fmtValue(c.value)} ${unit}`.trim()),
    answerIndex: cells.findIndex((c) => c.correct),
    /** Per-option explanation of the error that produces it. null on the correct option. */
    optionNotes: cells.map((c) => c.why),
    solution,
    meta,
  };
}

// ── The families ───────────────────────────────────────────────────────────
// Each takes (rnd, id) and returns one item. Inputs are chosen so the answer is
// exact; see the divisibility note above each.

/** GS is a multiple of 30 and time a multiple of 10, so distance = GS x t / 60 is a whole number. */
function rollLeg(rnd) {
  const gs = istep(rnd, 90, 450, 30);
  const timeMin = istep(rnd, 20, 180, 10);
  const distance = (gs * timeMin) / 60;
  return { gs, timeMin, distance };
}

function timeEnroute(rnd, id) {
  const { gs, timeMin, distance } = rollLeg(rnd);
  return mcq(rnd, {
    id,
    family: "time-enroute",
    stem: `An aircraft covers ${num(distance)} nm at a ground speed of ${num(gs)} kt. How long does the leg take?`,
    answer: timeMin,
    unit: "min",
    errors: [
      { value: distance / gs, why: "Distance ÷ ground speed gives HOURS. It still needs × 60 to become minutes." },
      { value: (gs * 60) / distance, why: "Speed and distance have been used the wrong way round." },
      { value: (distance / gs) * 100, why: "× 100 instead of × 60 — an hour is 60 minutes, not 100." },
    ],
    solution: `Time = distance ÷ ground speed = ${num(distance)} ÷ ${num(gs)} = ${num(distance / gs, 3)} h. × 60 = ${num(timeMin)} min (${hhmm(timeMin)}).`,
    meta: { gs, timeMin, distance },
  });
}

function distanceCovered(rnd, id) {
  const { gs, timeMin, distance } = rollLeg(rnd);
  return mcq(rnd, {
    id,
    family: "distance-covered",
    stem: `Flying at a ground speed of ${num(gs)} kt for ${hhmm(timeMin)}, how far does the aircraft travel?`,
    answer: distance,
    unit: "nm",
    errors: [
      { value: gs * timeMin, why: "Minutes used as hours — the time must be converted (÷ 60) first." },
      { value: (gs * timeMin) / 100, why: "÷ 100 instead of ÷ 60." },
      { value: gs / (timeMin / 60), why: "Speed divided by time. Distance is speed × time." },
    ],
    solution: `Distance = ground speed × time = ${num(gs)} × ${num(timeMin)} ÷ 60 = ${num(distance)} nm.`,
    meta: { gs, timeMin, distance },
  });
}

function groundSpeed(rnd, id) {
  const { gs, timeMin, distance } = rollLeg(rnd);
  return mcq(rnd, {
    id,
    family: "ground-speed",
    stem: `An aircraft covers ${num(distance)} nm in ${hhmm(timeMin)}. What is its ground speed?`,
    answer: gs,
    unit: "kt",
    errors: [
      { value: distance / timeMin, why: "This is nm per MINUTE. A speed in knots is nm per hour." },
      { value: (distance * timeMin) / 60, why: "Distance multiplied by time. Speed is distance ÷ time." },
      { value: (distance * 100) / timeMin, why: "× 100 instead of × 60." },
    ],
    solution: `Ground speed = distance ÷ time = ${num(distance)} ÷ ${num(timeMin)} × 60 = ${num(gs)} kt.`,
    meta: { gs, timeMin, distance },
  });
}

/** Burn is a multiple of 20 and time a multiple of 15, so fuel = burn x t / 60 is a whole number. */
function rollBurn(rnd) {
  const burn = istep(rnd, 20, 400, 20);
  const timeMin = istep(rnd, 15, 240, 15);
  const fuel = (burn * timeMin) / 60;
  return { burn, timeMin, fuel };
}

function fuelRequired(rnd, id) {
  const { burn, timeMin, fuel } = rollBurn(rnd);
  return mcq(rnd, {
    id,
    family: "fuel-required",
    stem: `An engine burns ${num(burn)} kg per hour. How much fuel is needed for a flight of ${hhmm(timeMin)}?`,
    answer: fuel,
    unit: "kg",
    errors: [
      { value: burn * timeMin, why: "Minutes used as hours — convert the time to hours first." },
      { value: burn / (timeMin / 60), why: "Burn rate divided by time. Fuel is rate × time." },
      { value: (burn * timeMin) / 100, why: "÷ 100 instead of ÷ 60." },
    ],
    solution: `Fuel = burn rate × time = ${num(burn)} × ${num(timeMin)} ÷ 60 = ${num(fuel)} kg.`,
    meta: { burn, timeMin, fuel },
  });
}

function fuelEndurance(rnd, id) {
  const { burn, timeMin, fuel } = rollBurn(rnd);
  return mcq(rnd, {
    id,
    family: "fuel-endurance",
    stem: `${num(fuel)} kg of usable fuel remains and the burn rate is ${num(burn)} kg per hour. What is the endurance?`,
    answer: timeMin,
    unit: "min",
    errors: [
      { value: fuel / burn, why: "This is the endurance in HOURS. The question asks for minutes." },
      { value: burn / fuel, why: "Burn rate divided by fuel — inverted." },
      { value: (fuel / burn) * 100, why: "× 100 instead of × 60." },
    ],
    solution: `Endurance = fuel ÷ burn rate = ${num(fuel)} ÷ ${num(burn)} = ${num(fuel / burn, 3)} h. × 60 = ${num(timeMin)} min (${hhmm(timeMin)}).`,
    meta: { burn, timeMin, fuel },
  });
}

function fuelBurnRate(rnd, id) {
  const { burn, timeMin, fuel } = rollBurn(rnd);
  return mcq(rnd, {
    id,
    family: "fuel-burn-rate",
    stem: `An aircraft uses ${num(fuel)} kg of fuel in ${hhmm(timeMin)}. What is the hourly burn rate?`,
    answer: burn,
    unit: "kg/hr",
    errors: [
      { value: fuel / timeMin, why: "This is kg per MINUTE. An hourly rate needs × 60." },
      { value: (fuel * timeMin) / 60, why: "Fuel multiplied by time. Rate is fuel ÷ time." },
      { value: (fuel * 100) / timeMin, why: "× 100 instead of × 60." },
    ],
    solution: `Burn rate = fuel ÷ time = ${num(fuel)} ÷ ${num(timeMin)} × 60 = ${num(burn)} kg/hr.`,
    meta: { burn, timeMin, fuel },
  });
}

function rateOfDescent(rnd, id) {
  const rod = istep(rnd, 300, 2500, 100);
  const timeMin = irange(rnd, 3, 25);
  const loss = rod * timeMin;
  // The level-off altitude is capped at four times the height lost. Left
  // unbounded, a short steep descent to a high level-off makes the "used the
  // start altitude instead of the height lost" error come out more than 5x
  // from the answer — and since the other two errors are always far out, the
  // item was left with a single teaching distractor. Caught by the
  // two-taught-distractors test at seed 198, not by reading the code.
  const endFt = istep(rnd, 1000, Math.min(12000, 4 * loss), 1000);
  const startFt = endFt + loss;
  return mcq(rnd, {
    id,
    family: "rate-of-descent",
    stem: `An aircraft descends from ${num(startFt)} ft to ${num(endFt)} ft in ${num(timeMin)} minutes. What is the average rate of descent?`,
    answer: rod,
    unit: "ft/min",
    errors: [
      { value: startFt / timeMin, why: "The starting altitude used instead of the HEIGHT LOST. Subtract first." },
      { value: endFt / timeMin, why: "The level-off altitude used instead of the height lost." },
      { value: loss * timeMin, why: "Height loss multiplied by time. A rate is height ÷ time." },
      { value: loss / (timeMin * 60), why: "Time converted to seconds — the answer is asked for per MINUTE." },
    ],
    solution: `Height lost = ${num(startFt)} − ${num(endFt)} = ${num(loss)} ft. Rate = ${num(loss)} ÷ ${num(timeMin)} = ${num(rod)} ft/min.`,
    meta: { rod, timeMin, loss, startFt, endFt },
  });
}

/** Litres are a multiple of 100 and SG has 2 dp, so mass is exact to 0 dp. */
function volumeToMass(rnd, id) {
  const litres = istep(rnd, 200, 3000, 100);
  const sg = pick(rnd, [0.72, 0.75, 0.8]);
  const kg = Math.round(litres * sg);
  return mcq(rnd, {
    id,
    family: "volume-to-mass",
    stem: `An aircraft is uplifted with ${num(litres)} litres of fuel at a specific gravity of ${sg}. What mass of fuel has been loaded?`,
    answer: kg,
    unit: "kg",
    errors: [
      { value: Math.round(litres / sg), why: "Divided by the specific gravity. Mass = volume × SG." },
      { value: litres, why: "Litres are a volume, not a mass — the SG has not been applied." },
      { value: Math.round(litres * sg * 2.2046), why: "This is the mass in POUNDS, not kilograms." },
    ],
    solution: `Mass = volume × specific gravity = ${num(litres)} × ${sg} = ${num(kg)} kg.`,
    meta: { litres, sg, kg },
  });
}

/**
 * Angles deliberately exclude 90° and 45°.
 *
 * At 90° the crosswind IS the whole wind, so all three taught distractors
 * collapse: the headwind component is zero, and both the "used the full wind"
 * and "scaled the angle linearly" errors land exactly on the correct answer.
 * At 45° sin and cos are equal, so the headwind distractor duplicates the
 * answer. At 80° sin is 0.985, which ROUNDS UP to the full wind for any wind
 * below about 33 kt — the same collapse, arriving through the rounding rather
 * than the trigonometry. 70° is the highest angle that stays clear at the
 * lightest wind we roll. All three cases leave the item with nothing but filler
 * options, and all three were caught by the distractor-quality test rather than
 * by reading the code.
 */
const CROSSWIND_ANGLES = [20, 30, 40, 50, 60, 70];

function crosswindComponent(rnd, id) {
  const wind = istep(rnd, 10, 45, 5);
  const angle = pick(rnd, CROSSWIND_ANGLES);
  const exact = wind * Math.sin((angle * Math.PI) / 180);
  const xw = Math.round(exact);
  const headwind = Math.round(wind * Math.cos((angle * Math.PI) / 180));
  return mcq(rnd, {
    id,
    family: "crosswind-component",
    stem: `The wind is ${num(wind)} kt at ${num(angle)}° off the runway heading. What is the crosswind component, to the nearest knot?`,
    answer: xw,
    unit: "kt",
    errors: [
      { value: headwind, why: "This is the HEADWIND component (× cos). The crosswind uses sin." },
      { value: wind, why: "The full wind speed — only a wind at 90° is entirely crosswind." },
      { value: Math.round(wind * (angle / 90)), why: "The angle scaled linearly. The relationship is sine, not proportional." },
    ],
    solution: `Crosswind = wind speed × sin(angle) = ${num(wind)} × sin ${num(angle)}° = ${num(exact, 2)} ≈ ${num(xw)} kt.`,
    meta: { wind, angle, xw, headwind },
  });
}

function fuelRemaining(rnd, id) {
  const { burn, timeMin, fuel: used } = rollBurn(rnd);
  // Departure fuel = trip fuel + a reserve of roughly an hour's burn plus a
  // margin. Rolling the reserve this way is realistic AND it guarantees the
  // "subtracted the hourly rate instead of the fuel burned" distractor stays
  // positive. The earlier version used a flat margin, which let that error come
  // out negative on most rolls; the option was then filtered out as implausible
  // and the item quietly fell back to filler distractors.
  const reserve = burn + istep(rnd, 50, 500, 50);
  const start = used + reserve;
  const left = start - used;
  return mcq(rnd, {
    id,
    family: "fuel-remaining",
    stem: `An aircraft departs with ${num(start)} kg of usable fuel and flies for ${hhmm(timeMin)} at ${num(burn)} kg per hour. How much fuel remains on arrival?`,
    answer: left,
    unit: "kg",
    errors: [
      { value: used, why: "This is the fuel BURNED. The question asks what is left." },
      { value: start - burn, why: "The hourly RATE has been subtracted. Work out the fuel actually burned first." },
      { value: start + used, why: "The burn has been added instead of subtracted." },
    ],
    solution: `Fuel burned = ${num(burn)} × ${num(timeMin)} ÷ 60 = ${num(used)} kg. Remaining = ${num(start)} − ${num(used)} = ${num(left)} kg.`,
    meta: { burn, timeMin, used, start, left },
  });
}

const GENERATORS = {
  "time-enroute": timeEnroute,
  "distance-covered": distanceCovered,
  "ground-speed": groundSpeed,
  "fuel-required": fuelRequired,
  "fuel-endurance": fuelEndurance,
  "fuel-burn-rate": fuelBurnRate,
  "rate-of-descent": rateOfDescent,
  "volume-to-mass": volumeToMass,
  "crosswind-component": crosswindComponent,
  "fuel-remaining": fuelRemaining,
};

/** Generate one item of a named family. Same (family, seed) -> identical item. */
export function generateItem(family, seed) {
  const gen = GENERATORS[family];
  if (!gen) throw new RangeError(`unknown maths family: ${family}`);
  return gen(makeRng(seed), `${family}-${seed >>> 0}`);
}

/**
 * Generate a full paper.
 *
 * Families are dealt round-robin from a shuffled order rather than drawn at
 * random, so a 20-question paper always covers the syllabus evenly — a random
 * draw can hand a student six fuel questions and no navigation, which would
 * make the module's score mean something different every sitting.
 */
export function generatePaper(seed, count = 20) {
  if (!Number.isInteger(count) || count < 1) throw new RangeError("count must be a positive integer");
  const rnd = makeRng(seed);
  const order = shuffle(rnd, FAMILIES);
  const items = [];
  const seenStems = new Set();

  for (let i = 0; i < count; i++) {
    const family = order[i % order.length];
    // Each item draws from its own stream, derived from the paper seed and the
    // item's index, so adding a question never disturbs the ones before it.
    //
    // A family appears more than once on a long paper, and nothing stops two
    // draws from the same family rolling identical inputs — a paper that asks
    // the same question twice looks broken and wastes one of the student's
    // twenty items. So a colliding roll is rejected and re-rolled from a bumped
    // stream. Rejection depends only on items ALREADY placed, which keeps the
    // prefix of a longer paper identical to a shorter one.
    let item = null;
    for (let attempt = 0; attempt < 32; attempt++) {
      const itemSeed = (seed ^ Math.imul(i + 1, 0x9E3779B1) ^ Math.imul(attempt + 1, 0x85EBCA6B)) >>> 0;
      const candidate = generateItem(family, itemSeed);
      if (!seenStems.has(candidate.stem)) { item = candidate; break; }
      item = candidate; // keep the last attempt as a fallback rather than failing the paper
    }
    seenStems.add(item.stem);
    items.push(item);
  }
  return { seed, count, items };
}
