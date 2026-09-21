// Proof that every declared answer correction actually lands.
//
//   npx tsx tools/audit/check-corrections.mts
//
// For each entry in lib/answer-corrections.ts: count how many live copies
// (chapter banks via ALL_QUESTIONS, and every past paper) now key `now`, and
// how many copies of the same stem still key `was`. Fails (exit 1) if an entry
// applies nowhere — which is what happens when a bank is regenerated and the
// wording drifts — or if any copy still carries the old wrong key.
import { ALL_QUESTIONS } from "../../lib/questions";
import { ALL_PAST_PAPERS } from "../../lib/past-papers";
import { ANSWER_CORRECTIONS, sameOption } from "../../lib/answer-corrections";

const live = [
  ...ALL_QUESTIONS.map((q) => ({ where: "bank", q })),
  ...ALL_PAST_PAPERS.flatMap((p) => p.questions.map((q) => ({ where: p.id, q }))),
];

let bad = 0;
for (const c of ANSWER_CORRECTIONS) {
  const same = live.filter((x) => x.q.q === c.q);
  const fixed = same.filter((x) => sameOption(x.q.opts[x.q.ans], c.now));
  const stillWrong = same.filter((x) => sameOption(x.q.opts[x.q.ans], c.was));
  const ok = fixed.length > 0 && stillWrong.length === 0;
  if (!ok) bad++;
  console.log(
    `${ok ? "OK  " : "FAIL"} fixed=${fixed.length} stillWrong=${stillWrong.length} ` +
    `[${[...new Set(fixed.map((f) => f.where))].join(",")}] ${c.q.slice(0, 60)}`,
  );
}
console.log(`\n${ANSWER_CORRECTIONS.length} corrections, ${bad} failing`);
process.exit(bad ? 1 : 0);
