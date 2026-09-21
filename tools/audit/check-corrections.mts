// Proof that every declared answer correction actually lands.
//
//   npx tsx tools/audit/check-corrections.mts
//
// For each entry in lib/answer-corrections.ts, looks at every live copy
// (chapter banks via ALL_QUESTIONS, and every past/sample paper):
//   hide     -> no live copy of the original (stem + keyed text) remains
//   re-key / rewrite -> at least one live copy (under the new stem, if
//               reworded) keys `now` and carries the new explanation, and no
//               copy of the original stem still keys the old wrong answer
// Exits 1 if any entry fails, e.g. because a bank was regenerated and the
// wording drifted so the guard no longer matches.
import { ALL_QUESTIONS } from "../../lib/questions";
import { ALL_PAST_PAPERS } from "../../lib/past-papers";
import { ANSWER_CORRECTIONS, sameOption } from "../../lib/answer-corrections";

type Q = { q: string; opts: string[]; ans: number; exp?: string };
const live: { where: string; q: Q }[] = [
  ...ALL_QUESTIONS.map((q) => ({ where: "bank", q })),
  ...ALL_PAST_PAPERS.flatMap((p) => p.questions.map((q) => ({ where: p.id, q }))),
];

let bad = 0;
let hidden = 0;
for (const c of ANSWER_CORRECTIONS) {
  const original = live.filter((x) => x.q.q === c.q && sameOption(x.q.opts[x.q.ans], c.was));
  let ok: boolean;
  let detail: string;
  if (c.hide) {
    ok = original.length === 0;
    hidden++;
    detail = `hidden, remaining=${original.length}`;
  } else {
    const stem = c.edit?.q ?? c.q;
    const fixed = live.filter(
      (x) => x.q.q === stem && sameOption(x.q.opts[x.q.ans], c.now) && x.q.exp === c.exp,
    );
    // An explanation-only entry (was === now, no edit) leaves the original in
    // place by design; it is fine as long as the new explanation is there.
    const explainOnly = sameOption(c.was, c.now) && !c.edit;
    const stale = explainOnly ? [] : original.filter((x) => x.q.exp !== c.exp);
    ok = fixed.length > 0 && stale.length === 0;
    detail = `fixed=${fixed.length} stale=${stale.length} [${[...new Set(fixed.map((f) => f.where))].join(",")}]`;
  }
  if (!ok) bad++;
  console.log(`${ok ? "OK  " : "FAIL"} ${detail} ${c.q.slice(0, 60)}`);
}
console.log(`\n${ANSWER_CORRECTIONS.length} corrections (${hidden} hides), ${bad} failing`);
process.exit(bad ? 1 : 0);
