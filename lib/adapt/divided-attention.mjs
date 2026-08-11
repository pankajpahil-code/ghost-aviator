// ADAPT — Divided Attention: three tasks at once, for three minutes.
//
// The hardest module to build and the one that matters most. Screening
// batteries lean on divided attention because a flight deck is exactly this:
// something to monitor, a radio you must listen to without staring at it, and a
// sum someone wants answered while both are still running.
//
// Everything here is pure — the schedule, the gauge, the scoring. The component
// plays sounds and draws needles; it owns no arithmetic.
//
// ── The three streams ──────────────────────────────────────────────────────
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

import { makeRng, irange, istep, pick } from "./rng.mjs";

export const STREAMS = ["monitor", "radio", "arithmetic"];

/** How long a student has to respond, per stream, at the opening workload. */
export const WINDOW_SEC = { radio: 3.5, arithmetic: 6 };

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

// ── Quick mental arithmetic ────────────────────────────────────────────────
//
// Deliberately NOT the Aviation Maths generators: those are 30-second problems.
// Under a six-second interruption the sum has to be genuinely quick, or the
// module stops measuring attention and starts measuring arithmetic again.

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
  const cells = [answer, ...dis];
  // Fisher-Yates so the answer is not always first.
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [cells[i], cells[j]] = [cells[j], cells[i]];
  }
  return { id, stem, options: cells.map(String), answerIndex: cells.indexOf(answer), answer };
}

// ── Building a run ─────────────────────────────────────────────────────────

/**
 * Deterministic schedule for one run. Same seed -> the same three minutes,
 * so a disputed score can be replayed exactly.
 */
export function buildRun(seed, durationSec = 900) {
  if (!Number.isInteger(seed)) throw new RangeError("run needs an integer seed");
  if (!(durationSec >= 30)) throw new RangeError("a divided-attention run needs at least 30 seconds");

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
  const radio = [];
  let t = 6;
  while (t < durationSec - 4) {
    const phase = phaseAt(t);
    radio.push({
      t,
      mine: rnd() < 0.45,
      id: `r${radio.length}`,
      phase: phase.key,
      window: WINDOW_SEC.radio * phase.windowScale,
    });
    t += (7 + rnd() * 9) * phase.gapScale;
  }

  // Arithmetic interruptions, on their own cadence and their own escalation.
  const arithmetic = [];
  t = 12;
  while (t < durationSec - WINDOW_SEC.arithmetic) {
    const phase = phaseAt(t);
    arithmetic.push({
      t,
      ...quickSum(rnd, `a${arithmetic.length}`),
      phase: phase.key,
      window: WINDOW_SEC.arithmetic * phase.windowScale,
    });
    t += (15 + rnd() * 11) * phase.gapScale;
  }

  return { seed, gaugeSeed, durationSec, monitor, radio, arithmetic, phases: phaseWindows(durationSec) };
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
  const radioWrongByPhase = PHASES.map(() => 0);
  let radioWrong = 0;
  for (const k of keys) {
    const call = run.radio.find((c) => k.t >= c.t && k.t <= c.t + (c.window ?? WINDOW_SEC.radio));
    if (!call) { radioWrong++; radioWrongByPhase[phaseOf(k.t)]++; continue; }
    if (call.mine) answered.add(call.id);
    else { radioWrong++; radioWrongByPhase[phaseOf(k.t)]++; }
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
  for (const item of run.arithmetic) {
    const got = byId.get(item.id);
    const blank = !got || !Number.isInteger(got.chosen);
    const correct = !blank && got.chosen === item.answerIndex;
    if (blank) arithmeticBlank++;
    if (correct) arithmeticCorrect++;
    arithmeticEvents.push({ phase: phaseOf(item.t), hit: correct });
  }
  const arithmeticAcc = run.arithmetic.length === 0
    ? null
    : arithmeticCorrect / run.arithmetic.length;

  const accuracies = { monitor: monitorAcc, radio: radioAcc, arithmetic: arithmeticAcc };
  const present = Object.values(accuracies).filter((v) => v !== null);
  if (present.length === 0) return null;

  const mean = present.reduce((s, v) => s + v, 0) / present.length;
  const spread = Math.max(...present) - Math.min(...present);
  const composite = clamp((mean - FIXATION_WEIGHT * spread) * 100, 0, 100);

  const phases = scorePhases(run, { monitorEvents, radioEvents, arithmeticEvents, monitorFalseByPhase, radioWrongByPhase });

  return {
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
    radio: { hits: radioHits, total: mine.length, othersOnFrequency: theirs.length, wrongKeys: radioWrong, accuracy: radioAcc },
    arithmetic: { correct: arithmeticCorrect, total: run.arithmetic.length, unanswered: arithmeticBlank, accuracy: arithmeticAcc },
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
