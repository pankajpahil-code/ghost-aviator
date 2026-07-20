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
    cue: `Holding point ${hpSpoken}, run-up complete. TUNE ${A.tower}, then call Tower and report ready. Careful — “take-off” is reserved for the clearance itself.`,
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
