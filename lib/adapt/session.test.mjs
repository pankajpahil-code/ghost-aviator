import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildSession,
  scoreModule,
  scoreTracking,
  scoreDividedAttention,
  scorePersonality,
  scoreSession,
  criterionNormFor,
  MODULES,
  MODULE_IDS,
  PERCENT_LADDER,
} from "./session.mjs";
import { passiveSegmentRmse } from "./tracking.mjs";
import { assertValidNorm } from "./stanine.mjs";

// ── The criterion ladder ───────────────────────────────────────────────────

test("the published cut table is a valid norm for every module's paper length", () => {
  // Psychomotor modules have no paper; they are scored on the cancellation
  // ladder in tracking.mjs, which has its own norm test.
  for (const id of MODULE_IDS.filter((m) => MODULES[m].kind === "knowledge")) {
    const norm = criterionNormFor(MODULES[id].itemCount);
    assert.doesNotThrow(() => assertValidNorm(norm), `${id}: cut table is not a valid norm`);
  }
});

test("a 20-item paper produces the expected cut table", () => {
  assert.deepEqual(criterionNormFor(20).cuts, [6, 9, 11, 13, 15, 17, 19, 20]);
});

test("stanine 9 always requires full marks", () => {
  for (const total of [20, 25, 30, 40, 50]) {
    const cuts = criterionNormFor(total).cuts;
    assert.equal(cuts[cuts.length - 1], total, `${total}-item paper: top cut is not full marks`);
  }
});

// A paper too short to separate nine bands must fail loudly rather than emit a
// table with two stanines sharing a cut, which stanine.mjs would then reject
// deep inside scoring.
test("a paper too short for nine bands is refused up front", () => {
  assert.throws(() => criterionNormFor(10), /cannot separate nine stanines/);
  assert.throws(() => criterionNormFor(8), /cannot separate nine stanines/);
});

test("the ladder is the published one and climbs to full marks", () => {
  assert.equal(PERCENT_LADDER.length, 8);
  assert.equal(PERCENT_LADDER[PERCENT_LADDER.length - 1], 100);
  for (let i = 1; i < PERCENT_LADDER.length; i++) {
    assert.ok(PERCENT_LADDER[i] > PERCENT_LADDER[i - 1]);
  }
});

// ── Assembly ───────────────────────────────────────────────────────────────

test("a session builds every registered module with its full paper or its run", () => {
  const session = buildSession(2026);
  assert.equal(session.modules.length, MODULE_IDS.length);
  for (const mod of session.modules) {
    assert.equal(mod.timeLimitSec, MODULES[mod.id].timeLimitSec);
    assert.ok(mod.name.length > 0);
    if (mod.kind === "behavioural") {
      assert.equal(mod.items, undefined, "a questionnaire has no paper");
      assert.ok(mod.scenarios.length >= 4, "the questionnaire needs scenarios");
      assert.equal(MODULES[mod.id].weight, 0, "the questionnaire must not weigh on the aptitude composite");
    } else if (mod.kind === "psychomotor" || mod.kind === "divided-attention") {
      assert.equal(mod.items, undefined, "a timed-run module has no paper");
      assert.ok(Number.isInteger(mod.run.seed));
      assert.equal(mod.run.durationSec, MODULES[mod.id].durationSec);
    } else {
      assert.equal(mod.items.length, MODULES[mod.id].itemCount);
    }
  }
});

test("a session is deterministic and seed-sensitive", () => {
  assert.deepEqual(buildSession(7), buildSession(7));
  assert.notDeepEqual(buildSession(7), buildSession(8));
});

// Each module derives its own stream, so the maths paper must not change when
// the physics module is added, removed or reordered.
test("one module's paper does not depend on which other modules are present", () => {
  const alone = buildSession(99, ["aviation-maths"]).modules[0];
  const together = buildSession(99, ["physics-mechanical", "aviation-maths"]).modules[1];
  assert.deepEqual(alone.items, together.items);
});

// Keyed on stem AND figure: every compass item asks the same sentence and
// differs only in the instrument drawn, so the stem alone is not the question.
test("no module repeats a question within its own paper", () => {
  for (let s = 1; s <= 40; s++) {
    for (const mod of buildSession(s * 31337).modules) {
      if (mod.kind !== "knowledge") continue;
      const ids = mod.items.map((i) => `${i.stem} ${i.figure ?? ""}`);
      assert.equal(new Set(ids).size, mod.items.length, `${mod.id} seed ${s}: repeated question`);
    }
  }
});

test("a module whose items differ only by figure still fills a full paper", () => {
  const spatial = buildSession(2026, ["spatial-pattern"]).modules[0];
  const compass = spatial.items.filter((i) => i.family === "compass-read");
  assert.ok(compass.length >= 2, "expected the compass family to appear more than once on a 20-item paper");
  assert.equal(new Set(compass.map((i) => i.figure)).size, compass.length, "two compass items drew the same instrument");
  assert.equal(new Set(compass.map((i) => i.stem)).size, 1, "compass items are expected to share their stem");
});

test("an unknown module and a bad seed are refused", () => {
  assert.throws(() => buildSession(1, ["telepathy"]), /unknown module/);
  assert.throws(() => buildSession(1, []), /at least one module/);
  assert.throws(() => buildSession(1.5), /seed must be an integer/);
});

// ── Scoring ────────────────────────────────────────────────────────────────

const mathsModule = () => buildSession(4242, ["aviation-maths"]).modules[0];
const allCorrect = (mod) => mod.items.map((i) => i.answerIndex);
const allWrong = (mod) => mod.items.map((i) => (i.answerIndex + 1) % 4);
const allBlank = (mod) => mod.items.map(() => null);

test("full marks scores stanine 9", () => {
  const mod = mathsModule();
  const r = scoreModule(mod, allCorrect(mod), 1500);
  assert.equal(r.correct, 20);
  assert.equal(r.total, 20);
  assert.equal(r.percent, 100);
  assert.equal(r.stanine, 9);
  assert.equal(r.band.key, "high");
  assert.equal(r.basis, "criterion");
  assert.equal(r.unanswered, 0);
});

test("every answer wrong scores stanine 1", () => {
  const mod = mathsModule();
  const r = scoreModule(mod, allWrong(mod), 1500);
  assert.equal(r.correct, 0);
  assert.equal(r.stanine, 1);
  assert.equal(r.band.key, "low");
});

test("a blank paper scores zero and reports every item as unanswered", () => {
  const mod = mathsModule();
  const r = scoreModule(mod, allBlank(mod), 1800);
  assert.equal(r.correct, 0);
  assert.equal(r.unanswered, 20);
  assert.equal(r.stanine, 1);
  for (const item of r.perItem) {
    assert.equal(item.chosen, null);
    assert.equal(item.correct, false);
    assert.equal(item.errorNote, null, "a blank has no wrong-answer note to teach from");
  }
});

test("the cut table is returned with the result so it can be published", () => {
  const mod = mathsModule();
  const r = scoreModule(mod, allCorrect(mod), 100);
  assert.deepEqual(r.cuts, [6, 9, 11, 13, 15, 17, 19, 20]);
  assert.match(r.rationale, /Standards-based/);
});

test("the score walks the published ladder exactly", () => {
  const mod = mathsModule();
  const expected = { 5: 1, 6: 2, 8: 2, 9: 3, 11: 4, 13: 5, 15: 6, 17: 7, 19: 8, 20: 9 };
  for (const [correct, stanine] of Object.entries(expected)) {
    const n = Number(correct);
    const responses = mod.items.map((item, i) => (i < n ? item.answerIndex : (item.answerIndex + 1) % 4));
    assert.equal(scoreModule(mod, responses, 900).stanine, stanine, `${n}/20 should be stanine ${stanine}`);
  }
});

test("a wrong pick carries the note explaining that specific error", () => {
  const mod = mathsModule();
  // Choose the first distractor that has a taught note, for every item.
  const responses = mod.items.map((item) => item.optionNotes.findIndex((n, i) => n && i !== item.answerIndex));
  const r = scoreModule(mod, responses, 900);
  const taught = r.perItem.filter((p) => p.errorNote).length;
  assert.ok(taught >= 18, `only ${taught}/20 wrong answers explained the student's own error`);
  for (const p of r.perItem) {
    assert.ok(p.solution.length > 10, "every item must carry its worked solution");
  }
});

test("per-family accuracy adds up to the paper", () => {
  const mod = mathsModule();
  const responses = mod.items.map((item, i) => (i % 2 === 0 ? item.answerIndex : null));
  const r = scoreModule(mod, responses, 900);
  const summed = Object.values(r.byFamily).reduce(
    (acc, f) => ({ correct: acc.correct + f.correct, total: acc.total + f.total }),
    { correct: 0, total: 0 }
  );
  assert.equal(summed.total, r.total);
  assert.equal(summed.correct, r.correct);
});

test("overrunning the clock is recorded", () => {
  const mod = mathsModule();
  assert.equal(scoreModule(mod, allCorrect(mod), mod.timeLimitSec - 1).overTime, false);
  assert.equal(scoreModule(mod, allCorrect(mod), mod.timeLimitSec + 1).overTime, true);
  assert.equal(scoreModule(mod, allCorrect(mod), null).overTime, false);
});

test("out-of-range and malformed responses are treated as blank, not as marks", () => {
  const mod = mathsModule();
  const responses = mod.items.map(() => 99);
  const r = scoreModule(mod, responses, 900);
  assert.equal(r.correct, 0);
  assert.equal(r.unanswered, 20);
});

test("a response array of the wrong length is refused", () => {
  const mod = mathsModule();
  assert.throws(() => scoreModule(mod, [0, 1, 2], 900), /expected 20 responses/);
  assert.throws(() => scoreModule(mod, null, 900), /expected 20 responses/);
});

// ── Composite ──────────────────────────────────────────────────────────────

test("the composite reflects every module, questions and tracking alike", () => {
  const session = buildSession(555);
  const results = session.modules.map((mod) => {
    if (mod.kind === "behavioural") {
      return scorePersonality(mod, mod.scenarios.map((s) => ({ id: s.id, most: "macho", least: "resignation" })));
    }
    if (mod.kind === "psychomotor") {
      return scoreTracking(mod, { rmse: 0.001, sampleCount: mod.run.durationSec * 50, inputClass: "pointer" });
    }
    if (mod.kind === "divided-attention") {
      return scoreDividedAttention(mod, [
        ...mod.run.monitor.map((w) => ({ stream: "monitor", t: (w.start + w.end) / 2 })),
        ...mod.run.radio.filter((c) => c.mine).map((c) => ({ stream: "radio", t: c.t + 1 })),
        ...mod.run.arithmetic.map((a) => ({ stream: "arithmetic", id: a.id, chosen: a.answerIndex })),
      ]);
    }
    return scoreModule(mod, allCorrect(mod), 600);
  });
  const composite = scoreSession(results);
  assert.equal(composite.stanine, 9);
  // Only the aptitude modules count — the attitudes questionnaire carries
  // weight 0 on purpose and must be excluded here.
  const scorable = session.modules.filter((m) => MODULES[m.id].weight > 0).length;
  assert.equal(composite.modules, scorable);
  assert.ok(scorable < session.modules.length, "the questionnaire should have been excluded");
});

// ── Tracking ───────────────────────────────────────────────────────────────

const trackingModule = () => buildSession(4242, ["control-coordination"]).modules[0];

// Sample counts are DERIVED from the module's own clock, never written as a
// literal. They were hardcoded to 3000 (a 60-second run at 50 Hz), so when the
// module's duration was corrected to the real five minutes every fixture
// quietly became an interrupted run — the completeness check was right and the
// test was stale. Deriving it means the next clock change cannot do that again.
const fullSamples = (mod) => Math.round(mod.run.durationSec * mod.run.sampleHz);

test("a near-perfect tracking run scores at the top of the scale", () => {
  const mod = trackingModule();
  const r = scoreTracking(mod, { rmse: 0.0005, sampleCount: fullSamples(mod), inputClass: "touch" });
  assert.equal(r.kind, "psychomotor");
  assert.equal(r.stanine, 9);
  assert.ok(r.cancellation > 99);
  assert.equal(r.inputClass, "touch");
  assert.equal(r.basis, "criterion");
  assert.deepEqual(r.anomalies, []);
});

test("a run where the student did nothing scores the bottom of the scale", () => {
  const mod = trackingModule();
  const idle = scoreTracking(mod, { rmse: mod.run.durationSec ? undefined : undefined, sampleCount: fullSamples(mod) });
  assert.equal(idle.cancellation, null, "no RMSE means no score, not a zero");
  const real = scoreTracking(mod, { rmse: scoreTracking(mod, { rmse: 1, sampleCount: fullSamples(mod) }).baseline, sampleCount: fullSamples(mod) });
  assert.equal(Math.round(real.cancellation), 0);
  assert.equal(real.stanine, 1);
});

test("an impossible perfect run is flagged rather than celebrated", () => {
  const mod = trackingModule();
  const r = scoreTracking(mod, { rmse: 0, sampleCount: fullSamples(mod) });
  assert.ok(r.anomalies.some((a) => a.code === "tracking-perfect"));
});

test("a run cut short is flagged instead of scored as if complete", () => {
  const mod = trackingModule();
  const r = scoreTracking(mod, { rmse: 0.05, sampleCount: 200 });
  assert.ok(r.anomalies.some((a) => a.code === "run-incomplete"), "a 4-second run must not pass as a 60-second one");
});

test("a full-length run raises no completeness flag", () => {
  const mod = trackingModule();
  const r = scoreTracking(mod, { rmse: 0.2, sampleCount: mod.run.durationSec * mod.run.sampleHz });
  assert.ok(!r.anomalies.some((a) => a.code === "run-incomplete"));
});

test("the input device is recorded on the result, so scores are never pooled across devices", () => {
  const mod = trackingModule();
  for (const cls of ["touch", "pointer", "gamepad:T.16000M"]) {
    assert.equal(scoreTracking(mod, { rmse: 0.2, sampleCount: fullSamples(mod), inputClass: cls }).inputClass, cls);
  }
});

// ── Divided attention ──────────────────────────────────────────────────────

const dividedModule = () => buildSession(4242, ["divided-attention"]).modules[0];

test("a flawless divided-attention run scores the top of the scale", () => {
  const mod = dividedModule();
  const r = scoreDividedAttention(mod, [
    ...mod.run.monitor.map((w) => ({ stream: "monitor", t: (w.start + w.end) / 2 })),
    ...mod.run.radio.filter((c) => c.mine).map((c) => ({ stream: "radio", t: c.t + 1 })),
    ...mod.run.arithmetic.map((a) => ({ stream: "arithmetic", id: a.id, chosen: a.answerIndex })),
  ]);
  assert.equal(r.kind, "divided-attention");
  assert.equal(r.stanine, 9);
  assert.equal(Math.round(r.composite), 100);
  assert.equal(r.weakest, null, "nothing is weakest when all three are perfect");
  assert.deepEqual(r.anomalies, []);
});

test("doing nothing in a divided-attention run scores the bottom", () => {
  const r = scoreDividedAttention(dividedModule(), []);
  assert.equal(r.composite, 0);
  assert.equal(r.stanine, 1);
});

// The module exists to punish exactly this.
test("abandoning one stream is named and penalised", () => {
  const mod = dividedModule();
  const r = scoreDividedAttention(mod, [
    ...mod.run.monitor.map((w) => ({ stream: "monitor", t: (w.start + w.end) / 2 })),
    ...mod.run.radio.filter((c) => c.mine).map((c) => ({ stream: "radio", t: c.t + 1 })),
  ]);
  assert.equal(r.weakest, "arithmetic");
  assert.ok(r.detail.fixationPenalty > 20, "letting a stream go must cost real marks");
  assert.ok(r.composite < 70, `fixation still scored ${r.composite.toFixed(1)}`);
});

test("scoreDividedAttention refuses a module of another kind", () => {
  assert.throws(() => scoreDividedAttention(mathsModule(), []), /expects a divided-attention module/);
  assert.throws(() => scoreDividedAttention(trackingModule(), []), /expects a divided-attention module/);
});

// ── Attitudes questionnaire ────────────────────────────────────────────────

const attitudeModule = () => buildSession(4242, ["attitudes-airmanship"]).modules[0];

test("the questionnaire returns a profile and explicitly no stanine", () => {
  const mod = attitudeModule();
  const r = scorePersonality(mod, mod.scenarios.map((s) => ({ id: s.id, most: "impulsivity", least: "macho" })));
  assert.equal(r.kind, "behavioural");
  assert.equal(r.stanine, null, "a hazardous-attitude tally must never become a grade");
  assert.equal(r.profile.dominant.key, "impulsivity");
  assert.equal(r.profile.complete, true);
});

// It sits beside the aptitude result, never inside it.
test("the questionnaire never moves the aptitude composite", () => {
  const session = buildSession(555);
  const maths = session.modules.find((m) => m.id === "aviation-maths");
  const attitudes = session.modules.find((m) => m.kind === "behavioural");
  const mathsResult = scoreModule(maths, allCorrect(maths), 600);
  const withOut = scoreSession([mathsResult]);
  const withIn = scoreSession([
    mathsResult,
    scorePersonality(attitudes, attitudes.scenarios.map((s) => ({ id: s.id, most: "macho", least: "resignation" }))),
  ]);
  assert.equal(withIn.stanine, withOut.stanine);
  assert.equal(withIn.modules, withOut.modules, "the questionnaire was counted as an aptitude module");
});

test("scorePersonality refuses a module of another kind", () => {
  assert.throws(() => scorePersonality(mathsModule(), []), /expects a behavioural module/);
});

test("scoreTracking refuses a question module", () => {
  const maths = buildSession(1, ["aviation-maths"]).modules[0];
  assert.throws(() => scoreTracking(maths, { rmse: 0.1 }), /expects a psychomotor module/);
});

test("the published cut table travels with the tracking result", () => {
  const r = scoreTracking(trackingModule(), { rmse: 0.2, sampleCount: fullSamples(trackingModule()) });
  assert.equal(r.cuts.length, 8);
  assert.match(r.rationale, /Provisional/);
});

test("a strong module and a weak one average out", () => {
  const session = buildSession(556);
  const results = [
    scoreModule(session.modules[0], allCorrect(session.modules[0]), 600),
    scoreModule(session.modules[1], allWrong(session.modules[1]), 600),
  ];
  const composite = scoreSession(results);
  assert.ok(composite.stanine > 1 && composite.stanine < 9, `expected a middling composite, got ${composite.stanine}`);
});

test("the composite ignores results from unknown modules", () => {
  assert.equal(scoreSession([{ moduleId: "telepathy", stanine: 9 }]), null);
  assert.equal(scoreSession([]), null);
});

test("a multitasking run that ended early is flagged, not silently scored as failure", () => {
  // The task ends itself when the tab is hidden. Over fifteen minutes that is a
  // realistic accident, and scoring the unflown remainder as failure without
  // saying so blames a student for a phone call.
  const mod = buildSession(4242, ["divided-attention"]).modules[0];
  const short = scoreDividedAttention(mod, [], 120);
  assert.ok(short.anomalies.some((a) => a.code === "run-incomplete"), "an early exit was not flagged");

  const full = scoreDividedAttention(mod, [], mod.run.durationSec);
  assert.ok(!full.anomalies.some((a) => a.code === "run-incomplete"), "a full run was wrongly flagged");

  // No elapsed time reported at all must not invent a flag either way.
  const unknown = scoreDividedAttention(mod, []);
  assert.ok(!unknown.anomalies.some((a) => a.code === "run-incomplete"));
});

test("a tracking run is classified as faded, held or built from its own minutes", () => {
  const mod = trackingModule();
  const base = passiveSegmentRmse(mod.run.seed, mod.run.durationSec);
  const mk = (scale) => base.slice(0, 5).map((b, i) => ({ index: i, rmse: b.rmse * scale(i), samples: 3000 }));

  const faded = scoreTracking(mod, { rmse: 0.2, sampleCount: fullSamples(mod), segmentRmse: mk((i) => 0.2 + i * 0.18) });
  assert.equal(faded.endurance, "faded");
  assert.ok(faded.fade > 0, "a fading run must report positive points lost");

  const built = scoreTracking(mod, { rmse: 0.2, sampleCount: fullSamples(mod), segmentRmse: mk((i) => 0.9 - i * 0.18) });
  assert.equal(built.endurance, "built");

  const held = scoreTracking(mod, { rmse: 0.2, sampleCount: fullSamples(mod), segmentRmse: mk(() => 0.45) });
  assert.equal(held.endurance, "held");
  assert.equal(held.fade, 0);

  // Below three segments there is no shape to report, and none is invented.
  const short = scoreTracking(mod, { rmse: 0.2, sampleCount: fullSamples(mod), segmentRmse: mk(() => 0.4).slice(0, 2) });
  assert.equal(short.endurance, null);
  assert.equal(short.fade, null);
});
