// ─────────────────────────────────────────────────────────────────────────────
// "Technical General for Aviators" (Capt. Pankaj Pahil's own book, PDF) →
// per-chapter HTML study notes for the technical-general subject.
//
//   - splits the book text on "Chapter N: Title" headings (36 chapters, 5 parts)
//   - cleans PDF artifacts (page markers, footnote-reference digits, bullets)
//   - renders each chapter with the site's standard notes template and writes
//     public/content/technical-general/tg-N/notes.html (protection injected)
//
// Usage (from ghost-aviator dir):  node tools/build-techbook-notes.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { injectProtection } from "./_protect-snippet.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const INPUT = join(ROOT, "..", "technical book by pankaj pahil.pdf");
const OUT_BASE = join(ROOT, "public", "content", "technical-general");

// ── Extract raw text ─────────────────────────────────────────────────────────
const { PDFParse } = await import("pdf-parse");
const parser = new PDFParse({ data: new Uint8Array(readFileSync(INPUT)), verbosity: 0 });
const { text: raw } = await parser.getText();

// Body starts at the SECOND "Part I:" (the first belongs to the table of contents).
const firstPart = raw.indexOf("Part I:");
const bodyStart = raw.indexOf("Part I:", firstPart + 1);
let body = raw.slice(bodyStart);

// ── Cleaning ─────────────────────────────────────────────────────────────────
body = body
  .replace(/^-- \d+ of \d+ --$/gm, "")               // page markers
  .replace(/(\s)\d{1,3}(?=[A-Z][a-z])/g, "$1")        // "humidity. 23It is" → footnote digits
  .replace(/([a-z)])([.:;?])\s?\d{1,3}(\s)/g, "$1$2$3") // "word. 23 " footnote after punctuation
                                                         // (digit-led "1.5 Section" headings untouched)
  .replace(/\s\d{1,3}\s*$/gm, "")                     // line-trailing reference digits
  .replace(/q=21ρv2/g, "q = ½ ρ v²")                  // garbled core formula
  .replace(/21ρv2/g, "½ ρ v²")
  .replace(/ /g, " ");

// ── Split into parts/chapters ────────────────────────────────────────────────
const PART_RE = /^Part ([IVX]+): (.+)$/;
const CH_RE = /^Chapter (\d+): (.+)$/;

const lines = body.split("\n");
const chapters = []; // { n, title, part, lines: [] }
let part = "";
let cur = null;
for (const line0 of lines) {
  const line = line0.trim();
  if (!line) { if (cur) cur.lines.push(""); continue; }
  const mPart = line.match(PART_RE);
  if (mPart) { part = mPart[2].trim(); continue; }
  const mCh = line.match(CH_RE);
  if (mCh) { cur = { n: +mCh[1], title: mCh[2].trim(), part, lines: [] }; chapters.push(cur); continue; }
  if (cur) cur.lines.push(line);
}

// ── Render a chapter's lines to HTML ─────────────────────────────────────────
const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const SEC_RE = /^(\d+\.\d+)\s+(.+)$/;

function renderBody(chLines) {
  const out = [];
  let para = [];
  let listOpen = false;
  const flushPara = () => {
    if (!para.length) return;
    out.push(`<p>${esc(para.join(" "))}</p>`);
    para = [];
  };
  const closeList = () => { if (listOpen) { out.push("</ul>"); listOpen = false; } };

  for (const line of chLines) {
    if (!line) { flushPara(); closeList(); continue; }
    const mSec = line.match(SEC_RE);
    if (mSec) {
      flushPara(); closeList();
      out.push(`<h2 id="sec-${mSec[1].replace(".", "-")}">${esc(mSec[1])} ${esc(mSec[2])}</h2>`);
      continue;
    }
    if (/^[o]\s/.test(line) || /^/.test(line)) {
      flushPara();
      if (!listOpen) { out.push("<ul>"); listOpen = true; }
      out.push(`<li>${esc(line.replace(/^[o]\s*/, ""))}</li>`);
      continue;
    }
    // numbered definition lines ("1. Indicated Air Speed (IAS): ...") render as list items
    if (/^\d{1,2}\.\s+[A-Z]/.test(line)) {
      flushPara();
      if (!listOpen) { out.push("<ul>"); listOpen = true; }
      out.push(`<li>${esc(line)}</li>`);
      continue;
    }
    closeList();
    para.push(line);
  }
  flushPara(); closeList();
  return out.join("\n");
}

function pageHtml(ch) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Chapter ${ch.n} — ${esc(ch.title)} | Technical General | Ghost Aviator</title>
<style>
  body{font-family:Georgia,'Times New Roman',serif;max-width:860px;margin:0 auto;padding:28px 22px;background:#fdfdfb;color:#1d2733;line-height:1.75;}
  .cover{text-align:center;border-bottom:3px double #2c5aa0;margin-bottom:28px;padding-bottom:18px;}
  .cover h1{color:#2c5aa0;margin:6px 0;font-size:1.7em;}
  .cover .part{color:#8a4baf;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;font-size:.85em;}
  .cover .author{color:#555;font-style:italic;margin-top:6px;}
  h2{color:#2c5aa0;border-left:5px solid #2c5aa0;padding-left:10px;margin-top:30px;}
  ul{padding-left:24px;margin:10px 0;}
  li{margin:5px 0;}
  p{margin:10px 0;text-align:justify;}
  .footer{margin-top:36px;border-top:1px solid #ccc;padding-top:10px;color:#777;font-size:.85em;text-align:center;}
</style>
</head>
<body>
<div class="cover">
  <div class="part">${esc(ch.part)}</div>
  <h1>Chapter ${ch.n}: ${esc(ch.title)}</h1>
  <p class="author">Technical General for Aviators — Capt. Pankaj Pahil</p>
</div>
${renderBody(ch.lines)}
<div class="footer">© Ghost Aviator · Technical General for Aviators · Capt. Pankaj Pahil</div>
</body>
</html>
`;
}

// ── Write ────────────────────────────────────────────────────────────────────
let written = 0;
for (const ch of chapters) {
  const dir = join(OUT_BASE, `tg-${ch.n}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "notes.html"), injectProtection(pageHtml(ch)), "utf8");
  written++;
}
console.log(`✓ ${written} chapters → public/content/technical-general/tg-N/notes.html`);
console.log(chapters.map(c => `tg-${c.n}: ${c.title} [${c.part}] (${c.lines.filter(Boolean).length} lines)`).join("\n"));
