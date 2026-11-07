// Every CPL subject: does each chapter serve its OWN questions, and does every question land on exactly one chapter?
// Exits 1 on: two chapters serving an identical set, a question served on two chapters, or a question whose
// chapterId names no chapter of its subject (it would be reachable only through the subject-wide fallback).
// Usage: npx tsx tools/audit/chapter-question-coverage.mts [--list]
import { CPL_SUBJECTS } from "../../lib/subjects";
import { ALL_QUESTIONS, getChapterSpecificQuestions } from "../../lib/questions";

const list = process.argv.includes("--list");
const chapterOwner = new Map(CPL_SUBJECTS.flatMap(s => s.chapters.map(c => [c.id, s.id] as const)));
let failures = 0;
for (const s of CPL_SUBJECTS) {
  // A question tagged to several subjects is served on the chapter of whichever subject owns its chapterId.
  const chapterIds = new Set(s.chapters.map(c => c.id));
  const placedElsewhere = (q: { chapterId?: string; subjectIds: string[] }) =>
    !!q.chapterId && q.subjectIds.includes(chapterOwner.get(q.chapterId) ?? "");
  const sets = new Map<string, string[]>();
  const servedOn = new Map<string, string[]>();
  const rows: string[] = [];
  for (const c of s.chapters) {
    const own = getChapterSpecificQuestions(s.id, c.id);
    rows.push(`  ${c.id.padEnd(8)} ${String(own.length).padStart(4)}  ${c.title}`);
    if (own.length === 0) continue;
    const sig = own.map(q => q.q).sort().join("\n");
    sets.set(sig, [...(sets.get(sig) ?? []), c.id]);
    for (const q of own) servedOn.set(q.q, [...(servedOn.get(q.q) ?? []), c.id]);
  }
  const pool = ALL_QUESTIONS.filter(q => q.subjectIds.includes(s.id));
  // The homepage sampler (lib/demo-questions.ts) is written without chapters on purpose; it never serves a chapter page.
  const orphans = pool.filter(q => !!q.chapterId && !chapterIds.has(q.chapterId) && !placedElsewhere(q));
  const sampler = pool.filter(q => !q.chapterId).length;
  const shared = [...sets.values()].filter(ids => ids.length > 1);
  const twice = [...servedOn].filter(([, ids]) => ids.length > 1);
  const bad = shared.length + twice.length + orphans.length;
  failures += bad;
  console.log(`${bad ? "FAIL" : "ok  "} ${s.id}: ${pool.length} questions, ${s.chapters.length} chapters` +
    (sampler ? ` (${sampler} homepage sampler, no chapter)` : "") +
    (bad ? ` | identical sets ${shared.length}, served twice ${twice.length}, no chapter ${orphans.length}` : ""));
  if (list) rows.forEach(r => console.log(r));
  for (const ids of shared) console.log(`    identical set: ${ids.join(", ")}`);
  for (const [stem, ids] of twice.slice(0, 5)) console.log(`    on ${ids.join(" + ")}: ${stem.slice(0, 80)}`);
  const orphanIds = [...new Set(orphans.map(q => q.chapterId ?? "(none)"))];
  if (orphans.length) console.log(`    no such chapter: ${orphanIds.join(", ")}`);
}
console.log(failures ? `\n${failures} problem(s)` : "\nEvery question is on exactly one chapter of its subject; no two chapters share a set.");
process.exit(failures ? 1 : 0);
