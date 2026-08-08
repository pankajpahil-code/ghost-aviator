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
import cp from "node:child_process";

const files = cp.execSync("find public/content -name notes.html").toString().trim().split("\n");
let ok = 0, nullres = 0;
const bad: string[][] = [];
let totalCss = 0, totalHtml = 0, maxHtml = 0, maxFile = "";

for (const f of files) {
  const m = f.match(/public\/content\/([^/]+)\/([^/]+)\/notes\.html/);
  if (!m) continue;
  const r = getInlineNotes(m[1], m[2]);
  if (!r) { nullres++; bad.push([`${m[1]}/${m[2]}`, "returned null — chapter would render nothing"]); continue; }
  ok++;
  totalCss += r.css.length;
  totalHtml += r.html.length;
  if (r.html.length > maxHtml) { maxHtml = r.html.length; maxFile = `${m[1]}/${m[2]}`; }

  const open = (r.css.match(/{/g) || []).length;
  const close = (r.css.match(/}/g) || []).length;
  if (open !== close) bad.push([`${m[1]}/${m[2]}`, `brace imbalance ${open}/${close} — scoper desynced`]);

  // Every rule must be confined to the container, or it styles the whole site.
  const unscoped = [...r.css.matchAll(/(^|\n)([^@{}\n][^{}\n]*)\{/g)]
    .map(x => x[2].trim())
    .filter(s => s && !s.split(",").every(p => p.trim().startsWith(".ga-notes")));
  if (unscoped.length) bad.push([`${m[1]}/${m[2]}`, `UNSCOPED: ${unscoped.slice(0, 2).join(" | ")}`]);

  // Regressions of the two defects that took a page down / hid it from search.
  if (/data:image/.test(r.html)) bad.push([`${m[1]}/${m[2]}`, "base64 image survived — run tools/extract-notes-images.mjs"]);
  if (/<script/i.test(r.html)) bad.push([`${m[1]}/${m[2]}`, "script survived into the app page"]);
}

console.log(`inlined ok: ${ok}   null: ${nullres}`);
console.log(`total css: ${(totalCss / 1024).toFixed(0)}KB   total html: ${(totalHtml / 1048576).toFixed(2)}MB`);
console.log(`largest chapter: ${maxFile} ${(maxHtml / 1024).toFixed(0)}KB`);
console.log(`PROBLEMS: ${bad.length}`);
bad.slice(0, 20).forEach(b => console.log("  ", b.join("  ")));

if (bad.length) process.exit(1);
