import { test } from "node:test";
import assert from "node:assert/strict";
import { summariseSession, addAttempt, bestByModule, trendFor, movement, MAX_ATTEMPTS } from "./history-core.mjs";

const knowledge = (id, stanine, correct = 12) => ({ moduleId: id, moduleName: id, kind: "knowledge", stanine, correct, total: 20 });
const tracking = (stanine, cancellation) => ({ moduleId: "control-coordination", moduleName: "Control & Co-ordination", kind: "psychomotor", stanine, cancellation });
const divided = (stanine, composite) => ({ moduleId: "divided-attention", moduleName: "Divided Attention", kind: "divided-attention", stanine, composite });
const attitudes = (complete, dominant) => ({
  moduleId: "attitudes-airmanship", moduleName: "Attitudes & Airmanship", kind: "behavioural",
  profile: { complete, dominant: dominant ? { key: dominant, name: dominant } : null, tally: { macho: { most: 6 } } },
});

// ── What gets recorded ─────────────────────────────────────────────────────

test("a session summarises to a stanine per module", () => {
  const a = summariseSession(42, [knowledge("aviation-maths", 6), tracking(8, 81.2), divided(4, 44)], "2026-08-09T10:00:00Z");
  assert.equal(a.seed, 42);
  assert.equal(a.modules.length, 3);
  assert.equal(a.modules[0].headline, "12/20");
  assert.equal(a.modules[1].headline, "81% cancelled");
  assert.equal(a.modules[2].headline, "44%");
  assert.equal(a.mean, 6);
});

// The binding rule of this file.
test("nothing from the attitudes questionnaire is ever recorded", () => {
  const a = summariseSession(1, [attitudes(true, "macho")], "2026-08-09T10:00:00Z");
  const blob = JSON.stringify(a).toLowerCase();
  assert.ok(!blob.includes("macho"), "the record leaked an attitude");
  assert.ok(!blob.includes("tally"), "the record leaked the tally");
  assert.ok(!blob.includes("dominant"), "the record leaked the dominant attitude");
  assert.equal(a.modules[0].completed, true, "completion alone is what may be kept");
  assert.equal(a.modules[0].stanine, undefined, "the questionnaire has no stanine to record");
});

test("no answers, items or samples are recorded", () => {
  const fat = {
    moduleId: "aviation-maths", moduleName: "Aviation Maths", kind: "knowledge", stanine: 5, correct: 11, total: 20,
    perItem: [{ stem: "secret question", chosen: 2, solution: "secret working" }],
  };
  const blob = JSON.stringify(summariseSession(1, [fat], "2026-08-09T10:00:00Z"));
  assert.ok(!blob.includes("secret"), "per-item detail leaked into history");
  assert.ok(!blob.includes("perItem"));
});

test("an attempt without its seed is refused — the paper must stay re-sittable", () => {
  assert.throws(() => summariseSession(null, [], "2026-08-09T10:00:00Z"), RangeError);
  assert.throws(() => summariseSession(1.5, [], "2026-08-09T10:00:00Z"), RangeError);
});

test("a session where nothing was scored still records, with no mean", () => {
  const a = summariseSession(7, [attitudes(false)], "2026-08-09T10:00:00Z");
  assert.equal(a.mean, null);
  assert.equal(a.modules.length, 1);
});

test("malformed results are skipped rather than crashing the record", () => {
  assert.doesNotThrow(() => summariseSession(1, [null, {}, { moduleId: 5 }, knowledge("x", 3)], "t"));
  assert.equal(summariseSession(1, [null, {}, knowledge("x", 3)], "t").modules.length, 1);
});

// ── The list ───────────────────────────────────────────────────────────────

test("attempts are newest first and capped", () => {
  let list = [];
  for (let i = 0; i < MAX_ATTEMPTS + 12; i++) {
    list = addAttempt(list, summariseSession(i, [knowledge("m", 5)], `t${i}`));
  }
  assert.equal(list.length, MAX_ATTEMPTS);
  assert.equal(list[0].seed, MAX_ATTEMPTS + 11, "newest attempt is not first");
});

test("re-saving the same attempt replaces it rather than duplicating", () => {
  const a = summariseSession(9, [knowledge("m", 5)], "t");
  const list = addAttempt(addAttempt([], a), a);
  assert.equal(list.length, 1);
});

// ── Reading it back ────────────────────────────────────────────────────────

const history = () => [
  summariseSession(3, [knowledge("aviation-maths", 7)], "t3"),
  summariseSession(2, [knowledge("aviation-maths", 4), tracking(6, 60)], "t2"),
  summariseSession(1, [knowledge("aviation-maths", 3)], "t1"),
];

test("best keeps the ceiling, latest keeps the most recent", () => {
  const best = bestByModule(history());
  assert.equal(best["aviation-maths"].best, 7);
  assert.equal(best["aviation-maths"].latest, 7, "attempts arrive newest first");
  assert.equal(best["aviation-maths"].sittings, 3);
  assert.equal(best["control-coordination"].sittings, 1);
});

test("a bad night does not erase a good one", () => {
  const list = [summariseSession(4, [knowledge("m", 2)], "t4"), ...history().map((a) => ({ ...a, modules: a.modules.map((m) => ({ ...m, id: "m" })) }))];
  assert.equal(bestByModule(list).m.best, 7);
  assert.equal(bestByModule(list).m.latest, 2);
});

test("a trend runs oldest to newest and skips sittings that module missed", () => {
  assert.deepEqual(trendFor(history(), "aviation-maths"), [3, 4, 7]);
  assert.deepEqual(trendFor(history(), "control-coordination"), [6]);
  assert.deepEqual(trendFor(history(), "nothing-here"), []);
});

// Two readings are noise, not a trend — a student should not be told they are
// improving on the strength of one good evening.
test("movement needs enough sittings before it says anything", () => {
  assert.equal(movement([5, 6]), null);
  assert.equal(movement([5, 6, 7]), null, "three points with nothing to compare against");
  assert.equal(movement(null), null);
});

test("movement reports direction once there is enough history", () => {
  assert.equal(movement([2, 2, 3, 6, 7, 7]), "up");
  assert.equal(movement([7, 7, 6, 3, 2, 2]), "down");
  assert.equal(movement([5, 5, 5, 5, 5, 5]), "steady");
});
