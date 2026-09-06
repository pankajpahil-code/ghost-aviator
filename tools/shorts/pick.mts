/**
 * Pick ONE verified question and emit a spec for the Short renderer.
 *
 *   npx tsx tools/shorts/pick.mts            # next unused question
 *   npx tsx tools/shorts/pick.mts --id 42    # a specific one, for a retry
 *
 * WHY THIS EXISTS. Measured 2026-09-06: @PankajPahil has 273 videos and ONE of
 * them is a Short, median length 8m58s, on a channel with 53 subscribers.
 * YouTube does not push a nine-minute lecture from an unknown channel to
 * strangers; Shorts are the one surface it does. The Captain has 4,414 questions
 * and 3,041 with real worked explanations, which is years of daily Shorts
 * already written and already verified.
 *
 * IRON RULE 1 HOLDS BY CONSTRUCTION. Nothing here composes an aviation sentence.
 * Every word on the card is lifted verbatim from a question that is already
 * published on the site. A question whose explanation is still the placeholder
 * ("Correct answer: B") is SKIPPED rather than padded — 1,182 of the bank are
 * still in that state and none of them will ever reach a card.
 *
 * IRON RULE 2 is enforced from tools/forbidden-source-names.json, the same one
 * definition scrub-source-names.mjs uses. A question naming a textbook is
 * skipped, not scrubbed: the card is not the place to be quietly editing the
 * Captain's bank.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "../../lib/subjects";
import { getChapterSpecificQuestions } from "../../lib/questions";
import { SITE_URL } from "../../lib/site";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const LEDGER = join(HERE, "_used.json");
const OUT = join(HERE, "_spec.json");

const FORBIDDEN: string[] = JSON.parse(
  readFileSync(join(ROOT, "tools", "forbidden-source-names.json"), "utf8"),
).names;

/** The placeholder test, identical to QuestionsPage.isRealExplanation. */
const isPlaceholder = (e?: string) =>
  !e || !e.trim() || /^\s*correct answer\s*[:\-]?\s*[A-D]?\s*\.?\s*$/i.test(e.trim());

/**
 * Can this question stand alone on a screen with no diagram and no context?
 *
 * A Short is nine seconds of a stranger's attention. Anything that needs a chart
 * the viewer cannot see, or refers to "the above", is worse than posting nothing.
 */
function isCardable(q: { q: string; opts: string[]; exp: string }): string | null {
  const all = `${q.q} ${q.opts.join(" ")} ${q.exp}`;
  if (isPlaceholder(q.exp)) return "placeholder explanation";
  if (q.exp.trim().length < 60) return "explanation too thin to teach anything";
  if (q.q.length > 190) return "question too long for a phone screen";
  if (q.opts.length < 2) return "not enough options";
  if (q.opts.some(o => o.length > 90)) return "an option is too long for the card";
  if (/\b(figure|diagram|chart|annex(?:ure)?|appendix|shown below|given below|above|following table)\b/i.test(all))
    return "depends on something the viewer cannot see";
  const leak = FORBIDDEN.find(n => all.toLowerCase().includes(n.toLowerCase()));
  if (leak) return `names a source (${leak})`;
  return null;
}

type Pick = {
  q: string; opts: string[]; ans: number; exp: string;
  subjectId: string; subjectName: string; subjectShort: string;
  chapterId: string; chapterTitle: string; chapterNumber: number;
  track: "cpl" | "atpl"; url: string; key: string;
};

const pool: Pick[] = [];
const rejected: Record<string, number> = {};
const seen = new Set<string>();

for (const [track, subs] of [["cpl", CPL_SUBJECTS], ["atpl", ATPL_SUBJECTS]] as const) {
  for (const s of subs) {
    for (const ch of s.chapters) {
      for (const q of getChapterSpecificQuestions(s.id, ch.id)) {
        const key = q.q.trim();
        if (seen.has(key)) continue;          // the same stem serves several chapters
        seen.add(key);
        const why = isCardable(q);
        if (why) { rejected[why] = (rejected[why] ?? 0) + 1; continue; }
        pool.push({
          q: q.q.trim(), opts: q.opts, ans: q.ans, exp: q.exp.trim(),
          subjectId: s.id, subjectName: s.name, subjectShort: s.shortName,
          chapterId: ch.id, chapterTitle: ch.title, chapterNumber: ch.number,
          track, url: `${SITE_URL}/${track}/${s.id}/${ch.id}/notes`, key,
        });
      }
    }
  }
}

// Deterministic order, so the same day always yields the same Short and a rerun
// is idempotent. Sorted by key rather than shuffled: reproducible beats random.
pool.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));

const used: string[] = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, "utf8")) : [];
const usedSet = new Set(used);

const idArg = process.argv.indexOf("--id");
let chosen: Pick | undefined;
if (idArg >= 0) {
  chosen = pool[Number(process.argv[idArg + 1])];
} else {
  chosen = pool.find(p => !usedSet.has(p.key));
}

console.log(`cardable questions : ${pool.length} of ${seen.size} distinct`);
console.log(`already used       : ${used.length}`);
console.log("rejected, by reason:");
for (const [why, n] of Object.entries(rejected).sort((a, b) => b[1] - a[1]))
  console.log(`  ${String(n).padStart(5)}  ${why}`);

if (!chosen) {
  console.log("\nNothing left to pick. Clear tools/shorts/_used.json to start the cycle again.");
  process.exit(1);
}

const spec = {
  ...chosen,
  answerText: chosen.opts[chosen.ans],
  answerLetter: "ABCDEFGH"[chosen.ans],
  generatedAt: new Date().toISOString(),
};
mkdirSync(HERE, { recursive: true });
writeFileSync(OUT, JSON.stringify(spec, null, 2), "utf8");

console.log(`\nPICKED  [${chosen.subjectShort} ${chosen.chapterId}]`);
console.log(`  Q   ${chosen.q}`);
console.log(`  A   ${spec.answerLetter}. ${spec.answerText}`);
console.log(`  why ${chosen.exp.slice(0, 110)}...`);
console.log(`\nwrote ${OUT}`);
console.log("next:  python tools/shorts/render.py");
