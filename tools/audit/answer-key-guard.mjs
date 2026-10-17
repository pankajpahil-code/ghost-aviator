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
//   STRICT (build-failing): public/content/radio-navigation - cleaned 2026-10-17
//     (7 "Answer Key" grids + 1 specimen box removed; inline answers verified
//     per question before removal).
//   STRICT (build-failing): public/content/air-navigation - cleaned 2026-10-17
//     (12 answer-key tables/grids + 5 dead key-CSS blocks removed; 25 prose
//     mentions reworded; every grid entry verified present inline before
//     removal - including nav-21, whose "Quick Answer Summary" grid carried no
//     phrase text and was found by structure alone). No allowed-text exceptions.
//     This pass also widened GRID_CLASS: earlier passes matched legacy grid
//     class names only, so the .ans-key/.key-grid/.key-cell family went
//     undetected - which is exactly how nav-21 had slipped through.
//   2026-10-17 follow-up: the guard now also detects bare answer grids by
//     STRUCTURE - a table whose header row is 3+ Q-numbered (or sequential
//     1..N) cells followed by a same-count row of single letters A-D. Added
//     after the air-regulations recon found ar-15 L986-991, a grid with no key
//     phrase and no grid class anywhere near it, invisible to phrase/class.
//   REPORT-ONLY: every other subject. They await their own per-subject passes
//     (scope: tools/audit/answer-key-inventory-2026-10-17.tsv). When a subject
//     finishes its pass, move it into the STRICT list below.
//
// USAGE
//   node tools/audit/answer-key-guard.mjs           report only, exit 0
//   node tools/audit/answer-key-guard.mjs --check   exit 1 if STRICT scope dirty
//
// The --check form runs in `npm run build`, so a key grid cannot silently
// return to a cleaned notes scope (meteorology, radio-navigation,
// air-navigation).

import fs from "node:fs";
import path from "node:path";

const CHECK = process.argv.includes("--check");
const CONTENT = path.join("public", "content");
const STRICT_DIRS = [
  path.join(CONTENT, "meteorology"),
  path.join(CONTENT, "radio-navigation"),
  path.join(CONTENT, "air-navigation"),
];
const STRICT_NAMES = STRICT_DIRS.map((d) => path.basename(d)).join(", ");
const ALLOWED_TEXT = [/Practice questions with verified answer key\./];

const KEY_TEXT = /answer[-\s_]*key/i;
const GRID_CLASS = /answer-key-grid|answer-grid|answer-cell|ak-cell|ans-key|key-grid|key-cell|keytable|krow-[qa]|keyfix/i;

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

/** Plain text of every <th>/<td> cell in one <tr> fragment (tags stripped). */
function cellTexts(fragment) {
  const cells = [];
  const re = /<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/gi;
  let m;
  while ((m = re.exec(fragment))) {
    cells.push(m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());
  }
  return cells;
}

/**
 * Structural detector: bare answer grids that carry no key phrase and no grid
 * class - a table whose header row is 3+ cells of `Q<n>` (or sequential `1..N`)
 * followed by a row with the SAME number of single letters A-D. Shape alone,
 * found after ar-15 L986-991 escaped the phrase/class scan.
 */
function structuralGridHits(strippedLines, hitLines) {
  const hits = [];
  const nearHit = (from, to) => {
    // A phrase/class hit within 15 lines above the table means this block is
    // already counted (e.g. ar-23: heading L1669, tables L1670-1689).
    for (let l = Math.max(1, from - 15); l <= to; l++) if (hitLines.has(l)) return true;
    return false;
  };
  for (let i = 0; i < strippedLines.length; i++) {
    if (!/<table\b/i.test(strippedLines[i])) continue;
    let end = i;
    while (end < strippedLines.length && !/<\/table>/i.test(strippedLines[end])) end++;
    if (end >= strippedLines.length) continue; // unterminated table: skip
    const blockLines = strippedLines.slice(i, end + 1);
    const blockText = blockLines.join("\n");
    const lineStarts = [];
    {
      let acc = 0;
      for (const bl of blockLines) {
        lineStarts.push(acc);
        acc += bl.length + 1;
      }
    }
    const lineOf = (offset) => {
      let lo = 0;
      let hi = lineStarts.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (lineStarts[mid] <= offset) lo = mid;
        else hi = mid - 1;
      }
      return i + lo + 1;
    };
    const rows = [];
    const trRe = /<tr\b/gi;
    let trm;
    while ((trm = trRe.exec(blockText))) {
      const rest = blockText.slice(trm.index + trm[0].length);
      const stop = rest.search(/<\/tr>|<tr\b/i);
      const frag = stop === -1 ? rest : rest.slice(0, stop);
      rows.push({ line: lineOf(trm.index), cells: cellTexts(frag) });
    }
    let header = -1;
    for (let r = 0; r < rows.length; r++) {
      const c = rows[r].cells;
      if (c.length < 3 || !c.every((x) => /^Q?\d{1,3}$/.test(x))) continue;
      const qAll = c.every((x) => /^Q\d+$/.test(x));
      const seq = c.every((x, k) => k === 0 || Number(x) === Number(c[k - 1]) + 1);
      if (qAll || seq) { header = r; break; }
    }
    if (header === -1) continue;
    const h = rows[header].cells;
    const letterRow = rows.find(
      (r, idx) => idx > header && r.cells.length === h.length && r.cells.every((x) => /^[A-Da-d]$/.test(x)),
    );
    if (!letterRow) continue;
    if (nearHit(i + 1, end + 1)) continue; // already counted by phrase/class
    hits.push({
      line: rows[header].line,
      text: `[structural] bare answer grid: header ${h.join(",")} + letters ${letterRow.cells.join(",")}`,
    });
  }
  return hits;
}

const strictHits = [];
const pending = new Map(); // subject -> [{file, line, text}]

for (const file of walk(CONTENT)) {
  const rel = file.split(path.sep).join("/");
  const abs = path.resolve(file);
  const isStrict = STRICT_DIRS.some((d) => abs.startsWith(path.resolve(d) + path.sep));
  const subject = rel.split("/")[2] || "?";
  const state = { inHtml: false };
  const strippedLines = [];
  const hitLines = new Set();
  fs.readFileSync(file, "utf8")
    .split(/\r?\n/)
    .forEach((rawLine, i) => {
      const line = stripComments(rawLine, state);
      strippedLines.push(line);
      const hasText = KEY_TEXT.test(line);
      const hasGridClass = GRID_CLASS.test(line);
      if (!hasText && !hasGridClass) return;
      if (hasText && ALLOWED_TEXT.some((a) => a.test(rawLine))) return;
      hitLines.add(i + 1);
      const rec = { file: rel, line: i + 1, text: rawLine.trim().slice(0, 110) };
      if (isStrict) strictHits.push(rec);
      else {
        if (!pending.has(subject)) pending.set(subject, []);
        pending.get(subject).push(rec);
      }
    });
  for (const rec of structuralGridHits(strippedLines, hitLines)) {
    const full = { file: rel, line: rec.line, text: rec.text };
    if (isStrict) strictHits.push(full);
    else {
      if (!pending.has(subject)) pending.set(subject, []);
      pending.get(subject).push(full);
    }
  }
}

if (strictHits.length) {
  console.log(`STRICT (${STRICT_NAMES}): ${strictHits.length} violation(s)`);
  for (const r of strictHits) console.log(`  ${r.file}:${r.line}  ${r.text}`);
} else {
  console.log(`STRICT (${STRICT_NAMES}): clean - no answer-key text or grid classes.`);
}

if (pending.size) {
  console.log("\nPENDING (report-only, other subjects - each awaits its own pass):");
  for (const [s, rows] of [...pending.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`  ${s}: ${rows.length} occurrence(s) in ${new Set(rows.map((r) => r.file)).size} file(s)`);
  }
} else {
  console.log("\nPENDING: none anywhere.");
}

if (process.argv.includes("--list")) {
  for (const [s, rows] of [...pending.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n-- ${s} (${rows.length}) --`);
    for (const r of rows) console.log(`  ${r.file}:${r.line}  ${r.text}`);
  }
}

if (CHECK && strictHits.length) {
  console.error(`\nBuild blocked: hardcoded answer-key content reappeared in a STRICT notes scope (${STRICT_NAMES}).`);
  process.exit(1);
}
console.log(CHECK ? "\nGuard OK." : "\nReport only (pass --check to fail the build on strict violations).");
