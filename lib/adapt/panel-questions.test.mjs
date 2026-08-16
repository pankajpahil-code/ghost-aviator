import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BY_ATTITUDE,
  CONSISTENCY_QUESTION,
  CONSISTENCY_FLOOR,
  MAX_QUESTIONS,
  panelQuestionsFor,
  PANEL_PREAMBLE,
} from "./panel-questions.mjs";
import { ATTITUDE_KEYS, SCENARIOS, scoreProfile } from "./personality.mjs";

/** A completed questionnaire that leans on one named attitude. */
function profileLeaning(attitude, { consistent = true } = {}) {
  const responses = SCENARIOS.map((s, i) => {
    const keys = Object.keys(s.options);
    const least = keys.find((k) => k !== attitude);
    // Break the paired scenarios apart when an inconsistent profile is wanted.
    const most = !consistent && i % 2 === 1 ? least : attitude;
    return { id: s.id, most, least: most === least ? attitude : least };
  });
  return scoreProfile(responses);
}

// ── Coverage ───────────────────────────────────────────────────────────────

test("every hazardous attitude the questionnaire scores has questions", () => {
  for (const key of ATTITUDE_KEYS) {
    assert.ok(BY_ATTITUDE[key], `no panel questions for ${key}`);
    assert.equal(BY_ATTITUDE[key].length, 2, `${key} should have two questions`);
  }
});

test("no attitude is invented that the questionnaire does not score", () => {
  for (const key of Object.keys(BY_ATTITUDE)) {
    assert.ok(ATTITUDE_KEYS.includes(key), `${key} is not a scored attitude`);
  }
});

test("every question teaches what the panel is listening for", () => {
  // The question alone is a guess anyone could make. The listeningFor line is
  // the part a student cannot get free anywhere else, and is why this exists.
  const all = [...Object.values(BY_ATTITUDE).flat(), CONSISTENCY_QUESTION];
  for (const q of all) {
    assert.ok(q.question?.length > 30, `question too short: ${q.question}`);
    assert.ok(q.listeningFor?.length > 60, `listeningFor too thin: ${q.question}`);
    // A competency-interview prompt is usually an IMPERATIVE, not an
    // interrogative — "Describe a time you…" rather than "Did you ever…".
    // An earlier version of this test demanded a question mark and failed
    // correct content; both forms are accepted, but a bare statement is not.
    // ...and the verb is not always first: a panel often sets the context in
    // one sentence and asks in the next ("You answered X. Walk me through…").
    assert.match(
      q.question,
      /(\?$)|\b(Tell me|Describe|Walk me|Give me|Talk me)\b/,
      `not phrased as an interview prompt: ${q.question}`
    );
  }
});

// ── Selection ──────────────────────────────────────────────────────────────

test("an incomplete questionnaire produces nothing, not a guess", () => {
  const partial = scoreProfile(SCENARIOS.slice(0, 2).map((s) => {
    const keys = Object.keys(s.options);
    return { id: s.id, most: keys[0], least: keys[1] };
  }));
  assert.equal(partial.complete, false);
  assert.deepEqual(panelQuestionsFor(partial), []);
});

test("null or malformed input is refused rather than crashing", () => {
  assert.deepEqual(panelQuestionsFor(null), []);
  assert.deepEqual(panelQuestionsFor(undefined), []);
  assert.deepEqual(panelQuestionsFor({}), []);
});

test("the questions follow the attitude the student actually showed", () => {
  for (const attitude of ATTITUDE_KEYS) {
    const qs = panelQuestionsFor(profileLeaning(attitude));
    assert.ok(qs.length > 0, `${attitude}: no questions produced`);
    assert.equal(qs[0].attitude, attitude,
      `${attitude}: first question came from ${qs[0].attitude} instead`);
  }
});

test("two different students get different sheets", () => {
  // A questionnaire that produces identical advice for everyone has not read
  // anything, and would be worse than showing nothing at all.
  const a = panelQuestionsFor(profileLeaning("macho")).map((q) => q.question);
  const b = panelQuestionsFor(profileLeaning("resignation")).map((q) => q.question);
  assert.notDeepEqual(a, b);
});

test("breadth first — a second attitude is asked about before the first is drilled twice", () => {
  const profile = profileLeaning("macho");
  // Force a genuine second-place attitude.
  profile.ranked = [
    { key: "macho", most: 3, least: 0, net: 3 },
    { key: "impulsivity", most: 2, least: 0, net: 2 },
    ...ATTITUDE_KEYS.filter((k) => k !== "macho" && k !== "impulsivity")
      .map((k) => ({ key: k, most: 0, least: 0, net: 0 })),
  ];
  const qs = panelQuestionsFor(profile);
  assert.equal(qs[0].attitude, "macho");
  assert.equal(qs[1].attitude, "impulsivity", "the second attitude was not reached before drilling the first twice");
});

test("attitudes that never showed up are not asked about", () => {
  const profile = profileLeaning("macho");
  profile.ranked = [
    { key: "macho", most: 3, least: 0, net: 3 },
    ...ATTITUDE_KEYS.filter((k) => k !== "macho").map((k) => ({ key: k, most: 0, least: 0, net: 0 })),
  ];
  for (const q of panelQuestionsFor(profile)) {
    assert.equal(q.attitude, "macho", `asked about ${q.attitude}, which the student never showed`);
  }
});

// ── The consistency question ───────────────────────────────────────────────

test("an inconsistent profile is asked to explain its own reasoning", () => {
  const profile = profileLeaning("macho");
  profile.consistency = CONSISTENCY_FLOOR - 0.2;
  const qs = panelQuestionsFor(profile);
  assert.ok(qs.some((q) => q.question === CONSISTENCY_QUESTION.question),
    "a clearly inconsistent profile was not asked about it");
});

test("a consistent profile is not accused of inconsistency", () => {
  const profile = profileLeaning("macho");
  profile.consistency = 1;
  assert.ok(!panelQuestionsFor(profile).some((q) => q.question === CONSISTENCY_QUESTION.question));
});

test("an unmeasurable consistency asks nothing about it", () => {
  // consistency is null when no paired scenarios were answered. Null is not
  // "inconsistent", and must never be read as a failing.
  const profile = profileLeaning("macho");
  profile.consistency = null;
  assert.ok(!panelQuestionsFor(profile).some((q) => q.question === CONSISTENCY_QUESTION.question));
});

// ── Bounds ─────────────────────────────────────────────────────────────────

test("the sheet never grows into a wall", () => {
  const profile = profileLeaning("macho");
  profile.ranked = ATTITUDE_KEYS.map((k) => ({ key: k, most: 3, least: 0, net: 3 }));
  profile.consistency = 0;
  const qs = panelQuestionsFor(profile);
  assert.ok(qs.length <= MAX_QUESTIONS, `${qs.length} questions is too many to prepare`);
  assert.ok(MAX_QUESTIONS <= 6, "more than six stops being preparation");
});

test("no question is ever repeated on one sheet", () => {
  const profile = profileLeaning("macho");
  profile.ranked = ATTITUDE_KEYS.map((k) => ({ key: k, most: 2, least: 0, net: 2 }));
  const qs = panelQuestionsFor(profile).map((q) => q.question);
  assert.equal(new Set(qs).size, qs.length);
});

// ── The promises this page makes ───────────────────────────────────────────

test("the preamble states plainly that these are NOT the real test's questions", () => {
  // Implying we hold the real items would be a lie a student could plan a
  // career around, and is exactly what Iron Rule 1 exists to prevent.
  assert.match(PANEL_PREAMBLE, /not the real/i);
  assert.match(PANEL_PREAMBLE, /ours/i);
});

test("the preamble tells students not to memorise", () => {
  assert.match(PANEL_PREAMBLE, /memoris|memoriz/i);
});

test("nothing here claims the questionnaire passes or fails anyone", () => {
  const text = [PANEL_PREAMBLE, ...Object.values(BY_ATTITUDE).flat().map((q) => q.question + q.listeningFor)].join(" ");
  assert.doesNotMatch(text, /you will (pass|fail)|guarantee|ensures you/i);
});

test("no source, publisher or airline name appears in student-facing text", () => {
  // Iron Rule 2.
  const banned = /symbiotic|indigo|adapt2|oxford|\bcae\b|joshi|bali|wizz|emirates/i;
  const text = [
    PANEL_PREAMBLE,
    CONSISTENCY_QUESTION.question,
    CONSISTENCY_QUESTION.listeningFor,
    ...Object.values(BY_ATTITUDE).flat().flatMap((q) => [q.question, q.listeningFor]),
  ].join(" ");
  assert.doesNotMatch(text, banned);
});
