// ADAPT — Control & Co-ordination: the compensatory tracking task.
//
// A marker is pushed around by a continuous disturbance. The student's job is
// to hold it on the centre. This measures the sensory-cognitive-motor loop —
// see it, decide, move — which is the loop manual flight is made of.
//
// Everything here is pure: no canvas, no DOM, no timers. The component feeds it
// wall-clock time and a control input; this module owns the maths.
//
// ── Two things the source research document got wrong, fixed here ───────────
//
// 1. THE RMSE FORMULA. The document prints
//
//        RMSE = sqrt( (1/N) Σ (xᵢ-x̂ᵢ)² + (yᵢ-ŷᵢ)² )
//
//    with the y term OUTSIDE both the sum and the 1/N. Implemented literally
//    that is "mean squared x-error plus the last y-error", which is not an error
//    metric at all. The correct form, used below, keeps both inside:
//
//        RMSE = sqrt( (1/N) Σ [ (xᵢ-x̂ᵢ)² + (yᵢ-ŷᵢ)² ] )
//
// 2. PER-FRAME SAMPLING. The document says to accumulate error inside the
//    60 fps render loop. Do that and a 120 Hz laptop contributes twice as many
//    samples as a 60 Hz phone over the same minute, and the two are weighted
//    differently in the mean — the same skill scores differently on different
//    hardware, which on this site is exactly backwards. Scoring here runs on a
//    fixed SAMPLE_HZ clock, decoupled from rendering: draw as fast as the device
//    likes, score on a metronome.
//
// ── Why the score is a percentage of the disturbance cancelled ──────────────
//
// A raw RMSE means nothing without knowing how violent the disturbance was. So
// the run is scored against the RMSE the student would have got by doing
// NOTHING — leaving the control centred — which is computable from the
// disturbance itself. "You cancelled 78% of the disturbance" needs no normative
// population to be true, and it stays comparable across different seeds.

import { makeRng } from "./rng.mjs";

/** Scoring clock. Deliberately not tied to the frame rate. */
export const SAMPLE_HZ = 50;

/**
 * Length of one reporting segment, in seconds.
 *
 * A minute. Short enough that a five-minute run yields five readings — enough
 * to see a shape — and long enough that each reading is built from 3,000
 * samples, so a single bad second cannot swing it.
 */
export const SEGMENT_SEC = 60;

/** How much of a segment must actually be flown before it is worth reporting. */
export const MIN_SEGMENT_SHARE = 0.25;

/**
 * Per-segment do-nothing baselines, so each segment's cancellation is measured
 * against the disturbance THAT segment actually contained.
 *
 * This matters more than it looks: the disturbance is a sum of sines, so some
 * minutes are genuinely rougher than others. Scoring every segment against one
 * whole-run baseline would credit a student for a calm minute and punish them
 * for a violent one, and the report would show a "fade" that was a property of
 * the seed rather than of the student.
 */
export function passiveSegmentRmse(seed, durationSec, sampleHz = SAMPLE_HZ, segmentSec = SEGMENT_SEC) {
  const disturbance = makeDisturbance(seed);
  const dt = 1 / sampleHz;
  const buckets = new Map();
  for (let i = 0; i * dt <= durationSec + 1e-9; i++) {
    const t = i * dt;
    const d = disturbance.at(t);
    const seg = Math.floor(t / segmentSec);
    const b = buckets.get(seg) ?? { sumSq: 0, n: 0 };
    b.sumSq += d.x * d.x + d.y * d.y;
    b.n++;
    buckets.set(seg, b);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([index, b]) => ({ index, rmse: Math.sqrt(b.sumSq / b.n) }));
}

/** Sine components per axis. */
const COMPONENTS = 4;

/** Total excursion of the disturbance, in normalised units (1 = edge of the field). */
const AMPLITUDE = 0.8;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * A seeded sum-of-sines disturbance.
 *
 * Sum-of-sines because it is smooth, unpredictable to a human over a short run,
 * and exactly reproducible from a seed — so a disputed result can be replayed.
 * Low frequencies carry more amplitude, which makes the motion trackable rather
 * than a jitter no one could follow.
 */
export function makeDisturbance(seed) {
  const rnd = makeRng(seed);

  const buildAxis = () => {
    const parts = [];
    for (let i = 0; i < COMPONENTS; i++) {
      // 0.04 Hz to ~0.42 Hz: slow enough to chase, fast enough to demand attention.
      const freq = 0.04 + (i + rnd()) * 0.1;
      parts.push({ freq, phase: rnd() * Math.PI * 2, weight: 1 / (i + 1) });
    }
    const total = parts.reduce((s, p) => s + p.weight, 0);
    for (const p of parts) p.amp = (p.weight / total) * AMPLITUDE;
    return parts;
  };

  const ax = buildAxis();
  const ay = buildAxis();
  const sum = (parts, t) => parts.reduce((v, p) => v + p.amp * Math.sin(2 * Math.PI * p.freq * t + p.phase), 0);

  return {
    /** Disturbance offset at time t seconds. Each component is within ±AMPLITUDE. */
    at(t) {
      return { x: sum(ax, t), y: sum(ay, t) };
    },
  };
}

/**
 * Where the marker is drawn, given the disturbance and the student's control.
 *
 * Compensatory tracking: the student sees only the ERROR — the marker — and not
 * the disturbance driving it. To hold the centre they must produce a control
 * input equal and opposite to a disturbance they can only infer from the
 * marker's behaviour. That is the harder and purer of the two classic tracking
 * paradigms, and it is the one the cockpit actually rewards.
 */
export function markerPosition(disturbanceAt, control) {
  return { x: disturbanceAt.x + control.x, y: disturbanceAt.y + control.y };
}

/**
 * A live tracking run.
 *
 * The component calls `sample(nowSec, control)` once per animation frame with
 * the current control input. However often that happens, samples are taken on
 * the fixed SAMPLE_HZ grid — so the number of samples in a 60-second run is the
 * same on every device. Between grid points the most recent control input is
 * held (a zero-order hold), which is the only honest option: the student's input
 * genuinely is only known once per frame.
 */
/**
 * How far behind the sampler will catch up in a single call before it decides
 * the run stopped being flown. A frame or two of jitter is normal; a quarter of
 * a second is not.
 */
export const MAX_CATCH_UP_SEC = 0.25;

export function makeTracker({ seed, sampleHz = SAMPLE_HZ, maxCatchUpSec = MAX_CATCH_UP_SEC, segmentSec = SEGMENT_SEC } = {}) {
  if (!Number.isInteger(seed)) throw new RangeError("tracker needs an integer seed");
  if (!(sampleHz > 0)) throw new RangeError("sampleHz must be positive");

  const disturbance = makeDisturbance(seed);
  const dt = 1 / sampleHz;
  // Sample instants are idx*dt computed fresh, NOT a running total. Adding dt
  // five hundred times accumulates floating-point drift, and the drift depends
  // on how the caller's own clock was built — which put a device-dependent
  // wobble into the one thing this module exists to keep device-independent.
  //
  // `idx` is where the sampling clock has reached; `taken` is how many samples
  // were actually accumulated. They differ whenever a gap is skipped, and that
  // difference is exactly what tells the caller the run was interrupted.
  let idx = 0;
  let taken = 0;
  let skipped = 0;
  let sumSq = 0;
  let worst = 0;

  // Per-segment accumulators, so a five-minute run can report how the student
  // held up MINUTE BY MINUTE rather than as one averaged number.
  //
  // This is the whole reason the run was lengthened from sixty seconds. A
  // single RMSE cannot distinguish a steady 70% from a first minute at 95% and
  // a last at 45% — and those two students need opposite advice. Segments are
  // sparse (created when first written) so a run that ends early simply has
  // fewer of them, rather than a tail of fabricated zeroes.
  const segments = new Map();

  return {
    disturbance,
    at(t) { return disturbance.at(t); },

    sample(nowSec, control) {
      if (!Number.isFinite(nowSec)) return;
      const target = nowSec + 1e-9;

      // If the sampler is a long way behind — the tab was hidden, the phone
      // locked, the device stalled — the gap is SKIPPED rather than filled in.
      //
      // Backfilling would take every missed sample using whatever control value
      // happens to be current on the frame the page wakes up. A student who
      // tabbed away for twenty seconds with the pointer sitting near the
      // cancelling position would be credited with twenty seconds of flawless
      // tracking they never flew. Skipping instead leaves the sample count
      // short, which is what tells the scorer the run was interrupted.
      if (target - idx * dt > maxCatchUpSec) {
        const resume = Math.ceil(target / dt);
        skipped += Math.max(0, resume - idx);
        idx = resume;
        return;
      }

      while (idx * dt <= target) {
        const t = idx * dt;
        const d = disturbance.at(t);
        const ex = d.x + control.x;
        const ey = d.y + control.y;
        const sq = ex * ex + ey * ey;
        sumSq += sq;
        worst = Math.max(worst, Math.hypot(ex, ey));

        const seg = Math.floor(t / segmentSec);
        const bucket = segments.get(seg) ?? { sumSq: 0, taken: 0 };
        bucket.sumSq += sq;
        bucket.taken++;
        segments.set(seg, bucket);

        idx++;
        taken++;
      }
    },

    /** Samples actually accumulated — NOT the elapsed clock position. */
    get sampleCount() { return taken; },
    /** Samples the clock passed over while the run was not being flown. */
    get skippedCount() { return skipped; },
    get worstError() { return worst; },
    /** Root-mean-square radial error. Null before any sample is taken. */
    rmse() { return taken === 0 ? null : Math.sqrt(sumSq / taken); },

    /**
     * RMSE per segment, oldest first, as { index, rmse, samples }.
     *
     * A segment the run never reached is absent rather than null-padded — the
     * caller pairs these against baselines by INDEX, so a short run must not
     * silently line up its third minute against the baseline for the fifth.
     */
    segmentRmse() {
      // A segment must be substantially flown to be reported. The inclusive
      // final sample instant opens a sixth bucket holding ONE sample on a
      // five-minute run, and a one-sample RMSE is noise that would draw a
      // dramatic final-minute cliff on the report out of nothing at all.
      const floor = Math.max(1, Math.round(segmentSec * sampleHz * MIN_SEGMENT_SHARE));
      return [...segments.entries()]
        .sort((a, b) => a[0] - b[0])
        .filter(([, b]) => b.taken >= floor)
        .map(([index, b]) => ({ index, rmse: Math.sqrt(b.sumSq / b.taken), samples: b.taken }));
    },
  };
}

/**
 * Exact evaluation of a run for a known control law. Used to compute the
 * do-nothing baseline, and by the tests to check the maths against values
 * worked out by hand.
 */
export function evaluate({ seed, durationSec, sampleHz = SAMPLE_HZ, controlAt }) {
  const disturbance = makeDisturbance(seed);
  const dt = 1 / sampleHz;
  let n = 0;
  let sumSq = 0;
  for (let t = 0; t <= durationSec + 1e-9; t += dt) {
    const d = disturbance.at(t);
    const u = controlAt ? controlAt(t, d) : { x: 0, y: 0 };
    const ex = d.x + u.x;
    const ey = d.y + u.y;
    sumSq += ex * ex + ey * ey;
    n++;
  }
  return { rmse: n === 0 ? null : Math.sqrt(sumSq / n), samples: n };
}

/** RMSE the student would score by leaving the control centred for the whole run. */
export function passiveRmse(seed, durationSec, sampleHz = SAMPLE_HZ) {
  return evaluate({ seed, durationSec, sampleHz }).rmse;
}

/**
 * Fraction of the disturbance the student actually cancelled, 0-100.
 * Doing nothing scores 0. Perfect cancellation scores 100. Actively making it
 * worse than doing nothing is floored at 0 rather than reported as negative —
 * the distinction is not meaningful and a negative score reads as a bug.
 */
export function cancellationPercent(rmse, baseline) {
  if (rmse == null || !(baseline > 0)) return null;
  return clamp((1 - rmse / baseline) * 100, 0, 100) ;
}

/**
 * Criterion cut table for cancellation percentage, stanines 2-9.
 *
 * PROVISIONAL, and stated as such on the results page. There is no normative
 * data for this task yet, so these are anchored to what the numbers mean rather
 * than to a population: 0% is doing nothing at all, and 100% is a perfection no
 * human hand reaches. They are replaced by measured norms once the task has
 * enough attempts behind it — and per lib/adapt/stanine.mjs those norms must be
 * a frozen snapshot, and must be kept SEPARATE PER INPUT DEVICE. A student on a
 * phone screen and a student on a joystick are not doing the same task, and
 * pooling them would flatter one and punish the other.
 */
export const CANCELLATION_NORM = {
  mode: "criterion",
  direction: "higher-better",
  cuts: [20, 35, 45, 55, 65, 75, 85, 92],
  rationale:
    "Standards-based on the share of the disturbance cancelled: 0% is leaving the control centred, and the ladder runs to 92%. Provisional until measured norms exist, and always compared within one input device.",
};

/** Input devices are scored as separate populations. Never pool them. */
export function inputClass(kind, gamepadId) {
  if (kind === "gamepad") return `gamepad:${(gamepadId || "unknown").slice(0, 40)}`;
  return kind === "touch" ? "touch" : "pointer";
}

export const INPUT_LABEL = {
  touch: "touchscreen",
  pointer: "mouse or trackpad",
};

/** Human-readable name for an input class, including gamepads. */
export function inputLabel(cls) {
  if (cls?.startsWith("gamepad:")) return "joystick or gamepad";
  return INPUT_LABEL[cls] ?? cls;
}
