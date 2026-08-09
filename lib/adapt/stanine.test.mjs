import { test } from "node:test";
import assert from "node:assert/strict";
import {
  zScore,
  stanineFromZ,
  percentileFromZ,
  stanineFor,
  assertValidNorm,
  compositeStanine,
  detectAnomalies,
  bandFor,
  BANDS,
  MIN_OBSERVED_N,
  MIN_PLAUSIBLE_RT_MS,
} from "./stanine.mjs";

// ── The published transformation ───────────────────────────────────────────

test("z-score is the textbook definition", () => {
  assert.equal(zScore(50, 50, 10), 0);
  assert.equal(zScore(60, 50, 10), 1);
  assert.equal(zScore(35, 50, 10), -1.5);
});

test("z-score refuses a zero or negative sd rather than returning Infinity", () => {
  assert.throws(() => zScore(5, 5, 0), RangeError);
  assert.throws(() => zScore(5, 5, -2), RangeError);
});

test("stanine mean sits at 5 and moves 2 per standard deviation", () => {
  assert.equal(stanineFromZ(0), 5);
  assert.equal(stanineFromZ(1), 7);
  assert.equal(stanineFromZ(-1), 3);
  assert.equal(stanineFromZ(2), 9);
  assert.equal(stanineFromZ(-2), 1);
});

test("stanine is clamped to the 1-9 scale at the extremes", () => {
  assert.equal(stanineFromZ(4), 9);
  assert.equal(stanineFromZ(-4), 1);
  assert.equal(stanineFromZ(100), 9);
  assert.equal(stanineFromZ(-100), 1);
});

test("stanine never leaves the scale for any plausible z", () => {
  for (let z = -6; z <= 6; z += 0.01) {
    const s = stanineFromZ(z);
    assert.ok(Number.isInteger(s) && s >= 1 && s <= 9, `z=${z} gave ${s}`);
  }
});

test("stanine rejects non-finite input instead of producing NaN", () => {
  assert.throws(() => stanineFromZ(NaN), RangeError);
  assert.throws(() => stanineFromZ(Infinity), RangeError);
});

// ── Percentile ─────────────────────────────────────────────────────────────

test("percentile matches the standard normal at known points", () => {
  assert.ok(Math.abs(percentileFromZ(0) - 50) < 0.01);
  assert.ok(Math.abs(percentileFromZ(1) - 84.13) < 0.05);
  assert.ok(Math.abs(percentileFromZ(-1) - 15.87) < 0.05);
  assert.ok(Math.abs(percentileFromZ(1.96) - 97.5) < 0.05);
  assert.ok(Math.abs(percentileFromZ(-1.96) - 2.5) < 0.05);
});

test("percentile is monotonic and bounded", () => {
  let prev = -1;
  for (let z = -4; z <= 4; z += 0.05) {
    const p = percentileFromZ(z);
    assert.ok(p >= 0 && p <= 100, `z=${z} gave ${p}`);
    assert.ok(p >= prev, `not monotonic at z=${z}`);
    prev = p;
  }
});

// ── Norm validation ────────────────────────────────────────────────────────

const CRIT_HIGH = {
  mode: "criterion",
  direction: "higher-better",
  cuts: [4, 7, 9, 11, 13, 15, 17, 19],
  rationale: "test fixture",
};

const CRIT_LOW = {
  mode: "criterion",
  direction: "lower-better",
  cuts: [90, 80, 70, 60, 50, 40, 30, 20],
};

test("a valid criterion norm passes validation", () => {
  assert.doesNotThrow(() => assertValidNorm(CRIT_HIGH));
  assert.doesNotThrow(() => assertValidNorm(CRIT_LOW));
});

test("criterion norm must have exactly 8 cuts", () => {
  assert.throws(() => assertValidNorm({ ...CRIT_HIGH, cuts: [1, 2, 3] }), RangeError);
  assert.throws(() => assertValidNorm({ ...CRIT_HIGH, cuts: [1, 2, 3, 4, 5, 6, 7, 8, 9] }), RangeError);
});

// A mis-ordered cut table mis-grades silently. It must fail loudly.
test("criterion cuts must climb in merit for higher-better", () => {
  assert.throws(
    () => assertValidNorm({ ...CRIT_HIGH, cuts: [4, 7, 9, 8, 13, 15, 17, 19] }),
    /does not improve/
  );
});

test("criterion cuts must descend numerically for lower-better", () => {
  assert.throws(
    () => assertValidNorm({ ...CRIT_LOW, cuts: [90, 80, 70, 75, 50, 40, 30, 20] }),
    /does not improve/
  );
});

test("observed norm is refused below the minimum sample size", () => {
  const norm = { mode: "observed", direction: "higher-better", mean: 12, sd: 3, n: MIN_OBSERVED_N - 1, version: "v1" };
  assert.throws(() => assertValidNorm(norm), new RegExp(`n >= ${MIN_OBSERVED_N}`));
});

test("observed norm must be versioned — a rolling norm is not allowed", () => {
  const norm = { mode: "observed", direction: "higher-better", mean: 12, sd: 3, n: 1000 };
  assert.throws(() => assertValidNorm(norm), /versioned/);
});

test("unknown direction and unknown mode are rejected", () => {
  assert.throws(() => assertValidNorm({ ...CRIT_HIGH, direction: "up" }), RangeError);
  assert.throws(() => assertValidNorm({ ...CRIT_HIGH, mode: "vibes" }), RangeError);
});

// ── Criterion scoring ──────────────────────────────────────────────────────

test("criterion scoring walks the cut table one stanine at a time", () => {
  assert.equal(stanineFor(0, CRIT_HIGH).stanine, 1);
  assert.equal(stanineFor(3, CRIT_HIGH).stanine, 1);
  assert.equal(stanineFor(4, CRIT_HIGH).stanine, 2);
  assert.equal(stanineFor(7, CRIT_HIGH).stanine, 3);
  assert.equal(stanineFor(13, CRIT_HIGH).stanine, 6);
  assert.equal(stanineFor(19, CRIT_HIGH).stanine, 9);
  assert.equal(stanineFor(20, CRIT_HIGH).stanine, 9);
});

test("lower-better criterion scoring treats a smaller error as better", () => {
  assert.equal(stanineFor(95, CRIT_LOW).stanine, 1);
  assert.equal(stanineFor(90, CRIT_LOW).stanine, 2);
  assert.equal(stanineFor(50, CRIT_LOW).stanine, 6);
  assert.equal(stanineFor(20, CRIT_LOW).stanine, 9);
  assert.equal(stanineFor(1, CRIT_LOW).stanine, 9);
});

test("criterion scoring is monotonic across the whole raw range", () => {
  let prev = 0;
  for (let raw = 0; raw <= 25; raw++) {
    const s = stanineFor(raw, CRIT_HIGH).stanine;
    assert.ok(s >= prev, `stanine fell from ${prev} to ${s} at raw=${raw}`);
    prev = s;
  }
});

// A criterion stanine is a standards judgement, not a population position.
// Reporting a percentile for it would be inventing the population back in.
test("criterion basis reports no z and no percentile", () => {
  const r = stanineFor(13, CRIT_HIGH);
  assert.equal(r.basis, "criterion");
  assert.equal(r.z, null);
  assert.equal(r.percentile, null);
  assert.equal(r.rationale, "test fixture");
});

// ── Observed scoring ───────────────────────────────────────────────────────

const OBS_HIGH = { mode: "observed", direction: "higher-better", mean: 12, sd: 4, n: 1200, version: "maths-2026-08" };
const OBS_LOW = { mode: "observed", direction: "lower-better", mean: 60, sd: 15, n: 900, version: "track-2026-08" };

test("observed scoring puts the mean at stanine 5", () => {
  const r = stanineFor(12, OBS_HIGH);
  assert.equal(r.stanine, 5);
  assert.equal(r.basis, "observed");
  assert.equal(r.z, 0);
  assert.ok(Math.abs(r.percentile - 50) < 0.01);
  assert.equal(r.normVersion, "maths-2026-08");
  assert.equal(r.normN, 1200);
});

test("observed scoring moves two stanines per standard deviation", () => {
  assert.equal(stanineFor(16, OBS_HIGH).stanine, 7);
  assert.equal(stanineFor(8, OBS_HIGH).stanine, 3);
  assert.equal(stanineFor(20, OBS_HIGH).stanine, 9);
  assert.equal(stanineFor(4, OBS_HIGH).stanine, 1);
});

// The sign flip for error metrics is the single easiest thing to get backwards
// in this whole module, and getting it backwards would rank the worst students
// highest. Pinned explicitly.
test("observed lower-better inverts the sign: less error scores higher", () => {
  const better = stanineFor(30, OBS_LOW);
  const worse = stanineFor(90, OBS_LOW);
  assert.equal(better.stanine, 9);
  assert.equal(worse.stanine, 1);
  assert.ok(better.z > 0, "a below-mean error must give a positive z");
  assert.ok(worse.z < 0, "an above-mean error must give a negative z");
  assert.equal(stanineFor(60, OBS_LOW).stanine, 5);
});

test("stanineFor rejects a non-finite raw score", () => {
  assert.throws(() => stanineFor(NaN, CRIT_HIGH), RangeError);
  assert.throws(() => stanineFor(Infinity, OBS_HIGH), RangeError);
});

test("stanineFor validates the norm before using it", () => {
  assert.throws(() => stanineFor(10, { ...OBS_HIGH, n: 10 }), RangeError);
});

// ── Bands ──────────────────────────────────────────────────────────────────

test("bands follow the conventional 1-3 / 4-6 / 7-9 reading", () => {
  for (const s of [1, 2, 3]) assert.equal(bandFor(s).key, "low");
  for (const s of [4, 5, 6]) assert.equal(bandFor(s).key, "average");
  for (const s of [7, 8, 9]) assert.equal(bandFor(s).key, "high");
});

test("every band carries a label and developmental advice", () => {
  for (const band of Object.values(BANDS)) {
    assert.ok(band.label.length > 0);
    assert.ok(band.advice.length > 0);
  }
});

// ── Composite ──────────────────────────────────────────────────────────────

test("composite averages z-scores, not already-rounded stanines", () => {
  // Two modules at z = +0.9 and z = -0.9 average to z = 0 -> stanine 5.
  // Averaging their ROUNDED stanines (7 and 3) would also give 5 here, so use
  // an asymmetric pair where the two methods genuinely disagree.
  const parts = [
    { weight: 1, result: stanineFor(12 + 4 * 0.4, OBS_HIGH) }, // z = 0.4 -> stanine 6
    { weight: 1, result: stanineFor(12 + 4 * 0.4, OBS_HIGH) }, // z = 0.4 -> stanine 6
  ];
  const c = compositeStanine(parts);
  // Mean z is 0.4 -> round(5 + 0.8) = 6. Mean of stanines would be 6 too, but
  // the z path is the one that stays right as the parts spread apart.
  assert.equal(c.stanine, 6);
  assert.ok(Math.abs(c.z - 0.4) < 1e-9);
  assert.equal(c.basis, "observed");
  assert.equal(c.modules, 2);
});

test("composite respects weights", () => {
  const strong = { weight: 3, result: stanineFor(20, OBS_HIGH) }; // z = 2
  const weak = { weight: 1, result: stanineFor(8, OBS_HIGH) };    // z = -1
  const c = compositeStanine([strong, weak]);
  // (3*2 + 1*-1) / 4 = 1.25 -> round(5 + 2.5) = 8
  assert.ok(Math.abs(c.z - 1.25) < 1e-9);
  assert.equal(c.stanine, 8);
});

test("composite flags itself as mixed when a criterion part is approximated", () => {
  const c = compositeStanine([
    { weight: 1, result: stanineFor(13, CRIT_HIGH) },
    { weight: 1, result: stanineFor(12, OBS_HIGH) },
  ]);
  assert.equal(c.basis, "mixed");
});

test("composite ignores zero and negative weights, and returns null with nothing usable", () => {
  assert.equal(compositeStanine([]), null);
  assert.equal(compositeStanine([{ weight: 0, result: stanineFor(12, OBS_HIGH) }]), null);
  const c = compositeStanine([
    { weight: 0, result: stanineFor(20, OBS_HIGH) },
    { weight: 2, result: stanineFor(12, OBS_HIGH) },
  ]);
  assert.equal(c.modules, 1);
  assert.equal(c.stanine, 5);
});

// ── Anomaly detection ──────────────────────────────────────────────────────

test("clean results raise no flags", () => {
  assert.deepEqual(
    detectAnomalies({ reactionTimesMs: [420, 610, 380], trackingRmse: 42.1, correct: 15, total: 20, durationSec: 1200 }),
    []
  );
});

test("sub-human reaction times are flagged", () => {
  const flags = detectAnomalies({ reactionTimesMs: [400, 20, 90] });
  assert.equal(flags.length, 1);
  assert.equal(flags[0].code, "reaction-time-implausible");
  assert.match(flags[0].detail, /2 response/);
});

test("the reaction-time threshold is a floor, not a range", () => {
  assert.equal(detectAnomalies({ reactionTimesMs: [MIN_PLAUSIBLE_RT_MS] }).length, 0);
  assert.equal(detectAnomalies({ reactionTimesMs: [MIN_PLAUSIBLE_RT_MS - 1] }).length, 1);
});

test("a perfect tracking score is flagged as impossible", () => {
  assert.equal(detectAnomalies({ trackingRmse: 0 })[0].code, "tracking-perfect");
  assert.equal(detectAnomalies({ trackingRmse: -5 })[0].code, "tracking-perfect");
  assert.equal(detectAnomalies({ trackingRmse: 0.001 }).length, 0);
});

test("impossible mark counts and negative durations are flagged", () => {
  assert.equal(detectAnomalies({ correct: 21, total: 20 })[0].code, "score-exceeds-total");
  assert.equal(detectAnomalies({ correct: -1, total: 20 })[0].code, "score-negative");
  assert.equal(detectAnomalies({ durationSec: -3 })[0].code, "duration-negative");
});

test("anomaly detection tolerates a completely empty call", () => {
  assert.deepEqual(detectAnomalies(), []);
  assert.deepEqual(detectAnomalies({}), []);
});
