// tools/audit/answer-key-inventory.mjs
// READ-ONLY inventory of "answer key" artifacts in notes pages.
// Purpose: classify every occurrence (heading / comment / link / text) and measure
// whether the chapter has inline answers, so removal of stale key grids is scoped safely.
// Writes tools/audit/answer-key-inventory-<date>.tsv and prints a per-file summary.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('public/content');
const OUT = path.resolve('tools/audit/answer-key-inventory-2026-10-17.tsv');

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name === 'notes.html') yield p;
  }
}

const ANY = /answer\s*key/i;
const files = [...walk(ROOT)].sort();
const rowsOut = ['file\tline\tkind\ttrimmed'];
const summary = [];

for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  const lines = text.split(/\r?\n/);
  const rel = path.relative('.', f).replaceAll('\\', '/');

  let headings = 0, comments = 0, links = 0, texts = 0, anyCount = 0;
  const inline = (text.match(/qa-answer|ans-label|class="answer"|<details class="qa"|Show answer|\u2705/gi) || []).length;
  const hasQHeader = /<th>\s*Q\s*<\/th>/i.test(text);

  lines.forEach((ln, i) => {
    if (!ANY.test(ln)) return;
    anyCount++;
    const t = ln.trim();
    let kind = 'TEXT';
    if (/^<h[1-6][^>]*>/i.test(t)) { kind = 'HEADING'; headings++; }
    else if (/\/\*|<!--/.test(t)) { kind = 'COMMENT'; comments++; }
    else if (/<a\s|<li>|toc/i.test(t)) { kind = 'LINK'; links++; }
    else { texts++; }
    rowsOut.push([rel, i + 1, kind, t.slice(0, 170)].join('\t'));
  });

  summary.push({ rel, anyCount, headings, comments, links, texts, inline, hasQHeader });
}

fs.writeFileSync(OUT, '\ufeff' + rowsOut.join('\n'), 'utf8');

const withAny = summary.filter((s) => s.anyCount > 0);
console.log('WROTE', OUT);
console.log('files scanned:', files.length);
console.log('files with any match:', withAny.length);
console.log('');
console.log('rel\tany\theadings\tcomments\tlinks\ttext\tinlineMarkers\thasQHdr');
for (const s of withAny) {
  console.log([s.rel, s.anyCount, s.headings, s.comments, s.links, s.texts, s.inline, s.hasQHeader ? 'Y' : 'n'].join('\t'));
}
