// tools/audit/remove-answer-key-rnav.mjs
// Removes the hardcoded radio-navigation answer-key artifacts:
//   - rnav-1..7: "Answer Key — Chapter N" heading + answer-key-grid block + dead CSS
//   - rnav-19:   "66-Question Specimen Exam — Answer Key" box (41/66 answers
//                contradicted the inline answers; orphaned surface)
//   - rnav-15 / rnav-19: two inline sentences reworded to drop the phrase
//                "answer key" (meaning preserved; flagged in the report)
// Verification per edit (all must pass, or nothing is written for that file):
//   - CRLF line endings, no BOM
//   - grid blocks: heading + container + balanced close + cell Q numbers 1..N
//   - css blocks: exact expected rule lines
//   - box block: title + 66 sequential Q=letter pairs
//   - rewrites: anchor strings present; replacement changes the line
// Writes an archive of every removed block and both rewrites:
//   tools/audit/answer-key-archive/rnav-removed-blocks-2026-10-17.json

import fs from "node:fs";
import path from "node:path";

const DRY = !process.argv.includes("--apply");
const BASE = path.join("public", "content", "radio-navigation");
const ARCHIVE = path.join(
  "tools",
  "audit",
  "answer-key-archive",
  "rnav-removed-blocks-2026-10-17.json",
);

// ---- edit manifest -------------------------------------------------------
// kind: "grid" | "css" | "box" | "rewrite-line"
// grid: start = heading line, end = closing </div>, expectQ = 1..N
const EDITS = [
  { file: "rnav-1", kind: "css", start: 349, end: 365 },
  { file: "rnav-1", kind: "grid", start: 1300, end: 1314, expectQ: 12 },
  { file: "rnav-2", kind: "css", start: 74, end: 77 },
  { file: "rnav-2", kind: "grid", start: 985, end: 995, expectQ: 8 },
  { file: "rnav-3", kind: "css", start: 76, end: 79 },
  { file: "rnav-3", kind: "grid", start: 688, end: 694, expectQ: 4 },
  { file: "rnav-4", kind: "css", start: 77, end: 80 },
  { file: "rnav-4", kind: "grid", start: 619, end: 625, expectQ: 4 },
  { file: "rnav-5", kind: "css", start: 72, end: 75 },
  { file: "rnav-5", kind: "grid", start: 485, end: 490, expectQ: 3 },
  { file: "rnav-6", kind: "css", start: 74, end: 77 },
  { file: "rnav-6", kind: "grid", start: 600, end: 608, expectQ: 6 },
  { file: "rnav-7", kind: "css", start: 71, end: 74 },
  { file: "rnav-7", kind: "grid", start: 795, end: 818, expectQ: 21 },
  { file: "rnav-19", kind: "box", start: 1259, end: 1266 },
  { file: "rnav-19", kind: "trim-line", start: 1267, expectPrefix: "</div>" },
  { file: "rnav-19", kind: "rewrite-line", start: 57, anchor: /id="ans_3"/, find: /Answer key = c for variant with 325\/8000 ft/g, replace: "For the variant with 325/8000 ft" },
  { file: "rnav-15", kind: "rewrite-line", start: 297, anchor: /id="ans_3"/,
    find: /\(Note: closest answer is b at 100\.3 NM; answer key b = 104\.3 is an approximation variant[\s\S]*?option b\.\)/g,
    replace: "(Note: 100.3 NM applies the 50 &micro;s delay correction; the intended answer (b) 104.3 NM uses the raw 1290 &micro;s.)" },
];

const GRID_CELL = /^<div class="ak-cell"><div class="ak-q">Q(\d+)<\/div><div class="ak-a">[a-d]<\/div><\/div>$/;
const ANY_KEY = /answer\s*key/i;

// optional single-file mode: --only=rnav-19 (archive entries are merged)
const ONLY = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7);
const EDITS_FILTERED = ONLY ? EDITS.filter((e) => e.file === ONLY) : EDITS;

// ---- load + verify -------------------------------------------------------
const files = [...new Set(EDITS_FILTERED.map((e) => e.file))].map((f) => ({
  name: f,
  path: path.join(BASE, f, "notes.html"),
}));

const results = [];
const archive = { tool: "remove-answer-key-rnav.mjs", date: "2026-10-17", subject: "radio-navigation", entries: [] };
let failures = 0;

for (const f of files) {
  const bytes = fs.readFileSync(f.path);
  const checks = [];
  const fail = (m) => { checks.push("FAIL " + m); failures++; };

  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) fail("BOM present");
  const text = bytes.toString("utf8");
  if (/(^|[^\r])\n/.test(text)) fail("lone LF found (not pure CRLF)");
  const hadTrailing = text.endsWith("\r\n");
  const lines = text.split("\r\n");
  if (hadTrailing) lines.pop();

  const edits = EDITS_FILTERED.filter((e) => e.file === f.name).sort((a, b) => b.start - a.start);
  const editsForFile = [];

  for (const e of edits) {
    const b = (n) => lines[n - 1];
    if (e.start < 1 || e.end > lines.length) { fail(`${e.kind}@${e.start}-${e.end} out of bounds`); continue; }
    const fc = failures;

    if (e.kind === "grid") {
      if (!/^\s*<h2>Answer Key/.test(b(e.start))) fail(`grid@${e.start}: heading missing`);
      if (b(e.start + 1).trim() !== '<div class="answer-key-grid">') fail(`grid@${e.start}: container missing`);
      if (b(e.end).trim() !== "</div>") fail(`grid@${e.end}: close missing`);
      const cellLines = [];
      for (let i = e.start + 2; i <= e.end - 1; i++) cellLines.push(b(i));
      const qs = [];
      for (const c of cellLines) {
        const m = c.trim().match(GRID_CELL);
        if (!m) { fail(`grid@${e.start}: bad cell: ${c.trim().slice(0, 60)}`); break; }
        qs.push(Number(m[1]));
      }
      if (qs.length !== e.expectQ || qs.some((q, i) => q !== i + 1)) fail(`grid@${e.start}: Q sequence ${qs.join(",")} != 1..${e.expectQ}`);
      if (failures === fc) editsForFile.push({ e, removed: lines.slice(e.start - 1, e.end).join("\r\n") });
    } else if (e.kind === "css") {
      const first = b(e.start), last = b(e.end);
      if (e.file === "rnav-1") {
        if (first !== "/* ===== ANSWER KEY ===== */") fail(`css@${e.start}: comment missing`);
        if (!/^\.answer-key-grid \{/.test(b(e.start + 1))) fail(`css@${e.start + 1}: container rule missing`);
        if (b(e.end - 1) !== ".ak-cell .ak-q { font-weight: 700; color: #1a237e; font-size: 0.85em; }") fail(`css@${e.end - 1}: ak-q line mismatch`);
        if (b(e.end) !== ".ak-cell .ak-a { color: #2e7d32; font-weight: 900; font-size: 1.1em; }") fail(`css@${e.end}: ak-a line mismatch`);
      } else {
        if (!/^\.answer-key-grid\{/.test(first)) fail(`css@${e.start}: container rule missing`);
        if (!/^\.ak-cell\{/.test(b(e.start + 1))) fail(`css@${e.start + 1}: ak-cell rule missing`);
        if (!/^\.ak-cell \.ak-q\{/.test(b(e.start + 2))) fail(`css@${e.start + 2}: ak-q rule missing`);
        if (!/\.ak-cell \.ak-a\{/.test(last)) fail(`css@${e.end}: ak-a rule missing`);
        if (e.end - e.start !== 3) fail(`css@${e.start}: expected 4 lines, got ${e.end - e.start + 1}`);
      }
      if (failures === fc) editsForFile.push({ e, removed: lines.slice(e.start - 1, e.end).join("\r\n") });
    } else if (e.kind === "box") {
      if (b(e.start).trim() !== '<div class="box-amber">') fail(`box@${e.start}: open missing`);
      if (!b(e.start + 1).includes("66-Question Specimen Exam") || !b(e.start + 1).includes("Answer Key")) fail(`box@${e.start + 1}: title missing`);
      const pairs = [];
      for (let i = e.start + 2; i <= e.end; i++) {
        const t = b(i).trim().replace(/<br>$/, "");
        const m = t.match(/^((?:Q\d+=[a-d])(?: &bull; Q\d+=[a-d])*)$/);
        if (!m) { fail(`box@${i}: bad answer line`); break; }
        for (const p of t.split(" &bull; ")) pairs.push(p);
      }
      const qs = pairs.map((p) => Number(p.match(/^Q(\d+)=/)[1]));
      if (qs.length !== 66 || qs.some((q, i) => q !== i + 1)) fail(`box: Q sequence bad (${qs.length} pairs)`);
      if (failures === fc) editsForFile.push({ e, removed: lines.slice(e.start - 1, e.end).join("\r\n") });
    } else if (e.kind === "trim-line") {
      if (!b(e.start).startsWith(e.expectPrefix)) fail(`trim@${e.start}: prefix missing`);
      if (failures === fc) editsForFile.push({ e, removed: e.expectPrefix, trim: true });
    } else if (e.kind === "rewrite-line") {
      const line = b(e.start);
      if (!e.anchor.test(line)) fail(`rewrite@${e.start}: anchor missing`);
      if (!e.find.test(line)) fail(`rewrite@${e.start}: find pattern missing`);
      if (failures === fc) editsForFile.push({ e, rewrite: true });
    }
  }

  results.push({ f, lines, hadTrailing, checks, editsForFile, origText: text, hadKeyBefore: (text.match(new RegExp(ANY_KEY.source, "gi")) || []).length });
}

// ---- apply ---------------------------------------------------------------
if (!DRY && failures === 0) {
  for (const r of results) {
    let removedBefore = 0;
    for (const ed of r.editsForFile) {
      const e = ed.e;
      if (e.kind === "grid" || e.kind === "css" || e.kind === "box") {
        const len = e.end - e.start + 1;
        r.lines.splice(e.start - 1, len);
        // tidy: if blanks remain on both sides, collapse to one
        const prevBlank = e.start - 2 >= 0 && r.lines[e.start - 2] === "";
        const nextBlank = e.start - 1 < r.lines.length && r.lines[e.start - 1] === "";
        if (prevBlank && nextBlank) r.lines.splice(e.start - 2, 1);
        archive.entries.push({ file: r.f.name, kind: e.kind, lines: `${e.start}-${e.end}`, html: ed.removed });
      } else if (e.kind === "trim-line") {
        const orig = r.lines[e.start - 1];
        r.lines[e.start - 1] = orig.replace(e.expectPrefix, "");
        archive.entries.push({ file: r.f.name, kind: e.kind, line: e.start, before: orig.slice(0, 120), after: r.lines[e.start - 1].slice(0, 120) });
      } else if (e.kind === "rewrite-line") {
        const orig = r.lines[e.start - 1];
        r.lines[e.start - 1] = orig.replace(e.find, e.replace);
        if (r.lines[e.start - 1] === orig) { failures++; console.log(`FAIL ${r.f.name} L${e.start}: replacement did not change line`); }
        archive.entries.push({ file: r.f.name, kind: e.kind, line: e.start, before: orig, after: r.lines[e.start - 1] });
      }
    }
    const out = r.lines.join("\r\n") + (r.hadTrailing ? "\r\n" : "");
    const cnt = (s, re) => (s.match(re) || []).length;
    const dOpen = cnt(r.origText, /<div\b/g) - cnt(out, /<div\b/g);
    const dClose = cnt(r.origText, /<\/div>/g) - cnt(out, /<\/div>/g);
    if (dOpen !== dClose) { failures++; console.log(`FAIL ${r.f.name}: unbalanced div delta (${dOpen} vs ${dClose})`); continue; }
    const keyAfter = (out.match(new RegExp(ANY_KEY.source, "gi")) || []).length;
    const gridAfter = (out.match(/ak-cell|answer-key-grid/g) || []).length;
    if (keyAfter !== 0 || gridAfter !== 0) { failures++; console.log(`FAIL ${r.f.name}: residual key=${keyAfter} grid=${gridAfter}`); continue; }
    fs.writeFileSync(r.f.path, out, "utf8");
    console.log(`WROTE ${r.f.path}`);
  }
}

// ---- report --------------------------------------------------------------
console.log("");
for (const r of results) {
  const kinds = r.editsForFile.map((ed) => `${ed.e.kind}@${ed.e.start}-${ed.e.end ?? ed.e.start}`).join(", ");
  console.log(`${r.f.name}: key-before=${r.hadKeyBefore} edits=${r.editsForFile.length} [${kinds}]`);
  for (const c of r.checks) console.log("  " + c);
}
console.log("");
if (failures) {
  console.log(`FAILURES: ${failures} - nothing written for failed files.`);
  process.exit(1);
}
if (DRY) {
  console.log("DRY RUN - all checks passed. Re-run with --apply to write.");
} else {
  fs.mkdirSync(path.dirname(ARCHIVE), { recursive: true });
  let merged = archive;
  if (fs.existsSync(ARCHIVE)) {
    try {
      const prev = JSON.parse(fs.readFileSync(ARCHIVE, "utf8"));
      const editedFiles = new Set(results.map((r) => r.f.name));
      merged = { ...prev, entries: [...prev.entries.filter((e) => !editedFiles.has(e.file)), ...archive.entries] };
    } catch { /* first run */ }
  }
  fs.writeFileSync(ARCHIVE, JSON.stringify(merged, null, 2), "utf8");
  console.log(`WROTE ${ARCHIVE} (${merged.entries.length} entries)`);
  console.log("");
  console.log("Residual sweep:");
  for (const r of results) {
    const out = fs.readFileSync(r.f.path, "utf8");
    console.log(`  ${r.f.name}: answer-key=${(out.match(new RegExp(ANY_KEY.source, "gi")) || []).length} ak-classes=${(out.match(/ak-cell|answer-key-grid/g) || []).length}`);
  }
}
