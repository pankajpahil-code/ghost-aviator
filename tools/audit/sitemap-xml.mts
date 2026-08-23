/**
 * Serialises app/sitemap.ts exactly as Next does, then parses the result.
 *
 * WHY THIS GUARD EXISTS
 *
 * Next 16 does not escape sitemap values. In
 * next/dist/build/webpack/loaders/metadata/resolve-route-data.js every field is
 * interpolated raw — `<video:title>${video.title}</video:title>` — so a single
 * ampersand in a lecture title produces malformed XML. Malformed is not
 * partially accepted: Google rejects the whole file, and every URL in it goes
 * with it. 218 of this site's lecture titles contain "&".
 *
 * Nothing else catches that. `npm run build` writes the file happily, the
 * typecheck cannot see inside a template literal, and the failure surfaces days
 * later in Search Console as "Couldn't fetch" — by which time the sitemap has
 * been rejected for a week.
 *
 * Also checks Iron Rule 2, because a sitemap is student-facing publication: the
 * titles and descriptions come from YouTube, not from this repo's guarded build
 * pipeline, so a source name could reach a published file without passing any
 * existing guard.
 *
 *   npx tsx tools/audit/sitemap-xml.mts
 *
 * Exits non-zero on malformed XML or a name leak.
 */

import { XMLParser, XMLValidator } from "fast-xml-parser";
import * as SM from "../../app/sitemap";

type Entry = {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: string;
  priority?: number;
  videos?: {
    title: string; thumbnail_loc: string; description: string;
    player_loc?: string; duration?: number; publication_date?: string;
  }[];
};

const mod = (SM as Record<string, unknown>).default;
const sitemap = (typeof mod === "function" ? mod : (mod as { default?: unknown })?.default) as () => Entry[];
const entries = sitemap();

/** Byte-for-byte the shape Next writes. Keep in step with resolve-route-data.js. */
function serialise(data: Entry[]): string {
  const hasVideos = data.some(i => i.videos?.length);
  let out = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
  if (hasVideos) out += ' xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"';
  out += ">\n";
  for (const item of data) {
    out += "<url>\n";
    out += `<loc>${item.url}</loc>\n`;
    for (const v of item.videos ?? []) {
      out += [
        "<video:video>",
        `<video:title>${v.title}</video:title>`,
        `<video:thumbnail_loc>${v.thumbnail_loc}</video:thumbnail_loc>`,
        `<video:description>${v.description}</video:description>`,
        v.player_loc && `<video:player_loc>${v.player_loc}</video:player_loc>`,
        v.duration && `<video:duration>${v.duration}</video:duration>`,
        v.publication_date && `<video:publication_date>${v.publication_date}</video:publication_date>`,
        "</video:video>\n",
      ].filter(Boolean).join("\n");
    }
    if (item.lastModified) {
      const d = item.lastModified instanceof Date ? item.lastModified.toISOString() : item.lastModified;
      out += `<lastmod>${d}</lastmod>\n`;
    }
    if (item.changeFrequency) out += `<changefreq>${item.changeFrequency}</changefreq>\n`;
    if (typeof item.priority === "number") out += `<priority>${item.priority}</priority>\n`;
    out += "</url>\n";
  }
  return out + "</urlset>\n";
}

const xmlDoc = serialise(entries);
const problems: string[] = [];

// ─── 1. Is it well-formed XML at all? ────────────────────────────────────────
const valid = XMLValidator.validate(xmlDoc);
if (valid !== true) {
  problems.push(`MALFORMED XML — ${valid.err.code} at line ${valid.err.line}: ${valid.err.msg}`);
  const line = xmlDoc.split("\n")[valid.err.line - 1];
  problems.push(`   offending line: ${line?.slice(0, 200)}`);
}

// ─── 2. Does it survive a real parse, with the counts we expect? ─────────────
let parsedUrls = 0, parsedVideos = 0;
if (valid === true) {
  const doc = new XMLParser({ ignoreAttributes: false }).parse(xmlDoc);
  const urls = doc.urlset?.url ?? [];
  const list = Array.isArray(urls) ? urls : [urls];
  parsedUrls = list.length;
  for (const u of list) {
    const v = u["video:video"];
    if (v) parsedVideos += Array.isArray(v) ? v.length : 1;
  }
  const expectedVideos = entries.reduce((n, e) => n + (e.videos?.length ?? 0), 0);
  if (parsedUrls !== entries.length) problems.push(`url count ${parsedUrls} != ${entries.length} built`);
  if (parsedVideos !== expectedVideos) problems.push(`video count ${parsedVideos} != ${expectedVideos} built`);
}

// ─── 3. Iron Rule 2 — no attribution to anyone else's work ───────────────────
//
// The test is whether the text implies this site's teaching came from them. A
// bare place or word is not a breach (the Captain's ruling, 2026-08-02), so
// these are matched as whole words and reviewed by eye, not auto-stripped.
const NAMES = /\b(IC\s*Joshi|Joshi|RK\s*Bali|Nordian|Redbird|Surender|Sahil)\b/i;
for (const e of entries) {
  for (const v of e.videos ?? []) {
    const hay = `${v.title} ${v.description}`;
    const m = hay.match(NAMES);
    if (m) problems.push(`IRON RULE 2 — "${m[0]}" in ${e.url.replace(/^https?:\/\/[^/]+/, "")}`);
  }
}

// ─── 4. lastmod must be a real date, never the build clock ───────────────────
//
// The defect this replaced stamped `new Date()` on 603 of 609 URLs. If most
// entries again share one timestamp, the generated map has gone stale or the
// wiring has regressed.
const stamps = entries.map(e => e.lastModified).filter(Boolean)
  .map(d => (d instanceof Date ? d.toISOString() : String(d)));
const distinct = new Set(stamps.map(s => s.slice(0, 10)));
if (stamps.length > 50 && distinct.size < 3) {
  problems.push(`lastmod has only ${distinct.size} distinct date(s) across ${stamps.length} URLs — is it the build clock again?`);
}

console.log(`entries        ${entries.length}`);
console.log(`  with lastmod ${stamps.length} across ${distinct.size} distinct dates`);
console.log(`  with video   ${entries.filter(e => e.videos?.length).length}`);
console.log(`serialised     ${(xmlDoc.length / 1024).toFixed(0)}KB`);
console.log(`parsed         ${parsedUrls} urls, ${parsedVideos} video nodes`);
console.log(`PROBLEMS: ${problems.length}`);
problems.forEach(p => console.log("  ", p));
if (problems.length) process.exit(1);
