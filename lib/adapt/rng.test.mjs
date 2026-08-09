import { test } from "node:test";
import assert from "node:assert/strict";
import { makeRng, irange, istep, pick, shuffle, subSeed } from "./rng.mjs";
import { makeRng as worldMakeRng } from "../rtr-sim/world.mjs";

test("same seed reproduces the same sequence", () => {
  const a = makeRng(12345);
  const b = makeRng(12345);
  for (let i = 0; i < 200; i++) assert.equal(a(), b());
});

test("different seeds diverge", () => {
  const a = makeRng(1);
  const b = makeRng(2);
  let same = 0;
  for (let i = 0; i < 100; i++) if (a() === b()) same++;
  assert.equal(same, 0);
});

test("output stays in [0, 1)", () => {
  const rnd = makeRng(99);
  for (let i = 0; i < 5000; i++) {
    const v = rnd();
    assert.ok(v >= 0 && v < 1, `out of range: ${v}`);
  }
});

// Guards the deliberate duplication documented in rng.mjs: if either copy of
// mulberry32 is ever "improved", this fails instead of silently splitting the
// two simulators onto different random streams.
test("stays in lockstep with Ghost Tower's makeRng", () => {
  const a = makeRng(0xC0FFEE);
  const b = worldMakeRng(0xC0FFEE);
  for (let i = 0; i < 500; i++) assert.equal(a(), b());
});

test("irange is inclusive at both ends and never escapes them", () => {
  const rnd = makeRng(7);
  const seen = new Set();
  for (let i = 0; i < 4000; i++) {
    const v = irange(rnd, 3, 7);
    assert.ok(Number.isInteger(v) && v >= 3 && v <= 7, `escaped: ${v}`);
    seen.add(v);
  }
  assert.deepEqual([...seen].sort((x, y) => x - y), [3, 4, 5, 6, 7]);
});

test("istep only yields multiples of step within range", () => {
  const rnd = makeRng(21);
  for (let i = 0; i < 2000; i++) {
    const v = istep(rnd, 100, 200, 10);
    assert.equal(v % 10, 0);
    assert.ok(v >= 100 && v <= 200);
  }
});

test("pick returns members of the array", () => {
  const rnd = makeRng(4);
  const arr = ["a", "b", "c"];
  for (let i = 0; i < 500; i++) assert.ok(arr.includes(pick(rnd, arr)));
});

test("shuffle preserves membership and leaves the input untouched", () => {
  const rnd = makeRng(55);
  const input = [1, 2, 3, 4, 5, 6];
  const frozen = input.slice();
  const out = shuffle(rnd, input);
  assert.deepEqual(input, frozen, "shuffle must not mutate its argument");
  assert.deepEqual(out.slice().sort((a, b) => a - b), frozen);
});

test("shuffle actually reorders across many runs", () => {
  const rnd = makeRng(8);
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  let moved = 0;
  for (let i = 0; i < 100; i++) {
    if (shuffle(rnd, input).some((v, idx) => v !== input[idx])) moved++;
  }
  assert.ok(moved > 90, `expected most shuffles to reorder, got ${moved}/100`);
});

test("subSeed is deterministic and label-sensitive", () => {
  assert.equal(subSeed(42, "maths"), subSeed(42, "maths"));
  assert.notEqual(subSeed(42, "maths"), subSeed(42, "physics"));
  assert.notEqual(subSeed(42, "maths"), subSeed(43, "maths"));
});

test("subSeed yields a usable uint32", () => {
  for (const label of ["maths", "physics", "spatial", "memory", ""]) {
    const s = subSeed(2026, label);
    assert.ok(Number.isInteger(s) && s >= 0 && s <= 0xFFFFFFFF, `bad sub-seed: ${s}`);
    const rnd = makeRng(s);
    const v = rnd();
    assert.ok(v >= 0 && v < 1);
  }
});
