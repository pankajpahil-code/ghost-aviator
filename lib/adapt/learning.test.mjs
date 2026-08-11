import { test } from "node:test";
import assert from "node:assert/strict";
import { slope, pairedImprovement, learningFor, learningNote, MIN_SITTINGS, IMPROVING } from "./learning.mjs";

// ── The slope ──────────────────────────────────────────────────────────────

test("a slope needs enough sittings to be a trend rather than a line", () => {
  assert.equal(slope([]), null);
  assert.equal(slope([5]), null);
  assert.equal(slope([5, 7]), null, "two points are a line, not a trend");
  assert.ok(slope([5, 6, 7]) !== null);
  assert.ok(MIN_SITTINGS >= 3);
});

test("a perfectly steady climb reports exactly its step", () => {
  assert.equal(slope([3, 4, 5, 6, 7]), 1);
  assert.equal(slope([2, 4, 6]), 2);
});

test("no movement is a zero slope, not a null", () => {
  assert.equal(slope([6, 6, 6, 6]), 0);
});

test("a decline is reported as negative rather than floored at zero", () => {
  assert.ok(slope([8, 7, 6, 5]) < 0);
});

test("one bad night at the end does not flip the trend", () => {
  // Last-minus-first would call this a decline. Least squares gives every
  // sitting a vote and correctly still sees a rising student.
  const climbThenStumble = [3, 5, 6, 7, 8, 4];
  assert.ok(climbThenStumble[climbThenStumble.length - 1] < climbThenStumble[0] + 2);
  assert.ok(slope(climbThenStumble) > 0, "a single bad sitting flipped the trend");
});

test("non-numeric sittings are ignored rather than poisoning the slope", () => {
  assert.equal(slope([3, null, 4, undefined, 5, NaN]), slope([3, 4, 5]));
});

// ── The paired attempt ─────────────────────────────────────────────────────

test("paired improvement reports both attempts and the difference", () => {
  const p = pairedImprovement(4, 7);
  assert.equal(p.first, 4);
  assert.equal(p.second, 7);
  assert.equal(p.delta, 3);
});

test("a decline between paired attempts is reported honestly", () => {
  assert.equal(pairedImprovement(7, 5).delta, -2);
});

test("a student already at the ceiling is flagged, not marked as failing to learn", () => {
  // The commonest misreading of a paired-attempt score: someone who scored 9
  // first time has nowhere to improve to.
  assert.equal(pairedImprovement(9, 9).atCeiling, true);
  assert.equal(pairedImprovement(9, 9).delta, 0);
  assert.equal(pairedImprovement(5, 9).atCeiling, false);
});

test("paired improvement refuses to invent a result from missing attempts", () => {
  assert.equal(pairedImprovement(null, 5), null);
  assert.equal(pairedImprovement(5, undefined), null);
});

// ── The full picture ───────────────────────────────────────────────────────

test("a fresh student is told what is missing, not shown a fabricated trend", () => {
  const l = learningFor([5]);
  assert.equal(l.readable, false);
  assert.equal(l.slope, null);
  assert.equal(l.direction, null);
  assert.equal(l.sittingsNeeded, MIN_SITTINGS - 1);
  assert.equal(learningNote(l), null, "there is nothing honest to say yet");
});

test("readable is the flag the UI checks, and it tracks the slope exactly", () => {
  for (const n of [0, 1, 2, 3, 4, 8]) {
    const l = learningFor(Array.from({ length: n }, (_, i) => 4 + i * 0.5));
    assert.equal(l.readable, l.slope !== null, `${n} sittings disagreed`);
    if (l.readable) assert.equal(l.sittingsNeeded, 0);
  }
});

test("first, latest, best and ground gained are all reported from the real series", () => {
  const l = learningFor([4, 7, 5, 6]);
  assert.equal(l.first, 4);
  assert.equal(l.latest, 6);
  assert.equal(l.best, 7, "best is the ceiling reached, not the latest");
  assert.equal(l.gained, 2);
  assert.equal(l.sittings, 4);
});

test("direction is classified against the published threshold, not a hunch", () => {
  assert.equal(learningFor([3, 5, 7]).direction, "improving");
  assert.equal(learningFor([7, 5, 3]).direction, "slipping");
  assert.equal(learningFor([6, 6, 6]).direction, "flat");
  // Right at the boundary, and just inside it.
  assert.equal(learningFor([5, 5 + IMPROVING, 5 + 2 * IMPROVING]).direction, "improving");
  assert.equal(learningFor([5, 5.1, 5.2]).direction, "flat");
});

// ── What the student is told ───────────────────────────────────────────────

test("every readable curve produces a note, and every note names the sittings", () => {
  for (const series of [[3, 5, 7], [7, 5, 3], [6, 6, 6]]) {
    const note = learningNote(learningFor(series));
    assert.ok(note, `no note for ${series}`);
    assert.match(note, /3 sittings/);
  }
});

test("the improving note explains WHY the rate matters, not just that it rose", () => {
  const note = learningNote(learningFor([3, 5, 7]));
  assert.match(note, /how quickly you take training/i);
});

test("the slipping note offers the likeliest cause instead of implying lost ability", () => {
  const note = learningNote(learningFor([8, 6, 4]));
  assert.match(note, /fatigue|tired|rush/i);
});

test("no note claims to predict a real assessment outcome", () => {
  // The one thing this module must never say. A practice slope does not
  // forecast an airline's decision, and saying so would be a lie a student
  // could plan a career around.
  const banned = /will pass|guarantee|predict your|you will be selected|airline will/i;
  for (const series of [[3, 5, 7], [7, 5, 3], [6, 6, 6], [9, 9, 9]]) {
    assert.doesNotMatch(learningNote(learningFor(series)) ?? "", banned, String(series));
  }
});
