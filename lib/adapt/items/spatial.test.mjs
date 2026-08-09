import { test } from "node:test";
import assert from "node:assert/strict";
import { generateItem, FAMILIES } from "./spatial.mjs";

const SEEDS = 300;
const HEADING_FAMILIES = ["heading-turn", "reciprocal-heading", "relative-bearing", "compass-read"];
const SEQUENCE_FAMILIES = ["sequence-step", "sequence-growth", "sequence-square"];

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

// ── Shared item contract ───────────────────────────────────────────────────

test("every item is structurally sound", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item, seed) => {
      assert.equal(item.family, family);
      assert.equal(item.options.length, 4);
      assert.equal(new Set(item.options).size, 4, `${family} seed ${seed}: duplicate option text`);
      assert.ok(item.answerIndex >= 0 && item.answerIndex < 4);
      assert.equal(item.optionNotes[item.answerIndex], null);
      assert.ok(item.stem.length > 15);
      assert.ok(item.solution.length > 10);
      for (const opt of item.options) assert.ok(valueOf(opt) > 0, `${family}: non-positive option "${opt}"`);
    });
  }
});

test("every answer is a whole number", () => {
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
  assert.throws(() => generateItem("astrocartography", 1), RangeError);
});

// ── Headings ───────────────────────────────────────────────────────────────

test("every heading option is a valid three-digit compass heading in 001-360", () => {
  for (const family of HEADING_FAMILIES) {
    eachSeed(family, (item, seed) => {
      for (const opt of item.options) {
        assert.match(opt, /^\d{3}°$/, `${family} seed ${seed}: "${opt}" is not a padded heading`);
        const v = valueOf(opt);
        assert.ok(v >= 1 && v <= 360, `${family} seed ${seed}: heading ${v} is off the compass`);
      }
    });
  }
});

test("heading-turn: the new heading is the turn applied and wrapped", () => {
  eachSeed("heading-turn", (item) => {
    const { from, turn, right, to } = item.meta;
    const expected = (((right ? from + turn : from - turn) % 360) + 360) % 360 || 360;
    assert.equal(answerValue(item), expected);
    assert.equal(answerValue(item), to);
    const s = bareStem(item);
    assert.ok(s.includes(String(turn)), `stem missing the turn ${turn}`);
    assert.ok(s.includes(right ? "right" : "left"), "stem must state the direction of turn");
  });
});

test("reciprocal-heading: the answer is exactly 180 degrees away", () => {
  eachSeed("reciprocal-heading", (item) => {
    const { from, recip } = item.meta;
    assert.equal(Math.abs(answerValue(item) - from), 180, `reciprocal of ${from} came out as ${answerValue(item)}`);
    assert.equal(answerValue(item), recip);
  });
});

test("relative-bearing: magnetic bearing is heading plus relative", () => {
  eachSeed("relative-bearing", (item) => {
    const { heading, relative, magnetic } = item.meta;
    assert.equal(answerValue(item), ((heading + relative) % 360) || 360);
    assert.equal(answerValue(item), magnetic);
  });
});

// ── The instrument ─────────────────────────────────────────────────────────

test("compass-read carries a figure and the answer is the heading drawn", () => {
  eachSeed("compass-read", (item) => {
    const { heading } = item.meta;
    assert.equal(answerValue(item), heading);
    assert.ok(item.figure, "compass-read must carry an SVG figure");
    assert.ok(item.figure.startsWith("<svg"), "figure must be an SVG element");
    assert.ok(item.figure.endsWith("</svg>"));
    // The card must actually be rotated to the heading being asked about.
    assert.ok(item.figure.includes(`rotate(${-heading} 110 110)`), `card not rotated to ${heading}`);
  });
});

// A label naming the heading would hand the answer to anyone reading the
// accessibility tree — and to anyone viewing source.
test("the instrument's accessible label does not give away the heading", () => {
  eachSeed("compass-read", (item) => {
    const labelMatch = /aria-label="([^"]*)"/.exec(item.figure);
    assert.ok(labelMatch, "figure must carry an aria-label");
    assert.doesNotMatch(labelMatch[1], /\d/, `aria-label leaks a number: "${labelMatch[1]}"`);
  });
});

test("the instrument uses presentation attributes, never inline style", () => {
  eachSeed("compass-read", (item) => {
    assert.doesNotMatch(item.figure, /style=/, "inline style can be stripped by a strict CSP");
    assert.doesNotMatch(item.figure, /<script/i);
  });
});

test("only the instrument family carries a figure", () => {
  for (const family of FAMILIES) {
    if (family === "compass-read") continue;
    eachSeed(family, (item) => assert.equal(item.figure, undefined, `${family} should not carry a figure`));
  }
});

// ── Sequences ──────────────────────────────────────────────────────────────

test("every sequence item shows five terms and asks for the sixth", () => {
  for (const family of SEQUENCE_FAMILIES) {
    eachSeed(family, (item, seed) => {
      const shown = item.stem.replace(/^[^?]*\?\s*/, "").replace(/,\s*\?$/, "");
      const terms = shown.split(",").map((t) => Number(t.trim().replace(/,/g, "")));
      assert.equal(terms.length, 5, `${family} seed ${seed}: expected 5 terms, got "${shown}"`);
      for (const t of terms) assert.ok(Number.isFinite(t), `${family}: non-numeric term in "${shown}"`);
      assert.ok(item.stem.trim().endsWith("?"), "the sequence must end with the missing term");
    });
  }
});

test("sequence-step: the steps alternate and the next one continues the pattern", () => {
  eachSeed("sequence-step", (item) => {
    const { a, d1, d2, next } = item.meta;
    assert.notEqual(d1, d2, "equal steps make it a plain arithmetic run");
    const terms = [a, a + d1, a + d1 + d2, a + 2 * d1 + d2, a + 2 * d1 + 2 * d2];
    const diffs = terms.slice(1).map((t, i) => t - terms[i]);
    assert.deepEqual(diffs, [d1, d2, d1, d2]);
    assert.equal(answerValue(item), terms[4] + d1);
    assert.equal(answerValue(item), next);
  });
});

test("sequence-growth: each term is the ratio times the one before", () => {
  eachSeed("sequence-growth", (item) => {
    const { a, r, next } = item.meta;
    const terms = [0, 1, 2, 3, 4].map((n) => a * r ** n);
    for (let i = 1; i < terms.length; i++) assert.equal(terms[i] / terms[i - 1], r);
    assert.equal(answerValue(item), terms[4] * r);
    assert.equal(answerValue(item), next);
  });
});

test("sequence-square: the gaps grow by exactly two each time", () => {
  eachSeed("sequence-square", (item) => {
    const { c, next } = item.meta;
    const terms = [1, 2, 3, 4, 5, 6].map((n) => n * (n + c));
    const diffs = terms.slice(1).map((t, i) => t - terms[i]);
    for (let i = 1; i < diffs.length; i++) assert.equal(diffs[i] - diffs[i - 1], 2);
    assert.equal(answerValue(item), terms[5]);
    assert.equal(answerValue(item), next);
  });
});

test("sequence terms stay small enough to reason about without a calculator", () => {
  for (const family of SEQUENCE_FAMILIES) {
    eachSeed(family, (item) => {
      assert.ok(answerValue(item) < 100000, `${family}: answer ${answerValue(item)} is unreasonably large`);
    });
  }
});

// ── Clock ──────────────────────────────────────────────────────────────────

test("clock-angle: the answer is the smaller angle between the hands", () => {
  eachSeed("clock-angle", (item) => {
    const { hour, minute, angle } = item.meta;
    const raw = Math.abs(30 * (hour % 12) - 5.5 * minute);
    const expected = raw > 180 ? 360 - raw : raw;
    assert.equal(answerValue(item), expected);
    assert.equal(answerValue(item), angle);
    assert.ok(angle > 0 && angle <= 180, `angle ${angle} is not a smaller-angle value`);
    assert.ok(bareStem(item).includes(`${hour}:${String(minute).padStart(2, "0")}`), "stem must show the time asked about");
  });
});
