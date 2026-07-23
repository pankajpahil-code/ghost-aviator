// Ghost Tower — WorldGen: rolls a deterministic, seeded world for one flight.
// Same seed → identical world (examiner's audit trail, replayable flights);
// different seeds → different airport, runway, wind, QNH, ATIS, callsign,
// traffic and armed events. Pure functions only. Plan: GHOST_TOWER_MASTER_PLAN §4a.
//
// Airport data is REPRESENTATIVE TRAINING DATA (Captain's decision 2026-07-19:
// real Indian station names, book-style generic frequencies) — never chart-
// accurate, never claiming currency.

// mulberry32 — tiny deterministic PRNG, good enough for scenario variety.
export function makeRng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
const irange = (rnd, lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));

// Representative training aerodromes (book convention: real names, generic data).
const AIRPORTS = [
  { name: "Delhi",     ground: "121.9",  tower: "118.1",  approach: "119.3",  control: "127.5",  runways: ["27", "09"] },
  { name: "Mumbai",    ground: "121.75", tower: "118.35", approach: "119.5",  control: "127.9",  runways: ["32", "14"] },
  { name: "Chennai",   ground: "121.65", tower: "118.5",  approach: "119.7",  control: "127.35", runways: ["25", "07"] },
  { name: "Kolkata",   ground: "121.8",  tower: "118.25", approach: "119.15", control: "127.6",  runways: ["19", "01"] },
  { name: "Hyderabad", ground: "121.55", tower: "118.75", approach: "119.85", control: "127.15", runways: ["27", "09"] },
  { name: "Pune",      ground: "121.85", tower: "118.6",  approach: "119.45", control: "127.8",  runways: ["28", "10"] },
];

const FIXES = ["PAPA", "SIERRA", "ROMEO", "LIMA", "OSCAR", "TANGO"];
const SPECIAL_SQUAWKS = new Set(["7500", "7600", "7700", "7000", "2000"]);

const HOLDING_LETTERS = ["Alfa", "Bravo", "Charlie", "Delta"];
const TAXIWAYS = ["Alfa", "Bravo", "Charlie", "Delta", "Echo"];
const TRAFFIC_TYPES = ["King Air", "Learjet", "Baron", "Caravan", "A320"];
const LANDING_TYPES = ["Cessna", "Piper", "King Air"];
const CALLSIGN_LETTERS = "ABCDEFGHJKLMNPQRSTUVWZ"; // skip I/O/X/Y (confusable / rare on VT-)
const ATIS_LETTERS = ["Alfa", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel"];
const DEPARTURE_ALTS = [1500, 2000, 2500];
const DIRECTIONS = ["north", "south", "east", "west"];

// Runway heading in degrees from its two-digit designator.
const runwayHeading = (rwy) => Number(rwy) * 10;

export function rollWorld(seed) {
  const rnd = makeRng(seed);
  const airport = pick(rnd, AIRPORTS);
  const runway = airport.runways[rnd() < 0.8 ? 0 : 1];
  const origin = { ...airport, runway };

  // Wind favours the active runway (±40°), 4–15 kt, occasional gusts.
  const windDir = ((runwayHeading(runway) + irange(rnd, -4, 4) * 10) + 360) % 360 || 360;
  const windSpeed = irange(rnd, 4, 15);
  const gustTo = windSpeed >= 11 && rnd() < 0.4 ? windSpeed + irange(rnd, 6, 10) : null;

  const qnh = String(irange(rnd, 995, 1024));
  // A plausible wrong-QNH trap: two adjacent digits transposed (never equal).
  const d = qnh.split("");
  const i = irange(rnd, 0, d.length - 2);
  const swapped = [...d];
  [swapped[i], swapped[i + 1]] = [swapped[i + 1], swapped[i]];
  // If the digits happened to be identical (e.g. "999"), nudge the last digit
  // instead — the trap must differ from the truth but keep the same length.
  const qnhTrap = swapped.join("") === qnh
    ? String(Number(qnh) + (qnh.endsWith("9") ? -1 : 1))
    : swapped.join("");

  // VT- registration, three distinct letters.
  const letters = [];
  while (letters.length < 3) {
    const c = CALLSIGN_LETTERS[Math.floor(rnd() * CALLSIGN_LETTERS.length)];
    if (!letters.includes(c)) letters.push(c);
  }
  const reg = `VT-${letters.join("")}`;

  // ---------------- IFR layer (consumed by buildIfrFlight) ----------------
  const destA = pick(rnd, AIRPORTS.filter(a => a.name !== origin.name));
  const destRunway = destA.runways[rnd() < 0.8 ? 0 : 1];
  const destRwyH = runwayHeading(destRunway);
  let squawk = "";
  do {
    squawk = `${irange(rnd, 1, 6)}${irange(rnd, 0, 7)}${irange(rnd, 0, 7)}${irange(rnd, 0, 7)}`;
  } while (SPECIAL_SQUAWKS.has(squawk));
  const sidFix = pick(rnd, FIXES);
  const pad3 = (h) => String(h === 0 ? 360 : h).padStart(3, "0");
  const closingSide = rnd() < 0.5 ? "left" : "right";
  const rvrBase = pick(rnd, [550, 600, 650]);
  const ifr = {
    flightNo: `${irange(rnd, 1, 9)}${irange(rnd, 0, 9)}${irange(rnd, 0, 9)}`,
    dest: {
      name: destA.name, ground: destA.ground, tower: destA.tower,
      approach: destA.approach, runway: destRunway,
      atis: pick(rnd, ATIS_LETTERS), qnh: String(irange(rnd, 995, 1024)),
    },
    departureFreq: origin.approach,
    controlFreq: origin.control,
    sid: `${sidFix} ${irange(rnd, 1, 4)}`,
    sidFix,
    enrouteFix: pick(rnd, FIXES.filter(f => f !== sidFix)),
    squawk,
    cruiseFl: String(pick(rnd, [90, 100, 110])),
    descentFl: String(pick(rnd, [60, 70])),
    platformAlt: pick(rnd, [2500, 3000, 3500]),
    vectorHdg: pad3((destRwyH + 240) % 360),
    closingSide,
    closingHdg: pad3((destRwyH + (closingSide === "left" ? -30 : 30) + 360) % 360),
    avoidHdg: pad3(irange(rnd, 1, 36) * 10),
    trafficClock: irange(rnd, 1, 12),
    trafficMiles: irange(rnd, 2, 6),
    efcTime: String(irange(rnd, 1, 11) * 5).padStart(2, "0"),
    holdShortRwy: origin.runways.find(r => r !== runway) ?? "33",
    rvr: {
      touchdown: rvrBase,
      midpoint: Math.max(300, rvrBase - pick(rnd, [0, 50, 100])),
      stopEnd: Math.max(300, rvrBase - pick(rnd, [50, 100, 150])),
    },
    events: {
      avoidingAction: rnd() < 0.65,
      hold: rnd() < 0.45,
      lowVis: rnd() < 0.4,
    },
  };

  // ------------- Emergency layer (PAN→MAYDAY + radio-failure drills) -------
  const emDistance = irange(rnd, 18, 30);
  const emergency = {
    cruiseAlt: pick(rnd, [4500, 5500, 6500]),
    divertAlt: pick(rnd, [3000, 3500]),
    maydayAlt: pick(rnd, [3500, 4000]),
    distance: emDistance,
    distance2: emDistance - irange(rnd, 5, 8),
    direction: pick(rnd, DIRECTIONS),
    pob: irange(rnd, 2, 4),
    finalMiles: irange(rnd, 6, 10),
  };

  // ------------- Circuit layer (VFR traffic pattern — §4.6-4.9) -----------
  const circuit = {
    altitude: pick(rnd, [1000, 1200, 1500]),
    direction: rnd() < 0.7 ? "left" : "right",
    trafficType: pick(rnd, ["Cessna", "Piper", "Robin", "Warrior"]),
    trafficPosition: pick(rnd, ["base", "final"]),
    sequenceNo: irange(rnd, 2, 4),
    joinFrom: pick(rnd, DIRECTIONS),
    joinDist: irange(rnd, 3, 6),
    heavyType: pick(rnd, ["B757", "A330", "B777"]),
    events: {
      goAround: rnd() < 0.5,
      touchAndGo: rnd() < 0.6,
      wakeTurbulence: rnd() < 0.25,
    },
  };

  // ------------- SRA layer (surveillance radar approach — §7.6) -----------
  const sraRwyH = runwayHeading(runway);
  const sra = {
    termination: pick(rnd, [1, 2]),
    obstacleAlt: pick(rnd, [400, 500, 600]),
    initialAlt: pick(rnd, [2000, 2200, 2500]),
    baseHdg: pad3(((sraRwyH + (rnd() < 0.5 ? 90 : -90)) + 360) % 360 || 360),
    inboundDist: irange(rnd, 15, 25),
    inboundDir: pick(rnd, DIRECTIONS),
    events: {
      azimuthCorrection: rnd() < 0.7,
      correctionSide: rnd() < 0.5 ? "left" : "right",
    },
  };

  // ------------- Medical emergency layer (§9.3) --------
  const medical = {
    condition: pick(rnd, ["suspected heart attack", "seizure", "breathing difficulty"]),
    distance: irange(rnd, 8, 20),
    direction: pick(rnd, DIRECTIONS),
    altitude: pick(rnd, [2000, 2500, 3000, 3500]),
    pob: irange(rnd, 2, 4),
  };

  // ------------- Lost pilot layer (§9.3 + §11.5) --------
  const lost = {
    lastHeading: pad3(irange(rnd, 1, 36) * 10),
    altitude: pick(rnd, [2500, 3000, 3500, 4000]),
    qdmBearing: pad3(irange(rnd, 1, 36) * 10),
    headingToFly: pad3(irange(rnd, 1, 36) * 10),
    qdmClass: pick(rnd, ["A", "B"]),
  };

  // ------------- Decompression layer (§9.4) --------
  const decompression = {
    cruiseFl: String(pick(rnd, [350, 370, 390])),
    targetFl: "100",
    fix: pick(rnd, FIXES),
    distance: irange(rnd, 15, 40),
    direction: pick(rnd, DIRECTIONS),
  };

  // ------------- TCAS layer (§11.6) --------
  const tcasRaDir = pick(rnd, ["climb", "descend"]);
  const tcasFl = String(pick(rnd, [310, 330, 350, 370]));
  const tcasOffset = pick(rnd, [5, 10]);
  const tcas = {
    currentFl: tcasFl,
    raDirection: tcasRaDir,
    deviationFl: String(Number(tcasFl) + (tcasRaDir === "climb" ? tcasOffset : -tcasOffset)),
    conflictClock: pick(rnd, [10, 11, 12, 1, 2]),
    conflictType: pick(rnd, ["B737", "A320", "unknown traffic"]),
  };

  // ------------- Special VFR layer (§7.2) --------
  const svfr = {
    visibility: pick(rnd, [1500, 2000, 2500]),
    cloudBase: pick(rnd, [800, 1000, 1200]),
    direction: pick(rnd, DIRECTIONS),
    distance: irange(rnd, 5, 10),
    routePoint: pick(rnd, ["reservoir", "railway line", "river", "highway"]),
    exitDirection: pick(rnd, DIRECTIONS),
    altitude: pick(rnd, [1000, 1200, 1500]),
  };
  // ------------- NDB approach layer (§7.3) --------
  const ndbRwyH = runwayHeading(runway);
  const ndb = {
    beaconId: pick(rnd, ["DL", "BM", "CH", "KL", "HY", "PN"]),
    inboundTrack: pad3(ndbRwyH === 0 ? 360 : ndbRwyH),
    outboundTrack: pad3((ndbRwyH + 180) % 360 || 360),
    procedureTurnAlt: pick(rnd, [2000, 2500, 3000]),
    minDescAlt: pick(rnd, [500, 600, 700]),
    missedApproachAlt: pick(rnd, [2000, 2500]),
    inboundDir: pick(rnd, DIRECTIONS),
    inboundDist: irange(rnd, 15, 25),
  };
  // ------------- PAR talkdown layer (§7.7) --------
  const par = {
    initialAlt: pick(rnd, [2000, 2500, 3000]),
    decisionAlt: pick(rnd, [200, 300, 400]),
    inboundDir: pick(rnd, DIRECTIONS),
    inboundDist: irange(rnd, 12, 20),
    events: {
      aboveGlidepath: rnd() < 0.5,
      leftOfTrack: rnd() < 0.5,
    },
  };
  // ------------- VFR arrival layer (§7.4) --------
  const vfrArrival = {
    reportPoint: pick(rnd, FIXES),
    altitude: pick(rnd, [2000, 2500, 3000, 3500]),
    direction: pick(rnd, DIRECTIONS),
    distance: irange(rnd, 15, 25),
    descendTo: pick(rnd, [1500, 2000]),
    joinMethod: pick(rnd, ["straight in", "downwind", "base"]),
  };
  // ------------- Airways transit layer (§8.4-8.6 + §11.1) --------
  const awEntryFix = pick(rnd, FIXES);
  const awRemaining = FIXES.filter(f => f !== awEntryFix);
  const awExitFix = pick(rnd, awRemaining);
  const awNextFix = pick(rnd, awRemaining.filter(f => f !== awExitFix));
  const selPool = "ABCDEFGHJKLMPQRS";
  const selLetters = [];
  while (selLetters.length < 4) {
    const c = selPool[Math.floor(rnd() * selPool.length)];
    if (!selLetters.includes(c)) selLetters.push(c);
  }
  const airways = {
    airway: pick(rnd, ["W15", "W34", "A474", "G450", "B345", "R460"]),
    entryFix: awEntryFix,
    exitFix: awExitFix,
    fl: String(pick(rnd, [100, 110, 120, 130, 150])),
    nextFix: awNextFix,
    estimateMinutes: irange(rnd, 15, 35),
    selcalCode: `${selLetters[0]}${selLetters[1]}-${selLetters[2]}${selLetters[3]}`,
    events: {
      selcalCheck: rnd() < 0.6,
      revisedEstimate: rnd() < 0.5,
    },
  };
  // ------------- Fuel dump layer (§11.2) --------
  const fuelDump = {
    reason: pick(rnd, ["engine failure", "hydraulic failure", "landing gear unsafe"]),
    altitude: pick(rnd, [6000, 8000, 10000]),
    direction: pick(rnd, DIRECTIONS),
    distance: irange(rnd, 20, 40),
    fix: pick(rnd, FIXES),
    dumpHeading: pad3(irange(rnd, 1, 36) * 10),
    dumpAlt: pick(rnd, [6000, 8000]),
  };
  // ------------- Abandoned takeoff layer (§4.5) --------
  const abandonedTakeoff = {
    reason: pick(rnd, ["engine failure", "bird strike", "warning light", "tyre burst"]),
  };
  // ------------- MSAW alert layer (§6.7) --------
  const msaw = {
    currentAlt: pick(rnd, [2000, 2500, 3000]),
    safeAlt: pick(rnd, [3500, 4000, 4500]),
    terrain: pick(rnd, ["high terrain", "obstacle", "rising terrain"]),
    direction: pick(rnd, DIRECTIONS),
    distance: irange(rnd, 5, 15),
    newAlt: pick(rnd, [4000, 4500, 5000]),
  };
  // ------------- Runway conditions layer (§10.3) --------
  const runwayConditions = {
    contaminant: pick(rnd, ["wet", "standing water", "slush", "compacted snow"]),
    brakingAction: pick(rnd, ["good", "medium to good", "medium", "medium to poor", "poor"]),
    coverage: pick(rnd, [25, 50, 75, 100]),
    depth: pick(rnd, [2, 3, 5, 8]),
  };

  return {
    seed,
    airport: {
      name: origin.name,
      ground: origin.ground,
      tower: origin.tower,
      approach: origin.approach,
      control: origin.control,
      runway,
      holdingPoint: `${pick(rnd, HOLDING_LETTERS)} ${irange(rnd, 1, 3)}`,
      taxiway: pick(rnd, TAXIWAYS),
    },
    ifr,
    emergency,
    circuit,
    sra,
    medical,
    lost,
    decompression,
    tcas,
    svfr, ndb, par, vfrArrival, airways, fuelDump, abandonedTakeoff, msaw, runwayConditions,
    atis: pick(rnd, ATIS_LETTERS),
    wind: { dir: windDir, speed: windSpeed, gustTo },
    qnh,
    qnhTrap,
    callsign: { reg, letters },
    aircraftType: "Cessna 172",
    departureAltitude: pick(rnd, DEPARTURE_ALTS),
    departureDirection: pick(rnd, DIRECTIONS),
    traffic: {
      givewayType: pick(rnd, TRAFFIC_TYPES),
      givewayDir: rnd() < 0.5 ? "left to right" : "right to left",
      landingType: pick(rnd, LANDING_TYPES),
    },
    events: {
      // Conditional line-up appears on most flights; plain line-up otherwise.
      conditionalLineup: rnd() < 0.7,
      // Occasionally Tower passes an updated QNH with the take-off clearance zone
      // (armed for future use; the departure flight keeps one QNH for now).
      qnhUpdate: rnd() < 0.25,
    },
  };
}

// A fresh random seed for "new flight" (UI helper; NOT used inside rollWorld).
export function randomSeed() {
  return Math.floor(Math.random() * 0xffffffff) >>> 0;
}
