import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPaper, TIER_LABEL } from "./paper.mjs";
import * as maths from "./maths.mjs";
import * as physics from "./physics.mjs";
import * as spatial from "./spatial.mjs";
import * as english from "./english.mjs";

const BANKS = { maths, physics, spatial, english };

// ── Tier declarations ──────────────────────────────────────────────────────

test("every bank tiers every family it declares, and tiers nothing it does not", () => {
  for (const [name, bank] of Object.entries(BANKS)) {
    assert.ok(bank.TIERS, `${name} declares no difficulty tiers`);
    for (const f of bank.FAMILIES) {
      assert.ok(f in bank.TIERS, `${name}: family ${f} has no tier`);
      assert.ok([1, 2, 3].includes(bank.TIERS[f]), `${name}: ${f} has tier ${bank.TIERS[f]}`);
    }
    for (const f of Object.keys(bank.TIERS)) {
      assert.ok(bank.FAMILIES.includes(f), `${name}: TIERS names ${f}, which is not a family`);
    }
  }
});

test("a bank that missed a tier is refused loudly rather than dropping the family", () => {
  // Silently skipping an untiered family would leave a hole in the syllabus
  // that nothing would ever report.
  const broken = { FAMILIES: [...maths.FAMILIES], TIERS: { ...maths.TIERS }, generateItem: maths.generateItem };
  delete broken.TIERS["ground-speed"];
  assert.throws(() => buildPaper(broken, 1, 20), /no difficulty tier/);
});

test("every bank spans all three tiers", () => {
  for (const [name, bank] of Object.entries(BANKS)) {
    const tiers = new Set(Object.values(bank.TIERS));
    assert.deepEqual([...tiers].sort(), [1, 2, 3], `${name} does not span Foundation to Advanced`);
  }
});

// ── The ramp ───────────────────────────────────────────────────────────────

test("a paper ramps: difficulty never goes backwards from one item to the next", () => {
  for (const [name, bank] of Object.entries(BANKS)) {
    for (const seed of [1, 42, 20260810]) {
      const { items } = buildPaper(bank, seed, 20);
      const tiers = items.map((i) => i.tier);
      for (let i = 1; i < tiers.length; i++) {
        assert.ok(tiers[i] >= tiers[i - 1], `${name} seed ${seed}: tier fell from ${tiers[i - 1]} to ${tiers[i]} at item ${i}`);
      }
    }
  }
});

test("a paper actually reaches Advanced rather than sitting on the easy end", () => {
  for (const [name, bank] of Object.entries(BANKS)) {
    const { items } = buildPaper(bank, 7, 20);
    assert.equal(items[0].tier, 1, `${name} does not open on Foundation`);
    assert.equal(items[items.length - 1].tier, 3, `${name} does not close on Advanced`);
  }
});

test("each item carries a printable tier label", () => {
  const { items } = buildPaper(maths, 3, 20);
  for (const i of items) {
    assert.equal(i.tierLabel, TIER_LABEL[i.tier]);
    assert.ok(i.tierLabel, "an item with no label would render a blank badge");
  }
});

test("the tier is our judgement, and the paper says which items came from where", () => {
  const { items, tiered } = buildPaper(spatial, 11, 36);
  assert.equal(tiered, true);
  const counts = { 1: 0, 2: 0, 3: 0 };
  for (const i of items) counts[i.tier]++;
  for (const t of [1, 2, 3]) assert.ok(counts[t] > 0, `no tier-${t} items on a 36-item paper`);
});

// ── Robustness of the deal ─────────────────────────────────────────────────

test("a tier holding one family is not asked for more distinct items than it has", () => {
  // English has a single Advanced family. A rigid one-third share demanded
  // seven questions from one generator and the bank threw outright; the share
  // is proportional to family count for exactly this reason.
  for (let seed = 1; seed <= 40; seed++) {
    assert.doesNotThrow(() => buildPaper(english, seed, 20), `english seed ${seed}`);
  }
});

test("papers still fill completely and cover every tier at the short end", () => {
  for (const [name, bank] of Object.entries(BANKS)) {
    for (const count of [20, 24, 36]) {
      const { items } = buildPaper(bank, 5, count);
      assert.equal(items.length, count, `${name} at ${count}`);
      assert.ok(items.every((i) => i.stem && i.options?.length === 4), `${name} at ${count}: malformed item`);
    }
  }
});

test("an untiered bank still builds a flat paper rather than failing", () => {
  // The fallback must produce items with NO tier rather than a guessed one — a
  // fabricated difficulty would print on the student's report as fact.
  const flat = { FAMILIES: [...maths.FAMILIES], generateItem: maths.generateItem };
  const { items, tiered } = buildPaper(flat, 9, 20);
  assert.equal(tiered, false);
  assert.equal(items.length, 20);
  assert.ok(items.every((i) => i.tier === undefined), "an untiered bank must not stamp a tier");
});

test("a paper is still deterministic and seed-sensitive once tiered", () => {
  assert.deepEqual(buildPaper(maths, 77, 20), buildPaper(maths, 77, 20));
  assert.notDeepEqual(buildPaper(maths, 77, 20), buildPaper(maths, 78, 20));
});

// ── The defect the ramp exposed ────────────────────────────────────────────

test("the flight-time question always has three distinct distractors", () => {
  // `level` (80-240) and `minutes + 10` (45-105) can be the SAME number. The
  // duplicate was dropped and the item threw, killing the student's whole
  // paper. Rare enough to survive review and every test until this family was
  // asked for more items per paper.
  for (let seed = 1; seed <= 600; seed++) {
    const item = english.generateItem("brief-comprehension", seed);
    assert.equal(item.options.length, 4, `seed ${seed}`);
    assert.equal(new Set(item.options).size, 4, `seed ${seed}: duplicate options ${item.options}`);
  }
});

test("no distractor is a negative or zero flight time", () => {
  for (let seed = 1; seed <= 600; seed++) {
    const item = english.generateItem("brief-comprehension", seed);
    for (const o of item.options) {
      const m = /^(-?\d+) minutes$/.exec(o);
      if (m) assert.ok(Number(m[1]) > 0, `seed ${seed}: ${o}`);
    }
  }
});
