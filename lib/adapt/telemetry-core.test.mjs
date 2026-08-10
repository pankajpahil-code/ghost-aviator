import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRows, ALLOWED_KEYS } from "./telemetry-core.mjs";

const DEV = "device-abc";

const knowledge = { moduleId: "aviation-maths", moduleName: "Aviation Maths", kind: "knowledge", stanine: 6, correct: 13, total: 20,
  perItem: [{ stem: "CONFIDENTIAL QUESTION", chosen: 2, solution: "CONFIDENTIAL WORKING" }] };
const tracking = { moduleId: "control-coordination", kind: "psychomotor", stanine: 8, cancellation: 81.6, inputClass: "gamepad:T.16000M",
  rmse: 0.03, worstError: 0.5 };
const divided = { moduleId: "divided-attention", kind: "divided-attention", stanine: 4, composite: 43.7,
  detail: { monitor: { hits: 3 }, radio: { hits: 1 } } };
const attitudes = { moduleId: "attitudes-airmanship", kind: "behavioural",
  profile: { complete: true, dominant: { key: "macho", name: "Macho", antidote: "Taking chances is foolish." },
             tally: { macho: { most: 6, least: 0, net: 6 } }, consistency: 1 } };

// ── The shape that leaves the device ───────────────────────────────────────

test("a row carries only the permitted keys", () => {
  for (const row of buildRows(42, [knowledge, tracking, divided, attitudes], DEV)) {
    for (const key of Object.keys(row)) {
      assert.ok(ALLOWED_KEYS.includes(key), `row leaked an unexpected field: ${key}`);
    }
    assert.equal(Object.keys(row).length, ALLOWED_KEYS.length);
  }
});

test("scores are summarised into one headline percentage per module", () => {
  const [k, t, d] = buildRows(42, [knowledge, tracking, divided], DEV);
  assert.equal(k.headline_pct, 65);           // 13/20
  assert.equal(k.stanine, 6);
  assert.equal(t.headline_pct, 82);           // 81.6% cancelled
  assert.equal(t.input_class, "gamepad:T.16000M");
  assert.equal(d.headline_pct, 44);           // composite 43.7
});

// Scores must never be pooled across a phone screen and a joystick, so the
// input device has to travel with the tracking row.
test("the tracking row carries its input device", () => {
  const [row] = buildRows(1, [tracking], DEV);
  assert.equal(row.input_class, "gamepad:T.16000M");
  const [mouse] = buildRows(1, [{ ...tracking, inputClass: "pointer" }], DEV);
  assert.equal(mouse.input_class, "pointer");
});

// ── The rule this file exists to enforce ───────────────────────────────────

test("NOTHING from the attitudes questionnaire ever leaves the device", () => {
  const blob = JSON.stringify(buildRows(42, [attitudes], DEV)).toLowerCase();
  for (const forbidden of ["macho", "tally", "dominant", "antidote", "consistency", "profile", "net"]) {
    assert.ok(!blob.includes(forbidden), `telemetry leaked "${forbidden}"`);
  }
});

test("the questionnaire row records completion and nothing else", () => {
  const [row] = buildRows(42, [attitudes], DEV);
  assert.equal(row.module_kind, "behavioural");
  assert.equal(row.completed, true);
  assert.equal(row.stanine, null, "the questionnaire has no stanine and must not invent one");
  assert.equal(row.headline_pct, null);
  const [incomplete] = buildRows(42, [{ ...attitudes, profile: { complete: false } }], DEV);
  assert.equal(incomplete.completed, false);
});

test("no question, answer or sample is ever sent", () => {
  const blob = JSON.stringify(buildRows(42, [knowledge, tracking, divided], DEV)).toLowerCase();
  for (const forbidden of ["confidential", "peritem", "stem", "solution", "chosen", "rmse", "worsterror", "detail"]) {
    assert.ok(!blob.includes(forbidden), `telemetry leaked "${forbidden}"`);
  }
});

// ── Robustness ─────────────────────────────────────────────────────────────

test("a session with nothing usable produces no rows", () => {
  assert.deepEqual(buildRows(1, [], DEV), []);
  assert.deepEqual(buildRows(1, null, DEV), []);
  assert.deepEqual(buildRows(1, [null, {}, { kind: "knowledge" }], DEV), []);
});

test("malformed scores become null rather than nonsense", () => {
  const [row] = buildRows(1, [{ moduleId: "m", kind: "knowledge", correct: 5, total: 0 }], DEV);
  assert.equal(row.headline_pct, null, "a zero-length paper must not divide by zero");
  const [t] = buildRows(1, [{ moduleId: "m", kind: "psychomotor", cancellation: null }], DEV);
  assert.equal(t.headline_pct, null);
});

test("a row is refused without a seed or a device id", () => {
  assert.throws(() => buildRows(null, [knowledge], DEV), RangeError);
  assert.throws(() => buildRows(1, [knowledge], ""), RangeError);
  assert.throws(() => buildRows(1, [knowledge], null), RangeError);
});

test("the device id is the only identifier, and it is the one passed in", () => {
  const rows = buildRows(42, [knowledge, tracking], "abc-123");
  for (const r of rows) assert.equal(r.device_id, "abc-123");
  const blob = JSON.stringify(rows);
  assert.ok(!/email|name|user_id|phone/i.test(blob), "an identifier leaked into the row");
});
