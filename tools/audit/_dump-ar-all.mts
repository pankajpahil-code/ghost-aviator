import { ALL_QUESTIONS } from "../../lib/questions";
import { writeFileSync } from "fs";
const out = ALL_QUESTIONS.filter(q => q.subjectIds.includes("air-regulations") || q.subjectIds.includes("atpl-air-regulations"))
  .map((q, i) => ({ i, ch: q.chapterId, subs: q.subjectIds, q: q.q, opts: q.opts, ans: q.ans, exp: q.exp }));
writeFileSync(process.argv[2], JSON.stringify(out, null, 1));
const by: Record<string, number> = {};
for (const q of out) by[q.ch] = (by[q.ch] ?? 0) + 1;
console.log(out.length, by);
