// The interruption stream, widened 2026-08-16 from arithmetic-only to five
// families, and the response-time measurement added alongside it.
//
// Same discipline as the rest of this module: the generator computes its own
// answers, so a test that asked the generator whether it was right would prove
// nothing. Everything below re-derives the truth from the RENDERED STEM — the
// exact characters a student reads — or from the authored data the family is
// built on. Two of these tests check invariants in that data rather than in
// the output, because that is where these families can actually go wrong.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildRun, scoreRun, INTERRUPTION_FAMILIES, ODD_SETS, SPELLINGS, median,
} from "./divided-attention.mjs";

const items = (seed, dur = 900) => buildRun(seed, dur).arithmetic;
const of = (seed, family, dur = 900) => items(seed, dur).filter((i) => i.family === family);

// ── The families are dealt at all ──────────────────────────────────────────

test("a long run deals every interruption family", () => {
  const families = new Set(items(20260816).map((i) => i.family));
  assert.deepEqual([...families].sort(), Object.keys(INTERRUPTION_FAMILIES).sort());
});

test("every item declares a family the registry knows", () => {
  for (const seed of [1, 99, 20260816]) {
    for (const item of items(seed)) {
      assert.ok(INTERRUPTION_FAMILIES[item.family], `unknown family: ${item.family}`);
    }
  }
});

// ── The authored data, which is where these families can go wrong ──────────

// The whole correctness of odd-one-out rests on one invariant: a word cannot be
// both "same" and "odd". If it ever were, the generator would mark a right
// answer wrong, and no amount of testing the OUTPUT would find it.
test("no odd-one-out set can contradict itself", () => {
  let words = 0;
  for (const set of ODD_SETS) {
    assert.ok(set.same.length >= 3, "need at least three to draw three from");
    assert.ok(set.odd.length >= 1);
    for (const w of set.same) assert.ok(!set.odd.includes(w), `"${w}" is in both lists`);
    assert.equal(new Set(set.same).size, set.same.length, "duplicate in same list");
    assert.equal(new Set(set.odd).size, set.odd.length, "duplicate in odd list");
    for (const w of [...set.same, ...set.odd]) {
      assert.equal(w, w.trim().toUpperCase(), `"${w}" is not normalised`);
      words++;
    }
  }
  // A word that is "same" in one set and "odd" in another is defensible in
  // isolation but reads as a contradiction to a student who meets both.
  for (const a of ODD_SETS) {
    for (const b of ODD_SETS) {
      if (a === b) continue;
      for (const w of a.same) assert.ok(!b.odd.includes(w), `"${w}" is same in one set and odd in another`);
    }
  }
  assert.ok(words > 20, "the pool is too small to avoid repetition in a long run");
});

test("no misspelling is another word's correct spelling", () => {
  const correct = new Set(SPELLINGS.map((e) => e.correct));
  assert.equal(correct.size, SPELLINGS.length, "duplicate correct spellings");
  for (const entry of SPELLINGS) {
    assert.equal(entry.wrong.length, 3, `${entry.correct} needs exactly three misspellings`);
    assert.equal(new Set(entry.wrong).size, 3, `${entry.correct} has duplicate misspellings`);
    for (const w of entry.wrong) {
      assert.notEqual(w, entry.correct);
      assert.ok(!correct.has(w), `"${w}" is a misspelling here and a correct spelling elsewhere`);
    }
  }
});

// ── The generated items, re-derived from what is printed ───────────────────

test("a spelling item offers exactly one correct spelling and marks it", () => {
  const correct = new Set(SPELLINGS.map((e) => e.correct));
  let checked = 0;
  for (const seed of [3, 55, 20260816]) {
    for (const item of of(seed, "spelling")) {
      assert.ok(correct.has(item.options[item.answerIndex]), `marked "${item.options[item.answerIndex]}" correct`);
      assert.equal(item.options.filter((o) => correct.has(o)).length, 1, `"${item.stem}" has more than one right answer`);
      checked++;
    }
  }
  assert.ok(checked >= 3, "expected several spelling items across those runs");
});

test("an odd-one-out item marks a word from the odd list, against three from one same list", () => {
  let checked = 0;
  for (const seed of [7, 21, 20260816]) {
    for (const item of of(seed, "odd")) {
      const answer = item.options[item.answerIndex];
      const others = item.options.filter((_, i) => i !== item.answerIndex);
      const set = ODD_SETS.find((s) => s.odd.includes(answer) && others.every((o) => s.same.includes(o)));
      assert.ok(set, `no set explains "${answer}" against ${others.join(", ")}`);
      checked++;
    }
  }
  assert.ok(checked >= 3);
});

test("heading answers recompute from the stem a student actually reads", () => {
  let checked = 0;
  for (const seed of [2, 44, 20260816, 71]) {
    for (const item of of(seed, "heading")) {
      const answer = item.options[item.answerIndex];
      const recip = item.stem.match(/^Reciprocal of (\d{3})\?$/);
      const turn = item.stem.match(/^Heading (\d{3}), turn (right|left) (\d+)°\. New heading\?$/);
      assert.ok(recip || turn, `unparseable heading stem: "${item.stem}"`);
      const expect = recip
        ? (Number(recip[1]) + 180) % 360
        : ((((turn[2] === "right" ? Number(turn[1]) + Number(turn[3]) : Number(turn[1]) - Number(turn[3])) % 360) + 360) % 360);
      assert.equal(answer, String(expect).padStart(3, "0"), `"${item.stem}" was marked ${answer}`);
      checked++;
    }
  }
  assert.ok(checked >= 4, "expected several heading items across those runs");
});

test("every heading option is a legal three-digit compass heading", () => {
  for (const item of of(20260816, "heading")) {
    for (const o of item.options) {
      assert.match(o, /^\d{3}$/, `not three digits: ${o}`);
      assert.ok(Number(o) >= 0 && Number(o) <= 359, `off the compass: ${o}`);
    }
  }
});

test("series answers continue the series printed in the stem", () => {
  let checked = 0;
  for (const seed of [5, 63, 20260816]) {
    for (const item of of(seed, "series")) {
      const terms = item.stem.replace(/\?$/, "").trim().split(/\s+/).map(Number);
      assert.equal(terms.length, 6, `expected six printed terms in "${item.stem}"`);
      const step = terms[1] - terms[0];
      for (let i = 1; i < terms.length; i++) {
        assert.equal(terms[i] - terms[i - 1], step, `"${item.stem}" is not a constant series`);
      }
      assert.equal(Number(item.options[item.answerIndex]), terms[5] + step);
      assert.ok(Number(item.options[item.answerIndex]) > 0, "a series must not run to zero or below");
      checked++;
    }
  }
  assert.ok(checked >= 3);
});

// ── Response time ──────────────────────────────────────────────────────────

test("median handles even, odd and empty", () => {
  assert.equal(median([]), null);
  assert.equal(median([4]), 4);
  assert.equal(median([1, 2, 3]), 2);
  assert.equal(median([1, 2, 3, 4]), 2.5);
  assert.equal(median([9, 1, 5]), 5, "must sort before taking the middle");
});

test("response time is measured on correct answers and does not touch accuracy", () => {
  const run = buildRun(20260816, 900);
  const fast = [
    ...run.radio.filter((c) => c.mine).map((c) => ({ stream: "radio", t: c.t + 0.5 })),
    ...run.arithmetic.map((a) => ({ stream: "arithmetic", id: a.id, chosen: a.answerIndex, t: a.t + 1 })),
  ];
  const slow = [
    ...run.radio.filter((c) => c.mine).map((c) => ({ stream: "radio", t: c.t + c.window * 0.9 })),
    ...run.arithmetic.map((a) => ({ stream: "arithmetic", id: a.id, chosen: a.answerIndex, t: a.t + a.window * 0.9 })),
  ];
  const f = scoreRun(run, fast);
  const s = scoreRun(run, slow);

  assert.equal(f.arithmetic.accuracy, s.arithmetic.accuracy, "latency changed accuracy");
  assert.equal(f.radio.accuracy, s.radio.accuracy);
  assert.equal(f.composite, s.composite, "latency leaked into the composite");

  assert.ok(f.responseTime.interruptions.medianSec < s.responseTime.interruptions.medianSec);
  assert.ok(f.responseTime.radio.medianSec < s.responseTime.radio.medianSec);
  assert.ok(f.responseTime.interruptions.medianWindowUsed < 0.35, "a one-second answer is not most of the window");
  assert.ok(s.responseTime.interruptions.medianWindowUsed > 0.8);
  assert.equal(f.responseTime.interruptions.n, run.arithmetic.length);
});

test("a wrong answer is never timed, however fast it came", () => {
  const run = buildRun(20260816, 900);
  const r = scoreRun(run, run.arithmetic.map((a) => ({
    stream: "arithmetic", id: a.id, chosen: (a.answerIndex + 1) % 4, t: a.t + 0.1,
  })));
  assert.equal(r.arithmetic.correct, 0);
  assert.equal(r.responseTime.interruptions, null, "timed a wrong answer");
});

test("an untimed run reports null response times, never a zero", () => {
  const run = buildRun(20260816, 900);
  const r = scoreRun(run, run.arithmetic.map((a) => ({ stream: "arithmetic", id: a.id, chosen: a.answerIndex })));
  assert.equal(r.arithmetic.accuracy, 1, "answers must still mark without a timestamp");
  assert.equal(r.responseTime.interruptions, null);
  assert.equal(r.responseTime.radio, null);
});

test("only the first key on a call is timed, so hammering the mic wins nothing", () => {
  const run = buildRun(20260816, 900);
  const call = run.radio.find((c) => c.mine);
  const r = scoreRun(run, [
    { stream: "radio", t: call.t + call.window * 0.8 },
    { stream: "radio", t: call.t + call.window * 0.9 },
  ]);
  assert.equal(r.responseTime.radio.n, 1, "a second press on the same call was counted");
  assert.ok(Math.abs(r.responseTime.radio.medianSec - call.window * 0.8) < 1e-9);
});
