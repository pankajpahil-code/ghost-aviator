#!/usr/bin/env node
// tools/audit/remove-answer-key-nav.mjs
//
// Air-navigation answer-key removal pass (2026-10-17).
// Removes the last hardcoded answer-key tables/grids from public/content/air-navigation
// after per-question inline-coverage verification (see nav-coverage-report), and
// rewords remaining prose mentions of "answer key" so the build-failing guard can
// be switched on for this subject.
//
// NOTHING IS DELETED: every removed block and every rewording is written verbatim
// to tools/audit/answer-key-archive/nav-removed-blocks-2026-10-17.json.
//
// Mechanics:
//   - files are CRLF, BOM-less; edits are line-range based on ORIGINAL line numbers
//   - per file, edits are applied in descending start order (no index drift)
//   - every cut slice must be tag-balanced (div/table/section/style)
//   - every transform must match exactly once on its line
//   - default is DRY RUN; pass --apply to write. --only=<file> limits scope.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");
const ROOT = path.join(REPO, "public", "content", "air-navigation");
const ARCHIVE_DIR = path.join(REPO, "tools", "audit", "answer-key-archive");
const ARCHIVE = path.join(ARCHIVE_DIR, "nav-removed-blocks-2026-10-17.json");

const APPLY = process.argv.includes("--apply");
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.split("=")[1] : null;

// ---------------------------------------------------------------- edit table
const EDITS = [
  // ================= nav-6 (ch. "Mass and Balance" notes page) =================
  // renumber final-revision part E -> D (answer-key part D is removed)
  { file: "nav-6", kind: "line", line: 1316, transforms: [["E. Final Revision", "D. Final Revision"]] },
  // remove Part D (hardcoded 75-question key table); keep the print-break div
  { file: "nav-6", kind: "cut", start: 1303, end: 1315, newLines: ['<div class="revision-start"></div>'],
    expectStart: "<h2>D. Answer Key</h2>", expectEnd: "</table><div class=" + '"revision-start"></div>' },
  // layout paragraph: drop the Part D mention, keep letters consistent (D = final revision)
  { file: "nav-6", kind: "line", line: 230, transforms: [
    ["<b>Part D</b> &#8212; the answer key grid.<br><b>Part E</b> &#8212; final revision.", "<b>Part D</b> &#8212; final revision."],
    ["come back to Part E the night before the paper.", "come back to Part D the night before the paper."],
  ] },
  // remove now-dead key-table CSS (comment + rules + following blank)
  { file: "nav-6", kind: "cut", start: 175, end: 183, newLines: [],
    expectStart: "/* Answer key grid */", expectEnd: "" },

  // ================= nav-13 =================
  { file: "nav-13", kind: "cut", start: 746, end: 756, newLines: [],
    expectStart: "<h3>Answer Key Summary</h3>", expectEnd: "all source key answers verified as correct." },
  { file: "nav-13", kind: "line", line: 531, transforms: [
    ["Full answer key, explanations &amp; distractor analysis", "Full worked answers, explanations &amp; distractor analysis"],
  ] },

  // ================= nav-14 .. nav-18 (summary tables) =================
  { file: "nav-14", kind: "cut", start: 756, end: 770, newLines: [],
    expectStart: "<h3>Answer Key Summary — No ⚑ Flags</h3>", expectEnd: "</table>" },
  { file: "nav-15", kind: "cut", start: 669, end: 674, newLines: [],
    expectStart: "<h3>Answer Key — Q1–Q14</h3>", expectEnd: "all source key answers verified." },
  { file: "nav-16", kind: "cut", start: 382, end: 390, newLines: [],
    expectStart: "<h3>Answer Key — No ⚑ Flags</h3>", expectEnd: "</table>" },
  { file: "nav-17", kind: "cut", start: 426, end: 434, newLines: [],
    expectStart: "<h3>Answer Key — No &#9876; Flags</h3>", expectEnd: "</table>" },
  { file: "nav-18", kind: "cut", start: 421, end: 432, newLines: [],
    expectStart: "<h3>Answer Key — No &#9876; Flags</h3>", expectEnd: "</table>" },

  // ================= nav-19 =================
  { file: "nav-19", kind: "cut", start: 515, end: 529, newLines: [],
    expectStart: '  <div class="ans-key">', expectEnd: "  </div>" },
  { file: "nav-19", kind: "cut", start: 66, end: 71, newLines: [],
    expectStart: ".ans-key{background:#1a2942", expectEnd: ".key-cell .ans{font-size:1.2rem" },
  { file: "nav-19", kind: "line", line: 470, transforms: [["from the published answer key:", "from the published key:"]] },
  { file: "nav-19", kind: "line", line: 476, transforms: [["from the published answer key:", "from the published key:"]] },

  // ================= nav-20 =================
  { file: "nav-20", kind: "cut", start: 556, end: 570, newLines: [],
    expectStart: '  <div class="ans-key">', expectEnd: "  </div>" },
  { file: "nav-20", kind: "cut", start: 85, end: 90, newLines: [],
    expectStart: ".ans-key{background:#1a2942", expectEnd: ".key-cell .ans{font-size:1.1rem" },

  // ================= nav-21 (grid headed "Quick Answer Summary") =================
  { file: "nav-21", kind: "cut", start: 374, end: 393, newLines: [],
    expectStart: '  <div class="ans-key">', expectEnd: "  </div>" },
  { file: "nav-21", kind: "cut", start: 74, end: 79, newLines: [],
    expectStart: ".ans-key{background:#1a2942", expectEnd: ".key-cell .ans{font-size:.95rem" },

  // ================= nav-22 =================
  { file: "nav-22", kind: "cut", start: 340, end: 375, newLines: [],
    expectStart: '  <div class="ans-key">', expectEnd: "  </div>" },
  { file: "nav-22", kind: "cut", start: 78, end: 83, newLines: [],
    expectStart: ".ans-key{background:#1a2942", expectEnd: ".key-cell .ans{font-size:13px" },
  { file: "nav-22", kind: "line", line: 327, transforms: [
    ["(answer key: 1:260 000", "(source key: 1:260 000"],
    ["The answer key states 1:260 000.", "The source key states 1:260 000."],
    ["Answer key gives <strong>3.65 inches</strong>", "Source key gives <strong>3.65 inches</strong>"],
  ] },
  { file: "nav-22", kind: "line", line: 332, transforms: [
    ["answer key: 1:250 000 ✓", "source key: 1:250 000 ✓"],
    ["(answer key: 8.1 in)", "(source key: 8.1 in)"],
    ["The answer key gives 8.1 inches", "The source key gives 8.1 inches"],
  ] },
  { file: "nav-22", kind: "line", line: 337, transforms: [
    ["(answer key: 1:350 000)", "(source key: 1:350 000)"],
    ["The answer key states 1:350 000.", "The source key states 1:350 000."],
    ["Answer key gives 1.53 inches.", "Source key gives 1.53 inches."],
  ] },

  // ================= nav-24 =================
  { file: "nav-24", kind: "cut", start: 311, end: 326, newLines: [],
    expectStart: '  <div class="ans-key">', expectEnd: "  </div>" },
  { file: "nav-24", kind: "cut", start: 75, end: 80, newLines: [],
    expectStart: ".ans-key{background:#1a2942", expectEnd: ".key-cell .ans{font-size:.95rem" },

  // ================= prose rewords =================
  { file: "nav-9", kind: "line", line: 1090, transforms: [["argument with an answer key one day", "argument with a source key one day"]] },
  { file: "nav-31", kind: "line", line: 253, transforms: [["the answer key states (b)", "the source key states (b)"]] },
  { file: "nav-cx3-5", kind: "line", line: 1120, transforms: [["Older answer keys convert", "Older source keys convert"]] },
  { file: "nav-cx3-5", kind: "line", line: 1348, transforms: [["an older answer key differs", "an older source key differs"]] },
  { file: "nav-cx3-5", kind: "line", line: 1408, transforms: [["Older answer keys print", "Older source keys print"]] },
  { file: "nav-cx3-5", kind: "line", line: 1581, transforms: [["Older answer keys give", "Older source keys give"]] },
  { file: "nav-cx3-5", kind: "line", line: 831, transforms: [["an old answer", "an old source"]] },
  { file: "nav-cx3-6", kind: "line", line: 914, transforms: [["the answer key to this chapter", "the source key to this chapter"]] },
  { file: "nav-cx3-6", kind: "line", line: 1369, transforms: [["the answer key on this chapter's fourth grid", "the source key on this chapter's fourth grid"]] },
  { file: "nav-cx3-6", kind: "line", line: 1688, transforms: [["an older answer key disagrees", "an older source key disagrees"]] },
  { file: "nav-cx3-6", kind: "line", line: 1739, transforms: [["the old answer key read off", "the old source key read off"]] },
  { file: "nav-cx3-8a", kind: "line", line: 1258, transforms: [["in this answer key", "in these answers"]] },
  { file: "nav-cx3-9", kind: "line", line: 934, transforms: [["What the answer key does", "What the source key does"]] },
  { file: "nav-cx3-9", kind: "line", line: 1617, transforms: [["The answer key says 13.", "The source key says 13."]] },
  { file: "nav-cx3-9", kind: "line", line: 1618, transforms: [["answer key is right.", "source key is right."]] },
  { file: "nav-cx3-9", kind: "line", line: 1647, transforms: [["the book's own answer key proves it", "the book's own key proves it"]] },
  { file: "nav-cx3-9", kind: "line", line: 1666, transforms: [["its own answer key is the half", "its own key is the half"]] },
];

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
const clip = (s, n = 260) => (s.length > n ? s.slice(0, n) + ` …[${s.length - n} more chars]` : s);

let failures = 0;
const fail = (msg) => { failures++; console.log("  !! FAIL " + msg); };
const bytes = (s) => Buffer.byteLength(s, "utf8");

// ---------------------------------------------------------------- main
const byFile = new Map();
for (const e of EDITS) {
  if (ONLY && e.file !== ONLY) continue;
  if (!byFile.has(e.file)) byFile.set(e.file, []);
  byFile.get(e.file).push(e);
}

console.log(APPLY ? "== APPLY MODE ==" : "== DRY RUN (pass --apply to write) ==");
console.log(`edits: ${[...byFile.values()].reduce((n, l) => n + l.length, 0)} in ${byFile.size} files\n`);

const archive = fs.existsSync(ARCHIVE) ? JSON.parse(fs.readFileSync(ARCHIVE, "utf8")) : { pass: "air-navigation", date: "2026-10-17", blocks: [], rewords: [] };
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
    const prevEnd = sorted[i - 1].start ?? sorted[i - 1].line;
    const curEnd = sorted[i].end ?? sorted[i].line;
    if (curEnd >= prevEnd) fail(`${file}: overlapping edits at L${sorted[i].start ?? sorted[i].line} / L${prevEnd}`);
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
      for (let i = s; i <= en; i++) console.log(`      ${i}: ${clip(lines[i - 1], 150)}`);
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
      if (PHRASE.test(cur)) { PHRASE.lastIndex = 0; fail(`${file} L${s}: rewound line still matches answer-key phrase`); }
      PHRASE.lastIndex = 0;
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
    const out = lines.join("\r\n");
    fs.writeFileSync(fp, out, "utf8");
    const check = fs.readFileSync(fp, "utf8");
    const balAfter = tokenBalance(check);
    const phrase = (check.match(PHRASE) || []).length;
    const classes = (check.match(CLASSES) || []).length;
    if (check !== out) fail(`${file}: round-trip mismatch after write`);
    if (!balanceEqual({ div: balAfter.div - balBefore.div, table: balAfter.table - balBefore.table, section: balAfter.section - balBefore.section, style: balAfter.style - balBefore.style }, { div: 0, table: 0, section: 0, style: 0 })) fail(`${file}: token balance drifted`);
    if (phrase !== 0) fail(`${file}: ${phrase} answer-key phrase(s) remain`);
    if (classes !== 0) fail(`${file}: ${classes} grid-class token(s) remain`);
    console.log(`wrote ${file}  (-${before.length - check.length} chars; phrase=${phrase}; classes=${classes}; balance ok)`);
  }
  archive.updatedAt = new Date().toISOString();
  fs.writeFileSync(ARCHIVE, JSON.stringify(archive, null, 2), "utf8");
  console.log(`\narchive: ${path.relative(REPO, ARCHIVE)} (${archive.blocks.length} blocks, ${archive.rewords.length} rewords)`);
  if (failures) { console.log(`\n${failures} post-write check failure(s)!`); process.exit(1); }
  console.log("\nAll post-write checks passed.");
  console.log("Next: node tools/audit/answer-key-guard.mjs  (air-navigation should read 0 pending)");
} else {
  console.log(`\nTOTAL removed: ${totalRemovedBytes} bytes across ${archive.blocks.length} blocks (this run).`);
  console.log("Dry run complete - no files written. Re-run with --apply to commit the edits.");
}
