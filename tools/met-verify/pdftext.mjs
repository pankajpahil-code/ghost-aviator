// Usage: node pdftext.mjs "<pdf>" <startPage> <endPage>
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "node:fs";
const [,, file, s, e] = process.argv;
const start = parseInt(s), end = parseInt(e);
const data = new Uint8Array(fs.readFileSync(file));
const pdf = await getDocument({ data, useSystemFonts: true }).promise;
console.log(`### ${file} — ${pdf.numPages} pages total ###`);
for (let p = start; p <= Math.min(end, pdf.numPages); p++) {
  const page = await pdf.getPage(p);
  const tc = await page.getTextContent();
  // reconstruct lines by y-position
  const rows = {};
  for (const it of tc.items) {
    if (!it.str) continue;
    const y = Math.round(it.transform[5]);
    (rows[y] ??= []).push([it.transform[4], it.str]);
  }
  const lines = Object.keys(rows).map(Number).sort((a,b)=>b-a)
    .map(y => rows[y].sort((a,b)=>a[0]-b[0]).map(x=>x[1]).join(" ").replace(/\s+/g," ").trim())
    .filter(Boolean);
  console.log(`\n───── PAGE ${p} ─────`);
  console.log(lines.join("\n"));
}
