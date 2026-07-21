// node --test — speech transcript accumulation.
// Guards the bug that made one spoken call render as a repeating paragraph,
// and the phraseology that MUST be allowed to repeat.

import { test } from "node:test";
import assert from "node:assert/strict";
import { newFinalSegments, joinTranscript } from "./transcript.mjs";

const final = (t) => ({ 0: { transcript: t }, isFinal: true });
const interim = (t) => ({ 0: { transcript: t }, isFinal: false });

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
