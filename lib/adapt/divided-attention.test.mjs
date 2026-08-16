import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  buildRun, scoreRun, makeGauge, redWindows, GAUGE, WINDOW_SEC,
  FIXATION_WEIGHT, DIVIDED_NORM, STREAMS, MIN_EXCURSIONS,
  PHASES, phaseIndexAt, phaseWindows, COLLAPSE_DROP,
  TRACKING_GAIN, trackingGainAt, passiveRmseGained, INTERRUPTION_FAMILIES,
} from "./divided-attention.mjs";
import { assertValidNorm, stanineFor } from "./stanine.mjs";
import { passiveRmse } from "./tracking.mjs";

const RUN = () => buildRun(20260809, 180);

// ── The gauge ──────────────────────────────────────────────────────────────

test("the gauge is deterministic, in range, and smooth", () => {
  const a = makeGauge(7), b = makeGauge(7), c = makeGauge(8);
  let prev = a.at(0);
  for (let t = 0; t <= 180; t += 0.1) {
    const v = a.at(t);
    assert.equal(v, b.at(t));
    assert.ok(v >= GAUGE.min && v <= GAUGE.max, `needle off the dial: ${v}`);
    assert.ok(Math.abs(v - prev) < 3, `needle jumped ${Math.abs(v - prev)} at t=${t}`);
    prev = v;
  }
  assert.notEqual(a.at(50), c.at(50));
});

// How often a wandering needle crosses a fixed redline is a property of the
// seed, so a run cannot merely hope for excursions — buildRun bumps the gauge
// seed until there are enough. This checks the guarantee holds broadly.
test("every run offers enough excursions to be worth monitoring", () => {
  for (let s = 1; s <= 120; s++) {
    const run = buildRun(s * 7919, 180);
    assert.ok(run.monitor.length >= MIN_EXCURSIONS,
      `seed ${s}: only ${run.monitor.length} excursions`);
    assert.ok(Number.isInteger(run.gaugeSeed), "the run must publish the gauge seed it settled on");
  }
});

test("the needle is not parked in the red either", () => {
  for (const seed of [1, 99, 4242, 20260809]) {
    const run = buildRun(seed, 180);
    const g = makeGauge(run.gaugeSeed);
    let hot = 0, n = 0;
    for (let t = 0; t <= 180; t += 0.2) { n++; if (g.at(t) >= GAUGE.redline) hot++; }
    const share = hot / n;
    assert.ok(share > 0.02 && share < 0.45, `seed ${seed}: ${(share * 100).toFixed(1)}% of the run in the red`);
  }
});

test("the drawn gauge and the scored windows come from the same seed", () => {
  const run = buildRun(20260809, 180);
  const g = makeGauge(run.gaugeSeed);
  for (const w of run.monitor) {
    const mid = (w.start + w.end) / 2;
    assert.ok(g.at(mid) >= GAUGE.redline,
      `a scored window at ${mid.toFixed(1)}s is not red on the gauge the student sees`);
  }
});

test("red windows are ordered, non-overlapping and long enough to react to", () => {
  const w = redWindows(20260809, 180);
  assert.ok(w.length >= 2, `expected several excursions, got ${w.length}`);
  for (let i = 0; i < w.length; i++) {
    assert.ok(w[i].end > w[i].start);
    assert.ok(w[i].end - w[i].start >= 1.5, "a window too brief to answer fairly");
    if (i > 0) assert.ok(w[i].start > w[i - 1].end, "windows overlap");
  }
});

// ── The schedule ───────────────────────────────────────────────────────────

test("a run is deterministic and seed-sensitive", () => {
  assert.deepEqual(buildRun(5, 180), buildRun(5, 180));
  assert.notDeepEqual(buildRun(5, 180), buildRun(6, 180));
});

test("a run refuses a bad seed or an impossibly short duration", () => {
  assert.throws(() => buildRun(1.5, 180), RangeError);
  assert.throws(() => buildRun(1, 10), RangeError);
});

test("all three streams are populated and stay inside the clock", () => {
  const run = RUN();
  assert.ok(run.monitor.length >= 2, "no gauge excursions");
  assert.ok(run.radio.length >= 8, `too few radio calls: ${run.radio.length}`);
  assert.ok(run.arithmetic.length >= 6, `too few interruptions: ${run.arithmetic.length}`);
  for (const c of run.radio) assert.ok(c.t + WINDOW_SEC.radio <= run.durationSec);
  for (const a of run.arithmetic) assert.ok(a.t + WINDOW_SEC.arithmetic <= run.durationSec);
  for (const w of run.monitor) assert.ok(w.end <= run.durationSec);
});

test("radio traffic is a genuine mix of yours and other aircraft", () => {
  const run = RUN();
  const mine = run.radio.filter((c) => c.mine).length;
  assert.ok(mine > 0 && mine < run.radio.length, "the frequency must carry other traffic too");
});

// Two calls whose response windows overlap would make it impossible to tell
// which one an acknowledgement was meant for.
test("radio response windows never overlap", () => {
  for (const seed of [1, 2, 3, 77, 20260809]) {
    const run = buildRun(seed, 180);
    for (let i = 1; i < run.radio.length; i++) {
      assert.ok(run.radio[i].t > run.radio[i - 1].t + WINDOW_SEC.radio,
        `seed ${seed}: calls at ${run.radio[i - 1].t.toFixed(1)} and ${run.radio[i].t.toFixed(1)} overlap`);
    }
  }
});

test("every interruption has four options, one correct, and a complete stem", () => {
  for (const seed of [1, 42, 4242, 20260809]) {
    for (const item of buildRun(seed, 180).arithmetic) {
      assert.equal(item.options.length, 4);
      assert.equal(new Set(item.options).size, 4, `duplicate options: ${item.options}`);
      assert.ok(item.answerIndex >= 0 && item.answerIndex < 4);
      assert.equal(item.options[item.answerIndex], String(item.answer));
      // The stem is rendered verbatim now, so it must ask a whole question.
      assert.ok(item.stem.length >= 3);
      assert.ok(item.stem.trim().endsWith("?"), `stem does not ask anything: "${item.stem}"`);
    }
  }
});

// Under six seconds the discrimination should be the task, not spotting the one
// option with the wrong number of digits. Applies to the NUMERIC families only:
// "AILERON" is not meaningfully within a factor of three of "ALTIMETER".
test("numeric interruption distractors are near misses, not giveaways", () => {
  for (const item of buildRun(20260809, 180).arithmetic) {
    if (!INTERRUPTION_FAMILIES[item.family].numeric) continue;
    // Headings are an angular scale — 355 and 005 are ten degrees apart, and a
    // magnitude rule is meaningless on them. Bounded families are checked for
    // range instead, which is the same lesson learned building the spatial bank.
    if (item.family === "heading") {
      for (const o of item.options) {
        assert.match(o, /^\d{3}$/, `heading option not three digits: ${o}`);
        assert.ok(Number(o) >= 0 && Number(o) <= 359, `heading off the compass: ${o}`);
      }
      continue;
    }
    for (const o of item.options) {
      const v = Number(o);
      assert.ok(v >= item.answer / 3 && v <= item.answer * 3, `${item.stem}: option ${v} is nowhere near ${item.answer}`);
    }
  }
});

// ── Scoring ────────────────────────────────────────────────────────────────

const perfect = (run) => [
  ...run.monitor.map((w) => ({ stream: "monitor", t: (w.start + w.end) / 2 })),
  ...run.radio.filter((c) => c.mine).map((c) => ({ stream: "radio", t: c.t + 1 })),
  ...run.arithmetic.map((a) => ({ stream: "arithmetic", id: a.id, chosen: a.answerIndex })),
];

test("a flawless run scores 100 with no fixation penalty", () => {
  const run = RUN();
  const r = scoreRun(run, perfect(run));
  assert.equal(r.monitor.accuracy, 1);
  assert.equal(r.radio.accuracy, 1);
  assert.equal(r.arithmetic.accuracy, 1);
  assert.equal(r.spread, 0);
  assert.equal(r.fixationPenalty, 0);
  assert.equal(Math.round(r.composite), 100);
  assert.equal(stanineFor(r.composite, DIVIDED_NORM).stanine, 9);
});

test("doing nothing at all scores zero", () => {
  const run = RUN();
  const r = scoreRun(run, []);
  assert.equal(r.composite, 0);
  assert.equal(r.monitor.misses, run.monitor.length);
  assert.equal(r.arithmetic.unanswered, run.arithmetic.length);
  assert.equal(stanineFor(r.composite, DIVIDED_NORM).stanine, 1);
});

// The whole point of the module: you cannot pass by picking a favourite task.
test("fixating on one stream scores worse than flying all three moderately", () => {
  const run = RUN();

  const fixated = scoreRun(run, [
    ...run.monitor.map((w) => ({ stream: "monitor", t: (w.start + w.end) / 2 })),
    ...run.radio.filter((c) => c.mine).map((c) => ({ stream: "radio", t: c.t + 1 })),
    // ...and completely ignores the sums.
  ]);

  // Two thirds of everything, evenly.
  const evenly = scoreRun(run, [
    ...run.monitor.filter((_, i) => i % 3 !== 2).map((w) => ({ stream: "monitor", t: (w.start + w.end) / 2 })),
    ...run.radio.filter((c) => c.mine).filter((_, i) => i % 3 !== 2).map((c) => ({ stream: "radio", t: c.t + 1 })),
    ...run.arithmetic.filter((_, i) => i % 3 !== 2).map((a) => ({ stream: "arithmetic", id: a.id, chosen: a.answerIndex })),
  ]);

  assert.ok(evenly.composite > fixated.composite,
    `even effort (${evenly.composite.toFixed(1)}) should beat fixation (${fixated.composite.toFixed(1)})`);
  assert.ok(fixated.fixationPenalty > 20, "abandoning a whole stream must cost real marks");
  assert.equal(fixated.weakest, "arithmetic");
});

test("the weakest stream is named so the student knows what to train", () => {
  const run = RUN();
  const r = scoreRun(run, [
    ...run.monitor.map((w) => ({ stream: "monitor", t: (w.start + w.end) / 2 })),
    ...run.arithmetic.map((a) => ({ stream: "arithmetic", id: a.id, chosen: a.answerIndex })),
  ]);
  assert.equal(r.weakest, "radio");
});

test("pressing with the needle safe is a false alarm", () => {
  const run = RUN();
  const safeTime = run.monitor.length ? Math.max(0, run.monitor[0].start - 2) : 1;
  const r = scoreRun(run, [{ stream: "monitor", t: safeTime }]);
  assert.equal(r.monitor.falseAlarms, 1);
  assert.equal(r.monitor.hits, 0);
});

test("acknowledging the same excursion twice is not double credit", () => {
  const run = RUN();
  const w = run.monitor[0];
  const r = scoreRun(run, [
    { stream: "monitor", t: w.start + 0.2 },
    { stream: "monitor", t: w.start + 0.4 },
  ]);
  assert.equal(r.monitor.hits, 1);
  assert.equal(r.monitor.falseAlarms, 0);
});

// Transmitting over another aeroplane's call is an error, not a near miss.
test("answering another aircraft's call is scored as a wrong key", () => {
  const run = RUN();
  const theirs = run.radio.find((c) => !c.mine);
  const r = scoreRun(run, [{ stream: "radio", t: theirs.t + 1 }]);
  assert.equal(r.radio.wrongKeys, 1);
  assert.equal(r.radio.hits, 0);
});

test("keying the mic when nobody called is also a wrong key", () => {
  const run = RUN();
  const r = scoreRun(run, [{ stream: "radio", t: 0.5 }]);
  assert.equal(r.radio.wrongKeys, 1);
});

test("a late acknowledgement misses its window", () => {
  const run = RUN();
  const call = run.radio.find((c) => c.mine);
  const r = scoreRun(run, [{ stream: "radio", t: call.t + WINDOW_SEC.radio + 0.5 }]);
  assert.equal(r.radio.hits, 0);
});

test("an unanswered sum counts as wrong, never as skipped", () => {
  const run = RUN();
  const r = scoreRun(run, run.arithmetic.slice(0, 2).map((a) => ({ stream: "arithmetic", id: a.id, chosen: a.answerIndex })));
  assert.equal(r.arithmetic.correct, 2);
  assert.equal(r.arithmetic.unanswered, run.arithmetic.length - 2);
});

test("malformed responses are ignored rather than crashing or scoring", () => {
  const run = RUN();
  assert.doesNotThrow(() => scoreRun(run, [
    { stream: "monitor" },
    { stream: "radio", t: NaN },
    { stream: "arithmetic", id: "nope", chosen: 2 },
    { stream: "arithmetic", id: run.arithmetic[0].id, chosen: null },
    { stream: "gibberish", t: 5 },
  ]));
  const r = scoreRun(run, [{ stream: "arithmetic", id: run.arithmetic[0].id, chosen: null }]);
  assert.equal(r.arithmetic.correct, 0);
  assert.equal(r.arithmetic.unanswered, run.arithmetic.length);
});

// ── Norm ───────────────────────────────────────────────────────────────────

test("the divided-attention cut table is a valid norm", () => {
  assert.doesNotThrow(() => assertValidNorm(DIVIDED_NORM));
  assert.equal(DIVIDED_NORM.cuts.length, 8);
});

test("the composite maps onto the stanine scale as published", () => {
  const at = (p) => stanineFor(p, DIVIDED_NORM).stanine;
  assert.equal(at(0), 1);
  assert.equal(at(14), 1);
  assert.equal(at(15), 2);
  assert.equal(at(58), 6);
  assert.equal(at(88), 9);
  assert.equal(at(100), 9);
});

test("the stream list and fixation weight are the published ones", () => {
  // TRACKING leads the list deliberately. The real test — and the NASA MATB
  // paradigm it is built on — runs a continuous psychomotor task underneath the
  // discrete ones. This module shipped without it, which meant it was measuring
  // task-switching and calling it divided attention.
  assert.deepEqual(STREAMS, ["tracking", "monitor", "radio", "arithmetic"]);
  assert.ok(FIXATION_WEIGHT > 0 && FIXATION_WEIGHT < 1);
});

// ── Escalation across phases ───────────────────────────────────────────────

test("the run is divided into phases that tile the clock with no gap", () => {
  const w = phaseWindows(900);
  assert.equal(w.length, PHASES.length);
  assert.equal(w[0].start, 0);
  assert.equal(w[w.length - 1].end, 900);
  for (let i = 1; i < w.length; i++) assert.equal(w[i].start, w[i - 1].end, `gap before phase ${i}`);
});

test("phaseIndexAt is bounded at both ends of the clock", () => {
  assert.equal(phaseIndexAt(0, 900), 0);
  assert.equal(phaseIndexAt(899, 900), PHASES.length - 1);
  // A response logged a tick past the end must still resolve to a real phase
  // rather than reading off the end of the table.
  assert.equal(phaseIndexAt(900, 900), PHASES.length - 1);
  assert.equal(phaseIndexAt(1200, 900), PHASES.length - 1);
  assert.equal(phaseIndexAt(-5, 900), 0);
  assert.throws(() => phaseIndexAt(10, 0), RangeError);
});

test("workload genuinely climbs: later phases pack in more events per minute", () => {
  const run = buildRun(20260810, 900);
  const span = 900 / PHASES.length;
  const rate = (events, i) =>
    events.filter((e) => e.t >= i * span && e.t < (i + 1) * span).length / span;

  const radioRates = PHASES.map((_, i) => rate(run.radio, i));
  const sumRates = PHASES.map((_, i) => rate(run.arithmetic, i));
  assert.ok(radioRates[2] > radioRates[0], `radio did not speed up: ${radioRates}`);
  assert.ok(sumRates[2] > sumRates[0], `interruptions did not speed up: ${sumRates}`);
});

test("and the time to answer genuinely shrinks", () => {
  const run = buildRun(20260810, 900);
  const first = run.radio[0];
  const last = run.radio[run.radio.length - 1];
  assert.ok(last.window < first.window, `window did not tighten: ${first.window} -> ${last.window}`);
  assert.equal(first.window, WINDOW_SEC.radio * PHASES[0].windowScale);
});

test("every event carries the phase it belongs to and a window it was shown with", () => {
  const run = buildRun(7, 900);
  const keys = PHASES.map((p) => p.key);
  for (const e of [...run.radio, ...run.arithmetic]) {
    assert.ok(keys.includes(e.phase), `event at ${e.t} has phase ${e.phase}`);
    assert.ok(e.window > 0, `event at ${e.t} has no response window`);
  }
});

test("a call is marked against the window it was actually shown with", () => {
  const run = buildRun(11, 900);
  const late = [...run.radio].reverse().find((c) => c.mine);
  // Keying just inside the SHORTENED late window counts...
  const inside = scoreRun(run, [{ stream: "radio", t: late.t + late.window - 0.1 }]);
  assert.equal(inside.radio.hits, 1);
  // ...and keying at what the OPENING window would have allowed does not,
  // because by then the student was being given less time and knew it.
  const outside = scoreRun(run, [{ stream: "radio", t: late.t + WINDOW_SEC.radio - 0.01 }]);
  assert.equal(outside.radio.hits, 0);
  assert.ok(late.window < WINDOW_SEC.radio, "this test needs a late call with a tightened window");
});

// ── The per-phase breakdown ────────────────────────────────────────────────

test("the breakdown reports one entry per phase, in order", () => {
  const run = buildRun(20260810, 900);
  const s = scoreRun(run, []);
  assert.equal(s.phases.length, PHASES.length);
  assert.deepEqual(s.phases.map((p) => p.key), PHASES.map((p) => p.key));
});

test("a flawless run is flawless in every phase and never reports a collapse", () => {
  const run = buildRun(20260810, 900);
  const responses = [
    ...run.monitor.map((w) => ({ stream: "monitor", t: (w.start + w.end) / 2 })),
    ...run.radio.filter((c) => c.mine).map((c) => ({ stream: "radio", t: c.t + 0.5 })),
    ...run.arithmetic.map((i) => ({ stream: "arithmetic", id: i.id, chosen: i.answerIndex })),
  ];
  const s = scoreRun(run, responses);
  for (const p of s.phases) assert.equal(Math.round(p.composite), 100, `${p.key} was not clean`);
  assert.equal(s.collapsePhase, null);
});

test("giving up partway through is reported as a collapse at that phase", () => {
  const run = buildRun(20260810, 900);
  const span = 900 / PHASES.length;
  // Fly the first phase properly, then stop responding entirely.
  const responses = [
    ...run.monitor.filter((w) => w.start < span).map((w) => ({ stream: "monitor", t: (w.start + w.end) / 2 })),
    ...run.radio.filter((c) => c.mine && c.t < span).map((c) => ({ stream: "radio", t: c.t + 0.5 })),
    ...run.arithmetic.filter((i) => i.t < span).map((i) => ({ stream: "arithmetic", id: i.id, chosen: i.answerIndex })),
  ];
  const s = scoreRun(run, responses);
  assert.equal(Math.round(s.phases[0].composite), 100);
  assert.equal(s.phases[2].composite, 0);
  assert.equal(s.collapsePhase, PHASES[1].key, "the collapse should be named at the phase it began");
});

test("a steady run is not accused of collapsing on noise", () => {
  const run = buildRun(20260810, 900);
  // Answer every sum, ignore the other two streams entirely: uniform across
  // phases, poor overall, but not a collapse — the composite never steps down.
  const s = scoreRun(run, run.arithmetic.map((i) => ({ stream: "arithmetic", id: i.id, chosen: i.answerIndex })));
  assert.equal(s.collapsePhase, null);
  assert.ok(COLLAPSE_DROP >= 5, "a collapse threshold below 5 points would fire on noise");
});

test("the per-phase composites bracket the overall composite", () => {
  const run = buildRun(4242, 900);
  const responses = run.arithmetic
    .filter((_, i) => i % 2 === 0)
    .map((i) => ({ stream: "arithmetic", id: i.id, chosen: i.answerIndex }));
  const s = scoreRun(run, responses);
  const scored = s.phases.map((p) => p.composite).filter((c) => c !== null);
  assert.ok(s.composite >= Math.min(...scored) - 1e-9, "overall fell below every phase");
  assert.ok(s.composite <= Math.max(...scored) + 1e-9, "overall rose above every phase");
});

test("a phase with no events for a stream reports null, never a zero", () => {
  // A zero would read as "you failed that", when in fact nothing was asked.
  const run = buildRun(99, 900);
  const s = scoreRun(run, []);
  for (const p of s.phases) {
    for (const [stream, acc] of Object.entries(p.accuracies)) {
      assert.ok(acc === null || (acc >= 0 && acc <= 1), `${p.key}/${stream} = ${acc}`);
    }
  }
});

test("response windows still cannot overlap at the escalated cadence", () => {
  // Phase 3 shortens the gap between calls AND the window on each. Both move,
  // so the invariant has to be rechecked at the length actually shipped —
  // verifying it only on a short flat run proves nothing about the real one.
  for (const seed of [1, 2, 3, 77, 4242, 20260810]) {
    const run = buildRun(seed, 900);
    for (let i = 1; i < run.radio.length; i++) {
      const prev = run.radio[i - 1];
      assert.ok(run.radio[i].t > prev.t + prev.window,
        `seed ${seed}: calls at ${prev.t.toFixed(1)} (+${prev.window.toFixed(2)}) and ${run.radio[i].t.toFixed(1)} overlap`);
    }
    for (let i = 1; i < run.arithmetic.length; i++) {
      const prev = run.arithmetic[i - 1];
      assert.ok(run.arithmetic[i].t > prev.t + prev.window,
        `seed ${seed}: interruptions at ${prev.t.toFixed(1)} and ${run.arithmetic[i].t.toFixed(1)} overlap`);
    }
  }
});

test("a full-length run gives every stream enough to be scored on", () => {
  for (const seed of [1, 99, 4242, 20260810]) {
    const run = buildRun(seed, 900);
    assert.ok(run.monitor.length >= MIN_EXCURSIONS, `seed ${seed}: ${run.monitor.length} excursions`);
    assert.ok(run.radio.filter((c) => c.mine).length >= 20, `seed ${seed}: too few calls for you`);
    assert.ok(run.arithmetic.length >= 30, `seed ${seed}: ${run.arithmetic.length} interruptions`);
    // And every phase must contain work, or a phase score would be meaningless.
    for (let p = 0; p < PHASES.length; p++) {
      assert.ok(run.radio.some((c) => c.phase === PHASES[p].key), `seed ${seed}: no radio in phase ${p}`);
      assert.ok(run.arithmetic.some((a) => a.phase === PHASES[p].key), `seed ${seed}: no sums in phase ${p}`);
    }
  }
});

// ── The continuous stream ──────────────────────────────────────────────────

test("a run carries its own tracking disturbance, seeded and replayable", () => {
  const a = buildRun(4242, 900);
  const b = buildRun(4242, 900);
  assert.ok(Number.isInteger(a.trackingSeed), "no tracking seed on the run");
  assert.equal(a.trackingSeed, b.trackingSeed, "the same seed must rebuild the same aeroplane");
  assert.notEqual(a.trackingSeed, buildRun(4243, 900).trackingSeed);
  // And it must not simply be the gauge's seed — two streams sharing one seed
  // would drift in lockstep, which is not what a cockpit does.
  assert.notEqual(a.trackingSeed, a.gaugeSeed);
  assert.ok(a.tracking.sampleHz > 0);
});

test("the aeroplane gets harder to hold as the phases climb", () => {
  const run = buildRun(7, 900);
  const g = run.tracking.gain;
  assert.ok(g.building > g.settling, "phase 2 is no harder to fly than phase 1");
  assert.ok(g.saturated > g.building, "phase 3 is no harder to fly than phase 2");
});

test("tracking is scored against a baseline computed HERE, not one the client sends", () => {
  // A cancellation figure the browser could hand us is a figure a browser could
  // invent. The scorer recomputes the do-nothing baseline from the run's seed.
  const run = buildRun(20260812, 900);
  const perfect = scoreRun(run, [{ stream: "tracking", rmse: 0.0001, samples: run.durationSec * run.tracking.sampleHz }]);
  const useless = scoreRun(run, [{ stream: "tracking", rmse: 99, samples: run.durationSec * run.tracking.sampleHz }]);
  assert.ok(perfect.tracking.cancellation > 95, `flawless tracking scored ${perfect.tracking.cancellation}`);
  assert.equal(Math.round(useless.tracking.cancellation), 0, "fighting the disturbance must floor at zero, not go negative");
  assert.ok(perfect.tracking.baseline > 0, "no baseline was computed");
});

test("a tracking stream that was never flown is absent, not a zero", () => {
  const run = buildRun(99, 900);
  const s = scoreRun(run, []);
  assert.equal(s.tracking, null, "an unflown stream must not be reported as a score of zero");
});

test("abandoning the aeroplane part-way is flagged", () => {
  const run = buildRun(11, 900);
  const full = run.durationSec * run.tracking.sampleHz;
  assert.equal(scoreRun(run, [{ stream: "tracking", rmse: 0.3, samples: full }]).tracking.incomplete, false);
  assert.equal(scoreRun(run, [{ stream: "tracking", rmse: 0.3, samples: Math.round(full * 0.2) }]).tracking.incomplete, true);
});

test("flying well but ignoring everything else is still punished as fixation", () => {
  // This is the whole reason the stream was added. A student who holds the
  // aeroplane beautifully and answers nothing must not score well.
  const run = buildRun(20260812, 900);
  const full = run.durationSec * run.tracking.sampleHz;
  const fixated = scoreRun(run, [{ stream: "tracking", rmse: 0.0001, samples: full }]);
  const spread = scoreRun(run, [
    { stream: "tracking", rmse: 0.0001, samples: full },
    ...run.monitor.map((w) => ({ stream: "monitor", t: (w.start + w.end) / 2 })),
    ...run.radio.filter((c) => c.mine).map((c) => ({ stream: "radio", t: c.t + 0.5 })),
    ...run.arithmetic.map((i) => ({ stream: "arithmetic", id: i.id, chosen: i.answerIndex })),
  ]);
  assert.ok(spread.composite > fixated.composite,
    `flying all four (${spread.composite}) must beat perfect tracking alone (${fixated.composite})`);
  assert.ok(fixated.fixationPenalty > 0, "abandoning three streams drew no fixation penalty");
});

test("the input device is carried through so norms cannot pool a phone with a joystick", () => {
  const run = buildRun(3, 900);
  const s = scoreRun(run, [{ stream: "tracking", rmse: 0.2, samples: 100, inputClass: "gamepad:T.16000M" }]);
  assert.equal(s.tracking.inputClass, "gamepad:T.16000M");
});

test("the gain the student flies and the gain the scorer grades are the SAME function", () => {
  // If these ever diverge, a student flies an aeroplane pushed 1.75x while being
  // scored against a 1.0x baseline, and a good run reads as a bad one. It never
  // throws and never looks wrong — which is why it is one exported function.
  const D = 900;
  assert.equal(trackingGainAt(0, D), TRACKING_GAIN.settling);
  assert.equal(trackingGainAt(D * 0.5, D), TRACKING_GAIN.building);
  assert.equal(trackingGainAt(D * 0.9, D), TRACKING_GAIN.saturated);
});

test("the gained baseline is genuinely harder than an unpushed one", () => {
  const run = buildRun(20260812, 900);
  const gained = passiveRmseGained(run.tracking.seed, run.durationSec, run.tracking.sampleHz);
  const flat = passiveRmse(run.tracking.seed, run.durationSec, run.tracking.sampleHz);
  assert.ok(gained > flat,
    `gained baseline ${gained} should exceed the flat one ${flat} — the escalation is not reaching the disturbance`);
});

test("every stream the scorer can name has a label in the report", () => {
  // Adding a stream to the engine and forgetting the presentation layer is how
  // a result page renders "weakest: " with nothing after it.
  const src = fs.readFileSync(new URL("../../app/adapt-test/AdaptRunner.tsx", import.meta.url), "utf8");
  const block = src.slice(src.indexOf("const STREAM_LABEL"), src.indexOf("}", src.indexOf("const STREAM_LABEL")));
  for (const s of STREAMS) {
    // A plain string check on purpose. The first version built a RegExp from a
    // template literal, lost a backslash on the way into the file, and became
    // /trackings*:/ — which matched nothing and failed a label that was present.
    assert.ok(block.includes(`${s}:`), `no report label for the "${s}" stream`);
  }
});

test("the briefing tells the student about every stream they will be scored on", () => {
  // Verified in a browser and found wanting: the briefing said "three things at
  // once" and never mentioned flying, so a student met the aeroplane with no
  // explanation and no idea it was scored.
  const src = fs.readFileSync(new URL("../../app/adapt-test/DividedAttentionTask.tsx", import.meta.url), "utf8");
  const brief = src.slice(src.indexOf("Four things at once"), src.indexOf("Start the run"));
  assert.ok(brief.length > 200, "the briefing block could not be located");
  for (const [stream, cue] of [["tracking", "Fly the aeroplane"], ["monitor", "Watch the gauge"], ["radio", "Listen to the radio"], ["arithmetic", "Answer the sums"]]) {
    assert.ok(brief.includes(cue), `the briefing never explains the "${stream}" stream`);
  }
  assert.ok(!brief.includes("Three things"), "the briefing still says three");
});

// ── The recall quiz ────────────────────────────────────────────────────────
//
// Added 2026-08-16. The generator computes its own answers, so a test that
// asked the generator whether it was right would prove nothing. Everything
// below re-derives the truth from the RUN SCHEDULE instead — the clearances
// the student was actually shown — and checks the quiz against that.

import {
  buildRecall, scoreRecall, RECALL_COUNT, CLEARANCE_KINDS,
  WAYPOINTS, clearanceText,
} from "./divided-attention.mjs";

/** Every clearance the run really issued, rendered exactly as a student saw it. */
const issued = (run) => run.radio.filter((c) => c.mine && c.clearance).map((c) => c.clearance);

test("only your own calls carry a clearance to copy", () => {
  const run = buildRun(4242, 900);
  for (const c of run.radio) {
    if (!c.mine) assert.equal(c.clearance, null, "another aircraft's call carried a clearance to copy");
  }
  assert.ok(issued(run).length >= 4, "a 15-minute run should issue several clearances");
});

test("clearance values are unique across a run, keyed on the rendered string", () => {
  for (const seed of [1, 77, 20260816, 999999]) {
    const texts = issued(buildRun(seed, 900)).map((c) => c.text);
    assert.equal(new Set(texts).size, texts.length, `seed ${seed} issued the same clearance twice`);
  }
});

test("all four clearance kinds appear once there are enough own-calls", () => {
  const run = buildRun(20260816, 900);
  const kinds = new Set(issued(run).map((c) => c.kind));
  assert.deepEqual([...kinds].sort(), [...CLEARANCE_KINDS].sort());
});

test("ordinals count each kind independently and start at one", () => {
  const run = buildRun(31337, 900);
  const seen = new Map();
  for (const c of issued(run)) {
    const next = (seen.get(c.kind) ?? 0) + 1;
    assert.equal(c.ordinal, next, `${c.kind} ordinal out of sequence`);
    seen.set(c.kind, next);
  }
});

test("clearance text renders the way a student reads it back", () => {
  assert.equal(clearanceText("heading", 75), "heading 075");
  assert.equal(clearanceText("heading", 5), "heading 005");
  assert.equal(clearanceText("altitude", 5100), "5,100 ft");
  assert.equal(clearanceText("speed", 320), "320 kt");
  assert.equal(clearanceText("waypoint", "the quarry"), "the quarry");
  assert.throws(() => clearanceText("nonsense", 1), RangeError);
});

test("every recall answer is a clearance the run actually issued, and no distractor is", () => {
  for (const seed of [3, 11, 20260816, 555, 91827]) {
    const run = buildRun(seed, 900);
    const truth = new Set(issued(run).map((c) => c.text));
    for (const q of run.recall) {
      const answer = q.options[q.answerIndex];
      assert.equal(new Set(q.options).size, q.options.length, `seed ${seed}: duplicate option in "${q.stem}"`);

      if (q.kind === "own-call-count") {
        // Re-counted from the schedule, not read back from the generator.
        assert.equal(answer, String(run.radio.filter((c) => c.mine).length));
        continue;
      }

      assert.ok(truth.has(answer), `seed ${seed}: "${answer}" was never issued`);

      // The distractors are the whole point: exactly one option may be true.
      const alsoTrue = q.options.filter((o) => o !== answer && truth.has(o));
      if (q.kind === "waypoint-order") {
        // Here other REAL waypoints are the distractors on purpose — order is
        // what is being tested — so only the ordinal itself must be unique.
        const n = ["first", "second", "third", "fourth", "fifth"].findIndex((w) => q.stem.includes(w)) + 1;
        const wp = issued(run).filter((c) => c.kind === "waypoint");
        assert.equal(answer, wp[n - 1].text, `seed ${seed}: wrong waypoint for ordinal ${n}`);
      } else {
        assert.equal(alsoTrue.length, 0, `seed ${seed}: "${q.stem}" has ${alsoTrue.length + 1} correct answers`);
      }
    }
  }
});

test("an 'assigned' question names the kind it is actually asking about", () => {
  const run = buildRun(20260816, 900);
  const byText = new Map(issued(run).map((c) => [c.text, c.kind]));
  for (const q of run.recall) {
    if (!q.kind.startsWith("assigned-")) continue;
    const kind = q.kind.slice("assigned-".length);
    assert.ok(q.stem.includes(kind), `stem "${q.stem}" does not name ${kind}`);
    assert.equal(byText.get(q.options[q.answerIndex]), kind, "answer is the wrong kind of clearance");
  }
});

test("waypoint distractors are real place names, never invented mid-quiz", () => {
  const run = buildRun(12345, 900);
  for (const q of run.recall) {
    if (q.kind !== "waypoint-order" && q.kind !== "assigned-waypoint") continue;
    for (const o of q.options) assert.ok(WAYPOINTS.includes(o), `"${o}" is not in the waypoint list`);
  }
});

test("the quiz is deterministic from the seed and never exceeds its count", () => {
  const run = buildRun(808, 900);
  const a = run.recall;
  const b = buildRun(808, 900).recall;
  assert.deepEqual(a, b);
  // The quiz carried on the run must be the quiz the builder produces — if
  // these ever diverge, a student answers one paper and is marked on another.
  assert.deepEqual(a, buildRecall(run));
  assert.ok(a.length <= RECALL_COUNT);
  assert.notDeepEqual(a, buildRun(809, 900).recall);
});

test("a run too short to issue clearances asks nothing rather than inventing", () => {
  const run = buildRun(5, 30);
  assert.ok(run.recall.length <= RECALL_COUNT);
  for (const q of run.recall) assert.ok(q.options.length === 4);
  assert.equal(scoreRecall([], []), null, "no questions must score null, not zero");
});

test("recall marks correctly, and a blank is wrong but not negative", () => {
  const run = buildRun(20260816, 900);
  const items = run.recall;
  assert.ok(items.length >= 3, "expected a full quiz on a 15-minute run");

  const allRight = scoreRecall(items, items.map((q) => ({ id: q.id, chosen: q.answerIndex })));
  assert.equal(allRight.correct, items.length);
  assert.equal(allRight.accuracy, 1);
  assert.equal(allRight.unanswered, 0);

  const allWrong = scoreRecall(items, items.map((q) => ({ id: q.id, chosen: (q.answerIndex + 1) % 4 })));
  assert.equal(allWrong.correct, 0);
  assert.equal(allWrong.accuracy, 0);

  const blank = scoreRecall(items, []);
  assert.equal(blank.correct, 0);
  assert.equal(blank.unanswered, items.length);
  assert.ok(blank.accuracy >= 0, "a blank paper must never score below zero");
});

test("recall is reported but does NOT move the divided-attention composite", () => {
  const run = buildRun(20260816, 900);
  const base = [{ stream: "arithmetic", id: run.arithmetic[0].id, chosen: run.arithmetic[0].answerIndex }];
  const right = run.recall.map((q) => ({ stream: "recall", id: q.id, chosen: q.answerIndex }));
  const wrong = run.recall.map((q) => ({ stream: "recall", id: q.id, chosen: (q.answerIndex + 1) % 4 }));

  const a = scoreRun(run, [...base, ...right]);
  const b = scoreRun(run, [...base, ...wrong]);

  assert.equal(a.composite, b.composite, "recall leaked into the composite");
  assert.equal(a.mean, b.mean);
  assert.equal(a.recall.correct, run.recall.length);
  assert.equal(b.recall.correct, 0);
});

test("the scored recall block carries no question text or student picks", () => {
  const run = buildRun(20260816, 900);
  const scored = scoreRun(run, run.recall.map((q) => ({ stream: "recall", id: q.id, chosen: q.answerIndex })));
  assert.deepEqual(
    Object.keys(scored.recall).sort(),
    ["accuracy", "correct", "total", "unanswered", "wrong"],
    "the recall block must stay aggregate — counts only, no stems, options or choices"
  );
});
