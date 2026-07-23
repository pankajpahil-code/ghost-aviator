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
    cue: `Holding point ${hpSpoken}, run-up complete. TUNE ${A.tower}, then call Tower and report ready. Careful — "take-off" is reserved for the clearance itself.`,
    requiresFreq: A.tower,
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
        condition: `Condition first ("behind the landing ${w.traffic.landingType}")`,
        lineup: "Line up and wait",
        behind2: "“Behind” repeated at the end",
      },
      chips: [
        `Behind the landing ${w.traffic.landingType},`, `line up runway ${rwySpoken}`, "and wait", "behind,",
        "cleared for take-off,", reg,
      ],
      probes: {
        condition: `${csShort}, I say again — BEHIND the landing ${w.traffic.landingType}, line up runway ${rwySpoken} and wait, BEHIND. Read back the condition.`,
        behind2: `${csShort}, read back the full condition — the word "behind" closes it.`,
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

/* ============================ IFR full flight ============================= */
// Clearance delivery → push/start → taxi (hold short) → take-off → departure
// radar (ident/squawk) → [avoiding action] → area control → [hold + EFC] →
// approach (expect-ILS trap, vectors) → ILS → tower ([RVR]) → land → vacate.
// Phraseology seeds: SCENARIO_DRAFTS.md SCN-2/3/4/5 (ICAO-verified v2);
// airline Type-3 callsign — never abbreviated [book Ch14 §14.4].
export function buildIfrFlight(world) {
  const w = world;
  const F = w.ifr;
  const A = w.airport;
  const D = F.dest;
  const reg = `Ghostair ${F.flightNo}`;
  const cs = `Ghostair ${speakDigits(F.flightNo)}`;
  const rwySpoken = speakDigits(A.runway);
  const destRwySpoken = speakDigits(D.runway);
  const qnhSpoken = speakDigits(w.qnh);
  const destQnhSpoken = speakDigits(D.qnh);
  const flSpoken = speakDigits(F.cruiseFl);
  const dflSpoken = speakDigits(F.descentFl);
  const sqSpoken = speakDigits(F.squawk);
  const sidSpoken = `${F.sidFix} ${speakDigits(F.sid.split(" ")[1])}`;
  const platSpoken = speakAltitude(F.platformAlt);
  const hpSpoken = A.holdingPoint;

  const steps = [];

  steps.push({
    id: "ifr-clr-request",
    cue: `IFR to ${D.name} today. Call ${A.name} Ground on ${A.ground} for your clearance, with information ${w.atis}.`,
    expect: {
      slots: [
        { key: "request", critical: true, phrases: [`request ifr clearance to ${D.name.toLowerCase()}`, "request ifr clearance"] },
        { key: "stand", phrases: ["stand two one", "stand 21"] },
        { key: "atis", phrases: [`information ${w.atis.toLowerCase()}`] },
      ],
      callsign: reg,
    },
    labels: { request: "IFR clearance request", stand: "Position (stand)", atis: "ATIS acknowledged" },
    chips: [
      `${A.name} Ground,`, `${reg},`, "stand two one,", `request IFR clearance to ${D.name},`,
      "request taxi,", `information ${w.atis}`,
    ],
    probes: { request: `${cs}, pass your message.` },
    callsignPosition: "any",
  });

  steps.push({
    id: "ifr-clearance",
    cue: "Copy your clearance — the full route clearance is a mandatory read-back, every element.",
    atcBefore: `${cs}, cleared to ${D.name} via ${sidSpoken} departure, climb to flight level ${flSpoken}, squawk ${sqSpoken}.`,
    expect: {
      slots: [
        { key: "limit", critical: true, phrases: [`cleared to ${D.name.toLowerCase()}`] },
        { key: "sid", critical: true, phrases: [`${F.sidFix.toLowerCase()} ${F.sid.split(" ")[1]} departure`] },
        { key: "level", critical: true, value: F.cruiseFl, anchor: "fl" },
        { key: "squawk", critical: true, value: F.squawk, anchor: "squawk" },
      ],
      callsign: reg,
      forbidden: ["over and out"],
    },
    labels: { limit: "Clearance limit", sid: "SID", level: "Level", squawk: "Squawk" },
    chips: [
      `Cleared to ${D.name}`, `via ${sidSpoken} departure,`, `climb to flight level ${flSpoken},`,
      `squawk ${sqSpoken},`, `squawk ${speakDigits([...F.squawk].reverse().join(""))},`, reg,
    ],
    probes: {
      limit: `${cs}, confirm cleared to ${D.name}?`,
      sid: `${cs}, confirm the departure?`,
      level: `${cs}, confirm initial level?`,
      squawk: `${cs}, confirm squawk?`,
    },
    corrections: { squawk: `${cs}, negative — squawk ${sqSpoken}. Read back.` },
    atcAfter: `${cs}, read-back correct. Set your squawk now, then report ready for start.`,
  });

  steps.push({
    id: "ifr-start",
    cue: `Squawk set on the transponder? Request start-up and push-back.`,
    expect: {
      slots: [
        { key: "start", critical: true, phrases: ["request start up", "request start up and push back", "request push and start"] },
      ],
      callsign: reg,
    },
    labels: { start: "Start/push request" },
    atcAfter: `${cs}, start-up approved, push-back approved, facing ${w.departureDirection}.`,
    chips: [`${A.name} Ground,`, `${reg},`, "request start-up", "and push-back", "request taxi"],
    probes: { start: `${cs}, say your request?` },
    callsignPosition: "any",
  });

  steps.push({
    id: "ifr-push-readback",
    cue: "Read back the push-back — the facing direction matters to the tug crew.",
    expect: {
      slots: [
        { key: "push", critical: true, phrases: ["push back approved", "start up and push back approved"] },
        { key: "facing", critical: true, phrases: [`facing ${w.departureDirection}`] },
      ],
      callsign: reg,
    },
    labels: { push: "Push-back approved", facing: "Facing direction" },
    chips: ["Start-up and push-back approved,", `facing ${w.departureDirection},`, `facing ${w.departureDirection === "north" ? "south" : "north"},`, reg],
    probes: { facing: `${cs}, confirm facing direction?` },
  });

  steps.push({
    id: "ifr-taxi",
    cue: "Request taxi, then read back everything — including the hold-short. Crossing an active runway without clearance is the cardinal sin.",
    atcBefore: `${cs}, taxi to holding point ${hpSpoken}, runway ${rwySpoken}, via taxiway ${A.taxiway}, hold short of runway ${speakDigits(F.holdShortRwy)}, QNH ${qnhSpoken}.`,
    expect: {
      slots: [
        { key: "holding", critical: true, phrases: [`holding point ${hpSpoken.toLowerCase()}`] },
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "holdshort", critical: true, phrases: [`hold short of runway ${F.holdShortRwy}`, `holding short of runway ${F.holdShortRwy}`] },
        { key: "qnh", critical: true, value: w.qnh, anchor: "qnh" },
      ],
      callsign: reg,
    },
    labels: { holding: "Holding point", runway: "Runway", holdshort: "Hold short (mandatory)", qnh: "QNH" },
    chips: [
      `Taxi to holding point ${hpSpoken},`, `runway ${rwySpoken},`, `via ${A.taxiway},`,
      `hold short of runway ${speakDigits(F.holdShortRwy)},`, `QNH ${qnhSpoken},`, `QNH ${speakDigits(w.qnhTrap)},`, reg,
    ],
    probes: {
      holdshort: `${cs}, read back the hold-short instruction.`,
      qnh: `${cs}, confirm QNH?`,
      holding: `${cs}, confirm taxi instructions?`,
      runway: `${cs}, confirm runway?`,
    },
    corrections: { qnh: `${cs}, negative — QNH ${qnhSpoken}. Read back.` },
    atcAfter: `${cs}, hold short cancelled, cross runway ${speakDigits(F.holdShortRwy)}, then contact Tower ${speakFreq(A.tower)}.`,
  });

  steps.push({
    id: "ifr-freq-tower",
    cue: `Read back the crossing and the frequency — then TUNE ${A.tower} before you call.`,
    expect: {
      slots: [
        { key: "cross", critical: true, phrases: [`cross runway ${F.holdShortRwy}`, `crossing runway ${F.holdShortRwy}`] },
        { key: "freq", critical: true, value: A.tower },
      ],
      callsign: reg,
    },
    labels: { cross: "Runway crossing", freq: "Frequency" },
    chips: [`Cross runway ${speakDigits(F.holdShortRwy)},`, `Tower ${speakFreq(A.tower)},`, `Tower ${speakFreq(swapTail(A.tower))},`, reg],
    probes: { freq: `${cs}, confirm frequency?`, cross: `${cs}, confirm — cleared to cross runway ${speakDigits(F.holdShortRwy)}?` },
  });

  steps.push({
    id: "ifr-ready",
    cue: `On Tower now — report ready for departure at holding point ${hpSpoken}.`,
    requiresFreq: A.tower,
    expect: {
      slots: [
        { key: "station", phrases: [`${A.name.toLowerCase()} tower`, "tower"] },
        { key: "ready", critical: true, phrases: ["ready for departure"] },
      ],
      callsign: reg,
      forbidden: ["ready for take off"],
    },
    labels: { station: "Station addressed", ready: "“Ready for departure”" },
    chips: [`${A.name} Tower,`, `${reg},`, `holding point ${hpSpoken},`, "ready for departure", "ready for take-off"],
    probes: { ready: `${cs}, report ready for departure.` },
    atcAfter: `${cs}, line up runway ${rwySpoken} and wait.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "ifr-lineup",
    cue: "Read back the line-up.",
    expect: {
      slots: [
        { key: "lineup", critical: true, phrases: [`line up runway ${A.runway} and wait`, "lining up and waiting", "line up and wait"] },
      ],
      callsign: reg,
    },
    labels: { lineup: "Line up and wait" },
    chips: [`Line up runway ${rwySpoken}`, "and wait,", "cleared for take-off,", reg],
    probes: { lineup: `${cs}, confirm — line up runway ${rwySpoken} and wait?` },
  });

  steps.push({
    id: "ifr-takeoff",
    cue: "Your take-off clearance — runway and clearance are the mandatory items.",
    atcBefore: `${cs}, wind ${speakDigits(String(w.wind.dir).padStart(3, "0"))} degrees ${speakDigits(w.wind.speed)} knots, runway ${rwySpoken}, cleared for take-off.`,
    expect: {
      slots: [
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "clearance", critical: true, phrases: ["cleared for take off"] },
      ],
      callsign: reg,
    },
    labels: { runway: "Runway", clearance: "“Cleared for take-off”" },
    chips: [`Runway ${rwySpoken},`, "cleared for take-off,", "rolling,", reg],
    probes: { clearance: `${cs}, read back — cleared for take-off runway ${rwySpoken}.` },
    corrections: { runway: `${cs}, negative — runway ${rwySpoken}.` },
    atcAfter: `${cs}, airborne, contact Departure ${speakFreq(F.departureFreq)}.`,
  });

  steps.push({
    id: "ifr-dep-freq",
    cue: `Read back, then TUNE Departure ${F.departureFreq}.`,
    expect: {
      slots: [{ key: "freq", critical: true, value: F.departureFreq }],
      callsign: reg,
    },
    labels: { freq: "Frequency" },
    chips: [`Departure ${speakFreq(F.departureFreq)},`, `Departure ${speakFreq(swapTail(F.departureFreq))},`, reg],
    probes: { freq: `${cs}, confirm frequency?` },
  });

  steps.push({
    id: "ifr-ident",
    cue: `First call to Departure — passing altitude and the SID. Radar contact needs your squawk showing ${F.squawk}.`,
    requiresFreq: F.departureFreq,
    requiresSquawk: F.squawk,
    expect: {
      slots: [
        { key: "passing", phrases: ["passing two thousand", "passing"] },
        { key: "sid", critical: true, phrases: [`${F.sidFix.toLowerCase()} ${F.sid.split(" ")[1]} departure`] },
      ],
      callsign: reg,
    },
    labels: { passing: "Passing altitude", sid: "SID reported" },
    chips: [`${A.name} Departure,`, `${reg},`, "passing two thousand,", `${sidSpoken} departure`],
    probes: { sid: `${cs}, say your departure?` },
    atcAfter: `${cs}, identified, climb to flight level ${flSpoken}${F.events.avoidingAction ? "" : `, when ready direct ${F.enrouteFix}`}.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "ifr-climb-readback",
    cue: "Read back the climb.",
    expect: {
      slots: [{ key: "level", critical: true, value: F.cruiseFl, anchor: "fl" }],
      callsign: reg,
    },
    labels: { level: "Cleared level" },
    chips: [`Climb to flight level ${flSpoken},`, `Climb to flight level ${speakDigits(F.descentFl)},`, `direct ${F.enrouteFix},`, reg],
    probes: { level: `${cs}, confirm cleared level?` },
  });

  if (F.events.avoidingAction) {
    steps.push({
      id: "ifr-avoiding",
      cue: "Traffic conflict — act on the instruction IMMEDIATELY, read back as you turn.",
      atcBefore: `${cs}, turn ${F.closingSide} immediately heading ${speakDigits(F.avoidHdg)} to avoid traffic, ${speakDigits(String(F.trafficClock))} o'clock, ${speakDigits(String(F.trafficMiles))} miles.`,
      expect: {
        slots: [
          { key: "turn", critical: true, phrases: [`${F.closingSide} immediately heading ${F.avoidHdg}`, `${F.closingSide} heading ${F.avoidHdg}`, `turn ${F.closingSide} heading ${F.avoidHdg}`] },
        ],
        callsign: reg,
      },
      labels: { turn: "Immediate avoiding turn" },
      chips: [`${F.closingSide === "left" ? "Left" : "Right"} immediately heading ${speakDigits(F.avoidHdg)},`, "looking out,", reg],
      probes: { turn: `${cs}, I say again — turn ${F.closingSide} IMMEDIATELY heading ${speakDigits(F.avoidHdg)}. Acknowledge.` },
      atcAfter: `${cs}, clear of traffic, resume own navigation direct ${F.enrouteFix}, contact Control ${speakFreq(F.controlFreq)}.`,
    });
  } else {
    steps.push({
      id: "ifr-handoff-control",
      cue: "Handed to area control — read back the frequency.",
      atcBefore: `${cs}, contact Control ${speakFreq(F.controlFreq)}.`,
      expect: {
        slots: [{ key: "freq", critical: true, value: F.controlFreq }],
        callsign: reg,
      },
      labels: { freq: "Frequency" },
      chips: [`Control ${speakFreq(F.controlFreq)},`, `Control ${speakFreq(swapTail(F.controlFreq))},`, reg],
      probes: { freq: `${cs}, confirm frequency?` },
    });
  }

  steps.push({
    id: "ifr-control-call",
    cue: `TUNE ${F.controlFreq} and make the first call to Control — level and estimate for ${F.enrouteFix}.`,
    requiresFreq: F.controlFreq,
    expect: {
      slots: [
        { key: "level", critical: true, value: F.cruiseFl, anchor: "fl" },
        { key: "fix", phrases: [`estimating ${F.enrouteFix.toLowerCase()}`, F.enrouteFix.toLowerCase()] },
      ],
      callsign: reg,
    },
    labels: { level: "Level report", fix: "Next fix estimate" },
    chips: [`${A.name} Control,`, `${reg},`, `flight level ${flSpoken},`, `estimating ${F.enrouteFix} at ${speakDigits(F.efcTime)}`],
    probes: { level: `${cs}, say your level?` },
    atcAfter: F.events.hold
      ? `${cs}, roger. Hold at ${F.enrouteFix}, flight level ${flSpoken}, expect further clearance at ${speakDigits(F.efcTime)}.`
      : `${cs}, roger, report ${F.enrouteFix}.`,
    callsignPosition: "any",
  });

  if (F.events.hold) {
    steps.push({
      id: "ifr-hold",
      cue: "Read back the hold in full — fix, level, and the expect-further-clearance time.",
      expect: {
        slots: [
          { key: "fix", critical: true, phrases: [`hold at ${F.enrouteFix.toLowerCase()}`] },
          { key: "level", critical: true, value: F.cruiseFl, anchor: "fl" },
          { key: "efc", critical: true, phrases: [`expect further clearance at ${F.efcTime}`, `further clearance at ${F.efcTime}`] },
        ],
        callsign: reg,
      },
      labels: { fix: "Holding fix", level: "Holding level", efc: "EFC time" },
      chips: [
        `Hold at ${F.enrouteFix},`, `flight level ${flSpoken},`,
        `expect further clearance at ${speakDigits(F.efcTime)},`, "expect onward clearance,", reg,
      ],
      probes: { efc: `${cs}, confirm expected clearance time?` },
      atcAfter: `${cs}, cleared ${F.enrouteFix} direct ${D.name}, descend to flight level ${dflSpoken}, contact ${D.name} Approach ${speakFreq(D.approach)}.`,
    });
  } else {
    steps.push({
      id: "ifr-descent",
      cue: "Descent and handoff coming — read back everything.",
      atcBefore: `${cs}, descend to flight level ${dflSpoken}, contact ${D.name} Approach ${speakFreq(D.approach)}.`,
      expect: {
        slots: [
          { key: "level", critical: true, value: F.descentFl, anchor: "fl" },
          { key: "freq", critical: true, value: D.approach },
        ],
        callsign: reg,
      },
      labels: { level: "Descent level", freq: "Frequency" },
      chips: [`Descend to flight level ${dflSpoken},`, `${D.name} Approach ${speakFreq(D.approach)},`, reg],
      probes: { level: `${cs}, confirm level?`, freq: `${cs}, confirm frequency?` },
    });
  }

  steps.push({
    id: "ifr-app-call",
    cue: `TUNE ${D.approach} and call ${D.name} Approach with your level and information ${D.atis}. Listen for the word EXPECT — it is not a clearance.`,
    requiresFreq: D.approach,
    expect: {
      slots: [
        { key: "level", critical: true, value: F.descentFl, anchor: "fl" },
        { key: "atis", phrases: [`information ${D.atis.toLowerCase()}`] },
      ],
      callsign: reg,
    },
    labels: { level: "Level report", atis: "Destination ATIS" },
    chips: [`${D.name} Approach,`, `${reg},`, `flight level ${dflSpoken},`, `information ${D.atis}`],
    probes: { level: `${cs}, say your level?` },
    atcAfter: `${cs}, descend to ${platSpoken}, QNH ${destQnhSpoken}, expect ILS approach runway ${destRwySpoken}.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "ifr-platform",
    cue: "Read back the descent and QNH. “Expect ILS” is information — reading it back as a clearance is the classic trap.",
    expect: {
      slots: [
        { key: "alt", critical: true, value: String(F.platformAlt) },
        { key: "qnh", critical: true, value: D.qnh, anchor: "qnh" },
      ],
      callsign: reg,
      forbidden: ["cleared ils"],
    },
    labels: { alt: "Altitude", qnh: "QNH" },
    chips: [
      `Descend to ${platSpoken},`, `QNH ${destQnhSpoken},`,
      `expect ILS runway ${destRwySpoken},`, `cleared ILS runway ${destRwySpoken},`, reg,
    ],
    probes: { qnh: `${cs}, confirm QNH?`, alt: `${cs}, confirm altitude?` },
    corrections: { qnh: `${cs}, negative — QNH ${destQnhSpoken}. Read back.` },
    atcAfter: `${cs}, turn ${F.closingSide} heading ${speakDigits(F.vectorHdg)}, vectors ILS runway ${destRwySpoken}.`,
  });

  steps.push({
    id: "ifr-vector",
    cue: "Read back the vector.",
    expect: {
      slots: [{ key: "hdg", critical: true, value: F.vectorHdg, anchor: "heading" }],
      callsign: reg,
    },
    labels: { hdg: "Heading" },
    chips: [`${F.closingSide === "left" ? "Left" : "Right"} heading ${speakDigits(F.vectorHdg)},`, "vectors ILS,", reg],
    probes: { hdg: `${cs}, confirm heading?` },
    atcAfter: `${cs}, closing the localizer from the ${F.closingSide}, turn ${F.closingSide} heading ${speakDigits(F.closingHdg)}, cleared ILS approach runway ${destRwySpoken}, report established.`,
  });

  steps.push({
    id: "ifr-cleared-ils",
    cue: "NOW it is a clearance — read back heading, the ILS clearance and the runway.",
    expect: {
      slots: [
        { key: "hdg", critical: true, value: F.closingHdg, anchor: "heading" },
        { key: "ils", critical: true, phrases: [`cleared ils approach runway ${D.runway}`, `cleared ils runway ${D.runway}`] },
        { key: "wilco", phrases: ["wilco", "report established"] },
      ],
      callsign: reg,
    },
    labels: { hdg: "Closing heading", ils: "ILS clearance + runway", wilco: "Will report established" },
    chips: [
      `${F.closingSide === "left" ? "Left" : "Right"} heading ${speakDigits(F.closingHdg)},`,
      `cleared ILS approach runway ${destRwySpoken},`, "wilco,", reg,
    ],
    probes: { ils: `${cs}, read back the approach clearance.` },
  });

  steps.push({
    id: "ifr-established",
    cue: "Localizer and glideslope captured — report established.",
    expect: {
      slots: [{ key: "est", critical: true, phrases: [`established ils runway ${D.runway}`, "established ils", "established"] }],
      callsign: reg,
    },
    labels: { est: "Established report" },
    chips: [`${reg},`, `established ILS runway ${destRwySpoken}`, "on the glide,"],
    probes: { est: `${cs}, report established.` },
    atcAfter: `${cs}, contact ${D.name} Tower ${speakFreq(D.tower)}.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "ifr-tower-final",
    cue: `TUNE ${D.tower} and call ${D.name} Tower on the ILS.${F.events.lowVis ? " Visibility is poor — expect RVR." : ""}`,
    requiresFreq: D.tower,
    expect: {
      slots: [{ key: "ils", critical: true, phrases: [`ils runway ${D.runway}`, "on the ils"] }],
      callsign: reg,
    },
    labels: { ils: "Position on the ILS" },
    chips: [`${D.name} Tower,`, `${reg},`, `ILS runway ${destRwySpoken}`],
    probes: { ils: `${cs}, say your position?` },
    atcAfter: F.events.lowVis
      ? `${cs}, continue approach, RVR runway ${destRwySpoken}, touchdown ${speakRvr(F.rvr.touchdown)} metres, midpoint ${speakRvr(F.rvr.midpoint)} metres, stop end ${speakRvr(F.rvr.stopEnd)} metres.`
      : `${cs}, continue approach, number one.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "ifr-continue",
    cue: F.events.lowVis
      ? "Acknowledge — “continue approach” is NOT a landing clearance. RVR may be read back or acknowledged with roger."
      : "Acknowledge — “continue approach” is NOT a landing clearance.",
    expect: {
      slots: [{ key: "cont", critical: true, phrases: ["continue approach", "continuing approach", "roger continue"] }],
      callsign: reg,
      forbidden: ["cleared to land"],
    },
    labels: { cont: "Continue approach acknowledged" },
    chips: ["Continue approach,", "roger,", "cleared to land,", reg],
    probes: { cont: `${cs}, acknowledge — continue approach.` },
    atcAfter: `${cs}, wind ${speakDigits(String(w.wind.dir).padStart(3, "0"))} degrees ${speakDigits(w.wind.speed)} knots, runway ${destRwySpoken}, cleared to land.`,
  });

  steps.push({
    id: "ifr-land",
    cue: "The landing clearance — mandatory read-back.",
    expect: {
      slots: [
        { key: "runway", critical: true, value: D.runway, anchor: "runway" },
        { key: "clearance", critical: true, phrases: ["cleared to land"] },
      ],
      callsign: reg,
    },
    labels: { runway: "Runway", clearance: "“Cleared to land”" },
    chips: [`Runway ${destRwySpoken},`, "cleared to land,", "cleared for take-off,", reg],
    probes: { clearance: `${cs}, read back — cleared to land runway ${destRwySpoken}.` },
    atcAfter: `${cs}, vacate next ${F.closingSide}, contact Ground ${speakFreq(D.ground)}. Welcome to ${D.name}.`,
  });

  steps.push({
    id: "ifr-vacate",
    cue: "Down and rolling out. Read back, and report vacated only when the WHOLE aircraft is past the holding point.",
    expect: {
      slots: [
        { key: "vacate", critical: true, phrases: [`vacate next ${F.closingSide}`, `next ${F.closingSide}`] },
        { key: "freq", critical: true, value: D.ground },
        { key: "vacated", phrases: ["runway vacated"] },
      ],
      callsign: reg,
    },
    labels: { vacate: "Vacate instruction", freq: "Ground frequency", vacated: "Vacated report" },
    chips: [`Vacate next ${F.closingSide},`, `Ground ${speakFreq(D.ground)},`, `${reg},`, "runway vacated,"],
    probes: { freq: `${cs}, confirm Ground frequency?` },
    atcAfter: `${cs}, roger. Good day.`,
  });

  return {
    id: `ifr-flight-${w.seed}`,
    title: `IFR — ${A.name} to ${D.name}`,
    subtitle: `${reg} · ${F.sid} departure · FL${F.cruiseFl} · ILS ${D.runway} at ${D.name} · flight #${w.seed}`,
    station: `${A.name} → ${D.name}`,
    freq: A.ground,
    callsign: reg,
    aircraft: "Ghostair jet",
    hasTransponder: true,
    briefing: [
      `You are ${reg}, IFR from ${A.name} to ${D.name}. Stand 21, information ${w.atis} at ${A.name} (runway ${A.runway}, QNH ${w.qnh}).`,
      `Expect the ${F.sid} departure, cruise flight level ${F.cruiseFl}, and the ILS runway ${D.runway} at ${D.name} (information ${D.atis}, QNH ${D.qnh}).`,
      `This flight works five frequencies — Ground, Tower, Departure, Control and ${D.name} Approach/Tower. TUNE each handoff on the radio head, and set your squawk when cleared: radar contact depends on it.`,
    ],
    passMark: 50,
    steps,
  };
}

// RVR uses the whole-hundreds rule [9432 §2.4.3]; fifties speak naturally.
function speakRvr(metres) {
  const h = Math.floor(metres / 100);
  const rem = metres % 100;
  let s = `${DIGIT_WORD[h]} hundred`;
  if (rem === 50) s += " and fifty";
  return s;
}

/* =========================== Emergency flight ============================= */
// PAN-PAN → MAYDAY escalation (the Captain-approved SCN-6 shape, dynamic):
// rough engine → urgency call → priority handling → engine failure → full
// distress message → squawk 7700 → silence imposed on the frequency →
// straight-in → DISTRESS TRAFFIC ENDED. Distress format per book Ch20 §20.2
// and the aeronautical silence signals verified against Annex 10 Vol II §5.3.
export function buildEmergencyFlight(world) {
  const w = world;
  const A = w.airport;
  const reg = w.callsign.reg;
  const cs = speakCallsign(reg);
  const csShort = speakCallsignShort(reg);
  const rwySpoken = speakDigits(A.runway);
  const qnhSpoken = speakDigits(w.qnh);
  const F = w.emergency;
  const altSpoken = speakAltitude(F.cruiseAlt);
  const divAltSpoken = speakAltitude(F.divertAlt);
  const posPhrase = `${F.distance} miles ${F.direction} of the field`;
  const posSpoken = `${speakDigits(String(F.distance))} miles ${F.direction} of the field`;
  const pos2Spoken = `${speakDigits(String(F.distance2))} miles ${F.direction}`;

  const steps = [];

  steps.push({
    id: "em-panpan",
    cue: `Cruise at ${F.cruiseAlt.toLocaleString("en-IN")} ft, ${posPhrase.replace("of the field", `of ${A.name}`)} — and the engine is RUNNING ROUGH. Not critical yet. Make the urgency call: PAN-PAN ×3, station, callsign, nature, intentions, position and level.`,
    expect: {
      slots: [
        { key: "pan3", critical: true, phrases: ["pan pan pan pan pan pan", "mayday mayday mayday"] },
        { key: "nature", critical: true, phrases: ["engine running rough", "rough running engine", "engine rough"] },
        { key: "intent", critical: true, phrases: ["request diversion", "precautionary landing", "request priority landing"] },
        { key: "position", critical: true, phrases: [`${F.distance} miles ${F.direction}`] },
        { key: "level", value: String(F.cruiseAlt) },
      ],
      callsign: reg,
    },
    labels: {
      pan3: "PAN-PAN × 3 (escalating to MAYDAY is never wrong)",
      nature: "Nature of urgency", intent: "Intentions", position: "Position", level: "Level",
    },
    chips: [
      "PAN-PAN PAN-PAN PAN-PAN,", `${A.name} Approach,`, `${reg},`, "engine running rough,",
      "request diversion for precautionary landing,", `${posSpoken},`, altSpoken, "over and out",
    ],
    probes: { position: `${csShort}, say your position?`, nature: `${csShort}, say again the nature of your problem?` },
    atcAfter: `${csShort}, roger your PAN, cleared direct to the field, descend to ${divAltSpoken}, QNH ${qnhSpoken}, number one, fire and medical services alerted.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "em-priority-readback",
    cue: "Read back the priority handling — altitude and QNH.",
    expect: {
      slots: [
        { key: "direct", phrases: ["cleared direct", "direct to the field"] },
        { key: "alt", critical: true, value: String(F.divertAlt) },
        { key: "qnh", critical: true, value: w.qnh, anchor: "qnh" },
      ],
      callsign: reg,
    },
    labels: { direct: "Direct routing", alt: "Altitude", qnh: "QNH" },
    chips: [`Cleared direct,`, `descend to ${divAltSpoken},`, `QNH ${qnhSpoken},`, `QNH ${speakDigits(w.qnhTrap)},`, reg],
    probes: { qnh: `${csShort}, confirm QNH?`, alt: `${csShort}, confirm altitude?` },
    corrections: { qnh: `${csShort}, negative — QNH ${qnhSpoken}. Read back.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "em-mayday",
    cue: `The engine has FAILED. Grave and imminent danger — this is a MAYDAY. Transmit the full distress message: MAYDAY ×3, station, callsign, nature, intentions, position, level and heading, persons on board. Slowly. You may not get a second chance.`,
    expect: {
      slots: [
        { key: "mayday3", critical: true, phrases: ["mayday mayday mayday"] },
        { key: "nature", critical: true, phrases: ["engine failure", "engine failed", "engine has failed"] },
        { key: "intent", critical: true, phrases: ["forced landing", "attempting forced landing", "making forced landing"] },
        { key: "position", critical: true, phrases: [`${F.distance2} miles ${F.direction}`] },
        { key: "level", value: String(F.maydayAlt) },
        { key: "pob", phrases: [`${SPOKEN_POB[F.pob]} persons on board`, `${F.pob} persons on board`] },
      ],
      callsign: reg,
    },
    labels: {
      mayday3: "MAYDAY × 3", nature: "Nature (engine failure)", intent: "Intentions (forced landing)",
      position: "Position", level: "Level", pob: "Persons on board",
    },
    chips: [
      "MAYDAY MAYDAY MAYDAY,", `${A.name} Approach,`, `${reg},`, "engine failure,",
      "attempting forced landing,", `${pos2Spoken},`, speakAltitude(F.maydayAlt) + ",",
      `${SPOKEN_POB[F.pob]} persons on board`,
    ],
    probes: {
      position: `${csShort}, MAYDAY acknowledged — say your position?`,
      nature: `${csShort}, say again the nature of your emergency?`,
      intent: `${csShort}, say your intentions?`,
    },
    atcAfter: `${csShort}, MAYDAY. Squawk seven seven zero zero. Wind ${speakDigits(String(w.wind.dir).padStart(3, "0"))} degrees ${speakDigits(w.wind.speed)} knots, runway ${rwySpoken}, you are number one, all stations stand by.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "em-7700",
    cue: "Set 7700 on the transponder — every radar screen in the FIR lights up — then acknowledge.",
    requiresSquawk: "7700",
    expect: {
      slots: [
        { key: "sq", critical: true, phrases: ["squawk 7700", "squawking 7700", "7700"] },
      ],
      callsign: reg,
    },
    labels: { sq: "7700 acknowledged" },
    chips: ["Squawking seven seven zero zero,", "wilco,", reg],
    probes: { sq: `${csShort}, confirm squawking seven seven zero zero?` },
    atcAfter: `All stations, ${A.name} Approach — STOP TRANSMITTING, MAYDAY. ${csShort}, field at your twelve o'clock, ${speakDigits(String(F.finalMiles))} miles, runway ${rwySpoken}, cleared to land, no traffic.`,
  });

  steps.push({
    id: "em-land-readback",
    cue: "Silence has been imposed for you — the frequency is yours. Read back the landing clearance and fly the aircraft.",
    expect: {
      slots: [
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "clearance", critical: true, phrases: ["cleared to land"] },
      ],
      callsign: reg,
    },
    labels: { runway: "Runway", clearance: "“Cleared to land”" },
    chips: [`Runway ${rwySpoken},`, "cleared to land,", reg],
    probes: { clearance: `${csShort}, read back — cleared to land runway ${rwySpoken}.` },
    atcAfter: `${csShort}, fire services alongside the runway. All stations, ${A.name} Approach — DISTRESS TRAFFIC ENDED. ${csShort}, well flown. Taxi with the follow-me vehicle.`,
  });

  steps.push({
    id: "em-final",
    cue: "Safely down. Close it out — acknowledge, and thank the crew on the ground.",
    expect: {
      slots: [{ key: "ack", critical: true, phrases: ["wilco", "roger", "runway vacated"] }],
      callsign: reg,
    },
    labels: { ack: "Acknowledged" },
    chips: ["Wilco,", "runway vacated,", "thank you,", reg],
    probes: { ack: `${csShort}, acknowledge?` },
    callsignAlt: csShort,
  });

  return {
    id: `emergency-${w.seed}`,
    title: "Emergency — PAN-PAN to MAYDAY",
    subtitle: `${reg} · engine trouble ${posPhrase.replace("of the field", `from ${A.name}`)} · flight #${w.seed}`,
    station: `${A.name} Approach`,
    freq: A.approach,
    callsign: reg,
    aircraft: w.aircraftType,
    hasTransponder: true,
    briefing: [
      `You are ${reg}, a ${w.aircraftType} in the cruise at ${F.cruiseAlt.toLocaleString("en-IN")} ft, ${F.distance} miles ${F.direction} of ${A.name}, working Approach on ${A.approach}.`,
      `The engine is about to give you the worst day of your training. The difference between urgency and distress — PAN-PAN versus MAYDAY — is the difference the examiner listens for.`,
      `The distress message format: MAYDAY ×3 · station · callsign · nature · intentions · position · level and heading · persons on board. Nature, intentions, position — the three things ATC needs most.`,
    ],
    passMark: 50,
    steps,
  };
}

const SPOKEN_POB = { 2: "two", 3: "three", 4: "four" };

/* ========================= Radio-failure (7600) drill ====================== */
// Comms failure inbound: calls unanswered → squawk 7600 UNPROMPTED → transmit
// blind → receiver-only branch: "if you read, squawk ident" → acknowledge by
// IDENT → light-gun signals. Procedure per book Ch20 §20.7 and Ch19 §19.5.
export function buildRadioFailureFlight(world) {
  const w = world;
  const A = w.airport;
  const reg = w.callsign.reg;
  const cs = speakCallsign(reg);
  const csShort = speakCallsignShort(reg);
  const rwySpoken = speakDigits(A.runway);
  const F = w.emergency;
  const posSpoken = `${speakDigits(String(F.distance))} miles ${F.direction}`;

  const steps = [];

  steps.push({
    id: "rf-inbound",
    cue: `Inbound to ${A.name}, ${F.distance} miles ${F.direction}, ${F.cruiseAlt.toLocaleString("en-IN")} ft. Make the normal inbound call to Tower.`,
    expect: {
      slots: [
        { key: "station", phrases: [`${A.name.toLowerCase()} tower`, "tower"] },
        { key: "position", critical: true, phrases: [`${F.distance} miles ${F.direction}`] },
        { key: "intent", phrases: ["for landing", "inbound for landing", "inbound"] },
      ],
      callsign: reg,
    },
    labels: { station: "Station addressed", position: "Position", intent: "Intentions" },
    chips: [`${A.name} Tower,`, `${reg},`, `${posSpoken},`, `${speakAltitude(F.cruiseAlt)},`, "inbound for landing"],
    probes: {},
    callsignPosition: "any",
  });

  steps.push({
    id: "rf-blind",
    cue: "…nothing. Two calls, no reply — carrier silent. Radio checks done: volume, squelch, alternate box — dead. Set the RADIO-FAILURE code on the transponder, then transmit BLIND: prefix, callsign, position, intentions.",
    requiresSquawk: "7600",
    gateSilent: true,
    expect: {
      slots: [
        { key: "blind", critical: true, phrases: ["transmitting blind"] },
        { key: "position", critical: true, phrases: [`${F.distance} miles ${F.direction}`, `${F.distance2} miles ${F.direction}`] },
        { key: "intent", critical: true, phrases: [`join and land runway ${A.runway}`, `will join and land runway ${A.runway}`, "continue for landing", "joining for landing"] },
      ],
      callsign: reg,
    },
    labels: { blind: "“Transmitting blind”", position: "Position", intent: "Intentions stated" },
    chips: [
      `${reg},`, "transmitting blind,", `${posSpoken},`,
      `will join and land runway ${rwySpoken}`, "request radio check,",
    ],
    probes: {},
    callsignPosition: "any",
  });

  steps.push({
    id: "rf-ident1",
    cue: "A voice, faint but readable — your RECEIVER works. The transmitter is dead. You cannot reply by voice… but radar can see you answer.",
    atcBefore: `${csShort}, ${A.name} Tower — transmission not received. If you read ${A.name} Tower, squawk ident.`,
    requiresIdent: true,
    actionLabel: "Press IDENT on the transponder",
    expect: { slots: [], callsign: undefined },
    labels: {},
    chips: [],
    atcAfter: `${csShort}, ident observed. Continue for runway ${rwySpoken}, number one. Watch the tower for light signals. Acknowledge with ident.`,
  });

  steps.push({
    id: "rf-ident2",
    cue: "Acknowledge the instruction — the transponder is your voice now.",
    requiresIdent: true,
    actionLabel: "Press IDENT to acknowledge",
    expect: { slots: [], callsign: undefined },
    labels: {},
    chips: [],
    atcAfter: `${csShort}, ident observed.`,
  });

  steps.push({
    id: "rf-lightgun",
    cue: "Short final — and a STEADY GREEN light blazes from the tower. For the gradesheet: what has the tower just told you? (Answer as the read-back you cannot transmit.)",
    expect: {
      slots: [
        { key: "meaning", critical: true, phrases: ["cleared to land"] },
        { key: "runway", value: A.runway, anchor: "runway" },
      ],
      callsign: reg,
    },
    labels: { meaning: "Steady green = cleared to land", runway: "Runway" },
    chips: [`Runway ${rwySpoken},`, "cleared to land", "return for landing", "give way and continue circling", reg],
    probes: { meaning: "Check the light-signal table — steady green, aircraft in flight?" },
    atcAfter: `${csShort}, light signal acknowledged — down and rolling. Taxi with the follow-me vehicle. Radio failure procedures complete. Well handled.`,
  });

  steps.push({
    id: "rf-debrief-q",
    cue: "One more for the examiner: after a COMPLETE communications failure, what does an IFR aircraft do? (The rule that keeps everyone predictable.)",
    expect: {
      slots: [
        { key: "rule", critical: true, phrases: ["continue in accordance with the last clearance", "continue per last clearance", "last acknowledged clearance", "continue flight plan", "continue as per flight plan"] },
      ],
      callsign: reg,
    },
    labels: { rule: "Continue per last clearance / flight plan" },
    chips: ["Continue in accordance with the last clearance", "and the flight plan,", "descend immediately,", "orbit until contact,", reg],
    probes: { rule: "What did the last acknowledged clearance tell you to do?" },
  });

  return {
    id: `radiofail-${w.seed}`,
    title: "Radio Failure — 7600",
    subtitle: `${reg} · inbound ${A.name} · comms lost · flight #${w.seed}`,
    station: `${A.name} Tower`,
    freq: A.tower,
    callsign: reg,
    aircraft: w.aircraftType,
    hasTransponder: true,
    briefing: [
      `You are ${reg}, a ${w.aircraftType} inbound to ${A.name} from the ${F.direction}, ${F.distance} miles out at ${F.cruiseAlt.toLocaleString("en-IN")} ft, on Tower ${A.tower}.`,
      `This drill is about the day the radio dies: 7600, blind transmissions, answering with the IDENT button, and reading the tower's light gun.`,
      `Remember the ladder: squawk 7600 → check the basics → listen out → transmit blind → follow the last clearance → light signals.`,
    ],
    passMark: 50,
    steps,
  };
}

/* =========================== VFR Circuit (§4.6-4.9) ======================== */
export function buildVfrCircuit(world) {
  const w = world;
  const A = w.airport;
  const C = w.circuit;
  const reg = w.callsign.reg;
  const cs = speakCallsign(reg);
  const csShort = speakCallsignShort(reg);
  const rwySpoken = speakDigits(A.runway);
  const qnhSpoken = speakDigits(w.qnh);
  const circAltSpoken = speakAltitude(C.altitude);
  const steps = [];

  steps.push({
    id: "cct-join",
    cue: `You are ${C.joinDist} miles ${C.joinFrom} of ${A.name} at ${C.altitude.toLocaleString("en-IN")} ft. Call Tower — request to join for circuits, with information ${w.atis}.`,
    expect: {
      slots: [
        { key: "station", phrases: [`${A.name.toLowerCase()} tower`, "tower"] },
        { key: "position", critical: true, phrases: [`${C.joinDist} miles ${C.joinFrom}`] },
        { key: "request", critical: true, phrases: ["request join", "request joining", "request circuits"] },
        { key: "atis", phrases: [`information ${w.atis.toLowerCase()}`] },
      ],
      callsign: reg,
    },
    labels: { station: "Station", position: "Position", request: "Request to join", atis: "ATIS" },
    chips: [
      `${A.name} Tower,`, `${reg},`, `${speakDigits(String(C.joinDist))} miles ${C.joinFrom},`,
      circAltSpoken + ",", "request joining for circuits,", "request taxi,", `information ${w.atis}`,
    ],
    probes: { request: `${cs}, pass your message.` },
    callsignPosition: "any",
  });

  steps.push({
    id: "cct-join-rb",
    cue: "Read back the joining instruction — circuit direction, runway and QNH are mandatory.",
    atcBefore: `${cs}, join ${C.direction} downwind runway ${rwySpoken}, QNH ${qnhSpoken}, report downwind, number ${speakDigits(String(C.sequenceNo))}.`,
    expect: {
      slots: [
        { key: "join", critical: true, phrases: [`join ${C.direction} downwind`, `${C.direction} downwind`] },
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "qnh", critical: true, value: w.qnh, anchor: "qnh" },
      ],
      callsign: reg,
    },
    labels: { join: "Join direction", runway: "Runway", qnh: "QNH" },
    chips: [
      `Join ${C.direction} downwind,`, `runway ${rwySpoken},`, `QNH ${qnhSpoken},`,
      `QNH ${speakDigits(w.qnhTrap)},`, `number ${speakDigits(String(C.sequenceNo))},`, reg,
    ],
    probes: { qnh: `${csShort}, confirm QNH?` },
    corrections: { qnh: `${csShort}, negative — QNH ${qnhSpoken}. Read back.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "cct-downwind",
    cue: "You are downwind. Make the downwind call.",
    expect: {
      slots: [
        { key: "downwind", critical: true, phrases: ["downwind"] },
        { key: "runway", phrases: [`runway ${A.runway}`] },
      ],
      callsign: reg,
    },
    labels: { downwind: "Downwind report", runway: "Runway" },
    chips: [`${reg},`, `downwind runway ${rwySpoken}`, "base leg"],
    probes: { downwind: `${csShort}, report downwind.` },
    atcAfter: `${csShort}, number ${speakDigits(String(C.sequenceNo))}, follow the ${C.trafficType} on ${C.trafficPosition}.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "cct-seq",
    cue: `Acknowledge the traffic — you are following the ${C.trafficType}.`,
    expect: {
      slots: [
        { key: "traffic", critical: true, phrases: [`follow the ${C.trafficType.toLowerCase()}`, "traffic in sight", "looking out", "wilco"] },
      ],
      callsign: reg,
    },
    labels: { traffic: "Traffic acknowledged" },
    chips: [`Number ${speakDigits(String(C.sequenceNo))},`, "traffic in sight,", "looking out,", "wilco,", reg],
    probes: { traffic: `${csShort}, confirm traffic in sight?` },
    callsignAlt: csShort,
  });

  if (C.events.wakeTurbulence) {
    steps.push({
      id: "cct-wake",
      cue: "Heavy traffic ahead — respond to the wake turbulence warning.",
      atcBefore: `${csShort}, extend downwind due wake turbulence, ${C.heavyType} landing ahead.`,
      expect: {
        slots: [{ key: "extend", critical: true, phrases: ["extending downwind", "extend downwind", "wilco"] }],
        callsign: reg,
      },
      labels: { extend: "Extending downwind" },
      chips: ["Extending downwind,", "wilco,", "roger,", reg],
      probes: { extend: `${csShort}, acknowledge — extend downwind.` },
      callsignAlt: csShort,
    });
  }

  steps.push({
    id: "cct-final",
    cue: "Turning final. Report.",
    expect: {
      slots: [
        { key: "final", critical: true, phrases: ["final", "turning final"] },
        { key: "runway", phrases: [`runway ${A.runway}`] },
      ],
      callsign: reg,
    },
    labels: { final: "Final report", runway: "Runway" },
    chips: [`${reg},`, `final runway ${rwySpoken}`, "downwind"],
    probes: { final: `${csShort}, report final.` },
    callsignPosition: "any",
  });

  if (C.events.goAround) {
    steps.push({
      id: "cct-goaround",
      cue: "Traffic on the runway — Tower says GO AROUND. The correct pilot call is “GOING AROUND”.",
      atcBefore: `${csShort}, go around, I say again, go around, traffic on the runway.`,
      expect: {
        slots: [{ key: "goaround", critical: true, phrases: ["going around"] }],
        callsign: reg,
      },
      labels: { goaround: "“Going around”" },
      chips: ["Going around,", "Cleared to land,", "roger,", reg],
      probes: { goaround: `${csShort}, I say again, GO AROUND. Acknowledge.` },
      atcAfter: `${csShort}, climb straight ahead, rejoin ${C.direction} downwind runway ${rwySpoken}.`,
      callsignAlt: csShort,
    });

    steps.push({
      id: "cct-rejoin",
      cue: "Read back the rejoin instruction.",
      expect: {
        slots: [
          { key: "rejoin", critical: true, phrases: ["rejoin", `${C.direction} downwind`] },
          { key: "runway", value: A.runway, anchor: "runway" },
        ],
        callsign: reg,
      },
      labels: { rejoin: "Rejoin instruction", runway: "Runway" },
      chips: [`Climbing straight ahead,`, `rejoin ${C.direction} downwind,`, `runway ${rwySpoken},`, reg],
      probes: { rejoin: `${csShort}, confirm rejoin ${C.direction} downwind?` },
      callsignAlt: csShort,
    });

    steps.push({
      id: "cct-dw2",
      cue: "Back downwind after the go-around. Report.",
      expect: { slots: [{ key: "downwind", critical: true, phrases: ["downwind"] }], callsign: reg },
      labels: { downwind: "Downwind report" },
      chips: [`${reg},`, `downwind runway ${rwySpoken}`],
      probes: { downwind: `${csShort}, report downwind.` },
      atcAfter: `${csShort}, number one.`,
      callsignPosition: "any",
    });

    steps.push({
      id: "cct-fin2",
      cue: "Turning final — this time for landing.",
      expect: { slots: [{ key: "final", critical: true, phrases: ["final"] }], callsign: reg },
      labels: { final: "Final report" },
      chips: [`${reg},`, `final runway ${rwySpoken}`],
      probes: { final: `${csShort}, report final.` },
      callsignPosition: "any",
    });
  } else if (C.events.touchAndGo) {
    steps.push({
      id: "cct-tgo",
      cue: "Touch and go clearance — read back runway and clearance.",
      atcBefore: `${csShort}, ${speakWind(w.wind)}, runway ${rwySpoken}, cleared touch and go.`,
      expect: {
        slots: [
          { key: "runway", critical: true, value: A.runway, anchor: "runway" },
          { key: "clearance", critical: true, phrases: ["cleared touch and go"] },
        ],
        callsign: reg,
      },
      labels: { runway: "Runway", clearance: "“Cleared touch and go”" },
      chips: [`Runway ${rwySpoken},`, "cleared touch and go,", "cleared to land,", reg],
      probes: { clearance: `${csShort}, read back — cleared touch and go runway ${rwySpoken}.` },
      callsignAlt: csShort,
    });

    steps.push({
      id: "cct-dw-tg",
      cue: "Airborne again. Report downwind.",
      expect: { slots: [{ key: "downwind", critical: true, phrases: ["downwind"] }], callsign: reg },
      labels: { downwind: "Downwind report" },
      chips: [`${reg},`, `downwind runway ${rwySpoken}`],
      probes: { downwind: `${csShort}, report downwind.` },
      atcAfter: `${csShort}, number one.`,
      callsignPosition: "any",
    });

    steps.push({
      id: "cct-fin-tg",
      cue: "Turning final for the full-stop.",
      expect: { slots: [{ key: "final", critical: true, phrases: ["final"] }], callsign: reg },
      labels: { final: "Final report" },
      chips: [`${reg},`, `final runway ${rwySpoken}`],
      probes: { final: `${csShort}, report final.` },
      callsignPosition: "any",
    });
  }

  steps.push({
    id: "cct-land",
    cue: "Full-stop landing clearance — runway and clearance are mandatory read-backs.",
    atcBefore: `${csShort}, ${speakWind(w.wind)}, runway ${rwySpoken}, cleared to land.`,
    expect: {
      slots: [
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "clearance", critical: true, phrases: ["cleared to land"] },
      ],
      callsign: reg,
      forbidden: ["touch and go"],
    },
    labels: { runway: "Runway", clearance: "“Cleared to land”" },
    chips: [`Runway ${rwySpoken},`, "cleared to land,", "cleared touch and go,", reg],
    probes: { clearance: `${csShort}, read back — cleared to land runway ${rwySpoken}.` },
    atcAfter: `${csShort}, vacate next ${C.direction}, contact Ground ${speakFreq(A.ground)}.`,
    callsignAlt: csShort,
  });

  steps.push({
    id: "cct-vacate",
    cue: "Read back the vacate instruction.",
    expect: {
      slots: [
        { key: "vacate", critical: true, phrases: [`vacate next ${C.direction}`, `next ${C.direction}`] },
        { key: "freq", critical: true, value: A.ground },
      ],
      callsign: reg,
    },
    labels: { vacate: "Vacate direction", freq: "Ground frequency" },
    chips: [`Vacate next ${C.direction},`, `Ground ${speakFreq(A.ground)},`, "runway vacated,", reg],
    probes: { freq: `${csShort}, confirm Ground frequency?` },
    atcAfter: `${csShort}, roger. Good day.`,
    callsignAlt: csShort,
  });

  return {
    id: `vfr-circuit-${w.seed}`,
    title: "VFR Circuit",
    subtitle: `${A.name} · ${C.direction}-hand · runway ${A.runway} · flight #${w.seed}`,
    station: `${A.name} Tower`,
    freq: A.tower,
    callsign: reg,
    aircraft: w.aircraftType,
    briefing: [
      `You are ${reg}, a ${w.aircraftType}, ${C.joinDist} miles ${C.joinFrom} of ${A.name} at ${C.altitude.toLocaleString("en-IN")} ft, requesting to join the circuit.`,
      `ATIS information ${w.atis}: runway ${A.runway}, wind ${String(w.wind.dir).padStart(3, "0")}° at ${w.wind.speed}${w.wind.gustTo ? ` gusting ${w.wind.gustTo}` : ""} knots, QNH ${w.qnh}.`,
      `Practice the complete circuit pattern: join, downwind, base, final, and respond to whatever Tower throws at you — go-arounds, touch-and-goes, wake turbulence.`,
    ],
    passMark: 50,
    steps,
  };
}

/* =================== Surveillance Radar Approach — §7.6 =================== */
export function buildSraApproach(world) {
  const w = world;
  const A = w.airport;
  const S = w.sra;
  const reg = w.callsign.reg;
  const cs = speakCallsign(reg);
  const csShort = speakCallsignShort(reg);
  const rwySpoken = speakDigits(A.runway);
  const rwyH = Number(A.runway) * 10;
  const finalHdg = String(rwyH === 0 ? 360 : rwyH).padStart(3, "0");
  const finalHdgSpoken = speakDigits(finalHdg);
  const qnhSpoken = speakDigits(w.qnh);
  const steps = [];

  steps.push({
    id: "sra-initial",
    cue: `You are ${S.inboundDist} miles ${S.inboundDir}, inbound for an SRA. Call Approach with your position and level.`,
    expect: {
      slots: [
        { key: "station", phrases: [`${A.name.toLowerCase()} approach`, "approach"] },
        { key: "position", critical: true, phrases: [`${S.inboundDist} miles ${S.inboundDir}`] },
      ],
      callsign: reg,
    },
    labels: { station: "Station", position: "Position" },
    chips: [
      `${A.name} Approach,`, `${reg},`, `${speakDigits(String(S.inboundDist))} miles ${S.inboundDir},`,
      speakAltitude(S.initialAlt),
    ],
    probes: { position: `${cs}, say your position?` },
    callsignPosition: "any",
  });

  steps.push({
    id: "sra-setup",
    cue: "Read back the key items: runway and altitude to maintain. This is an SRA — ATC talks you down.",
    atcBefore: `${cs}, ${A.name} Approach, this will be a surveillance radar approach runway ${rwySpoken}, terminating at ${speakDigits(String(S.termination))} mile${S.termination > 1 ? "s" : ""} from touchdown, obstacle clearance altitude ${speakAltitude(S.obstacleAlt)}, maintain ${speakAltitude(S.initialAlt)}, check your minima.`,
    expect: {
      slots: [
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "alt", critical: true, value: String(S.initialAlt) },
      ],
      callsign: reg,
    },
    labels: { runway: "Runway", alt: "Maintain altitude" },
    chips: [`Maintaining ${speakAltitude(S.initialAlt)},`, `runway ${rwySpoken},`, reg],
    probes: { alt: `${csShort}, confirm maintaining altitude?` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "sra-turn-final",
    cue: "Turn onto final — read back the heading.",
    atcBefore: `${csShort}, turn ${S.events.correctionSide === "left" ? "right" : "left"} heading ${finalHdgSpoken} for final, report runway in sight.`,
    expect: {
      slots: [{ key: "hdg", critical: true, value: finalHdg, anchor: "heading" }],
      callsign: reg,
    },
    labels: { hdg: "Heading" },
    chips: [`${S.events.correctionSide === "left" ? "Right" : "Left"} heading ${finalHdgSpoken},`, "wilco,", reg],
    probes: { hdg: `${csShort}, confirm heading?` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "sra-descend",
    cue: "Commence descent — acknowledge.",
    atcBefore: `${csShort}, six miles from touchdown, commence descent now to maintain a three degree glide path.`,
    expect: {
      slots: [{ key: "desc", critical: true, phrases: ["descending", "commencing descent", "roger", "wilco"] }],
      callsign: reg,
    },
    labels: { desc: "Descent acknowledged" },
    chips: [`${reg},`, "descending", "roger", "wilco"],
    probes: { desc: `${csShort}, acknowledge — commence descent.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "sra-gear",
    cue: "Check your gear — acknowledge the call.",
    atcBefore: `${csShort}, check gear down and locked.`,
    expect: {
      slots: [{ key: "gear", critical: true, phrases: ["gear down and locked", "gear down", "three greens", "roger"] }],
      callsign: reg,
    },
    labels: { gear: "Gear acknowledged" },
    chips: [`${reg},`, "gear down and locked", "three greens", "roger"],
    probes: {},
    callsignAlt: csShort,
  });

  steps.push({
    id: "sra-5nm",
    cue: "Five miles — acknowledge the advisory altitude.",
    atcBefore: `${csShort}, five miles from touchdown, altitude should be one thousand nine hundred feet.`,
    expect: {
      slots: [{ key: "ack", critical: true, phrases: [reg.toLowerCase(), "roger", csShort.toLowerCase()] }],
      callsign: reg,
    },
    labels: { ack: "Acknowledged" },
    chips: [reg, "roger"],
    probes: {},
    callsignAlt: csShort,
  });

  if (S.events.azimuthCorrection) {
    const corrDir = S.events.correctionSide;
    const turnDir = corrDir === "left" ? "right" : "left";
    const corrHdg = String(((Number(finalHdg) + (turnDir === "left" ? -5 : 5)) + 360) % 360 || 360).padStart(3, "0");
    steps.push({
      id: "sra-azimuth",
      cue: `Going ${corrDir} of track — read back the corrected heading.`,
      atcBefore: `${csShort}, going ${corrDir} of track, turn ${turnDir} five degrees heading ${speakDigits(corrHdg)}.`,
      expect: {
        slots: [{ key: "hdg", critical: true, value: corrHdg, anchor: "heading" }],
        callsign: reg,
      },
      labels: { hdg: "Corrected heading" },
      chips: [`Heading ${speakDigits(corrHdg)},`, reg],
      probes: { hdg: `${csShort}, confirm heading?` },
      callsignAlt: csShort,
    });
  }

  steps.push({
    id: "sra-land",
    cue: "Landing clearance during the SRA — mandatory read-back.",
    atcBefore: `${csShort}, runway ${rwySpoken}, cleared to land, ${speakWind(w.wind)}.`,
    expect: {
      slots: [
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "clearance", critical: true, phrases: ["cleared to land"] },
      ],
      callsign: reg,
    },
    labels: { runway: "Runway", clearance: "“Cleared to land”" },
    chips: [`Runway ${rwySpoken},`, "cleared to land,", reg],
    probes: { clearance: `${csShort}, read back — cleared to land.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "sra-no-ack",
    cue: "ATC says “do not acknowledge further transmissions”. From here you just listen — report runway in sight when you see the runway.",
    atcBefore: `${csShort}, four miles from touchdown, altitude should be one thousand six hundred feet, do not acknowledge further transmissions.`,
    expect: {
      slots: [{ key: "insight", critical: true, phrases: ["runway in sight"] }],
      callsign: reg,
    },
    labels: { insight: "Runway in sight" },
    chips: [`${reg},`, "runway in sight", "roger"],
    probes: { insight: "Report when you have the runway in sight." },
    atcAfter: `${csShort}, on track, ${speakDigits(String(S.termination))} mile${S.termination > 1 ? "s" : ""} from touchdown, approach completed, after landing contact Tower ${speakFreq(A.tower)}.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "sra-tower",
    cue: "Approach completed. Read back and contact Tower.",
    expect: {
      slots: [{ key: "freq", critical: true, value: A.tower }],
      callsign: reg,
    },
    labels: { freq: "Tower frequency" },
    chips: [`Tower ${speakFreq(A.tower)},`, reg],
    probes: { freq: `${csShort}, confirm Tower frequency?` },
    callsignAlt: csShort,
  });

  return {
    id: `sra-${w.seed}`,
    title: "SRA Talkdown",
    subtitle: `${A.name} · runway ${A.runway} · surveillance radar approach · flight #${w.seed}`,
    station: `${A.name} Approach`,
    freq: A.approach,
    callsign: reg,
    aircraft: w.aircraftType,
    briefing: [
      `You are ${reg}, a ${w.aircraftType}, ${S.inboundDist} miles ${S.inboundDir} of ${A.name} at ${S.initialAlt.toLocaleString("en-IN")} ft.`,
      `This is a Surveillance Radar Approach (SRA) — ATC talks you down with distance, advisory altitude and azimuth information. You acknowledge each transmission until told "do not acknowledge further transmissions".`,
      `Key discipline: gear down and locked, watch advisory altitudes, report runway in sight. The approach terminates at ${S.termination} mile${S.termination > 1 ? "s" : ""} from touchdown — you fly the rest visually.`,
    ],
    passMark: 50,
    steps,
  };
}

/* ===================== Medical Emergency — §9.3 ============================ */
export function buildMedicalEmergency(world) {
  const w = world;
  const A = w.airport;
  const M = w.medical;
  const reg = w.callsign.reg;
  const cs = speakCallsign(reg);
  const csShort = speakCallsignShort(reg);
  const rwySpoken = speakDigits(A.runway);
  const qnhSpoken = speakDigits(w.qnh);
  const altSpoken = speakAltitude(M.altitude);
  const posSpoken = `${speakDigits(String(M.distance))} miles ${M.direction}`;
  const steps = [];

  steps.push({
    id: "med-panpan",
    cue: `A passenger has a ${M.condition}. This is URGENCY, not distress — PAN-PAN ×3, station, callsign, nature, position, level, intentions, persons on board.`,
    expect: {
      slots: [
        { key: "pan3", critical: true, phrases: ["pan pan pan pan pan pan"] },
        { key: "nature", critical: true, phrases: [M.condition.toLowerCase(), "medical emergency", "passenger medical"] },
        { key: "intent", critical: true, phrases: ["request priority landing", "request immediate landing", "request priority"] },
        { key: "position", critical: true, phrases: [`${M.distance} miles ${M.direction}`] },
        { key: "level", value: String(M.altitude) },
      ],
      callsign: reg,
    },
    labels: {
      pan3: "PAN-PAN × 3", nature: "Nature of urgency", intent: "Intentions",
      position: "Position", level: "Level",
    },
    chips: [
      "PAN-PAN PAN-PAN PAN-PAN,", `${A.name} Tower,`, `${reg},`, `passenger with ${M.condition},`,
      `${posSpoken},`, altSpoken + ",", "request priority landing,",
      `${SPOKEN_POB[M.pob] || speakDigits(String(M.pob))} persons on board`,
    ],
    probes: { nature: `${csShort}, say again the nature of your emergency?`, position: `${csShort}, say your position?` },
    atcAfter: `${csShort}, roger your PAN, number one, cleared straight-in approach runway ${rwySpoken}, ${speakWind(w.wind)}, QNH ${qnhSpoken}, ambulance alerted.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "med-readback",
    cue: "Read back the clearance — runway and QNH.",
    expect: {
      slots: [
        { key: "approach", critical: true, phrases: [`straight in approach runway ${A.runway}`, `straight in runway ${A.runway}`, "cleared straight in"] },
        { key: "qnh", critical: true, value: w.qnh, anchor: "qnh" },
      ],
      callsign: reg,
    },
    labels: { approach: "Straight-in approach", qnh: "QNH" },
    chips: [
      `Cleared straight-in approach runway ${rwySpoken},`, `QNH ${qnhSpoken},`,
      `QNH ${speakDigits(w.qnhTrap)},`, reg,
    ],
    probes: { qnh: `${csShort}, confirm QNH?` },
    corrections: { qnh: `${csShort}, negative — QNH ${qnhSpoken}. Read back.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "med-final",
    cue: "On final — report.",
    expect: {
      slots: [
        { key: "final", critical: true, phrases: ["final", "on final"] },
        { key: "runway", phrases: [`runway ${A.runway}`] },
      ],
      callsign: reg,
    },
    labels: { final: "Final report", runway: "Runway" },
    chips: [`${reg},`, `final runway ${rwySpoken}`],
    probes: { final: `${csShort}, report final.` },
    callsignPosition: "any",
  });

  steps.push({
    id: "med-land",
    cue: "Landing clearance — mandatory read-back.",
    atcBefore: `${csShort}, ${speakWind(w.wind)}, runway ${rwySpoken}, cleared to land, ambulance standing by on taxiway ${A.taxiway}.`,
    expect: {
      slots: [
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "clearance", critical: true, phrases: ["cleared to land"] },
      ],
      callsign: reg,
    },
    labels: { runway: "Runway", clearance: "“Cleared to land”" },
    chips: [`Runway ${rwySpoken},`, "cleared to land,", reg],
    probes: { clearance: `${csShort}, read back — cleared to land.` },
    atcAfter: `${csShort}, after landing vacate next ${w.circuit.direction}, ambulance will follow. Well handled.`,
    callsignAlt: csShort,
  });

  steps.push({
    id: "med-vacate",
    cue: "Acknowledge the vacate. Your passenger needs help.",
    expect: {
      slots: [{ key: "ack", critical: true, phrases: ["wilco", "roger", "vacating", "runway vacated"] }],
      callsign: reg,
    },
    labels: { ack: "Acknowledged" },
    chips: ["Wilco,", "runway vacated,", reg],
    probes: {},
    callsignAlt: csShort,
  });

  return {
    id: `medical-${w.seed}`,
    title: "Medical Emergency — PAN-PAN",
    subtitle: `${reg} · passenger ${M.condition} · ${M.distance} miles ${M.direction} · flight #${w.seed}`,
    station: `${A.name} Tower`,
    freq: A.tower,
    callsign: reg,
    aircraft: w.aircraftType,
    briefing: [
      `You are ${reg}, a ${w.aircraftType}, ${M.distance} miles ${M.direction} of ${A.name} at ${M.altitude.toLocaleString("en-IN")} ft, on Tower ${A.tower}.`,
      `Your passenger has a ${M.condition}. This is URGENCY (PAN-PAN), not distress (MAYDAY) — the aircraft itself is fine. The difference matters for the examiner.`,
      `PAN-PAN ×3 → station → callsign → nature → position → level → intentions → persons on board. Request PRIORITY landing, not a forced landing.`,
    ],
    passMark: 50,
    steps,
  };
}

/* ====================== Lost Pilot — §9.3 + §11.5 ========================= */
export function buildLostPilot(world) {
  const w = world;
  const A = w.airport;
  const L = w.lost;
  const reg = w.callsign.reg;
  const cs = speakCallsign(reg);
  const csShort = speakCallsignShort(reg);
  const rwySpoken = speakDigits(A.runway);
  const qnhSpoken = speakDigits(w.qnh);
  const altSpoken = speakAltitude(L.altitude);
  const steps = [];

  steps.push({
    id: "lost-panpan",
    cue: `Above cloud at ${L.altitude.toLocaleString("en-IN")} ft, heading ${L.lastHeading}°, unsure of your position. Call the nearest station — PAN-PAN ×3, type, level, heading, and ask for help.`,
    expect: {
      slots: [
        { key: "pan3", critical: true, phrases: ["pan pan pan pan pan pan"] },
        { key: "lost", critical: true, phrases: ["unsure of my position", "uncertain of my position", "position uncertain", "lost"] },
        { key: "level", value: String(L.altitude) },
        { key: "heading", value: L.lastHeading, anchor: "heading" },
        { key: "request", critical: true, phrases: [`request heading to ${A.name.toLowerCase()}`, "request heading", "request assistance"] },
      ],
      callsign: reg,
    },
    labels: {
      pan3: "PAN-PAN × 3", lost: "Uncertain position",
      level: "Level", heading: "Heading", request: "Request heading/assistance",
    },
    chips: [
      "PAN-PAN PAN-PAN PAN-PAN,", `${A.name} Tower,`, `${reg},`, `${w.aircraftType},`,
      altSpoken + ",", `heading ${speakDigits(L.lastHeading)},`,
      "above cloud,", "unsure of my position,", `request heading to ${A.name}`,
    ],
    probes: { request: `${cs}, say again your request?`, lost: `${cs}, are you uncertain of position?` },
    atcAfter: `${cs}, ${A.name} Tower, roger your PAN, fly heading ${speakDigits(L.headingToFly)}.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "lost-heading",
    cue: "Read back the heading.",
    expect: {
      slots: [{ key: "hdg", critical: true, value: L.headingToFly, anchor: "heading" }],
      callsign: reg,
    },
    labels: { hdg: "Heading" },
    chips: [`Heading ${speakDigits(L.headingToFly)},`, `Heading ${speakDigits(L.lastHeading)},`, reg],
    probes: { hdg: `${csShort}, confirm heading?` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "lost-qdm",
    cue: "Tower has a DF bearing for you — the QDM. Read back: “Class [letter] [bearing]”. Class A is accurate to ±2°, Class B to ±5°.",
    atcBefore: `${csShort}, ${A.name} Tower, QDM ${speakDigits(L.qdmBearing)} degrees, class ${L.qdmClass}.`,
    expect: {
      slots: [
        { key: "class", critical: true, phrases: [`class ${L.qdmClass.toLowerCase()}`] },
        { key: "bearing", critical: true, value: L.qdmBearing },
      ],
      callsign: reg,
    },
    labels: { class: "DF class", bearing: "QDM bearing" },
    chips: [`Class ${L.qdmClass},`, `${speakDigits(L.qdmBearing)},`, reg],
    probes: { bearing: `${csShort}, confirm QDM?` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "lost-descend",
    cue: "ATC is guiding you in. Read back descent and QNH.",
    atcBefore: `${csShort}, position identified, descend to ${speakAltitude(2000)}, QNH ${qnhSpoken}, continue present heading.`,
    expect: {
      slots: [
        { key: "alt", critical: true, value: "2000" },
        { key: "qnh", critical: true, value: w.qnh, anchor: "qnh" },
      ],
      callsign: reg,
    },
    labels: { alt: "Altitude", qnh: "QNH" },
    chips: [`Descend to ${speakAltitude(2000)},`, `QNH ${qnhSpoken},`, `QNH ${speakDigits(w.qnhTrap)},`, "continuing present heading,", reg],
    probes: { qnh: `${csShort}, confirm QNH?` },
    corrections: { qnh: `${csShort}, negative — QNH ${qnhSpoken}. Read back.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "lost-visual",
    cue: "You break cloud and see the field. Report.",
    expect: {
      slots: [{ key: "visual", critical: true, phrases: ["field in sight", "aerodrome in sight", "airport in sight"] }],
      callsign: reg,
    },
    labels: { visual: "Field in sight" },
    chips: [`${reg},`, "field in sight", "still in cloud"],
    probes: { visual: `${csShort}, report aerodrome in sight.` },
    atcAfter: `${csShort}, join straight-in runway ${rwySpoken}, ${speakWind(w.wind)}, cleared to land.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "lost-land",
    cue: "Straight-in clearance — read back runway and clearance.",
    expect: {
      slots: [
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "clearance", critical: true, phrases: ["cleared to land"] },
      ],
      callsign: reg,
    },
    labels: { runway: "Runway", clearance: "“Cleared to land”" },
    chips: [`Runway ${rwySpoken},`, "cleared to land,", reg],
    probes: { clearance: `${csShort}, read back — cleared to land runway ${rwySpoken}.` },
    atcAfter: `${csShort}, well handled. Contact Ground ${speakFreq(A.ground)} when vacated.`,
    callsignAlt: csShort,
  });

  return {
    id: `lost-pilot-${w.seed}`,
    title: "Lost Pilot — Uncertain Position",
    subtitle: `${reg} · above cloud · heading ${L.lastHeading}° · flight #${w.seed}`,
    station: `${A.name} Tower`,
    freq: A.tower,
    callsign: reg,
    aircraft: w.aircraftType,
    briefing: [
      `You are ${reg}, a ${w.aircraftType}, at ${L.altitude.toLocaleString("en-IN")} ft, heading ${L.lastHeading}°, above cloud, and you are NOT SURE WHERE YOU ARE.`,
      `This is urgency — PAN-PAN, not MAYDAY. The aircraft is flying fine; you are the problem. Swallow the pride, make the call, and let ATC find you.`,
      `You will practise: the PAN-PAN format for position uncertainty, direction-finding (QDM) phraseology, and the descent through cloud to a safe landing.`,
    ],
    passMark: 50,
    steps,
  };
}

/* ================= Emergency Descent (Decompression) — §9.4 ================ */
export function buildEmergencyDescent(world) {
  const w = world;
  const A = w.airport;
  const DC = w.decompression;
  const F = w.ifr;
  const reg = `Ghostair ${F.flightNo}`;
  const cs = `Ghostair ${speakDigits(F.flightNo)}`;
  const flSpoken = speakDigits(DC.cruiseFl);
  const targetFlSpoken = speakDigits(DC.targetFl);
  const steps = [];

  steps.push({
    id: "dec-mayday",
    cue: `FL${DC.cruiseFl}, ${DC.distance} miles ${DC.direction} of ${DC.fix} — BANG. Cabin altitude warning, masks deployed. This is MAYDAY. Transmit: MAYDAY ×3, station, callsign, nature (decompression), intentions (emergency descent to FL${DC.targetFl}), position.`,
    expect: {
      slots: [
        { key: "mayday3", critical: true, phrases: ["mayday mayday mayday"] },
        { key: "nature", critical: true, phrases: ["decompression", "rapid decompression", "cabin decompression", "loss of cabin pressure"] },
        { key: "intent", critical: true, phrases: [`emergency descent to flight level ${DC.targetFl}`, "emergency descent", `descending to flight level ${DC.targetFl}`] },
        { key: "position", critical: true, phrases: [DC.fix.toLowerCase(), `${DC.distance} miles ${DC.direction}`] },
      ],
      callsign: reg,
    },
    labels: {
      mayday3: "MAYDAY × 3", nature: "Nature (decompression)",
      intent: "Intentions (emergency descent)", position: "Position",
    },
    chips: [
      "MAYDAY MAYDAY MAYDAY,", `${A.name} Control,`, `${reg},`,
      "rapid decompression,", `emergency descent to flight level ${targetFlSpoken},`,
      `position ${DC.fix},`, `flight level ${flSpoken}`,
    ],
    probes: { nature: `${cs}, say again the nature of your emergency?`, intent: `${cs}, say your intentions?` },
    callsignPosition: "any",
  });

  steps.push({
    id: "dec-roger",
    cue: "ATC clears you and broadcasts the general warning. Acknowledge and set 7700.",
    atcBefore: `${cs}, MAYDAY, roger. Cleared to flight level ${targetFlSpoken}. Squawk seven seven zero zero. All stations, ${A.name} Control, attention all aircraft in the vicinity of ${DC.fix}, emergency descent in progress from flight level ${flSpoken} to flight level ${targetFlSpoken}.`,
    requiresSquawk: "7700",
    expect: {
      slots: [
        { key: "level", critical: true, value: DC.targetFl, anchor: "fl" },
        { key: "sq", critical: true, phrases: ["squawk 7700", "squawking 7700", "7700"] },
      ],
      callsign: reg,
    },
    labels: { level: "Descent level", sq: "7700" },
    chips: [`Descending flight level ${targetFlSpoken},`, "squawking seven seven zero zero,", reg],
    probes: { level: `${cs}, confirm level?`, sq: `${cs}, confirm squawk?` },
  });

  steps.push({
    id: "dec-level",
    cue: "Levelling off. Report your level and that the emergency descent is complete.",
    expect: {
      slots: [
        { key: "level", critical: true, value: DC.targetFl, anchor: "fl" },
        { key: "complete", critical: true, phrases: ["emergency descent complete", "maintaining", "level"] },
      ],
      callsign: reg,
    },
    labels: { level: "Level report", complete: "Descent complete" },
    chips: [`${reg},`, `maintaining flight level ${targetFlSpoken},`, "emergency descent complete"],
    probes: { level: `${cs}, say your level?` },
    atcAfter: `${cs}, roger. Souls on board and fuel remaining?`,
    callsignPosition: "any",
  });

  steps.push({
    id: "dec-souls",
    cue: "Report souls on board and endurance — ATC needs it for SAR planning.",
    expect: {
      slots: [
        { key: "souls", critical: true, phrases: ["souls on board", "persons on board", "pob"] },
        { key: "fuel", phrases: ["fuel", "endurance", "hours"] },
      ],
      callsign: reg,
    },
    labels: { souls: "Souls on board", fuel: "Fuel/endurance" },
    chips: ["One hundred and fifty souls on board,", "fuel for two hours,", reg],
    probes: { souls: `${cs}, say souls on board?` },
    atcAfter: `${cs}, roger. Nearest suitable aerodrome is ${A.name}. When ready, cleared direct to ${A.name}, descend to flight level ${speakDigits("60")}, contact ${A.name} Approach ${speakFreq(A.approach)}.`,
  });

  steps.push({
    id: "dec-divert",
    cue: "Read back the diversion clearance.",
    expect: {
      slots: [
        { key: "direct", critical: true, phrases: [`direct to ${A.name.toLowerCase()}`, `direct ${A.name.toLowerCase()}`] },
        { key: "level", critical: true, value: "60", anchor: "fl" },
        { key: "freq", critical: true, value: A.approach },
      ],
      callsign: reg,
    },
    labels: { direct: "Direct routing", level: "Descent level", freq: "Approach frequency" },
    chips: [
      `Direct to ${A.name},`, `descend to flight level ${speakDigits("60")},`,
      `${A.name} Approach ${speakFreq(A.approach)},`, reg,
    ],
    probes: { freq: `${cs}, confirm frequency?` },
    atcAfter: `${cs}, cancel MAYDAY when ready. Good luck.`,
  });

  return {
    id: `decompression-${w.seed}`,
    title: "Emergency Descent — Decompression",
    subtitle: `${reg} · FL${DC.cruiseFl} · ${DC.fix} · rapid decompression · flight #${w.seed}`,
    station: `${A.name} Control`,
    freq: A.control,
    callsign: reg,
    aircraft: "Ghostair jet",
    hasTransponder: true,
    briefing: [
      `You are ${reg}, cruising at FL${DC.cruiseFl}, ${DC.distance} miles ${DC.direction} of ${DC.fix}, on ${A.name} Control ${A.control}.`,
      `The cabin altitude warning just fired. Oxygen masks are down. You need FL100 NOW. This is the most time-critical emergency — initiate the descent FIRST, then talk.`,
      `MAYDAY ×3 → station → callsign → nature (decompression) → intentions (emergency descent to FL${DC.targetFl}) → position. Then ATC broadcasts the warning to all traffic.`,
    ],
    passMark: 50,
    steps,
  };
}

/* ======================== ACAS/TCAS RA — §11.6 ============================= */
export function buildTcasEvent(world) {
  const w = world;
  const A = w.airport;
  const T = w.tcas;
  const F = w.ifr;
  const reg = `Ghostair ${F.flightNo}`;
  const cs = `Ghostair ${speakDigits(F.flightNo)}`;
  const flSpoken = speakDigits(T.currentFl);
  const devFlSpoken = speakDigits(T.deviationFl);
  const conflictFl = T.raDirection === "climb" ? String(Number(T.currentFl) - 10) : String(Number(T.currentFl) + 10);
  const steps = [];

  steps.push({
    id: "tcas-cruise",
    cue: `Cruising at FL${T.currentFl}. ATC gives you a level change — but just as you are about to comply, the TCAS fires an RA: ${T.raDirection.toUpperCase()}. You MUST follow the RA and tell ATC you CANNOT comply.`,
    atcBefore: `${cs}, ${T.raDirection === "climb" ? "descend" : "climb"} to flight level ${speakDigits(conflictFl)}.`,
    expect: {
      slots: [
        { key: "unable", critical: true, phrases: ["unable", "unable tcas ra", "unable tcas"] },
        { key: "tcas", critical: true, phrases: ["tcas ra", "tcas resolution advisory", "tcas"] },
      ],
      callsign: reg,
    },
    labels: { unable: "“UNABLE”", tcas: "TCAS RA reported" },
    chips: [`${reg},`, "unable,", "TCAS RA,", "wilco,", "roger"],
    probes: { unable: `${cs}, confirm unable?`, tcas: `${cs}, say again?` },
  });

  steps.push({
    id: "tcas-ack",
    cue: "ATC acknowledges your RA and asks you to report when you can return. Follow the RA.",
    atcBefore: `${cs}, roger TCAS RA, report ${T.raDirection === "climb" ? "returning to" : "maintaining"} flight level ${flSpoken}.`,
    expect: {
      slots: [{ key: "wilco", critical: true, phrases: ["wilco", "roger"] }],
      callsign: reg,
    },
    labels: { wilco: "Acknowledged" },
    chips: ["Wilco,", "roger,", reg],
    probes: {},
  });

  steps.push({
    id: "tcas-clear",
    cue: `RA resolved — you are CLEAR OF CONFLICT. Report: "clear of conflict, returning to clearance, now maintaining FL${T.currentFl}".`,
    expect: {
      slots: [
        { key: "clear", critical: true, phrases: ["clear of conflict"] },
        { key: "return", critical: true, phrases: ["returning to clearance", `returning to flight level ${T.currentFl}`, `maintaining flight level ${T.currentFl}`, `resumed flight level ${T.currentFl}`] },
      ],
      callsign: reg,
    },
    labels: { clear: "“Clear of conflict”", return: "Returning to clearance" },
    chips: [
      `${reg},`, "clear of conflict,", "returning to clearance,",
      `now maintaining flight level ${flSpoken}`, `maintaining flight level ${devFlSpoken}`,
    ],
    probes: { clear: `${cs}, are you clear of conflict?`, return: `${cs}, confirm level?` },
    atcAfter: `${cs}, roger, resume flight level ${flSpoken}.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "tcas-resume",
    cue: "Read back the clearance.",
    expect: {
      slots: [{ key: "level", critical: true, value: T.currentFl, anchor: "fl" }],
      callsign: reg,
    },
    labels: { level: "Level" },
    chips: [`Flight level ${flSpoken},`, `Flight level ${devFlSpoken},`, reg],
    probes: { level: `${cs}, confirm level?` },
    atcAfter: `${cs}, roger.`,
  });

  return {
    id: `tcas-${w.seed}`,
    title: "TCAS RA — Resolution Advisory",
    subtitle: `${reg} · FL${T.currentFl} · ${T.raDirection} RA · ${T.conflictType} at ${T.conflictClock} o'clock · flight #${w.seed}`,
    station: `${A.name} Control`,
    freq: A.control,
    callsign: reg,
    aircraft: "Ghostair jet",
    briefing: [
      `You are ${reg}, cruising at FL${T.currentFl} on ${A.name} Control ${A.control}. Traffic: ${T.conflictType} at ${T.conflictClock} o'clock.`,
      `When TCAS fires a Resolution Advisory, you FOLLOW IT — it overrides ATC. Say "UNABLE, TCAS RA" if ATC gives a conflicting instruction. ATC will not modify your flight path until you report clear.`,
      `The magic phrase: "CLEAR OF CONFLICT, RETURNING TO CLEARANCE, NOW MAINTAINING FL${T.currentFl}." Until you say this, the controller cannot direct you.`,
    ],
    passMark: 50,
    steps,
  };
}

/* =========================== Special VFR — §7.2 ============================ */
export function buildSpecialVfr(world) {
  const w = world;
  const A = w.airport;
  const SV = w.svfr;
  const reg = w.callsign.reg;
  const cs = speakCallsign(reg);
  const csShort = speakCallsignShort(reg);
  const qnhSpoken = speakDigits(w.qnh);
  const altSpoken = speakAltitude(SV.altitude);
  const steps = [];

  steps.push({
    id: "svfr-request",
    cue: `Visibility ${SV.visibility} metres, cloud base ${SV.cloudBase} ft — below VMC for the zone. Request Special VFR from Tower.`,
    expect: {
      slots: [
        { key: "station", phrases: [`${A.name.toLowerCase()} tower`, "tower"] },
        { key: "request", critical: true, phrases: ["request special vfr", "request special v f r"] },
        { key: "position", phrases: [`${SV.distance} miles ${SV.direction}`] },
      ],
      callsign: reg,
    },
    labels: { station: "Station", request: "Request Special VFR", position: "Position" },
    chips: [
      `${A.name} Tower,`, `${reg},`,
      `${speakDigits(String(SV.distance))} miles ${SV.direction},`,
      altSpoken + ",", "request Special VFR",
    ],
    probes: { request: `${cs}, say again your request?` },
    callsignPosition: "any",
  });

  steps.push({
    id: "svfr-clearance",
    cue: "Read back the Special VFR clearance — route, altitude, and QNH.",
    atcBefore: `${cs}, cleared Special VFR, route via ${SV.routePoint}, not above ${altSpoken}, QNH ${qnhSpoken}, report at the ${SV.routePoint}.`,
    expect: {
      slots: [
        { key: "svfr", critical: true, phrases: ["cleared special vfr", "special vfr"] },
        { key: "route", critical: true, phrases: [`via ${SV.routePoint}`, SV.routePoint] },
        { key: "alt", critical: true, value: String(SV.altitude) },
        { key: "qnh", critical: true, value: w.qnh, anchor: "qnh" },
      ],
      callsign: reg,
    },
    labels: { svfr: "Special VFR clearance", route: "Route", alt: "Altitude", qnh: "QNH" },
    chips: [
      "Cleared Special VFR,", `via ${SV.routePoint},`,
      `not above ${altSpoken},`, `QNH ${qnhSpoken},`,
      `QNH ${speakDigits(w.qnhTrap)},`, reg,
    ],
    probes: { qnh: `${csShort}, confirm QNH?` },
    corrections: { qnh: `${csShort}, negative — QNH ${qnhSpoken}. Read back.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "svfr-report",
    cue: `At the ${SV.routePoint}. Report.`,
    expect: {
      slots: [
        { key: "position", critical: true, phrases: [SV.routePoint, `at the ${SV.routePoint}`, `over the ${SV.routePoint}`] },
      ],
      callsign: reg,
    },
    labels: { position: "Position report" },
    chips: [`${reg},`, `at the ${SV.routePoint},`, altSpoken],
    probes: { position: `${csShort}, report position.` },
    atcAfter: `${csShort}, roger, continue Special VFR, leave control zone to the ${SV.exitDirection}, report leaving the zone.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "svfr-exit-rb",
    cue: "Read back the exit instruction.",
    expect: {
      slots: [
        { key: "continue", critical: true, phrases: ["continue special vfr", "wilco"] },
        { key: "exit", phrases: [`leave to the ${SV.exitDirection}`, SV.exitDirection] },
      ],
      callsign: reg,
    },
    labels: { continue: "Continue SVFR", exit: "Exit direction" },
    chips: ["Continue Special VFR,", `leave to the ${SV.exitDirection},`, "wilco,", reg],
    probes: {},
    callsignAlt: csShort,
  });

  steps.push({
    id: "svfr-leaving",
    cue: "You are leaving the control zone. Report.",
    expect: {
      slots: [
        { key: "leaving", critical: true, phrases: ["leaving the zone", "leaving control zone", "clear of zone"] },
      ],
      callsign: reg,
    },
    labels: { leaving: "Leaving zone" },
    chips: [`${reg},`, "leaving the zone"],
    probes: { leaving: `${csShort}, report leaving the zone.` },
    atcAfter: `${csShort}, Special VFR cancelled, clear of controlled airspace. Good day.`,
    callsignPosition: "any",
  });

  return {
    id: `svfr-${w.seed}`,
    title: "Special VFR",
    subtitle: `${reg} · ${A.name} CTR · visibility ${SV.visibility}m · flight #${w.seed}`,
    station: `${A.name} Tower`,
    freq: A.tower,
    callsign: reg,
    aircraft: w.aircraftType,
    briefing: [
      `You are ${reg}, a ${w.aircraftType}, ${SV.distance} miles ${SV.direction} of ${A.name} at ${SV.altitude.toLocaleString("en-IN")} ft.`,
      `Visibility ${SV.visibility} metres, cloud base ${SV.cloudBase} ft — below VMC for the control zone. You need SPECIAL VFR to enter.`,
      `Key phrase: "REQUEST SPECIAL VFR". ATC will clear you with a route, altitude limit, and QNH. Read all of them back.`,
    ],
    passMark: 50,
    steps,
  };
}

/* ========================= NDB Approach — §7.3 ============================= */
export function buildNdbApproach(world) {
  const w = world;
  const A = w.airport;
  const N = w.ndb;
  const reg = w.callsign.reg;
  const cs = speakCallsign(reg);
  const csShort = speakCallsignShort(reg);
  const rwySpoken = speakDigits(A.runway);
  const qnhSpoken = speakDigits(w.qnh);
  const steps = [];

  steps.push({
    id: "ndb-initial",
    cue: `You are ${N.inboundDist} miles ${N.inboundDir}, inbound for an NDB approach. Call Approach.`,
    expect: {
      slots: [
        { key: "station", phrases: [`${A.name.toLowerCase()} approach`, "approach"] },
        { key: "request", critical: true, phrases: ["request ndb approach", "request ndb", "request non directional beacon approach"] },
        { key: "position", phrases: [`${N.inboundDist} miles ${N.inboundDir}`] },
      ],
      callsign: reg,
    },
    labels: { station: "Station", request: "Request NDB approach", position: "Position" },
    chips: [
      `${A.name} Approach,`, `${reg},`,
      `${speakDigits(String(N.inboundDist))} miles ${N.inboundDir},`,
      speakAltitude(N.procedureTurnAlt) + ",", "request NDB approach",
    ],
    probes: { request: `${cs}, say again your request?` },
    callsignPosition: "any",
  });

  steps.push({
    id: "ndb-cleared",
    cue: "Read back the approach clearance — runway, altitude, and QNH.",
    atcBefore: `${cs}, cleared NDB approach runway ${rwySpoken}, descend to ${speakAltitude(N.procedureTurnAlt)}, QNH ${qnhSpoken}, report beacon outbound.`,
    expect: {
      slots: [
        { key: "cleared", critical: true, phrases: ["cleared ndb approach"] },
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "alt", critical: true, value: String(N.procedureTurnAlt) },
        { key: "qnh", critical: true, value: w.qnh, anchor: "qnh" },
      ],
      callsign: reg,
    },
    labels: { cleared: "Cleared NDB approach", runway: "Runway", alt: "Altitude", qnh: "QNH" },
    chips: [
      "Cleared NDB approach,", `runway ${rwySpoken},`,
      `descend to ${speakAltitude(N.procedureTurnAlt)},`,
      `QNH ${qnhSpoken},`, `QNH ${speakDigits(w.qnhTrap)},`, reg,
    ],
    probes: { qnh: `${csShort}, confirm QNH?` },
    corrections: { qnh: `${csShort}, negative — QNH ${qnhSpoken}. Read back.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "ndb-outbound",
    cue: `Passing the ${N.beaconId} beacon outbound — report.`,
    expect: {
      slots: [
        { key: "beacon", critical: true, phrases: [`${N.beaconId.toLowerCase()} outbound`, "beacon outbound"] },
        { key: "alt", phrases: [String(N.procedureTurnAlt)] },
      ],
      callsign: reg,
    },
    labels: { beacon: "Beacon outbound", alt: "Level" },
    chips: [`${reg},`, `${N.beaconId} outbound,`, speakAltitude(N.procedureTurnAlt)],
    probes: { beacon: `${csShort}, report beacon outbound.` },
    atcAfter: `${csShort}, roger, report beacon inbound.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "ndb-inbound",
    cue: "Procedure turn complete. Report beacon inbound.",
    expect: {
      slots: [
        { key: "beacon", critical: true, phrases: [`${N.beaconId.toLowerCase()} inbound`, "beacon inbound"] },
      ],
      callsign: reg,
    },
    labels: { beacon: "Beacon inbound" },
    chips: [`${reg},`, `${N.beaconId} inbound`],
    probes: { beacon: `${csShort}, report beacon inbound.` },
    atcAfter: `${csShort}, roger, continue approach, contact Tower ${speakFreq(A.tower)}.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "ndb-tower",
    cue: "Contact Tower.",
    expect: {
      slots: [{ key: "freq", critical: true, value: A.tower }],
      callsign: reg,
    },
    labels: { freq: "Tower frequency" },
    chips: [`Tower ${speakFreq(A.tower)},`, reg],
    probes: { freq: `${csShort}, confirm Tower frequency?` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "ndb-land",
    cue: "Landing clearance from Tower — mandatory read-back.",
    atcBefore: `${csShort}, ${speakWind(w.wind)}, runway ${rwySpoken}, cleared to land.`,
    expect: {
      slots: [
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "clearance", critical: true, phrases: ["cleared to land"] },
      ],
      callsign: reg,
    },
    labels: { runway: "Runway", clearance: "“Cleared to land”" },
    chips: [`Runway ${rwySpoken},`, "cleared to land,", reg],
    probes: { clearance: `${csShort}, read back — cleared to land.` },
    callsignAlt: csShort,
  });

  return {
    id: `ndb-${w.seed}`,
    title: "NDB Approach",
    subtitle: `${A.name} · ${N.beaconId} · runway ${A.runway} · flight #${w.seed}`,
    station: `${A.name} Approach`,
    freq: A.approach,
    callsign: reg,
    aircraft: w.aircraftType,
    briefing: [
      `You are ${reg}, a ${w.aircraftType}, ${N.inboundDist} miles ${N.inboundDir} of ${A.name} at ${N.procedureTurnAlt.toLocaleString("en-IN")} ft.`,
      `Request an NDB approach using the ${N.beaconId} beacon for runway ${A.runway}. The inbound track is ${N.inboundTrack}°.`,
      `Key reports: "BEACON OUTBOUND" (starting procedure turn), "BEACON INBOUND" (on final approach course). These tell ATC where you are in the procedure.`,
    ],
    passMark: 50,
    steps,
  };
}

/* ========================= PAR Talkdown — §7.7 ============================= */
export function buildParTalkdown(world) {
  const w = world;
  const A = w.airport;
  const P = w.par;
  const reg = w.callsign.reg;
  const cs = speakCallsign(reg);
  const csShort = speakCallsignShort(reg);
  const rwySpoken = speakDigits(A.runway);
  const rwyH = Number(A.runway) * 10;
  const finalHdg = String(rwyH === 0 ? 360 : rwyH).padStart(3, "0");
  const finalHdgSpoken = speakDigits(finalHdg);
  const steps = [];

  steps.push({
    id: "par-initial",
    cue: `You are ${P.inboundDist} miles ${P.inboundDir}, inbound for a PAR approach. Call Approach.`,
    expect: {
      slots: [
        { key: "station", phrases: [`${A.name.toLowerCase()} approach`, "approach"] },
        { key: "position", critical: true, phrases: [`${P.inboundDist} miles ${P.inboundDir}`] },
      ],
      callsign: reg,
    },
    labels: { station: "Station", position: "Position" },
    chips: [
      `${A.name} Approach,`, `${reg},`,
      `${speakDigits(String(P.inboundDist))} miles ${P.inboundDir},`,
      speakAltitude(P.initialAlt),
    ],
    probes: { position: `${cs}, say your position?` },
    callsignPosition: "any",
  });

  steps.push({
    id: "par-setup",
    cue: "Read back runway and decision altitude. PAR gives both azimuth AND glidepath guidance.",
    atcBefore: `${cs}, this will be a precision approach runway ${rwySpoken}, decision altitude ${speakAltitude(P.decisionAlt)}, check gear down, check your minima.`,
    expect: {
      slots: [
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "da", critical: true, value: String(P.decisionAlt) },
      ],
      callsign: reg,
    },
    labels: { runway: "Runway", da: "Decision altitude" },
    chips: [`Runway ${rwySpoken},`, `decision altitude ${speakAltitude(P.decisionAlt)},`, "gear down,", reg],
    probes: { da: `${csShort}, confirm decision altitude?` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "par-turn",
    cue: "Turn onto final — read back the heading.",
    atcBefore: `${csShort}, turn left heading ${finalHdgSpoken}, closing from the ${P.events.leftOfTrack ? "right" : "left"}.`,
    expect: {
      slots: [{ key: "hdg", critical: true, value: finalHdg, anchor: "heading" }],
      callsign: reg,
    },
    labels: { hdg: "Heading" },
    chips: [`Left heading ${finalHdgSpoken},`, reg],
    probes: { hdg: `${csShort}, confirm heading?` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "par-descend",
    cue: "Commence descent — acknowledge.",
    atcBefore: `${csShort}, on track, commence descent now.`,
    expect: {
      slots: [{ key: "desc", critical: true, phrases: ["descending", "commencing descent", "roger", "wilco"] }],
      callsign: reg,
    },
    labels: { desc: "Descent acknowledged" },
    chips: [reg, "descending", "roger", "wilco"],
    probes: {},
    callsignAlt: csShort,
  });

  steps.push({
    id: "par-gear",
    cue: "Check gear — acknowledge.",
    atcBefore: `${csShort}, check gear down and locked.`,
    expect: {
      slots: [{ key: "gear", critical: true, phrases: ["gear down and locked", "gear down", "three greens", "roger"] }],
      callsign: reg,
    },
    labels: { gear: "Gear" },
    chips: [reg, "gear down and locked", "three greens", "roger"],
    probes: {},
    callsignAlt: csShort,
  });

  const gpText = P.events.aboveGlidepath ? "slightly above glidepath" : "slightly below glidepath";
  const azText = P.events.leftOfTrack ? "slightly left of track" : "slightly right of track";
  steps.push({
    id: "par-correction",
    cue: "ATC gives glidepath AND azimuth information — this is what makes PAR different from SRA. Acknowledge.",
    atcBefore: `${csShort}, ${gpText}, ${azText}.`,
    expect: {
      slots: [{ key: "ack", critical: true, phrases: [reg.toLowerCase(), "roger", csShort.toLowerCase()] }],
      callsign: reg,
    },
    labels: { ack: "Acknowledged" },
    chips: [reg, "roger"],
    probes: {},
    callsignAlt: csShort,
  });

  steps.push({
    id: "par-no-ack",
    cue: "“Do not acknowledge further transmissions” — from here, just listen and fly. Report runway in sight.",
    atcBefore: `${csShort}, on glidepath, on track, do not acknowledge further transmissions, three miles from touchdown.`,
    expect: {
      slots: [{ key: "insight", critical: true, phrases: ["runway in sight"] }],
      callsign: reg,
    },
    labels: { insight: "Runway in sight" },
    chips: [`${reg},`, "runway in sight", "roger"],
    probes: { insight: "Report when you have the runway in sight." },
    callsignPosition: "any",
  });

  steps.push({
    id: "par-land",
    cue: "Landing clearance — mandatory read-back.",
    atcBefore: `${csShort}, runway ${rwySpoken}, cleared to land, ${speakWind(w.wind)}.`,
    expect: {
      slots: [
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "clearance", critical: true, phrases: ["cleared to land"] },
      ],
      callsign: reg,
    },
    labels: { runway: "Runway", clearance: "“Cleared to land”" },
    chips: [`Runway ${rwySpoken},`, "cleared to land,", reg],
    probes: { clearance: `${csShort}, read back — cleared to land.` },
    atcAfter: `${csShort}, approach completed, contact Tower ${speakFreq(A.tower)}.`,
    callsignAlt: csShort,
  });

  return {
    id: `par-${w.seed}`,
    title: "PAR Talkdown",
    subtitle: `${A.name} · runway ${A.runway} · precision approach radar · flight #${w.seed}`,
    station: `${A.name} Approach`,
    freq: A.approach,
    callsign: reg,
    aircraft: w.aircraftType,
    briefing: [
      `You are ${reg}, a ${w.aircraftType}, ${P.inboundDist} miles ${P.inboundDir} of ${A.name} at ${P.initialAlt.toLocaleString("en-IN")} ft.`,
      `This is a Precision Approach Radar (PAR) — like SRA, but ATC also tells you whether you are above or below the glidepath, not just left/right of track.`,
      `PAR goes to a lower decision altitude (${P.decisionAlt} ft) than SRA. Acknowledge all transmissions until told "do not acknowledge further transmissions".`,
    ],
    passMark: 50,
    steps,
  };
}

/* =========================== VFR Arrival — §7.4 ============================ */
export function buildVfrArrival(world) {
  const w = world;
  const A = w.airport;
  const VA = w.vfrArrival;
  const reg = w.callsign.reg;
  const cs = speakCallsign(reg);
  const csShort = speakCallsignShort(reg);
  const rwySpoken = speakDigits(A.runway);
  const qnhSpoken = speakDigits(w.qnh);
  const steps = [];

  steps.push({
    id: "arr-initial",
    cue: `You are ${VA.distance} miles ${VA.direction} at ${VA.altitude.toLocaleString("en-IN")} ft. Call Approach for VFR landing.`,
    expect: {
      slots: [
        { key: "station", phrases: [`${A.name.toLowerCase()} approach`, "approach"] },
        { key: "position", critical: true, phrases: [`${VA.distance} miles ${VA.direction}`, `miles ${VA.direction}`] },
        { key: "request", critical: true, phrases: ["request landing", "request vfr landing", "inbound for landing"] },
        { key: "atis", phrases: [`information ${w.atis.toLowerCase()}`] },
      ],
      callsign: reg,
    },
    labels: { station: "Station", position: "Position", request: "Request landing", atis: "ATIS" },
    chips: [
      `${A.name} Approach,`, `${reg},`, `${w.aircraftType},`,
      `${speakDigits(String(VA.distance))} miles ${VA.direction},`,
      speakAltitude(VA.altitude) + ",", "request VFR landing,",
      `information ${w.atis}`,
    ],
    probes: { request: `${cs}, pass your message.` },
    callsignPosition: "any",
  });

  steps.push({
    id: "arr-cleared",
    cue: "Read back the clearance — reporting point, altitude, and QNH.",
    atcBefore: `${cs}, proceed to ${VA.reportPoint}, descend to ${speakAltitude(VA.descendTo)}, QNH ${qnhSpoken}, report at ${VA.reportPoint}.`,
    expect: {
      slots: [
        { key: "point", critical: true, phrases: [VA.reportPoint.toLowerCase(), `to ${VA.reportPoint.toLowerCase()}`] },
        { key: "alt", critical: true, value: String(VA.descendTo) },
        { key: "qnh", critical: true, value: w.qnh, anchor: "qnh" },
      ],
      callsign: reg,
    },
    labels: { point: "Reporting point", alt: "Altitude", qnh: "QNH" },
    chips: [
      `Proceed to ${VA.reportPoint},`, `descend to ${speakAltitude(VA.descendTo)},`,
      `QNH ${qnhSpoken},`, `QNH ${speakDigits(w.qnhTrap)},`, reg,
    ],
    probes: { qnh: `${csShort}, confirm QNH?` },
    corrections: { qnh: `${csShort}, negative — QNH ${qnhSpoken}. Read back.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "arr-report",
    cue: `At ${VA.reportPoint}. Report.`,
    expect: {
      slots: [
        { key: "position", critical: true, phrases: [VA.reportPoint.toLowerCase(), `at ${VA.reportPoint.toLowerCase()}`] },
        { key: "alt", phrases: [String(VA.descendTo)] },
      ],
      callsign: reg,
    },
    labels: { position: "Position report", alt: "Level" },
    chips: [`${reg},`, `${VA.reportPoint},`, speakAltitude(VA.descendTo)],
    probes: { position: `${csShort}, report position.` },
    atcAfter: `${csShort}, join ${VA.joinMethod} runway ${rwySpoken}, contact Tower ${speakFreq(A.tower)}.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "arr-join-rb",
    cue: "Read back the join instruction and Tower frequency.",
    expect: {
      slots: [
        { key: "join", critical: true, phrases: [`join ${VA.joinMethod}`, VA.joinMethod] },
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "freq", critical: true, value: A.tower },
      ],
      callsign: reg,
    },
    labels: { join: "Join method", runway: "Runway", freq: "Tower frequency" },
    chips: [
      `Join ${VA.joinMethod},`, `runway ${rwySpoken},`,
      `Tower ${speakFreq(A.tower)},`, reg,
    ],
    probes: { freq: `${csShort}, confirm Tower frequency?` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "arr-tower",
    cue: "Call Tower with your position.",
    expect: {
      slots: [
        { key: "station", phrases: [`${A.name.toLowerCase()} tower`, "tower"] },
        { key: "join", critical: true, phrases: [VA.joinMethod, `joining ${VA.joinMethod}`] },
      ],
      callsign: reg,
    },
    labels: { station: "Station", join: "Joining report" },
    chips: [`${A.name} Tower,`, `${reg},`, `joining ${VA.joinMethod},`, `runway ${rwySpoken}`],
    probes: { join: `${cs}, report your position.` },
    callsignPosition: "any",
  });

  steps.push({
    id: "arr-land",
    cue: "Landing clearance — mandatory read-back.",
    atcBefore: `${csShort}, ${speakWind(w.wind)}, runway ${rwySpoken}, cleared to land.`,
    expect: {
      slots: [
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "clearance", critical: true, phrases: ["cleared to land"] },
      ],
      callsign: reg,
    },
    labels: { runway: "Runway", clearance: "“Cleared to land”" },
    chips: [`Runway ${rwySpoken},`, "cleared to land,", reg],
    probes: { clearance: `${csShort}, read back — cleared to land.` },
    callsignAlt: csShort,
  });

  return {
    id: `vfr-arrival-${w.seed}`,
    title: "VFR Arrival",
    subtitle: `${reg} · inbound ${A.name} · ${VA.joinMethod} · flight #${w.seed}`,
    station: `${A.name} Approach`,
    freq: A.approach,
    callsign: reg,
    aircraft: w.aircraftType,
    briefing: [
      `You are ${reg}, a ${w.aircraftType}, ${VA.distance} miles ${VA.direction} of ${A.name} at ${VA.altitude.toLocaleString("en-IN")} ft, with information ${w.atis}.`,
      `Contact Approach for a VFR landing. They will route you via a reporting point, hand you off to Tower, and Tower will clear you to land.`,
      `This is the standard VFR inbound sequence — the complement to Scenario 1 (VFR Departure).`,
    ],
    passMark: 50,
    steps,
  };
}

/* =================== Airways Transit — §8.4-8.6 + §11.1 =================== */
export function buildAirwaysTransit(world) {
  const w = world;
  const A = w.airport;
  const AW = w.airways;
  const F = w.ifr;
  const reg = `Ghostair ${F.flightNo}`;
  const cs = `Ghostair ${speakDigits(F.flightNo)}`;
  const flSpoken = speakDigits(AW.fl);
  const steps = [];

  steps.push({
    id: "aw-request",
    cue: `Request clearance to join airway ${AW.airway} at ${AW.entryFix}. State your level.`,
    expect: {
      slots: [
        { key: "station", phrases: [`${A.name.toLowerCase()} control`, "control"] },
        { key: "request", critical: true, phrases: ["request join", "request clearance", "request airways clearance"] },
        { key: "airway", critical: true, phrases: [AW.airway.toLowerCase()] },
        { key: "fix", critical: true, phrases: [AW.entryFix.toLowerCase()] },
        { key: "level", value: AW.fl, anchor: "fl" },
      ],
      callsign: reg,
    },
    labels: { station: "Station", request: "Request", airway: "Airway", fix: "Entry fix", level: "Flight level" },
    chips: [
      `${A.name} Control,`, `${reg},`, `request join airway ${AW.airway},`,
      `at ${AW.entryFix},`, `flight level ${flSpoken}`,
    ],
    probes: { request: `${cs}, pass your message.` },
    callsignPosition: "any",
  });

  steps.push({
    id: "aw-cleared",
    cue: "Read back the airways clearance.",
    atcBefore: `${cs}, cleared to join airway ${AW.airway} at ${AW.entryFix}, maintain flight level ${flSpoken}, report passing ${AW.entryFix}.`,
    expect: {
      slots: [
        { key: "cleared", critical: true, phrases: [`cleared to join airway ${AW.airway.toLowerCase()}`, `join airway ${AW.airway.toLowerCase()}`] },
        { key: "level", critical: true, value: AW.fl, anchor: "fl" },
      ],
      callsign: reg,
    },
    labels: { cleared: "Cleared to join", level: "Flight level" },
    chips: [
      `Cleared to join airway ${AW.airway},`, `at ${AW.entryFix},`,
      `maintain flight level ${flSpoken},`, reg,
    ],
    probes: { level: `${cs}, confirm level?` },
  });

  steps.push({
    id: "aw-posrep",
    cue: `Passing ${AW.entryFix}. Make a full position report: callsign, position, level, next position and estimate.`,
    expect: {
      slots: [
        { key: "position", critical: true, phrases: [AW.entryFix.toLowerCase()] },
        { key: "level", critical: true, value: AW.fl, anchor: "fl" },
        { key: "next", critical: true, phrases: [AW.nextFix.toLowerCase()] },
        { key: "estimate", phrases: [String(AW.estimateMinutes)] },
      ],
      callsign: reg,
    },
    labels: { position: "Position", level: "Level", next: "Next fix", estimate: "Estimate" },
    chips: [
      `${reg},`, `${AW.entryFix},`, `flight level ${flSpoken},`,
      `estimating ${AW.nextFix},`, `${speakDigits(String(AW.estimateMinutes))} minutes`,
    ],
    probes: { position: `${cs}, say position?`, next: `${cs}, next reporting point?` },
    atcAfter: `${cs}, roger.`,
    callsignPosition: "any",
  });

  if (AW.events.selcalCheck) {
    steps.push({
      id: "aw-selcal",
      cue: `ATC is checking your SELCAL. Your code is ${AW.selcalCode}. Confirm it is serviceable.`,
      atcBefore: `${cs}, SELCAL check.`,
      expect: {
        slots: [
          { key: "selcal", critical: true, phrases: ["selcal serviceable", "selcal check received", "selcal confirmed"] },
        ],
        callsign: reg,
      },
      labels: { selcal: "SELCAL confirmed" },
      chips: [`${reg},`, "SELCAL serviceable"],
      probes: { selcal: `${cs}, confirm SELCAL?` },
      atcAfter: `${cs}, roger, SELCAL approved, monitor ${speakFreq(A.control)}.`,
    });
  }

  if (AW.events.revisedEstimate) {
    const revised = AW.estimateMinutes + 5;
    steps.push({
      id: "aw-revised",
      cue: `Headwinds stronger than planned — revised estimate for ${AW.nextFix} is ${revised} minutes. Report.`,
      expect: {
        slots: [
          { key: "revised", critical: true, phrases: ["revised estimate", "revised"] },
          { key: "fix", critical: true, phrases: [AW.nextFix.toLowerCase()] },
          { key: "time", critical: true, phrases: [String(revised)] },
        ],
        callsign: reg,
      },
      labels: { revised: "Revised estimate", fix: "Fix", time: "New estimate" },
      chips: [
        `${reg},`, `revised estimate ${AW.nextFix},`,
        `${speakDigits(String(revised))} minutes`,
      ],
      probes: { revised: `${cs}, say again?` },
      atcAfter: `${cs}, roger, revised estimate noted.`,
      callsignPosition: "any",
    });
  }

  steps.push({
    id: "aw-leave",
    cue: "ATC tells you to leave the airway. Read back.",
    atcBefore: `${cs}, leave airway ${AW.airway} at ${AW.exitFix}, contact ${A.name} Approach ${speakFreq(A.approach)}.`,
    expect: {
      slots: [
        { key: "leave", critical: true, phrases: [`leave airway ${AW.airway.toLowerCase()}`, `leaving airway ${AW.airway.toLowerCase()}`] },
        { key: "fix", critical: true, phrases: [AW.exitFix.toLowerCase()] },
        { key: "freq", critical: true, value: A.approach },
      ],
      callsign: reg,
    },
    labels: { leave: "Leave airway", fix: "Exit fix", freq: "Next frequency" },
    chips: [
      `Leave airway ${AW.airway} at ${AW.exitFix},`,
      `${A.name} Approach ${speakFreq(A.approach)},`, reg,
    ],
    probes: { freq: `${cs}, confirm frequency?` },
  });

  return {
    id: `airways-${w.seed}`,
    title: "Airways Transit",
    subtitle: `${reg} · ${AW.airway} · ${AW.entryFix}→${AW.exitFix} · FL${AW.fl} · flight #${w.seed}`,
    station: `${A.name} Control`,
    freq: A.control,
    callsign: reg,
    aircraft: "Ghostair jet",
    briefing: [
      `You are ${reg}, cruising at FL${AW.fl}, about to join airway ${AW.airway} at ${AW.entryFix} on ${A.name} Control ${A.control}.`,
      `This scenario covers controlled airspace procedures: joining an airway, the full position report format, SELCAL checks, revised estimates, and leaving an airway.`,
      `Position report format: callsign → position → level → next position → estimate. Get the order right — examiners love this one.`,
    ],
    passMark: 50,
    steps,
  };
}

/* ========================== Fuel Dump — §11.2 ============================== */
export function buildFuelDump(world) {
  const w = world;
  const A = w.airport;
  const FD = w.fuelDump;
  const F = w.ifr;
  const reg = `Ghostair ${F.flightNo}`;
  const cs = `Ghostair ${speakDigits(F.flightNo)}`;
  const altSpoken = speakAltitude(FD.altitude);
  const dumpAltSpoken = speakAltitude(FD.dumpAlt);
  const steps = [];

  steps.push({
    id: "fd-panpan",
    cue: `${FD.reason} — you need to return but you are too heavy to land. Request fuel dump. This is URGENCY (PAN-PAN).`,
    expect: {
      slots: [
        { key: "pan3", critical: true, phrases: ["pan pan pan pan pan pan"] },
        { key: "nature", critical: true, phrases: [FD.reason.toLowerCase()] },
        { key: "request", critical: true, phrases: ["request fuel dump", "request fuel jettison", "request to dump fuel"] },
        { key: "position", phrases: [FD.fix.toLowerCase(), `${FD.distance} miles ${FD.direction}`] },
      ],
      callsign: reg,
    },
    labels: { pan3: "PAN-PAN × 3", nature: "Nature", request: "Request fuel dump", position: "Position" },
    chips: [
      "PAN-PAN PAN-PAN PAN-PAN,", `${A.name} Control,`, `${reg},`,
      `${FD.reason},`, altSpoken + ",",
      `${FD.fix}, ${speakDigits(String(FD.distance))} miles ${FD.direction},`,
      "request fuel dump",
    ],
    probes: { nature: `${cs}, say again the nature of your emergency?`, request: `${cs}, say your intentions?` },
    callsignPosition: "any",
  });

  steps.push({
    id: "fd-cleared",
    cue: "Read back the fuel dump clearance — heading and altitude.",
    atcBefore: `${cs}, roger your PAN, cleared to dump fuel, turn heading ${speakDigits(FD.dumpHeading)}, maintain ${dumpAltSpoken}.`,
    expect: {
      slots: [
        { key: "cleared", critical: true, phrases: ["cleared to dump fuel", "cleared fuel dump"] },
        { key: "hdg", critical: true, value: FD.dumpHeading, anchor: "heading" },
        { key: "alt", critical: true, value: String(FD.dumpAlt) },
      ],
      callsign: reg,
    },
    labels: { cleared: "Cleared fuel dump", hdg: "Heading", alt: "Altitude" },
    chips: [
      "Cleared to dump fuel,", `heading ${speakDigits(FD.dumpHeading)},`,
      `maintain ${dumpAltSpoken},`, reg,
    ],
    probes: { hdg: `${cs}, confirm heading?` },
  });

  steps.push({
    id: "fd-commence",
    cue: "You are in position. Report commencing fuel dump.",
    expect: {
      slots: [
        { key: "commence", critical: true, phrases: ["commencing fuel dump", "fuel dump commencing", "dumping fuel"] },
      ],
      callsign: reg,
    },
    labels: { commence: "Commencing fuel dump" },
    chips: [`${reg},`, "commencing fuel dump"],
    probes: { commence: `${cs}, report when commencing.` },
    atcAfter: `${cs}, roger. All stations, ${A.name} Control, fuel dumping in progress, vicinity of ${FD.fix}, ${dumpAltSpoken}, avoid the area.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "fd-complete",
    cue: "Fuel dump complete. Report.",
    expect: {
      slots: [
        { key: "complete", critical: true, phrases: ["fuel dump complete", "fuel dumping complete", "dump complete"] },
      ],
      callsign: reg,
    },
    labels: { complete: "Fuel dump complete" },
    chips: [`${reg},`, "fuel dump complete"],
    probes: { complete: `${cs}, report when fuel dump complete.` },
    atcAfter: `${cs}, roger, fuel dump complete. Cleared direct to ${A.name}, descend to flight level ${speakDigits("60")}, contact ${A.name} Approach ${speakFreq(A.approach)}.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "fd-divert",
    cue: "Read back the diversion clearance.",
    expect: {
      slots: [
        { key: "direct", critical: true, phrases: [`direct to ${A.name.toLowerCase()}`, `direct ${A.name.toLowerCase()}`] },
        { key: "level", critical: true, value: "60", anchor: "fl" },
        { key: "freq", critical: true, value: A.approach },
      ],
      callsign: reg,
    },
    labels: { direct: "Direct routing", level: "Descent level", freq: "Approach frequency" },
    chips: [
      `Direct to ${A.name},`, `descend to flight level ${speakDigits("60")},`,
      `${A.name} Approach ${speakFreq(A.approach)},`, reg,
    ],
    probes: { freq: `${cs}, confirm frequency?` },
  });

  return {
    id: `fuel-dump-${w.seed}`,
    title: "Fuel Dump",
    subtitle: `${reg} · ${FD.reason} · ${FD.fix} · flight #${w.seed}`,
    station: `${A.name} Control`,
    freq: A.control,
    callsign: reg,
    aircraft: "Ghostair jet",
    briefing: [
      `You are ${reg}, at ${FD.altitude.toLocaleString("en-IN")} ft, ${FD.distance} miles ${FD.direction} of ${FD.fix}, on ${A.name} Control ${A.control}.`,
      `Problem: ${FD.reason}. You need to return to ${A.name} but you are above maximum landing weight. You must dump fuel first.`,
      `PAN-PAN (not MAYDAY — the aircraft is flyable). Request fuel dump. ATC will give you a heading and altitude, then broadcast a warning to all traffic.`,
    ],
    passMark: 50,
    steps,
  };
}

/* ====================== Abandoned Takeoff — §4.5 =========================== */
export function buildAbandonedTakeoff(world) {
  const w = world;
  const A = w.airport;
  const AT = w.abandonedTakeoff;
  const reg = w.callsign.reg;
  const cs = speakCallsign(reg);
  const csShort = speakCallsignShort(reg);
  const rwySpoken = speakDigits(A.runway);
  const steps = [];

  steps.push({
    id: "at-clearance",
    cue: "You are lined up on the runway. Read back the takeoff clearance.",
    atcBefore: `${cs}, ${speakWind(w.wind)}, runway ${rwySpoken}, cleared for takeoff.`,
    expect: {
      slots: [
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "clearance", critical: true, phrases: ["cleared for takeoff"] },
      ],
      callsign: reg,
    },
    labels: { runway: "Runway", clearance: "“Cleared for takeoff”" },
    chips: [`Runway ${rwySpoken},`, "cleared for takeoff,", "cleared to land,", reg],
    probes: { clearance: `${csShort}, read back — cleared for takeoff.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "at-stopping",
    cue: `Rolling — ${AT.reason}! The ICAO word is "STOPPING". Say it NOW.`,
    expect: {
      slots: [
        { key: "stopping", critical: true, phrases: ["stopping"] },
      ],
      callsign: reg,
      forbidden: ["aborting", "rejecting"],
    },
    labels: { stopping: "“STOPPING”" },
    chips: [`${reg},`, "STOPPING", "aborting"],
    probes: { stopping: `${csShort}, are you stopping?` },
    atcAfter: `${csShort}, roger, hold position on the runway, emergency services on the way.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "at-hold",
    cue: "Acknowledge — hold position.",
    expect: {
      slots: [{ key: "hold", critical: true, phrases: ["holding position", "hold position", "holding", "roger"] }],
      callsign: reg,
    },
    labels: { hold: "Holding position" },
    chips: ["Holding position,", "roger,", reg],
    probes: {},
    callsignAlt: csShort,
  });

  steps.push({
    id: "at-vacate",
    cue: "Emergency services clear. Vacate when able — read back.",
    atcBefore: `${csShort}, when able, vacate runway ${rwySpoken} via taxiway ${A.taxiway}, contact Ground ${speakFreq(A.ground)}.`,
    expect: {
      slots: [
        { key: "vacate", critical: true, phrases: ["vacate", `taxiway ${A.taxiway.toLowerCase()}`, "wilco"] },
        { key: "freq", critical: true, value: A.ground },
      ],
      callsign: reg,
    },
    labels: { vacate: "Vacate", freq: "Ground frequency" },
    chips: [
      `Vacate via taxiway ${A.taxiway},`,
      `Ground ${speakFreq(A.ground)},`, "wilco,", reg,
    ],
    probes: { freq: `${csShort}, confirm Ground frequency?` },
    callsignAlt: csShort,
  });

  return {
    id: `aborted-${w.seed}`,
    title: "Abandoned Takeoff",
    subtitle: `${reg} · runway ${A.runway} · ${AT.reason} · flight #${w.seed}`,
    station: `${A.name} Tower`,
    freq: A.tower,
    callsign: reg,
    aircraft: w.aircraftType,
    briefing: [
      `You are ${reg}, a ${w.aircraftType}, lined up on runway ${A.runway} at ${A.name}, cleared for takeoff.`,
      `Something will go wrong during the takeoff roll. The ICAO standard word for abandoning the takeoff is "STOPPING" — not "aborting", not "rejecting". Just "STOPPING".`,
      `Short and sharp: callsign + STOPPING. Tower will acknowledge, send emergency services, and tell you when to vacate.`,
    ],
    passMark: 50,
    steps,
  };
}

/* ===================== MSAW Terrain Alert — §6.7 =========================== */
export function buildMsawAlert(world) {
  const w = world;
  const A = w.airport;
  const M = w.msaw;
  const F = w.ifr;
  const reg = `Ghostair ${F.flightNo}`;
  const cs = `Ghostair ${speakDigits(F.flightNo)}`;
  const newAltSpoken = speakAltitude(M.newAlt);
  const steps = [];

  steps.push({
    id: "msaw-alert",
    cue: "ATC shouts PULL UP — this is a Minimum Safe Altitude Warning. RESPOND IMMEDIATELY.",
    atcBefore: `${cs}, PULL UP, I say again, PULL UP, ${M.terrain} ${M.direction}, ${speakDigits(String(M.distance))} miles, climb IMMEDIATELY to ${newAltSpoken}.`,
    expect: {
      slots: [
        { key: "pullup", critical: true, phrases: ["pulling up", "climbing", "climbing immediately"] },
        { key: "alt", critical: true, value: String(M.newAlt) },
      ],
      callsign: reg,
    },
    labels: { pullup: "“Pulling up”", alt: "Climbing to" },
    chips: [`${reg},`, "pulling up,", `climbing to ${newAltSpoken}`, "roger"],
    probes: { pullup: `${cs}, I say again, PULL UP!` },
  });

  steps.push({
    id: "msaw-level",
    cue: "Report reaching the safe altitude.",
    expect: {
      slots: [
        { key: "level", critical: true, value: String(M.newAlt) },
        { key: "maintaining", phrases: ["maintaining", "level"] },
      ],
      callsign: reg,
    },
    labels: { level: "Level report", maintaining: "Maintaining" },
    chips: [`${reg},`, `maintaining ${newAltSpoken}`],
    probes: { level: `${cs}, say your level?` },
    atcAfter: `${cs}, roger, maintain ${newAltSpoken}, terrain clear. Continue as cleared.`,
    callsignPosition: "any",
  });

  steps.push({
    id: "msaw-ack",
    cue: "Acknowledge — maintain the altitude.",
    expect: {
      slots: [
        { key: "maintain", critical: true, phrases: [`maintain ${String(M.newAlt)}`, `maintaining ${String(M.newAlt)}`, "wilco", "roger"] },
      ],
      callsign: reg,
    },
    labels: { maintain: "Maintain altitude" },
    chips: [`Maintaining ${newAltSpoken},`, "wilco,", reg],
    probes: {},
  });

  return {
    id: `msaw-${w.seed}`,
    title: "MSAW — Terrain Alert",
    subtitle: `${reg} · ${M.terrain} ${M.direction} · PULL UP · flight #${w.seed}`,
    station: `${A.name} Control`,
    freq: A.control,
    callsign: reg,
    aircraft: "Ghostair jet",
    briefing: [
      `You are ${reg}, at ${M.currentAlt.toLocaleString("en-IN")} ft, in the vicinity of ${A.name} on ${A.name} Control ${A.control}.`,
      `ATC's Minimum Safe Altitude Warning (MSAW) system has triggered. When you hear "PULL UP", you climb IMMEDIATELY — acknowledge and comply, no questions asked.`,
      `This is the most time-critical ATC instruction after "go around". React first, ask questions later. The correct response: "PULLING UP, CLIMBING TO [altitude]".`,
    ],
    passMark: 50,
    steps,
  };
}

/* ===================== Runway Conditions — §10.3 =========================== */
export function buildRunwayConditions(world) {
  const w = world;
  const A = w.airport;
  const RC = w.runwayConditions;
  const reg = w.callsign.reg;
  const cs = speakCallsign(reg);
  const csShort = speakCallsignShort(reg);
  const rwySpoken = speakDigits(A.runway);
  const qnhSpoken = speakDigits(w.qnh);
  const steps = [];

  steps.push({
    id: "rwy-initial",
    cue: "Call Tower for landing. Winter conditions — expect a runway condition report.",
    expect: {
      slots: [
        { key: "station", phrases: [`${A.name.toLowerCase()} tower`, "tower"] },
        { key: "request", critical: true, phrases: ["request landing", "inbound for landing", "final"] },
      ],
      callsign: reg,
    },
    labels: { station: "Station", request: "Request landing" },
    chips: [`${A.name} Tower,`, `${reg},`, `final runway ${rwySpoken},`, "request landing"],
    probes: { request: `${cs}, pass your message.` },
    callsignPosition: "any",
  });

  steps.push({
    id: "rwy-condition",
    cue: "Tower passes runway conditions. Read back the braking action — this is mandatory.",
    atcBefore: `${cs}, runway ${rwySpoken}, ${RC.contaminant}, depth ${speakDigits(String(RC.depth))} millimetres, ${speakDigits(String(RC.coverage))} percent coverage, braking action ${RC.brakingAction}, QNH ${qnhSpoken}.`,
    expect: {
      slots: [
        { key: "braking", critical: true, phrases: [`braking action ${RC.brakingAction}`] },
        { key: "qnh", critical: true, value: w.qnh, anchor: "qnh" },
      ],
      callsign: reg,
    },
    labels: { braking: "Braking action", qnh: "QNH" },
    chips: [
      `Braking action ${RC.brakingAction},`, `QNH ${qnhSpoken},`,
      `QNH ${speakDigits(w.qnhTrap)},`, reg,
    ],
    probes: { braking: `${csShort}, confirm braking action?`, qnh: `${csShort}, confirm QNH?` },
    corrections: { qnh: `${csShort}, negative — QNH ${qnhSpoken}. Read back.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "rwy-land",
    cue: "Landing clearance — read back runway and clearance.",
    atcBefore: `${csShort}, ${speakWind(w.wind)}, runway ${rwySpoken}, cleared to land, caution ${RC.contaminant} runway.`,
    expect: {
      slots: [
        { key: "runway", critical: true, value: A.runway, anchor: "runway" },
        { key: "clearance", critical: true, phrases: ["cleared to land"] },
      ],
      callsign: reg,
    },
    labels: { runway: "Runway", clearance: "“Cleared to land”" },
    chips: [`Runway ${rwySpoken},`, "cleared to land,", reg],
    probes: { clearance: `${csShort}, read back — cleared to land.` },
    callsignAlt: csShort,
  });

  steps.push({
    id: "rwy-observed",
    cue: "After landing, Tower asks for YOUR observed braking action. Report what you felt.",
    atcBefore: `${csShort}, report observed braking action.`,
    expect: {
      slots: [
        { key: "braking", critical: true, phrases: ["braking action good", "braking action medium", "braking action poor", "braking action medium to good", "braking action medium to poor", `braking action ${RC.brakingAction}`] },
      ],
      callsign: reg,
    },
    labels: { braking: "Observed braking action" },
    chips: [`${reg},`, `braking action ${RC.brakingAction}`],
    probes: { braking: `${csShort}, say observed braking action?` },
    atcAfter: `${csShort}, roger, braking action noted. Contact Ground ${speakFreq(A.ground)}.`,
    callsignPosition: "any",
  });

  return {
    id: `rwy-conditions-${w.seed}`,
    title: "Runway Conditions",
    subtitle: `${reg} · ${A.name} · ${RC.contaminant} · braking ${RC.brakingAction} · flight #${w.seed}`,
    station: `${A.name} Tower`,
    freq: A.tower,
    callsign: reg,
    aircraft: w.aircraftType,
    briefing: [
      `You are ${reg}, a ${w.aircraftType}, on final for runway ${A.runway} at ${A.name}.`,
      `The runway is contaminated: ${RC.contaminant}, ${RC.coverage}% coverage, ${RC.depth}mm depth. Tower will pass braking action — READ IT BACK.`,
      `After landing, Tower may ask for YOUR observed braking action. Report what you actually experienced on the rollout — this helps the next pilot.`,
    ],
    passMark: 50,
    steps,
  };
}
