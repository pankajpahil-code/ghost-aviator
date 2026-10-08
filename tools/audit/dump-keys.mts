// Dump every live question's keyed answer, for before/after comparison of a change to
// the corrections layer or the bank loader.
//
//   npx tsx tools/audit/dump-keys.mts <out.json>
//
// One row per live copy: where it is served, its position, stem, keyed option text and
// explanation. A change that should only re-key N questions must show exactly N rows differing.
import { writeFileSync } from "node:fs";
import { ALL_QUESTIONS } from "../../lib/questions";
import { ALL_PAST_PAPERS } from "../../lib/past-papers";

const rows = [
  ...ALL_QUESTIONS.map((q, i) => ({ where: "bank", i, q: q.q, key: q.opts[q.ans], exp: q.exp ?? "" })),
  ...ALL_PAST_PAPERS.flatMap((p) =>
    p.questions.map((q, i) => ({ where: p.id, i, q: q.q, key: q.opts[q.ans], exp: q.exp ?? "" })),
  ),
];
writeFileSync(process.argv[2], JSON.stringify(rows));
console.log(`${rows.length} live copies written (${ALL_QUESTIONS.length} bank, ${rows.length - ALL_QUESTIONS.length} in papers)`);
