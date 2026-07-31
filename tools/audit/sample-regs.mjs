// Draw a reproducible random sample from the Air Regulations bank, and report
// structural health of the whole bank. Seeded so the Captain (or a second
// auditor) can redraw the identical sample and check my work.
import fs from "node:fs";

const src = fs.readFileSync("lib/rk-bali-regulations-questions.ts", "utf8");

// Parse the object literals without importing TS.
const items = [];
const re = /\{\s*subjectIds:\s*\[([^\]]*)\],\s*chapterId:\s*"([^"]*)",\s*q:\s*`([\s\S]*?)`,\s*opts:\s*\[([\s\S]*?)\],\s*ans:\s*(\d+),\s*exp:\s*`([\s\S]*?)`,?\s*\}/g;
let m;
while ((m = re.exec(src))) {
  const opts = [...m[4].matchAll(/`([\s\S]*?)`/g)].map(x => x[1]);
  items.push({ chapterId: m[2], q: m[3].trim(), opts, ans: Number(m[5]), exp: m[6].trim() });
}

console.log(`parsed ${items.length} questions`);

// ---- whole-bank structural health (cheap, exhaustive, no judgement needed) ----
const placeholderExp = items.filter(i => /^Correct answer:\s*[A-D]\.?$/i.test(i.exp)).length;
const emptyExp = items.filter(i => !i.exp).length;
const badAns = items.filter(i => !(i.ans >= 0 && i.ans < i.opts.length)).length;
const notFour = items.filter(i => i.opts.length !== 4).length;
const dupOpts = items.filter(i => new Set(i.opts.map(o => o.trim().toLowerCase())).size !== i.opts.length).length;
const emptyOpt = items.filter(i => i.opts.some(o => !o.trim())).length;
const qSeen = new Map();
for (const i of items) {
  const k = i.q.toLowerCase().replace(/\s+/g, " ").trim();
  qSeen.set(k, (qSeen.get(k) ?? 0) + 1);
}
const dupQ = [...qSeen.values()].filter(n => n > 1).length;
const allOfAbove = items.filter(i => i.opts.some(o => /all of the above|none of the above/i.test(o))).length;

console.log("\n=== WHOLE-BANK STRUCTURAL HEALTH (all 946) ===");
console.log(`placeholder explanations ("Correct answer: X"): ${placeholderExp}  (${(placeholderExp/items.length*100).toFixed(1)}%)`);
console.log(`empty explanations:                              ${emptyExp}`);
console.log(`ans index out of range:                          ${badAns}`);
console.log(`not exactly 4 options:                           ${notFour}`);
console.log(`duplicate options within a question:             ${dupOpts}`);
console.log(`blank option text:                               ${emptyOpt}`);
console.log(`duplicate question stems (distinct texts dupd):  ${dupQ}`);
console.log(`questions using all/none-of-the-above:           ${allOfAbove}`);

// ---- seeded sample ----
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = 20260727;
const rand = mulberry32(SEED);
const idx = items.map((_, i) => i);
for (let i = idx.length - 1; i > 0; i--) {
  const j = Math.floor(rand() * (i + 1));
  [idx[i], idx[j]] = [idx[j], idx[i]];
}
const sample = idx.slice(0, 50).sort((a, b) => a - b);

console.log(`\n=== SAMPLE (seed ${SEED}, n=50) ===`);
const out = [];
for (const i of sample) {
  const it = items[i];
  out.push({ i, ...it });
  console.log(`\n[#${i}] ${it.chapterId}`);
  console.log(`Q: ${it.q}`);
  it.opts.forEach((o, k) => console.log(`   ${"ABCD"[k]}${k === it.ans ? " <== marked" : "  "} ${o}`));
}
fs.writeFileSync("tools/audit/sample-regs.json", JSON.stringify(out, null, 1));
console.log("\nwrote tools/audit/sample-regs.json");
