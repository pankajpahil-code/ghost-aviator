import { test } from "node:test";
import assert from "node:assert/strict";
import {
  makeDisturbance,
  makeTracker,
  markerPosition,
  evaluate,
  passiveRmse,
  cancellationPercent,
  inputClass,
  inputLabel,
  CANCELLATION_NORM,
  SAMPLE_HZ,
} from "./tracking.mjs";
import { assertValidNorm, stanineFor } from "./stanine.mjs";

// ── The disturbance ────────────────────────────────────────────────────────

test("the disturbance is deterministic and seed-sensitive", () => {
  const a = makeDisturbance(99);
  const b = makeDisturbance(99);
  const c = makeDisturbance(100);
  for (let t = 0; t < 20; t += 0.37) {
    assert.deepEqual(a.at(t), b.at(t));
  }
  assert.notDeepEqual(a.at(5), c.at(5));
});

test("the disturbance stays inside the field and actually moves", () => {
  for (const seed of [1, 7, 4242, 90210]) {
    const d = makeDisturbance(seed);
    let min = Infinity, max = -Infinity;
    for (let t = 0; t <= 60; t += 0.02) {
      const p = d.at(t);
      for (const v of [p.x, p.y]) {
        assert.ok(Number.isFinite(v), `seed ${seed}: non-finite disturbance`);
        assert.ok(Math.abs(v) <= 0.81, `seed ${seed}: excursion ${v} escapes the field`);
        min = Math.min(min, v);
        max = Math.max(max, v);
      }
    }
    assert.ok(max - min > 0.4, `seed ${seed}: disturbance barely moves (range ${max - min})`);
  }
});

test("the disturbance is smooth — no jumps a hand could not follow", () => {
  const d = makeDisturbance(31337);
  let prev = d.at(0);
  for (let t = 0.02; t <= 60; t += 0.02) {
    const p = d.at(t);
    const jump = Math.hypot(p.x - prev.x, p.y - prev.y);
    assert.ok(jump < 0.05, `jump of ${jump.toFixed(3)} at t=${t.toFixed(2)}`);
    prev = p;
  }
});

// ── The marker ─────────────────────────────────────────────────────────────

test("an equal and opposite control puts the marker on the centre", () => {
  const d = makeDisturbance(5);
  for (let t = 0; t < 10; t += 1.3) {
    const dist = d.at(t);
    const p = markerPosition(dist, { x: -dist.x, y: -dist.y });
    assert.ok(Math.abs(p.x) < 1e-12 && Math.abs(p.y) < 1e-12);
  }
});

test("doing nothing leaves the marker exactly on the disturbance", () => {
  const d = makeDisturbance(5);
  const dist = d.at(3.1);
  assert.deepEqual(markerPosition(dist, { x: 0, y: 0 }), dist);
});

// ── The RMSE maths ─────────────────────────────────────────────────────────

// The formula is the whole point of this module, so it is pinned against a
// value worked out by hand rather than against the implementation.
test("RMSE keeps both axes inside the mean", () => {
  const tracker = makeTracker({ seed: 1, sampleHz: 1 });
  // Force known errors by driving the control rather than trusting the
  // disturbance: at each sample, error = disturbance + control.
  const errors = [];
  for (let t = 0; t < 4; t++) {
    const d = tracker.at(t);
    // Aim for errors of (3,4), (0,0), (1,1), (2,2) -> squared radials 25, 0, 2, 8
    const want = [[3, 4], [0, 0], [1, 1], [2, 2]][t];
    tracker.sample(t, { x: want[0] - d.x, y: want[1] - d.y });
    errors.push(want);
  }
  const expected = Math.sqrt((25 + 0 + 2 + 8) / 4);
  assert.equal(tracker.sampleCount, 4);
  assert.ok(Math.abs(tracker.rmse() - expected) < 1e-9, `got ${tracker.rmse()}, expected ${expected}`);
});

test("the worst single error is tracked separately from the mean", () => {
  const tracker = makeTracker({ seed: 1, sampleHz: 1 });
  for (let t = 0; t < 3; t++) {
    const d = tracker.at(t);
    const want = [[3, 4], [0, 0], [1, 0]][t]; // radii 5, 0, 1
    tracker.sample(t, { x: want[0] - d.x, y: want[1] - d.y });
  }
  assert.ok(Math.abs(tracker.worstError - 5) < 1e-9);
});

test("RMSE is null before any sample and positive after", () => {
  const tracker = makeTracker({ seed: 3 });
  assert.equal(tracker.rmse(), null);
  // The first real call lands on the first animation frame, milliseconds in —
  // a call a whole second late would count as a gap and be skipped.
  tracker.sample(0.02, { x: 0, y: 0 });
  assert.ok(tracker.rmse() > 0);
});

test("a tracker refuses a non-integer seed or a nonsense rate", () => {
  assert.throws(() => makeTracker({ seed: 1.5 }), RangeError);
  assert.throws(() => makeTracker({ seed: 1, sampleHz: 0 }), RangeError);
});

// ── Frame-rate independence: the fairness property ─────────────────────────
//
// This is the reason scoring does not live in the render loop. A student on a
// 60 Hz phone and a student on a 144 Hz laptop must be scored on the same
// number of samples taken at the same instants.

// Frame times are computed as i/fps, not accumulated — a real clock
// (performance.now()) reports absolute time and does not drift, so a test that
// accumulates its own would be measuring an artefact it invented.
test("sample count depends on elapsed time, not on frame rate", () => {
  const counts = [30, 60, 90, 144, 240].map((fps) => {
    const tracker = makeTracker({ seed: 11 });
    for (let i = 0; i <= 10 * fps; i++) tracker.sample(i / fps, { x: 0, y: 0 });
    return tracker.sampleCount;
  });
  assert.equal(new Set(counts).size, 1, `sample counts differed across frame rates: ${counts}`);
  // 10 seconds at 50 Hz, inclusive of t=0.
  assert.equal(counts[0], 10 * SAMPLE_HZ + 1);
});

test("an identical run scores identically at any frame rate", () => {
  const scores = [30, 60, 144].map((fps) => {
    const tracker = makeTracker({ seed: 77 });
    for (let i = 0; i <= 20 * fps; i++) tracker.sample(i / fps, { x: 0.1, y: -0.2 });
    return tracker.rmse();
  });
  for (const s of scores) assert.ok(Math.abs(s - scores[0]) < 1e-12, `RMSE varied by frame rate: ${scores}`);
});

// A student who tabs away must not be credited for the time they were gone.
// Backfilling the gap with whatever control value is current on waking would
// hand out a perfect stretch that was never flown.
test("a gap in the run is skipped, never backfilled", () => {
  const tracker = makeTracker({ seed: 4 });
  for (let i = 0; i <= 50; i++) tracker.sample(i / 50, { x: 0, y: 0 }); // 1 real second
  const flownBefore = tracker.sampleCount;
  assert.ok(flownBefore > 45, `expected a second of samples, got ${flownBefore}`);

  tracker.sample(31, { x: 0, y: 0 }); // 30 seconds later, tab restored
  assert.equal(tracker.sampleCount, flownBefore, "the gap was credited as flown time");
  assert.ok(tracker.skippedCount > 1400, `expected ~1500 skipped samples, got ${tracker.skippedCount}`);
});

test("sampling resumes normally after a skipped gap", () => {
  const tracker = makeTracker({ seed: 4 });
  tracker.sample(0, { x: 0, y: 0 });
  tracker.sample(10, { x: 0, y: 0 }); // long gap, skipped
  const after = tracker.sampleCount;
  for (let i = 1; i <= 25; i++) tracker.sample(10 + i / 50, { x: 0, y: 0 });
  assert.ok(tracker.sampleCount > after + 20, "the tracker did not resume after the gap");
});

test("ordinary frame jitter is not mistaken for an interruption", () => {
  const tracker = makeTracker({ seed: 4 });
  // 5 fps is a dreadful frame rate but still someone flying the task.
  for (let i = 0; i <= 50; i++) tracker.sample(i / 5, { x: 0, y: 0 });
  assert.equal(tracker.skippedCount, 0, "a slow but continuous run was treated as interrupted");
  assert.ok(tracker.sampleCount > 490, `expected ~500 samples, got ${tracker.sampleCount}`);
});

// ── Baseline and cancellation ──────────────────────────────────────────────

test("perfect cancellation scores 100% and doing nothing scores 0%", () => {
  const seed = 808;
  const duration = 30;
  const base = passiveRmse(seed, duration);
  assert.ok(base > 0.1, `baseline ${base} looks too small to be a real disturbance`);

  const perfect = evaluate({ seed, durationSec: duration, controlAt: (t, d) => ({ x: -d.x, y: -d.y }) });
  assert.ok(perfect.rmse < 1e-12);
  assert.equal(Math.round(cancellationPercent(perfect.rmse, base)), 100);

  const idle = evaluate({ seed, durationSec: duration });
  assert.equal(Math.round(cancellationPercent(idle.rmse, base)), 0);
});

test("half-cancelling the disturbance scores about 50%", () => {
  const seed = 909;
  const base = passiveRmse(seed, 30);
  const half = evaluate({ seed, durationSec: 30, controlAt: (t, d) => ({ x: -d.x / 2, y: -d.y / 2 }) });
  const pct = cancellationPercent(half.rmse, base);
  assert.ok(Math.abs(pct - 50) < 1e-6, `expected ~50%, got ${pct}`);
});

test("making it worse than doing nothing floors at zero, never negative", () => {
  const seed = 111;
  const base = passiveRmse(seed, 20);
  const worse = evaluate({ seed, durationSec: 20, controlAt: (t, d) => ({ x: d.x * 2, y: d.y * 2 }) });
  assert.ok(worse.rmse > base);
  assert.equal(cancellationPercent(worse.rmse, base), 0);
});

test("cancellation is undefined rather than wrong when there is nothing to measure", () => {
  assert.equal(cancellationPercent(null, 1), null);
  assert.equal(cancellationPercent(0.5, 0), null);
  assert.equal(cancellationPercent(0.5, null), null);
});

// A lagging hand is what a real student produces. It should land somewhere
// meaningful rather than at either extreme.
test("a realistically lagging controller scores in the middle of the scale", () => {
  const seed = 2026;
  const base = passiveRmse(seed, 40);
  const lagged = evaluate({
    seed,
    durationSec: 40,
    controlAt: (t) => {
      const d = makeDisturbance(seed).at(Math.max(0, t - 0.35)); // 350 ms behind
      return { x: -d.x, y: -d.y };
    },
  });
  const pct = cancellationPercent(lagged.rmse, base);
  assert.ok(pct > 20 && pct < 95, `a 350 ms lag scored ${pct}%, which is not a usable middle`);
});

// ── Scoring ────────────────────────────────────────────────────────────────

test("the cancellation cut table is a valid norm", () => {
  assert.doesNotThrow(() => assertValidNorm(CANCELLATION_NORM));
  assert.equal(CANCELLATION_NORM.cuts.length, 8);
});

test("cancellation maps onto the stanine scale as published", () => {
  const at = (pct) => stanineFor(pct, CANCELLATION_NORM).stanine;
  assert.equal(at(0), 1);
  assert.equal(at(19), 1);
  assert.equal(at(20), 2);
  assert.equal(at(55), 5);
  assert.equal(at(75), 7);
  assert.equal(at(92), 9);
  assert.equal(at(100), 9);
});

test("scoring a tracking run reports the criterion basis, not a fake population", () => {
  const r = stanineFor(70, CANCELLATION_NORM);
  assert.equal(r.basis, "criterion");
  assert.equal(r.percentile, null);
  assert.match(r.rationale, /Provisional/);
});

// ── Input classes ──────────────────────────────────────────────────────────

test("input devices are classified as separate populations", () => {
  assert.equal(inputClass("touch"), "touch");
  assert.equal(inputClass("mouse"), "pointer");
  assert.equal(inputClass("pointer"), "pointer");
  assert.equal(inputClass("gamepad", "Thrustmaster T.16000M"), "gamepad:Thrustmaster T.16000M");
});

test("a gamepad id cannot grow unbounded in stored results", () => {
  const cls = inputClass("gamepad", "x".repeat(500));
  assert.ok(cls.length <= "gamepad:".length + 40);
});

test("every input class has a human-readable label", () => {
  assert.equal(inputLabel("touch"), "touchscreen");
  assert.equal(inputLabel("pointer"), "mouse or trackpad");
  assert.equal(inputLabel("gamepad:Anything"), "joystick or gamepad");
});
