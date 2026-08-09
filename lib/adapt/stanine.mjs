// ADAPT — the scoring core. Raw performance in, Stanine 1-9 out.
//
// The airline screening batteries report on the Stanine (STAndard NINE) scale:
// a normal distribution squeezed onto nine integers, mean fixed at 5, standard
// deviation ~2. Capt. Pahil's ruling (2026-08-09): ADAPT on this site scores in
// stanines, the way the real screening does.
//
// ── The honest problem this module solves ──────────────────────────────────
// A stanine is meaningless without a reference population, and on day one this
// site has none. Inventing a mean and a standard deviation would be publishing
// a fabricated number, which Iron Rule 1 forbids. So a norm here is one of two
// SHAPES, and every score this module returns names the shape that produced it:
//
//   "criterion" — the raw-to-stanine cut table is derived from the demands of
//                 the module itself (the pace needed to attempt every item in
//                 the time allowed, the accuracy needed on top of that). It is
//                 standards-based, it is published on the page in full, and it
//                 invents no population. This is the day-one basis.
//
//   "observed"  — real mean and standard deviation measured from Ghost Aviator
//                 attempts, captured as a FROZEN, VERSIONED snapshot once a
//                 module has >= MIN_OBSERVED_N attempts. Never a rolling
//                 average: repeat practice lifts the mean over time, so a live
//                 norm would quietly push an identical performance downward.
//
// Both bases end at the same published transformation, so the student always
// sees the same 1-9 report the real screening produces:
//
//     z       = (raw - mean) / sd          [observed basis]
//     stanine = clamp(round(5 + 2z), 1, 9)
//
// What this module never produces, on either basis, is a claim that the number
// predicts the outcome of a real airline assessment. See APTITUDE_SIM_PLAN.md.

export const MIN_OBSERVED_N = 500;

/** Fixed by the scale's definition — do not "tune" these. */
export const STANINE_MEAN = 5;
export const STANINE_SD = 2;

// ── Primitives ─────────────────────────────────────────────────────────────

/** Standard score. `sd` must be > 0. */
export function zScore(raw, mean, sd) {
  if (!(sd > 0)) throw new RangeError("zScore: sd must be > 0");
  return (raw - mean) / sd;
}

/** The published transformation, bounded to the scale. */
export function stanineFromZ(z) {
  if (!Number.isFinite(z)) throw new RangeError("stanineFromZ: z must be finite");
  const s = Math.round(STANINE_MEAN + STANINE_SD * z);
  return Math.min(9, Math.max(1, s));
}

/**
 * Percentile a z-score sits at, 0-100.
 * Normal CDF via the Abramowitz & Stegun 7.1.26 erf approximation
 * (max absolute error ~1.5e-7 — far finer than anything we report).
 * Shown as supporting context, never as the headline score.
 */
export function percentileFromZ(z) {
  const sign = z < 0 ? -1 : 1;
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t +
      0.254829592) *
      t *
      Math.exp(-x * x);
  return ((1 + sign * y) / 2) * 100;
}

// ── Norms ──────────────────────────────────────────────────────────────────
//
// direction: "higher-better" for counts of correct answers;
//            "lower-better"  for error metrics (tracking RMSE, reaction time).
//
// criterion norm: { mode:"criterion", direction, cuts:[c2..c9], rationale }
//   `cuts` holds the EIGHT raw scores needed to reach stanines 2 through 9,
//   in ascending order of merit. For "lower-better" that means numerically
//   descending, because a smaller error is a better result.
//
// observed norm:  { mode:"observed", direction, mean, sd, n, version, capturedAt }

/** Throw unless the norm is internally coherent. Called by `stanineFor`. */
export function assertValidNorm(norm) {
  if (!norm || typeof norm !== "object") throw new TypeError("norm must be an object");
  if (norm.direction !== "higher-better" && norm.direction !== "lower-better") {
    throw new RangeError(`norm.direction must be higher-better or lower-better, got ${norm.direction}`);
  }
  if (norm.mode === "criterion") {
    if (!Array.isArray(norm.cuts) || norm.cuts.length !== 8) {
      throw new RangeError("criterion norm needs exactly 8 cuts (stanines 2..9)");
    }
    if (!norm.cuts.every(Number.isFinite)) throw new RangeError("criterion cuts must all be finite");
    // Cuts must climb in merit. A mis-ordered table silently mis-grades every
    // student who touches it, so it fails loudly here instead.
    for (let i = 1; i < norm.cuts.length; i++) {
      const climbs = norm.direction === "higher-better"
        ? norm.cuts[i] > norm.cuts[i - 1]
        : norm.cuts[i] < norm.cuts[i - 1];
      if (!climbs) {
        throw new RangeError(
          `criterion cuts must increase in merit: cut ${i + 2} (${norm.cuts[i]}) does not improve on cut ${i + 1} (${norm.cuts[i - 1]}) for ${norm.direction}`
        );
      }
    }
    return;
  }
  if (norm.mode === "observed") {
    if (!(norm.sd > 0)) throw new RangeError("observed norm needs sd > 0");
    if (!Number.isFinite(norm.mean)) throw new RangeError("observed norm needs a finite mean");
    if (!(norm.n >= MIN_OBSERVED_N)) {
      throw new RangeError(`observed norm needs n >= ${MIN_OBSERVED_N}, got ${norm.n}`);
    }
    if (!norm.version) throw new RangeError("observed norm must be versioned (frozen snapshot)");
    return;
  }
  throw new RangeError(`unknown norm.mode: ${norm.mode}`);
}

/** Stanine from a criterion cut table: 1, plus one step per cut the raw meets. */
function stanineFromCriterion(raw, norm) {
  let s = 1;
  for (const cut of norm.cuts) {
    const meets = norm.direction === "higher-better" ? raw >= cut : raw <= cut;
    if (!meets) break;
    s++;
  }
  return s;
}

/**
 * Score one raw value against one norm.
 * Returns the stanine, the band, and — always — the basis it was computed on,
 * so the UI can tell the student which kind of number they are looking at.
 */
export function stanineFor(raw, norm) {
  assertValidNorm(norm);
  if (!Number.isFinite(raw)) throw new RangeError("stanineFor: raw must be finite");

  if (norm.mode === "criterion") {
    const stanine = stanineFromCriterion(raw, norm);
    return {
      stanine,
      band: bandFor(stanine),
      basis: "criterion",
      // A criterion stanine is a standards judgement, not a population
      // position, so there is deliberately no z and no percentile here.
      z: null,
      percentile: null,
      rationale: norm.rationale ?? null,
    };
  }

  const signed = norm.direction === "higher-better" ? 1 : -1;
  const z = signed * zScore(raw, norm.mean, norm.sd);
  return {
    stanine: stanineFromZ(z),
    band: bandFor(stanineFromZ(z)),
    basis: "observed",
    z,
    percentile: percentileFromZ(z),
    normVersion: norm.version,
    normN: norm.n,
  };
}

// ── Bands ──────────────────────────────────────────────────────────────────
//
// The 1-3 / 4-6 / 7-9 grouping is the scale's conventional reading. The wording
// is deliberately developmental: this is a practice tool for a student, and the
// same stanine that an airline reads as a sift decision is, here, a pointer at
// what to train next.

export const BANDS = {
  low:     { key: "low",     range: [1, 3], label: "Needs work",  advice: "This is the area to train first — the gap here costs you more than polish anywhere else." },
  average: { key: "average", range: [4, 6], label: "Around average", advice: "Solid ground. Consistent practice moves this into the upper band faster than any other module." },
  high:    { key: "high",    range: [7, 9], label: "Strong",      advice: "A genuine strength. Keep it warm with short regular runs and spend your hours on your weaker modules." },
};

export function bandFor(stanine) {
  if (stanine <= 3) return BANDS.low;
  if (stanine <= 6) return BANDS.average;
  return BANDS.high;
}

// ── Composite ──────────────────────────────────────────────────────────────

/**
 * Overall stanine across modules.
 *
 * Averages the underlying z-scores, NOT the stanines. A stanine is a coarse
 * rounding to nine buckets; averaging already-rounded values compounds that
 * rounding and can land a whole band away from the truth. Criterion-basis
 * modules have no z, so their stanine is converted back to the z at the centre
 * of its bucket ((s - 5) / 2) — an approximation, and flagged as one in the
 * return value so nothing downstream mistakes it for a measured composite.
 */
export function compositeStanine(parts) {
  const usable = parts.filter((p) => p && Number.isFinite(p.weight) && p.weight > 0);
  if (usable.length === 0) return null;

  let sumW = 0;
  let sumWZ = 0;
  let anyApproximated = false;

  for (const p of usable) {
    let z = p.result.z;
    if (z == null) {
      z = (p.result.stanine - STANINE_MEAN) / STANINE_SD;
      anyApproximated = true;
    }
    sumWZ += z * p.weight;
    sumW += p.weight;
  }

  const z = sumWZ / sumW;
  const stanine = stanineFromZ(z);
  return {
    stanine,
    band: bandFor(stanine),
    z,
    basis: anyApproximated ? "mixed" : "observed",
    modules: usable.length,
  };
}

// ── Anomaly detection ──────────────────────────────────────────────────────
//
// Flags results that are not humanly plausible. This exists to stop a broken
// generator, a stuck input device or a tampered client from silently producing
// a score we would then teach from. A flag is a reason to withhold the score
// and say so — never a silent correction.

/** Below this, a "response" is faster than human simple reaction time. */
export const MIN_PLAUSIBLE_RT_MS = 150;

export function detectAnomalies({ reactionTimesMs = [], trackingRmse = null, correct = null, total = null, durationSec = null } = {}) {
  const flags = [];

  const impossible = reactionTimesMs.filter((t) => Number.isFinite(t) && t < MIN_PLAUSIBLE_RT_MS);
  if (impossible.length > 0) {
    flags.push({
      code: "reaction-time-implausible",
      detail: `${impossible.length} response(s) under ${MIN_PLAUSIBLE_RT_MS} ms — faster than human simple reaction time.`,
    });
  }

  if (trackingRmse !== null && Number.isFinite(trackingRmse) && trackingRmse <= 0) {
    flags.push({
      code: "tracking-perfect",
      detail: "Tracking error of zero is not physically achievable against a moving disturbance.",
    });
  }

  if (Number.isFinite(correct) && Number.isFinite(total)) {
    if (correct > total) flags.push({ code: "score-exceeds-total", detail: `${correct} correct out of ${total}.` });
    if (correct < 0) flags.push({ code: "score-negative", detail: `${correct} correct.` });
  }

  if (Number.isFinite(durationSec) && durationSec < 0) {
    flags.push({ code: "duration-negative", detail: `${durationSec}s elapsed.` });
  }

  return flags;
}
