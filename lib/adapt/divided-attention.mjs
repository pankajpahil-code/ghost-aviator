// ADAPT — Divided Attention: FOUR tasks at once, for fifteen escalating minutes.
//
// The hardest module to build and the one that matters most. Screening
// batteries lean on divided attention because a flight deck is exactly this:
// something to monitor, a radio you must listen to without staring at it, and a
// sum someone wants answered while both are still running.
//
// Everything here is pure — the schedule, the gauge, the scoring. The component
// plays sounds and draws needles; it owns no arithmetic.
//
// ── The four streams ───────────────────────────────────────────────────────
//
// 0. TRACKING  A continuous one: hold the aeroplane on the centre while doing
//              everything below. See the note further down on why this is the
//              defining stream rather than a fourth nicety.
//
// 1. MONITOR   A gauge drifts. When the needle enters the red band the student
//              must acknowledge it, and only while it is in the red. Pressing
//              when the needle is safe is a false alarm and costs marks — a
//              pilot who reacts to nothing is not vigilant, just twitchy.
//
// 2. RADIO     Calls arrive on the frequency. Some are for this aircraft and
//              some are for other traffic. Acknowledge YOURS, ignore theirs.
//              Answering another aeroplane's call is an error, not a near miss.
//              This is the party-line skill, and nobody in India trains it.
//
// 3. ARITHMETIC  Every so often a sum interrupts, with a hard few seconds to
//              answer. This is the task-switching cost made visible.
//
// ── Why the score punishes fixation ────────────────────────────────────────
//
// A student can ace any ONE of these by abandoning the other two, and that is
// precisely the failure mode the real test hunts for: target fixation. So the
// composite subtracts a penalty proportional to the SPREAD between the three
// stream accuracies. Flying all three at 70% beats flying one at 100% and two
// at 40%, which is the correct lesson and the opposite of what a plain average
// would teach.

import { makeRng, irange, istep, pick, shuffle, subSeed } from "./rng.mjs";
import { makeDisturbance, cancellationPercent, SAMPLE_HZ } from "./tracking.mjs";

// ── The fourth stream, and why it was missing ──────────────────────────────
//
// This module shipped with three streams — monitor, radio, arithmetic — and no
// continuous psychomotor task. That was the single largest fidelity gap in the
// whole simulator, and it is fixed here.
//
// The paradigm the real multitasking test is built on is not proprietary. It is
// NASA's Multi-Attribute Task Battery (Comstock & Arnegard 1992; MATB-II,
// NASA/TM-2011-217164, and the open-source Open MATB), whose four subtasks are
// TRACKING, system monitoring, communications, and resource management. A
// candidate's description of the real test — "keeping a plane level, doing math,
// and responding to symbols" — is that battery.
//
// Tracking is the defining stream, not a fourth nicety. Two discrete tasks
// interleave: you answer a sum, then you check a gauge. A CONTINUOUS task cannot
// be interleaved — the aircraft is drifting the entire time you are doing
// arithmetic. That competition is the thing being measured, and without it we
// were measuring task-switching and calling it divided attention.
export const STREAMS = ["tracking", "monitor", "radio", "arithmetic"];

/**
 * How much harder the aircraft gets to hold, per phase.
 *
 * The discrete streams escalate by arriving faster; a continuous one has no
 * arrival rate, so it escalates by pushing harder. Applied to the disturbance
 * amplitude, which is the honest lever — it makes the aeroplane less stable,
 * not the scoring stricter.
 */
export const TRACKING_GAIN = { settling: 1.0, building: 1.35, saturated: 1.75 };

/**
 * The disturbance multiplier at time `t`. Exported because BOTH the component
 * that flies it and the scorer that grades it must use the same number.
 *
 * If they ever disagree the cancellation percentage is silently wrong: the
 * student flies an aeroplane pushed 1.75x while being scored against the
 * do-nothing error of an aeroplane pushed 1.0x, and the result reads far worse
 * than the flying was. That is the kind of defect that never throws and never
 * looks wrong — which is exactly why it lives in one exported function.
 */
export function trackingGainAt(t, durationSec) {
  return TRACKING_GAIN[PHASES[phaseIndexAt(t, durationSec)].key];
}

/**
 * Do-nothing error for the GAINED disturbance — the honest baseline.
 *
 * `passiveRmse` in tracking.mjs assumes a constant-amplitude disturbance and
 * cannot be reused here, because this one is deliberately amplified as the run
 * escalates. Same fixed sampling clock, same meaning: the error a student would
 * accumulate by leaving the control centred for the whole run.
 */
export function passiveRmseGained(seed, durationSec, sampleHz = SAMPLE_HZ) {
  const disturbance = makeDisturbance(seed);
  const dt = 1 / sampleHz;
  let sumSq = 0;
  let n = 0;
  for (let i = 0; i * dt <= durationSec + 1e-9; i++) {
    const t = i * dt;
    const g = trackingGainAt(t, durationSec);
    const d = disturbance.at(t);
    sumSq += (d.x * g) ** 2 + (d.y * g) ** 2;
    n++;
  }
  return n === 0 ? null : Math.sqrt(sumSq / n);
}

/** How long a student has to respond, per stream, at the opening workload. */
export const WINDOW_SEC = { radio: 3.5, arithmetic: 6 };

/**
 * Extra seconds a clearance strip stays up after its call's response window.
 *
 * Display-only — it changes no score. It lives here anyway because it is a
 * FAIRNESS parameter: too short and the debrief measures reading speed rather
 * than retention, and a number that decides whether a scored section is
 * answerable should not be buried in a component's JSX.
 */
export const CLEARANCE_SHOW_EXTRA_SEC = 2.5;

// ── Escalation ─────────────────────────────────────────────────────────────
//
// The real multitasking assessment does not run at one workload. The publisher
// describes it as placing the candidate "in an ever-increasingly stressful
// situation to determine how well they can function as the number and intensity
// of overlapping tasks increase" (first-party; ADAPT_COMPETITIVE_AUDIT.md §1.3).
//
// A flat run measures your ceiling once. An escalating run finds where the
// ceiling IS — and the phase at which a student's composite falls away is the
// single most coachable thing this module can tell them, because it converts
// "you are bad at multitasking" into "you hold two streams fine and lose the
// gauge the moment the radio speeds up".
//
// Escalation is applied two ways at once, which is what "number AND intensity"
// means: events arrive closer together (`gapScale`) and there is less time to
// answer each one (`windowScale`). The gauge is deliberately NOT sped up — it
// is the background task, and the skill under test is holding a background task
// while the foreground gets louder.

export const PHASES = [
  { key: "settling", label: "Phase 1 — settling in", gapScale: 1.15, windowScale: 1.0 },
  { key: "building", label: "Phase 2 — building", gapScale: 0.85, windowScale: 0.85 },
  { key: "saturated", label: "Phase 3 — saturated", gapScale: 0.6, windowScale: 0.72 },
];

/**
 * Which phase second `t` falls in. Equal thirds of the run.
 *
 * Bounded at both ends: an event scheduled fractionally past the final second
 * (or a response logged a tick late) must still resolve to a real phase rather
 * than reading off the end of the table.
 */
export function phaseIndexAt(t, durationSec) {
  if (!(durationSec > 0)) throw new RangeError("phaseIndexAt: durationSec must be positive");
  const i = Math.floor((t / durationSec) * PHASES.length);
  return Math.min(PHASES.length - 1, Math.max(0, i));
}

/** Start and end second of each phase, for the run summary and the display. */
export function phaseWindows(durationSec) {
  const span = durationSec / PHASES.length;
  return PHASES.map((p, i) => ({ ...p, index: i, start: i * span, end: (i + 1) * span }));
}

/** Weight on the spread between streams. 0 would be a plain average. */
export const FIXATION_WEIGHT = 0.35;

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// ── The gauge ──────────────────────────────────────────────────────────────

/** Needle range and the red band it must not sit in unnoticed. */
export const GAUGE = { min: 0, max: 100, redline: 74 };

/**
 * A run must offer at least this many excursions to monitor.
 *
 * With a wandering needle and a fixed redline, how often the needle goes red is
 * a property of the seed — on some seeds it barely does, which leaves the
 * student nothing to watch and makes the monitor score meaningless. Rather than
 * hope, the gauge seed is bumped until the run has enough to be worth scoring.
 */
export const MIN_EXCURSIONS = 4;

/**
 * Gauge value over time: a slow wander built from a few sines, seeded.
 *
 * Deliberately smooth and slow — the skill under test is noticing a drift while
 * busy elsewhere, not reacting to a strobe.
 */
export function makeGauge(seed) {
  const rnd = makeRng(seed);
  const parts = [];
  for (let i = 0; i < 3; i++) {
    parts.push({ freq: 0.02 + (i + rnd()) * 0.035, phase: rnd() * Math.PI * 2, amp: 1 / (i + 1) });
  }
  const total = parts.reduce((s, p) => s + p.amp, 0);
  for (const p of parts) p.amp /= total;

  return {
    at(t) {
      const raw = parts.reduce((v, p) => v + p.amp * Math.sin(2 * Math.PI * p.freq * t + p.phase), 0);
      // Bias the centre below the redline so excursions are events, not the norm.
      return clamp(50 + raw * 40, GAUGE.min, GAUGE.max);
    },
  };
}

/**
 * The windows during which the needle is in the red.
 *
 * Computed by walking the gauge on a fine grid rather than solved analytically:
 * the schedule must match exactly what the student sees drawn, and the drawing
 * samples the same function.
 */
export function redWindows(seed, durationSec, step = 0.1) {
  const gauge = makeGauge(seed);
  const windows = [];
  let open = null;
  for (let t = 0; t <= durationSec + 1e-9; t += step) {
    const hot = gauge.at(t) >= GAUGE.redline;
    if (hot && open === null) open = t;
    if (!hot && open !== null) { windows.push({ start: open, end: t }); open = null; }
  }
  if (open !== null) windows.push({ start: open, end: durationSec });
  // Sub-second flickers are not a fair thing to demand a response to.
  return windows.filter((w) => w.end - w.start >= 1.5);
}

// ── The interruption stream ────────────────────────────────────────────────
//
// Deliberately NOT the Aviation Maths generators: those are 30-second problems.
// Under a six-second interruption the item has to be genuinely quick, or the
// module stops measuring attention and starts measuring arithmetic again.
//
// WIDENED 2026-08-16. This stream fired sums and nothing else. The competitor
// module torn down in ADAPT_SKYTEST_VIDEO_TEARDOWN.md §1.3 fires fourteen
// families through one slot — numeracy, verbal, spelling, spatial, memory,
// matrix — and that variety is not decoration. A student who has drilled only
// arithmetic learns to keep ONE kind of mental machinery warm; the real thing
// switches the machinery on you while the aeroplane is still drifting, and
// paying that switching cost is the skill.
//
// The six-second rule above is unchanged and governs every family added here.
// Anything that cannot be answered by a prepared student inside a shrinking
// window does not belong in this stream — it belongs in a knowledge paper.
//
// The stream's internal key stays "arithmetic" even though it is no longer
// only arithmetic. That name is written into stored results (results-core.mjs
// `dividedDetail`), and renaming it would make every sitting already recorded
// for a real student incomparable with every later one. The student-facing
// label has always been "Interruptions", which was already the honest word.

/** Families the interruption slot can fire, and whether their options are numbers. */
export const INTERRUPTION_FAMILIES = {
  sum: { numeric: true, label: "mental arithmetic" },
  heading: { numeric: true, label: "heading" },
  series: { numeric: true, label: "number series" },
  odd: { numeric: false, label: "odd one out" },
  spelling: { numeric: false, label: "spelling" },
};

/**
 * Odd-one-out sets. Correct BY CONSTRUCTION: three drawn from `same` and one
 * from `odd`, so the answer is decided by which list a word came from rather
 * than by a judgement call written into a key. A test asserts the two lists
 * never share a word, which is the only way this family can go wrong.
 */
export const ODD_SETS = [
  { same: ["ALTIMETER", "AIRSPEED INDICATOR", "VERTICAL SPEED INDICATOR", "TURN COORDINATOR", "ATTITUDE INDICATOR"],
    odd: ["RUDDER", "AILERON", "ELEVATOR", "FLAP"] },
  { same: ["NITROGEN", "OXYGEN", "ARGON", "CARBON DIOXIDE"],
    odd: ["GRANITE", "COPPER", "WATER", "IRON"] },
  { same: ["CUMULUS", "STRATUS", "CIRRUS", "NIMBOSTRATUS"],
    odd: ["DRIZZLE", "HAIL", "SNOW", "FOG"] },
  { same: ["KILOMETRE", "MILE", "FOOT", "METRE"],
    odd: ["LITRE", "KILOGRAM", "SECOND", "AMPERE"] },
  { same: ["NORTH", "SOUTH", "EAST", "WEST"],
    odd: ["UP", "LEFT", "BEHIND", "INSIDE"] },
  { same: ["ENGINE", "PROPELLER", "GEARBOX", "MAGNETO"],
    odd: ["RUNWAY", "TAXIWAY", "APRON", "HANGAR"] },
];

/**
 * Spelling items. The correct form and its misspellings are BOTH authored,
 * never generated — a generated misspelling can land on another real word, and
 * a spelling question with two valid answers teaches a student they were wrong
 * when they were right. British forms, as DGCA and ICAO documents use.
 */
export const SPELLINGS = [
  { correct: "SEPARATION", wrong: ["SEPERATION", "SEPARATTION", "SEPPARATION"] },
  { correct: "ALTIMETER", wrong: ["ALTIMETRE", "ALTIMITER", "ALTIMETTER"] },
  { correct: "AERODROME", wrong: ["AEORDROME", "AERODROOME", "AERIDROME"] },
  { correct: "TURBULENCE", wrong: ["TURBULANCE", "TURBULENSE", "TERBULENCE"] },
  { correct: "VISIBILITY", wrong: ["VISABILITY", "VISIBILITTY", "VISIBILLITY"] },
  { correct: "CLEARANCE", wrong: ["CLEARENCE", "CLEARANSE", "CLEARRANCE"] },
  { correct: "FREQUENCY", wrong: ["FREQENCY", "FREQUENCEY", "FREQUANCY"] },
  { correct: "ACKNOWLEDGE", wrong: ["AKNOWLEDGE", "ACKNOWLEGE", "ACKNOWLEDG"] },
  { correct: "EMERGENCY", wrong: ["EMERGANCY", "EMMERGENCY", "EMERGENSY"] },
  { correct: "PROCEDURE", wrong: ["PROCEEDURE", "PROCEDDURE", "PROCEDURRE"] },
];

/** Shuffle options and report where the answer landed. Shared by every family. */
function dealOptions(rnd, correct, wrong) {
  const cells = shuffle(rnd, [correct, ...wrong]);
  return { options: cells.map(String), answerIndex: cells.indexOf(correct) };
}

/** Three-digit heading, the way it is spoken and the way an option is printed. */
const hdg = (deg) => String(((deg % 360) + 360) % 360).padStart(3, "0");

/**
 * Reciprocal, or a turn onto a new heading. Both wrap through north, which is
 * where the mistakes are and the reason this belongs in a fast stream rather
 * than a paper — a prepared pilot does it without reaching for anything.
 */
function quickHeading(rnd, id) {
  const from = istep(rnd, 5, 355, 5);
  let stem, answer;
  if (rnd() < 0.5) {
    answer = (from + 180) % 360;
    stem = `Reciprocal of ${hdg(from)}?`;
  } else {
    const turn = istep(rnd, 20, 90, 10);
    const right = rnd() < 0.5;
    answer = (((right ? from + turn : from - turn) % 360) + 360) % 360;
    stem = `Heading ${hdg(from)}, turn ${right ? "right" : "left"} ${turn}°. New heading?`;
  }
  // Distractors are the near misses a hurried pilot actually produces: the
  // turn applied the wrong way, and one step either side.
  const taken = new Set([hdg(answer)]);
  const wrong = [];
  for (const d of [10, -10, 20, -20, 30, -30, 180]) {
    const v = hdg(answer + d);
    if (!taken.has(v)) { taken.add(v); wrong.push(v); }
    if (wrong.length === 3) break;
  }
  // The answer is the RENDERED heading, not the raw number: 25 and "025" are
  // the same heading but not the same string, and every consumer here compares
  // the marked option against `answer` as text. Caught by a test that asserted
  // exactly that invariant across all five families.
  return { id, family: "heading", stem, answer: hdg(answer), ...dealOptions(rnd, hdg(answer), wrong) };
}

/** A linear number series. One rule, six terms shown, one term missing. */
function quickSeries(rnd, id) {
  const step = pick(rnd, [-2, -3, -4, -5, 3, 4, 6, 7]);
  const start = irange(rnd, 20, 120);
  const terms = [];
  for (let i = 0; i < 6; i++) terms.push(start + step * i);
  const answer = start + step * 6;
  if (answer <= 0) return quickSeries(rnd, id);
  const taken = new Set([answer]);
  const wrong = [];
  // "One step too far" and "forgot to step" are the two real errors here, so
  // they are the distractors rather than random neighbours.
  for (const v of [answer + step, answer - step, answer + 1, answer - 1, answer + 2]) {
    if (v > 0 && !taken.has(v)) { taken.add(v); wrong.push(v); }
    if (wrong.length === 3) break;
  }
  return {
    id, family: "series", answer,
    stem: `${terms.join("  ")}  ?`,
    ...dealOptions(rnd, String(answer), wrong.map(String)),
  };
}

function quickOdd(rnd, id) {
  const set = pick(rnd, ODD_SETS);
  const same = shuffle(rnd, set.same).slice(0, 3);
  const odd = pick(rnd, set.odd);
  return { id, family: "odd", stem: "Which is the odd one out?", answer: odd, ...dealOptions(rnd, odd, same) };
}

function quickSpelling(rnd, id) {
  const entry = pick(rnd, SPELLINGS);
  return {
    id, family: "spelling", stem: "Which spelling is correct?", answer: entry.correct,
    ...dealOptions(rnd, entry.correct, entry.wrong),
  };
}

function quickSum(rnd, id) {
  const kind = pick(rnd, ["add", "sub", "mul", "pct"]);
  let stem, answer;
  if (kind === "add") {
    const a = irange(rnd, 17, 89), b = irange(rnd, 14, 89);
    stem = `${a} + ${b}`; answer = a + b;
  } else if (kind === "sub") {
    const a = irange(rnd, 60, 140), b = irange(rnd, 12, 55);
    stem = `${a} − ${b}`; answer = a - b;
  } else if (kind === "mul") {
    const a = irange(rnd, 3, 12), b = istep(rnd, 10, 90, 5);
    stem = `${a} × ${b}`; answer = a * b;
  } else {
    const pct = pick(rnd, [10, 20, 25, 50]);
    const base = istep(rnd, 40, 400, 20);
    stem = `${pct}% of ${base}`; answer = (pct / 100) * base;
  }
  answer = Math.round(answer);

  // Near-miss distractors only: under time pressure the discrimination should
  // be the arithmetic, not the order of magnitude.
  const taken = new Set([answer]);
  const dis = [];
  for (const d of [1, -1, 2, -2, 10, -10, 5, -5, 3, -3]) {
    const v = answer + d;
    if (v > 0 && !taken.has(v)) { taken.add(v); dis.push(v); }
    if (dis.length === 3) break;
  }
  return {
    id,
    family: "sum",
    // The stem is complete, question mark and all. Every family prints its own
    // question now, so the component renders the stem verbatim instead of
    // appending "= ?" to it — which would have read as nonsense the moment a
    // spelling item arrived in the same slot.
    stem: `${stem} = ?`,
    answer,
    ...dealOptions(rnd, String(answer), dis.map(String)),
  };
}

/** The order families are dealt in. Cycled, so a run always contains all five. */
const FAMILY_ORDER = Object.keys(INTERRUPTION_FAMILIES);

/**
 * One interruption. The family is CYCLED rather than rolled, for the same
 * reason clearance kinds are: a run that happened to deal nine sums would
 * measure exactly what this stream was widened to stop measuring.
 */
function quickItem(rnd, id, ordinal) {
  switch (FAMILY_ORDER[ordinal % FAMILY_ORDER.length]) {
    case "heading": return quickHeading(rnd, id);
    case "series": return quickSeries(rnd, id);
    case "odd": return quickOdd(rnd, id);
    case "spelling": return quickSpelling(rnd, id);
    default: return quickSum(rnd, id);
  }
}

// ── Clearances: what your own calls actually SAY ───────────────────────────
//
// Added 2026-08-16, from the teardown in ADAPT_SKYTEST_VIDEO_TEARDOWN.md §1.4.
//
// Until now a radio call was a bare event: a tone, a window, yours or theirs.
// That measures whether you noticed it. It does not measure whether you TOOK
// IT IN — and taking a clearance in while both hands are busy is most of the
// skill. A competitor's equivalent module is billed as a "divided attention and
// long-term memory" test and scores recall as a full section of its report; we
// scored none of it.
//
// So a call that is YOURS now carries a datum: a heading, an altitude, a speed,
// or the next waypoint. Calls that are not yours carry nothing, because you do
// not copy someone else's clearance — noticing it is not yours is the whole
// point of the party-line stream and it stays intact.
//
// WHY THIS IS SHOWN AND NOT SPOKEN — a deliberate deviation, recorded so nobody
// "fixes" it later. The real thing reads clearances aloud. We cannot: this
// module's audio is synthesised through Web Audio precisely because
// speechSynthesis has device-dependent timing and fails silently on some
// Android, which is unacceptable in a stream scored on WHEN you responded (see
// the 2026-08-09 audio decision). A spoken clearance would put the datum on the
// one channel whose timing we do not control. The datum is therefore printed on
// a strip when the call arrives and clears with the window. The tone still
// carries "yours or theirs" and the response is still scored off the tone, so
// nothing about the existing radio score changes. What is preserved is the
// thing under test: a value arrives while you are busy, it does not stay, and
// you are asked for it later.

/** Ground features a clearance can route you to. Deliberately mundane and confusable. */
export const WAYPOINTS = [
  "the water tower", "the rail bridge", "the quarry", "the cement works",
  "the glider field", "the wind farm", "the reservoir", "the motorway junction",
  "the power station", "the racecourse", "the container yard", "the radio mast",
];

/** The four things ATC will assign you, cycled so a run always contains all four. */
export const CLEARANCE_KINDS = ["heading", "altitude", "speed", "waypoint"];

/** Render a clearance value the way it is shown and the way an option is printed. */
export function clearanceText(kind, value) {
  switch (kind) {
    case "heading": return `heading ${String(value).padStart(3, "0")}`;
    case "altitude": return `${value.toLocaleString("en-GB")} ft`;
    case "speed": return `${value} kt`;
    case "waypoint": return String(value);
    default: throw new RangeError(`unknown clearance kind: ${kind}`);
  }
}

/**
 * A fresh value for `kind` that has not been issued in this run.
 *
 * Uniqueness is not cosmetic. A recall question offers one value that WAS
 * assigned against three that were not — so if the same altitude could be
 * issued twice, or a distractor could collide with a different real clearance,
 * the question would have two correct answers and mark one of them wrong.
 * Every value this run has used is therefore held in `used` and avoided.
 */
function freshClearanceValue(rnd, kind, used) {
  for (let attempt = 0; attempt < 200; attempt++) {
    let value;
    if (kind === "heading") value = istep(rnd, 5, 355, 5);
    else if (kind === "altitude") value = istep(rnd, 2000, 9000, 100);
    else if (kind === "speed") value = istep(rnd, 210, 400, 10);
    else value = pick(rnd, WAYPOINTS);
    // Keyed on the RENDERED string, not the raw value: two options a student
    // cannot tell apart on screen are the same option, whatever the types say.
    const key = clearanceText(kind, value);
    if (!used.has(key)) { used.add(key); return value; }
  }
  return null;
}

// ── Building a run ─────────────────────────────────────────────────────────

/**
 * Deterministic schedule for one run. Same seed -> the same three minutes,
 * so a disputed score can be replayed exactly.
 */
export function buildRun(seed, durationSec = 900, loadScale = 1) {
  if (!Number.isInteger(seed)) throw new RangeError("run needs an integer seed");
  if (!(durationSec >= 30)) throw new RangeError("a divided-attention run needs at least 30 seconds");
  if (!(loadScale > 0)) throw new RangeError("loadScale must be positive");

  // Difficulty acts on ARRIVAL RATE and RESPONSE WINDOW, never on the scoring.
  // A harder setting sends events closer together and allows less time for
  // each; it does not move a single cut on the ladder. That keeps "what counts
  // as good" fixed while what you are asked to do gets harder, which is the
  // only version of a difficulty setting that does not quietly rewrite the
  // meaning of the score. See DIFFICULTY in session.mjs for why no multiplier
  // is applied to the result.
  const gapLoad = 1 / loadScale;
  const windowLoad = 1 / Math.sqrt(loadScale);

  const rnd = makeRng(seed);
  const phaseAt = (t) => PHASES[phaseIndexAt(t, durationSec)];

  // Bump the gauge seed until the needle actually gives the student something
  // to monitor. Deterministic, so the same session seed always lands on the
  // same gauge — and the component draws from `gaugeSeed`, never from `seed`.
  let gaugeSeed = seed;
  let monitor = redWindows(gaugeSeed, durationSec);
  for (let bump = 1; monitor.length < MIN_EXCURSIONS && bump <= 64; bump++) {
    gaugeSeed = (seed ^ Math.imul(bump, 0x9E3779B1)) >>> 0;
    monitor = redWindows(gaugeSeed, durationSec);
  }

  // Radio calls, spaced so two never overlap their response windows. Both the
  // spacing and the window carried on each call tighten as the phases climb —
  // and the window is stored ON THE EVENT rather than read from a constant at
  // scoring time, so a run always scores against the windows the student was
  // actually shown, even if these figures are later retuned.
  //
  // A call that is yours also carries a clearance to copy. The kind is CYCLED
  // rather than rolled: a run that happened to issue nine headings and no
  // altitude could not be asked an altitude question afterwards, and a recall
  // quiz whose contents depend on the luck of the seed is not a quiz, it is a
  // lottery. Cycling guarantees every kind appears once own-calls reach four.
  const radio = [];
  const usedClearances = new Set();
  const kindCount = new Map(CLEARANCE_KINDS.map((k) => [k, 0]));
  let mineSoFar = 0;
  let t = 6;
  while (t < durationSec - 4) {
    const phase = phaseAt(t);
    const mine = rnd() < 0.45;
    const call = {
      t,
      mine,
      id: `r${radio.length}`,
      phase: phase.key,
      window: WINDOW_SEC.radio * phase.windowScale * windowLoad,
      clearance: null,
    };
    if (mine) {
      const kind = CLEARANCE_KINDS[mineSoFar % CLEARANCE_KINDS.length];
      const value = freshClearanceValue(rnd, kind, usedClearances);
      // Null only if the pool for that kind is exhausted, which needs a very
      // long run. The call still stands as a radio event; it just carries
      // nothing to remember, and the recall builder skips what does not exist.
      if (value !== null) {
        call.clearance = {
          kind,
          value,
          text: clearanceText(kind, value),
          /** Which heading/altitude/speed/waypoint this was, 1-based — for ordinal questions. */
          ordinal: kindCount.get(kind) + 1,
        };
        kindCount.set(kind, kindCount.get(kind) + 1);
      }
      mineSoFar++;
    }
    radio.push(call);
    t += (7 + rnd() * 9) * phase.gapScale * gapLoad;
  }

  // Arithmetic interruptions, on their own cadence and their own escalation.
  const arithmetic = [];
  t = 12;
  while (t < durationSec - WINDOW_SEC.arithmetic) {
    const phase = phaseAt(t);
    arithmetic.push({
      t,
      ...quickItem(rnd, `a${arithmetic.length}`, arithmetic.length),
      phase: phase.key,
      window: WINDOW_SEC.arithmetic * phase.windowScale * windowLoad,
    });
    t += (15 + rnd() * 11) * phase.gapScale * gapLoad;
  }

  // The continuous stream. Its own seed so the aeroplane's behaviour is
  // independent of when the gauge happened to settle, and so a disputed run can
  // be replayed exactly like every other part of this module.
  const trackingSeed = (seed ^ 0x5bf03635) >>> 0;

  const sightings = buildSightings(rnd, durationSec, phaseAt, gapLoad, windowLoad);

  const run = {
    seed,
    loadScale,
    sightings,
    gaugeSeed,
    trackingSeed,
    durationSec,
    monitor,
    radio,
    arithmetic,
    tracking: {
      seed: trackingSeed,
      sampleHz: SAMPLE_HZ,
      /** Disturbance multiplier by phase — the aeroplane gets harder to hold. */
      gain: TRACKING_GAIN,
    },
    phases: phaseWindows(durationSec),
  };

  // Built from the finished schedule, because the questions are about what the
  // schedule actually issued. Empty on a run too short to have issued anything.
  run.recall = buildRecall(run);
  return run;
}

// ── The traffic-sighting stream ────────────────────────────────────────────
//
// Added 2026-08-16, from ADAPT_SKYTEST_VIDEO_TEARDOWN.md §1.2. The competitor's
// third live subtask is REPORTING: something appears in the outside view and
// you press the button that names it, before it goes past. Their report scores
// it as its own section with correct and missed split per target type.
//
// It is a different skill from the gauge. The gauge is VIGILANCE — one known
// place, watched for a change. This is VISUAL SEARCH — an unknown place,
// scanned for a target while your hands are busy, which is the lookout a pilot
// actually does and the one thing this module had no analogue for.
//
// SCORED AS ITS OWN SECTION, NOT FOLDED INTO THE COMPOSITE. That is not a
// dodge, it is what the real report does — its sections are listed separately
// and never averaged into one figure. It also protects the promise made when
// recall was added: `composite` keeps meaning what it meant, so results already
// stored for real students stay comparable with results earned tomorrow.
//
// Two target types, because a lookout that only has to spot ONE thing is a
// reaction test. Telling traffic from a landmark is the discrimination.

/** What can appear in the outside view, and which button reports it. */
export const SIGHTING_TYPES = ["traffic", "landmark"];

/** How long a sighting stays in view before it is gone. Tightens with the phases. */
export const SIGHTING_VISIBLE_SEC = 6;

/**
 * Sightings for a run: type, when it appears, how long it stays.
 *
 * Spaced so two are never in view at once. A student who can see two targets
 * simultaneously can report them in either order, and "which one did you mean"
 * is not a question this scoring can answer — so the schedule prevents it
 * rather than the scorer guessing.
 */
function buildSightings(rnd, durationSec, phaseAt, gapLoad, windowLoad) {
  const sightings = [];
  let t = 18;
  while (t < durationSec - SIGHTING_VISIBLE_SEC) {
    const phase = phaseAt(t);
    const visible = SIGHTING_VISIBLE_SEC * phase.windowScale * windowLoad;
    sightings.push({
      id: `s${sightings.length}`,
      t,
      type: rnd() < 0.5 ? "traffic" : "landmark",
      phase: phase.key,
      visible,
      /** Where it appears across the view, 0-1. The component draws it here. */
      x: 0.1 + rnd() * 0.8,
      y: 0.15 + rnd() * 0.45,
    });
    // The gap is never allowed to close below the time the previous target is
    // in view, so two can never overlap however hard the run escalates.
    t += Math.max(visible + 2, (22 + rnd() * 16) * phase.gapScale * gapLoad);
  }
  return sightings;
}

/**
 * Score the lookout.
 *
 * A report is credited to the sighting in view when the button was pressed, and
 * only if the button MATCHES the target. Pressing the wrong button with a
 * target in view is a misidentification — calling traffic a landmark — which is
 * a worse error than saying nothing, and is counted separately from pressing
 * with nothing in view at all.
 */
export function scoreSightings(sightings, reports) {
  if (!Array.isArray(sightings) || sightings.length === 0) return null;
  const credited = new Set();
  let misidentified = 0;
  let falseReports = 0;

  for (const r of reports ?? []) {
    if (!r || !Number.isFinite(r.t) || !SIGHTING_TYPES.includes(r.type)) continue;
    const seen = sightings.find((sg) => r.t >= sg.t && r.t <= sg.t + sg.visible);
    if (!seen) { falseReports++; continue; }
    if (seen.type !== r.type) { misidentified++; continue; }
    credited.add(seen.id);
  }

  const byType = {};
  for (const type of SIGHTING_TYPES) {
    const all = sightings.filter((sg) => sg.type === type);
    const hits = all.filter((sg) => credited.has(sg.id)).length;
    byType[type] = {
      total: all.length,
      correct: hits,
      missed: all.length - hits,
      accuracy: all.length === 0 ? null : hits / all.length,
    };
  }

  const total = sightings.length;
  const correct = credited.size;
  return {
    total,
    correct,
    missed: total - correct,
    misidentified,
    falseReports,
    byType,
    // Half a mark off per wrong call, the same rule the gauge and the radio use,
    // so a student who spams both buttons cannot out-score one who looks.
    accuracy: clamp((correct - (misidentified + falseReports) * 0.5) / total, 0, 1),
  };
}

// ── The recall quiz ────────────────────────────────────────────────────────
//
// Asked AFTER the clock stops, about clearances issued minutes earlier while
// the student was flying, watching a gauge and answering sums. Nothing is
// re-shown. This is the section the module was missing entirely.
//
// It is scored and reported, and it is deliberately NOT folded into
// `composite`. Two reasons, both load-bearing:
//
//   1. The composite means one specific thing — how evenly a student serviced
//      CONCURRENT streams, with a penalty for letting one go. Recall is
//      sequential, after the fact, and cannot be fixated on at another
//      stream's expense. Averaging it in would quietly change what the number
//      measures while leaving its name and its published cut ladder alone.
//   2. Results are already stored for real students against DIVIDED_NORM.
//      Silently shifting the composite would make every earlier sitting
//      incomparable with every later one, and a student's own history is the
//      main thing this module gives them.
//
// It is reported beside the composite instead. If it is ever to be blended,
// that is a deliberate versioned change to the norm, not a side effect.

/** How many questions the debrief asks, when the run is long enough to support them. */
export const RECALL_COUNT = 5;

const KIND_NOUN = { heading: "heading", altitude: "altitude", speed: "speed", waypoint: "waypoint" };

/** Deal `n` options containing exactly one correct string, shuffled. Returns null if it cannot. */
function makeOptions(rnd, correct, wrongPool, n = 4) {
  const seen = new Set([correct]);
  const wrong = [];
  for (const w of wrongPool) {
    if (seen.has(w)) continue;
    seen.add(w);
    wrong.push(w);
    if (wrong.length === n - 1) break;
  }
  if (wrong.length < n - 1) return null;
  const options = shuffle(rnd, [correct, ...wrong]);
  return { options, answerIndex: options.indexOf(correct) };
}

/**
 * Build the debrief quiz for a completed run.
 *
 * Deterministic from the run's seed, so the same run always asks the same
 * questions and a disputed score can be replayed. Returns fewer than
 * RECALL_COUNT — possibly none — when the run was too short to have issued
 * enough clearances to ask about. A short run must produce a short quiz, never
 * an invented one.
 */
export function buildRecall(run, count = RECALL_COUNT) {
  const rnd = makeRng(subSeed(run.seed, "recall"));
  const mine = run.radio.filter((c) => c.mine);
  const withClearance = mine.filter((c) => c.clearance);
  const byKind = new Map(CLEARANCE_KINDS.map((k) => [k, withClearance.filter((c) => c.clearance.kind === k)]));

  const candidates = [];

  // 1. "Which of these was an altitude you were assigned?" — one that was
  //    issued, against three that were not. Distractors are generated the same
  //    way real values are and checked against every value the run used, so a
  //    distractor can never quietly also be a correct answer.
  for (const kind of CLEARANCE_KINDS) {
    const calls = byKind.get(kind);
    if (calls.length === 0) continue;
    const target = pick(rnd, calls).clearance;
    const used = new Set(withClearance.map((c) => c.clearance.text));
    const pool = [];
    const taken = new Set(used);
    for (let i = 0; i < 60 && pool.length < 3; i++) {
      const v = freshClearanceValue(rnd, kind, taken);
      if (v !== null) pool.push(clearanceText(kind, v));
    }
    const opt = makeOptions(rnd, target.text, pool);
    if (!opt) continue;
    candidates.push({
      id: `k-${kind}`,
      kind: `assigned-${kind}`,
      stem: `Which of these was ${kind === "altitude" ? "an" : "a"} ${KIND_NOUN[kind]} ATC assigned you?`,
      ...opt,
    });
  }

  // 2. "Which was your second waypoint?" — the strongest question in the set,
  //    because the distractors are the OTHER waypoints the run really used.
  //    Recognising the word is not enough; the order has to have been kept.
  const waypoints = byKind.get("waypoint");
  if (waypoints.length >= 2) {
    const ordinals = ["first", "second", "third", "fourth", "fifth"];
    const idx = irange(rnd, 0, Math.min(waypoints.length, ordinals.length) - 1);
    const target = waypoints[idx].clearance;
    const others = waypoints.filter((c) => c.clearance.text !== target.text).map((c) => c.clearance.text);
    const pool = [...shuffle(rnd, others)];
    const taken = new Set(withClearance.map((c) => c.clearance.text));
    for (let i = 0; i < 40 && pool.length < 3; i++) {
      const v = freshClearanceValue(rnd, "waypoint", taken);
      if (v !== null) pool.push(clearanceText("waypoint", v));
    }
    const opt = makeOptions(rnd, target.text, pool);
    if (opt) {
      candidates.push({
        id: "wp-order",
        kind: "waypoint-order",
        stem: `Which was your ${ordinals[idx]} waypoint?`,
        ...opt,
      });
    }
  }

  // 3. "How many calls were for you?" — always answerable, and it is the one
  //    question that can be got right by counting as you go rather than by
  //    remembering, which is a legitimate strategy and worth rewarding.
  if (mine.length > 0) {
    const truth = String(mine.length);
    const pool = shuffle(rnd, [-3, -2, -1, 1, 2, 3])
      .map((d) => mine.length + d)
      .filter((v) => v > 0)
      .map(String);
    const opt = makeOptions(rnd, truth, pool);
    if (opt) {
      candidates.push({
        id: "own-calls",
        kind: "own-call-count",
        stem: "How many calls on the frequency were for you?",
        ...opt,
      });
    }
  }

  return shuffle(rnd, candidates).slice(0, count);
}

/**
 * Mark the debrief. Unanswered counts as wrong — there is no negative marking
 * anywhere in this battery, so a guess must always beat a blank.
 *
 * Returns null when the run asked nothing, which is not the same as zero.
 */
export function scoreRecall(items, answers = []) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const byId = new Map(answers.filter((a) => a && a.id != null).map((a) => [a.id, a]));
  let correct = 0;
  let unanswered = 0;
  for (const item of items) {
    const got = byId.get(item.id);
    if (!got || !Number.isInteger(got.chosen)) { unanswered++; continue; }
    if (got.chosen === item.answerIndex) correct++;
  }
  return {
    correct,
    total: items.length,
    wrong: Math.max(0, items.length - correct - unanswered),
    unanswered,
    accuracy: correct / items.length,
  };
}

// ── Response time ──────────────────────────────────────────────────────────
//
// Added 2026-08-16. The competitor's report prints a latency line beside its
// accuracy ("Response time: 2.7 s / 100.0 %") and we measured none.
//
// Two deliberate differences from theirs:
//
//   1. Reported ONLY for correct responses. The time taken to get something
//      wrong is not a speed measurement, and a student who answers instantly
//      and badly must never out-score one who thinks and is right.
//   2. The percentage beside it is the fraction of the window ACTUALLY
//      AVAILABLE, not a rank against a population. We have no measured
//      population and will not invent one — but "you used 45% of the time you
//      had" is meaningful on its own, and it stays meaningful as the windows
//      tighten phase by phase, which a raw second count does not.
//
// The MEDIAN, not the mean: one call answered late because the aeroplane was
// diverging should not drag a whole run's figure, and with a few dozen events
// a single outlier moves a mean a long way.
//
// None of this touches accuracy or the composite. It is reported beside them.

/** Middle value of a sorted copy. Null on an empty list — never a zero. */
export function median(values) {
  if (!values.length) return null;
  const v = [...values].sort((a, b) => a - b);
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

/**
 * Median latency of correct responses, and the median share of the window it
 * used. `samples` is a list of { latency, window }.
 */
function latencyReport(samples) {
  const usable = samples.filter((s) => Number.isFinite(s.latency) && s.latency >= 0 && s.window > 0);
  if (!usable.length) return null;
  return {
    medianSec: median(usable.map((s) => s.latency)),
    medianWindowUsed: median(usable.map((s) => Math.min(1, s.latency / s.window))),
    n: usable.length,
  };
}

// ── Scoring ────────────────────────────────────────────────────────────────

/**
 * Accuracy of one stream inside one phase, from that stream's own events.
 *
 * Returns null when the phase contained no events for the stream — which is a
 * real possibility on a short run and must not be reported as a zero. A phase
 * where nothing happened is not a phase you failed.
 */
function streamAccuracy(events, phaseIndex, penalties = 0) {
  const inPhase = events.filter((e) => e.phase === phaseIndex);
  if (inPhase.length === 0) return null;
  const hits = inPhase.filter((e) => e.hit).length;
  return clamp((hits - penalties * 0.5) / inPhase.length, 0, 1);
}

/**
 * The per-phase breakdown: how each stream held up as the workload climbed.
 *
 * This is the module's most useful output. A single composite says "you scored
 * 61"; the breakdown says "you were at 84 while it was quiet, held 71 as it
 * built, and lost the gauge entirely once it saturated" — which names both the
 * limit and the stream that gave way first.
 */
function scorePhases(run, { monitorEvents, radioEvents, arithmeticEvents, monitorFalseByPhase, radioWrongByPhase }) {
  return phaseWindows(run.durationSec).map((w, i) => {
    const accuracies = {
      monitor: streamAccuracy(monitorEvents, i, monitorFalseByPhase[i]),
      radio: streamAccuracy(radioEvents, i, radioWrongByPhase[i]),
      arithmetic: streamAccuracy(arithmeticEvents, i),
    };
    const present = Object.values(accuracies).filter((v) => v !== null);
    if (present.length === 0) {
      return { ...w, accuracies, composite: null, weakest: null };
    }
    const mean = present.reduce((s, v) => s + v, 0) / present.length;
    const spread = Math.max(...present) - Math.min(...present);
    return {
      ...w,
      accuracies,
      composite: clamp((mean - FIXATION_WEIGHT * spread) * 100, 0, 100),
      weakest: present.length < 2 || spread === 0
        ? null
        : Object.entries(accuracies).filter(([, v]) => v !== null).sort((a, b) => a[1] - b[1])[0][0],
    };
  });
}

/** How far a phase composite must fall below the best so far to count as a collapse. */
export const COLLAPSE_DROP = 10;

function collapseFrom(phases) {
  let best = null;
  for (const p of phases) {
    if (p.composite === null) continue;
    if (best !== null && best - p.composite >= COLLAPSE_DROP) return p.key;
    best = best === null ? p.composite : Math.max(best, p.composite);
  }
  return null;
}

/**
 * Score a completed run.
 *
 * `responses` is a flat list of what the student actually did:
 *   { stream: "monitor",    t }                  acknowledged the gauge
 *   { stream: "radio",      t }                  keyed the mic
 *   { stream: "arithmetic", id, chosen }         answered a sum
 */
export function scoreRun(run, responses = []) {
  const acks = responses.filter((r) => r.stream === "monitor" && Number.isFinite(r.t));
  const keys = responses.filter((r) => r.stream === "radio" && Number.isFinite(r.t));
  const sums = responses.filter((r) => r.stream === "arithmetic");
  const phaseOf = (t) => phaseIndexAt(t, run.durationSec);

  // Per-event outcomes are recorded WITH the phase they happened in, so the
  // overall figures and the per-phase breakdown are computed from exactly the
  // same events. Deriving one from the other by re-scanning would let the two
  // disagree, and a breakdown that does not add up to its own total is worse
  // than no breakdown at all.

  // MONITOR — one acknowledgement per red window counts; extra presses while
  // already acknowledged are neither rewarded nor punished, but a press with
  // the needle safe is a false alarm.
  const hitWindows = new Set();
  const monitorFalseByPhase = PHASES.map(() => 0);
  let monitorFalse = 0;
  for (const a of acks) {
    const w = run.monitor.findIndex((win) => a.t >= win.start && a.t <= win.end);
    if (w >= 0) hitWindows.add(w);
    else { monitorFalse++; monitorFalseByPhase[phaseOf(a.t)]++; }
  }
  const monitorEvents = run.monitor.map((win, i) => ({ phase: phaseOf(win.start), hit: hitWindows.has(i) }));
  const monitorHits = hitWindows.size;
  const monitorMisses = run.monitor.length - monitorHits;
  const monitorAcc = run.monitor.length === 0
    ? null
    : clamp((monitorHits - monitorFalse * 0.5) / run.monitor.length, 0, 1);

  // RADIO — acknowledge yours, ignore theirs. A key inside another aircraft's
  // window is a real error: you have just transmitted over someone else.
  //
  // The window comes off the CALL, not off the constant — the calls late in a
  // run were shown with a shorter window than the ones at the start, and must
  // be marked against the window the student actually had.
  const mine = run.radio.filter((c) => c.mine);
  const theirs = run.radio.filter((c) => !c.mine);
  const answered = new Set();
  const radioLatency = [];
  const radioWrongByPhase = PHASES.map(() => 0);
  let radioWrong = 0;
  for (const k of keys) {
    const call = run.radio.find((c) => k.t >= c.t && k.t <= c.t + (c.window ?? WINDOW_SEC.radio));
    if (!call) { radioWrong++; radioWrongByPhase[phaseOf(k.t)]++; continue; }
    if (call.mine) {
      // First acknowledgement only: a student who keys twice has not responded
      // faster, and counting the second press would reward hammering the key.
      if (!answered.has(call.id)) radioLatency.push({ latency: k.t - call.t, window: call.window ?? WINDOW_SEC.radio });
      answered.add(call.id);
    } else { radioWrong++; radioWrongByPhase[phaseOf(k.t)]++; }
  }
  const radioEvents = mine.map((c) => ({ phase: phaseOf(c.t), hit: answered.has(c.id) }));
  const radioHits = answered.size;
  const radioAcc = mine.length === 0
    ? null
    : clamp((radioHits - radioWrong * 0.5) / mine.length, 0, 1);

  // ARITHMETIC — unanswered counts as wrong; there is no negative marking, so
  // a guess is always better than a blank.
  const byId = new Map(sums.map((s) => [s.id, s]));
  const arithmeticEvents = [];
  let arithmeticCorrect = 0;
  let arithmeticBlank = 0;
  const arithmeticLatency = [];
  for (const item of run.arithmetic) {
    const got = byId.get(item.id);
    const blank = !got || !Number.isInteger(got.chosen);
    const correct = !blank && got.chosen === item.answerIndex;
    if (blank) arithmeticBlank++;
    if (correct) {
      arithmeticCorrect++;
      if (Number.isFinite(got.t)) {
        arithmeticLatency.push({ latency: got.t - item.t, window: item.window ?? WINDOW_SEC.arithmetic });
      }
    }
    arithmeticEvents.push({ phase: phaseOf(item.t), hit: correct });
  }
  const arithmeticAcc = run.arithmetic.length === 0
    ? null
    : arithmeticCorrect / run.arithmetic.length;

  // TRACKING — the continuous stream. The component reports the raw error it
  // accumulated; the BASELINE is computed here from the run's own seed, never
  // taken from the client. A score the browser could hand us is a score a
  // browser could invent.
  const trk = responses.find((r) => r.stream === "tracking" && Number.isFinite(r.rmse));
  let trackingAcc = null;
  let trackingDetail = null;
  if (trk && run.tracking) {
    // Gain-aware: the disturbance is amplified as the phases climb, so the
    // do-nothing baseline must be computed against the SAME amplified
    // disturbance the student actually flew.
    const baseline = passiveRmseGained(run.tracking.seed, run.durationSec, run.tracking.sampleHz ?? SAMPLE_HZ);
    const cancellation = cancellationPercent(trk.rmse, baseline);
    if (cancellation != null) {
      trackingAcc = clamp(cancellation / 100, 0, 1);
      const expected = run.durationSec * (run.tracking.sampleHz ?? SAMPLE_HZ);
      trackingDetail = {
        rmse: trk.rmse,
        baseline,
        cancellation,
        samples: trk.samples ?? null,
        inputClass: trk.inputClass ?? null,
        // Flagged, not silently scored: a run flown for ten seconds and then
        // abandoned would otherwise look like a poor pilot rather than an
        // unflown stream.
        incomplete: Number.isFinite(trk.samples) ? trk.samples < expected * 0.75 : null,
      };
    }
  }

  // SIGHTINGS — the lookout. Its own section, like the debrief and for the same
  // reason: `composite` must keep meaning what it meant when the results
  // already in the database were written.
  const sightings = scoreSightings(run.sightings ?? [], responses.filter((r) => r.stream === "sighting"));

  // RECALL — the debrief. Marked here so one call scores a whole sitting, but
  // held OUT of `accuracies` on purpose: see the note above buildRecall. It is
  // reported beside the composite, never inside it.
  const recall = scoreRecall(run.recall ?? [], responses.filter((r) => r.stream === "recall"));

  const accuracies = { tracking: trackingAcc, monitor: monitorAcc, radio: radioAcc, arithmetic: arithmeticAcc };
  const present = Object.values(accuracies).filter((v) => v !== null);
  if (present.length === 0) return null;

  const mean = present.reduce((s, v) => s + v, 0) / present.length;
  const spread = Math.max(...present) - Math.min(...present);
  const composite = clamp((mean - FIXATION_WEIGHT * spread) * 100, 0, 100);

  const phases = scorePhases(run, { monitorEvents, radioEvents, arithmeticEvents, monitorFalseByPhase, radioWrongByPhase });

  return {
    tracking: trackingDetail,
    phases,
    /**
     * Where it fell apart: the first phase whose composite drops a clear step
     * below the best phase so far. Null when the student held the standard all
     * the way through, which is the answer we want them to be chasing.
     *
     * Ten points, because a smaller step is inside the noise of a run this
     * length and telling someone they "collapsed" on a four-point wobble would
     * be coaching them against randomness.
     */
    collapsePhase: collapseFrom(phases),
    monitor: { hits: monitorHits, total: run.monitor.length, misses: monitorMisses, falseAlarms: monitorFalse, accuracy: monitorAcc },
    // MISSED and WRONG are named separately everywhere in this report, because
    // they are different failures with different fixes: a student who MISSES is
    // saturated and needs to shed load, a student who is WRONG had the capacity
    // and got it wrong. Collapsing both into "accuracy" tells them neither.
    radio: {
      hits: radioHits,
      total: mine.length,
      missed: Math.max(0, mine.length - radioHits),
      othersOnFrequency: theirs.length,
      wrongKeys: radioWrong,
      accuracy: radioAcc,
    },
    arithmetic: {
      correct: arithmeticCorrect,
      total: run.arithmetic.length,
      /** Answered, and answered wrongly — as distinct from never reached. */
      wrong: Math.max(0, run.arithmetic.length - arithmeticCorrect - arithmeticBlank),
      unanswered: arithmeticBlank,
      accuracy: arithmeticAcc,
    },
    /**
     * The debrief: what you retained of clearances issued while you were busy.
     * Null when the run was too short to ask anything — which is not a zero.
     * Aggregate only; the questions and the student's picks never leave the
     * device, same rule as every other item in this battery.
     */
    /**
     * The lookout: traffic and landmarks spotted while flying. Null when the
     * run scheduled none. Reported beside the composite, never inside it.
     */
    sightings,
    recall,
    /**
     * How fast the correct answers came, and how much of the available window
     * they used. Null per stream when nothing correct was timed — which is not
     * a zero, and must never be printed as "0.0 s".
     *
     * Reported beside accuracy, never inside it: speed is not a substitute for
     * being right and this battery does not trade one for the other.
     */
    responseTime: {
      radio: latencyReport(radioLatency),
      interruptions: latencyReport(arithmeticLatency),
    },
    mean: mean * 100,
    spread: spread * 100,
    fixationPenalty: FIXATION_WEIGHT * spread * 100,
    composite,
    /**
     * The stream the student let go — what to tell them to train first.
     * Null when every stream scored the same: telling someone who serviced all
     * three perfectly that one of them was their "weakest" is noise dressed up
     * as coaching.
     */
    weakest: present.length < 2 || spread === 0 ? null : Object.entries(accuracies)
      .filter(([, v]) => v !== null)
      .sort((a, b) => a[1] - b[1])[0][0],
  };
}

/**
 * Criterion cut table for the divided-attention composite, stanines 2-9.
 *
 * PROVISIONAL and stated as such, like every other ladder here. Anchored to
 * what the number means rather than to a population we have not measured:
 * servicing all three streams reliably is genuinely hard, so the ladder is
 * gentler than the single-task modules. Replaced by measured norms once there
 * are enough attempts, and those must be a frozen snapshot.
 */
export const DIVIDED_NORM = {
  mode: "criterion",
  direction: "higher-better",
  cuts: [15, 28, 38, 48, 58, 68, 78, 88],
  rationale:
    "Standards-based on a composite of all three streams, with a penalty for letting one go. Provisional until measured norms exist.",
};
