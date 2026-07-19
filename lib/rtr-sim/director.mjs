// Ghost Tower — DialogueDirector: generates a flight's dialogue from a rolled
// world. v2 of what scn1.ts hardcoded — same step interface the UI consumes,
// but every value, trap and branch comes from WorldGen, so no two flights
// match. Every template phrase traces to the Captain's book ch13–15/17 and the
// ICAO models verified in tools/rtr-sim/SCENARIO_DRAFTS.md.
// Pure functions; unit-tested for determinism + round-trip with engine.mjs.

/* ----------------------------- Speech helpers ----------------------------- */

const PHONETIC_WORD = {
  A: "Alfa", B: "Bravo", C: "Charlie", D: "Delta", E: "Echo", F: "Foxtrot",
  G: "Golf", H: "Hotel", I: "India", J: "Juliett", K: "Kilo", L: "Lima",
  M: "Mike", N: "November", O: "Oscar", P: "Papa", Q: "Quebec", R: "Romeo",
  S: "Sierra", T: "Tango", U: "Uniform", V: "Victor", W: "Whiskey",
  X: "X-ray", Y: "Yankee", Z: "Zulu",
};
const DIGIT_WORD = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

/** "1013" → "one zero one three" (digit by digit — Rule 1, book Ch13 §13.4). */
export function speakDigits(value) {
  return String(value).split("").map(c => (c === "." ? "decimal" : DIGIT_WORD[Number(c)])).join(" ");
}

/** "118.35" → "one one eight decimal three five". */
export const speakFreq = speakDigits;

/** Whole hundreds/thousands (Rule 2 — altitudes): 2500 → "two thousand five hundred". */
export function speakAltitude(feet) {
  const th = Math.floor(feet / 1000);
  const hu = Math.floor((feet % 1000) / 100);
  const parts = [];
  if (th) parts.push(`${DIGIT_WORD[th]} thousand`);
  if (hu) parts.push(`${DIGIT_WORD[hu]} hundred`);
  return parts.join(" ") + " feet";
}

/** "VT-ABC" → "Victor Tango Alfa Bravo Charlie". */
export function speakCallsign(reg) {
  return reg.replace("-", "").split("").map(c => PHONETIC_WORD[c]).join(" ");
}

/** Abbreviated form after ATC shortens it: first + last two [Ch14 §14.4]. */
export function speakCallsignShort(reg) {
  const letters = reg.replace("-", "").split("");
  return [letters[0], ...letters.slice(-2)].map(c => PHONETIC_WORD[c]).join(" ");
}

function speakWind(wind) {
  const dir = String(wind.dir).padStart(3, "0");
  let s = `wind ${speakDigits(dir)} degrees ${speakDigits(wind.speed)} knots`;
  if (wind.gustTo) s += ` gusting ${speakDigits(wind.gustTo)}`;
  return s;
}

/* ------------------------------ Flight builder ---------------------------- */

// Returns { title, subtitle, briefing, station, freq, callsign, aircraft,
//           passMark, steps } — the exact shape GhostTower already flies.
export function buildVfrDeparture(world) {
  const w = world;
  const cs = speakCallsign(w.callsign.reg);       // full spoken callsign
  const csShort = speakCallsignShort(w.callsign.reg);
  const reg = w.callsign.reg;
  const A = w.airport;
  const groundSpoken = speakFreq(A.ground);
  const towerSpoken = speakFreq(A.tower);
  const rwySpoken = speakDigits(A.runway);
  const qnhSpoken = speakDigits(w.qnh);
  const qnhTrapSpoken = speakDigits(w.qnhTrap);
  const altSpoken = speakAltitude(w.departureAltitude);
  const hpSpoken = A.holdingPoint;                 // "Alfa 1" reads naturally
  const dir = w.departureDirection;

  const steps = [];

  steps.push({
    id: "radio-check",
    cue: `First transmission of the day — call ${A.name} Ground for a radio check on ${A.ground}.`,
    expect: {
      slots: [
        { key: "station", phrases: [`${A.name.toLowerCase()} ground`] },
        { key: "radiocheck", critical: true, phrases: ["radio check"] },
        { key: "freq", value: A.ground },
      ],
      callsign: reg,
      forbidden: ["over and out"],
    },
    labels: { station: "Station addressed", radiocheck: "“Radio check”", freq: "Frequency stated" },
    chips: [
      `${A.name} Ground,`, `${reg},`, "radio check", `on ${groundSpoken}`,
      `${A.name} Tower,`, "request start-up", "over and out",
    ],
    probes: { radiocheck: `Station calling ${A.name} Ground, say again your request?` },
    atcAfter: `${cs}, ${A.name} Ground, readability five.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "taxi-request",
    cue: `Readability five both ways. Request taxi — type, position, VFR intentions, with information ${w.atis}.`,
    expect: {
      slots: [
        { key: "request", critical: true, phrases: ["request taxi"] },
        { key: "atis", phrases: [`information ${w.atis.toLowerCase()}`] },
        { key: "intent", phrases: [`vfr to the ${dir}`, `vfr ${dir}`] },
      ],
      callsign: reg,
    },
    labels: { request: "Taxi request", atis: "ATIS acknowledged", intent: "VFR intentions" },
    chips: [
      `${A.name} Ground,`, `${reg},`, `${w.aircraftType} at the flying club apron,`,
      `VFR to the ${dir},`, "request taxi,", "request take-off,", `information ${w.atis}`,
    ],
    probes: { request: `${cs}, pass your message.` },
    atcAfter:
      `${cs}, taxi to holding point ${hpSpoken}, runway ${rwySpoken}, via taxiway ${A.taxiway}, QNH ${qnhSpoken}.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "taxi-readback",
    cue: "Read back the taxi clearance — holding point, runway and QNH are mandatory.",
    expect: {
      slots: [
        { key: "holding", critical: true, phrases: [`holding point ${hpSpoken.toLowerCase()}`] },
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "qnh", critical: true, value: w.qnh, anchor: "qnh" },
        { key: "via", phrases: [`via ${A.taxiway.toLowerCase()}`, `via taxiway ${A.taxiway.toLowerCase()}`] },
      ],
      callsign: reg,
    },
    labels: { holding: "Holding point", runway: "Runway", qnh: "QNH", via: "Taxi route" },
    chips: [
      `Taxi to holding point ${hpSpoken},`, `runway ${rwySpoken},`, `via ${A.taxiway},`,
      `QNH ${qnhSpoken},`, `QNH ${qnhTrapSpoken},`, reg, "roger",
    ],
    probes: {
      qnh: `${csShort}, confirm QNH?`,
      holding: `${csShort}, confirm taxi instructions?`,
      runway: `${csShort}, confirm runway?`,
    },
    corrections: { qnh: `${csShort}, negative — QNH ${qnhSpoken}. Read back.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "give-way",
    cue: "Traffic on the taxiway — respond to the instruction.",
    atcBefore: `${csShort}, give way to the ${w.traffic.givewayType} crossing ${w.traffic.givewayDir}, then continue.`,
    expect: {
      slots: [
        {
          key: "giveway", critical: true,
          phrases: [
            `giving way to the ${w.traffic.givewayType.toLowerCase()}`,
            `give way to the ${w.traffic.givewayType.toLowerCase()}`,
            "wilco",
          ],
        },
      ],
      callsign: reg,
    },
    labels: { giveway: "Give-way acknowledged" },
    chips: [`Giving way to the ${w.traffic.givewayType},`, `overtaking the ${w.traffic.givewayType},`, "wilco,", reg],
    probes: { giveway: `${csShort}, acknowledge — give way to the ${w.traffic.givewayType}.` },
    callsignAlt: csShort,
    atcAfter: `${csShort}, contact Tower ${towerSpoken}.`,
  });

  steps.push({
    id: "freq-readback",
    cue: "Read back the frequency change.",
    expect: {
      slots: [
        { key: "tower", phrases: ["tower"] },
        { key: "freq", critical: true, value: A.tower },
      ],
      callsign: reg,
    },
    labels: { tower: "Station", freq: "Frequency" },
    chips: ["Tower", `${towerSpoken},`, `${speakFreq(swapTail(A.tower))},`, "Ground", reg],
    probes: { freq: `${csShort}, confirm frequency?` },
    corrections: { freq: `${csShort}, negative — Tower ${towerSpoken}.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "ready",
    cue: `On ${A.tower} now, holding point ${hpSpoken}, run-up complete. Call Tower and report ready. Careful — “take-off” is reserved for the clearance itself.`,
    expect: {
      slots: [
        { key: "station", phrases: [`${A.name.toLowerCase()} tower`, "tower"] },
        { key: "position", phrases: [`holding point ${hpSpoken.toLowerCase()}`] },
        { key: "ready", critical: true, phrases: ["ready for departure"] },
      ],
      callsign: reg,
      forbidden: ["ready for take off"],
    },
    labels: { station: "Station addressed", position: "Position report", ready: "“Ready for departure”" },
    chips: [`${A.name} Tower,`, `${reg},`, `holding point ${hpSpoken},`, "ready for departure", "ready for take-off"],
    probes: { ready: `${csShort}, report ready for departure.` },
    callsignPosition: "any",
  });

  if (w.events.conditionalLineup) {
    steps.push({
      id: "conditional",
      cue: `A ${w.traffic.landingType} is on short final. A conditional clearance — the condition must open AND close your read-back.`,
      atcBefore: `${csShort}, behind the landing ${w.traffic.landingType}, line up runway ${rwySpoken} and wait, behind.`,
      expect: {
        slots: [
          { key: "condition", critical: true, phrases: [`behind the landing ${w.traffic.landingType.toLowerCase()}`] },
          { key: "lineup", critical: true, phrases: [`line up runway ${A.runway} and wait`, "lining up and waiting", "line up and wait"] },
          { key: "behind2", critical: true, phrases: ["wait behind", "waiting behind", "and wait, behind"] },
        ],
        callsign: reg,
      },
      labels: {
        condition: `Condition first (“behind the landing ${w.traffic.landingType}”)`,
        lineup: "Line up and wait",
        behind2: "“Behind” repeated at the end",
      },
      chips: [
        `Behind the landing ${w.traffic.landingType},`, `line up runway ${rwySpoken}`, "and wait", "behind,",
        "cleared for take-off,", reg,
      ],
      probes: {
        condition: `${csShort}, I say again — BEHIND the landing ${w.traffic.landingType}, line up runway ${rwySpoken} and wait, BEHIND. Read back the condition.`,
        behind2: `${csShort}, read back the full condition — the word “behind” closes it.`,
        lineup: `${csShort}, confirm — line up runway ${rwySpoken} and wait, behind the landing ${w.traffic.landingType}?`,
      },
      callsignAlt: csShort,
    });
  } else {
    steps.push({
      id: "lineup",
      cue: "The runway is clear. Read back the line-up instruction.",
      atcBefore: `${csShort}, line up runway ${rwySpoken} and wait.`,
      expect: {
        slots: [
          { key: "lineup", critical: true, phrases: [`line up runway ${A.runway} and wait`, "lining up and waiting", "line up and wait"] },
          { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        ],
        callsign: reg,
      },
      labels: { lineup: "Line up and wait", runway: "Runway" },
      chips: [`Line up runway ${rwySpoken}`, "and wait,", "cleared for take-off,", reg],
      probes: { lineup: `${csShort}, confirm — line up runway ${rwySpoken} and wait?` },
      callsignAlt: csShort,
    });
  }

  steps.push({
    id: "takeoff",
    cue: "Here comes your clearance — runway and clearance are mandatory read-backs; the wind is information only.",
    atcBefore: `${csShort}, ${speakWind(w.wind)}, runway ${rwySpoken}, cleared for take-off.`,
    expect: {
      slots: [
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "clearance", critical: true, phrases: ["cleared for take off"] },
      ],
      callsign: reg,
      forbidden: ["over and out"],
    },
    labels: { runway: "Runway", clearance: "“Cleared for take-off”" },
    chips: [`Runway ${rwySpoken},`, "cleared for take-off,", `${speakWind(w.wind)},`, "rolling,", reg],
    probes: { clearance: `${csShort}, read back — cleared for take-off runway ${rwySpoken}.` },
    corrections: { runway: `${csShort}, negative — runway ${rwySpoken}.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "wilco",
    cue: "Airborne, climbing out. Tower has an instruction — the correct reply is one exact word.",
    atcBefore: `${csShort}, report leaving the zone.`,
    expect: { slots: [{ key: "wilco", critical: true, phrases: ["wilco"] }], callsign: reg },
    labels: { wilco: "WILCO (will comply)" },
    chips: ["Wilco,", "Roger,", "Affirm,", reg],
    probes: { wilco: `${csShort}, confirm you will report leaving the zone?` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "leaving",
    cue: `Crossing the zone boundary ${dir}bound at ${w.departureAltitude.toLocaleString("en-IN")} feet. Make the report.`,
    expect: {
      slots: [
        { key: "leaving", critical: true, phrases: ["leaving the zone"] },
        { key: "direction", phrases: [`to the ${dir}`, dir] },
        { key: "alt", value: String(w.departureAltitude) },
      ],
      callsign: reg,
    },
    labels: { leaving: "Leaving-zone report", direction: "Direction", alt: "Altitude" },
    chips: [`${reg},`, "leaving the zone", "entering the zone", `to the ${dir},`, altSpoken, "two hundred feet"],
    probes: { leaving: `${csShort}, say your position?` },
    atcAfter: `${csShort}, roger, frequency change approved. Good day.`,
    callsignAlt: csShort,
    callsignPosition: "any",
  });

  return {
    id: `vfr-departure-${w.seed}`,
    title: "VFR Departure",
    subtitle: `${A.name} · runway ${A.runway} · information ${w.atis} · flight #${w.seed}`,
    station: `${A.name} Ground / Tower`,
    freq: A.ground,
    callsign: reg,
    aircraft: w.aircraftType,
    briefing: [
      `You are ${reg}, a ${w.aircraftType} at the flying club apron at ${A.name}, planning a VFR departure to the ${dir}.`,
      `ATIS information ${w.atis}: runway ${A.runway}, wind ${String(w.wind.dir).padStart(3, "0")}° at ${w.wind.speed}${w.wind.gustTo ? ` gusting ${w.wind.gustTo}` : ""} knots, QNH ${w.qnh}.`,
      `Work ${A.name} Ground on ${A.ground} first, then Tower on ${A.tower}. End every read-back with your callsign.`,
    ],
    passMark: 50,
    steps,
  };
}

// Transpose the last two digits of a frequency for the wrong-frequency trap chip.
function swapTail(freq) {
  const s = freq.replace(".", "");
  const sw = s.slice(0, -2) + s.slice(-1) + s.slice(-2, -1);
  return `${sw.slice(0, 3)}.${sw.slice(3)}`;
}
