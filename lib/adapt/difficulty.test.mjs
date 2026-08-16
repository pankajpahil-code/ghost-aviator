// The difficulty selector, added 2026-08-16.
//
// The thing under test is not really "does gentle give more time". It is the
// promise that goes with it: **the criterion ladder does not move**, so a
// stanine means the same raw performance at every setting, and the settings are
// therefore NOT comparable and must never be pooled. Every test below defends
// one half of that bargain.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildSession, MODULES, DIFFICULTY, DIFFICULTY_KEYS, DEFAULT_DIFFICULTY, criterionNormFor,
} from "./session.mjs";
import { learningByDifficulty, mostPractised } from "./learning.mjs";

const SEED = 20260816;
const mod = (session, id) => session.modules.find((m) => m.id === id);

test("the three settings exist and standard is the default", () => {
  assert.deepEqual(DIFFICULTY_KEYS, ["gentle", "standard", "hard"]);
  assert.equal(DEFAULT_DIFFICULTY, "standard");
  assert.equal(DIFFICULTY.standard.clockScale, 1, "standard must be the published clock, unmodified");
  assert.equal(DIFFICULTY.standard.loadScale, 1);
  for (const key of DIFFICULTY_KEYS) {
    const d = DIFFICULTY[key];
    assert.equal(d.key, key, "a setting whose key disagrees with its slot will mis-store results");
    assert.ok(d.label && d.blurb, `${key} needs a label and a blurb — it is shown to a student`);
    assert.ok(d.clockScale > 0 && d.loadScale > 0);
  }
});

test("a session built with no setting is identical to one built at standard", () => {
  assert.deepEqual(buildSession(SEED), buildSession(SEED, undefined, "standard"));
});

test("an unknown setting is refused rather than silently defaulted", () => {
  assert.throws(() => buildSession(SEED, undefined, "extreme"), RangeError);
  assert.throws(() => buildSession(SEED, undefined, ""), RangeError);
});

test("every module and the session record the setting they were built at", () => {
  for (const key of DIFFICULTY_KEYS) {
    const s = buildSession(SEED, undefined, key);
    assert.equal(s.difficulty, key);
    for (const m of s.modules) assert.equal(m.difficulty, key, `${m.id} did not record its setting`);
  }
});

// ── The clock moves. The paper does not. ───────────────────────────────────

test("timed papers get more or less clock, and never a different number of items", () => {
  const ids = ["aviation-maths", "physics-mechanical", "spatial-pattern", "english-language"];
  for (const id of ids) {
    const g = mod(buildSession(SEED, undefined, "gentle"), id);
    const s = mod(buildSession(SEED, undefined, "standard"), id);
    const h = mod(buildSession(SEED, undefined, "hard"), id);

    assert.ok(g.timeLimitSec > s.timeLimitSec, `${id}: gentle must give more time`);
    assert.ok(h.timeLimitSec < s.timeLimitSec, `${id}: hard must give less time`);
    assert.equal(s.timeLimitSec, MODULES[id].timeLimitSec, `${id}: standard must be the published clock`);

    assert.equal(g.items.length, s.items.length);
    assert.equal(h.items.length, s.items.length);
    assert.deepEqual(g.items, s.items, "the paper itself must not change with the setting");
    assert.deepEqual(h.items, s.items);
  }
});

// A shorter clock on a duration-defined task is a SHORTER task, not a harder
// one — it would make "hard" the least demanding setting on offer. This is the
// defect the first implementation had, and this test is why it did not ship.
test("duration-defined tasks run for the same length at every setting", () => {
  for (const key of DIFFICULTY_KEYS) {
    const s = buildSession(SEED, undefined, key);
    assert.equal(mod(s, "control-coordination").run.durationSec, MODULES["control-coordination"].durationSec);
    assert.equal(mod(s, "divided-attention").run.durationSec, MODULES["divided-attention"].durationSec);
  }
});

test("the multitasking run gets denser and its windows tighter, not shorter", () => {
  const runs = Object.fromEntries(
    DIFFICULTY_KEYS.map((k) => [k, mod(buildSession(SEED, undefined, k), "divided-attention").run])
  );
  const perMin = (r) => r.arithmetic.length / (r.durationSec / 60);

  assert.ok(perMin(runs.hard) > perMin(runs.standard), "hard must send more interruptions per minute");
  assert.ok(perMin(runs.gentle) < perMin(runs.standard), "gentle must send fewer");
  assert.ok(runs.hard.arithmetic[0].window < runs.standard.arithmetic[0].window, "hard must allow less time each");
  assert.ok(runs.gentle.arithmetic[0].window > runs.standard.arithmetic[0].window);
  assert.ok(runs.hard.radio.length > runs.gentle.radio.length, "hard must have a busier frequency");
  assert.equal(runs.standard.loadScale, 1);
});

test("a setting that changes nothing for a module says so, rather than implying it did", () => {
  const s = buildSession(SEED, undefined, "hard");
  assert.equal(mod(s, "control-coordination").difficultyApplies, false, "tracking is self-normalising; claiming it got harder would be false");
  assert.equal(mod(s, "attitudes-airmanship").difficultyApplies, false, "an untimed questionnaire has no difficulty");
  assert.equal(mod(s, "aviation-maths").difficultyApplies, true);
  assert.equal(mod(s, "divided-attention").difficultyApplies, true);

  // At standard nothing is modified at all, so nothing may claim it was.
  for (const m of buildSession(SEED, undefined, "standard").modules) {
    assert.equal(m.difficultyApplies, false, `${m.id} claims a modification at the default setting`);
  }
});

// ── The bargain: the ladder does not move ──────────────────────────────────

test("the criterion ladder is identical at every setting — no invented multiplier", () => {
  const ladder = JSON.stringify(criterionNormFor(20));
  for (const key of DIFFICULTY_KEYS) {
    const m = mod(buildSession(SEED, undefined, key), "aviation-maths");
    assert.equal(JSON.stringify(criterionNormFor(m.items.length)), ladder,
      "a difficulty that moves the cuts is a difficulty that rewrites what the score means");
  }
});

// ── Which is why the settings must never be pooled ─────────────────────────

test("learning curves are kept separate per setting", () => {
  const by = learningByDifficulty([
    { score: 3, difficulty: "hard" },
    { score: 4, difficulty: "hard" },
    { score: 5, difficulty: "hard" },
    { score: 8, difficulty: "gentle" },
  ]);
  assert.deepEqual(Object.keys(by).sort(), ["gentle", "hard"]);
  assert.equal(by.hard.sittings, 3);
  assert.equal(by.gentle.sittings, 1);
  assert.equal(by.hard.direction, "improving");
  // One sitting cannot be a trend, at any setting.
  assert.equal(by.gentle.readable, false);
  assert.equal(mostPractised(by), "hard");
});

test("a jump caused only by switching to an easier setting is never read as progress", () => {
  const attempts = [
    { score: 3, difficulty: "hard" },
    { score: 3, difficulty: "hard" },
    { score: 3, difficulty: "hard" },
    { score: 9, difficulty: "gentle" },
  ];
  const by = learningByDifficulty(attempts);
  assert.equal(by.hard.direction, "flat", "the hard curve is flat and must stay flat");
  assert.equal(by.hard.gained, 0);
  assert.ok(!by.gentle.readable, "a single gentle sitting says nothing");
});

test("sittings taken before settings existed are assumed standard, and it is stated", () => {
  const by = learningByDifficulty([{ score: 4 }, { score: 5 }, { score: 6 }]);
  assert.deepEqual(Object.keys(by), ["standard"]);
  assert.equal(by.standard.sittings, 3);
  assert.equal(learningByDifficulty([{ score: 4 }], "hard").hard.sittings, 1, "the fallback is caller-visible, not hardcoded");
});

test("malformed attempts are dropped, not counted as zeros", () => {
  const by = learningByDifficulty([
    { score: 5, difficulty: "hard" },
    { score: null, difficulty: "hard" },
    null,
    { difficulty: "hard" },
  ]);
  assert.equal(by.hard.sittings, 1);
  assert.equal(mostPractised({}), null);
  assert.equal(mostPractised(null), null);
});

// ── The setting must survive all the way to the stored row ─────────────────

import { buildResultRows, findForbidden } from "./results-core.mjs";
import { scoreModule } from "./session.mjs";

test("a stored row records the setting its score was earned at", () => {
  for (const key of DIFFICULTY_KEYS) {
    const session = buildSession(SEED, ["aviation-maths"], key);
    const m = session.modules[0];
    const scored = scoreModule(m, m.items.map((it) => it.answerIndex), 600);
    assert.equal(scored.difficulty, key, "the result did not carry its setting");

    const [row] = buildResultRows(SEED, [scored], "00000000-0000-0000-0000-000000000001");
    assert.equal(row.detail.difficulty, key, "the setting did not reach the stored row");
    assert.equal(row.detail.difficultyApplies, key !== "standard");
    assert.equal(findForbidden(row), null, "the setting must not have dragged anything forbidden along");
  }
});
