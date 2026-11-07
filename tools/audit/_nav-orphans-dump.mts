// Dumps Air Navigation questions whose chapterId is not a live chapter, plus every chapter title of the
// subjects they could move to, for tools/audit/nav-site-chapters.py.
import { writeFileSync } from "node:fs";
import { CPL_SUBJECTS } from "../../lib/subjects";
import { ALL_QUESTIONS } from "../../lib/questions";
const nav = CPL_SUBJECTS.find(x => x.id === "air-navigation")!;
const live = new Set(nav.chapters.map(c => c.id));
const rows = ALL_QUESTIONS.filter(q => q.subjectIds.includes("air-navigation") && !live.has(q.chapterId ?? ""))
  .filter(q => q.subjectIds.every(s => s === "air-navigation" || s === "atpl-navigation") || !q.chapterId?.startsWith("inst-"))
  .map(q => ({ ch: q.chapterId ?? "", src: q.source ?? "", sub: q.subtopic ?? "", q: q.q, a: q.opts[q.ans], subjects: q.subjectIds }));
const chapters = Object.fromEntries(CPL_SUBJECTS.map(s => [s.id, s.chapters.map(c => [c.id, c.title])]));
writeFileSync(process.argv[2], JSON.stringify({ rows, chapters }, null, 1));
console.log(rows.length, "rows");
