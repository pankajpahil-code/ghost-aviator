/**
 * GINI KNOWLEDGE-CORPUS INVENTORY — what verified material may be spoken.
 *
 *   npx tsx tools/audit/gini-corpus.mts
 *
 * Re-runnable. Read-only. Every number in the Gini corpus report comes from
 * here, so re-run it rather than trusting a figure written down in prose — the
 * banks grow one file at a time and a stale count is a claim like any other.
 *
 * The placeholder test is copied VERBATIM from isRealExplanation() in
 * app/components/content/QuestionsPage.tsx:36-39. If that changes, change it
 * here in the same commit or the two will drift.
 */
import fs from "node:fs";
import path from "node:path";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "../../lib/subjects";
import { ALL_QUESTIONS, getChapterSpecificQuestions, getQuestionsForChapter } from "../../lib/questions";
import { servesRealNotes, ownsQuestionSet } from "../../lib/indexability";
import { FAQS } from "../../lib/faq";
import { CHAPTER_KEY_FACTS } from "../../lib/chapter-key-facts";
import { VERIFICATION } from "../../lib/verification-status";
import { GUIDES } from "../../lib/guides";
import { getChapterVideos } from "../../lib/chapter-videos";

// ── the exact production definition ─────────────────────────────────────────
function isRealExplanation(exp: string | undefined): boolean {
  if (!exp || !exp.trim()) return false;
  return !/^\s*correct answer\s*[:\-]?\s*[A-D]?\s*\.?\s*$/i.test(exp.trim());
}

/** Stems that cannot be answered without a chart/figure the student never saw. */
const FIGREF =
  /\b(refer to|see)\b[^.]{0,60}\b(figure|fig\.|chart|annex|appendix|diagram|illustration|graph|manual)\b|\bfigure\s*\d|\bfig\.\s*\d|as shown (in|below)|\bthe (diagram|chart|figure) (above|below|shown)/i;

/** Iron Rule 2 — names that must never be spoken to a student. */
const BANNED = /\b(oxford|cae\b|ic joshi|joshi|rk bali|r\.k\. bali|nordian|redbird|jeppesen|ecqb)\b/i;

const words = (t: string) => (t.match(/[A-Za-z0-9'’\-₹]+/g) || []).length;
const strip = (h: string) => h.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const h = (s: string) => console.log(`\n=== ${s} ===`);

// ── 1. QUESTIONS ────────────────────────────────────────────────────────────
h("1. QUESTION BANK");
const real = ALL_QUESTIONS.filter(q => isRealExplanation(q.exp));
const emptyExp = ALL_QUESTIONS.filter(q => !q.exp || !q.exp.trim());
console.log(`ALL_QUESTIONS (deduped): ${ALL_QUESTIONS.length}`);
console.log(`  real explanation:  ${real.length}`);
console.log(`  placeholder:       ${ALL_QUESTIONS.length - real.length}  (empty ${emptyExp.length} + "Correct answer: X" ${ALL_QUESTIONS.length - real.length - emptyExp.length})`);

const tiers = [
  ["A  real explanation", ALL_QUESTIONS.filter(q => isRealExplanation(q.exp))],
  ["B  A, no figure dependency", ALL_QUESTIONS.filter(q => isRealExplanation(q.exp) && !FIGREF.test(q.q))],
  ["C  B, no Iron-Rule-2 name", ALL_QUESTIONS.filter(q => isRealExplanation(q.exp) && !FIGREF.test(q.q) && !BANNED.test(q.q) && !BANNED.test(q.exp!))],
  ["D  C, explanation >= 25 chars", ALL_QUESTIONS.filter(q => isRealExplanation(q.exp) && !FIGREF.test(q.q) && !BANNED.test(q.q) && !BANNED.test(q.exp!) && q.exp!.trim().length >= 25)],
] as const;
console.log("\nSPEAKABLE TIERS:");
for (const [label, set] of tiers) console.log(`  ${label.padEnd(32)} ${set.length}`);

h("1b. per subjectId (a question may carry several)");
const bySubj = new Map<string, { t: number; r: number; speak: number }>();
const speakable = new Set(tiers[3][1]);
for (const q of ALL_QUESTIONS) for (const s of q.subjectIds) {
  const e = bySubj.get(s) ?? { t: 0, r: 0, speak: 0 };
  e.t++; if (isRealExplanation(q.exp)) e.r++; if (speakable.has(q)) e.speak++;
  bySubj.set(s, e);
}
const level = new Map(VERIFICATION.map(v => [v.subjectId, v.level]));
console.log("subject                  verification  total   real  speakable");
[...bySubj.entries()].sort((a, b) => b[1].t - a[1].t).forEach(([s, v]) =>
  console.log(`  ${s.padEnd(22)} ${(level.get(s) ?? "unaudited").padEnd(12)} ${String(v.t).padStart(5)} ${String(v.r).padStart(6)} ${String(v.speak).padStart(10)}`));

h("1c. distinct questions reachable as a chapter's OWN set");
const seen = new Map<string, { subj: string; ch: string; real: boolean }>();
for (const subs of [CPL_SUBJECTS, ATPL_SUBJECTS]) for (const s of subs) for (const ch of s.chapters)
  for (const q of getChapterSpecificQuestions(s.id, ch.id))
    if (!seen.has(q.q)) seen.set(q.q, { subj: s.id, ch: ch.id, real: isRealExplanation(q.exp) });
console.log(`distinct: ${seen.size}   real: ${[...seen.values()].filter(v => v.real).length}   placeholder: ${[...seen.values()].filter(v => !v.real).length}`);
const byCh: Record<string, { r: number; t: number }> = {};
for (const v of seen.values()) { const k = `${v.subj}/${v.ch}`; (byCh[k] ||= { r: 0, t: 0 }).t++; if (v.real) byCh[k].r++; }
console.log("chapters holding the most placeholders:");
Object.entries(byCh).sort((a, b) => (b[1].t - b[1].r) - (a[1].t - a[1].r)).slice(0, 10)
  .forEach(([k, v]) => console.log(`   ${String(v.t - v.r).padStart(4)} of ${String(v.t).padStart(4)}   ${k}`));

h("1d. structural health / answerability");
console.log(`ans index out of range:        ${ALL_QUESTIONS.filter(q => !(q.ans >= 0 && q.ans < q.opts.length)).length}`);
console.log(`fewer than 2 options:          ${ALL_QUESTIONS.filter(q => q.opts.length < 2).length}`);
console.log(`empty option text:             ${ALL_QUESTIONS.filter(q => q.opts.some(o => !o || !o.trim())).length}`);
console.log(`duplicate option text:         ${ALL_QUESTIONS.filter(q => new Set(q.opts.map(o => o.trim().toLowerCase())).size !== q.opts.length).length}`);
console.log(`figure/chart-dependent stems:  ${ALL_QUESTIONS.filter(q => FIGREF.test(q.q)).length}`);
console.log(`stems under 25 chars (terse, not necessarily broken): ${ALL_QUESTIONS.filter(q => q.q.trim().length < 25).length}`);

h("1e. IRON RULE 2 — banned names in student-facing question text");
const stemHits = ALL_QUESTIONS.filter(q => BANNED.test(q.q));
const expHits = ALL_QUESTIONS.filter(q => q.exp && BANNED.test(q.exp));
console.log(`stems: ${stemHits.length}   explanations: ${expHits.length}   options: ${ALL_QUESTIONS.filter(q => q.opts.some(o => BANNED.test(o))).length}`);
for (const q of expHits) console.log(`   exp  ${q.subjectIds[0]}/${q.chapterId}: ${q.exp!.slice(0, 90)}`);
const stemBy: Record<string, number> = {};
for (const q of stemHits) stemBy[`${q.subjectIds[0]}/${q.chapterId}`] = (stemBy[`${q.subjectIds[0]}/${q.chapterId}`] || 0) + 1;
console.log("   stems by chapter:", stemBy);
console.log(`questions whose \`source\` field names a publisher (metadata, never rendered): ${ALL_QUESTIONS.filter(q => q.source && BANNED.test(q.source)).length}`);

// ── 2. NOTES ────────────────────────────────────────────────────────────────
h("2. CHAPTER NOTES");
const root = path.join(process.cwd(), "public", "content");
type Row = { key: string; w: number; headings: number; chunks: number; biggest: number; qa: number };
const rows: Row[] = [];
let totalHeadings = 0, idHeadings = 0;
for (const s of fs.readdirSync(root, { withFileTypes: true })) {
  if (!s.isDirectory()) continue;
  for (const c of fs.readdirSync(path.join(root, s.name), { withFileTypes: true })) {
    if (!c.isDirectory()) continue;
    const f = path.join(root, s.name, c.name, "notes.html");
    if (!fs.existsSync(f)) continue;
    const raw = fs.readFileSync(f, "utf-8");
    const bm = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (!bm) continue;
    const body = bm[1].replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "");
    const hs = [...body.matchAll(/<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi)];
    totalHeadings += hs.length;
    idHeadings += hs.filter(x => /\bid\s*=/i.test(x[2])).length;
    const parts = body.split(/(?=<h[1-4]\b)/i).filter(p => strip(p).length > 0);
    const cw = parts.map(p => words(strip(p)));
    rows.push({
      key: `${s.name}/${c.name}`, w: words(strip(body)), headings: hs.length,
      chunks: parts.length, biggest: cw.length ? Math.max(...cw) : 0,
      qa: (body.match(/class="[^"]*\b(qa-block|question-block|qa-card|qa-question|question-text)\b/gi) || []).length,
    });
  }
}
const allW = rows.map(r => r.w).sort((a, b) => a - b);
const qq = (p: number) => allW[Math.floor(allW.length * p)];
console.log(`notes.html on disk: ${rows.length}`);
console.log(`words: total ${allW.reduce((a, b) => a + b, 0)}  min ${allW[0]}  p25 ${qq(0.25)}  median ${qq(0.5)}  p75 ${qq(0.75)}  max ${allW[allW.length - 1]}`);
console.log(`headings: ${totalHeadings}, carrying an id: ${idHeadings} (${(100 * idHeadings / totalHeadings).toFixed(1)}%)`);
const chunks = rows.flatMap(r => Array(r.chunks).fill(0)).length;
console.log(`h1-h4 chunks: ${rows.reduce((n, r) => n + r.chunks, 0)} across ${rows.length} chapters (${chunks ? "" : ""}mean ${(rows.reduce((n, r) => n + r.chunks, 0) / rows.length).toFixed(1)}/chapter)`);
console.log(`chapters chunking cleanly (largest chunk <= 800 words): ${rows.filter(r => r.biggest <= 800).length} / ${rows.length}`);
console.log(`chapters needing a sub-heading splitter (largest chunk > 800 words): ${rows.filter(r => r.biggest > 800).length}`);
console.log(`chapters under 500 words total: ${rows.filter(r => r.w < 500).length}`);
console.log(`chapters carrying Q&A markup inside the notes: ${rows.filter(r => r.qa > 0).length}`);
console.log("worst chunkers:");
rows.slice().sort((a, b) => b.biggest - a.biggest).slice(0, 8)
  .forEach(r => console.log(`   biggest ${String(r.biggest).padStart(6)}w of ${String(r.w).padStart(6)}w, ${String(r.headings).padStart(3)} headings   ${r.key}`));

// ── 3. THE SMALL VERIFIED SURFACES ──────────────────────────────────────────
h("3. FAQ / KEY FACTS / VERIFICATION / GUIDES");
console.log(`FAQS: ${FAQS.length} entries, all with a source: ${FAQS.every(f => f.source.trim())}`);
console.log(`CHAPTER_KEY_FACTS: ${Object.keys(CHAPTER_KEY_FACTS).length} chapters, ${Object.values(CHAPTER_KEY_FACTS).reduce((n, v) => n + v.facts.length, 0)} facts`);
console.log(`VERIFICATION: ${VERIFICATION.length} subjects — ${VERIFICATION.map(v => `${v.subjectId}:${v.level}`).join(", ")}`);
console.log(`GUIDES: ${GUIDES.length}`);

// ── 4. COVERAGE MATRIX ──────────────────────────────────────────────────────
h("4. COVERAGE PER SUBJECT");
console.log("track  subject                chapters  notes  ownQs  realExp  lectures  fallbackOnly");
for (const [track, subs] of [["CPL", CPL_SUBJECTS], ["ATPL", ATPL_SUBJECTS]] as const)
  for (const s of subs) {
    let notes = 0, own = 0, r = 0, vids = 0, fb = 0;
    for (const ch of s.chapters) {
      if (servesRealNotes(s.id, ch.id)) notes++;
      const o = getChapterSpecificQuestions(s.id, ch.id);
      if (o.length) { own++; r += o.filter(q => isRealExplanation(q.exp)).length; }
      else if (getQuestionsForChapter(s.id, ch.id).length) fb++;
      if (getChapterVideos(s.id, ch.id).length) vids++;
    }
    console.log(`${track.padEnd(6)} ${s.id.padEnd(22)} ${String(s.chapters.length).padStart(8)} ${String(notes).padStart(6)} ${String(own).padStart(6)} ${String(r).padStart(8)} ${String(vids).padStart(9)} ${String(fb).padStart(13)}`);
  }
let ownNoNotes = 0, chapters = 0, withNotes = 0;
for (const subs of [CPL_SUBJECTS, ATPL_SUBJECTS]) for (const s of subs) for (const ch of s.chapters) {
  chapters++;
  if (servesRealNotes(s.id, ch.id)) withNotes++;
  if (ownsQuestionSet(s.id, ch.id) && !servesRealNotes(s.id, ch.id)) ownNoNotes++;
}
console.log(`\nchapters ${chapters}; serving real notes ${withNotes}; without notes ${chapters - withNotes}; owning questions but no notes ${ownNoNotes}`);
