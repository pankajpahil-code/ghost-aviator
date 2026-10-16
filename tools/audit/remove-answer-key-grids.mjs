// tools/audit/remove-answer-key-grids.mjs
//
// One-time removal of the hardcoded "Answer Key" grids from the CPL Meteorology
// notes pages.
//
// WHY: those grids are stale copies of the textbook key, physically separated
// from the questions they answer. The verified answer lives inline with every
// question (✅ Answer: (x) in the Q&A blocks); the grids have drifted (met-13:
// 13 of 35 entries wrong against the verified bank). Capt. Pahil's ruling:
// remove every hardcoded key table; inline answers stay as the single visible
// source; future keys come from the question dataset only.
//
// SAFETY: every edit is verified against its block before ANYTHING is written:
//   - file must be BOM-less, pure CRLF (these files are generated that way)
//   - the block must contain its expected markers (headings, known content)
//   - <table>/<div> open/close counts must balance inside every removed block
//   - every heading inside a removed block must itself be an Answer-Key heading
//     (nothing but the key is ever swallowed)
// Removed text is quarantined to tools/audit/answer-key-archive/ (never lost).
// If any verification fails, NOTHING is written and the script exits 1.
//
// USAGE
//   node tools/audit/remove-answer-key-grids.mjs           dry run: verify + plan
//   node tools/audit/remove-answer-key-grids.mjs --apply   write changes + archive

import fs from "node:fs";
import path from "node:path";

const APPLY = process.argv.includes("--apply");
const NOTES = "public/content/meteorology";
const ARCHIVE_DIR = "tools/audit/answer-key-archive";
const ARCHIVE = path.join(ARCHIVE_DIR, "met-removed-grids-2026-10-17.json");

const DASH = "[\u2013\u2014-]"; // en dash / em dash / hyphen, as they appear

// kind: "remove"  delete lines [start..end] (1-based, inclusive)
//       "strip"   trim a trailing "Answers: ..." clause off line `start`
//       "css"     remove the .answer-grid CSS block found by search
const EDITS = [
  { file: "met-1",  kind: "remove", start: 1017, end: 1029, must: [new RegExp(`Answer Key \\u2014 Chapter 1 Questions \\(Q1${DASH}Q45\\)`), /<th>Q<\/th>/] },
  { file: "met-2",  kind: "remove", start: 749,  end: 763,  must: [/Q&amp;A Answer Key/, /<th>Q<\/th>/] },
  { file: "met-3",  kind: "remove", start: 823,  end: 836,  must: [/Q&amp;A Answer Key/, /<th>Q<\/th>/] },
  { file: "met-4",  kind: "css" },
  { file: "met-4",  kind: "strip",  start: 481,  stripRe: /\s*Answers?:\s*Q1=[^<]*/i, keep: /before revealing/ },
  { file: "met-4",  kind: "remove", start: 688,  end: 700,  must: [/11\.3 Answer Key/, /class="answer-grid"/] },
  { file: "met-5",  kind: "css" },
  { file: "met-5",  kind: "remove", start: 551,  end: 554,  must: [/Answer Key/, /Q1=b, Q2=c/] },
  { file: "met-5",  kind: "remove", start: 757,  end: 770,  must: [/11\.4 Answer Key/, /Q8 and Q9/] },
  { file: "met-6",  kind: "remove", start: 949,  end: 966,  must: [/Q&amp;A Answer Key/, /Q41=super-geo/] },
  { file: "met-7",  kind: "remove", start: 561,  end: 569,  must: [/Q&amp;A Answer Key/, /Q1=a/] },
  { file: "met-8",  kind: "remove", start: 522,  end: 527,  must: [/Answer Key \u2014 Q&amp;A Section/, /Answers from textbook Q1\u201320/] },
  { file: "met-9",  kind: "remove", start: 443,  end: 448,  must: [/Answer Key \u2014 Textbook Q&amp;A/, /Q14\u201320 answers from textbook/] },
  { file: "met-10", kind: "remove", start: 438,  end: 442,  must: [/Answer Key \u2014 Textbook Q&amp;A/] },
  { file: "met-11", kind: "remove", start: 406,  end: 410,  must: [/Answer Key \u2014 Textbook Q&amp;A/] },
  { file: "met-12", kind: "remove", start: 487,  end: 495,  must: [/<h3>Answer Key<\/h3>/] },
  { file: "met-13", kind: "remove", start: 899,  end: 909,  must: [/Answer Key \u2014 Chapter 13/] },
  { file: "met-14", kind: "remove", start: 713,  end: 724,  must: [/Answer Key \u2014 Chapter 14/] },
  { file: "met-15", kind: "remove", start: 558,  end: 569,  must: [/Answer Key \u2014 Chapter 15/, /discrepancies/] },
  { file: "met-16", kind: "remove", start: 271,  end: 275,  must: [/<h3>Answer Key<\/h3>/] },
  { file: "met-17", kind: "remove", start: 381,  end: 385,  must: [/Textbook Answer Key/] },
  { file: "met-18", kind: "remove", start: 501,  end: 509,  must: [/Textbook Answer Key/] },
  { file: "met-19", kind: "remove", start: 579,  end: 591,  must: [/Textbook Answer Key/] },
  { file: "met-20", kind: "remove", start: 358,  end: 362,  must: [/<h3>Answer Key<\/h3>/] },
  { file: "met-21", kind: "remove", start: 646,  end: 656,  must: [/<h3>Answer Key<\/h3>/] },
  { file: "met-24", kind: "remove", start: 571,  end: 578,  must: [/Answer Key \u2014 Q1 to Q20/] },
  { file: "met-25", kind: "remove", start: 709,  end: 721,  must: [/Answer Key Q1\u2013Q42/] },
  { file: "met-26", kind: "remove", start: 633,  end: 651,  must: [/TAF Answer Key/, /ROFOR Answer Key/] },
  { file: "met-28", kind: "strip",  start: 371,  stripRe: /\s*Answers?:\s*1-c[^<]*/i, keep: /Textbook practice questions/ },
  { file: "met-28", kind: "remove", start: 508,  end: 512,  must: [/<h3>Answer Key<\/h3>/] },
];

// Residual "answer key" text allowed to stay: the two descriptive lead-ins the
// source-scrub deliberately writes ("Practice questions with verified answer
// key."). They carry no answers - kept, per the ruling's scope (key TABLES).
const RESIDUAL_ALLOW = /Practice questions with verified answer key\./;

let failures = 0;
const fail = (msg) => { failures++; console.error("FAIL: " + msg); };

const byFile = new Map();
for (const e of EDITS) {
  if (!byFile.has(e.file)) byFile.set(e.file, []);
  byFile.get(e.file).push(e);
}

const archiveEntries = [];
const summary = [];
const pendingWrites = []; // { file, content } - written only if zero failures

for (const [chapter, edits] of [...byFile.entries()].sort()) {
  const file = path.join(NOTES, chapter, "notes.html");
  const raw = fs.readFileSync(file, "utf8");

  if (raw.charCodeAt(0) === 0xfeff) { fail(`${chapter}: unexpected BOM`); continue; }
  if (raw.split("\r\n").join("\r\n") !== raw) { fail(`${chapter}: not pure CRLF - refusing to edit`); continue; }

  const lines = raw.split("\r\n");

  // ---- verify + resolve every edit on the untouched line array ----
  const resolved = [];
  for (const e of edits) {
    if (e.kind === "css") {
      const i = lines.findIndex((l) => /\.answer-grid\s*\{/.test(l));
      if (i === -1) { fail(`${chapter}: css .answer-grid not found`); continue; }
      if (!/\.answer-cell\s*\{/.test(lines[i + 1] || "")) { fail(`${chapter}: css .answer-cell not at i+1`); continue; }
      if (!/\.answer-cell \.q-n\s*\{/.test(lines[i + 2] || "")) { fail(`${chapter}: css .q-n not at i+2`); continue; }
      const start = i > 0 && /\/\*[^*]*(answer|grid)/i.test(lines[i - 1]) ? i - 1 : i;
      resolved.push({ ...e, start: start + 1, end: i + 3, text: lines.slice(start, i + 3).join("\n") });
      continue;
    }
    if (e.kind === "strip") {
      const line = lines[e.start - 1];
      if (line === undefined) { fail(`${chapter}: strip line ${e.start} out of range`); continue; }
      if (!/Answers?:\s*[Q1]/i.test(line)) { fail(`${chapter}: strip line ${e.start} has no "Answers:" clause`); continue; }
      const replacedWith = line.replace(e.stripRe, "").trimEnd();
      if (e.keep && !e.keep.test(replacedWith)) { fail(`${chapter}: strip line ${e.start} lost its keep-marker`); continue; }
      if (/\d\s*[-=:]\s*[a-d]\b/i.test(replacedWith)) { fail(`${chapter}: strip line ${e.start} still carries a key list`); continue; }
      resolved.push({ ...e, text: line, replacedWith });
      continue;
    }
    // remove
    const block = lines.slice(e.start - 1, e.end);
    if (block.length !== e.end - e.start + 1) { fail(`${chapter}: range ${e.start}-${e.end} out of bounds`); continue; }
    const text = block.join("\n");
    for (const re of e.must) if (!re.test(text)) fail(`${chapter}: block ${e.start}-${e.end} missing marker ${re}`);
    const tOpen = (text.match(/<table\b/g) || []).length, tClose = (text.match(/<\/table>/g) || []).length;
    const dOpen = (text.match(/<div\b/g) || []).length, dClose = (text.match(/<\/div>/g) || []).length;
    if (tOpen !== tClose) fail(`${chapter}: block ${e.start}-${e.end} unbalanced <table> ${tOpen}/${tClose}`);
    if (dOpen !== dClose) fail(`${chapter}: block ${e.start}-${e.end} unbalanced <div> ${dOpen}/${dClose}`);
    for (const l of block) {
      if (/<h[1-6][\s>]/i.test(l) && !/answer\s*key/i.test(l)) fail(`${chapter}: block ${e.start}-${e.end} would swallow a non-key heading: ${l.trim().slice(0, 60)}`);
    }
    if (!/<h[1-6][\s>]|class="answer-grid"|class="box-blue"|\/\*/.test(block[0])) fail(`${chapter}: block ${e.start}-${e.end} starts unexpectedly: ${block[0].slice(0, 60)}`);
    resolved.push({ ...e, text });
  }

  // ---- apply in memory, descending ----
  resolved.sort((a, b) => (b.start || 0) - (a.start || 0));
  const before = lines.length;
  for (const r of resolved) {
    if (r.kind === "strip") {
      lines[r.start - 1] = r.replacedWith;
    } else {
      const len = r.end - r.start + 1;
      lines.splice(r.start - 1, len, "");
      // tidy spacing where the removed block sat between blank lines: keep one
      const prevBlank = r.start - 2 >= 0 && lines[r.start - 2] === "";
      const nextBlank = lines[r.start] === "";
      if (prevBlank && nextBlank) lines.splice(r.start - 1, 2);
      else if (prevBlank || nextBlank) lines.splice(r.start - 1, 1);
    }
    archiveEntries.push({
      chapter: r.file,
      kind: r.kind,
      lines: r.kind === "strip" ? [r.start, r.start] : [r.start, r.end],
      removedText: r.text,
      ...(r.replacedWith !== undefined ? { replacedWith: r.replacedWith } : {}),
    });
  }

  // ---- residual scan on the post-edit text ----
  lines.forEach((l, i) => {
    if (/answer\s*key/i.test(l) && !RESIDUAL_ALLOW.test(l)) fail(`${chapter}: residual "answer key" at line ${i + 1}: ${l.trim().slice(0, 90)}`);
  });

  summary.push(`${chapter}: ${resolved.length} edit(s), ${before - lines.length} line(s) net removed`);
  pendingWrites.push({ file, content: lines.join("\r\n") });
}

console.log(summary.join("\n"));
console.log(`\nfiles: ${byFile.size}  edits: ${archiveEntries.length}`);

if (failures) {
  console.error(`\n${failures} verification failure(s) - NOTHING WRITTEN`);
  process.exit(1);
}

if (APPLY) {
  for (const w of pendingWrites) fs.writeFileSync(w.file, w.content, "utf8");
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  fs.writeFileSync(ARCHIVE, JSON.stringify({
    date: "2026-10-17",
    reason: "Capt. Pahil ruling: remove hardcoded answer-key tables; inline answers are the single visible source.",
    source: "tools/audit/remove-answer-key-grids.mjs",
    entries: archiveEntries,
  }, null, 2), "utf8");
  console.log(`WROTE ${pendingWrites.length} files + archive ${ARCHIVE}`);
} else {
  console.log("Dry run OK - re-run with --apply to write.");
}
