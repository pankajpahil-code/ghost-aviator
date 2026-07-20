// Ghost Tower VoiceBank — fragment enumerator.
// Runs every flight builder over a wide seed sweep, harvests every string ATC
// actually SPEAKS (atcBefore/atcAfter/probes/corrections — cue lines are on-screen
// system text, never voiced), segments them, and writes the render manifest.
//
//   node tools/rtr-sim/voicebank/enumerate.mjs [seeds]
//
// Output: tools/rtr-sim/voicebank/manifest.json  { fragments: [{id,type,text}] }

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { rollWorld } from "../../../lib/rtr-sim/world.mjs";
import {
  buildVfrDeparture, buildIfrFlight, buildEmergencyFlight, buildRadioFailureFlight,
} from "../../../lib/rtr-sim/director.mjs";
import { collectFragments, segmentLine } from "../../../lib/rtr-sim/segment.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SEEDS = Number(process.argv[2] ?? 400);
const BUILDERS = [
  ["vfr", buildVfrDeparture],
  ["ifr", buildIfrFlight],
  ["emergency", buildEmergencyFlight],
  ["radiofail", buildRadioFailureFlight],
];

const lines = [];
const perFlightLineCount = {};

for (const [name, build] of BUILDERS) {
  let n = 0;
  for (let s = 1; s <= SEEDS; s++) {
    const flight = build(rollWorld(s));
    for (const step of flight.steps) {
      for (const v of [step.atcBefore, step.atcAfter]) if (v) { lines.push(v); n++; }
      for (const map of [step.probes, step.corrections]) {
        if (!map) continue;
        for (const v of Object.values(map)) if (v) { lines.push(v); n++; }
      }
    }
  }
  perFlightLineCount[name] = n;
}

const fragments = collectFragments(lines);
const atoms = [...fragments.values()].filter(f => f.type === "atom");
const phrases = [...fragments.values()].filter(f => f.type === "phrase");

// Longest phrases tell us whether segmentation is producing natural chunks.
const byLen = [...phrases].sort((a, b) => b.text.length - a.text.length);
const totalChars = [...fragments.values()].reduce((a, f) => a + f.text.length, 0);

console.log(`seeds swept        : ${SEEDS} × ${BUILDERS.length} flights`);
console.log(`ATC lines harvested: ${lines.length} (${JSON.stringify(perFlightLineCount)})`);
console.log(`distinct fragments : ${fragments.size}  (atoms ${atoms.length}, phrases ${phrases.length})`);
console.log(`total chars to TTS : ${totalChars}  (~${Math.round(totalChars / 14)}s of audio est.)`);
console.log(`longest phrases    :`);
for (const p of byLen.slice(0, 6)) console.log(`   "${p.text}"`);
console.log(`shortest phrases   : ${byLen.slice(-8).map(p => `"${p.text}"`).join(", ")}`);

// Sanity: every harvested line must be fully reconstructible from its fragments.
let unreconstructed = 0;
for (const line of lines) {
  const segs = segmentLine(line);
  if (!segs.length) { unreconstructed++; continue; }
  for (const s of segs) if (!fragments.has(`${s.type === "atom" ? "a_" : "p_"}${s.key.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`)) unreconstructed++;
}
console.log(`coverage check     : ${unreconstructed === 0 ? "OK — every line fully covered" : `MISSING ${unreconstructed}`}`);

mkdirSync(HERE, { recursive: true });
const out = resolve(HERE, "manifest.json");
writeFileSync(out, JSON.stringify({
  generated: "enumerate.mjs",
  seeds: SEEDS,
  fragments: [...fragments.values()],
}, null, 2));
console.log(`manifest written   : ${out}`);
