// ADAPT — seeded deterministic randomness.
//
// Every ADAPT session rolls from a single integer seed, and the seed is shown
// to the student on the debrief. Same seed -> byte-identical test: the student
// can re-fly the exact paper to beat their own score, and if they ever dispute
// a mark we can reproduce precisely what they saw. That audit trail is the same
// reason Ghost Tower shows its flight seed (lib/rtr-sim/world.mjs).
//
// The algorithm is mulberry32, deliberately IDENTICAL to `makeRng` in
// lib/rtr-sim/world.mjs. It is duplicated rather than imported so that the
// ADAPT client bundle does not drag in the flight-world tables it will never
// use — and rng.test.mjs asserts the two implementations stay in lockstep, so
// the duplication cannot silently drift.

/** Deterministic PRNG. Returns a function producing floats in [0, 1). */
export function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh seed for a new session. Never used inside generators — they take a seed. */
export function randomSeed() {
  return Math.floor(Math.random() * 0xFFFFFFFF) >>> 0;
}

/** Integer in [lo, hi], inclusive both ends. */
export function irange(rnd, lo, hi) {
  return lo + Math.floor(rnd() * (hi - lo + 1));
}

/** Integer in [lo, hi] that is a multiple of `step`. Used for realistic aviation values. */
export function istep(rnd, lo, hi, step) {
  const n = Math.floor((hi - lo) / step);
  return lo + irange(rnd, 0, n) * step;
}

/** Uniform pick from a non-empty array. */
export function pick(rnd, arr) {
  return arr[Math.floor(rnd() * arr.length)];
}

/**
 * Fisher-Yates shuffle of a COPY of `arr`.
 * Used to place the correct answer in an unpredictable option position — a
 * fixed position would let a student learn the layout instead of the skill.
 */
export function shuffle(rnd, arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Derive an independent child seed from a parent seed and a label.
 * Lets each module (maths, physics, spatial…) draw from its own stream, so
 * adding an item to one module cannot shift every other module's content.
 */
export function subSeed(seed, label) {
  let h = seed >>> 0;
  for (let i = 0; i < label.length; i++) {
    h = Math.imul(h ^ label.charCodeAt(i), 0x01000193) >>> 0;
  }
  return h >>> 0;
}
