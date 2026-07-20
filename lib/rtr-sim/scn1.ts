// Ghost Tower — Scenario 1: VFR Departure (the free scenario).
// Converted from tools/rtr-sim/SCENARIO_DRAFTS.md SCN-1 (Captain-delegated
// approval 2026-07-19, ICAO-verified v2). Slot semantics: lib/rtr-sim/engine.mjs.
// IRON RULE: no source/author names in any string here — this is student-facing.

import type { ExpectedTransmission } from "./engine.mjs";

export interface SimStep {
  id: string;
  /** What the situation demands of the pilot right now (system hint line). */
  cue: string;
  /** ATC transmission the student must respond to (spoken before input opens). */
  atcBefore?: string;
  /** ATC reply after an accepted transmission. */
  atcAfter?: string;
  expect: ExpectedTransmission;
  /** Friendly labels for slot keys, shown on the debrief gradesheet. */
  labels: Record<string, string>;
  /** Composer chips, correct pieces interleaved with distractor traps. */
  chips: string[];
  /** ATC probe when a critical item is MISSING (keyed by slot; examiner style). */
  probes?: Record<string, string>;
  /** ATC correction when a critical item is read back WRONG. */
  corrections?: Record<string, string>;
  /** Alternate callsign accepted after ATC abbreviates (book Ch14 rule). */
  callsignAlt?: string;
  /**
   * Where the callsign belongs. "end" (default) = read-backs, which must close
   * with the callsign [Ch14 §14.7]; "any" = initial calls and reports, where
   * the callsign correctly sits early (who you call → who you are).
   */
  callsignPosition?: "end" | "any";
  /** The radio head must be TUNED to this frequency or the call goes nowhere. */
  requiresFreq?: string;
  /** Radar contact needs this squawk set on the transponder widget. */
  requiresSquawk?: string;
}

export interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  station: string;
  freq: string;
  callsign: string;
  aircraft: string;
  briefing: string[];
  passMark: number;
  steps: SimStep[];
  /** IFR flights show the transponder widget. */
  hasTransponder?: boolean;
}

export const SCN1: Scenario = {
  id: "scn1-vfr-departure",
  title: "VFR Departure",
  subtitle: "Radio check · taxi · conditional line-up · take-off · leaving the zone",
  station: "Delhi Ground / Tower",
  freq: "121.9",
  callsign: "VT-ABC",
  aircraft: "Cessna 172",
  briefing: [
    "You are VT-ABC, a Cessna 172 at the flying club apron, planning a VFR departure to the north.",
    "ATIS information Charlie: runway 27, wind 270° at 8 knots, QNH 1013.",
    "Work Delhi Ground on 121.9 first, then Tower on 118.1. Speak or tap your calls — end every read-back with your callsign.",
  ],
  passMark: 50,
  steps: [
    {
      id: "s1-radio-check",
      cue: "First transmission of the day — call Delhi Ground for a radio check on 121.9.",
      expect: {
        slots: [
          { key: "station", phrases: ["delhi ground"] },
          { key: "radiocheck", critical: true, phrases: ["radio check"] },
          { key: "freq", value: "121.9" },
        ],
        callsign: "VT-ABC",
        forbidden: ["over and out"],
      },
      labels: { station: "Station addressed", radiocheck: "“Radio check”", freq: "Frequency stated" },
      chips: [
        "Delhi Ground,", "VT-ABC,", "radio check", "on one two one decimal nine",
        "Delhi Tower,", "request start-up", "over and out",
      ],
      probes: { radiocheck: "Station calling Delhi Ground, say again your request?" },
      atcAfter: "Victor Tango Alfa Bravo Charlie, Delhi Ground, readability five.",
      callsignPosition: "any",
    },
    {
      id: "s2-taxi-request",
      cue: "Readability five both ways. Now request taxi — type, position, VFR intentions, with information Charlie.",
      expect: {
        slots: [
          { key: "request", critical: true, phrases: ["request taxi"] },
          { key: "atis", phrases: ["information charlie"] },
          { key: "intent", phrases: ["vfr to the north", "vfr north"] },
        ],
        callsign: "VT-ABC",
      },
      labels: { request: "Taxi request", atis: "ATIS acknowledged", intent: "VFR intentions" },
      chips: [
        "Delhi Ground,", "VT-ABC,", "Cessna 172 at the flying club apron,",
        "VFR to the north,", "request taxi,", "request take-off,", "information Charlie",
      ],
      probes: { request: "Victor Tango Alfa Bravo Charlie, pass your message." },
      atcAfter:
        "Victor Tango Alfa Bravo Charlie, taxi to holding point Alfa One, runway two seven, via taxiway Bravo, QNH one zero one three.",
      callsignPosition: "any",
    },
    {
      id: "s3-taxi-readback",
      cue: "Read back the taxi clearance — holding point, runway and QNH are mandatory.",
      expect: {
        slots: [
          { key: "holding", critical: true, phrases: ["holding point a 1", "holding point alfa one"] },
          { key: "runway", critical: true, value: "27", anchor: "runway" },
          { key: "qnh", critical: true, value: "1013", anchor: "qnh" },
          { key: "via", phrases: ["via bravo", "via taxiway bravo"] },
        ],
        callsign: "VT-ABC",
      },
      labels: { holding: "Holding point", runway: "Runway", qnh: "QNH", via: "Taxi route" },
      chips: [
        "Taxi to holding point Alfa One,", "runway two seven,", "via Bravo,",
        "QNH one zero one three,", "QNH one zero three one,", "VT-ABC", "roger",
      ],
      probes: {
        qnh: "Victor Bravo Charlie, confirm QNH?",
        holding: "Victor Bravo Charlie, confirm taxi instructions?",
        runway: "Victor Bravo Charlie, confirm runway?",
      },
      corrections: { qnh: "Victor Bravo Charlie, negative — QNH one zero one three. Read back." },
      callsignAlt: "victor bravo charlie",
    },
    {
      id: "s4-give-way",
      cue: "Traffic on the taxiway — respond to the instruction.",
      atcBefore: "Victor Bravo Charlie, give way to the King Air crossing left to right, then continue.",
      expect: {
        slots: [
          { key: "giveway", critical: true, phrases: ["giving way to the king air", "give way to the king air", "wilco"] },
        ],
        callsign: "VT-ABC",
      },
      labels: { giveway: "Give-way acknowledged" },
      chips: ["Giving way to the King Air,", "overtaking the King Air,", "wilco,", "VT-ABC"],
      probes: { giveway: "Victor Bravo Charlie, acknowledge — give way to the King Air." },
      callsignAlt: "victor bravo charlie",
      atcAfter: "Victor Bravo Charlie, contact Tower one one eight decimal one.",
    },
    {
      id: "s5-freq-readback",
      cue: "Read back the frequency change.",
      expect: {
        slots: [
          { key: "tower", phrases: ["tower"] },
          { key: "freq", critical: true, value: "118.1" },
        ],
        callsign: "VT-ABC",
      },
      labels: { tower: "Station", freq: "Frequency" },
      chips: ["Tower", "one one eight decimal one,", "one one eight decimal five,", "Ground", "VT-ABC"],
      probes: { freq: "Victor Bravo Charlie, confirm frequency?" },
      corrections: { freq: "Victor Bravo Charlie, negative — Tower one one EIGHT decimal one." },
      callsignAlt: "victor bravo charlie",
    },
    {
      id: "s6-ready",
      cue: "On 118.1 now, holding point Alfa One, run-up complete. Call Tower and report ready. Careful with the wording — “take-off” is reserved for the clearance itself.",
      expect: {
        slots: [
          { key: "station", phrases: ["delhi tower", "tower"] },
          { key: "position", phrases: ["holding point a 1", "holding point alfa one"] },
          { key: "ready", critical: true, phrases: ["ready for departure"] },
        ],
        callsign: "VT-ABC",
        forbidden: ["ready for take off"],
      },
      labels: { station: "Station addressed", position: "Position report", ready: "“Ready for departure”" },
      chips: [
        "Delhi Tower,", "VT-ABC,", "holding point Alfa One,",
        "ready for departure", "ready for take-off",
      ],
      probes: { ready: "Victor Bravo Charlie, report ready for departure." },
      callsignPosition: "any",
    },
    {
      id: "s7-conditional",
      cue: "A Cessna is on short final. Tower issues a conditional clearance — the condition must open AND close your read-back.",
      atcBefore: "Victor Bravo Charlie, behind the landing Cessna, line up runway two seven and wait, behind.",
      expect: {
        slots: [
          { key: "condition", critical: true, phrases: ["behind the landing cessna"] },
          { key: "lineup", critical: true, phrases: ["line up runway 27 and wait", "lining up and waiting", "line up and wait"] },
          { key: "behind2", critical: true, phrases: ["wait behind", "waiting behind", "and wait, behind"] },
        ],
        callsign: "VT-ABC",
      },
      labels: { condition: "Condition first (“behind the landing Cessna”)", lineup: "Line up and wait", behind2: "“Behind” repeated at the end" },
      chips: [
        "Behind the landing Cessna,", "line up runway two seven", "and wait", "behind,",
        "cleared for take-off,", "VT-ABC",
      ],
      probes: {
        condition: "Victor Bravo Charlie, I say again — BEHIND the landing Cessna, line up runway two seven and wait, BEHIND. Read back the condition.",
        behind2: "Victor Bravo Charlie, read back the full condition — the word “behind” closes it.",
        lineup: "Victor Bravo Charlie, confirm — line up runway two seven and wait, behind the landing Cessna?",
      },
      callsignAlt: "victor bravo charlie",
    },
    {
      id: "s8-takeoff",
      cue: "The Cessna has landed and vacated. Here comes your clearance — runway and clearance are mandatory read-backs; the wind is information only.",
      atcBefore: "Victor Bravo Charlie, wind two seven zero degrees eight knots, runway two seven, cleared for take-off.",
      expect: {
        slots: [
          { key: "runway", critical: true, value: "27", anchor: "runway" },
          { key: "clearance", critical: true, phrases: ["cleared for take off"] },
        ],
        callsign: "VT-ABC",
        forbidden: ["over and out"],
      },
      labels: { runway: "Runway", clearance: "“Cleared for take-off”" },
      chips: [
        "Runway two seven,", "cleared for take-off,", "wind two seven zero degrees eight knots,",
        "rolling,", "VT-ABC",
      ],
      probes: { clearance: "Victor Bravo Charlie, read back — cleared for take-off runway two seven." },
      corrections: { runway: "Victor Bravo Charlie, negative — runway two SEVEN." },
      callsignAlt: "victor bravo charlie",
    },
    {
      id: "s9-wilco",
      cue: "Airborne, climbing out. Tower has an instruction — the correct reply to an instruction you'll comply with is one exact word.",
      atcBefore: "Victor Bravo Charlie, report leaving the zone.",
      expect: {
        slots: [{ key: "wilco", critical: true, phrases: ["wilco"] }],
        callsign: "VT-ABC",
      },
      labels: { wilco: "WILCO (will comply)" },
      chips: ["Wilco,", "Roger,", "Affirm,", "VT-ABC"],
      probes: { wilco: "Victor Bravo Charlie, confirm you will report leaving the zone?" },
      callsignAlt: "victor bravo charlie",
    },
    {
      id: "s10-leaving",
      cue: "You're crossing the zone boundary northbound at 2,000 feet. Make the report.",
      expect: {
        slots: [
          { key: "leaving", critical: true, phrases: ["leaving the zone"] },
          { key: "direction", phrases: ["to the north", "north"] },
          { key: "alt", value: "2000" },
        ],
        callsign: "VT-ABC",
      },
      labels: { leaving: "Leaving-zone report", direction: "Direction", alt: "Altitude" },
      chips: [
        "VT-ABC,", "leaving the zone", "entering the zone", "to the north,",
        "two thousand feet", "two hundred feet",
      ],
      probes: { leaving: "Victor Bravo Charlie, say your position?" },
      atcAfter: "Victor Bravo Charlie, roger, frequency change approved. Good day.",
      callsignAlt: "victor bravo charlie",
      callsignPosition: "any",
    },
  ],
};
