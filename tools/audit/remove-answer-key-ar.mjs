#!/usr/bin/env node
// tools/audit/remove-answer-key-ar.mjs
//
// Air-regulations answer-key removal pass (2026-10-17).
// Removes the hardcoded answer-key tables/grids from the 11 recon-verified
// removal-safe files + ar-19 (whose Q1 conflict was resolved on 17 Oct and
// re-gated 10/10 inline), keeps the blockers ar-3 / ar-12 / ar-16, and rewords
// the structure/prose that would otherwise keep a stale "answer key" promise.
//
// Coverage gate (builder tool, this tree, 2026-10-17):
//   ar-2 15/15, ar-6 10/10, ar-7 12/12, ar-11 53/53, ar-14 25/25, ar-15 5/5,
//   ar-17 109/109, ar-19 10/10, ar-20 14/14, ar-21 10/10, ar-22 5/5,
//   ar-23 21/21  -> 289/289 entries present inline.
//
// NOTHING IS DELETED: every removed block and every rewording is written
// verbatim to tools/audit/answer-key-archive/ar-removed-blocks-2026-10-17.json.
//
// Mechanics: identical to remove-answer-key-nav.mjs (CRLF/BOM checks, cuts on
// original line numbers applied descending, tag-balanced slices, exact-once
// transforms, dry-run by default, --apply to write, --only=<file> to limit).
//
// Deliberate source-key annotations that STAY (blocker-phase decision
// deferred): ar-6 L1279, ar-11 L3669 + L4009, ar-19 L1047 + L1052,
// ar-26 L814 — hence the per-file expected remainder counts below.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");
const ROOT = path.join(REPO, "public", "content", "air-regulations");
const ARCHIVE_DIR = path.join(REPO, "tools", "audit", "answer-key-archive");
const ARCHIVE = path.join(ARCHIVE_DIR, "ar-removed-blocks-2026-10-17.json");

const APPLY = process.argv.includes("--apply");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.split("=")[1] : null;

// ---------------------------------------------------------------- edit table
// line numbers are ORIGINAL-tree coordinates (verified 2026-10-17; expect* strings re-checked at run time)
const EDITS = [
  // ================= ar-2 =================
  { file: "ar-2", kind: "cut", start: 983, end: 995, newLines: [],
    expectStart: "Consolidated Answer Key", expectEnd: "" },
  { file: "ar-2", kind: "line", line: 432, transforms: [["15 MCQs + Answer Key", "15 MCQs"]] },
  { file: "ar-2", kind: "line", line: 890, transforms: [[" A consolidated <strong>answer key grid</strong> follows.", ""]] },

  // ================= ar-6 =================
  { file: "ar-6", kind: "cut", start: 1231, end: 1237, newLines: [],
    expectStart: '<div class="box box-violet"', expectEnd: "" },

  // ================= ar-7 =================
  { file: "ar-7", kind: "cut", start: 1830, end: 1858, newLines: [],
    expectStart: "<!-- ANSWER KEY -->", expectEnd: "" },

  // ================= ar-11 =================
  { file: "ar-11", kind: "cut", start: 4150, end: 4221, newLines: [],
    expectStart: "<!-- OFFICIAL ANSWER KEY -->", expectEnd: "" },
  { file: "ar-11", kind: "cut", start: 742, end: 746, newLines: [],
    expectStart: "ANSWER KEY TABLE", expectEnd: ".ak-ans" },
  { file: "ar-11", kind: "line", line: 2922, transforms: [["53 MCQs + Official Answer Key", "53 MCQs with Inline Answers"]] },

  // ================= ar-14 =================
  { file: "ar-14", kind: "cut", start: 2142, end: 2159, newLines: [],
    expectStart: '<table class="dgca">', expectEnd: "" },

  // ================= ar-15 (phrase-invisible grid, found structurally) =================
  { file: "ar-15", kind: "cut", start: 986, end: 991, newLines: [],
    expectStart: '<table style="margin-top:18px;">', expectEnd: "</table>" },

  // ================= ar-17 =================
  { file: "ar-17", kind: "cut", start: 2219, end: 2246, newLines: [],
    expectStart: "ANSWER KEY GRID", expectEnd: "" },
  { file: "ar-17", kind: "line", line: 450, transforms: [["109 MCQs + Answer Key", "109 MCQs"]] },
  { file: "ar-17", kind: "line", line: 1542, transforms: [[" A consolidated <strong>answer key grid</strong> follows at the very end.", ""]] },

  // ================= ar-19 (conflict resolved 17 Oct; fresh gate 10/10) =================
  { file: "ar-19", kind: "cut", start: 1187, end: 1197, newLines: [],
    expectStart: "Answer Key (Per Source Textbook)", expectEnd: "</table>" },

  // ================= ar-20 =================
  { file: "ar-20", kind: "cut", start: 1264, end: 1279, newLines: [],
    expectStart: "Quick-Reference Answer Key", expectEnd: "" },

  // ================= ar-21 =================
  { file: "ar-21", kind: "cut", start: 1239, end: 1257, newLines: [],
    expectStart: "<!-- ============", expectEnd: "" },

  // ================= ar-22 =================
  { file: "ar-22", kind: "cut", start: 1318, end: 1331, newLines: [],
    expectStart: "D. Answer Key", expectEnd: "" },
  { file: "ar-22", kind: "line", line: 410, transforms: [["Master Reference Tables &amp; Answer Key", "Master Reference Tables"]] },
  { file: "ar-22", kind: "line", line: 1229, transforms: [["Master Reference Tables &amp; Answer Key", "Master Reference Tables"]] },

  // ================= ar-23 (key summary removed; 10.5 -> 10.4 renumber) =================
  { file: "ar-23", kind: "cut", start: 1669, end: 1690, newLines: [],
    expectStart: "10.4 Answer Key Summary", expectEnd: "" },
  { file: "ar-23", kind: "line", line: 263, transforms: [[" · Answer Key", ""]] },
  { file: "ar-23", kind: "line", line: 1620, transforms: [[" · Answer Key", ""]] },
  { file: "ar-23", kind: "line", line: 1691, transforms: [["10.5 Final Exam-Day Cheat Card", "10.4 Final Exam-Day Cheat Card"]] },

  // ================= ar-26 (forward promise of a key grid) =================
  { file: "ar-26", kind: "line", line: 956, transforms: [["the master answer-key consolidated cross-reference", "a consolidated cross-reference of all worked answers"]] },
];

// deliberate source-key annotations that stay (raw phrase-count expectation per touched file)
const EXPECT_PHRASE = {
  "ar-2": 0, "ar-6": 1, "ar-7": 0, "ar-11": 2, "ar-14": 0, "ar-15": 0,
  "ar-17": 0, "ar-19": 2, "ar-20": 0, "ar-21": 0, "ar-22": 0, "ar-23": 0, "ar-26": 1,
};

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
const clip = (s, n = 200) => (s.length > n ? s.slice(0, n) + ` …[${s.length - n} more chars]` : s);
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
  : { pass: "air-regulations", date: "2026-10-17", blocks: [], rewords: [] };
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
  const balBefore = tokenBalance(text);

  // descending, non-overlap check
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
    console.log(`wrote ${file}  (-${before.length - check.length} chars; phrase ${phBefore}->${phrase} (expected ${expected}); classes=${classes}; balance ok)`);
  }
  archive.updatedAt = new Date().toISOString();
  fs.writeFileSync(ARCHIVE, JSON.stringify(archive, null, 2), "utf8");
  console.log(`\narchive: ${path.relative(REPO, ARCHIVE)} (${archive.blocks.length} blocks, ${archive.rewords.length} rewords)`);
  if (failures) { console.log(`\n${failures} post-write check failure(s)!`); process.exit(1); }
  console.log("\nAll post-write checks passed.");
  console.log("Next: node tools/audit/answer-key-guard.mjs  (air-regulations should read 22 pending: ar-3 3, ar-5 1, ar-6 1, ar-11 2, ar-12 4, ar-13 1, ar-16 7, ar-19 2, ar-26 1)");
} else {
  console.log(`\nTOTAL removed: ${totalRemovedBytes} bytes across ${archive.blocks.length} blocks (this run).`);
  console.log("Dry run complete - no files written. Re-run with --apply to commit the edits.");
}
