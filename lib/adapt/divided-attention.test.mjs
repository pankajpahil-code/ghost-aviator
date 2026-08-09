import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildRun, scoreRun, makeGauge, redWindows, GAUGE, WINDOW_SEC,
  FIXATION_WEIGHT, DIVIDED_NORM, STREAMS, MIN_EXCURSIONS,
} from "./divided-attention.mjs";
import { assertValidNorm, stanineFor } from "./stanine.mjs";

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

test("every interruption is a solvable sum with four options and a correct one", () => {
  for (const seed of [1, 42, 4242, 20260809]) {
    for (const item of buildRun(seed, 180).arithmetic) {
      assert.equal(item.options.length, 4);
      assert.equal(new Set(item.options).size, 4, `duplicate options: ${item.options}`);
      assert.ok(item.answerIndex >= 0 && item.answerIndex < 4);
      assert.equal(Number(item.options[item.answerIndex]), item.answer);
      assert.ok(item.answer > 0 && Number.isInteger(item.answer));
      assert.ok(item.stem.length >= 3);
    }
  }
});

// Under six seconds the discrimination should be the arithmetic, not spotting
// the one option with the wrong number of digits.
test("interruption distractors are near misses, not giveaways", () => {
  for (const item of buildRun(20260809, 180).arithmetic) {
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
  assert.deepEqual(STREAMS, ["monitor", "radio", "arithmetic"]);
  assert.ok(FIXATION_WEIGHT > 0 && FIXATION_WEIGHT < 1);
});
