// Step 1 — mechanical repair of structural defects in the Air Regulations bank.
//
//   node tools/audit/repair-air-regs.mjs --dry     (report only, default)
//   node tools/audit/repair-air-regs.mjs --write   (rewrite the bank)
//
// SCOPE, deliberately narrow. This script repairs how a question is PRINTED.
// It never changes which option is correct:
//   1. strip a leaked question-number prefix from the stem ("Q45. ", "34. ")
//   2. remove the placeholder 4th option "(no option d)"  -- verified below to
//      never be the marked answer, and always at index 3, so indices 0..2 (and
//      therefore `ans`) cannot shift
//   3. drop questions whose option set was irrecoverably split by the original
//      extractor -- these are listed explicitly by content hash, never by a
//      pattern, so this script cannot widen its own blast radius on a re-run
//   4. two named text repairs where the intended wording is unambiguous
//
// Anything dropped is written to tools/audit/dropped-air-regs.json so no
// content is lost, and the Captain can re-author them from the source later.

import fs from "node:fs";

const FILE = "lib/rk-bali-regulations-questions.ts";
const write = process.argv.includes("--write");

const src = fs.readFileSync(FILE, "utf8");
const header = src.slice(0, src.indexOf("export const"));

const items = [];
const re = /\{\s*subjectIds:\s*\[([^\]]*)\],\s*chapterId:\s*"([^"]*)",\s*q:\s*`([\s\S]*?)`,\s*opts:\s*\[([\s\S]*?)\],\s*ans:\s*(\d+),\s*exp:\s*`([\s\S]*?)`,?\s*\}/g;
let m;
while ((m = re.exec(src))) {
  items.push({
    subjectIds: [...m[1].matchAll(/"([^"]*)"/g)].map(x => x[1]),
    chapterId: m[2],
    q: m[3],
    opts: [...m[4].matchAll(/`([\s\S]*?)`/g)].map(x => x[1]),
    ans: Number(m[5]),
    exp: m[6],
  });
}
if (items.length === 0) { console.error("parsed 0 questions — aborting"); process.exit(1); }
console.log(`parsed ${items.length} questions`);

// --- the 12 irrecoverably-split questions, identified by their exact stem ---
// Each was read individually (see air-regs-triage-2026-07-27.md). In every one
// the option list is fragments of a single sentence, so no answer can be
// awarded honestly. Two of them (#182, #579) even have the marked answer set to
// a piece of the question text.
const DROP_STEMS = new Set([
  "Class ‘D’ airspace in",
  "Class ‘G’ airspace in",
  "Q40. When landing behind a large aircraft, which procedure should be followed for vortex",
  "The sensations which lead to spatial disorientation during instrument flight conditions: are frequently encountered by beginning instrument pilot, but never by pilots with moderate instrument experience.",
  "RVSM is:",
  "RVR for a runway filed by an operator is 500m. Threshold RVR is reported",
  "State aircraft includes:",
  "For landing minima considerations, following values out of the multiple RVR values are taken into account.",
  "Q49. Black bars on a white dumbbell means:",
  "A white dumbbell with a black bar spaced perpendicularly indicates",
  "RVR minima filed at 550m, reported touch down RVR 800, weather conditions are;",
  "Aircraft meets with an accident on runway, its wreckage can be removed:",
]);

const isPlaceholder = o => /^\(no option [a-d]\)$/i.test(o.trim());
const PREFIX = /^(?:Q\s*\.?\s*)?\d{1,3}\s*[.)]\s+(?=[A-Za-z‘'"(])/;

const stats = { prefix: 0, placeholder: 0, dropped: 0, named: 0 };
const dropped = [];
const kept = [];

for (const it of items) {
  if (DROP_STEMS.has(it.q.trim())) { dropped.push(it); stats.dropped++; continue; }

  // 1. leaked question-number prefix
  const before = it.q;
  it.q = it.q.replace(PREFIX, "");
  if (it.q !== before) stats.prefix++;

  // 2. placeholder option — assert it can never be the answer before removing
  const phIdx = it.opts.findIndex(isPlaceholder);
  if (phIdx !== -1) {
    if (phIdx === it.ans) {
      console.error(`ABORT: placeholder option is the marked answer -> "${it.q.slice(0, 60)}"`);
      process.exit(1);
    }
    if (phIdx < it.ans) {
      console.error(`ABORT: removing option ${phIdx} would shift ans ${it.ans} -> "${it.q.slice(0, 60)}"`);
      process.exit(1);
    }
    it.opts = it.opts.filter(o => !isPlaceholder(o));
    stats.placeholder++;
  }

  // 4. named text repairs (unambiguous wording, answer untouched)
  if (/ETOPS stands for/i.test(it.q)) {
    const k = it.opts.findIndex(o => /^for Twin Engine Operations$/i.test(o.trim()));
    if (k !== -1) { it.opts[k] = "Extended-range Twin-engine Operations"; stats.named++; }
  }
  if (/^Flight plan must be filed/i.test(it.q)) {
    const k = it.opts.findIndex(o => /only:$/.test(o.trim()));
    if (k !== -1) { it.opts[k] = it.opts[k].replace(/:\s*$/, ""); stats.named++; }
  }

  kept.push(it);
}

console.log(`\nprefixes stripped:        ${stats.prefix}`);
console.log(`placeholder opts removed: ${stats.placeholder}`);
console.log(`named text repairs:       ${stats.named}`);
console.log(`questions dropped:        ${stats.dropped}`);
console.log(`kept:                     ${kept.length}`);

if (stats.dropped !== DROP_STEMS.size) {
  console.warn(`\nNOTE: ${DROP_STEMS.size} stems listed but ${stats.dropped} matched — a listed stem may appear more than once, or not at all.`);
}

if (!write) { console.log("\n(dry run — pass --write to apply)"); process.exit(0); }

const esc = s => s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
const body = kept.map(it => `  {
    subjectIds: [${it.subjectIds.map(s => `"${s}"`).join(", ")}],
    chapterId: "${it.chapterId}",
    q: \`${esc(it.q)}\`,
    opts: [
${it.opts.map(o => `      \`${esc(o)}\`,`).join("\n")}
    ],
    ans: ${it.ans},
    exp: \`${esc(it.exp)}\`,
  },`).join("\n");

const outHeader = header.replace(/\/\/ Total questions: \d+/, `// Total questions: ${kept.length}`);
fs.writeFileSync(FILE, `${outHeader}export const RK_BALI_REGULATIONS_QUESTIONS: DemoQuestion[] = [\n${body}\n];\n`, "utf8");
fs.writeFileSync("tools/audit/dropped-air-regs.json", JSON.stringify(dropped, null, 1), "utf8");
console.log(`\nwrote ${FILE} (${kept.length} questions) and tools/audit/dropped-air-regs.json (${dropped.length})`);
