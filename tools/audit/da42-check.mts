/**
 * Pre-ship check for the DA-42 NG question bank.
 *
 *   npx tsx tools/audit/da42-check.mts
 *
 * Two things must be true before 145 answers go in front of students:
 *   1. Every chapter's questions are genuinely ITS OWN, not a subject-wide
 *      fallback — otherwise the /questions pages become duplicate content, the
 *      trap documented in CLAUDE.md ("114 of 284 question pages served a set
 *      identical to another chapter").
 *   2. Nothing Gini could read aloud carries a third-party attribution
 *      (Iron Rule 2) or a placeholder explanation (Iron Rule 1).
 */

import {
  getQuestionsForChapter,
  getChapterSpecificQuestions,
  ALL_QUESTIONS,
} from "../../lib/questions";
import { isSpeakable, explainQuestion } from "../../lib/gini/knowledge";

const IDS = Array.from({ length: 10 }, (_, i) => `da42-${i + 1}`);
const BANNED = /\b(oxford|cae|nordian|redbird|jeppesen|ic\s*joshi|rk\s*bali)\b/i;

console.log("DA-42 NG BANK — PRE-SHIP CHECK");
console.log("=".repeat(58));

let own = 0;
for (const id of IDS) {
  const all = getQuestionsForChapter("technical-specific", id).length;
  const specific = getChapterSpecificQuestions("technical-specific", id).length;
  own += specific;
  const flag = specific === 0 && all > 0 ? "  <-- FALLBACK, will not be indexed" : "";
  console.log(`  ${id.padEnd(9)} total ${String(all).padStart(4)}   own ${String(specific).padStart(4)}${flag}`);
}

console.log(`\nchapter-specific total : ${own}`);
console.log(`ALL_QUESTIONS          : ${ALL_QUESTIONS.length}`);

const da42 = ALL_QUESTIONS.filter(q => (q.chapterId ?? "").startsWith("da42-"));
const speakable = da42.filter(isSpeakable).length;
const leaks = da42.filter(q => BANNED.test(q.q) || BANNED.test(q.exp ?? ""));
const stubs = da42.filter(q => {
  const r = explainQuestion(q);
  return r.kind === "answer" && /^\s*correct answer\s*[:\-]?\s*[A-D]?\s*\.?\s*$/i.test((q.exp ?? "").trim());
});

console.log(`\nin ALL_QUESTIONS       : ${da42.length}`);
console.log(`Gini can explain       : ${speakable}`);
console.log(`Iron Rule 2 leaks      : ${leaks.length} ${leaks.length === 0 ? "(clean)" : "*** FIX ***"}`);
console.log(`placeholders spoken    : ${stubs.length} ${stubs.length === 0 ? "(clean)" : "*** FIX ***"}`);
for (const l of leaks.slice(0, 3)) console.log(`   LEAK: ${l.q.slice(0, 70)}`);

// Answer index must be in range — an out-of-range `ans` silently marks nothing.
const bad = da42.filter(q => q.ans < 0 || q.ans >= q.opts.length);
console.log(`answer index in range  : ${bad.length === 0 ? "all OK" : `*** ${bad.length} OUT OF RANGE ***`}`);
for (const b of bad.slice(0, 3)) console.log(`   BAD: ${b.q.slice(0, 60)} ans=${b.ans} of ${b.opts.length}`);

// Duplicate stems inside the bank.
const seen = new Map<string, number>();
for (const q of da42) {
  const k = q.q.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 90);
  seen.set(k, (seen.get(k) ?? 0) + 1);
}
const dupes = [...seen.values()].filter(n => n > 1).length;
console.log(`duplicate stems        : ${dupes}`);
console.log("");
