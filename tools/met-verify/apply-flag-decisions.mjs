// Resolve the 108 flags: DROP questions that are unanswerable standalone
// (decode-an-unseen-METAR/TAF/ROFOR, read-an-unseen-station-model), and RESOLVE
// the genuine knowledge questions to VERIFIED with a clean explanation.
import fs from "node:fs";
const wf = JSON.parse(fs.readFileSync("tools/met-verify/wf-verified.json", "utf8"));

// Chapters where every FLAGGED question depends on an unseen coded message/diagram.
const dropAllFlagsIn = new Set(["met-24", "met-25", "met-26"]);

// Per-index decisions for scattered flags. KEEP => resolve to VERIFIED w/ clean cite.
const K = (cite) => ({ status: "VERIFIED", cite });
const D = { status: "DROP" };
const perIndex = {
  "met-13": { 20: K("Airborne weather radar uses a wavelength of about 3–4 cm."), 29: D,
              40: K("A Mesoscale Convective Complex persists for 6 to 24 hours.") },
  "met-14": { 11: D,
              14: K("Air from a low-latitude sea is tropical maritime — warm and moist."),
              16: K("Western Disturbances are most frequent in the winter season."),
              19: K("A lowering Ci–Cs–As–St cloud sequence marks an approaching warm front.") },
  "met-15": { 8: D, 9: D, 21: D },
  "met-18": { 1: D, 34: D },
  "met-19": { 20: D, 21: D },
  "met-20": { 22: D, 23: D, 26: D, 28: D, 29: D },
  "met-21": { 2: K("WAFS provides high-quality en-route wind and temperature forecasts."),
              4: D, 5: D,
              18: K("GAMET is an area forecast in abbreviated plain language for low-level flights."),
              19: D },
};

let dropped = 0, resolved = 0, leftover = [];
for (const c of wf) {
  c.questions.forEach((q, i) => {
    if (q.status !== "FLAG") return;
    if (dropAllFlagsIn.has(c.cid)) { q.status = "DROP"; dropped++; return; }
    const dec = perIndex[c.cid]?.[i];
    if (!dec) { leftover.push(`${c.cid} idx${i}: ${q.q}`); return; }
    if (dec.status === "DROP") { q.status = "DROP"; dropped++; }
    else { q.status = dec.status; q.cite = dec.cite; resolved++; }
  });
}
fs.writeFileSync("tools/met-verify/wf-verified.json", JSON.stringify(wf, null, 1));
console.log(`WF flags resolved: ${resolved} kept-as-verified, ${dropped} dropped`);
if (leftover.length) { console.log("!! UNHANDLED flags:"); leftover.forEach(l => console.log("   " + l)); }
else console.log("all WF flags handled.");
