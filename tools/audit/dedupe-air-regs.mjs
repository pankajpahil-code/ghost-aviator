// Step 2 — remove redundant copies, and stop the bank contradicting itself.
//
//   node tools/audit/dedupe-air-regs.mjs --dry | --write
//
// Two separate problems were found by grouping questions on (stem + option set):
//
//  A. REDUNDANT COPIES — same stem, same options, same correct answer. Pure
//     duplication. Keep the first, drop the rest. Nothing is lost.
//
//  B. CONTRADICTIONS — same stem, SAME OPTIONS, but a DIFFERENT option marked
//     correct. The bank teaches two different answers to one question, so at
//     least one copy is wrong and a student meeting both is actively misled.
//     Four are resolved here against ICAO/doctrine and cited below. The other
//     six could not be settled without an Indian CAR/AIP source, so BOTH copies
//     are quarantined rather than a coin being tossed — Iron Rule 1 says drop,
//     never guess. They come back the moment the Captain rules.

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
if (!items.length) { console.error("parsed 0 questions — aborting"); process.exit(1); }
console.log(`parsed ${items.length}`);

const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// ---- B1: contradictions resolved on doctrine, with the reason recorded ----
// Each entry: match the stem, force the correct answer to the option whose
// normalised text matches `answer`, and give the question a real explanation.
const RESOLVED = [
  {
    stemHas: "information about facilities on an aerodrome",
    answer: "aip",
    exp: "Aerodrome facilities are published in the AIP — the Aeronautical Information Publication, whose AD section carries aerodrome data. An AIRAC is not a document at all: it is the fixed calendar of effective dates on which amendments are brought into force. Elsewhere in this bank the same fact appears as \"Aerodrome data and facilities are given in: AIP\", and danger areas likewise sit in the AIP.",
  },
  {
    stemHas: "overtake aircraft whether climbing",
    answer: "by altering the heading to the right",
    exp: "The aircraft being overtaken has right of way. The overtaking aircraft must keep out of the way by altering its heading to the RIGHT, and must go on doing so until it is entirely clear — changing speed is not an accepted method of avoidance, because it does not guarantee lateral separation.",
  },
  {
    stemHas: "flight time  means",
    answer: "the total time from when an aircraft first moves under its own power for the purpose of taking off until it comes to rest after the flight",
    exp: "Flight time for an aeroplane is block time: from the moment it first moves for the purpose of taking off, until it finally comes to rest at the end of the flight. It is not merely airborne time (take-off to landing), and no fixed padding is added to it.",
  },
  {
    stemHas: "within a control zone the air traffic control is provided by",
    answer: "approach control",
    exp: "A control zone surrounds an aerodrome and extends upward from the surface, so it is served by the aerodrome tower and by approach control for arriving and departing traffic. Area control is what it cannot be: an area control centre serves control areas and airways en route, not the zone around an aerodrome.",
  },
];

// ---- B2: contradictions that need an Indian source — quarantine BOTH copies ----
const QUARANTINE_STEMS = [
  "photography at an aerodrome can be done with prior permission in writing from",
  "while refueling is in progress no naked light be brought within",
  "dropping of paper leaf lets require the permission of",
  "flight navigator shall be carried",
  "approach control service is provided with in",
  "in imc on a route where reporting points are not given",
];
const quarantined = (q) => QUARANTINE_STEMS.some(s => norm(q).startsWith(s));

let resolvedCount = 0;
for (const it of items) {
  const r = RESOLVED.find(x => norm(it.q).includes(norm(x.stemHas)));
  if (!r) continue;
  const k = it.opts.findIndex(o => norm(o) === norm(r.answer));
  if (k === -1) continue;
  if (it.ans !== k) resolvedCount++;
  it.ans = k;
  it.exp = r.exp;
}

const dropped = [];
const kept = [];
const seen = new Set();
let dupes = 0;
for (const it of items) {
  if (quarantined(it.q)) { dropped.push({ reason: "contradiction-unresolved", ...it }); continue; }
  // chapterId is part of the key on purpose: questions are served per chapter,
  // so the same question listed under two chapters is serving two different
  // practice sets. Only redundancy WITHIN a chapter is true duplication.
  const key = it.chapterId + "||" + norm(it.q) + "||" + JSON.stringify([...it.opts].map(norm).sort()) + "||" + norm(it.opts[it.ans] ?? "");
  if (seen.has(key)) { dupes++; dropped.push({ reason: "duplicate", ...it }); continue; }
  seen.add(key);
  kept.push(it);
}

console.log(`\ncontradictions resolved on doctrine: ${resolvedCount} copies re-keyed`);
console.log(`quarantined (unresolved contradictions): ${dropped.filter(d => d.reason === "contradiction-unresolved").length}`);
console.log(`redundant copies removed:                ${dupes}`);
console.log(`kept:                                    ${kept.length}`);

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

fs.writeFileSync(FILE, `${header.replace(/\/\/ Total questions: \d+/, `// Total questions: ${kept.length}`)}export const RK_BALI_REGULATIONS_QUESTIONS: DemoQuestion[] = [\n${body}\n];\n`, "utf8");
const prev = fs.existsSync("tools/audit/dropped-air-regs.json")
  ? JSON.parse(fs.readFileSync("tools/audit/dropped-air-regs.json", "utf8")) : [];
fs.writeFileSync("tools/audit/dropped-air-regs.json", JSON.stringify([...prev, ...dropped], null, 1), "utf8");
console.log(`\nwrote ${FILE} (${kept.length}) and appended ${dropped.length} to tools/audit/dropped-air-regs.json`);
