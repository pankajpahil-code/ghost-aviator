import fs from "node:fs";
const OUT = "C:/Users/Admin/AppData/Local/Temp/claude/D--pk/f70566db-9c6e-4777-80da-51dcf2d9353a/tasks/w9bfjgrvg.output";
let t = fs.readFileSync(OUT, "utf8").trim();
let parsed;
try { parsed = JSON.parse(t); }
catch { const m = t.match(/\{[\s\S]*\}/); parsed = JSON.parse(m[0]); }
const data = Array.isArray(parsed) ? parsed : parsed.result;
console.log("chapters returned:", data.length);
let tot = 0, corr = 0, flag = 0, drop = 0, tfix = 0;
for (const c of data) {
  if (!c.questions) { console.log("  !! no questions:", c.cid); continue; }
  tot += c.questions.length;
  for (const q of c.questions) {
    if (q.status === "CORRECTED") corr++;
    if (q.status === "FLAG") flag++;
    if (q.status === "DROP") drop++;
    if (q.status === "TEXT-FIX") tfix++;
  }
  console.log(`  ${c.cid.padEnd(8)} ${String(c.questions.length).padStart(3)} Q  disputes:${c.disputeCount ?? "?"}  ${c.topic}`);
}
console.log(`TOTAL ${tot} Q | ${corr} corrected | ${tfix} text-fix | ${flag} flagged | ${drop} dropped`);
fs.writeFileSync("tools/met-verify/wf-verified.json", JSON.stringify(data, null, 1));
console.log("saved -> tools/met-verify/wf-verified.json");
