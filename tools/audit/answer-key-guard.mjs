// tools/audit/answer-key-guard.mjs
//
// GUARD: no hardcoded answer-key grids or key text may (re)appear in the
// notes pages. Captain's ruling (Oct 2026): the inline answer attached to
// each question is the single visible answer source; keys belong to the
// question dataset, never to a table on a notes page.
//
// SCOPE
//   STRICT (build-failing): public/content/meteorology - cleaned 2026-10-17
//     (commit c343c07). Only allowed text there: the two descriptive lead-ins
//     written by the source scrub ("Practice questions with verified answer
//     key."). They carry no answers.
//   REPORT-ONLY: every other subject. They await their own per-subject passes
//     (scope: tools/audit/answer-key-inventory-2026-10-17.tsv). When a subject
//     finishes its pass, move it into the STRICT list below.
//
// USAGE
//   node tools/audit/answer-key-guard.mjs           report only, exit 0
//   node tools/audit/answer-key-guard.mjs --check   exit 1 if STRICT scope dirty
//
// The --check form runs in `npm run build`, so a key grid cannot silently
// return to the meteorology notes.

import fs from "node:fs";
import path from "node:path";

const CHECK = process.argv.includes("--check");
const CONTENT = path.join("public", "content");
const STRICT_DIRS = [path.join(CONTENT, "meteorology")];
const ALLOWED_TEXT = [/Practice questions with verified answer key\./];

const KEY_TEXT = /answer[-\s_]*key/i;
const GRID_CLASS = /answer-key-grid|answer-grid|answer-cell|ak-cell/i;

function* walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.name === "notes.html") yield p;
  }
}

/** Strip HTML and CSS comments from one line; track multi-line HTML comments. */
function stripComments(line, state) {
  let out = line;
  if (state.inHtml) {
    const close = out.indexOf("-->");
    if (close === -1) return "";
    out = out.slice(close + 3);
    state.inHtml = false;
  }
  let again = true;
  while (again) {
    again = false;
    const s = out.indexOf("<!--");
    if (s !== -1) {
      const e = out.indexOf("-->", s);
      if (e === -1) {
        out = out.slice(0, s);
        state.inHtml = true;
      } else {
        out = out.slice(0, s) + out.slice(e + 3);
        again = true;
      }
    }
  }
  return out.replace(/\/\*.*?\*\//g, "");
}

const strictHits = [];
const pending = new Map(); // subject -> [{file, line, text}]

for (const file of walk(CONTENT)) {
  const rel = file.split(path.sep).join("/");
  const abs = path.resolve(file);
  const isStrict = STRICT_DIRS.some((d) => abs.startsWith(path.resolve(d) + path.sep));
  const subject = rel.split("/")[2] || "?";
  const state = { inHtml: false };
  fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((rawLine, i) => {
      const line = stripComments(rawLine, state);
      const hasText = KEY_TEXT.test(line);
      const hasGridClass = GRID_CLASS.test(line);
      if (!hasText && !hasGridClass) return;
      if (hasText && ALLOWED_TEXT.some((a) => a.test(rawLine))) return;
      const rec = { file: rel, line: i + 1, text: rawLine.trim().slice(0, 110) };
      if (isStrict) strictHits.push(rec);
      else {
        if (!pending.has(subject)) pending.set(subject, []);
        pending.get(subject).push(rec);
      }
    });
}

if (strictHits.length) {
  console.log(`STRICT (meteorology): ${strictHits.length} violation(s)`);
  for (const r of strictHits) console.log(`  ${r.file}:${r.line}  ${r.text}`);
} else {
  console.log("STRICT (meteorology): clean - no answer-key text or grid classes.");
}

if (pending.size) {
  console.log("\nPENDING (report-only, other subjects - each awaits its own pass):");
  for (const [s, rows] of [...pending.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${s}: ${rows.length} occurrence(s) in ${new Set(rows.map((r) => r.file)).size} file(s)`);
  }
} else {
  console.log("\nPENDING: none anywhere.");
}

if (CHECK && strictHits.length) {
  console.error("\nBuild blocked: hardcoded answer-key content reappeared in the meteorology notes.");
  process.exit(1);
}
console.log(CHECK ? "\nGuard OK." : "\nReport only (pass --check to fail the build on strict violations).");
