/**
 * Generate lib/gini/generated/corpus-stats.ts.
 *
 *   npx tsx tools/gini/build-corpus-stats.mts
 *
 * WHY A GENERATED FILE AND NOT JUST READING THE BANK.
 * Gini is on every page. Reaching into lib/questions.ts to count anything drags
 * the whole 4,400-question bank into the client bundle of every route — the
 * exact defect lib/gini/deep.ts exists to undo. So the handful of COUNTS he
 * quotes are baked here instead: a few hundred bytes, no bank.
 *
 * A baked count is a claim, and claims go stale (Iron Rule 5). The defence is
 * that tools/audit/gini-selftest.mts recomputes every number below from the
 * live bank and FAILS if any has drifted. Re-run this tool whenever the bank
 * changes; the self-test will tell you if you forgot.
 */

import fs from "node:fs";
import path from "node:path";
import { speakableStats } from "../../lib/gini/deep";
import { CPL_SUBJECTS } from "../../lib/subjects";

const OUT = path.join(process.cwd(), "lib", "gini", "generated", "corpus-stats.ts");

const all = speakableStats();

const bySubject: Record<string, { total: number; speakable: number }> = {};
for (const s of CPL_SUBJECTS) {
  const st = speakableStats(s.id);
  if (st.total > 0) bySubject[s.id] = { total: st.total, speakable: st.speakable };
}

const body = `/**
 * GENERATED — do not edit by hand.
 *   npx tsx tools/gini/build-corpus-stats.mts
 *
 * The only numbers Gini quotes about the size of the question bank. They live
 * here, pre-counted, so that putting a mascot on every page does not put the
 * whole question bank in every page's JavaScript bundle.
 *
 * These are claims, so they are checked: tools/audit/gini-selftest.mts
 * recomputes all of them from lib/questions.ts and fails on any drift.
 */

export type CorpusCount = { total: number; speakable: number };

export const CORPUS = {
  total: ${all.total},
  speakable: ${all.speakable},
  bySubject: ${JSON.stringify(bySubject, null, 4).replace(/\n/g, "\n  ")} as Record<string, CorpusCount>,
} as const;

export const corpusFor = (subjectId: string): CorpusCount | undefined =>
  CORPUS.bySubject[subjectId];
`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, body, "utf8");

console.log(`wrote ${path.relative(process.cwd(), OUT)}`);
console.log(`  total     ${all.total}`);
console.log(`  speakable ${all.speakable} (${((100 * all.speakable) / all.total).toFixed(1)}%)`);
console.log(`  subjects  ${Object.keys(bySubject).length}`);
