// node --test suite for the RTR simulator scoring engine.
// Gold cases come from tools/rtr-sim/SCENARIO_DRAFTS.md — this file is the
// executable half of that spec. Run: npm run test:rtr-sim

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalize,
  matchSlot,
  matchCallsign,
  scoreTransmission,
  scoreScenario,
} from "./engine.mjs";

const norm = (s) => normalize(s).join(" ");

// --- Number normalization (book Ch13 §13.4–13.5; ICAO whole-hundreds rule) ---

test("digit-by-digit groups concatenate, keeping leading zeros", () => {
  assert.equal(norm("QNH one zero one three"), "qnh 1013");
  assert.equal(norm("squawk four three two one"), "squawk 4321");
  assert.equal(norm("heading zero eight zero"), "heading 080");
});

test("ICAO altered numerals normalize (tree, fife, niner, fower)", () => {
  assert.equal(norm("heading tree six zero"), "heading 360");
  assert.equal(norm("fife hundred"), "500");
  assert.equal(norm("niner fower"), "94");
});

test("whole hundreds and thousands use arithmetic (RVR six hundred = 600)", () => {
  assert.equal(norm("six hundred metres"), "600 metres");
  assert.equal(norm("two thousand five hundred feet"), "2500 feet");
  assert.equal(norm("one thousand seven hundred"), "1700");
});

test("frequencies fuse around decimal", () => {
  assert.equal(norm("one two one decimal nine"), "121.9");
  assert.equal(norm("contact tower one one eight decimal one"), "contact tower 118.1");
  assert.equal(norm("Ground 121.9"), "ground 121.9");
  // "point" is a decimal only between digits — never in "holding point".
  assert.equal(norm("one two one point five"), "121.5");
  assert.equal(norm("hold at the holding point"), "hold at the holding point");
  // Adjacent frequencies must never fuse — a number has at most one decimal.
  assert.equal(norm("one one eight decimal three five one one eight decimal five three"),
    "118.35 118.53");
  assert.equal(norm("118.35 118.53"), "118.35 118.53");
});

test("flight level fuses to fl marker", () => {
  assert.equal(norm("climb to flight level one nine zero"), "climb to fl 190");
  assert.equal(norm("flight level one zero zero"), "fl 100");
});

test('gated words ("to", "for") stay English unless flanked by numbers', () => {
  // The classic ICAO ambiguity: "to" must never fold into the number.
  assert.equal(norm("descend to two thousand five hundred feet"), "descend to 2500 feet");
  assert.equal(norm("cleared for take-off"), "cleared for take off");
  // ...but a recognizer writing "to" for "two" inside a digit run is repaired.
  assert.equal(norm("one to one tree"), "1213");
});

test("phonetic alphabet fuses into letter runs", () => {
  assert.equal(norm("victor tango alfa bravo charlie"), "vtabc");
  assert.equal(norm("taxi to holding point alfa one"), "taxi to holding point a 1");
});

// --- Slot matching (drafts' CRITICAL/minor semantics) ---

test("value slot: correct QNH readback is ok", () => {
  const n = normalize("descend to two thousand five hundred feet QNH one zero one three VT-ABC");
  assert.equal(matchSlot(n, { key: "qnh", value: "1013", anchor: "qnh" }), "ok");
  assert.equal(matchSlot(n, { key: "alt", value: "2500", anchor: "descend" }), "ok");
});

test("value slot: wrong value after anchor is flagged wrong, not missing", () => {
  const n = normalize("QNH one zero nine three, VT-ABC");
  assert.equal(matchSlot(n, { key: "qnh", value: "1013", anchor: "qnh" }), "wrong");
});

test("value slot: absent value is missing", () => {
  const n = normalize("taxi to holding point alfa one runway two seven, VT-ABC");
  assert.equal(matchSlot(n, { key: "qnh", value: "1013", anchor: "qnh" }), "missing");
});

test("phrase slot: variants accepted (conditional line-up, 9432 §4.5)", () => {
  const slot = {
    key: "lineup",
    phrases: ["line up runway 27 and wait behind", "lining up and waiting behind"],
  };
  const a = normalize("Behind the landing Cessna, lining up and waiting behind runway two seven, VT-ABC");
  const b = normalize("Behind the landing Cessna, line up runway two seven and wait behind, VT-ABC");
  assert.equal(matchPhrase(a, slot), "ok");
  assert.equal(matchPhrase(b, slot), "ok");
  function matchPhrase(n, s) { return matchSlot(n, s); }
});

test("take-off clearance readback matches with or without hyphen", () => {
  const slot = { key: "takeoff", critical: true, phrases: ["cleared for take off"] };
  assert.equal(matchSlot(normalize("Runway two seven, cleared for takeoff, VT-ABC"), slot), "ok");
  assert.equal(matchSlot(normalize("runway 27 cleared for take-off VT-ABC"), slot), "ok");
});

// --- Callsign (Ch14: end the read-back with your call sign) ---

test("callsign: spoken phonetic and written registration both match", () => {
  const spoken = normalize("QNH one zero one three, victor tango alfa bravo charlie");
  const written = normalize("QNH 1013, VT-ABC");
  assert.equal(matchCallsign(spoken, "VT-ABC"), "ok-end");
  assert.equal(matchCallsign(written, "victor tango alfa bravo charlie"), "ok-end");
});

test("callsign: airline flight number style (Type 3)", () => {
  const n = normalize("Cleared to Mumbai via PAPA two departure, climb to flight level one zero zero, squawk four three two one, Ghostair two zero five");
  assert.equal(matchCallsign(n, "Ghostair two zero five"), "ok-end");
  assert.equal(matchCallsign(n, "Ghostair 205"), "ok-end");
});

test("callsign: missing when absent", () => {
  assert.equal(matchCallsign(normalize("QNH one zero one three"), "VT-ABC"), "missing");
});

// --- Full transmission scoring: the SCN-2 clearance readback contract ---

const CLEARANCE_EXPECT = {
  slots: [
    { key: "limit", critical: true, phrases: ["cleared to mumbai"] },
    { key: "sid", critical: true, phrases: ["papa two departure", "papa 2 departure"] },
    { key: "level", critical: true, value: "100", anchor: "fl" },
    { key: "squawk", critical: true, value: "4321", anchor: "squawk" },
  ],
  callsign: "Ghostair two zero five",
  forbidden: ["over and out"],
};

test("perfect clearance readback scores full marks", () => {
  const r = scoreTransmission(
    CLEARANCE_EXPECT,
    "Cleared to Mumbai via PAPA two departure, climb to flight level one zero zero, squawk four three two one, Ghostair two zero five"
  );
  assert.equal(r.points, r.maxPoints);
  assert.deepEqual(r.wrongCritical, []);
  assert.deepEqual(r.missingCritical, []);
  assert.equal(r.callsign, "ok-end");
});

test("wrong squawk triggers the correction branch", () => {
  const r = scoreTransmission(
    CLEARANCE_EXPECT,
    "Cleared to Mumbai via PAPA two departure, climb to flight level one zero zero, squawk four three one two, Ghostair two zero five"
  );
  assert.deepEqual(r.wrongCritical, ["squawk"]);
  assert.ok(r.points < r.maxPoints);
});

test("missing level triggers the examiner probe branch", () => {
  const r = scoreTransmission(
    CLEARANCE_EXPECT,
    "Cleared to Mumbai via PAPA two departure, squawk four three two one, Ghostair two zero five"
  );
  assert.deepEqual(r.missingCritical, ["level"]);
});

test('forbidden phrase "over and out" is flagged, never crashes scoring', () => {
  const r = scoreTransmission(CLEARANCE_EXPECT, "Roger, over and out, Ghostair two zero five");
  assert.deepEqual(r.forbidden, ["over and out"]);
});

// --- Scenario aggregate: DGCA Part 2 pass mark 50% ---

test("scenario percent and pass mark", () => {
  const good = scoreTransmission(CLEARANCE_EXPECT,
    "Cleared to Mumbai via PAPA two departure, climb to flight level one zero zero, squawk four three two one, Ghostair two zero five");
  const empty = scoreTransmission(CLEARANCE_EXPECT, "roger");
  assert.equal(scoreScenario([good, good]).percent, 100);
  assert.equal(scoreScenario([good, good]).pass, true);
  assert.equal(scoreScenario([empty, empty]).pass, false);
});

// --- MAYDAY message (SCN-6; 9432 §9.2.1, A10-II §5.3.2.1) ---

test("distress message: MAYDAY x3, nature, intentions, position all detected", () => {
  const expect = {
    slots: [
      { key: "mayday3", critical: true, phrases: ["mayday mayday mayday"] },
      { key: "nature", critical: true, phrases: ["engine failure", "engine failed"] },
      { key: "intentions", critical: true, phrases: ["forced landing", "attempting forced landing"] },
      { key: "position", critical: true, phrases: ["15 miles south", "one five miles south"] },
    ],
    callsign: "VT-ABC",
  };
  const r = scoreTransmission(
    expect,
    "MAYDAY MAYDAY MAYDAY, Delhi Approach, victor tango alfa bravo charlie, engine failure, attempting forced landing, one five miles south of the field, four thousand feet, heading tree six zero, two persons on board"
  );
  assert.deepEqual(r.missingCritical, []);
  assert.deepEqual(r.wrongCritical, []);
  // Callsign correctly placed early in a distress call — position rule is a
  // read-back convention, so "ok" (not ok-end) must not be treated as missing.
  assert.notEqual(r.callsign, "missing");
});
