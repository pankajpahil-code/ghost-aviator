// node --test — speech transcript accumulation.
// Guards the bug that made one spoken call render as a repeating paragraph,
// and the phraseology that MUST be allowed to repeat.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  newFinalSegments, joinTranscript, newFinalAlternatives, candidateTranscripts,
} from "./transcript.mjs";
import { scoreBestOf, scoreTransmission } from "./engine.mjs";

const final = (t) => ({ 0: { transcript: t }, isFinal: true });
const interim = (t) => ({ 0: { transcript: t }, isFinal: false });

// A final result carrying several alternative readings, best-first — what the
// recognizer actually returns once maxAlternatives > 1.
const finalAlts = (...ts) => {
  const r = { isFinal: true, length: ts.length };
  ts.forEach((t, i) => { r[i] = { transcript: t }; });
  return r;
};

test("takes only the NEW results, never re-reading the cumulative list", () => {
  // Event 1: one final at index 0.
  const r1 = [final("Mumbai Ground")];
  assert.deepEqual(newFinalSegments(r1, 0), ["Mumbai Ground"]);
  // Event 2: list has grown; resultIndex says the new one is at 1.
  const r2 = [final("Mumbai Ground"), final("VT-CSU radio check")];
  assert.deepEqual(newFinalSegments(r2, 1), ["VT-CSU radio check"]);
});

test("a full transmission accumulates once, not as a paragraph", () => {
  const segments = [];
  const events = [
    { results: [final("Mumbai Ground")], resultIndex: 0 },
    { results: [final("Mumbai Ground"), final("VT-CSU")], resultIndex: 1 },
    { results: [final("Mumbai Ground"), final("VT-CSU"), final("radio check on one two one decimal seven five")], resultIndex: 2 },
  ];
  for (const e of events) segments.push(...newFinalSegments(e.results, e.resultIndex));
  assert.equal(joinTranscript(segments),
    "Mumbai Ground VT-CSU radio check on one two one decimal seven five");
});

test("re-reading from 0 is what caused the repetition (regression proof)", () => {
  const results = [final("Mumbai Ground"), final("VT-CSU")];
  const buggy = [...newFinalSegments(results, 0), ...newFinalSegments(results, 0)];
  const correct = [...newFinalSegments(results, 0), ...newFinalSegments(results, 2)];
  assert.equal(joinTranscript(buggy), "Mumbai Ground VT-CSU Mumbai Ground VT-CSU");
  assert.equal(joinTranscript(correct), "Mumbai Ground VT-CSU");
});

test("interim hypotheses are ignored", () => {
  const results = [interim("May"), interim("Mayday"), final("MAYDAY")];
  assert.deepEqual(newFinalSegments(results, 0), ["MAYDAY"]);
});

test("REQUIRED repetition survives — MAYDAY x3 is never de-duplicated", () => {
  const results = [final("MAYDAY"), final("MAYDAY"), final("MAYDAY")];
  assert.equal(joinTranscript(newFinalSegments(results, 0)), "MAYDAY MAYDAY MAYDAY");
});

test("REQUIRED repetition survives — PAN-PAN x3", () => {
  const results = [final("PAN-PAN"), final("PAN-PAN"), final("PAN-PAN")];
  assert.equal(joinTranscript(newFinalSegments(results, 0)), "PAN-PAN PAN-PAN PAN-PAN");
});

test("handles missing resultIndex, empty and malformed results safely", () => {
  assert.deepEqual(newFinalSegments([final("one")], undefined), ["one"]);
  assert.deepEqual(newFinalSegments([], 0), []);
  assert.deepEqual(newFinalSegments(null, 0), []);
  assert.deepEqual(newFinalSegments([{ 0: { transcript: "   " }, isFinal: true }], 0), []);
  assert.equal(joinTranscript([]), "");
});

/* ===================================================================
   Alternative readings — the Indian-accent recognition fix.
   =================================================================== */

test("newFinalAlternatives keeps every alternative, best-first, de-duplicated", () => {
  const r = [finalAlts("squawk seven thousand", "squak seven thousand", "squawk seven thousand")];
  assert.deepEqual(newFinalAlternatives(r, 0), [
    ["squawk seven thousand", "squak seven thousand"],
  ]);
});

test("newFinalAlternatives ignores interim results, like newFinalSegments", () => {
  const r = [interim("Mumbai"), finalAlts("Mumbai Ground", "Bombay Ground")];
  assert.deepEqual(newFinalAlternatives(r, 0), [["Mumbai Ground", "Bombay Ground"]]);
});

test("candidateTranscripts is LINEAR, not a cartesian explosion", () => {
  // 6 segments x 5 alternatives would be 15,625 combinations.
  const segs = Array.from({ length: 6 }, (_, i) =>
    Array.from({ length: 5 }, (_, a) => `s${i}a${a}`));
  const cands = candidateTranscripts(segs);
  // all-best + one swap per non-best alternative = 1 + 6*4 = 25
  assert.equal(cands.length, 25);
  assert.ok(cands.length < 32, "must stay under the cap");
});

test("candidateTranscripts puts the recognizer's own best reading first", () => {
  const cands = candidateTranscripts([["hotel", "hostel"], ["nine", "minor"]]);
  assert.equal(cands[0], "hotel nine");
  assert.ok(cands.includes("hostel nine"));
  assert.ok(cands.includes("hotel minor"));
});

test("candidateTranscripts respects the cap", () => {
  const segs = Array.from({ length: 40 }, (_, i) => [`a${i}`, `b${i}`, `c${i}`]);
  assert.ok(candidateTranscripts(segs, 10).length <= 10);
});

test("candidateTranscripts on empty or malformed input returns nothing", () => {
  assert.deepEqual(candidateTranscripts([]), []);
  assert.deepEqual(candidateTranscripts(undefined), []);
  assert.deepEqual(candidateTranscripts([[], []]), []);
});

/* ---- scoreBestOf ---- */

// A cleared-level readback. NOTE: matchValueSlot deliberately falls back to a
// bare value search when the anchor is absent, so losing the anchor word alone
// does NOT fail a slot — the realistic recognition failure is the NUMBER being
// misheard, which is exactly what breaks for Indian-accented digits.
const EXPECT_LEVEL = {
  slots: [{ key: "level", critical: true, anchor: "altitude", value: "5000" }],
};

// A phrase slot — these have no numeric fallback, so a misheard phrase is a
// hard miss and benefits most from the alternatives.
const EXPECT_PHRASE = {
  slots: [{ key: "ready", critical: true, phrases: ["ready for departure"] }],
};

test("scoreBestOf rescues a misheard NUMBER in a level readback", () => {
  // "five thousand" heard as "fine thousand". "fine" is not a digit word, so the
  // bare "thousand" parses as 1000 — a figure that is not 5000 — and the top
  // reading is graded WRONG, i.e. the student is told they read back the wrong
  // level. That is the most damaging possible false verdict in this simulator.
  const top = scoreTransmission(EXPECT_LEVEL, "altitude fine thousand");
  assert.equal(top.slots[0].status, "wrong");
  assert.deepEqual(top.wrongCritical, ["level"]);

  const best = scoreBestOf(EXPECT_LEVEL, [
    "altitude fine thousand",
    "altitude five thousand",
  ]);
  assert.equal(best.slots[0].status, "ok");
  assert.deepEqual(best.wrongCritical, []);
  assert.deepEqual(best.missingCritical, []);
  assert.equal(best.chosenText, "altitude five thousand");
  assert.equal(best.candidatesTried, 2);
});

test("scoreBestOf rescues a misheard PHRASE", () => {
  const top = scoreTransmission(EXPECT_PHRASE, "ready for the picture");
  assert.deepEqual(top.missingCritical, ["ready"]);

  const best = scoreBestOf(EXPECT_PHRASE, [
    "ready for the picture",
    "ready for departure",
  ]);
  assert.deepEqual(best.missingCritical, []);
  assert.equal(best.chosenText, "ready for departure");
});

test("scoreBestOf keeps the recognizer's top reading when it already scores best", () => {
  const best = scoreBestOf(EXPECT_LEVEL, [
    "altitude five thousand",
    "altitude five thousand and some drivel",
  ]);
  assert.equal(best.chosenText, "altitude five thousand");
});

test("scoreBestOf can only score a transmission UP, never down", () => {
  const alone = scoreTransmission(EXPECT_LEVEL, "altitude five thousand");
  const withJunk = scoreBestOf(EXPECT_LEVEL, [
    "altitude five thousand",
    "utter nonsense",
    "more nonsense",
  ]);
  assert.ok(withJunk.points >= alone.points);
  assert.equal(withJunk.chosenText, "altitude five thousand");
});

test("scoreBestOf does NOT excuse a genuinely wrong readback", () => {
  // Every reading has the wrong level. Best-of must not invent a passing one.
  const best = scoreBestOf(EXPECT_LEVEL, [
    "altitude six thousand",
    "altitude six thousand feet",
  ]);
  assert.equal(best.slots[0].status, "wrong");
  assert.deepEqual(best.missingCritical, []);
  assert.deepEqual(best.wrongCritical, ["level"]);
});

test("scoreBestOf handles no usable candidates without throwing", () => {
  const r = scoreBestOf(EXPECT_LEVEL, []);
  assert.equal(r.candidatesTried, 0);
  assert.deepEqual(r.missingCritical, ["level"]);
  const r2 = scoreBestOf(EXPECT_LEVEL, ["", "   ", null, undefined]);
  assert.equal(r2.candidatesTried, 0);
});

test("MAYDAY repetition still survives the alternatives path", () => {
  // The no-de-duplication rule must hold here too.
  const r = [finalAlts("mayday mayday mayday", "mayday mayday")];
  const cands = candidateTranscripts(newFinalAlternatives(r, 0));
  assert.equal(cands[0], "mayday mayday mayday");
});
