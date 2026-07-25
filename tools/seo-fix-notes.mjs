import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT = join(__dirname, "..", "public", "content");
let changed = 0, total = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) {
      walk(p);
    } else if (name === "notes.html") {
      total++;
      let html = readFileSync(p, "utf8");
      let original = html;
      
      const chapterId = basename(dirname(p));
      const subjectId = basename(dirname(dirname(p)));
      
      const canonicalUrl = `https://ghostaviator.com/cpl/${subjectId}/${chapterId}/notes`;
      const canonicalTag = `<link rel="canonical" href="${canonicalUrl}">`;
      const noindexTag = `<meta name="robots" content="noindex">`;

      if (!html.includes("rel=\"canonical\"")) {
        html = html.replace(/<head>/i, `<head>\n  ${noindexTag}\n  ${canonicalTag}`);
      }
      
      if (html !== original) {
        writeFileSync(p, html, "utf8");
        changed++;
      }
    }
  }
}

walk(CONTENT);
console.log(`Added SEO tags to ${changed}/${total} notes.html files`);
