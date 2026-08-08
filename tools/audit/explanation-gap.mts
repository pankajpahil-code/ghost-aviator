import { CPL_SUBJECTS, ATPL_SUBJECTS } from "../../lib/subjects";
import { getChapterSpecificQuestions } from "../../lib/questions";

const placeholder = (e?: string) =>
  !e || !e.trim() || /^\s*correct answer\s*[:\-]?\s*[A-D]?\s*\.?\s*$/i.test(e.trim());

// Count each DISTINCT question once, keyed by stem, so chapters sharing a bank
// don't inflate the total.
const seen = new Map<string, { subj: string; ch: string; bad: boolean }>();
for (const [, subs] of [["cpl", CPL_SUBJECTS], ["atpl", ATPL_SUBJECTS]] as const)
  for (const s of subs) for (const ch of s.chapters) {
    for (const q of getChapterSpecificQuestions(s.id, ch.id)) {
      if (!seen.has(q.q)) seen.set(q.q, { subj: s.id, ch: ch.id, bad: placeholder(q.exp) });
    }
  }

const bySubject: Record<string, { bad: number; total: number }> = {};
for (const v of seen.values()) {
  (bySubject[v.subj] ||= { bad: 0, total: 0 });
  bySubject[v.subj].total++;
  if (v.bad) bySubject[v.subj].bad++;
}
console.log("distinct questions reachable on chapter pages:", seen.size);
console.log("with placeholder explanation:", [...seen.values()].filter(v => v.bad).length);
console.log("");
console.log("subject".padEnd(26), "placeholder / total");
Object.entries(bySubject).sort((a, b) => b[1].bad - a[1].bad)
  .forEach(([k, v]) => console.log("  " + k.padEnd(24), String(v.bad).padStart(4), "/", v.total));

// Which chapters hold the placeholders, for batching.
const byChapter: Record<string, number> = {};
for (const v of seen.values()) if (v.bad) byChapter[`${v.subj}/${v.ch}`] = (byChapter[`${v.subj}/${v.ch}`] || 0) + 1;
console.log("\ntop chapters by placeholder count:");
Object.entries(byChapter).sort((a, b) => b[1] - a[1]).slice(0, 20)
  .forEach(([k, n]) => console.log("  " + String(n).padStart(4), k));
