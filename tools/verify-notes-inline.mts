// Verifies that every chapter's notes.html still survives lib/notes-inline.ts.
//
// The chapter notes render INSIDE the app now rather than in an iframe, which
// means each chapter's own stylesheet is injected into a page it does not own.
// notes-inline.ts prevents collisions by prefixing every selector with
// `.ga-notes` — but the 234 chapters carry ~130 hand-varied stylesheets, so a
// newly generated chapter can always introduce CSS the scoper has not seen.
//
// Run this after ANY notes rebuild, before shipping. A failure here means a
// chapter would either leak its styles into the site or be mis-rendered.
//
//   npx tsx tools/verify-notes-inline.mts
//
// Exits non-zero when anything is wrong, so it can gate a build.

import { getInlineNotes } from "../lib/notes-inline";
import { readdirSync } from "node:fs";
import path from "node:path";

function findNotesFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) findNotesFiles(entryPath, out);
    else if (entry.name === "notes.html") out.push(entryPath);
  }
  return out;
}

const files = findNotesFiles(path.join(process.cwd(), "public", "content"));
let ok = 0, nullres = 0;
const bad: string[][] = [];
let totalCss = 0, totalHtml = 0, maxHtml = 0, maxFile = "";

for (const f of files) {
  const chapterId = path.basename(path.dirname(f));
  const subjectId = path.basename(path.dirname(path.dirname(f)));
  const chapterKey = `${subjectId}/${chapterId}`;
  const r = getInlineNotes(subjectId, chapterId);
  if (!r) { nullres++; bad.push([chapterKey, "returned null — chapter would render nothing"]); continue; }
  ok++;
  totalCss += r.css.length;
  totalHtml += r.html.length;
  if (r.html.length > maxHtml) { maxHtml = r.html.length; maxFile = chapterKey; }

  const open = (r.css.match(/{/g) || []).length;
  const close = (r.css.match(/}/g) || []).length;
  if (open !== close) bad.push([chapterKey, `brace imbalance ${open}/${close} — scoper desynced`]);

  // Every rule must be confined to the container, or it styles the whole site.
  const unscoped = [...r.css.matchAll(/(^|\n)([^@{}\n][^{}\n]*)\{/g)]
    .map(x => x[2].trim())
    .filter(s => s && !s.split(",").every(p => p.trim().startsWith(".ga-notes")));
  if (unscoped.length) bad.push([chapterKey, `UNSCOPED: ${unscoped.slice(0, 2).join(" | ")}`]);

  // Regressions of the two defects that took a page down / hid it from search.
  if (/data:image/.test(r.html)) bad.push([chapterKey, "base64 image survived — run tools/extract-notes-images.mjs"]);
  if (/<script/i.test(r.html)) bad.push([chapterKey, "script survived into the app page"]);
}

console.log(`inlined ok: ${ok}   null: ${nullres}`);
console.log(`total css: ${(totalCss / 1024).toFixed(0)}KB   total html: ${(totalHtml / 1048576).toFixed(2)}MB`);
console.log(`largest chapter: ${maxFile} ${(maxHtml / 1024).toFixed(0)}KB`);
console.log(`PROBLEMS: ${bad.length}`);
bad.slice(0, 20).forEach(b => console.log("  ", b.join("  ")));

if (bad.length) process.exit(1);
