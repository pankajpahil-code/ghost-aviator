// ADAPT — Spatial Orientation and Pattern Reasoning item generators.
//
// The two constructs screening batteries lean on hardest after arithmetic:
// holding an orientation in your head while it changes, and seeing the rule
// behind a series. Same contract as the other banks — inputs rolled from a
// seed, answer COMPUTED, worked solution emitted, every distractor a named
// error.
//
// One family, `compass-read`, renders an actual heading indicator as inline
// SVG rather than describing it in a sentence. Reading an instrument face is a
// different skill from doing the arithmetic, and it is the skill the cockpit
// actually asks for.
//
// Accessibility note, stated plainly rather than papered over: `compass-read`
// is inherently visual and cannot be completed without sight. Its SVG carries a
// neutral label — deliberately NOT the heading, which would hand over the
// answer to anyone reading the accessibility tree. Every other family in this
// module is fully text-based.

import { makeRng, irange, istep, pick } from "../rng.mjs";
import { num, mcq } from "./mcq.mjs";

export const FAMILIES = [
  "heading-turn",
  "reciprocal-heading",
  "relative-bearing",
  "compass-read",
  "sequence-step",
  "sequence-growth",
  "sequence-square",
  "clock-angle",
];

/** Headings run 001-360: north is 360, never 000. Keeps every value positive too. */
const wrap360 = (deg) => ((Math.round(deg) % 360) + 360) % 360 || 360;

// ── The heading indicator ──────────────────────────────────────────────────

/** Card labels, exactly as they appear on a real direction indicator. */
const CARD = { 0: "N", 30: "3", 60: "6", 90: "E", 120: "12", 150: "15", 180: "S", 210: "21", 240: "24", 270: "W", 300: "30", 330: "33" };

/**
 * Inline SVG of a direction indicator showing `heading` under the lubber line.
 *
 * The card rotates and the aircraft symbol stays fixed, which is how the real
 * instrument works. Labels rotate WITH the card — so the ones at the bottom are
 * upside down, exactly as they are on the real instrument face.
 *
 * Colours are presentation attributes rather than inline style, so a strict
 * Content-Security-Policy cannot strip them.
 */
function headingIndicator(heading) {
  const cx = 110, cy = 110, R = 100;
  const parts = [];

  for (let b = 0; b < 360; b += 5) {
    const major = b % 30 === 0;
    const len = major ? 15 : b % 10 === 0 ? 9 : 5;
    const rad = (b * Math.PI) / 180;
    const s = Math.sin(rad), c = Math.cos(rad);
    const r1 = R - 3, r2 = R - 3 - len;
    parts.push(
      `<line x1="${(cx + r1 * s).toFixed(1)}" y1="${(cy - r1 * c).toFixed(1)}" x2="${(cx + r2 * s).toFixed(1)}" y2="${(cy - r2 * c).toFixed(1)}" stroke="#94a3b8" stroke-width="${major ? 2.5 : 1}"/>`
    );
  }

  for (const [bearing, text] of Object.entries(CARD)) {
    const b = Number(bearing);
    const rad = (b * Math.PI) / 180;
    const r = R - 34;
    const x = (cx + r * Math.sin(rad)).toFixed(1);
    const y = (cy - r * Math.cos(rad)).toFixed(1);
    parts.push(
      `<text x="${x}" y="${y}" transform="rotate(${b} ${x} ${y})" fill="#e2e8f0" font-family="monospace" font-weight="bold" font-size="${b % 90 === 0 ? 19 : 15}" text-anchor="middle" dominant-baseline="central">${text}</text>`
    );
  }

  return [
    `<svg viewBox="0 0 220 220" width="220" height="220" role="img" aria-label="Direction indicator instrument face" xmlns="http://www.w3.org/2000/svg">`,
    `<circle cx="${cx}" cy="${cy}" r="${R + 7}" fill="#0b1220" stroke="#334155" stroke-width="3"/>`,
    `<g transform="rotate(${-heading} ${cx} ${cy})">${parts.join("")}</g>`,
    `<line x1="${cx - 30}" y1="${cy}" x2="${cx + 30}" y2="${cy}" stroke="#f0913a" stroke-width="3.5"/>`,
    `<line x1="${cx}" y1="${cy - 15}" x2="${cx}" y2="${cy + 20}" stroke="#f0913a" stroke-width="3.5"/>`,
    `<line x1="${cx - 11}" y1="${cy + 20}" x2="${cx + 11}" y2="${cy + 20}" stroke="#f0913a" stroke-width="3.5"/>`,
    `<polygon points="${cx - 8},${cy - R - 5} ${cx + 8},${cy - R - 5} ${cx},${cy - R + 11}" fill="#f0913a"/>`,
    `</svg>`,
  ].join("");
}

// ── Orientation families ───────────────────────────────────────────────────

function headingTurn(rnd, id) {
  const from = istep(rnd, 5, 355, 5);
  const turn = istep(rnd, 20, 170, 5);
  const right = rnd() < 0.5;
  const to = wrap360(right ? from + turn : from - turn);
  const wrongWay = wrap360(right ? from - turn : from + turn);
  return mcq(rnd, {
    id,
    family: "heading-turn",
    stem: `You are steering ${num(from).padStart(3, "0")}°. You turn ${right ? "right" : "left"} through ${num(turn)}°. What is your new heading?`,
    answer: to,
    unit: "°",
    pad: 3,
    bounded: true,
    clamp: wrap360,
    // Every distractor is itself a valid compass heading. An option like "475°"
    // would be eliminated on sight without doing the turn at all — and a
    // multiple-choice paper cannot offer a heading that does not exist.
    errors: [
      { value: wrongWay, why: `Turned the wrong way. A ${right ? "right" : "left"} turn ${right ? "increases" : "decreases"} the heading.` },
      { value: wrap360(to + 180), why: "This is the reciprocal of the correct heading — 180° out." },
      { value: wrap360(360 - to), why: "Subtracted from 360. A turn is added to or taken from the heading, not mirrored." },
      { value: wrap360(to + 10), why: "Ten degrees out — check the size of the turn again." },
      { value: wrap360(to - 10), why: "Ten degrees out — check the size of the turn again." },
    ],
    solution: `${num(from).padStart(3, "0")}° ${right ? "+" : "−"} ${num(turn)}° = ${num(to).padStart(3, "0")}°.`,
    meta: { from, turn, right: right ? 1 : 0, to },
  });
}

function reciprocalHeading(rnd, id) {
  const from = istep(rnd, 5, 355, 5);
  const recip = wrap360(from + 180);
  return mcq(rnd, {
    id,
    family: "reciprocal-heading",
    stem: `What is the reciprocal of ${num(from).padStart(3, "0")}°?`,
    answer: recip,
    unit: "°",
    pad: 3,
    bounded: true,
    clamp: wrap360,
    errors: [
      { value: wrap360(360 - from), why: "Subtracted from 360. A reciprocal is 180° away, not a mirror image." },
      { value: wrap360(180 - from), why: "Subtracted from 180. A reciprocal is 180° ADDED, then wrapped back inside the compass." },
      { value: wrap360(from + 90), why: "90° away — that is a quarter turn, not a reciprocal." },
      { value: wrap360(from - 90), why: "90° away — that is a quarter turn, not a reciprocal." },
    ],
    solution: `${num(from).padStart(3, "0")}° ${from < 180 ? "+" : "−"} 180° = ${num(recip).padStart(3, "0")}°.`,
    meta: { from, recip },
  });
}

function relativeBearing(rnd, id) {
  const heading = istep(rnd, 5, 355, 5);
  const relative = istep(rnd, 20, 340, 10);
  const magnetic = wrap360(heading + relative);
  return mcq(rnd, {
    id,
    family: "relative-bearing",
    stem: `You are steering ${num(heading).padStart(3, "0")}°. A station lies ${num(relative).padStart(3, "0")}° relative (measured clockwise from the nose). What is its magnetic bearing from you?`,
    answer: magnetic,
    unit: "°",
    pad: 3,
    bounded: true,
    clamp: wrap360,
    errors: [
      { value: wrap360(heading - relative), why: "Subtracted. Relative bearing is measured clockwise from the nose, so it is added." },
      { value: wrap360(relative), why: "This is the RELATIVE bearing. Magnetic bearing = heading + relative." },
      { value: wrap360(heading), why: "This is your own heading, not the bearing of the station." },
      { value: wrap360(magnetic + 180), why: "This is the reciprocal — the bearing FROM the station TO you." },
    ],
    solution: `Magnetic bearing = heading + relative = ${num(heading).padStart(3, "0")}° + ${num(relative).padStart(3, "0")}° = ${num(magnetic).padStart(3, "0")}°.`,
    meta: { heading, relative, magnetic },
  });
}

function compassRead(rnd, id) {
  const heading = istep(rnd, 5, 355, 5);
  return mcq(rnd, {
    id,
    family: "compass-read",
    stem: "What heading is the direction indicator showing?",
    figure: headingIndicator(heading),
    answer: heading,
    unit: "°",
    pad: 3,
    bounded: true,
    clamp: wrap360,
    errors: [
      { value: wrap360(heading + 180), why: "You read the card at the bottom of the instrument. The heading is read against the lubber line at the TOP." },
      { value: wrap360(360 - heading), why: "The card was read anticlockwise. The compass card runs clockwise: N, 03, 06, E." },
      { value: wrap360(heading + 30), why: "One 30° label out — count the small ticks between the numbers." },
      { value: wrap360(heading - 30), why: "One 30° label out — count the small ticks between the numbers." },
    ],
    solution: `The lubber line at the top of the instrument sits on ${num(heading).padStart(3, "0")}°.`,
    meta: { heading },
  });
}

// ── Pattern families ───────────────────────────────────────────────────────

function sequenceStep(rnd, id) {
  const a = irange(rnd, 2, 30);
  const d1 = irange(rnd, 3, 11);
  let d2 = irange(rnd, 3, 11);
  if (d2 === d1) d2 = d1 === 11 ? 4 : d1 + 1; // equal steps collapse it to a plain arithmetic run
  const terms = [a, a + d1, a + d1 + d2, a + 2 * d1 + d2, a + 2 * d1 + 2 * d2];
  const next = a + 3 * d1 + 2 * d2;
  const last = terms[4];
  return mcq(rnd, {
    id,
    family: "sequence-step",
    stem: `What number comes next? ${terms.map((t) => num(t)).join(", ")}, ?`,
    answer: next,
    unit: "",
    errors: [
      { value: last + d2, why: `You repeated the last step (+${num(d2)}). The steps alternate, so the one after a +${num(d2)} is a +${num(d1)}.` },
      { value: last + d1 + d2, why: "Two steps taken at once — that is the term after next." },
      { value: last + terms[3], why: "The last two terms added. The pattern is a repeating step, not a running total." },
    ],
    solution: `The steps alternate: +${num(d1)}, +${num(d2)}, +${num(d1)}, +${num(d2)}. The next step is +${num(d1)}, so ${num(last)} + ${num(d1)} = ${num(next)}.`,
    meta: { a, d1, d2, next, last },
  });
}

function sequenceGrowth(rnd, id) {
  const a = irange(rnd, 2, 6);
  const r = pick(rnd, [2, 3]);
  const terms = [a, a * r, a * r * r, a * r ** 3, a * r ** 4];
  const next = a * r ** 5;
  const last = terms[4], prev = terms[3];
  return mcq(rnd, {
    id,
    family: "sequence-growth",
    stem: `What number comes next? ${terms.map((t) => num(t)).join(", ")}, ?`,
    answer: next,
    unit: "",
    errors: [
      { value: last + (last - prev), why: "Treated as a series of additions. Each term is MULTIPLIED by the one before." },
      { value: last * (r + 1), why: `Multiplied by ${num(r + 1)}. Check the ratio between the first two terms: it is ${num(r)}.` },
      { value: last + r, why: `Added ${num(r)} instead of multiplying by it.` },
    ],
    solution: `Each term is ${num(r)}× the one before. ${num(last)} × ${num(r)} = ${num(next)}.`,
    meta: { a, r, next, last },
  });
}

function sequenceSquare(rnd, id) {
  const c = irange(rnd, 0, 4);
  const term = (n) => n * (n + c);
  const terms = [1, 2, 3, 4, 5].map(term);
  const next = term(6);
  const last = terms[4], prev = terms[3];
  return mcq(rnd, {
    id,
    family: "sequence-square",
    stem: `What number comes next? ${terms.map((t) => num(t)).join(", ")}, ?`,
    answer: next,
    unit: "",
    errors: [
      { value: last + (last - prev), why: "The gaps are not constant — they grow by 2 each time. Check the differences between the differences." },
      { value: last + prev, why: "The last two terms added. The pattern is not a running total." },
      { value: last * 2, why: "Doubling does not fit: check it against the first two terms." },
    ],
    solution: `The gaps grow by 2 each time (${terms.slice(1).map((t, i) => `+${num(t - terms[i])}`).join(", ")}), so the next gap is +${num(next - last)}: ${num(last)} + ${num(next - last)} = ${num(next)}.`,
    meta: { c, next, last },
  });
}

/** Any angle folded back into the 0-180 range a "smaller angle" answer must live in. */
const fold = (x) => {
  const y = ((Math.round(x) % 360) + 360) % 360;
  return y > 180 ? 360 - y : y;
};

function clockAngle(rnd, id) {
  const hour = irange(rnd, 1, 12);
  // The minute hand is never left on the 12. On the exact hour the hands line
  // up with the hour marks and EVERY taught distractor collapses onto the
  // answer — at 6:00 the answer is 180° and so is "you gave the larger angle",
  // "the hour hand stayed on the mark" and "both hands on hour marks". The item
  // is left with nothing to offer. Caught by the two-taught-distractors test.
  let minute = pick(rnd, [10, 20, 30, 40, 50]);
  const angleAt = (h, m) => fold(Math.abs(30 * (h % 12) - 5.5 * m));
  if (angleAt(hour, minute) === 0) minute = minute === 50 ? 20 : minute + 10;
  const angle = angleAt(hour, minute);
  const hourHand = 30 * (hour % 12) + 0.5 * minute;
  const minuteHand = 6 * minute;
  return mcq(rnd, {
    id,
    family: "clock-angle",
    stem: `On a clock face reading ${num(hour)}:${String(minute).padStart(2, "0")}, what is the smaller angle between the hour hand and the minute hand?`,
    answer: angle,
    unit: "°",
    bounded: true,
    clamp: fold,
    errors: [
      { value: 360 - angle, why: "This is the larger angle going the other way round. The question asks for the smaller one." },
      { value: fold(Math.abs(30 * (hour % 12) - 6 * minute)), why: "The hour hand was left on the hour mark. It creeps forward half a degree for every minute past the hour." },
      { value: fold(30 * Math.abs((hour % 12) - minute / 5)), why: "Both hands treated as sitting exactly on hour marks." },
      { value: fold(angle + 30), why: "One hour mark out — each hour mark is 30° apart." },
      { value: fold(angle - 30), why: "One hour mark out — each hour mark is 30° apart." },
    ],
    solution: `Minute hand: ${num(minute)} × 6 = ${num(minuteHand)}°. Hour hand: ${num(hour % 12)} × 30 + ${num(minute)} × 0.5 = ${num(hourHand, 1)}°. Difference = ${num(Math.abs(hourHand - minuteHand), 1)}°, so the smaller angle is ${num(angle)}°.`,
    meta: { hour, minute, angle },
  });
}

const GENERATORS = {
  "heading-turn": headingTurn,
  "reciprocal-heading": reciprocalHeading,
  "relative-bearing": relativeBearing,
  "compass-read": compassRead,
  "sequence-step": sequenceStep,
  "sequence-growth": sequenceGrowth,
  "sequence-square": sequenceSquare,
  "clock-angle": clockAngle,
};

/** Generate one item of a named family. Same (family, seed) -> identical item. */
export function generateItem(family, seed) {
  const gen = GENERATORS[family];
  if (!gen) throw new RangeError(`unknown spatial family: ${family}`);
  return gen(makeRng(seed), `${family}-${seed >>> 0}`);
}
