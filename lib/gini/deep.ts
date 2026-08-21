/**
 * THE DEEP LAYER — everything that touches the 4,400-question bank.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * WHY IT IS ITS OWN MODULE, AND WHY NOTHING MAY IMPORT IT EAGERLY.
 *
 * Gini renders from the root layout, so he is on every page. He used to reach
 * the bank through a plain top-level import, which meant every question in
 * lib/questions.ts was compiled into the shared client bundle and downloaded by
 * every visitor on every page — /about and /signup included. Measured in the
 * build output on 2026-08-20: a single 2.2 MB chunk of question data, pulled in
 * by pages that have nothing to do with questions.
 *
 * So the split is: the light layer (persona, marketing, FAQ, structure) ships
 * with the page and answers instantly. THIS module is loaded with a dynamic
 * import(), the first time a student actually asks something the light layer
 * cannot answer. Most visitors never pay for it at all.
 *
 * If you add a static `import ... from "./deep"` anywhere in the client path,
 * you have silently undone that. Import it with `await import("./deep")`.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * The truth rule is unchanged and absolute: this module RETRIEVES explanations
 * a human wrote. It never paraphrases them, because paraphrasing exam content
 * is how a limit or a value silently changes.
 */

import { ALL_QUESTIONS, type DemoQuestion } from "@/lib/questions";
import { Index } from "./match";
import { answer, refuse, type GiniReply } from "./types";

/* ─────────────────────── the speakable gate ─────────────────────── */

/**
 * EXACTLY the production predicate from QuestionsPage.tsx. Duplicated on
 * purpose with this note: if that one changes, change this one in the same
 * commit, or Gini will start speaking placeholders the page itself hides.
 */
export function isRealExplanation(exp: string | undefined): boolean {
  if (!exp || !exp.trim()) return false;
  return !/^\s*correct answer\s*[:\-]?\s*[A-D]?\s*\.?\s*$/i.test(exp.trim());
}

/**
 * Iron Rule 2 — nothing student-facing may attribute teaching to a third party.
 * Gini speaks aloud, which is the most quotable surface on the site, so the
 * gate is applied to anything leaving his mouth.
 */
const ATTRIBUTION = /\b(oxford|cae|nordian|redbird|jeppesen|ic\s*joshi|joshi|rk\s*bali|bali)\b/i;

/**
 * Explanations that only make sense with a picture. Speaking these is worse
 * than silence: the student hears a confident sentence about something they
 * cannot see, and fills the gap with a wrong mental model.
 */
const NEEDS_FIGURE =
  /\b(figure|diagram|graph|chart|as shown|shown above|shown below|in the picture|refer to the|see the illustration)\b/i;

const MIN_EXPLANATION_CHARS = 25;

/** Can Gini read this explanation aloud, as written, without qualification? */
export function isSpeakable(q: DemoQuestion): boolean {
  if (!isRealExplanation(q.exp)) return false;
  if (q.exp.trim().length < MIN_EXPLANATION_CHARS) return false;
  if (ATTRIBUTION.test(q.exp) || ATTRIBUTION.test(q.q)) return false;
  if (NEEDS_FIGURE.test(q.exp)) return false;
  return true;
}

/* ───────────────────────── explaining a question ───────────────────────── */

/**
 * Explain one practice question — by reading back the explanation a human
 * already wrote for it. No paraphrase.
 */
export function explainQuestion(q: DemoQuestion): GiniReply {
  if (!isRealExplanation(q.exp)) return refuse("no-explanation");
  if (NEEDS_FIGURE.test(q.exp)) return refuse("needs-figure");
  if (!isSpeakable(q)) return refuse("not-verified");

  const correct = q.opts[q.ans];
  const text = correct
    ? `The answer is ${correct}. ${q.exp.trim()}`
    : q.exp.trim();

  return answer(text, {
    type: "explanation",
    subjectId: q.subjectIds[0] ?? "unknown",
    chapterId: q.chapterId,
  });
}

/** How much of a subject's bank Gini can actually speak to. Honest counts. */
export function speakableStats(subjectId?: string) {
  const pool = subjectId
    ? ALL_QUESTIONS.filter(q => q.subjectIds.includes(subjectId))
    : ALL_QUESTIONS;
  const speakable = pool.filter(isSpeakable).length;
  return { total: pool.length, speakable, silent: pool.length - speakable };
}

/* ──────────────────────────── searching the bank ────────────────────────── */

/**
 * THE BIGGEST SINGLE GAIN IN "MAKE HIM SMARTER", AND THE MOST DANGEROUS.
 *
 * Three thousand worked explanations were sitting on this site unreachable by
 * anyone who did not already know which chapter to open. Searching them means
 * a student can type "what is QNH" and get a sentence a human wrote and checked.
 *
 * The danger is obvious: match the wrong question and Gini reads a confident,
 * verified, IRRELEVANT answer, which is worse than a refusal because it sounds
 * right. Three defences, in order of importance:
 *
 *   1. A HIGH FLOOR. Well above the FAQ's, because the corpus is thousands of
 *      entries and the chance of a coincidental match rises with corpus size.
 *   2. THE MATCH MUST BE IN THE QUESTION ITSELF, not merely somewhere in its
 *      explanation, and it must be either two distinct concepts or one that
 *      accounts for the entire query. "What does an altimeter measure" matched
 *      "What does the sensor of an INS/IRS measure?" while the interrogatives
 *      still counted as concepts — two shared "concepts", a different
 *      instrument, and a confident answer to a question nobody asked.
 *   3. HE SHOWS HIS WORKING. The reply names the question he matched, so the
 *      student can see instantly if he has answered the wrong one. An assistant
 *      that hides what it matched cannot be caught being wrong.
 *
 * Only speakable questions are indexed, so a placeholder can never surface here.
 */
let bankIndex: Index<DemoQuestion> | null = null;

function getBankIndex(): Index<DemoQuestion> {
  if (bankIndex) return bankIndex;
  const speakable = ALL_QUESTIONS.filter(isSpeakable);
  bankIndex = new Index<DemoQuestion>(
    speakable.map(q => ({ item: q, title: q.q, body: `${q.opts[q.ans] ?? ""} ${q.exp}` })),
  );
  return bankIndex;
}

const BANK_FLOOR = 0.62;
/**
 * A single-concept query ("what is QNH") may still be answered, but only when
 * that concept IS the whole query and it appears in the question itself — i.e.
 * the stored question is unambiguously about the thing that was asked. Two or
 * more concepts is the ordinary case and needs no such margin.
 */
const SOLO_CONCEPT_FLOOR = 0.95;

const admissible = (h: { matched: string[]; inTitle: number; score: number }) => {
  if (h.inTitle < 1) return false;
  return new Set(h.matched).size >= 2 || h.score >= SOLO_CONCEPT_FLOOR;
};

export type BankHit = { question: DemoQuestion; score: number };

/**
 * The best speakable question for this query, or null. Ranking only — no text.
 *
 * `allowSolo` opens the single-concept path. It is OFF by default and the
 * router only turns it on as a last resort, because of what it retrieves:
 * asked "what is drift", the bank's best single-concept match was "In the NH,
 * if you experience port drift, the altimeter will read:" — a true, verified,
 * checked answer about altimeter error, offered to someone who wanted to know
 * what drift is. Not wrong, but not an answer. Where the topic has a chapter,
 * sending the student there beats reading them a tangential MCQ.
 */
export function searchBank(query: string, subjectId?: string, allowSolo = false): BankHit | null {
  const hits = getBankIndex()
    .search(query, BANK_FLOOR, 12)
    .filter(h => admissible(h) && (allowSolo || new Set(h.matched).size >= 2));
  // Prefer the subject the student is standing in, but do not refuse merely
  // because the best answer is filed under another one.
  const mine = subjectId ? hits.find(h => h.item.subjectIds.includes(subjectId)) : undefined;
  const best = mine ?? hits[0];
  return best ? { question: best.item, score: best.score } : null;
}

/**
 * SHORTLIST FOR THE ROUTER, and its floor is deliberately far lower than
 * searchBank's.
 *
 * These candidates are not answers — they are a menu handed to the model,
 * which then picks the one that actually addresses the question, or none. So
 * recall matters here and precision does not: a bad candidate on the list is
 * harmless, while a good answer missing from the list can never be given. The
 * precision that keeps a wrong answer off a student's screen is applied after
 * the pick, by only ever speaking the stored text of whatever was chosen.
 */
export function topBank(query: string, subjectId: string | undefined, n = 8): DemoQuestion[] {
  const hits = getBankIndex().search(query, 0.3, n * 3).filter(h => h.inTitle > 0);
  const mine = subjectId ? hits.filter(h => h.item.subjectIds.includes(subjectId)) : [];
  const rest = hits.filter(h => !mine.includes(h));
  return [...mine, ...rest].slice(0, n).map(h => h.item);
}

/** Look one up again by its stem, so the route never trusts an index across calls. */
export function bankQuestionByStem(stem: string): DemoQuestion | null {
  const want = stem.trim().toLowerCase();
  return ALL_QUESTIONS.find(q => isSpeakable(q) && q.q.trim().toLowerCase() === want) ?? null;
}

/**
 * Answer from the bank, showing which question was matched. `subjectId` biases
 * towards the subject the student is standing in, without excluding the rest.
 */
export function answerFromBank(query: string, subjectId?: string, allowSolo = false): GiniReply {
  const hit = searchBank(query, subjectId, allowSolo);
  if (!hit) return refuse("not-verified");

  const q = hit.question;
  const explained = explainQuestion(q);
  if (explained.kind !== "answer") return explained;

  return answer(
    `From the bank, on "${q.q.trim()}" — ${explained.text}`,
    { type: "explanation", subjectId: q.subjectIds[0] ?? "unknown", chapterId: q.chapterId },
    q.chapterId && q.subjectIds[0] ? `/cpl/${q.subjectIds[0]}/${q.chapterId}/questions` : undefined,
  );
}
