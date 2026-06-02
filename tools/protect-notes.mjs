// Inject the content-protection snippet into every public/content/**/notes.html.
// Idempotent — safe to re-run. Usage: node tools/protect-notes.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { injectProtection } from "./_protect-snippet.mjs";

const CONTENT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "content");
let changed = 0, total = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (name === "notes.html") {
      total++;
      const html = readFileSync(p, "utf8");
      const out = injectProtection(html);
      if (out !== html) { writeFileSync(p, out, "utf8"); changed++; }
    }
  }
}

walk(CONTENT);
console.log(`Protected ${changed}/${total} notes.html files`);
