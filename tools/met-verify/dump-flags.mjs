import fs from "node:fs";
const L = "ABCD";
let out = [], n = 0;
// hand-authored ch1-10
const hand = [["met-1","./ch1-atmosphere.mjs","CH1"],["met-2","./ch2-pressure.mjs","CH2"],
["met-3","./ch3-temperature.mjs","CH3"],["met-4","./ch4-density.mjs","CH4"],["met-5","./ch5-humidity.mjs","CH5"],
["met-6","./ch6-wind.mjs","CH6"],["met-7","./ch7-visibility.mjs","CH7"],["met-8","./ch8-clouds.mjs","CH8"],
["met-10","./ch10-optical.mjs","CH10"]];
for (const [cid, m, ex] of hand) {
  const arr = (await import(m))[ex];
  arr.forEach((q, i) => { if (/FLAG/.test(q.status)) { n++;
    out.push(`\n#${n} [${cid} HAND idx ${i}] ${q.q}`);
    q.opts.forEach((o,k)=>out.push(`     ${k===q.ans?">>":"  "} ${L[k]}) ${o}`));
    out.push(`     cite: ${q.cite}`);
  }});
}
// workflow ch9,11-28
const wf = JSON.parse(fs.readFileSync("tools/met-verify/wf-verified.json","utf8"));
for (const c of wf) c.questions.forEach((q,i)=>{ if(q.status==="FLAG"){ n++;
  out.push(`\n#${n} [${c.cid} WF idx ${i}] ${q.q}`);
  q.opts.forEach((o,k)=>out.push(`     ${k===q.ans?">>":"  "} ${L[k]}) ${o}`));
  out.push(`     cite: ${q.cite}`);
}});
console.log(out.join("\n"));
console.log(`\n\nTOTAL FLAGS: ${n}`);
