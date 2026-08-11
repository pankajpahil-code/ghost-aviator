// ADAPT — learning rate: how fast you improve, scored as a thing in itself.
//
// ── Why this module exists ─────────────────────────────────────────────────
//
// The deepest idea in the real screening battery, and the one this simulator
// was missing entirely until now. The publisher runs its multitasking test
// TWICE and reads the improvement between the two attempts as trainability;
// the co-ordination test reports "your overall performance AND improvement in
// relation to the comparison group". First-party, both of them —
// ADAPT_COMPETITIVE_AUDIT.md §1.3.
//
// The reasoning behind it is sound and worth understanding rather than just
// copying. An airline is not buying the candidate who is best today. It is
// buying the one who will be safe in a jet in eighteen months, and a steep
// learning curve predicts that better than a high first score does. A cadet who
// opens at stanine 4 and reaches 7 in five sittings is a better bet than one
// who opens at 6 and is still at 6.
//
// ── What this module refuses to do ─────────────────────────────────────────
//
// It does not produce a "trainability score", a percentile, or any single
// number claiming to say how quickly a person learns in general. It reports the
// slope of the scores actually recorded, in the units they were recorded in,
// with the number of sittings behind it — and nothing more. Three sittings is
// not a psychometric instrument, and dressing it up as one would be exactly the
// invented psychometrics this feature refuses elsewhere.

/** Fewest sittings before a slope means anything at all. */
export const MIN_SITTINGS = 3;

/** Slope, in scale points per sitting, at or above which we call it improvement. */
export const IMPROVING = 0.25;

/**
 * Least-squares slope of `scores` against sitting number, oldest first.
 *
 * Least squares rather than last-minus-first, because last-minus-first is
 * decided entirely by two sittings and a single bad night at the end flips it.
 * Every sitting should have a vote.
 *
 * Returns null below MIN_SITTINGS rather than a small number: a slope through
 * two points is not a trend, it is a line, and it would be read as a trend the
 * moment it was printed.
 */
export function slope(scores) {
  const xs = (scores ?? []).filter((v) => Number.isFinite(v));
  if (xs.length < MIN_SITTINGS) return null;

  const n = xs.length;
  const meanX = (n - 1) / 2;
  const meanY = xs.reduce((s, v) => s + v, 0) / n;

  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (xs[i] - meanY);
    den += (i - meanX) ** 2;
  }
  // den is zero only when n < 2, which MIN_SITTINGS already excluded.
  return num / den;
}

/**
 * The paired-attempt reading the real multitasking test uses: sit it twice,
 * back to back, and the difference is the measurement.
 *
 * Deliberately separate from `slope`. They answer different questions — this
 * one is "did you learn the task in one exposure", the slope is "are you
 * getting better over weeks" — and collapsing them into one number would lose
 * both.
 */
export function pairedImprovement(first, second) {
  if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
  return {
    first,
    second,
    delta: second - first,
    /**
     * A student who was already at the top of the scale cannot show
     * improvement, and must not be reported as having failed to learn. This is
     * the ceiling effect, and it is the most common way a paired-attempt score
     * is misread.
     */
    atCeiling: first >= 9,
  };
}

/**
 * The full learning picture for one module.
 *
 * `scores` is that module's stanines, oldest first. Everything returned is
 * either measured or null; nothing is estimated.
 */
export function learningFor(scores) {
  const xs = (scores ?? []).filter((v) => Number.isFinite(v));
  const s = slope(xs);
  const best = xs.length ? Math.max(...xs) : null;
  const first = xs.length ? xs[0] : null;
  const latest = xs.length ? xs[xs.length - 1] : null;

  return {
    sittings: xs.length,
    first,
    latest,
    best,
    slope: s,
    /** Total ground gained since the first sitting — the number students care about. */
    gained: first == null ? null : latest - first,
    direction: s == null ? null : s >= IMPROVING ? "improving" : s <= -IMPROVING ? "slipping" : "flat",
    /** True once there is enough to say anything. The UI must check this, not `sittings`. */
    readable: s !== null,
    /**
     * Sittings still needed before a slope can be shown. Zero once readable.
     * Given to the student so "not enough data yet" comes with a target rather
     * than reading as a fault.
     */
    sittingsNeeded: Math.max(0, MIN_SITTINGS - xs.length),
  };
}

/**
 * One honest sentence about a learning curve, or null when there is nothing
 * honest to say yet.
 *
 * Written here rather than in the component because these are claims about a
 * measurement, and a claim belongs next to the thing that computed it.
 */
export function learningNote(learning) {
  if (!learning || !learning.readable) return null;
  const per = Math.abs(learning.slope).toFixed(2);
  if (learning.direction === "improving") {
    return `Improving by about ${per} of a stanine per sitting across ${learning.sittings} sittings. That rate of improvement is itself something screening measures — it is read as how quickly you take training.`;
  }
  if (learning.direction === "slipping") {
    return `Down about ${per} of a stanine per sitting across ${learning.sittings} sittings. Fatigue and rushing do this more often than any loss of ability — check whether you are sitting these tired.`;
  }
  return `Holding steady across ${learning.sittings} sittings. A flat line at a high score is a good place to be; a flat line at a low one means the way you are practising has stopped paying, and something about it needs to change.`;
}
