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

// --- Copies the layer did NOT reach -------------------------------------------------
// The loop above only looks at copies whose stem and keyed text already match an entry,
// so a paper that prints the same question a little differently was invisible to it and
// kept its old key while this script reported "0 failing" (found 2026-10-08). Here every
// live question is compared on letters and digits alone. Anything that is the same
// question as a correction but does not carry the corrected answer is listed. A copy may
// legitimately differ (another paper may key a third option), so each remaining one is
// either fixed by widening the entry or declared in ACKNOWLEDGED with its reason.
const alnum = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "");
const ACKNOWLEDGED: Record<string, string> = {
  // "<where>|<stem as printed>": "why this copy is left as it is",
  "air-regulations-paper-2|The FDR is fitted in an aircraft to":
    "keys the right option; the paper prints it without the 'a&b' prefix, so only the explanation is missing",
  "air-regulations-paper-6|Which response is most correct with respect to wake turbulence?":
    "the bank copy was hidden because extraction split its answer; this paper's copy is intact",
  "bank|The sensations which lead to spatial disorientation during instrument flight conditions:":
    "the hidden copy had a broken option; this copy is intact and keys a complete sentence",
  "air-regulations-sample-2|The sensations which lead to spatial disorientation during instrument flight conditions:":
    "same intact copy as the bank's",
  "bank|Where ATIS is available the information which should be included on first contact with ATC is the":
    "the bank copy already keys the identifier (spelt 'phonetic'); the entry corrects the paper copy, which spells it 'phonic'",
};
let unreached = 0;
let keyRightNoExp = 0;
let acknowledged = 0;
for (const c of ANSWER_CORRECTIONS) {
  const stems = new Set([alnum(c.q), alnum(c.edit?.q ?? c.q)]);
  for (const x of live) {
    if (!stems.has(alnum(x.q.q))) continue;
    // The key is what a student is marked on. A copy that already keys the corrected answer
    // but printed it differently enough to miss the new explanation is counted, not failed.
    if (!c.hide && sameOption(x.q.opts[x.q.ans], c.now)) {
      if (x.q.exp !== c.exp) keyRightNoExp++;
      continue;
    }
    // A different entry for the same stem may be the one that applies to this copy.
    const other = ANSWER_CORRECTIONS.some(
      (k) => k !== c && !k.hide && alnum(k.edit?.q ?? k.q) === alnum(x.q.q) &&
        sameOption(x.q.opts[x.q.ans], k.now) && x.q.exp === k.exp,
    );
    if (other) continue;
    const id = `${x.where}|${x.q.q}`;
    if (ACKNOWLEDGED[id]) { acknowledged++; continue; }
    unreached++;
    console.log(
      `UNREACHED ${c.hide ? "(should be hidden)" : ""} id=${JSON.stringify(id)}\n` +
        `          live key: ${String(x.q.opts[x.q.ans]).slice(0, 60)} | entry: was "${c.was.slice(0, 40)}" now "${c.now.slice(0, 40)}"`,
    );
  }
}
console.log(
  `${unreached} live copies of a corrected question not reached by the layer ` +
    `(${acknowledged} acknowledged with a reason; ${keyRightNoExp} already key the right answer but lack the new explanation)`,
);
process.exit(bad || unreached ? 1 : 0);
