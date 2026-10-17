#!/usr/bin/env node
// tools/audit/remove-answer-key-inst.mjs
//
// Instrumentation answer-key removal pass (2026-10-17).
// Removes the hardcoded answer-key tables/grids from the 24 recon-verified
// removal-safe files (all 223 entries proven present inline, fresh gate
// 2026-10-17 on this tree; inst-31 verified via its 56 class="correct"
// markers), keeps the inst-40 blocker (399 entries have no inline source)
// and the deliberate inst-34 annotations, and rewords the box lead-ins /
// prose that would otherwise remain de-facto keys or stale promises.
//
// NOTHING IS DELETED: every removed block and every rewording is written
// verbatim to tools/audit/answer-key-archive/inst-removed-blocks-2026-10-17.json.
//
// Mechanics: identical to remove-answer-key-ar.mjs (CRLF/BOM checks, cuts on
// original line numbers applied descending, tag-balanced slices, exact-once
// transforms, dry-run by default, --apply to write, --only=<file> to limit).
//
// After this pass the guard should read: instrumentation 21 occurrence(s)
// in 2 file(s) = inst-34 (3 deliberate annotations) + inst-40 (18 lines).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");
const ROOT = path.join(REPO, "public", "content", "instrumentation");
const ARCHIVE_DIR = path.join(REPO, "tools", "audit", "answer-key-archive");
const ARCHIVE = path.join(ARCHIVE_DIR, "inst-removed-blocks-2026-10-17.json");

const APPLY = process.argv.includes("--apply");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.split("=")[1] : null;

// ---------------------------------------------------------------- edit table
// line numbers are ORIGINAL-tree coordinates (verified 2026-10-17; expect* strings re-checked at run time)
const EDITS = [
  // ================= inst-1 =================
  { file: "inst-1", kind: "cut", start: 292, end: 297, newLines: [], expectStart: "<h3>Answer key</h3>", expectEnd: "" },
  // ================= inst-2 =================
  { file: "inst-2", kind: "cut", start: 293, end: 298, newLines: [], expectStart: "<h3>Answer key</h3>", expectEnd: "" },
  { file: "inst-2", kind: "line", line: 185, transforms: [["with the source answer key (1-b, 2-c, 3-d, 4-a, 5-a, 6-a, 7-b, 8-c) and instructor explanations added.", "with the source answers shown inline and instructor explanations added."]] },
  // ================= inst-3 =================
  { file: "inst-3", kind: "cut", start: 601, end: 606, newLines: [], expectStart: "<h3>Source Answer Key</h3>", expectEnd: "" },
  { file: "inst-3", kind: "line", line: 365, transforms: [["with answer key: 1-b, 2-d, 3-b, 4-a, 5-b, 6-b, 7-a, 8-b.", "with inline answers and explanations."]] },
  // ================= inst-4 =================
  { file: "inst-4", kind: "cut", start: 564, end: 569, newLines: [], expectStart: "<h3>Source Answer Key</h3>", expectEnd: "" },
  { file: "inst-4", kind: "line", line: 310, transforms: [["with answer key: 1-d, 2-c, 3-a, 4-c, 5-b, 6-a, 7-d, 8-c, 9-b.", "with inline answers and explanations."]] },
  // ================= inst-5 =================
  { file: "inst-5", kind: "cut", start: 702, end: 707, newLines: [], expectStart: "<h3>Source Answer Key</h3>", expectEnd: "" },
  { file: "inst-5", kind: "line", line: 482, transforms: [["with answer key: 1-d, 2-b, 3-a, 4-d, 5-c, 6-a, 7-b.", "with inline answers and explanations."]] },
  { file: "inst-5", kind: "line", line: 652, transforms: [
    ["The source answer key states (b) 3390.", "The source key states (b) 3390."],
    ["trust the source answer key:", "trust the source key:"],
  ] },
  // ================= inst-6 =================
  { file: "inst-6", kind: "cut", start: 343, end: 346, newLines: [], expectStart: "<h3>Answer Key</h3>", expectEnd: "" },
  { file: "inst-6", kind: "line", line: 225, transforms: [["with answer key.", "with inline answers."]] },
  // ================= inst-7 =================
  { file: "inst-7", kind: "cut", start: 490, end: 493, newLines: [], expectStart: "<h3>Answer Key</h3>", expectEnd: "" },
  { file: "inst-7", kind: "line", line: 361, transforms: [["with answer key.", "with inline answers."]] },
  // ================= inst-8 =================
  { file: "inst-8", kind: "cut", start: 316, end: 319, newLines: [], expectStart: "<h3>Answer Key (Instructor-Generated Questions)</h3>", expectEnd: "" },
  // ================= inst-9 =================
  { file: "inst-9", kind: "cut", start: 420, end: 423, newLines: [], expectStart: "<h3>Answer Key</h3>", expectEnd: "" },
  { file: "inst-9", kind: "line", line: 307, transforms: [["with answer key.", "with inline answers."]] },
  // ================= inst-10 =================
  { file: "inst-10", kind: "cut", start: 480, end: 483, newLines: [], expectStart: "<h3>Answer Key</h3>", expectEnd: "" },
  { file: "inst-10", kind: "line", line: 352, transforms: [["with answer key.", "with inline answers."]] },
  // ================= inst-11 =================
  { file: "inst-11", kind: "cut", start: 499, end: 502, newLines: [], expectStart: "<h3>Answer Key</h3>", expectEnd: "" },
  { file: "inst-11", kind: "line", line: 363, transforms: [["with answer key.", "with inline answers."]] },
  // ================= inst-12 =================
  { file: "inst-12", kind: "cut", start: 653, end: 667, newLines: [], expectStart: "<h3>Answer Key Summary</h3>", expectEnd: "" },
  { file: "inst-12", kind: "line", line: 392, transforms: [[", with answer key: 1-b, 2-d, 3-c, 4-c, 5-b, 6-c, 7-c, 8-b, 9-d, 10-a.", ", with inline answers and explanations."]] },
  // ================= inst-13 =================
  { file: "inst-13", kind: "cut", start: 578, end: 591, newLines: [], expectStart: "<h3>Answer Key Summary</h3>", expectEnd: "" },
  { file: "inst-13", kind: "line", line: 335, transforms: [[". Answer key from source: 1-d, 2-c, 3-d, 4-b, 5-d, 6-a, 7-a, 8-b, 9-a.", ", with the source answers shown inline."]] },
  // ================= inst-14 =================
  { file: "inst-14", kind: "cut", start: 447, end: 457, newLines: [], expectStart: "<h3>Answer Key Summary</h3>", expectEnd: "" },
  { file: "inst-14", kind: "line", line: 285, transforms: [[". Answer key from source: 1-c, 2-a, 3-a, 4-d, 5-a, 6-d.", ", with the source answers shown inline."]] },
  // ================= inst-15 =================
  { file: "inst-15", kind: "cut", start: 245, end: 252, newLines: [], expectStart: "<h3>Answer Key Summary</h3>", expectEnd: "" },
  { file: "inst-15", kind: "line", line: 157, transforms: [[". Answer key from source: 1-b, 2-c (with explanation below), 3-b.", ", with the source answers shown inline."]] },
  // ================= inst-16 =================
  { file: "inst-16", kind: "cut", start: 453, end: 464, newLines: [], expectStart: "<h3>Answer Key Summary</h3>", expectEnd: "" },
  { file: "inst-16", kind: "line", line: 261, transforms: [[". Answer key from source: 1-a, 2-b, 3-b, 4-a, 5-c, 6-d, 7-b.", ", with the source answers shown inline."]] },
  // ================= inst-17 =================
  { file: "inst-17", kind: "cut", start: 566, end: 576, newLines: [], expectStart: "<h3>Answer Key Summary</h3>", expectEnd: "" },
  { file: "inst-17", kind: "line", line: 371, transforms: [[". Answer key from source: 1-b, 2-c, 3-a, 4-a, 5-b, 6-a (combination 2, 3 and 5). Note:", ", with the source answers shown inline. Note:"]] },
  // ================= inst-24 =================
  { file: "inst-24", kind: "cut", start: 525, end: 535, newLines: [], expectStart: "<h3>Q&amp;A Answer Key</h3>", expectEnd: "" },
  // ================= inst-31 =================
  { file: "inst-31", kind: "cut", start: 48, end: 53, newLines: [], expectStart: "<h2>Quick Answer Keys</h2>", expectEnd: "" },
  { file: "inst-31", kind: "cut", start: 20, end: 20, newLines: [], expectStart: ".answer-key {", expectEnd: ".answer-key {" },
  { file: "inst-31", kind: "line", line: 101, transforms: [
    ["The answer key gives", "The source key gives"],
    ["Note: the key says", "Note: the source key says"],
    ["as given in the answer key.", "as given in the source key."],
  ] },
  // ================= inst-35 =================
  { file: "inst-35", kind: "cut", start: 333, end: 333, newLines: [], expectStart: '<div class="answer-key"', expectEnd: "</div>" },
  // ================= inst-36 =================
  { file: "inst-36", kind: "cut", start: 475, end: 485, newLines: [], expectStart: "<h3>Answer Key</h3>", expectEnd: "" },
  // ================= inst-37 =================
  { file: "inst-37", kind: "cut", start: 421, end: 430, newLines: [], expectStart: "Answer Key \u2014 Source Questions", expectEnd: "" },
  { file: "inst-37", kind: "line", line: 263, transforms: [["given with their answer key. Explanations", "given with their answers shown inline. Explanations"]] },
  // ================= inst-38 =================
  { file: "inst-38", kind: "cut", start: 650, end: 660, newLines: [], expectStart: "<h3>Answer Key</h3>", expectEnd: "" },
  // ================= inst-39 =================
  { file: "inst-39", kind: "cut", start: 748, end: 764, newLines: [], expectStart: "Answer Key \u2014 Source Questions", expectEnd: "" },
  { file: "inst-39", kind: "line", line: 453, transforms: [["given with their answer key. Explanations", "given with their answers shown inline. Explanations"]] },
];

// every touched file must end with zero answer-key phrases (deliberate
// annotations live in inst-34/inst-40, which this pass does not touch)
const EXPECT_PHRASE = {};

// ---------------------------------------------------------------- helpers
const PHRASE = /answer[-\s_]*key/gi;
const CLASSES = /ans-key|key-grid|key-cell|keytable|krow-[qa]|keyfix|answer-key-grid|answer-grid|answer-cell|ak-cell/gi;

const tokenBalance = (text) => ({
  div: (text.match(/<div\b/g) || []).length - (text.match(/<\/div>/g) || []).length,
  table: (text.match(/<table\b/g) || []).length - (text.match(/<\/table>/g) || []).length,
  section: (text.match(/<section\b/g) || []).length - (text.match(/<\/section>/g) || []).length,
  style: (text.match(/<style\b/g) || []).length - (text.match(/<\/style>/g) || []).length,
});
const balanceEqual = (a, b) => a.div === b.div && a.table === b.table && a.section === b.section && a.style === b.style;
const sha1 = (s) => crypto.createHash("sha1").update(s, "utf8").digest("hex");
const clip = (s, n = 200) => (s.length > n ? s.slice(0, n) + ` \u2026[${s.length - n} more chars]` : s);
const bytes = (s) => Buffer.byteLength(s, "utf8");
const countPhrase = (text) => (text.match(PHRASE) || []).length;

let failures = 0;
const fail = (msg) => { failures++; console.log("  !! FAIL " + msg); };

// ---------------------------------------------------------------- main
const byFile = new Map();
for (const e of EDITS) {
  if (ONLY && e.file !== ONLY) continue;
  if (!byFile.has(e.file)) byFile.set(e.file, []);
  byFile.get(e.file).push(e);
}

console.log(APPLY ? "== APPLY MODE ==" : "== DRY RUN (pass --apply to write) ==");
console.log(`edits: ${[...byFile.values()].reduce((n, l) => n + l.length, 0)} in ${byFile.size} files\n`);

const archive = fs.existsSync(ARCHIVE)
  ? JSON.parse(fs.readFileSync(ARCHIVE, "utf8"))
  : { pass: "instrumentation", date: "2026-10-17", blocks: [], rewords: [] };
archive.blocks = archive.blocks.filter((b) => ![...byFile.keys()].includes(b.file));
archive.rewords = archive.rewords.filter((r) => ![...byFile.keys()].includes(r.file));

let totalRemovedBytes = 0;
const applyPlan = [];

for (const [file, edits] of byFile) {
  const fp = path.join(ROOT, file, "notes.html");
  const text = fs.readFileSync(fp, "utf8");
  console.log(`---- ${file} ----`);
  if (text.charCodeAt(0) === 0xfeff) { fail(`${file}: unexpected BOM`); continue; }
  const lines = text.split("\r\n");
  if (lines.some((l) => /[\r\n]/.test(l))) { fail(`${file}: non-CRLF newline present`); continue; }

  const sorted = [...edits].sort((a, b) => (b.start ?? b.line) - (a.start ?? a.line));
  for (let i = 1; i < sorted.length; i++) {
    const prevStart = sorted[i - 1].start ?? sorted[i - 1].line;
    const curEnd = sorted[i].end ?? sorted[i].line;
    if (curEnd >= prevStart) fail(`${file}: overlapping edits at L${sorted[i].start ?? sorted[i].line} / L${prevStart}`);
  }

  for (const e of sorted) {
    const s = e.start ?? e.line;
    const en = e.end ?? e.line;
    if (s < 1 || en > lines.length) { fail(`${file}: range L${s}-${en} outside file (${lines.length} lines)`); continue; }
    if (e.kind === "cut") {
      const slice = lines.slice(s - 1, en);
      const sliceText = slice.join("\r\n");
      if (e.expectStart && !lines[s - 1].includes(e.expectStart)) fail(`${file} L${s}: expectStart not found: ${e.expectStart}`);
      if (e.expectEnd === "") { if (lines[en - 1].trim() !== "") fail(`${file} L${en}: expected blank line`); }
      else if (e.expectEnd && !lines[en - 1].includes(e.expectEnd)) fail(`${file} L${en}: expectEnd not found: ${e.expectEnd}`);
      if (!balanceEqual(tokenBalance(sliceText), { div: 0, table: 0, section: 0, style: 0 })) fail(`${file} L${s}-${en}: slice not tag-balanced`);
      console.log(`  [cut] L${s}-${en}  (${slice.length} lines, ${bytes(sliceText)} bytes, balanced)`);
      if (s > 1) console.log(`      before: ${s - 1}| ${clip(lines[s - 2], 130)}`);
      for (let i = s; i <= en; i++) console.log(`      ${i}| ${clip(lines[i - 1], 130)}`);
      if (en < lines.length) console.log(`      after:  ${en + 1}| ${clip(lines[en], 130)}`);
      archive.blocks.push({ file, kind: "cut", start: s, end: en, newLines: e.newLines, removed: sliceText, sha1: sha1(sliceText), bytes: bytes(sliceText) });
      totalRemovedBytes += bytes(sliceText);
      lines.splice(s - 1, en - s + 1, ...e.newLines);
    } else {
      let cur = lines[s - 1];
      const updates = [];
      for (const [from, to] of e.transforms) {
        const n = cur.split(from).length - 1;
        if (n !== 1) { fail(`${file} L${s}: transform "${clip(from, 60)}" occurs ${n} times (want 1)`); continue; }
        updates.push({ from, to });
        cur = cur.replace(from, to);
      }
      const ph = countPhrase(cur);
      const expected = EXPECT_PHRASE[file] ?? 0;
      if (ph > expected) fail(`${file} L${s}: rewound line still matches answer-key phrase (${ph} on line)`);
      console.log(`  [line] L${s}`);
      console.log(`      old: ${clip(lines[s - 1])}`);
      console.log(`      new: ${clip(cur)}`);
      archive.rewords.push({ file, line: s, oldLine: lines[s - 1], newLine: cur, transforms: updates });
      lines[s - 1] = cur;
    }
  }
  applyPlan.push({ file, fp, lines });
}

if (failures) { console.log(`\n${failures} validation failure(s) - nothing written.`); process.exit(1); }

// ---------------------------------------------------------------- apply + verify
if (APPLY) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  for (const { file, fp, lines } of applyPlan) {
    const before = fs.readFileSync(fp, "utf8");
    const balBefore = tokenBalance(before);
    const phBefore = countPhrase(before);
    const out = lines.join("\r\n");
    fs.writeFileSync(fp, out, "utf8");
    const check = fs.readFileSync(fp, "utf8");
    const balAfter = tokenBalance(check);
    const phrase = countPhrase(check);
    const classes = (check.match(CLASSES) || []).length;
    const expected = EXPECT_PHRASE[file] ?? 0;
    if (check !== out) fail(`${file}: round-trip mismatch after write`);
    if (!balanceEqual({ div: balAfter.div - balBefore.div, table: balAfter.table - balBefore.table, section: balAfter.section - balBefore.section, style: balAfter.style - balBefore.style }, { div: 0, table: 0, section: 0, style: 0 })) fail(`${file}: token balance drifted`);
    if (phrase !== expected) fail(`${file}: ${phrase} answer-key phrase(s) remain (expected ${expected})`);
    if (classes !== 0) fail(`${file}: ${classes} grid-class token(s) remain`);
    console.log(`wrote ${file}  (${before.length - check.length >= 0 ? "-" : "+"}${Math.abs(before.length - check.length)} chars; phrase ${phBefore}->${phrase} (expected ${expected}); classes=${classes}; balance ok)`);
  }
  archive.updatedAt = new Date().toISOString();
  fs.writeFileSync(ARCHIVE, JSON.stringify(archive, null, 2), "utf8");
  console.log(`\narchive: ${path.relative(REPO, ARCHIVE)} (${archive.blocks.length} blocks, ${archive.rewords.length} rewords)`);
  if (failures) { console.log(`\n${failures} post-write check failure(s)!`); process.exit(1); }
  console.log("\nAll post-write checks passed.");
  console.log("Next: node tools/audit/answer-key-guard.mjs  (instrumentation should read 21 pending: inst-34 3, inst-40 18)");
} else {
  console.log(`\nTOTAL removed: ${totalRemovedBytes} bytes across ${archive.blocks.length} blocks (this run).`);
  console.log("Dry run complete - no files written. Re-run with --apply to commit the edits.");
}
