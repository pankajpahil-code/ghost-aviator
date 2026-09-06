/**
 * Find explanations in the live bank that begin mid-word or mid-sentence.
 *
 *   npx tsx tools/audit/explanation-corruption.mts
 *
 * FOUND BY ACCIDENT, 2026-09-06. The Shorts renderer puts an explanation on a
 * card verbatim, and the second question it ever picked rendered as:
 *
 *     "cted on at once and read back. Avoiding action is an immediate manoeuvre"
 *
 * i.e. "Acted" with the first two characters gone. Invisible in the drill UI,
 * where an explanation is one grey line under a revealed answer that most
 * students skim. Glaring at 46px on a phone.
 *
 * This is Iron Rule 1 territory and the tool DOES NOT REPAIR ANYTHING. A
 * truncated explanation cannot be reconstructed without knowing what was cut,
 * and guessing the missing words would be exactly the invented-content failure
 * the rule exists to prevent. It reports; the Captain rules.
 */
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "../../lib/subjects";
import { getChapterSpecificQuestions } from "../../lib/questions";

const placeholder = (e?: string) =>
  !e || !e.trim() || /^\s*correct answer\s*[:\-]?\s*[A-D]?\s*\.?\s*$/i.test(e.trim());

type Hit = { why: string; q: string; exp: string; where: string };
const hits: Hit[] = [];
const seen = new Set<string>();
let checked = 0;

for (const [track, subs] of [["cpl", CPL_SUBJECTS], ["atpl", ATPL_SUBJECTS]] as const) {
  for (const s of subs) {
    for (const ch of s.chapters) {
      for (const q of getChapterSpecificQuestions(s.id, ch.id)) {
        if (seen.has(q.q)) continue;
        seen.add(q.q);
        if (placeholder(q.exp)) continue;
        checked++;
        const exp = q.exp.trim();
        const where = `${track}/${s.id}/${ch.id}`;
        const first = exp[0];

        // Starts lower-case. Legitimate for a few real openings (a formula, a
        // unit, an abbreviation), so those are excluded rather than reported,
        // and the exclusions are listed here so the next reader can widen them.
        if (/[a-z]/.test(first)
            && !/^(e\.g\.|i\.e\.|kt|kts|ft|nm|hPa|mb|deg|km|m\/s|n\b|v[0-9a-z]*\s*=)/i.test(exp)) {
          hits.push({ why: "starts lower-case (opening word may be truncated)", q: q.q, exp, where });
          continue;
        }
        // Starts with punctuation that cannot open a sentence.
        if (/^[,;:.)\]\-]/.test(exp)) {
          hits.push({ why: "starts with stray punctuation", q: q.q, exp, where });
          continue;
        }
        // Ends mid-word: no terminal punctuation and the last token is not a
        // number or a unit.
        if (!/[.!?)\]"']$/.test(exp) && !/\d$/.test(exp)) {
          hits.push({ why: "no terminal punctuation (may be cut off)", q: q.q, exp, where });
        }
      }
    }
  }
}

const byReason: Record<string, number> = {};
for (const h of hits) byReason[h.why] = (byReason[h.why] ?? 0) + 1;

console.log(`explanations checked (distinct, non-placeholder): ${checked}`);
console.log(`suspect: ${hits.length}  (${(hits.length / checked * 100).toFixed(1)}%)\n`);
for (const [why, n] of Object.entries(byReason).sort((a, b) => b[1] - a[1]))
  console.log(`  ${String(n).padStart(5)}  ${why}`);

console.log("\nworst offenders - explanations opening mid-word:\n");
const midWord = hits.filter(h => h.why.startsWith("starts lower-case")).slice(0, 12);
for (const h of midWord) {
  console.log(`[${h.where}]`);
  console.log(`  Q   ${h.q.slice(0, 92)}`);
  console.log(`  EXP ${h.exp.slice(0, 110)}`);
  console.log("");
}
console.log("NOT REPAIRED. Reconstructing a cut sentence means inventing the missing");
console.log("words, which is the failure Iron Rule 1 exists to prevent. Captain rules.");
