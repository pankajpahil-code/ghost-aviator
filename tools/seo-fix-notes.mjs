import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT = join(__dirname, "..", "public", "content");
let changed = 0, total = 0;

/**
 * WHICH TRACK IS THIS SUBJECT ON?
 *
 * This script used to hardcode `/cpl/` into every canonical it wrote. Eight of
 * the subjects here are ATPL, so 28 chapters were stamped with a canonical
 * pointing at a URL that 404s — verified: /cpl/human-performance/hpl-1/notes
 * is 404 while /atpl/human-performance/hpl-1/notes is 200. (Low impact, since
 * these standalone /content/ files are noindex and robots-disallowed, so no
 * crawler acts on the tag — but a canonical naming a page that does not exist
 * is simply wrong, and it would matter the moment that changes.)
 *
 * Read the track from lib/subjects.ts rather than keeping a second list here:
 * a hardcoded copy is exactly the drift Iron Rule 5 exists to stop. Subject ids
 * sit at four-space indentation; chapter ids are nested deeper inside
 * `chapters: [ { id: ... } ]`, so an anchored match cannot confuse the two.
 */
const ATPL_SUBJECT_IDS = (() => {
  const src = readFileSync(join(__dirname, "..", "lib", "subjects.ts"), "utf8");
  const start = src.indexOf("export const ATPL_SUBJECTS");
  if (start === -1) throw new Error("seo-fix-notes: ATPL_SUBJECTS not found in lib/subjects.ts");
  const ids = [...src.slice(start).matchAll(/^ {4}id: "([^"]+)"/gm)].map(m => m[1]);
  // Fail loudly: silently finding none would quietly restore the /cpl/ bug.
  if (ids.length === 0) throw new Error("seo-fix-notes: parsed zero ATPL subject ids — has subjects.ts been reformatted?");
  return new Set(ids);
})();

const trackFor = subjectId => (ATPL_SUBJECT_IDS.has(subjectId) ? "atpl" : "cpl");

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
      
      const canonicalUrl = `https://ghostaviator.com/${trackFor(subjectId)}/${subjectId}/${chapterId}/notes`;
      const canonicalTag = `<link rel="canonical" href="${canonicalUrl}">`;
      const noindexTag = `<meta name="robots" content="noindex">`;

      if (!html.includes("rel=\"canonical\"")) {
        html = html.replace(/<head>/i, `<head>\n  ${noindexTag}\n  ${canonicalTag}`);
      } else {
        // Repair, don't just skip. "Already has a canonical" is not the same as
        // "has the right canonical" — the 28 ATPL files each carried a /cpl/
        // URL written by the earlier version of this script, and an add-only
        // pass would leave every one of them wrong for ever.
        html = html.replace(
          /<link rel="canonical" href="[^"]*"\s*\/?>/i,
          canonicalTag,
        );
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
