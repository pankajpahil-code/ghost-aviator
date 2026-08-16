import { test } from "node:test";
import assert from "node:assert/strict";
import { buildResultRows, findForbidden, FORBIDDEN_KEYS } from "./results-core.mjs";
import { buildSession, scoreModule, scoreTracking, scoreDividedAttention, scorePersonality } from "./session.mjs";
import { SCENARIOS } from "./personality.mjs";

const USER = "8f14e45f-ceea-467a-9c1e-6f1a1a1b2c3d";

/** A genuinely scored session, so the guarantee is tested against real results. */
function realResults() {
  const session = buildSession(20260810, [
    "aviation-maths",
    "control-coordination",
    "divided-attention",
    "attitudes-airmanship",
  ]);
  const out = [];
  for (const mod of session.modules) {
    if (mod.kind === "knowledge") {
      out.push(scoreModule(mod, mod.items.map((it, i) => (i % 3 === 0 ? null : it.answerIndex)), 900));
    } else if (mod.kind === "psychomotor") {
      out.push(scoreTracking(mod, {
        rmse: 0.15,
        sampleCount: mod.run.durationSec * mod.run.sampleHz,
        inputClass: "pointer",
        segmentRmse: [0, 1, 2, 3, 4].map((index) => ({ index, rmse: 0.12 + index * 0.02, samples: 3000 })),
      }));
    } else if (mod.kind === "divided-attention") {
      // Timestamps and debrief answers included on purpose: the guarantee test
      // below is only worth anything if the fixture exercises every field a
      // real sitting produces, and both were added to the scorer in Aug 2026.
      out.push(scoreDividedAttention(mod, [
        ...mod.run.arithmetic.map((i) => ({ stream: "arithmetic", id: i.id, chosen: i.answerIndex, t: i.t + 1.2 })),
        ...mod.run.recall.map((q) => ({ stream: "recall", id: q.id, chosen: q.answerIndex })),
        ...mod.run.sightings.map((sg) => ({ stream: "sighting", t: sg.t + 1, type: sg.type })),
      ]));
    } else if (mod.kind === "behavioural") {
      // most/least are attitude KEYS, not option indices — taken from each
      // scenario's own options so the fixture is a genuinely completed
      // questionnaire rather than one the scorer quietly discards.
      out.push(scorePersonality(mod, SCENARIOS.map((s) => {
        const attitudes = Object.keys(s.options);
        return { id: s.id, most: attitudes[0], least: attitudes[1] };
      })));
    }
  }
  return { seed: session.seed, results: out };
}

// ── The guarantee ──────────────────────────────────────────────────────────

test("NOTHING a row must never carry appears anywhere in a real saved session", () => {
  const { seed, results } = realResults();
  const rows = buildResultRows(seed, results, USER);
  assert.ok(rows.length >= 4, "the fixture did not produce rows to check");
  const hit = findForbidden(rows);
  assert.equal(hit, null, `a forbidden field reached a saved row at ${hit}`);
});

test("the questionnaire contributes completion and literally nothing else", () => {
  const { seed, results } = realResults();
  const rows = buildResultRows(seed, results, USER);
  const row = rows.find((r) => r.module_kind === "behavioural");
  assert.ok(row, "no questionnaire row");
  assert.equal(row.completed, true);
  assert.equal(row.stanine, null);
  assert.equal(row.sten, null);
  assert.equal(row.headline_pct, null);
  assert.deepEqual(row.detail, {}, "the questionnaire must carry no detail at all");
});

test("a personality result carrying a profile still cannot leak it", () => {
  // The failure this guards against is someone adding a field to the
  // personality result and it being swept into the row by a spread.
  const rows = buildResultRows(1, [{
    moduleId: "attitudes-airmanship",
    kind: "behavioural",
    profile: { complete: true, dominant: "impulsivity", tally: { impulsivity: 4 } },
    scenarios: SCENARIOS,
  }], USER);
  assert.equal(findForbidden(rows), null);
  assert.equal(rows[0].detail.profile, undefined);
  assert.equal(JSON.stringify(rows[0]).includes("impulsivity"), false);
});

test("the forbidden list actually covers the names a result uses", () => {
  for (const k of ["answers", "chosen", "items", "stem", "options", "tally", "profile", "scenarios"]) {
    assert.ok(FORBIDDEN_KEYS.includes(k), `${k} is not on the forbidden list`);
  }
});

test("findForbidden reports the path so a leak can be located, not just detected", () => {
  assert.equal(findForbidden({ a: { b: [{ tally: 1 }] } }), ".a.b[0].tally");
  assert.equal(findForbidden({ a: { b: 1 } }), null);
});

// ── What IS saved ──────────────────────────────────────────────────────────

test("a knowledge row carries the score, the ramp and the family counts", () => {
  const { seed, results } = realResults();
  const row = buildResultRows(seed, results, USER).find((r) => r.module_kind === "knowledge");
  assert.equal(row.module_id, "aviation-maths");
  assert.ok(Number.isInteger(row.stanine) && row.stanine >= 1 && row.stanine <= 9);
  assert.ok(Number.isInteger(row.sten) && row.sten >= 1 && row.sten <= 10);
  assert.ok(row.band, "no colour band saved");
  assert.ok(row.detail.total > 0);
  assert.ok(Object.keys(row.detail.tiers).length >= 2, "the difficulty ramp was not recorded");
  assert.ok(Object.keys(row.detail.families).length >= 2, "family accuracy was not recorded");
  for (const f of Object.values(row.detail.families)) {
    assert.deepEqual(Object.keys(f).sort(), ["correct", "total"], "a family bucket carries more than counts");
  }
});

test("a tracking row carries the shape of the run, never its samples", () => {
  const { seed, results } = realResults();
  const row = buildResultRows(seed, results, USER).find((r) => r.module_kind === "psychomotor");
  assert.equal(row.input_class, "pointer", "input class must be saved or norms would pool devices");
  assert.ok(Array.isArray(row.detail.minutes) && row.detail.minutes.length === 5);
  assert.ok(row.detail.minutes.every((m) => m === null || (m >= 0 && m <= 100)));
  assert.ok(["held", "faded", "built", null].includes(row.detail.endurance));
});

test("a multitasking row carries the per-phase composites", () => {
  const { seed, results } = realResults();
  const row = buildResultRows(seed, results, USER).find((r) => r.module_kind === "divided-attention");
  assert.equal(row.detail.phases.length, 3);
  for (const p of row.detail.phases) {
    assert.ok(p.key, "a phase with no key cannot be charted");
    assert.ok(p.composite === null || (p.composite >= 0 && p.composite <= 100));
  }
});

test("every row is tied to the user and to the seed that rebuilds the paper", () => {
  const { seed, results } = realResults();
  for (const row of buildResultRows(seed, results, USER)) {
    assert.equal(row.user_id, USER);
    assert.equal(row.session_seed, seed);
  }
});

test("percentages are integers inside 0-100, whatever the scorer handed over", () => {
  const rows = buildResultRows(1, [
    { moduleId: "control-coordination", kind: "psychomotor", stanine: 5, cancellation: 87.6 },
    { moduleId: "divided-attention", kind: "divided-attention", stanine: 4, composite: -3 },
  ], USER);
  assert.equal(rows[0].headline_pct, 88);
  assert.equal(rows[1].headline_pct, 0);
});

// ── Refusing to build a row it should not ──────────────────────────────────

test("no user means no rows, not a row with a null user", () => {
  const { seed, results } = realResults();
  assert.deepEqual(buildResultRows(seed, results, null), []);
  assert.deepEqual(buildResultRows(seed, results, ""), []);
});

test("a session with no seed is refused — an unrebuildable result is not evidence", () => {
  assert.deepEqual(buildResultRows(null, [{ moduleId: "aviation-maths", kind: "knowledge" }], USER), []);
});

test("junk in the results list is skipped rather than saved", () => {
  const rows = buildResultRows(1, [null, undefined, {}, { kind: "knowledge" }], USER);
  assert.deepEqual(rows, []);
});

test("a multitasking row carries the debrief and the latency, as counts only", () => {
  const { seed, results } = realResults();
  const row = buildResultRows(seed, results, USER).find((r) => r.module_kind === "divided-attention");

  assert.ok(row.detail.recall, "the debrief was not stored");
  assert.equal(row.detail.recall.correct, row.detail.recall.total, "the fixture answered every question correctly");
  assert.ok(row.detail.recall.accuracy >= 0 && row.detail.recall.accuracy <= 100);
  assert.deepEqual(
    Object.keys(row.detail.recall).sort(),
    ["accuracy", "correct", "total", "unanswered", "wrong"],
    "the stored debrief must stay aggregate"
  );

  const lat = row.detail.responseTime.interruptions;
  assert.ok(lat, "the latency was not stored");
  assert.equal(lat.medianSec, 1.2, "median of a fixture answered at a flat 1.2s");
  assert.deepEqual(Object.keys(lat).sort(), ["medianSec", "medianWindowUsed", "n"]);
  assert.ok(lat.medianWindowUsed >= 0 && lat.medianWindowUsed <= 100);
});

test("a stream never responded to stores null, not a flattering zero", () => {
  const { seed, results } = realResults();
  const row = buildResultRows(seed, results, USER).find((r) => r.module_kind === "divided-attention");
  // The fixture never keys the mic, so there is no radio latency to report.
  assert.equal(row.detail.responseTime.radio, null);
});

test("a multitasking row carries the lookout, as counts only", () => {
  const { seed, results } = realResults();
  const row = buildResultRows(seed, results, USER).find((r) => r.module_kind === "divided-attention");

  assert.ok(row.detail.sightings, "the lookout was not stored");
  assert.equal(row.detail.sightings.correct, row.detail.sightings.total, "the fixture called every target correctly");
  assert.equal(row.detail.sightings.missed, 0);
  assert.equal(row.detail.sightings.accuracy, 100);
  assert.deepEqual(
    Object.keys(row.detail.sightings).sort(),
    ["accuracy", "correct", "falseReports", "misidentified", "missed", "total"],
    "the stored lookout must stay aggregate — no target ids, positions or times"
  );
  assert.equal(findForbidden(row), null);
});
