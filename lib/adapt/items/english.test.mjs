import { test } from "node:test";
import assert from "node:assert/strict";
import { generateItem, FAMILIES } from "./english.mjs";

const SEEDS = 250;
const eachSeed = (family, fn) => { for (let s = 1; s <= SEEDS; s++) fn(generateItem(family, s * 7919), s); };
const answerOf = (item) => item.options[item.answerIndex];

// ── Shared contract ────────────────────────────────────────────────────────

test("every item is structurally sound", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item, seed) => {
      assert.equal(item.family, family);
      assert.equal(item.options.length, 4);
      assert.equal(new Set(item.options).size, 4, `${family} seed ${seed}: duplicate options ${item.options.join(" | ")}`);
      assert.ok(item.answerIndex >= 0 && item.answerIndex < 4);
      assert.equal(item.optionNotes[item.answerIndex], null);
      assert.ok(item.solution.length > 15);
      for (const o of item.options) assert.ok(o.trim().length > 0, "an empty option");
    });
  }
});

test("every distractor teaches the rule it breaks", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item, seed) => {
      const named = item.optionNotes.filter((n, i) => i !== item.answerIndex && n && n.length > 15).length;
      assert.equal(named, 3, `${family} seed ${seed}: only ${named} explained distractors`);
    });
  }
});

test("generation is deterministic and seed-sensitive", () => {
  for (const family of FAMILIES) {
    assert.deepEqual(generateItem(family, 4242), generateItem(family, 4242));
    assert.notDeepEqual(generateItem(family, 1), generateItem(family, 2));
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

test("an unknown family is refused", () => {
  assert.throws(() => generateItem("poetry", 1), RangeError);
});

// Every gap-fill item must actually contain a gap, or the student is being
// asked to complete a sentence that is already complete.
test("gap-fill families present a gap", () => {
  for (const family of ["subject-verb-agreement", "tense-sequence", "countability", "comparison"]) {
    eachSeed(family, (item) => assert.ok(item.stem.includes("____"), `${family}: no gap in "${item.stem}"`));
  }
});

// ── Per-family rules ───────────────────────────────────────────────────────

test("subject-verb agreement follows the head noun, not the nearest noun", () => {
  eachSeed("subject-verb-agreement", (item) => {
    const expected = item.meta.number === "sing" ? "is" : "are";
    assert.equal(answerOf(item), expected, `"${item.stem}" should take "${expected}"`);
    // The attractor of the opposite number must be offered, or the item tests nothing.
    assert.ok(item.options.includes(item.meta.number === "sing" ? "are" : "is"), "the attractor is missing");
  });
});

test("tense sequence always resolves to the past perfect", () => {
  eachSeed("tense-sequence", (item) => {
    assert.match(answerOf(item), /^had \w+ed$/, `expected a past perfect, got "${answerOf(item)}"`);
    assert.match(item.stem, /^By the time /);
  });
});

test("countability picks the quantifier the noun's class demands", () => {
  eachSeed("countability", (item) => {
    const { uncountable, askMuch } = item.meta;
    const expected = askMuch ? (uncountable ? "much" : "many") : (uncountable ? "less" : "fewer");
    assert.equal(answerOf(item), expected, `"${item.meta.noun}" should take "${expected}"`);
  });
});

test("comparison uses the comparative for two and the superlative for more", () => {
  eachSeed("comparison", (item) => {
    const a = answerOf(item);
    if (item.meta.count === 2) {
      assert.ok(!/most |est$/.test(a.replace("the ", "")), `two items took a superlative: "${a}"`);
    } else {
      assert.ok(/most |est$/.test(a.replace("the ", "")), `${item.meta.count} items took a comparative: "${a}"`);
    }
    assert.equal(item.meta.superlative, item.meta.count > 2);
  });
});

test("a comprehension item's answer is stated verbatim in its own passage", () => {
  eachSeed("brief-comprehension", (item, seed) => {
    const [passage, question] = item.stem.split("\n\n");
    assert.ok(question && question.endsWith("?"), `seed ${seed}: no question`);
    assert.ok(passage.includes(answerOf(item)), `seed ${seed}: answer "${answerOf(item)}" is not in the passage`);
  });
});

// An aerodrome offered as the answer to "what is the flight time?" can be
// eliminated without reading the passage at all.
test("comprehension distractors are the same kind of thing as the answer", () => {
  eachSeed("brief-comprehension", (item, seed) => {
    const [, question] = item.stem.split("\n\n");
    const shape = (o) =>
      /minutes$/.test(o) ? "time" : /kg$/.test(o) ? "fuel" : /^\d{2}$/.test(o) ? "runway" : "place";
    const kinds = new Set(item.options.map(shape));
    assert.equal(kinds.size, 1, `seed ${seed}: "${question}" mixes ${[...kinds].join("/")} — ${item.options.join(" | ")}`);
  });
});

test("every comparison plural is spelled correctly", () => {
  eachSeed("comparison", (item) => {
    assert.doesNotMatch(item.stem, /\b\w+chs\b/, `bad plural in "${item.stem}"`);
    assert.doesNotMatch(item.stem, /\b\w+shs\b/, `bad plural in "${item.stem}"`);
  });
});

// A sentence that names the same actor in both clauses reads badly even though
// it parses.
test("tense-sequence clauses do not repeat the same actor", () => {
  eachSeed("tense-sequence", (item) => {
    const m = /^By the time ([^,]+), (the [a-z ]+?) ____/.exec(item.stem);
    assert.ok(m, `unexpected stem shape: "${item.stem}"`);
    assert.ok(!m[1].includes(m[2]), `both clauses use "${m[2]}": "${item.stem}"`);
  });
});

// ── Language hygiene ───────────────────────────────────────────────────────

test("no item stem contains a double space or a stray gap marker", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item) => {
      assert.ok(!/ {2}/.test(item.stem), `double space in "${item.stem}"`);
      assert.ok(!/_{5,}/.test(item.stem.replace(/____/g, "")), "malformed gap");
    });
  }
});

test("stems are sentences, not fragments", () => {
  for (const family of FAMILIES) {
    eachSeed(family, (item) => {
      const last = item.stem.trim().slice(-1);
      assert.ok([".", "?"].includes(last), `"${item.stem}" does not end as a sentence`);
      assert.match(item.stem.trim(), /^[A-Z"]/, `"${item.stem}" does not start with a capital`);
    });
  }
});
