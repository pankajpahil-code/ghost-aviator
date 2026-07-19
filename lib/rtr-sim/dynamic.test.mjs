// node --test suite for WorldGen + DialogueDirector (Ghost Tower P1).
// The crown property: every generated flight is SELF-CONSISTENT — the values
// ATC speaks are exactly what the scorer expects, for any seed.

import { test } from "node:test";
import assert from "node:assert/strict";
import { rollWorld } from "./world.mjs";
import {
  buildVfrDeparture, speakDigits, speakAltitude, speakCallsign, speakCallsignShort,
} from "./director.mjs";
import { normalize, scoreTransmission } from "./engine.mjs";

test("world: same seed rolls the identical world (audit trail)", () => {
  assert.deepEqual(rollWorld(42), rollWorld(42));
  assert.deepEqual(rollWorld(20260719), rollWorld(20260719));
});

test("world: seeds produce real variety", () => {
  const worlds = Array.from({ length: 60 }, (_, i) => rollWorld(i + 1));
  assert.ok(new Set(worlds.map(w => w.airport.name)).size >= 3, "airports vary");
  assert.ok(new Set(worlds.map(w => w.qnh)).size >= 8, "QNH varies");
  assert.ok(new Set(worlds.map(w => w.callsign.reg)).size >= 30, "callsigns vary");
  assert.ok(worlds.some(w => w.events.conditionalLineup) &&
            worlds.some(w => !w.events.conditionalLineup), "conditional event toggles");
});

test("world: the QNH trap is plausible but never correct", () => {
  for (let s = 1; s <= 50; s++) {
    const w = rollWorld(s);
    assert.notEqual(w.qnhTrap, w.qnh, `seed ${s}`);
    assert.equal(w.qnhTrap.length, w.qnh.length, `seed ${s}`);
  }
});

test("speech helpers round-trip through the engine's normalization", () => {
  assert.equal(speakDigits("1013"), "one zero one three");
  assert.equal(normalize(speakDigits("118.35")).join(""), "118.35");
  assert.equal(speakAltitude(2500), "two thousand five hundred feet");
  assert.equal(normalize(speakAltitude(1500)).join(" "), "1500 feet");
  assert.equal(speakCallsign("VT-ABC"), "Victor Tango Alfa Bravo Charlie");
  assert.equal(speakCallsignShort("VT-ABC"), "Victor Bravo Charlie");
  assert.equal(normalize(speakCallsign("VT-KLM")).join(""), normalize("VT-KLM").join(""));
});

test("director: same seed builds the identical flight", () => {
  const a = buildVfrDeparture(rollWorld(7));
  const b = buildVfrDeparture(rollWorld(7));
  assert.deepEqual(a, b);
});

test("director: conditional line-up appears only when the world armed it", () => {
  for (const s of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) {
    const w = rollWorld(s);
    const ids = buildVfrDeparture(w).steps.map(st => st.id);
    assert.equal(ids.includes("conditional"), w.events.conditionalLineup, `seed ${s}`);
    assert.equal(ids.includes("lineup"), !w.events.conditionalLineup, `seed ${s}`);
  }
});

// THE property test: for many seeds, composing the correct chips of each step
// must satisfy every critical slot with zero wrong values — i.e. what the
// director says is always exactly what the engine expects.
test("director×engine: every generated step is fully satisfiable (30 seeds)", () => {
  for (let s = 1; s <= 30; s++) {
    const flight = buildVfrDeparture(rollWorld(s));
    for (const step of flight.steps) {
      const utterance = step.chips.join(" ") + " " + flight.callsign;
      const res = scoreTransmission(step.expect, utterance);
      assert.deepEqual(res.missingCritical, [],
        `seed ${s} step ${step.id}: missing ${res.missingCritical}`);
      assert.deepEqual(res.wrongCritical, [],
        `seed ${s} step ${step.id}: wrong ${res.wrongCritical}`);
      assert.notEqual(res.callsign, "missing", `seed ${s} step ${step.id}: callsign`);
    }
  }
});

test("director: ATC transmissions carry the rolled values verbatim", () => {
  const w = rollWorld(1234);
  const flight = buildVfrDeparture(w);
  const allAtc = normalize(
    flight.steps.map(st => [st.atcBefore, st.atcAfter].filter(Boolean).join(" ")).join(" ")
  ).join(" ");
  assert.ok(allAtc.includes(w.qnh), "QNH spoken");
  assert.ok(allAtc.includes(w.airport.runway), "runway spoken");
  assert.ok(allAtc.includes(w.airport.tower), "tower frequency spoken");
});
