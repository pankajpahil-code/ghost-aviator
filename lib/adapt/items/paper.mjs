// ADAPT — generic paper assembly, shared by every generated knowledge bank.
//
// Extracted from items/maths.mjs so the maths and physics banks (and whatever
// follows) assemble papers identically. A `bank` is any module exporting
// FAMILIES and generateItem(family, seed).

import { makeRng, shuffle } from "../rng.mjs";

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
export function buildPaper(bank, seed, count) {
  if (!Number.isInteger(count) || count < 1) throw new RangeError("count must be a positive integer");
  const rnd = makeRng(seed);
  const order = shuffle(rnd, bank.FAMILIES);
  const items = [];
  const seenStems = new Set();

  for (let i = 0; i < count; i++) {
    const family = order[i % order.length];
    let item = null;
    for (let attempt = 0; attempt < 32; attempt++) {
      const itemSeed = (seed ^ Math.imul(i + 1, 0x9E3779B1) ^ Math.imul(attempt + 1, 0x85EBCA6B)) >>> 0;
      const candidate = bank.generateItem(family, itemSeed);
      if (!seenStems.has(candidate.stem)) { item = candidate; break; }
      item = candidate; // keep the last attempt rather than failing the whole paper
    }
    seenStems.add(item.stem);
    items.push(item);
  }
  return { seed, count, items };
}
