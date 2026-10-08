// Same question, different keyed answer, between the past papers and the chapter bank.
//
//   npx tsx tools/audit/paper-vs-bank.mts
//
// Stems are compared on letters and digits alone; keyed answers with sameOption(). Every
// line printed is a question a student can meet twice on this site with two different
// correct answers. Exits 1 if there are any.
import { ALL_QUESTIONS } from "../../lib/questions";
import { ALL_PAST_PAPERS } from "../../lib/past-papers";
import { sameOption } from "../../lib/answer-corrections";

const alnum = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const bank = new Map<string, (typeof ALL_QUESTIONS)[number][]>();
for (const q of ALL_QUESTIONS) bank.set(alnum(q.q), [...(bank.get(alnum(q.q)) ?? []), q]);

let n = 0;
for (const p of ALL_PAST_PAPERS) {
  p.questions.forEach((q, i) => {
    for (const b of bank.get(alnum(q.q)) ?? []) {
      if (sameOption(q.opts[q.ans], b.opts[b.ans])) continue;
      n++;
      console.log(`#${n} ${p.id} [${i}] ${q.q}`);
      console.log(`   PAPER opts: ${q.opts.map((o, k) => (k === q.ans ? `*${o}*` : o)).join(" | ")}`);
      console.log(`   BANK  opts: ${b.opts.map((o, k) => (k === b.ans ? `*${o}*` : o)).join(" | ")}  (${b.chapterId})`);
    }
  });
}
console.log(`${n} paper/bank pairs keyed differently`);
process.exit(n ? 1 : 0);
