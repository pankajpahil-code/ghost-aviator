// Writes the 2026-11-03 explanations into corrections.json.
//   node tools/previous-questions/apply-explanations-2026-11-03.mjs          (dry run)
//   node tools/previous-questions/apply-explanations-2026-11-03.mjs --write
// Refuses any uid that is not an existing "explanation only" correction (has exp, no now),
// so it can never re-key a question or touch a ruling that is still open.
import fs from "node:fs";
import path from "node:path";

const HERE = path.join(process.cwd(), "tools", "previous-questions");
const file = path.join(HERE, "corrections.json");
const data = JSON.parse(fs.readFileSync(file, "utf8"));
const add = JSON.parse(fs.readFileSync(path.join(HERE, "explanations-2026-11-03.json"), "utf8")).entries;

let changed = 0;
const bad = [];
for (const [uid, e] of Object.entries(add)) {
  const c = data.corrections[uid];
  if (!c) { bad.push(`${uid}: no correction entry`); continue; }
  if (c.now !== undefined || c.hide) { bad.push(`${uid}: entry re-keys or hides the question`); continue; }
  if (typeof c.exp !== "string" || !c.exp.startsWith("The correct answer is:")) { bad.push(`${uid}: explanation already replaced`); continue; }
  c.exp = e.exp;
  c.why = "Key right; old explanation found wrong by the independent check. New explanation written 2026-11-03 and checked against the source recorded in explanations-2026-11-03.json. Not yet independently audited.";
  changed++;
}
if (bad.length) { console.error("REFUSED:\n  " + bad.join("\n  ")); process.exit(1); }
const left = Object.values(data.corrections).filter(c => typeof c.exp === "string" && c.exp.startsWith("The correct answer is:")).length;
console.log(`${changed} explanations ready; placeholders left after this: ${left}`);
if (process.argv.includes("--write")) {
  // Same layout as the file already uses (1-space indent, CRLF, no final newline), proved by round trip.
  fs.writeFileSync(file, JSON.stringify(data, null, 1).replace(/\n/g, "\r\n"), "utf8");
  console.log("written");
}
