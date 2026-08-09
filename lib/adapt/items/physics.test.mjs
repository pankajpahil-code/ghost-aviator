import { test } from "node:test";
import assert from "node:assert/strict";
import { generateItem, FAMILIES } from "./physics.mjs";

// As with the maths generators: every answer is recomputed here from the item's
// own inputs, independently of the expression the generator used, and the stem
// is checked to be printing the same numbers the generator scored with.

const SEEDS = 300;
const G = 9.81;

function valueOf(option) {
  const m = /^(-?[\d,]+(?:\.\d+)?)/.exec(option);
  assert.ok(m, `option has no leading number: ${option}`);
  return Number(m[1].replace(/,/g, ""));
}

const answerValue = (item) => valueOf(item.options[item.answerIndex]);
const bareStem = (item) => item.stem.replace(/,/g, "");

function eachSeed(family, fn) {
  for (let s = 1; s <= SEEDS; s++) fn(generateItem(family, s * 7919), s);
}

// ── Contract shared with every ADAPT knowledge module ───────────────────────

test("every item is structurally sound", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item, seed) => {
      assert.equal(item.family, family);
      assert.equal(item.options.length, 4);
      assert.equal(new Set(item.options).size, 4, `${family} seed ${seed}: duplicate option text`);
      assert.ok(item.answerIndex >= 0 && item.answerIndex < 4);
      assert.equal(item.optionNotes[item.answerIndex], null);
      assert.ok(item.stem.length > 20);
      assert.ok(item.solution.length > 15);
      for (const opt of item.options) assert.ok(valueOf(opt) > 0, `${family}: non-positive option "${opt}"`);
    });
  }
});

test("every answer is a whole number — these are no-calculator items", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item) => {
      assert.ok(Number.isInteger(answerValue(item)), `${family}: answer ${answerValue(item)} is not whole`);
    });
  }
});

test("every item carries at least two distractors that teach a named error", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item, seed) => {
      const named = item.optionNotes.filter((n, i) => i !== item.answerIndex && n).length;
      assert.ok(named >= 2, `${family} seed ${seed}: only ${named} taught distractor(s)`);
    });
  }
});

test("at most one option is wildly out of scale with the answer", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item, seed) => {
      const correct = answerValue(item);
      const wild = item.options.filter((opt, i) => {
        if (i === item.answerIndex) return false;
        const v = valueOf(opt);
        return v < correct / 5 || v > correct * 5;
      }).length;
      assert.ok(wild <= 1, `${family} seed ${seed}: ${wild} options are >5x off`);
    });
  }
});

test("numbers never use lakh grouping", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item) => {
      for (const text of [item.stem, item.solution, ...item.options]) {
        assert.doesNotMatch(text, /,\d{2},/, `${family}: lakh grouping in "${text}"`);
      }
    });
  }
});

test("the correct answer does not sit in a predictable position", () => {
  for (const family of FAMILIES) {
    const counts = [0, 0, 0, 0];
    eachSeed(family, (item) => counts[item.answerIndex]++);
    for (let i = 0; i < 4; i++) {
      assert.ok(counts[i] > SEEDS * 0.1, `${family}: position ${i} used only ${counts[i]}/${SEEDS} times`);
    }
  }
});

test("generation is deterministic and seed-sensitive", () => {
  for (const family of FAMILIES) {
    assert.deepEqual(generateItem(family, 4242), generateItem(family, 4242));
    assert.notDeepEqual(generateItem(family, 1), generateItem(family, 2));
  }
});

test("an unknown family is refused", () => {
  assert.throws(() => generateItem("alchemy", 1), RangeError);
});

// Any constant or approximation the answer depends on must be written into the
// stem. Otherwise the item silently tests which textbook the student read.
test("every item that depends on a constant states it in the stem", () => {
  eachSeed("weight-from-mass", (item) => assert.ok(item.stem.includes("9.81")));
  eachSeed("pressure-altitude-lapse", (item) => assert.ok(item.stem.includes("30 ft")));
  eachSeed("lift-speed-change", (item) =>
    assert.ok(/angle of attack.*density.*wing area/.test(item.stem), "lift item must state what is held constant")
  );
  eachSeed("kinematics-velocity", (item) => assert.ok(/from rest|uniformly/.test(item.stem)));
});

// ── Per-family independent recomputation ───────────────────────────────────

test("newton-force: F = m x a", () => {
  eachSeed("newton-force", (item) => {
    const { mass, accel, force } = item.meta;
    assert.equal(answerValue(item), mass * accel);
    assert.equal(answerValue(item), force);
    const s = bareStem(item);
    assert.ok(s.includes(String(mass)) && s.includes(String(accel)));
  });
});

test("weight-from-mass: W = m x g", () => {
  eachSeed("weight-from-mass", (item) => {
    const { mass, weight } = item.meta;
    assert.equal(answerValue(item), Math.round(mass * G));
    assert.equal(answerValue(item), weight);
    assert.ok(answerValue(item) > mass, "a weight in newtons exceeds the mass in kilograms");
    assert.ok(bareStem(item).includes(String(mass)));
  });
});

test("net-acceleration: a = (thrust - drag) / mass", () => {
  eachSeed("net-acceleration", (item) => {
    const { mass, accel, net, drag, thrust } = item.meta;
    assert.equal(thrust - drag, net, "stated thrust and drag must differ by the net force");
    assert.ok(thrust > drag, "the aircraft must actually be accelerating");
    assert.equal(answerValue(item), (thrust - drag) / mass);
    assert.equal(answerValue(item), accel);
    const s = bareStem(item);
    assert.ok(s.includes(String(mass)) && s.includes(String(thrust)) && s.includes(String(drag)));
  });
});

test("kinetic-energy: KE = half m v squared", () => {
  eachSeed("kinetic-energy", (item) => {
    const { mass, speed, ke } = item.meta;
    assert.equal(answerValue(item), (mass * speed * speed) / 2);
    assert.equal(answerValue(item), ke);
    const s = bareStem(item);
    assert.ok(s.includes(String(mass)) && s.includes(String(speed)));
  });
});

test("lift-speed-change: lift ratio is the square of the speed ratio", () => {
  eachSeed("lift-speed-change", (item) => {
    const { v1, v2, k, factor } = item.meta;
    assert.equal(v2, v1 * k, "the two speeds must actually be in the stated ratio");
    assert.equal(answerValue(item), (v2 / v1) ** 2);
    assert.equal(answerValue(item), factor);
    const s = bareStem(item);
    assert.ok(s.includes(String(v1)) && s.includes(String(v2)));
  });
});

test("moment-balance: the two moments are equal, and the arms differ", () => {
  eachSeed("moment-balance", (item) => {
    const { w1, d1, w2, d2 } = item.meta;
    assert.notEqual(d1, d2, "equal arms make the answer trivially equal to the load");
    assert.equal(w1 * d1, w2 * d2, "moments must balance");
    assert.equal(answerValue(item), (w1 * d1) / d2);
    assert.equal(answerValue(item), w2);
    const s = bareStem(item);
    assert.ok(s.includes(String(w1)) && s.includes(String(d1)) && s.includes(String(d2)));
  });
});

test("pressure-altitude-lapse: 30 ft per hPa, as stated", () => {
  eachSeed("pressure-altitude-lapse", (item) => {
    const { hpa, feet } = item.meta;
    assert.equal(answerValue(item), hpa * 30);
    assert.equal(answerValue(item), feet);
    assert.ok(bareStem(item).includes(String(hpa)));
  });
});

test("kinematics-velocity: v = a x t from rest", () => {
  eachSeed("kinematics-velocity", (item) => {
    const { accel, timeSec, speed } = item.meta;
    assert.equal(answerValue(item), accel * timeSec);
    assert.equal(answerValue(item), speed);
    const s = bareStem(item);
    assert.ok(s.includes(String(accel)) && s.includes(String(timeSec)));
  });
});
