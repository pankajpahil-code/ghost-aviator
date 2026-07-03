// Full review sheet across all 27 verified met chapters (hand-authored ch1-10 +
// workflow ch9,11-28) with status + internal citation, plus a flag/override list.
import fs from "node:fs";
const L = "ABCD";
const esc = s => `"${String(s).replace(/"/g, '""')}"`;
const rows = [["Chapter","No","Question","A","B","C","D","Correct","Status","Verification / Note"]];
const flags = [];
let total = 0, corr = 0, tfix = 0, flag = 0, drop = 0;

const push = (cid, topic, arr) => {
  arr.forEach((q, i) => {
    total++;
    if (q.status === "CORRECTED") corr++;
    if (q.status === "TEXT-FIX") tfix++;
    if (q.status === "DROP") { drop++; return; }
    if (/FLAG/.test(q.status)) { flag++; flags.push(`${cid} · ${q.q}  →  ${L[q.ans]}) ${q.opts[q.ans]}`); }
    const o = [0,1,2,3].map(k => q.opts[k] ?? "");
    rows.push([`${cid} ${topic}`, i+1, q.q, ...o, `${L[q.ans]}) ${q.opts[q.ans]}`, q.status, q.cite]);
  });
};

// hand-authored chapters
const hand = [["met-1","Atmosphere","./ch1-atmosphere.mjs","CH1"],["met-2","Pressure","./ch2-pressure.mjs","CH2"],
["met-3","Temperature","./ch3-temperature.mjs","CH3"],["met-4","Air Density","./ch4-density.mjs","CH4"],
["met-5","Humidity","./ch5-humidity.mjs","CH5"],["met-6","Wind","./ch6-wind.mjs","CH6"],
["met-7","Visibility & Fog","./ch7-visibility.mjs","CH7"],["met-8","Clouds/Stability","./ch8-clouds.mjs","CH8"],
["met-10","Optical Phenomena","./ch10-optical.mjs","CH10"]];
for (const [cid, topic, m, ex] of hand) push(cid, topic, (await import(m))[ex]);

// workflow chapters
const wf = JSON.parse(fs.readFileSync("tools/met-verify/wf-verified.json","utf8"));
for (const c of wf) push(c.cid, c.topic, c.questions);

fs.writeFileSync("tools/met-verify/met-review.csv", rows.map(r => r.map(esc).join(",")).join("\r\n"), "utf8");
fs.writeFileSync("tools/met-verify/FLAGS-to-review.txt",
  `MET VERIFICATION — ${flags.length} flagged questions for Capt. Pankaj's ruling\n` +
  `(each has a best-supported answer applied and live; change any you disagree with)\n\n` +
  flags.map((f,i) => `${i+1}. ${f}`).join("\n"), "utf8");
console.log(`Review sheet: ${total} questions across 27 chapters`);
console.log(`  ${corr} corrected | ${tfix} text-fixed | ${flag} flagged | ${drop} dropped`);
console.log(`Wrote met-review.csv + FLAGS-to-review.txt`);
