import fs from "node:fs";
const mods=[["met-1 Atmosphere","./ch1-atmosphere.mjs","CH1"],["met-2 Pressure","./ch2-pressure.mjs","CH2"],
["met-3 Temperature","./ch3-temperature.mjs","CH3"],["met-4 Air Density","./ch4-density.mjs","CH4"],
["met-5 Humidity","./ch5-humidity.mjs","CH5"],["met-6 Wind","./ch6-wind.mjs","CH6"],
["met-7 Visibility & Fog","./ch7-visibility.mjs","CH7"],
["met-8 Vertical Motion & Clouds","./ch8-clouds.mjs","CH8"],
["met-10 Optical Phenomena","./ch10-optical.mjs","CH10"]];
const L="ABCD"; const esc=s=>`"${String(s).replace(/"/g,'""')}"`;
const rows=[["Chapter","No","Source","Question","A","B","C","D","Correct","Status","Verification / Citation"]];
let total=0,corr=0,flags=0;
for(const[ch,m,ex]of mods){ const arr=(await import(m))[ex];
  arr.forEach((q,i)=>{ total++; if(q.status==="CORRECTED")corr++; if(/FLAG/.test(q.status))flags++;
    const o=[0,1,2,3].map(k=>q.opts[k]??"");
    rows.push([ch,i+1,q.src==="IC"?"IC Joshi":"Oxford/CAE",q.q,...o,L[q.ans]+") "+q.opts[q.ans],q.status,q.cite]); }); }
fs.writeFileSync("tools/met-verify/met-review.csv", rows.map(r=>r.map(esc).join(",")).join("\r\n"),"utf8");
console.log(`Review sheet: ${total} Qs across ${mods.length} chapters | ${corr} corrected | ${flags} flagged`);
