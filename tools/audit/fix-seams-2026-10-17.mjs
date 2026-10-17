#!/usr/bin/env node
// tools/audit/fix-seams-2026-10-17.mjs
//
// Post-audit MINOR-fix follow-up for the air-regulations + instrumentation
// removal passes (audit findings 2026-10-17):
//   - ar-11: the CSS cut left a DOUBLE blank line (audit A/B MINOR) -> remove one.
//   - inst-6..11: the table cuts took the trailing blank with them, leaving
//     `</div>` directly adjacent to the watermark (inst audit B MINOR-1)
//     -> insert one blank line back for the original visual separation.
//
// Byte-exact, re-run-safe (validates anchors; fails cleanly if re-run after
// apply), dry-run by default. Writes its own log when redirected.
//
// Run from the worktree:  node tools/audit/fix-seams-2026-10-17.mjs [--apply]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, "..", "..");
const APPLY = process.argv.includes("--apply");

const EDITS = [
  { file: "public/content/air-regulations/ar-11/notes.html",
    kind: "delete", line: 742, expectBlank: true,
    contextBefore: 741, contextAfter: 743, expectAfterIncludes: "QUICK FACTS" },
  ...["inst-6", "inst-7", "inst-8", "inst-9", "inst-10", "inst-11"].map((dir, i) => ({
    file: `public/content/instrumentation/${dir}/notes.html`,
    kind: "insert", line: [342, 489, 315, 419, 479, 498][i], newLines: [""],
    expectBeforeIncludes: "</div>", expectAfterIncludes: "watermark",
  })),
];

const lines = [];
const out = (s) => { console.log(s); lines.push(s); };

let failures = 0;
const fail = (m) => { failures++; out("  !! FAIL " + m); };

out(APPLY ? "== APPLY MODE ==" : "== DRY RUN (pass --apply to write) ==");

for (const e of EDITS) {
  const fp = path.join(REPO, e.file);
  const text = fs.readFileSync(fp, "utf8");
  if (text.charCodeAt(0) === 0xfeff) { fail(e.file + ": unexpected BOM"); continue; }
  const arr = text.split("\r\n");
  const L = e.line;
  if (L < 1 || L > arr.length) { fail(`${e.file}: line ${L} outside file (${arr.length})`); continue; }

  if (e.kind === "delete") {
    if (e.expectBlank && arr[L - 1].trim() !== "") { fail(`${e.file} L${L}: expected blank to delete`); continue; }
    if (e.contextBefore && arr[e.contextBefore - 1].trim() !== "") fail(`${e.file} L${e.contextBefore}: expected blank before`);
    if (e.expectAfterIncludes && !arr[e.contextAfter - 1].includes(e.expectAfterIncludes)) fail(`${e.file} L${e.contextAfter}: expected "${e.expectAfterIncludes}"`);
    if (failures) continue;
    out(`---- ${e.file}`);
    out(`  [delete] L${L} (blank)`);
    out(`      before: ${e.contextBefore - 1}| ${arr[e.contextBefore - 2].slice(0, 90)}`);
    out(`      del:    ${L}| `);
    out(`      after:  ${e.contextAfter}| ${arr[e.contextAfter - 1].slice(0, 90)}`);
    if (APPLY) { arr.splice(L - 1, 1); }
  } else {
    if (e.expectBeforeIncludes && !arr[L - 1].includes(e.expectBeforeIncludes)) { fail(`${e.file} L${L}: expected "${e.expectBeforeIncludes}"`); continue; }
    if (e.expectAfterIncludes && !(arr[L] ?? "").includes(e.expectAfterIncludes)) { fail(`${e.file} L${L + 1}: expected "${e.expectAfterIncludes}"`); continue; }
    if (arr[L].trim() === "") { fail(`${e.file} L${L + 1}: already blank - re-run safe skip?`); continue; }
    out(`---- ${e.file}`);
    out(`  [insert blank] after L${L}`);
    out(`      anchor: ${L}| ${arr[L - 1].slice(0, 90)}`);
    out(`      next:   ${L + 1}| ${arr[L].slice(0, 90)}`);
    if (APPLY) { arr.splice(L, 0, ...e.newLines); }
  }
}

if (failures) { out(`\n${failures} validation failure(s) - nothing written.`); process.exit(1); }

if (APPLY) {
  // write every edited file (re-read fresh to keep other files untouched)
  const touched = [...new Set(EDITS.map((e) => e.file))];
  for (const rel of touched) {
    const fp = path.join(REPO, rel);
    const before = fs.readFileSync(fp, "utf8");
    let arr = before.split("\r\n");
    for (const e of EDITS.filter((x) => x.file === rel)) {
      if (e.kind === "delete") arr.splice(e.line - 1, 1);
      else arr.splice(e.line, 0, ...e.newLines);
    }
    const afterTxt = arr.join("\r\n");
    fs.writeFileSync(fp, afterTxt, "utf8");
    const check = fs.readFileSync(fp, "utf8");
    const dLines = afterTxt.split("\r\n").length - before.split("\r\n").length;
    out(`wrote ${rel}  (${dLines >= 0 ? "+" : ""}${dLines} line(s))`);
    if (check !== afterTxt) fail(rel + ": round-trip mismatch");
  }
  if (failures) { out(`\n${failures} post-write failure(s)!`); process.exit(1); }
  out("\nAll post-write checks passed. Next: node tools/audit/answer-key-guard.mjs --check (expect exit 0, counts unchanged: ar 22/9, inst 21/2).");
} else {
  out("\nDry run complete - no files written. Re-run with --apply.");
}
