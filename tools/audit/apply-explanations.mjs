// Replace placeholder explanations in the Air Regulations bank with verified ones.
//
//   node tools/audit/apply-explanations.mjs            # dry run, reports only
//   node tools/audit/apply-explanations.mjs --write    # actually writes
//
// SAFETY. This tool may only ever touch the `exp` field. It refuses to run if a
// target question's correct-option TEXT is not exactly what the explanation was
// written against — because an explanation that teaches the reasoning for option
// C is actively harmful if the bank has since been repaired and C is now
// something else. Matching on the answer TEXT, not the `ans` index, is the same
// discipline verify-repair.mjs applies, and for the same reason.
//
// After running, `node tools/audit/verify-repair.mjs` should still pass: this
// tool changes no stem, no option and no answer index.
import fs from "node:fs";
import { AR5_EXPLANATIONS } from "./explanations-ar-5.mjs";

const FILE = "lib/rk-bali-regulations-questions.ts";
const WRITE = process.argv.includes("--write");

const BLOCK = /\{\s*subjectIds:\s*\[([^\]]*)\],\s*chapterId:\s*"([^"]*)",\s*q:\s*`([\s\S]*?)`,\s*opts:\s*\[([\s\S]*?)\],\s*ans:\s*(\d+),\s*exp:\s*`([\s\S]*?)`,?\s*\}/g;

const key = s => s.replace(/^(?:Q\s*\.?\s*)?\d{1,3}\s*R?\s*[.)]\s+/, "")
  .toLowerCase().replace(/\s+/g, " ").trim();

const wanted = new Map(AR5_EXPLANATIONS.map(e => [key(e.stem), e]));

const original = fs.readFileSync(FILE, "utf8");
let applied = 0, skippedAlready = 0;
const problems = [];
const hit = new Set();

const updated = original.replace(BLOCK, (block, subjects, chapterId, q, optsRaw, ans, exp) => {
  const e = wanted.get(key(q));
  if (!e) return block;

  const opts = [...optsRaw.matchAll(/`([\s\S]*?)`/g)].map(x => x[1]);
  const answerText = opts[Number(ans)];

  // The guard that matters: is the correct option still the one this
  // explanation was reasoned against?
  if (answerText !== e.expect) {
    problems.push(
      `ANSWER TEXT MISMATCH — refusing to write\n` +
      `   Q:        ${q.slice(0, 80)}\n` +
      `   expected: ${JSON.stringify(e.expect)}\n` +
      `   actual:   ${JSON.stringify(answerText)}`
    );
    return block;
  }

  hit.add(key(e.stem));
  if (!/^Correct answer:/.test(exp.trim())) { skippedAlready++; return block; }

  applied++;
  const withCite = `${e.exp}\n\nReference: ${e.cite}`;
  return block.replace(/exp:\s*`[\s\S]*?`,?\s*\}$/, "exp: `" + withCite + "`,\n  }");
});

for (const [k, e] of wanted) {
  if (!hit.has(k)) problems.push(`NOT FOUND IN BANK: ${e.stem.slice(0, 80)}`);
}

console.log(`explanations defined:      ${wanted.size}`);
console.log(`matched + applied:         ${applied}`);
console.log(`already had a real answer: ${skippedAlready}`);
console.log(`problems:                  ${problems.length}   <-- must be 0`);
if (problems.length) {
  console.log("\n--- problems ---");
  problems.forEach(p => console.log(p));
}

if (problems.length) process.exit(1);

if (WRITE) {
  fs.writeFileSync(FILE, updated, "utf8");
  console.log(`\nWROTE ${FILE}`);
} else {
  console.log(`\ndry run — pass --write to apply`);
}
