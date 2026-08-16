// The lookout stream, added 2026-08-16.
//
// The scoring here has three distinct failure modes and they must stay
// distinct: MISSED (never called), MISIDENTIFIED (called the wrong thing) and
// FALSE (called nothing at all). Collapsing any two of them would let a student
// who spams both buttons look like a student who looks out of the window, which
// is the exact behaviour this stream exists to detect.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildRun, scoreRun, scoreSightings, SIGHTING_TYPES, SIGHTING_VISIBLE_SEC, PHASES,
} from "./divided-attention.mjs";

const RUN = () => buildRun(20260816, 900);
const perfect = (run) => run.sightings.map((s) => ({ stream: "sighting", t: s.t + 1, type: s.type }));

// ── The schedule ───────────────────────────────────────────────────────────

test("a run schedules targets of both types", () => {
  const run = RUN();
  assert.ok(run.sightings.length >= 8, `too few targets: ${run.sightings.length}`);
  const types = new Set(run.sightings.map((s) => s.type));
  assert.deepEqual([...types].sort(), [...SIGHTING_TYPES].sort());
});

// Two targets in view at once makes "which one did you mean" unanswerable, so
// the schedule prevents it rather than the scorer guessing.
test("two targets are never in view at the same time, at any difficulty", () => {
  for (const load of [0.75, 1, 1.3, 2.5]) {
    const run = buildRun(20260816, 900, load);
    for (let i = 1; i < run.sightings.length; i++) {
      const prev = run.sightings[i - 1];
      assert.ok(
        run.sightings[i].t >= prev.t + prev.visible,
        `load ${load}: targets ${i - 1} and ${i} overlap`
      );
    }
  }
});

test("every target is inside the run, inside the view, and stays a sane length", () => {
  const run = RUN();
  for (const s of run.sightings) {
    assert.ok(s.t >= 0 && s.t + s.visible <= run.durationSec, `target ${s.id} runs past the clock`);
    assert.ok(s.x > 0 && s.x < 1, `x off screen: ${s.x}`);
    assert.ok(s.y > 0 && s.y < 1, `y off screen: ${s.y}`);
    assert.ok(s.visible > 1 && s.visible <= SIGHTING_VISIBLE_SEC, `visible ${s.visible}s is not sightable`);
    assert.ok(PHASES.some((p) => p.key === s.phase), `unknown phase: ${s.phase}`);
  }
});

test("targets stay in view for less time as the run escalates", () => {
  const run = RUN();
  const first = run.sightings.find((s) => s.phase === "settling");
  const last = run.sightings.find((s) => s.phase === "saturated");
  assert.ok(first && last, "expected targets in the first and last phases");
  assert.ok(last.visible < first.visible, "the lookout must get harder, not stay flat");
});

test("the schedule is deterministic from the seed", () => {
  assert.deepEqual(buildRun(77, 900).sightings, buildRun(77, 900).sightings);
  assert.notDeepEqual(buildRun(77, 900).sightings, buildRun(78, 900).sightings);
});

// ── The scoring ────────────────────────────────────────────────────────────

test("calling every target correctly scores full marks, split by type", () => {
  const run = RUN();
  const s = scoreRun(run, perfect(run)).sightings;
  assert.equal(s.correct, run.sightings.length);
  assert.equal(s.missed, 0);
  assert.equal(s.misidentified, 0);
  assert.equal(s.falseReports, 0);
  assert.equal(s.accuracy, 1);
  for (const type of SIGHTING_TYPES) {
    assert.equal(s.byType[type].correct, s.byType[type].total);
    assert.equal(s.byType[type].missed, 0);
  }
  assert.equal(s.byType.traffic.total + s.byType.landmark.total, s.total);
});

test("looking out of the window and saying nothing scores zero, not null", () => {
  const run = RUN();
  const s = scoreRun(run, []).sightings;
  assert.equal(s.correct, 0);
  assert.equal(s.missed, run.sightings.length);
  assert.equal(s.accuracy, 0);
});

test("the three failure modes are counted separately", () => {
  const sightings = [
    { id: "a", t: 10, type: "traffic", phase: "settling", visible: 5, x: 0.5, y: 0.3 },
    { id: "b", t: 30, type: "landmark", phase: "settling", visible: 5, x: 0.5, y: 0.3 },
    { id: "c", t: 50, type: "traffic", phase: "settling", visible: 5, x: 0.5, y: 0.3 },
  ];
  const s = scoreSightings(sightings, [
    { t: 11, type: "traffic" },    // correct
    { t: 31, type: "traffic" },    // b was a landmark -> misidentified
    { t: 80, type: "traffic" },    // nothing in view -> false report
    // c never called -> missed
  ]);
  assert.equal(s.correct, 1);
  assert.equal(s.misidentified, 1);
  assert.equal(s.falseReports, 1);
  assert.equal(s.missed, 2, "a misidentified target is still not a spotted one");
});

// The behaviour the stream exists to catch. Pressing both buttons on every
// target gets every target "right" — so if wrong calls were free, spamming
// would score full marks without anyone looking out of the window.
test("pressing both buttons on every target cannot beat actually looking", () => {
  const run = RUN();
  const honest = scoreRun(run, perfect(run)).sightings;
  const spam = scoreRun(
    run,
    run.sightings.flatMap((s) => [
      { stream: "sighting", t: s.t + 1, type: "traffic" },
      { stream: "sighting", t: s.t + 1.5, type: "landmark" },
    ])
  ).sightings;

  assert.equal(spam.correct, run.sightings.length, "spamming does hit every target");
  assert.equal(spam.misidentified, run.sightings.length, "and misidentifies every one of them");
  assert.ok(spam.accuracy < honest.accuracy, "spamming must not equal looking");
  assert.ok(spam.accuracy <= 0.6, `spamming scored ${spam.accuracy}, which is too generous`);
});

test("a late call misses its target", () => {
  const run = RUN();
  const s = scoreRun(run, run.sightings.map((sg) => ({ stream: "sighting", t: sg.t + sg.visible + 0.5, type: sg.type }))).sightings;
  assert.equal(s.correct, 0, "a target called after it left the view is not a sighting");
  assert.equal(s.falseReports, run.sightings.length);
});

test("calling the same target twice is not double credit", () => {
  const sightings = [{ id: "a", t: 10, type: "traffic", phase: "settling", visible: 5, x: 0.5, y: 0.3 }];
  const s = scoreSightings(sightings, [
    { t: 11, type: "traffic" },
    { t: 12, type: "traffic" },
  ]);
  assert.equal(s.correct, 1);
  assert.equal(s.total, 1);
  assert.ok(s.accuracy <= 1, "accuracy must never exceed one");
});

test("malformed reports are ignored rather than scoring or crashing", () => {
  const sightings = [{ id: "a", t: 10, type: "traffic", phase: "settling", visible: 5, x: 0.5, y: 0.3 }];
  const s = scoreSightings(sightings, [null, {}, { t: 11 }, { type: "traffic" }, { t: "x", type: "traffic" }, { t: 11, type: "ufo" }]);
  assert.equal(s.correct, 0);
  assert.equal(s.falseReports, 0, "a malformed report is not a false call, it is not a call at all");
});

test("a run with no targets scores null, never a zero", () => {
  assert.equal(scoreSightings([], [{ t: 1, type: "traffic" }]), null);
  assert.equal(scoreSightings(null, []), null);
});

// ── The promise it must not break ──────────────────────────────────────────

test("the lookout is reported beside the composite and never inside it", () => {
  const run = RUN();
  const base = [{ stream: "arithmetic", id: run.arithmetic[0].id, chosen: run.arithmetic[0].answerIndex }];
  const withLookout = scoreRun(run, [...base, ...perfect(run)]);
  const without = scoreRun(run, base);

  assert.equal(withLookout.composite, without.composite, "the lookout leaked into the composite");
  assert.equal(withLookout.mean, without.mean);
  assert.equal(withLookout.spread, without.spread);
  assert.equal(withLookout.sightings.accuracy, 1);
  assert.equal(without.sightings.accuracy, 0);
  assert.equal(withLookout.weakest, without.weakest, "the lookout must not change which stream is named weakest");
});
