/**
 * Iron Rule 2 sweep over what a student can actually read. REPORTS ONLY - it
 * never edits content; every hit is for the Captain's ruling.
 *
 *   npx tsx tools/audit/iron-rule-2-scan.mts            summary + every strict hit
 *   npx tsx tools/audit/iron-rule-2-scan.mts --loose    also single-word candidates
 *
 * STRICT  = the shared compiled pattern (tools/forbidden-source-names.mjs), the
 *           same one every build check uses. A strict hit is a live violation.
 * LOOSE   = bare surnames/brands (Bali, Joshi, Sahil, ...) that the JSON's scope
 *           ruling deliberately does NOT ban, because the bare word is also a
 *           place, a surname, or ordinary vocabulary. Listed for a human to read,
 *           never counted as a failure.
 *
 * Surfaces:
 *   1. public/content/**\/notes.html - reduced to VISIBLE text (scripts/styles
 *      dropped, tags stripped, entities decoded), so "R.K.&nbsp;Bali" and
 *      "<b>RK</b> Bali" are seen the way a reader sees them; then the raw HTML
 *      again, which is where alt/title attributes and comments live.
 *   2. Every question a chapter page or drill can serve (getQuestionsForChapter
 *      for every chapter, CPL and ATPL), fields q / opts / exp / subtopic - the
 *      fields that render. `source` is provenance and is not rendered; counted
 *      separately.
 *   3. lib/**\/*.ts raw text, for anything the first two did not reach.
 *
 * Exits 1 if any STRICT hit is found in surfaces 1 or 2.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { findAllForbidden } from "../forbidden-source-names.mjs";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "../../lib/subjects";
import { getQuestionsForChapter } from "../../lib/questions";

const ROOT = process.cwd();
const LOOSE_ON = process.argv.includes("--loose");
const LOOSE = /\b(bali|joshi|sahil|surender|redbird|nordian|keith\s+williams|ecqb|cae)\b/gi;

type Hit = { where: string; match: string; context: string };
const strict: Record<string, Hit[]> = { notesText: [], notesRaw: [], questions: [], lib: [] };
const loose: Hit[] = [];
let sourceFieldHits = 0;

const ctx = (t: string, i: number, len: number) =>
  t.slice(Math.max(0, i - 70), i + len + 70).replace(/\s+/g, " ").trim();

const walk = (d: string, keep: (p: string) => boolean, out: string[] = []) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p, keep, out);
    else if (keep(p)) out.push(p);
  }
  return out;
};

const ENT: Record<string, string> = { nbsp: "\u00a0", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", mdash: "\u2014", ndash: "\u2013" };
function visibleText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, "")        // inline tags vanish: "<b>RK</b> Bali" -> "RK Bali"
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENT[n.toLowerCase()] ?? m);
}

function scan(text: string, where: string, bucket: Hit[], alsoLoose: boolean) {
  const found = findAllForbidden(text);
  for (const h of found) bucket.push({ where, match: h.match, context: ctx(text, h.index, h.match.length) });
  if (!alsoLoose) return;
  for (const m of text.matchAll(LOOSE)) {
    const i = m.index!;
    if (found.some(h => i >= h.index && i < h.index + h.match.length)) continue;
    loose.push({ where, match: m[0], context: ctx(text, i, m[0].length) });
  }
}

// 1. Published notes.
const notes = walk(join(ROOT, "public", "content"), p => p.endsWith("notes.html"));
for (const f of notes) {
  const rel = relative(ROOT, f).split("\\").join("/");
  const html = readFileSync(f, "utf8");
  const text = visibleText(html);
  scan(text, rel, strict.notesText, true);
  const seen = new Set(strict.notesText.filter(h => h.where === rel).map(h => h.match.toLowerCase()));
  for (const h of findAllForbidden(html)) {
    if (!seen.has(h.match.toLowerCase())) strict.notesRaw.push({ where: rel, match: h.match, context: ctx(html, h.index, h.match.length) });
  }
}

// 2. Every question a chapter can serve.
const qSeen = new Set<string>();
let qCount = 0;
for (const s of [...CPL_SUBJECTS, ...ATPL_SUBJECTS]) {
  for (const c of s.chapters) {
    for (const q of getQuestionsForChapter(s.id, c.id)) {
      const key = q.q + "\u0000" + q.opts.join("\u0001");
      if (qSeen.has(key)) continue;
      qSeen.add(key);
      qCount++;
      const where = `${s.id}/${c.id}${q.chapterId && q.chapterId !== c.id ? ` (bank ${q.chapterId})` : ""}: ${q.q.slice(0, 60)}`;
      scan([q.q, ...q.opts, q.exp ?? "", q.subtopic ?? ""].join(" \u2016 "), where, strict.questions, true);
      if (q.source && findAllForbidden(q.source).length) sourceFieldHits++;
    }
  }
}

// 3. Everything else in lib/.
const libFiles = walk(join(ROOT, "lib"), p => /\.tsx?$/.test(p));
for (const f of libFiles) {
  const rel = relative(ROOT, f).split("\\").join("/");
  scan(readFileSync(f, "utf8"), rel, strict.lib, false);
}

// Report.
const group = (hits: Hit[]) => {
  const g = new Map<string, number>();
  for (const h of hits) g.set(h.where, (g.get(h.where) ?? 0) + 1);
  return g;
};
console.log(`notes.html files: ${notes.length}   distinct servable questions: ${qCount}   lib files: ${libFiles.length}`);
console.log(`STRICT  notes visible text: ${strict.notesText.length}   notes raw-only (attributes/comments/scripts): ${strict.notesRaw.length}`);
console.log(`STRICT  servable questions (q/opts/exp/subtopic): ${strict.questions.length}`);
console.log(`        question 'source' fields naming a source (not rendered): ${sourceFieldHits}`);
console.log(`STRICT  lib raw text: ${strict.lib.length} in ${group(strict.lib).size} files`);
for (const k of ["notesText", "notesRaw", "questions"] as const) {
  for (const h of strict[k]) console.log(`  [${k}] ${h.where}\n      "${h.match}"  ...${h.context}...`);
}
console.log(`\nlib raw hits by file (includes unrendered 'source' fields, comments, identifiers):`);
for (const [f, n] of [...group(strict.lib)].sort((a, b) => b[1] - a[1])) {
  const shapes = new Map<string, number>();
  for (const h of strict.lib.filter(x => x.where === f)) {
    const shape = h.context.replace(/\d+/g, "N").slice(0, 150);
    shapes.set(shape, (shapes.get(shape) ?? 0) + 1);
  }
  console.log(`  ${n.toString().padStart(4)}  ${f}`);
  for (const [shape, m] of [...shapes].sort((a, b) => b[1] - a[1]).slice(0, 3)) console.log(`          x${m}  ...${shape}...`);
}
console.log(`\nLOOSE candidates (not violations; for the Captain's ruling): ${loose.length}`);
if (LOOSE_ON) for (const h of loose) console.log(`  ${h.where}\n      "${h.match}"  ...${h.context}...`);
else if (loose.length) console.log("  (re-run with --loose to list them)");

if (strict.notesText.length + strict.notesRaw.length + strict.questions.length) process.exitCode = 1;
