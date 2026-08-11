// ADAPT — generic paper assembly, shared by every generated knowledge bank.
//
// Extracted from items/maths.mjs so the maths and physics banks (and whatever
// follows) assemble papers identically. A `bank` is any module exporting
// FAMILIES and generateItem(family, seed).

import { makeRng, shuffle } from "../rng.mjs";

/**
 * What makes two items "the same question" for the student.
 *
 * The stem alone is NOT enough. Every `compass-read` item asks the identical
 * sentence — "What heading is the direction indicator showing?" — and differs
 * only in the instrument drawn beside it. Keyed on the stem, the second compass
 * item on a paper looked like a repeat, was rejected 32 times, and then shipped
 * anyway as the fallback. Keyed on stem AND figure, two compass items collide
 * only when they genuinely show the same heading.
 */
const identity = (item) => `${item.stem} ${item.figure ?? ""}`;

/**
 * Build a paper of `count` items from `bank`.
 *
 * Families are dealt round-robin from a shuffled order rather than drawn at
 * random, so a paper always covers the syllabus evenly — a random draw can hand
 * a student six fuel questions and no navigation, which would make the module's
 * score mean something different every sitting.
 *
 * Each item draws from its own stream derived from the paper seed and the
 * item's index, so adding a question never disturbs the ones before it. A
 * family appears more than once on a long paper and nothing stops two draws
 * rolling identical inputs, so a colliding stem is rejected and re-rolled from
 * a bumped stream. Rejection depends only on items ALREADY placed, which is
 * what keeps the prefix of a longer paper identical to a shorter one.
 */
export const TIER_LABEL = { 1: "Foundation", 2: "Intermediate", 3: "Advanced" };

/**
 * The order families are dealt in, when the bank declares difficulty tiers.
 *
 * The real knowledge tests are called "Progressive" and ramp Foundation ->
 * Intermediate -> Advanced inside a single sitting, so a paper here does too.
 * Within a tier the families are still shuffled and dealt round-robin, which is
 * what keeps syllabus coverage even; it is only the ORDER OF THE TIERS that is
 * fixed.
 *
 * Why this matters beyond realism: a student who runs out of clock on a ramped
 * paper has run out on the hard questions, which is diagnostic. On a flat paper
 * they run out on whatever happened to be last, which tells nobody anything.
 *
 * A bank with no TIERS falls back to the old flat deal rather than guessing a
 * difficulty for each family — an invented tier would show up as a wrong claim
 * on the student's report, which is worse than no claim.
 */
function tieredOrder(bank, rnd) {
  if (!bank.TIERS) return { order: shuffle(rnd, bank.FAMILIES), tiered: false };

  const missing = bank.FAMILIES.filter((f) => !(f in bank.TIERS));
  if (missing.length) {
    // Loudly, not silently: an untiered family would simply never be dealt, and
    // a syllabus gap that nobody notices is exactly the failure this throws to
    // prevent.
    throw new RangeError(`families with no difficulty tier: ${missing.join(", ")}`);
  }

  const order = [];
  for (const tier of [1, 2, 3]) {
    order.push(...shuffle(rnd, bank.FAMILIES.filter((f) => bank.TIERS[f] === tier)));
  }
  return { order, tiered: true };
}

export function buildPaper(bank, seed, count) {
  if (!Number.isInteger(count) || count < 1) throw new RangeError("count must be a positive integer");
  const rnd = makeRng(seed);
  const { order, tiered } = tieredOrder(bank, rnd);
  const items = [];
  const seen = new Set();

  // Deal each tier across its share of the paper rather than cycling the whole
  // family list. Cycling would put one Advanced question at position 3 and one
  // Foundation at position 18, which is not a ramp — it is the flat paper with
  // extra steps.
  // Each tier's share of the paper is PROPORTIONAL TO HOW MANY FAMILIES IT
  // HOLDS, not a rigid third. A rigid third asks a one-family tier to supply
  // seven distinct questions from one generator, which the English bank cannot
  // do — it has a single Advanced family and threw outright. Proportional
  // shares also read better: a tier with more ground to cover gets more of the
  // paper, which is what "even syllabus coverage" meant in the first place.
  const groups = tiered ? [1, 2, 3].map((t) => order.filter((f) => bank.TIERS[f] === t)).filter((g) => g.length) : [];
  const totalFamilies = groups.reduce((n, g) => n + g.length, 0);
  const bounds = [];
  let acc = 0;
  for (const g of groups) {
    acc += (g.length / totalFamilies) * count;
    bounds.push(acc);
  }

  const familyAt = (i) => {
    if (!tiered) return order[i % order.length];
    let t = bounds.findIndex((b) => i < b);
    if (t < 0) t = groups.length - 1; // last item, floating-point slack
    return groups[t][i % groups[t].length];
  };

  for (let i = 0; i < count; i++) {
    const family = familyAt(i);
    let item = null;
    for (let attempt = 0; attempt < 32; attempt++) {
      const itemSeed = (seed ^ Math.imul(i + 1, 0x9E3779B1) ^ Math.imul(attempt + 1, 0x85EBCA6B)) >>> 0;
      const candidate = bank.generateItem(family, itemSeed);
      if (!seen.has(identity(candidate))) { item = candidate; break; }
      item = candidate; // keep the last attempt rather than failing the whole paper
    }
    seen.add(identity(item));
    // The tier is stamped on the item so the review can show a student WHERE on
    // the ramp they started dropping marks — the single most useful thing a
    // progressive paper can tell them. Absent on an untiered bank rather than
    // defaulted, so nothing downstream can mistake "unknown" for "Foundation".
    items.push(tiered ? { ...item, tier: bank.TIERS[family], tierLabel: TIER_LABEL[bank.TIERS[family]] } : item);
  }
  return { seed, count, items, tiered };
}
