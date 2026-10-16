// node:test suite for lib/exam-review.mjs (runs under `npm test`).
// Pure logic only — the storage and bank halves are exercised by the browser
// evidence pass (tools/pwa/_captures/evidence-phase2-local.md).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normaliseChosen,
  matchReviewEntries,
  filterReviewItems,
  reviewStats,
} from "./exam-review.mjs";

const q = (ans) => ({ ans });

// ── matching ─────────────────────────────────────────────────────────────────

test("entries resolve in sitting order and keep chosen/flagged", () => {
  const byKey = new Map([["alpha", q(1)], ["beta", q(0)]]);
  const items = matchReviewEntries(byKey, [
    { k: "beta", a: 0 },
    { k: "alpha", a: 2, f: true },
  ]);
  assert.equal(items.length, 2);
  assert.equal(items[0].question, byKey.get("beta"));
  assert.equal(items[0].chosen, 0);
  assert.equal(items[0].flagged, false);
  assert.equal(items[0].missing, false);
  assert.equal(items[1].index, 1);
  assert.equal(items[1].chosen, 2);
  assert.equal(items[1].flagged, true);
});

test("a key no longer in the bank resolves to a missing item", () => {
  const items = matchReviewEntries(new Map(), [{ k: "gone", a: 3 }]);
  assert.equal(items[0].question, null);
  assert.equal(items[0].missing, true);
  assert.equal(items[0].chosen, 3);
});

test("the same key can appear twice (retakes of a stem stay separate)", () => {
  const byKey = new Map([["same", q(1)]]);
  const items = matchReviewEntries(byKey, [{ k: "same", a: 0 }, { k: "same", a: 1 }]);
  assert.equal(items.length, 2);
  assert.equal(items[0].chosen, 0);
  assert.equal(items[1].chosen, 1);
});

// ── sanitising the student-writable storage ──────────────────────────────────

test("chosen degrades to null for anything but a finite integer >= 0", () => {
  for (const bad of [-1, 1.5, "2", null, undefined, NaN, Infinity]) {
    assert.equal(normaliseChosen(bad), null, `expected ${String(bad)} to degrade`);
  }
  assert.equal(normaliseChosen(0), 0);
  assert.equal(normaliseChosen(3), 3);
});

test("garbage entries match as missing instead of throwing", () => {
  const items = matchReviewEntries(new Map(), [
    null,
    "nonsense",
    { k: 42, a: 0 },
    { k: "", a: 0 },
    { k: "ok", a: -5, f: 1 },
  ]);
  assert.equal(items.length, 5);
  for (const it of items) {
    assert.equal(it.question, null);
    assert.equal(it.missing, true);
  }
  assert.equal(items[4].chosen, null); // -5 is not a real index
  assert.equal(items[4].flagged, false); // f must be exactly true
  assert.equal(items[4].k, undefined); // matcher never invents fields
});

test("review that is not an array reads as empty", () => {
  for (const bad of [undefined, null, "x", 5, {}]) {
    assert.deepEqual(matchReviewEntries(new Map(), bad), []);
  }
});

// ── filters ──────────────────────────────────────────────────────────────────

test("filters: all / wrong / unanswered / flagged, missing only in all", () => {
  const byKey = new Map([["c", q(0)], ["w", q(0)], ["u", q(0)]]);
  const items = matchReviewEntries(byKey, [
    { k: "c", a: 0 },            // correct
    { k: "w", a: 2, f: true },   // wrong, flagged
    { k: "u", a: null },         // unanswered
    { k: "gone", a: 1, f: true } // missing, flagged
  ]);
  assert.equal(filterReviewItems(items, "all").length, 4);
  assert.deepEqual(filterReviewItems(items, "wrong").map(i => i.index), [1]);
  assert.deepEqual(filterReviewItems(items, "unanswered").map(i => i.index), [2]);
  assert.deepEqual(filterReviewItems(items, "flagged").map(i => i.index), [1, 3]);
});

test("a corrupt chosen index (out of range) still counts as wrong, not unanswered", () => {
  const byKey = new Map([["x", q(0)]]);
  const items = matchReviewEntries(byKey, [{ k: "x", a: 9 }]); // 9 is a finite int, pool has fewer options
  const stats = reviewStats(items);
  assert.equal(stats.wrong, 1);
  assert.equal(stats.unanswered, 0);
});

// ── stats ────────────────────────────────────────────────────────────────────

test("stats count correct/wrong/unanswered/flagged/missing and score over answered set", () => {
  const byKey = new Map([["a", q(1)], ["b", q(0)], ["c", q(2)]]);
  const items = matchReviewEntries(byKey, [
    { k: "a", a: 1 },   // correct
    { k: "b", a: 9 },   // wrong
    { k: "c", a: null },// unanswered
    { k: "gone", a: 0, f: true } // missing
  ]);
  const stats = reviewStats(items);
  assert.deepEqual(stats, {
    total: 4, correct: 1, wrong: 1, unanswered: 1, flagged: 1, missing: 1, scorePct: 25,
  });
});

test("scorePct rounds (2 of 3 -> 67) and empty review is all zeros", () => {
  const byKey = new Map([["a", q(1)], ["b", q(1)], ["c", q(1)]]);
  const stats = reviewStats(
    matchReviewEntries(byKey, [{ k: "a", a: 1 }, { k: "b", a: 1 }, { k: "c", a: 0 }]),
  );
  assert.equal(stats.scorePct, 67);
  assert.deepEqual(reviewStats([]), {
    total: 0, correct: 0, wrong: 0, unanswered: 0, flagged: 0, missing: 0, scorePct: 0,
  });
});
