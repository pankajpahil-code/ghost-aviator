// ADAPT — shared multiple-choice item construction.
//
// Extracted from items/maths.mjs so every knowledge module (maths, physics,
// and whatever follows) assembles its options the same way. The rules encoded
// here were all paid for by a failing test, and they are the difference between
// a question bank that looks professional and one that looks generated.

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
export function num(n, dp = 0) {
  const rounded = Number(n.toFixed(dp));
  return rounded.toLocaleString("en-US", { maximumFractionDigits: dp });
}

/** Minutes as the way a pilot says it: 95 -> "1 h 35 min". */
export function hhmm(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/**
 * Render a value the way it will appear on the option button.
 *
 * Precision is adaptive because the distractors are deliberately of a different
 * magnitude to the answer: "forgot to multiply by 60" turns 70 min into 1.17,
 * and printing that as a flat "1" both hides the error being taught and risks
 * colliding with another distractor.
 */
export function fmtValue(v) {
  if (Number.isInteger(v)) return num(v, 0);
  const abs = Math.abs(v);
  if (abs < 10) return num(v, 2);
  if (abs < 100) return num(v, 1);
  return num(v, 0);
}

/**
 * A distractor is "plausible" if it is within a factor of 5 of the answer.
 *
 * Several taught errors — using minutes as hours, multiplying instead of
 * dividing — land 60x out. They are genuine errors and worth showing, but a
 * student who eliminates purely on magnitude should not be able to crack the
 * whole item that way. So at most ONE wildly-out option is allowed per
 * question; a second is dropped in favour of a near-miss, which forces the
 * arithmetic to actually be done.
 */
export const PLAUSIBLE_FACTOR = 5;
export const isPlausible = (value, answer) =>
  value >= answer / PLAUSIBLE_FACTOR && value <= answer * PLAUSIBLE_FACTOR;

/**
 * Fisher-Yates over a copy. Local to this module so option placement does not
 * consume the caller's stream in a surprising order.
 */
function shuffled(rnd, arr) {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
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
 * Render one option's label.
 *
 * `pad` zero-pads whole numbers to a fixed width, because an aviation heading
 * is always three digits — a compass item offering "65" instead of "065" reads
 * as a maths question wearing a flight instrument's clothes.
 *
 * A unit that is a symbol (° or %) joins tight to the number; a unit that is a
 * word takes a space. "065°" and "220 kt", never "065 °".
 */
function label(value, unit, pad) {
  const shown = pad && Number.isInteger(value) && value >= 0
    ? String(value).padStart(pad, "0")
    : fmtValue(value);
  if (!unit) return shown;
  return /^[°%]/.test(unit) ? `${shown}${unit}` : `${shown} ${unit}`;
}

export function mcq(rnd, { id, family, stem, answer, unit, errors, solution, meta, figure, pad, bounded, clamp }) {
  const taken = new Set([label(answer, unit, pad)]);
  const chosen = [];
  let wildUsed = 0;

  for (const e of errors) {
    if (!Number.isFinite(e.value) || e.value <= 0) continue;
    const shown = label(e.value, unit, pad);
    if (taken.has(shown)) continue;
    // `bounded` marks a scale where every legal value is equally believable and
    // magnitude tells the student nothing — a compass heading, an angle. On
    // those, 005° and 355° are three degrees apart but look 71x different, so
    // the plausibility ratio would throw away perfectly good distractors and
    // leave the item padded with meaningless near-misses.
    const wild = !bounded && !isPlausible(e.value, answer);
    if (wild && wildUsed >= 1) continue;
    if (wild) wildUsed++;
    taken.add(shown);
    chosen.push(e);
    if (chosen.length === 3) break;
  }

  // Pad with proportional near-misses if the named errors collided.
  //
  // Pads are rounded to whole numbers only when the answer is large enough for
  // rounding to keep them apart. For a small answer — an acceleration of
  // 1 m/s², say — rounding collapses EVERY pad onto the answer itself, and the
  // item was shipping with three options instead of four. Caught by the
  // structural test on the physics generators, not by reading the code.
  const padFactors = [1.25, 0.8, 1.5, 0.6, 1.1, 0.9, 1.35, 0.7, 1.75, 0.45, 2.2, 0.35];
  for (let i = 0; chosen.length < 3 && i < padFactors.length; i++) {
    let v = answer * padFactors[i];
    // A padded scale (headings) only ever shows whole numbers — "6.25°" is not
    // a heading anyone could offer a student.
    if (pad || (Number.isInteger(answer) && Math.abs(answer) >= 10)) v = Math.round(v);
    // On a bounded scale a proportional pad can walk straight off the end —
    // 1.25x a heading of 315 is 394, which is not a heading at all. `clamp`
    // maps it back onto the legal scale (wrap for a compass, fold for an angle).
    if (clamp) v = clamp(v);
    if (!Number.isFinite(v) || v <= 0) continue;
    const shown = label(v, unit, pad);
    if (taken.has(shown)) continue;
    taken.add(shown);
    chosen.push({ value: v, why: null });
  }

  // A three-option question is a broken question. Generation is deterministic
  // and every family is exercised across hundreds of seeds by the test suite,
  // so this can only fire in development — never in front of a student.
  if (chosen.length < 3) {
    throw new Error(
      `${family}: could only build ${chosen.length + 1} distinct options for answer ${answer}. Add a named error or widen the inputs.`
    );
  }

  const cells = shuffled(rnd, [
    { value: answer, correct: true, why: null },
    ...chosen.map((e) => ({ value: e.value, correct: false, why: e.why })),
  ]);

  return {
    id,
    family,
    stem,
    unit,
    options: cells.map((c) => label(c.value, unit, pad)),
    answerIndex: cells.findIndex((c) => c.correct),
    /** Per-option explanation of the error that produces it. null on the correct option. */
    optionNotes: cells.map((c) => c.why),
    solution,
    meta,
    // Inline SVG for items that must be READ off an instrument rather than
    // computed from a sentence. Generated entirely by our own code from numeric
    // inputs — there is no user-supplied content anywhere in it.
    ...(figure ? { figure } : {}),
  };
}
