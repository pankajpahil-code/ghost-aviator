// Remove third-party source/author names from every published notes.html
// (iron rule: nothing student-facing names IC Joshi, RK Bali, Oxford, CAE…).
// Ordered replacements: specific phrases first, generic fallbacks last.
// Idempotent — safe to re-run after any notes rebuild. Prints anything it
// could not fix so it can be handled by hand.
// Usage: node tools/scrub-source-names.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT = join(ROOT, "public", "content");

const REPLACEMENTS = [
  // Instrumentation (Oxford)
  [/<div class="subtitle">Oxford Aviation Academy — Instrumentation<\/div>/g,
   '<div class="subtitle">Ghost Aviator — Instrumentation</div>'],
  [/Source: Oxford Aviation Academy Instrumentation/g, "Ghost Aviator Instrumentation"],
  // Meteorology (IC Joshi) — subtitles & source lines
  [/Source:\s*IC Joshi\s*(?:—|-)\s*Aviation Meteorology(?:\s*\(Latest Edition\))?/g,
   "DGCA CPL/ATPL Study Notes — Aviation Meteorology"],
  [/Based on:?\s*IC Joshi Aviation Meteorology(?:\s*Textbook)?/g,
   "DGCA CPL/ATPL Aviation Meteorology Notes"],
  [/IC Joshi Textbook \| /g, ""],
  [/IC Joshi \| (Chapter[^|<]*?)\s*\| Pages[^<]*/g, "$1"],
  [/All questions extracted verbatim from IC Joshi\. Answer key from textbook\./g,
   "Practice questions with verified answer key."],
  [/ from IC Joshi \(Table/g, " (Table"],
  [/verbatim from the IC Joshi textbook/g, "from the textbook question bank"],
  [/Completion of IC Joshi Aviation Meteorology/g, "Completion of Aviation Meteorology"],
  [/COURSE COMPLETE — IC Joshi Aviation Meteorology/g, "COURSE COMPLETE — Aviation Meteorology"],
  // Air Regulations (RK Bali)
  [/\(from Official RK Bali Source\)/g, "(verified answer key)"],
  [/ \(RK Bali \d+(?:st|nd|rd|th) Edition\)/g, ""],
  // Generic fallbacks — run last
  [/IC Joshi\s*(?:—|-)\s*Aviation Meteorology/g, "Aviation Meteorology"],
  [/IC Joshi Aviation Meteorology/g, "Aviation Meteorology"],
];

// Verification: real-text mentions only (long base64 runs can contain
// accidental substrings of short names — the patterns below are specific
// enough not to occur in base64).
const FORBIDDEN_NAMES = JSON.parse(
  readFileSync(join(ROOT, "tools", "forbidden-source-names.json"), "utf8")).names;
// Joined unescaped, so refuse anything with regex meaning rather than silently
// building a pattern that matches something else.
for (const n of FORBIDDEN_NAMES) {
  if (!/^[A-Za-z0-9 -]+$/.test(n)) {
    throw new Error(`forbidden-source-names.json: "${n}" is not plain text`);
  }
}
const FORBIDDEN = new RegExp("(" + FORBIDDEN_NAMES.join("|") + ")");

let changed = 0, total = 0;
const unresolved = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (name !== "notes.html") continue;
    total++;
    const before = readFileSync(p, "utf8");
    let out = before;
    for (const [re, to] of REPLACEMENTS) out = out.replace(re, to);
    if (out !== before) { writeFileSync(p, out, "utf8"); changed++; }
    const leak = out.match(FORBIDDEN);
    if (leak) {
      const i = out.search(FORBIDDEN);
      unresolved.push(`${relative(CONTENT, p)} → "${out.slice(Math.max(0, i - 60), i + 60).replace(/\s+/g, " ")}"`);
    }
  }
}

walk(CONTENT);
console.log(`Scrubbed ${changed}/${total} notes.html files`);
if (unresolved.length) {
  console.log(`\nUNRESOLVED (fix by hand):`);
  unresolved.forEach(u => console.log("  " + u));
  process.exitCode = 1;
} else {
  console.log("No source names remain in published notes.");
}
