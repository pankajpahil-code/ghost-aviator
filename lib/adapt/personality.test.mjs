import { test } from "node:test";
import assert from "node:assert/strict";
import { ATTITUDES, ATTITUDE_KEYS, SCENARIOS, PAIRS, scoreProfile } from "./personality.mjs";

// ── The framework ──────────────────────────────────────────────────────────

test("all five published hazardous attitudes are present, each with its antidote", () => {
  assert.deepEqual(ATTITUDE_KEYS.sort(), ["anti-authority", "impulsivity", "invulnerability", "macho", "resignation"]);
  for (const k of ATTITUDE_KEYS) {
    const a = ATTITUDES[k];
    assert.ok(a.name.length > 0);
    assert.ok(a.antidote.length > 10, `${k}: no antidote`);
    assert.ok(a.meaning.length > 20, `${k}: no explanation`);
    assert.ok(a.coaching.length > 40, `${k}: no coaching`);
  }
});

// The antidotes are meant to be memorised verbatim, so they must be reproduced
// exactly rather than paraphrased into something that sounds nicer.
test("the antidotes are the standard published wording", () => {
  assert.equal(ATTITUDES["anti-authority"].antidote, "Follow the rules. They are usually right.");
  assert.equal(ATTITUDES.impulsivity.antidote, "Not so fast. Think first.");
  assert.equal(ATTITUDES.invulnerability.antidote, "It could happen to me.");
  assert.equal(ATTITUDES.macho.antidote, "Taking chances is foolish.");
  assert.equal(ATTITUDES.resignation.antidote, "I'm not helpless. I can make a difference.");
});

// ── The scenarios ──────────────────────────────────────────────────────────

test("every scenario offers exactly one response per attitude", () => {
  for (const s of SCENARIOS) {
    assert.deepEqual(Object.keys(s.options).sort(), ATTITUDE_KEYS.slice().sort(), `${s.id}: options do not cover the five attitudes`);
    for (const [k, text] of Object.entries(s.options)) {
      assert.ok(text.length > 30, `${s.id}/${k}: option too short to be a real choice`);
      assert.ok(!text.includes("hazardous"), `${s.id}/${k}: the option names the framework and gives itself away`);
    }
    assert.ok(s.situation.length > 60, `${s.id}: situation too thin`);
  }
});

test("scenario ids are unique and pairs point at each other", () => {
  assert.equal(new Set(SCENARIOS.map((s) => s.id)).size, SCENARIOS.length);
  for (const s of SCENARIOS) {
    if (!s.pairOf) continue;
    const other = SCENARIOS.find((x) => x.id === s.pairOf);
    assert.ok(other, `${s.id}: pairs with ${s.pairOf}, which does not exist`);
    assert.equal(other.pairOf, s.id, `${s.id} and ${other.id} do not pair with each other`);
  }
  assert.ok(PAIRS >= 1, "there must be at least one consistency pair");
});

// Every attitude must be answerable across the set, or a student can never
// score on it however honestly they answer.
test("no attitude is unreachable across the scenario set", () => {
  for (const k of ATTITUDE_KEYS) {
    const n = SCENARIOS.filter((s) => s.options[k]).length;
    assert.equal(n, SCENARIOS.length, `${k} is missing from some scenarios`);
  }
});

// ── Scoring ────────────────────────────────────────────────────────────────

const answerAll = (most, least) => SCENARIOS.map((s) => ({ id: s.id, most, least }));

test("an unanswered questionnaire scores nothing rather than guessing", () => {
  const r = scoreProfile([]);
  assert.equal(r.answered, 0);
  assert.equal(r.complete, false);
  assert.equal(r.dominant, null);
  assert.equal(r.consistency, null);
});

test("consistently choosing one attitude makes it dominant", () => {
  const r = scoreProfile(answerAll("macho", "resignation"));
  assert.equal(r.complete, true);
  assert.equal(r.answered, SCENARIOS.length);
  assert.equal(r.dominant.key, "macho");
  assert.equal(r.tally.macho.most, SCENARIOS.length);
  assert.equal(r.tally.resignation.least, SCENARIOS.length);
  assert.equal(r.tally.macho.net, SCENARIOS.length);
  assert.equal(r.consistency, 1);
});

// Naming a "dominant attitude" from a flat tally would be reading tea leaves,
// and then coaching the student against them.
test("a flat profile reports no dominant attitude", () => {
  const responses = SCENARIOS.map((s, i) => ({
    id: s.id,
    most: ATTITUDE_KEYS[i % ATTITUDE_KEYS.length],
    least: ATTITUDE_KEYS[(i + 1) % ATTITUDE_KEYS.length],
  }));
  const r = scoreProfile(responses);
  // Six scenarios over five attitudes: one attitude appears twice, so this is
  // the closest to flat the set allows. Nothing should be declared dominant
  // unless it genuinely outranks the next one.
  if (r.dominant) {
    assert.ok(r.ranked[0].net > r.ranked[1].net, "a dominant attitude was named without outranking the next");
  }
});

test("the dominant attitude arrives with its antidote and coaching attached", () => {
  const r = scoreProfile(answerAll("impulsivity", "macho"));
  assert.equal(r.dominant.key, "impulsivity");
  assert.equal(r.dominant.antidote, "Not so fast. Think first.");
  assert.ok(r.dominant.coaching.length > 40);
});

test("consistency is measured on the paired scenarios only", () => {
  const paired = SCENARIOS.filter((s) => s.pairOf);
  const responses = SCENARIOS.map((s) => ({
    id: s.id,
    // Answer one half of the pair differently from the other.
    most: s.id === paired[0].id ? "macho" : "resignation",
    least: "impulsivity",
  }));
  const r = scoreProfile(responses);
  assert.equal(r.pairsChecked, PAIRS);
  assert.ok(r.consistency < 1, "an incongruent pair should not read as fully consistent");
});

test("a partly finished questionnaire is scored as partial, not as complete", () => {
  const r = scoreProfile(answerAll("macho", "resignation").slice(0, 3));
  assert.equal(r.answered, 3);
  assert.equal(r.complete, false);
  assert.equal(r.total, SCENARIOS.length);
});

test("malformed responses are ignored rather than scored", () => {
  const bad = [
    { id: "p1", most: "telepathy", least: "macho" },
    { id: "p2", most: "macho", least: "macho" },   // same choice twice
    { id: "nope", most: "macho", least: "resignation" },
    { id: "p3" },
    null,
  ];
  assert.doesNotThrow(() => scoreProfile(bad));
  const r = scoreProfile(bad);
  assert.equal(r.answered, 0, "none of those were usable answers");
});

test("choosing an attitude as LEAST like you pulls its net score down", () => {
  const r = scoreProfile(answerAll("resignation", "anti-authority"));
  assert.ok(r.tally["anti-authority"].net < 0);
  assert.equal(r.dominant.key, "resignation");
});

// Nothing here may hand back a verdict on the student.
test("the profile never returns a suitability judgement", () => {
  const r = scoreProfile(answerAll("macho", "resignation"));
  const text = JSON.stringify(r).toLowerCase();
  for (const word of ["unsuitable", "unfit", "fail", "reject", "not suitable", "disqualif"]) {
    assert.ok(!text.includes(word), `the profile said "${word}"`);
  }
});
