// Dump the CURRENT live (deduped) questions for every not-yet-verified met
// chapter, so each workflow agent gets a clean self-contained task.
import fs from "node:fs";
const grab=f=>{const t=fs.readFileSync(f,"utf8");const m=t.match(/=\s*(\[[\s\S]*\]);/);return m?eval(m[1]):[]};
const tv=fs.readFileSync("lib/generated/met-verified.ts","utf8");
const DONE=new Set(JSON.parse(tv.match(/VERIFIED_MET_CHAPTERS = new Set\((\[[^\]]*\])\)/)[1]));
const notes=grab("lib/generated/icjoshi-notes-met.ts");
const font=grab("lib/generated/icjoshi-met.ts");
const demo=grab("lib/demo-questions.ts");
const RAW=[...demo,...notes,...font];
const key=q=>q.q.toLowerCase().replace(/[^a-z0-9]/g,"").slice(0,100);
const seen=new Set(),ALL=[];for(const q of RAW){const k=key(q);if(k.length<10||seen.has(k))continue;seen.add(k);ALL.push(q)}
const TOPICS={ "met-9":"Stability","met-11":"Precipitation","met-12":"Ice Accretion","met-13":"Thunderstorm",
"met-14":"Air Masses, Fronts & Western Disturbances","met-15":"Jet Streams","met-16":"Clear Air Turbulence (CAT)",
"met-17":"Mountain Waves","met-18":"Tropical Systems","met-19":"Climatology of India","met-20":"General Circulation",
"met-21":"Meteorological Services","met-22":"Weather Radar & Satellites","met-23":"Meteorological Instruments",
"met-24":"Station Model","met-25":"METAR / SPECI / TREND","met-26":"TAF / ARFOR / ROFOR",
"met-27":"Radar Report / SIGMET","met-28":"Met Documentation & Briefing","met-29":"Flight Forecast"};
const out={};
for(const cid of Object.keys(TOPICS)){
  if(DONE.has(cid))continue;
  const qs=ALL.filter(q=>q.chapterId===cid&&(q.subjectIds||[]).includes("meteorology"))
    .map(q=>({q:q.q,opts:q.opts,liveAns:q.ans}));
  if(qs.length) out[cid]={topic:TOPICS[cid],questions:qs};
}
fs.writeFileSync("tools/met-verify/remaining-chapters.json",JSON.stringify(out,null,1));
console.log("Remaining chapters to verify:");
let tot=0;for(const[c,v]of Object.entries(out)){console.log(`  ${c.padEnd(8)} ${String(v.questions.length).padStart(3)} Q  ${v.topic}`);tot+=v.questions.length}
console.log(`Total: ${Object.keys(out).length} chapters, ${tot} questions`);
