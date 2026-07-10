// Publish Capt. Pahil's own Air Navigation notes (self-contained HTML, inline SVG
// diagrams) into public/content/air-navigation/<chapter>/notes.html.
// Sources live in C:/Users/Admin/Downloads/nav (his generation pipeline drops them
// there). Add new chapters to CHAPTERS below and re-run.
// Usage: node tools/build-nav-notes.mjs   (then: node tools/protect-notes.mjs)
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_BASE = join(ROOT, "public", "content", "air-navigation");

const CHAPTERS = [
  {
    chapter: "nav-1",
    src: "C:/Users/Admin/Downloads/nav/DGCA_GenNav_Ch1_Direction_Lat_Long.html",
    replacements: [
      // CSP on /content/* blocks external stylesheets/fonts — drop Google Fonts,
      // font-family declarations fall back to system fonts.
      [/<link href="https:\/\/fonts\.googleapis\.com[^"]*" rel="stylesheet">\s*/g, ""],
      // Iron rule: no third-party source/author names in student-facing content.
      // Captain's rule: all students are equal — no "underprivileged" labels anywhere.
      ['General Navigation · CAE ATPL Series · Prepared for: <strong style="color:#f5d76e;">Underprivileged Student Pilots of India</strong>', "General Navigation · Ghost Aviator Series"],
      ['<span class="badge">Oxford Aviation Academy</span>', '<span class="badge">Ghost Aviator</span>'],
      ["Based on CAE Oxford Aviation Academy ATPL Series · Compiled for underprivileged student pilots of India", "For every student pilot of India"],
      ["Oxford Airport ARP: <code>51°50'N 001°19'W</code>", "Delhi (IGI) ARP: <code>28°34'N 077°07'E</code>"],
      // Latitude-slider place label: Bali is at 8°S, not 13°S — Darwin (12.5°S) is
      // both accurate at the -13 stop and keeps the name guard clean.
      ["'-13':'Bali, Indonesia'", "'-13':'Darwin, Australia'"],
      ["Questions from the Book", "Solved Practice Questions"],
    ],
  },
];

const FORBIDDEN = /\b(IC Joshi|Joshi|R\.?K\.? Bali|Bali|Oxford|CAE|Sahil|Surender|Redbird|Nordian|Keith Williams|underprivileged)\b/i;

for (const { chapter, src, replacements } of CHAPTERS) {
  let html = readFileSync(src, "utf8");
  for (const [from, to] of replacements) {
    const before = html;
    html = typeof from === "string" ? html.split(from).join(to) : html.replace(from, to);
    if (html === before) throw new Error(`${chapter}: replacement not applied: ${from}`);
  }
  const leak = html.match(FORBIDDEN);
  if (leak) throw new Error(`${chapter}: forbidden source name in output: "${leak[0]}"`);
  const dir = join(OUT_BASE, chapter);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "notes.html"), html, "utf8");
  console.log(`${chapter}: published (${(html.length / 1024).toFixed(0)} KB) from ${src}`);
}
console.log("Done. Now run: node tools/protect-notes.mjs");
