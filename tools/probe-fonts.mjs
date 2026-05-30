// Reading-order font probe: groups text items into lines (sorted top→bottom,
// left→right) and tags each line with its font, to test whether exactly one
// option per question is in a distinct "answer" font.
// Usage: node tools/probe-fonts.mjs "<file.pdf>" <page>
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const SOURCES = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const file = process.argv[2];
const pageNum = parseInt(process.argv[3] || "2", 10);

const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
const data = new Uint8Array(readFileSync(join(SOURCES, file)));
const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
const page = await doc.getPage(pageNum);
const tc = await page.getTextContent();

// Build lines keyed by rounded Y.
const lines = new Map();
for (const it of tc.items) {
  if (!it.str || !it.str.trim()) continue;
  const y = Math.round(it.transform[5]);
  if (!lines.has(y)) lines.set(y, []);
  lines.get(y).push({ x: it.transform[4], str: it.str, font: it.fontName });
}
const ordered = [...lines.entries()].sort((a, b) => b[0] - a[0]); // top → bottom
for (const [, items] of ordered) {
  items.sort((a, b) => a.x - b.x);
  const text = items.map(i => i.str).join("");
  const fonts = [...new Set(items.map(i => i.font))].join(",");
  console.log(`[${fonts}] ${text}`);
}
