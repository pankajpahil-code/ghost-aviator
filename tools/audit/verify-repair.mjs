// Proof that the mechanical repair changed only PRESENTATION, never grading.
//
//   node tools/audit/verify-repair.mjs
//
// Compares the working-tree bank against the committed one and asserts, for
// every question that survived, that THE TEXT OF THE CORRECT OPTION IS
// BYTE-IDENTICAL. Comparing the `ans` index alone would be worthless — the
// whole risk of removing an option is that an index silently points somewhere
// new. Comparing the answer TEXT is the assertion that actually matters.
import { execSync } from "node:child_process";
import fs from "node:fs";

const FILE = "lib/rk-bali-regulations-questions.ts";
const RE = /\{\s*subjectIds:\s*\[([^\]]*)\],\s*chapterId:\s*"([^"]*)",\s*q:\s*`([\s\S]*?)`,\s*opts:\s*\[([\s\S]*?)\],\s*ans:\s*(\d+),\s*exp:\s*`([\s\S]*?)`,?\s*\}/g;

function parse(text) {
  const out = [];
  let m;
  const re = new RegExp(RE.source, "g");
  while ((m = re.exec(text))) {
    const opts = [...m[4].matchAll(/`([\s\S]*?)`/g)].map(x => x[1]);
    out.push({ chapterId: m[2], q: m[3], opts, ans: Number(m[5]) });
  }
  return out;
}

// Normalised key: strip a leaked number prefix so old and new stems match.
const key = q => q
  .replace(/^(?:Q\s*\.?\s*)?\d{1,3}\s*[.)]\s+/, "")
  .toLowerCase().replace(/\s+/g, " ").trim();

// Answer-text changes that were made ON PURPOSE, declared here so they are
// visible rather than silently tolerated. Anything not on this list is a bug.
// ETOPS: the source option was the truncated fragment "for Twin Engine
// Operations"; it now reads the standard expansion. Same option, same letter,
// still the correct answer — only the wording was completed.
const INTENTIONAL = [
  { was: "for Twin Engine Operations", now: "Extended-range Twin-engine Operations" },
  // 2026-07-27, cabin-crew question (250 seats, 136 passengers). The bank marked
  // "6"; corrected to "5" on Capt. Pahil's ruling that the count is on SEATS and
  // on the scale he supplied: 2 crew from 100 seats, plus one per 50-seat unit
  // above 100 -> 250-100 = 150 = 3 units -> 5. This is a deliberate ANSWER-KEY
  // change, the only one in this audit, and it is recorded here so it can never
  // pass as an accident.
  { was: "6", now: "5" },
];
const declared = (was, now) => INTENTIONAL.some(i => i.was === was && i.now === now);

const oldText = execSync(`git show HEAD:${FILE}`, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const before = parse(oldText);
const after = parse(fs.readFileSync(FILE, "utf8"));

console.log(`before: ${before.length}   after: ${after.length}   removed: ${before.length - after.length}`);

// Old questions can share a stem (the bank has duplicates), so bucket them.
const oldByKey = new Map();
for (const b of before) {
  const k = key(b.q);
  if (!oldByKey.has(k)) oldByKey.set(k, []);
  oldByKey.get(k).push(b);
}

let checked = 0, missing = 0, changed = 0, optsShrunk = 0, intentional = 0;
const problems = [];
for (const a of after) {
  const bucket = oldByKey.get(key(a.q));
  if (!bucket || !bucket.length) { missing++; problems.push(`NO MATCH: ${a.q.slice(0, 70)}`); continue; }
  // Any old copy whose correct-answer text matches counts as preserved.
  const aAnsText = a.opts[a.ans];
  const ok = bucket.some(b => b.opts[b.ans] === aAnsText);
  checked++;
  if (!ok) {
    const b = bucket[0];
    if (declared(b.opts[b.ans], aAnsText)) {
      intentional++;
    } else {
      changed++;
      problems.push(`ANSWER TEXT CHANGED\n   Q: ${a.q.slice(0, 70)}\n   was: ${JSON.stringify(b.opts[b.ans])}\n   now: ${JSON.stringify(aAnsText)}`);
    }
  }
  if (bucket.some(b => b.opts.length > a.opts.length)) optsShrunk++;
}

console.log(`\nchecked:                       ${checked}`);
console.log(`correct-answer text preserved: ${checked - changed - intentional}`);
console.log(`declared intentional rewords:  ${intentional}   (see INTENTIONAL in this file)`);
console.log(`UNDECLARED ANSWER CHANGES:     ${changed}   <-- must be 0`);
console.log(`unmatched after repair:        ${missing}   <-- must be 0`);
console.log(`questions with fewer options:  ${optsShrunk}  (expected ~70, the placeholder removals)`);

if (problems.length) {
  console.log(`\n--- problems ---`);
  problems.slice(0, 20).forEach(p => console.log(p));
}
process.exit(changed === 0 && missing === 0 ? 0 : 1);
