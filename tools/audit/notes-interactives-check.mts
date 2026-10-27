// Every interactive in lib/notes-interactives.ts must still find its figure in
// the chapter's notes. Run after any notes rebuild.
//   npx tsx tools/audit/notes-interactives-check.mts      exits 1 on a missing anchor

import fs from "node:fs";
import path from "node:path";
import { NOTES_INTERACTIVES } from "../../lib/notes-interactives";

let bad = 0;
for (const [key, list] of Object.entries(NOTES_INTERACTIVES)) {
  const file = path.join("public", "content", ...key.split("/"), "notes.html");
  const html = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  for (const it of list) {
    const hits = html ? html.split(it.beforeFigure).length - 1 : 0;
    const ok = hits === 1;
    if (!ok) bad++;
    console.log(`${ok ? "ok  " : "FAIL"}  ${key}  ${it.id}  before ${it.beforeFigure}  (${html ? `${hits} match(es)` : "notes.html missing"})`);
  }
}
console.log(bad ? `\n${bad} FAILED` : "\nall anchors found exactly once");
process.exit(bad ? 1 : 0);
