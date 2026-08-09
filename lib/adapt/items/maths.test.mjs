import { test } from "node:test";
import assert from "node:assert/strict";
import { generateItem, generatePaper, FAMILIES } from "./maths.mjs";

// Every check below recomputes the answer from the item's own inputs using
// arithmetic written INDEPENDENTLY of the generator's expression, and separately
// confirms that the numbers printed in the stem are the same numbers the
// generator computed with. A generator that quietly prints one figure and
// scores another is the specific failure this file exists to catch.

const SEEDS = 300;

/** Pull the leading number out of an option label, e.g. "1,200 kg/hr" -> 1200. */
function valueOf(option) {
  const m = /^(-?[\d,]+(?:\.\d+)?)/.exec(option);
  assert.ok(m, `option has no leading number: ${option}`);
  return Number(m[1].replace(/,/g, ""));
}

const answerValue = (item) => valueOf(item.options[item.answerIndex]);
/** Stem with thousands separators removed, so raw integers can be searched for. */
const bareStem = (item) => item.stem.replace(/,/g, "");

function eachSeed(family, fn) {
  for (let s = 1; s <= SEEDS; s++) fn(generateItem(family, s * 7919), s);
}

// ── Structural invariants, every family ────────────────────────────────────

test("every item is structurally sound", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item) => {
      assert.equal(item.family, family);
      assert.equal(item.options.length, 4, `${family}: expected 4 options`);
      assert.equal(new Set(item.options).size, 4, `${family}: duplicate option text — ${item.options.join(" | ")}`);
      assert.ok(item.answerIndex >= 0 && item.answerIndex < 4, `${family}: bad answerIndex`);
      assert.equal(item.optionNotes.length, 4);
      assert.equal(item.optionNotes[item.answerIndex], null, `${family}: correct option must carry no error note`);
      assert.ok(item.stem.length > 20, `${family}: stem too short`);
      assert.ok(item.solution.length > 20, `${family}: solution too short`);
      assert.ok(item.id.startsWith(family));
      for (const opt of item.options) {
        assert.ok(valueOf(opt) > 0, `${family}: non-positive option "${opt}"`);
      }
    });
  }
});

test("every answer is a whole number — these are no-calculator items", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item) => {
      const a = answerValue(item);
      assert.ok(Number.isInteger(a), `${family}: answer ${a} is not whole`);
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
  assert.throws(() => generateItem("astrology", 1), RangeError);
});

// ── Per-family independent recomputation ───────────────────────────────────

test("time-enroute: answer equals 60 x distance / ground speed", () => {
  eachSeed("time-enroute", (item) => {
    const { gs, distance, timeMin } = item.meta;
    assert.equal(answerValue(item), (60 * distance) / gs);
    assert.equal(answerValue(item), timeMin);
    const s = bareStem(item);
    assert.ok(s.includes(String(distance)), `stem missing distance ${distance}`);
    assert.ok(s.includes(String(gs)), `stem missing ground speed ${gs}`);
  });
});

test("distance-covered: answer equals ground speed x minutes / 60", () => {
  eachSeed("distance-covered", (item) => {
    const { gs, timeMin, distance } = item.meta;
    assert.equal(answerValue(item), (gs * timeMin) / 60);
    assert.equal(answerValue(item), distance);
    assert.ok(bareStem(item).includes(String(gs)));
  });
});

test("ground-speed: answer equals 60 x distance / minutes", () => {
  eachSeed("ground-speed", (item) => {
    const { gs, timeMin, distance } = item.meta;
    assert.equal(answerValue(item), (60 * distance) / timeMin);
    assert.equal(answerValue(item), gs);
    assert.ok(bareStem(item).includes(String(distance)));
  });
});

test("fuel-required: answer equals burn rate x minutes / 60", () => {
  eachSeed("fuel-required", (item) => {
    const { burn, timeMin, fuel } = item.meta;
    assert.equal(answerValue(item), (burn * timeMin) / 60);
    assert.equal(answerValue(item), fuel);
    assert.ok(bareStem(item).includes(String(burn)));
  });
});

test("fuel-endurance: answer equals 60 x fuel / burn rate", () => {
  eachSeed("fuel-endurance", (item) => {
    const { burn, timeMin, fuel } = item.meta;
    assert.equal(answerValue(item), (60 * fuel) / burn);
    assert.equal(answerValue(item), timeMin);
    const s = bareStem(item);
    assert.ok(s.includes(String(fuel)), `stem missing fuel ${fuel}`);
    assert.ok(s.includes(String(burn)), `stem missing burn ${burn}`);
  });
});

test("fuel-burn-rate: answer equals 60 x fuel / minutes", () => {
  eachSeed("fuel-burn-rate", (item) => {
    const { burn, timeMin, fuel } = item.meta;
    assert.equal(answerValue(item), (60 * fuel) / timeMin);
    assert.equal(answerValue(item), burn);
    assert.ok(bareStem(item).includes(String(fuel)));
  });
});

test("rate-of-descent: answer equals height lost / minutes, and the heights are consistent", () => {
  eachSeed("rate-of-descent", (item) => {
    const { rod, timeMin, loss, startFt, endFt } = item.meta;
    assert.equal(startFt - endFt, loss, "stated heights must differ by the stated loss");
    assert.ok(endFt > 0, "descent must not go below sea level");
    assert.equal(answerValue(item), loss / timeMin);
    assert.equal(answerValue(item), rod);
    const s = bareStem(item);
    assert.ok(s.includes(String(startFt)) && s.includes(String(endFt)) && s.includes(String(timeMin)));
  });
});

test("volume-to-mass: answer equals litres x specific gravity", () => {
  eachSeed("volume-to-mass", (item) => {
    const { litres, sg, kg } = item.meta;
    assert.equal(answerValue(item), Math.round(litres * sg));
    assert.equal(answerValue(item), kg);
    assert.ok(answerValue(item) < litres, "fuel is lighter than water — mass must be below the volume figure");
    const s = bareStem(item);
    assert.ok(s.includes(String(litres)) && s.includes(String(sg)));
  });
});

test("crosswind-component: answer equals wind x sin(angle), and never exceeds the wind", () => {
  eachSeed("crosswind-component", (item) => {
    const { wind, angle, xw } = item.meta;
    const expected = Math.round(wind * Math.sin((angle * Math.PI) / 180));
    assert.equal(answerValue(item), expected);
    assert.equal(answerValue(item), xw);
    assert.ok(answerValue(item) < wind, "below 90° the crosswind is always less than the wind speed");
    assert.ok(angle > 0 && angle < 90, `degenerate angle ${angle}° — see CROSSWIND_ANGLES`);
    const s = bareStem(item);
    assert.ok(s.includes(String(wind)) && s.includes(String(angle)));
  });
});

test("fuel-remaining: answer equals departure fuel minus fuel burned", () => {
  eachSeed("fuel-remaining", (item) => {
    const { burn, timeMin, used, start, left } = item.meta;
    assert.equal(used, (burn * timeMin) / 60);
    assert.equal(answerValue(item), start - used);
    assert.equal(answerValue(item), left);
    assert.ok(left > 0, "the aircraft must not land with zero or negative fuel");
    assert.ok(left < start, "fuel remaining must be less than fuel at departure");
    const s = bareStem(item);
    assert.ok(s.includes(String(start)) && s.includes(String(burn)));
  });
});

// ── Distractor quality ─────────────────────────────────────────────────────

test("every item carries at least two distractors that teach a named error", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item, seed) => {
      const named = item.optionNotes.filter((n, i) => i !== item.answerIndex && n).length;
      assert.ok(named >= 2, `${family} seed ${seed}: only ${named} taught distractor(s)`);
    });
  }
});

// A student who can only judge magnitude should not be able to crack an item.
test("at most one option is wildly out of scale with the answer", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item, seed) => {
      const correct = answerValue(item);
      const wild = item.options.filter((opt, i) => {
        if (i === item.answerIndex) return false;
        const v = valueOf(opt);
        return v < correct / 5 || v > correct * 5;
      }).length;
      assert.ok(wild <= 1, `${family} seed ${seed}: ${wild} options are >5x off — magnitude alone solves it`);
    });
  }
});

// Aviation quantities use international grouping. The Indian lakh convention
// (5,00,000) is correct for rupees and wrong for a rate of descent.
test("numbers never use lakh grouping", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item) => {
      for (const text of [item.stem, item.solution, ...item.options]) {
        assert.doesNotMatch(text, /,\d{2},/, `${family}: lakh grouping in "${text}"`);
      }
    });
  }
});

test("no distractor equals the correct answer", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item) => {
      const correct = answerValue(item);
      item.options.forEach((opt, i) => {
        if (i === item.answerIndex) return;
        assert.notEqual(valueOf(opt), correct, `${family}: distractor duplicates the answer`);
      });
    });
  }
});

// ── Papers ─────────────────────────────────────────────────────────────────

test("a 20-question paper covers every family evenly", () => {
  const paper = generatePaper(2026, 20);
  assert.equal(paper.items.length, 20);
  const counts = new Map();
  for (const item of paper.items) counts.set(item.family, (counts.get(item.family) ?? 0) + 1);
  assert.equal(counts.size, FAMILIES.length, "every family must appear");
  for (const [family, n] of counts) assert.equal(n, 2, `${family} appeared ${n} times, expected 2`);
});

test("a short paper still spreads across distinct families", () => {
  const paper = generatePaper(77, 5);
  assert.equal(paper.items.length, 5);
  assert.equal(new Set(paper.items.map((i) => i.family)).size, 5);
});

test("papers are deterministic, seed-sensitive, and never repeat an item within themselves", () => {
  assert.deepEqual(generatePaper(9, 20), generatePaper(9, 20));
  assert.notDeepEqual(generatePaper(9, 20), generatePaper(10, 20));
  const paper = generatePaper(555, 20);
  assert.equal(new Set(paper.items.map((i) => i.stem)).size, 20, "a paper must not ask the same question twice");
});

test("extending a paper does not disturb the questions already in it", () => {
  const short = generatePaper(31337, 10);
  const long = generatePaper(31337, 20);
  for (let i = 0; i < 10; i++) {
    assert.deepEqual(long.items[i], short.items[i], `item ${i} shifted when the paper grew`);
  }
});

test("paper length is validated", () => {
  assert.throws(() => generatePaper(1, 0), RangeError);
  assert.throws(() => generatePaper(1, 2.5), RangeError);
});

test("papers stay clean across many seeds", () => {
  for (let s = 1; s <= 120; s++) {
    const paper = generatePaper(s * 104729, 20);
    assert.equal(new Set(paper.items.map((i) => i.stem)).size, 20, `seed ${s}: repeated stem`);
    for (const item of paper.items) {
      assert.equal(new Set(item.options).size, 4, `seed ${s}: duplicate options in ${item.family}`);
    }
  }
});
