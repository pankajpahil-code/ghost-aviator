import fs from "node:fs";
const wf = JSON.parse(fs.readFileSync("tools/met-verify/wf-verified.json", "utf8"));
const L = "ABCD";
const show = (c, q) => `[${c.cid}] ${q.q}\n      → ${L[q.ans]}) ${q.opts[q.ans]}  ::  ${q.cite}`;
console.log("========== CORRECTED (answer changed by examiner) ==========");
for (const c of wf) for (const q of c.questions) if (q.status === "CORRECTED") console.log(show(c, q));
console.log("\n========== DROPPED (broken) ==========");
for (const c of wf) for (const q of c.questions) if (q.status === "DROP") console.log(`[${c.cid}] ${q.q}  :: ${q.cite}`);
console.log("\n========== AUDITOR DISPUTES (2nd reviewer disagreed → flagged) ==========");
for (const c of wf) for (const q of c.questions) if (/2nd reviewer/.test(q.cite)) console.log(show(c, q));
console.log("\n========== FLAG sample (first 20 non-dispute flags) ==========");
let n = 0;
for (const c of wf) for (const q of c.questions)
  if (q.status === "FLAG" && !/2nd reviewer/.test(q.cite) && n++ < 20) console.log(show(c, q));
