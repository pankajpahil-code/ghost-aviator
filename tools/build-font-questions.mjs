// ─────────────────────────────────────────────────────────────────────────────
// Font-aware question pipeline (for Indian QBs that mark the correct option in a
// distinct font/bold, e.g. IC Joshi). Uses pdfjs-dist to read per-line fonts.
//
// Format handled:
//     1. ATMOSPHERE              (topic heading → chapter)
//     001) <question>
//     a) <option>               ← normal font
//     b) <option>               ← distinct font = CORRECT ANSWER
//     c) <option>
//
// The correct option is detected as the "odd font out" within each question
// (exactly one option whose font differs from the rest). Questions where this is
// ambiguous (0 or >1 odd options) are SKIPPED — we never guess an answer.
//
// Usage (from ghost-aviator dir):  node tools/build-font-questions.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SOURCES = join(ROOT, "..");
const OUT_DIR = join(ROOT, "lib", "generated");

const MANIFEST = [
  {
    id: "icjoshi-met",
    label: "IC Joshi — Meteorology QB",
    input: "Share Met QB ic Joshi.pdf",
    subjectIds: ["meteorology", "atpl-meteorology"],
    exportName: "ICJOSHI_MET",
    // IC Joshi topic number → app met chapter (reviewable by domain expert)
    topicMap: {
      1: "met-1",  2: "met-1",  3: "met-1",  4: "met-1",  5: "met-4",
      6: "met-3",  7: "met-4",  8: "met-4",  9: "met-1",  10: "met-9",
      11: "met-5", 12: "met-9", 13: "met-9", 14: "met-6", 15: "met-3",
      17: "met-9", 18: "met-7", 19: "met-8", 20: "met-3", 21: "met-10",
    },
  },
];

// ── Extract lines with their dominant font (reading order) ───────────────────
async function extractLines(input) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(readFileSync(join(SOURCES, input)));
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true, verbosity: 0 }).promise;
  const lines = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const tc = await page.getTextContent();
    const byY = new Map();
    for (const it of tc.items) {
      if (!it.str || !it.str.trim()) continue;
      const y = Math.round(it.transform[5]);
      if (!byY.has(y)) byY.set(y, []);
      byY.get(y).push({ x: it.transform[4], str: it.str, font: it.fontName });
    }
    for (const [, items] of [...byY.entries()].sort((a, b) => b[0] - a[0])) {
      items.sort((a, b) => a.x - b.x);
      // Reconstruct spaces from x-gaps (some fonts emit glyphs with no space items).
      let text = "";
      let prevEnd = null;
      for (const i of items) {
        const h = i.height || 10;
        if (prevEnd !== null) {
          const gap = i.x - prevEnd;
          const endsSpace = /\s$/.test(text);
          const startsSpace = /^\s/.test(i.str);
          if (gap > 0.22 * h && !endsSpace && !startsSpace) text += " ";
        }
        text += i.str;
        prevEnd = i.x + (i.width || 0);
      }
      text = text.replace(/\s+/g, " ").trim();
      if (!text) continue;
      // dominant font = font covering the most characters
      const w = {};
      for (const i of items) w[i.font] = (w[i.font] || 0) + i.str.length;
      const font = Object.entries(w).sort((a, b) => b[1] - a[1])[0][0];
      lines.push({ text, font });
    }
  }
  return lines;
}

function clean(s) {
  return s.replace(/ /g, " ").replace(/\s+/g, " ").trim();
}

const TOPIC_RE = /^(\d{1,2})\.\s+([A-Z].{2,})$/;
const Q_RE     = /^(\d{1,3})\)\s*(.*)$/;
const OPT_RE   = /^([a-dA-D])\)\s*(.*)$/;
const PAGE_RE  = /^\d{1,3}$/; // stray page numbers

function parseFontMarked(lines, src) {
  const out = [];
  const skips = { noAnswer: 0, ambiguous: 0, badOpts: 0, noChapter: 0 };
  let chapterId = null, subtopic = null;
  let cur = null; // { qText, opts:[{label,text,font}] }

  const flush = () => {
    if (!cur) return;
    const q = clean(cur.qText);
    const opts = cur.opts;
    cur = null;
    if (!chapterId) { skips.noChapter++; return; }
    if (!q || opts.length < 3) { skips.badOpts++; return; }

    // answer = the single option whose font differs from the others
    const fontCount = {};
    for (const o of opts) fontCount[o.font] = (fontCount[o.font] || 0) + 1;
    const odd = opts.filter(o => fontCount[o.font] === 1);
    if (odd.length === 0) { skips.noAnswer++; return; }
    if (odd.length > 1)  { skips.ambiguous++; return; }
    const ans = opts.indexOf(odd[0]);

    out.push({
      subjectIds: src.subjectIds,
      chapterId,
      subtopic: subtopic || undefined,
      source: src.label,
      q,
      opts: opts.map(o => clean(o.text)),
      ans,
      exp: `Correct answer: ${"ABCD"[ans]}.` + (subtopic ? ` Topic: ${subtopic}.` : "") + ` (Source: ${src.label}.)`,
    });
  };

  for (const { text, font } of lines) {
    const mTopic = text.match(TOPIC_RE);
    if (mTopic) { flush(); const n = +mTopic[1]; chapterId = src.topicMap[n] || null; subtopic = clean(mTopic[2]); continue; }

    const mQ = text.match(Q_RE);
    if (mQ && !OPT_RE.test(text)) { flush(); cur = { qText: mQ[2], opts: [] }; continue; }

    const mOpt = text.match(OPT_RE);
    if (mOpt && cur) { cur.opts.push({ label: mOpt[1], text: mOpt[2], font }); continue; }

    if (PAGE_RE.test(text)) continue;
    // continuation
    if (cur) {
      if (cur.opts.length) cur.opts[cur.opts.length - 1].text += " " + text;
      else cur.qText += " " + text;
    }
  }
  flush();
  return { questions: out, skips };
}

const tsStr = s => "`" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";

function emit(src, questions) {
  const byChapter = {};
  for (const q of questions) byChapter[q.chapterId] = (byChapter[q.chapterId] || 0) + 1;
  const lines = [
    `import type { DemoQuestion } from "../demo-questions";`,
    ``,
    `// AUTO-GENERATED by tools/build-font-questions.mjs — do not edit by hand.`,
    `// Source: ${src.label} (answer detected via distinct option font)`,
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

for (const src of MANIFEST) {
  const lines = await extractLines(src.input);
  const { questions, skips } = parseFontMarked(lines, src);
  const { outPath, byChapter } = emit(src, questions);
  console.log(`\n✓ ${src.label}`);
  console.log(`  ${questions.length} questions → ${outPath.replace(ROOT, ".")}`);
  console.log(`  per chapter:`, byChapter);
  console.log(`  skipped:`, skips);
}
