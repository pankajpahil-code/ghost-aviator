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
  { name: "Delhi",     ground: "121.9",  tower: "118.1",  runways: ["27", "09"] },
  { name: "Mumbai",    ground: "121.75", tower: "118.35", runways: ["32", "14"] },
  { name: "Chennai",   ground: "121.65", tower: "118.5",  runways: ["25", "07"] },
  { name: "Kolkata",   ground: "121.8",  tower: "118.25", runways: ["19", "01"] },
  { name: "Hyderabad", ground: "121.55", tower: "118.75", runways: ["27", "09"] },
  { name: "Pune",      ground: "121.85", tower: "118.6",  runways: ["28", "10"] },
];

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

  return {
    seed,
    airport: {
      name: airport.name,
      ground: airport.ground,
      tower: airport.tower,
      runway,
      holdingPoint: `${pick(rnd, HOLDING_LETTERS)} ${irange(rnd, 1, 3)}`,
      taxiway: pick(rnd, TAXIWAYS),
    },
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
