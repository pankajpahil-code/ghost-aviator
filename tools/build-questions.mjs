// ─────────────────────────────────────────────────────────────────────────────
// Question-bank build pipeline (ECQB / "8260"-style sources)
//
// Parses aviation question banks that use the EASA Central Question Bank layout:
//
//     061 – GENERAL NAVIGATION          (subject)
//     061-01 BASICS OF NAVIGATION       (chapter)
//     061-01-01 The Solar System        (subtopic)
//     8260. <question text...>
//     A – <option>
//     B – <option>
//     C – <option>
//     D – <option>
//     Ref: ...
//     Ans: D
//
// Every question keeps its chapter + subtopic from the source headings, so the
// output is chapter/topic-wise — never a hotpot. Chapter codes are mapped to the
// app's chapter IDs via each source's `chapterMap` in the MANIFEST below.
//
// Usage (from the ghost-aviator dir):  node tools/build-questions.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { PDFParse } from "pdf-parse";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");          // ghost-aviator/
const SOURCES = join(ROOT, "..");            // D:\pk  (where the PDFs live)
const OUT_DIR = join(ROOT, "lib", "generated");

// ── MANIFEST ─────────────────────────────────────────────────────────────────
// One entry per source. Add new sources here; the parser is shared.
const MANIFEST = [
  {
    id: "ecqb-061-navigation",
    label: "ECQB 061 — General Navigation",
    input: "GENERAL NAVIGATION 25576 QUESTIONS.pdf", // relative to D:\pk
    subjectIds: ["air-navigation", "atpl-navigation"],
    exportName: "ECQB_061_NAVIGATION",
    // EASA 061 chapter code → app chapter id (see lib/subjects.ts)
    chapterMap: {
      "01": "nav-1", // Basics of Navigation
      "02": "nav-2", // Magnetism & Compasses
      "03": "nav-3", // Charts
      "04": "nav-4", // Dead Reckoning Navigation
      "05": "nav-5", // In-Flight Navigation
      "06": "nav-5", // Inertial Navigation Systems → closest: In-Flight Navigation
    },
  },
];

// ── Text extraction (cached to .txt next to source) ──────────────────────────
async function extractText(input) {
  const pdfPath = join(SOURCES, input);
  const cachePath = pdfPath.replace(/\.pdf$/i, ".extracted.txt");
  if (existsSync(cachePath)) return readFileSync(cachePath, "utf8");
  const buf = readFileSync(pdfPath);
  const parser = new PDFParse({ data: new Uint8Array(buf), verbosity: 0 });
  const r = await parser.getText();
  writeFileSync(cachePath, r.text, "utf8");
  return r.text;
}

// ── Cleanup ──────────────────────────────────────────────────────────────────
function clean(s) {
  return s
    .replace(/ /g, " ")
    .replace(/(\d)o(?=[A-Z\s)\-,.\/]|$)/g, "$1°") // 90o → 90°, 23oN → 23°N
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

const SUBTOPIC_RE = /^(\d{3})-(\d{2})-(\d{2})\s+(.+)$/;
const CHAPTER_RE  = /^(\d{3})-(\d{2})\s+(.+)$/;
const QSTART_RE   = /^(\d{2,5})\.\s+(.*)$/;
const OPT_RE      = /^([A-D])\s*[–\-).]\s*(.+)$/;
const ANS_RE      = /^Ans:\s*([A-D])\b/i;
const PAGE_RE     = /^--\s*\d+\s*of\s*\d+\s*--$/i;

// ── Parse one ECQB source into tagged questions ──────────────────────────────
function parseEcqb(text, src) {
  const lines = text.split(/\r?\n/);
  const out = [];
  const seen = new Set();
  const skips = { noChapter: 0, badOpts: 0, noAns: 0 };

  let chapterCode = null, subtopic = null;
  let cur = null; // { qLines, opts:{A,B,C,D}, optOrder, curOpt, ans }

  const flush = () => {
    if (!cur) return;
    const q = clean(cur.qLines.join(" ").replace(/^\d+\.\s*/, ""));
    const opts = ["A", "B", "C", "D"]
      .map(L => cur.opts[L] ? clean(cur.opts[L].join(" ")) : null)
      .filter(Boolean);
    const chapterId = chapterCode ? src.chapterMap[chapterCode] : undefined;
    cur = null;

    if (!chapterId) { skips.noChapter++; return; }
    if (!q || opts.length < 3) { skips.badOpts++; return; }
    const ansLetter = lastAns;
    if (!ansLetter) { skips.noAns++; return; }
    const ans = ansLetter.charCodeAt(0) - 65;
    if (ans < 0 || ans >= opts.length) { skips.badOpts++; return; }

    const key = q.toLowerCase().slice(0, 80);
    if (seen.has(key)) return; // de-dupe within source
    seen.add(key);

    out.push({
      subjectIds: src.subjectIds,
      chapterId,
      subtopic: subtopic || undefined,
      source: src.label,
      q, opts, ans,
      exp: `Correct answer: ${ansLetter}.` + (subtopic ? ` Topic: ${subtopic}.` : ""),
    });
  };

  // `lastAns` carries the Ans letter to flush(); reset each question.
  let lastAns = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || PAGE_RE.test(line) || /^Ref:/i.test(line)) continue;

    const mSub = line.match(SUBTOPIC_RE);
    if (mSub) { flush(); chapterCode = mSub[2]; subtopic = clean(mSub[4]); continue; }

    const mCh = line.match(CHAPTER_RE);
    if (mCh && !mSub) { flush(); chapterCode = mCh[2]; subtopic = null; continue; }

    const mAns = line.match(ANS_RE);
    if (mAns) { lastAns = mAns[1].toUpperCase(); flush(); lastAns = null; continue; }

    const mQ = line.match(QSTART_RE);
    if (mQ) { flush(); cur = { qLines: [mQ[2]], opts: {}, curOpt: null }; lastAns = null; continue; }

    const mOpt = line.match(OPT_RE);
    if (mOpt && cur) { cur.curOpt = mOpt[1]; (cur.opts[mOpt[1]] ||= []).push(mOpt[2]); continue; }

    // continuation line
    if (cur) {
      if (cur.curOpt) cur.opts[cur.curOpt].push(line);
      else cur.qLines.push(line);
    }
  }
  flush();
  return { questions: out, skips };
}

// ── Emit a TypeScript module ─────────────────────────────────────────────────
const tsStr = s => "`" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";

function emit(src, questions) {
  const byChapter = {};
  for (const q of questions) byChapter[q.chapterId] = (byChapter[q.chapterId] || 0) + 1;

  const lines = [
    `import type { DemoQuestion } from "../demo-questions";`,
    ``,
    `// AUTO-GENERATED by tools/build-questions.mjs — do not edit by hand.`,
    `// Source: ${src.label}`,
    `// ${questions.length} questions · per chapter: ${JSON.stringify(byChapter)}`,
    `export const ${src.exportName}: DemoQuestion[] = [`,
  ];
  for (const q of questions) {
    lines.push(`  {`);
    lines.push(`    subjectIds: ${JSON.stringify(q.subjectIds)},`);
    lines.push(`    chapterId: ${JSON.stringify(q.chapterId)},`);
    if (q.subtopic) lines.push(`    subtopic: ${tsStr(q.subtopic)},`);
    lines.push(`    source: ${tsStr(q.source)},`);
    lines.push(`    q: ${tsStr(q.q)},`);
    lines.push(`    opts: [${q.opts.map(tsStr).join(", ")}],`);
    lines.push(`    ans: ${q.ans},`);
    lines.push(`    exp: ${tsStr(q.exp)},`);
    lines.push(`  },`);
  }
  lines.push(`];`, ``);
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, `${src.id}.ts`);
  writeFileSync(outPath, lines.join("\n"), "utf8");
  return { outPath, byChapter };
}

// ── Run ──────────────────────────────────────────────────────────────────────
for (const src of MANIFEST) {
  const text = await extractText(src.input);
  const { questions, skips } = parseEcqb(text, src);
  const { outPath, byChapter } = emit(src, questions);
  console.log(`\n✓ ${src.label}`);
  console.log(`  ${questions.length} questions → ${outPath.replace(ROOT, ".")}`);
  console.log(`  per chapter:`, byChapter);
  console.log(`  skipped:`, skips);
}
