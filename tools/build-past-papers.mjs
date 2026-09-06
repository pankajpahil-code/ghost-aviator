// ─────────────────────────────────────────────────────────────────────────────
// Past-papers pipeline: parses paper-wise question-bank PDFs where the correct
// option is printed in a distinct (bold) font, and emits papers for the site's
// "Previous Year Papers" section.
//
// Format handled:
//     Question Paper No. 1 / QUESTION PAPER -2 / Paper – 5 / PAPER NO. 8 ...
//     1. <question>
//     a. <option>            ← normal font
//     b. <option>            ← distinct font = CORRECT ANSWER
//
// Answer detection: within a question, the option carrying a font that appears
// in exactly one option is the marked answer. Ambiguous questions are SKIPPED —
// we never guess an answer key.
//
// Output is deliberately anonymous: papers are titled by SUBJECT only
// ("Air Regulations — Previous Year Paper N"), never by source/author.
//
// Usage (from ghost-aviator dir):  node tools/build-past-papers.mjs
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
    input: "Air Regs Question Bank (with answers).pdf",
    out: "past-papers-air-regulations.ts",
    exportName: "AIR_REGULATIONS_PAPERS",
    subjectId: "air-regulations",
    subjectName: "Air Regulations",
    track: "cpl",
    kind: "Previous Year Paper",
  },
];

// ── Extract lines, keeping the SET of fonts on each line ────────────────────
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
      byY.get(y).push({ x: it.transform[4], str: it.str, font: it.fontName, width: it.width, height: it.height });
    }
    for (const [, items] of [...byY.entries()].sort((a, b) => b[0] - a[0])) {
      items.sort((a, b) => a.x - b.x);
      let text = "", prevEnd = null;
      const fonts = new Map(); // font → char count
      for (const i of items) {
        const h = i.height || 10;
        if (prevEnd !== null) {
          const gap = i.x - prevEnd;
          if (gap > 0.22 * h && !/\s$/.test(text) && !/^\s/.test(i.str)) text += " ";
        }
        text += i.str;
        prevEnd = i.x + (i.width || 0);
        fonts.set(i.font, (fonts.get(i.font) || 0) + i.str.trim().length);
      }
      text = text.replace(/\s+/g, " ").trim();
      if (!text) continue;
      lines.push({ text, fonts });
    }
  }
  return lines;
}

const clean = s => s.replace(/ /g, " ").replace(/\s+/g, " ").trim();

// "Question Paper No. 1" / "QUESTION PAPER -2" / "Paper – 5" / "AIR REGULATION PAPER NO. 13"
const PAPER_RE = /^[A-Za-z ]*?paper\s*(?:no\.?)?\s*[-–—]?\s*(\d{1,2})\s*\.?$/i;
const Q_RE     = /^(\d{1,3})[.)]\s*(.+)$/;
const OPT_RE   = /^([a-d])[.)]\s*(.*)$/i;
const NOISE_RE = /^(\d{1,3}|AR-\d+|AIR REGULATIONS? \d+|CPL LEVEL|QUESTIONS? BANK)$/i;

function parse(lines) {
  const papers = [];
  const skips = { noAnswer: 0, ambiguous: 0, badOpts: 0 };
  let paper = null;
  let cur = null; // { qText, opts: [{ text, fonts:Map }] }

  const flushQ = () => {
    if (!cur || !paper) { cur = null; return; }
    const q = clean(cur.qText);
    const opts = cur.opts;
    cur = null;
    if (!q || opts.length < 3 || opts.length > 5) { skips.badOpts++; return; }

    // For each font, count how many options contain it (by meaningful chars).
    const optFonts = opts.map(o => new Set([...o.fonts.entries()].filter(([, n]) => n >= 2).map(([f]) => f)));
    const presence = {};
    for (const s of optFonts) for (const f of s) presence[f] = (presence[f] || 0) + 1;
    // Candidate answer fonts: present in exactly one option, and NOT the
    // dominant body font (the one present in most options).
    const candidates = Object.entries(presence).filter(([, n]) => n === 1).map(([f]) => f);
    const marked = new Set();
    for (const f of candidates) optFonts.forEach((s, i) => { if (s.has(f)) marked.add(i); });
    if (marked.size === 0) { skips.noAnswer++; return; }
    if (marked.size > 1)  { skips.ambiguous++; return; }
    const ans = [...marked][0];

    paper.questions.push({ q, opts: opts.map(o => clean(o.text)), ans });
  };

  for (const { text, fonts } of lines) {
    const mPaper = text.match(PAPER_RE);
    if (mPaper) {
      flushQ();
      const n = +mPaper[1];
      paper = { n, questions: [] };
      papers.push(paper);
      continue;
    }
    if (NOISE_RE.test(text)) continue;

    const mOpt = text.match(OPT_RE);
    if (mOpt && cur) { cur.opts.push({ text: mOpt[2], fonts }); continue; }

    const mQ = text.match(Q_RE);
    if (mQ && (!cur || cur.opts.length >= 2)) { flushQ(); cur = { qText: mQ[2], opts: [] }; continue; }

    // continuation line
    if (cur) {
      if (cur.opts.length) {
        const last = cur.opts[cur.opts.length - 1];
        last.text += " " + text;
        for (const [f, n] of fonts) last.fonts.set(f, (last.fonts.get(f) || 0) + n);
      } else {
        cur.qText += " " + text;
      }
    }
  }
  flushQ();
  return { papers, skips };
}

const tsStr = s => "`" + s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") + "`";

for (const cfg of MANIFEST) {
  const lines = await extractLines(cfg.input);
  const { papers, skips } = parse(lines);

  const out = [
    `import type { PastPaper } from "../past-papers";`,
    ``,
    `// AUTO-GENERATED by tools/build-past-papers.mjs — do not edit by hand.`,
    `// ${papers.length} papers · ${papers.reduce((n, p) => n + p.questions.length, 0)} questions (answers from the printed key)`,
    `export const ${cfg.exportName}: PastPaper[] = [`,
  ];
  for (const p of papers) {
    out.push(`  {`);
    out.push(`    id: "${cfg.subjectId}-paper-${p.n}",`);
    out.push(`    subjectId: "${cfg.subjectId}",`);
    out.push(`    track: "${cfg.track}",`);
    out.push(`    title: ${tsStr(`${cfg.subjectName} — ${cfg.kind} ${p.n}`)},`);
    out.push(`    questions: [`);
    for (const q of p.questions) {
      out.push(`      { q: ${tsStr(q.q)}, opts: [${q.opts.map(tsStr).join(", ")}], ans: ${q.ans} },`);
    }
    out.push(`    ],`);
    out.push(`  },`);
  }
  out.push(`];`, ``);

  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, cfg.out), out.join("\n"), "utf8");
  console.log(`✓ ${cfg.subjectName}: ${papers.length} papers, ${papers.reduce((n, p) => n + p.questions.length, 0)} questions → lib/generated/${cfg.out}`);
  console.log(`  per paper:`, papers.map(p => `#${p.n}:${p.questions.length}`).join(" "));
  console.log(`  skipped:`, skips);
}
