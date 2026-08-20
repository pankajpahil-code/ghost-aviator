/**
 * GINI'S TRUTH LAYER.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * THE ONE RULE, AND IT IS STRUCTURAL, NOT ASPIRATIONAL:
 *
 *   Gini may only ever say sentences that are ALREADY WRITTEN AND STORED in
 *   this repository. He retrieves; he never composes. There is no model call
 *   in this file and there must never be one.
 *
 * Why it is built this way. Iron Rule 1 says never publish a guessed answer —
 * wrong answers harm student pilots. A language model asked to "explain this
 * question" will produce fluent, confident, occasionally wrong aviation
 * teaching, and it would be doing so in the mascot's voice, on the site that
 * publishes /how-answers-are-verified. The only defence that actually holds is
 * to make invention impossible rather than unlikely: every string Gini speaks
 * comes out of a data file a human wrote.
 *
 * When there is nothing verified to say, he says so. That refusal is a feature.
 * It is also honest in a way no competitor in this market is.
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Measured corpus (re-run `npx tsx tools/audit/gini-corpus.mts`):
 *   4,414 questions total
 *   3,232 carry a real explanation (73.2%)
 *   3,052 survive the speakable gate below  <-- what Gini can actually explain
 */

import { ALL_QUESTIONS, type DemoQuestion } from "@/lib/questions";
import { FAQS, type FaqEntry } from "@/lib/faq";
import { keyFactsFor } from "@/lib/chapter-key-facts";
import { verificationFor, LEVEL_LABEL } from "@/lib/verification-status";
import { CPL_SUBJECTS } from "@/lib/subjects";

/* ─────────────────────────── result shape ─────────────────────────── */

export type GiniSource =
  | { type: "faq"; question: string }
  | { type: "explanation"; subjectId: string; chapterId?: string }
  | { type: "key-fact"; subjectId: string; chapterId: string }
  | { type: "structure" };

export type GiniReply =
  | { kind: "answer"; text: string; source: GiniSource; href?: string }
  | { kind: "refusal"; text: string; reason: RefusalReason };

export type RefusalReason =
  | "no-explanation"      // the question exists but its explanation is a placeholder
  | "not-verified"        // we hold nothing verified on this
  | "needs-figure"        // the explanation refers to a diagram the student cannot see
  | "out-of-scope";       // not something Gini is allowed to answer at all

/**
 * The single refusal sentence. Deliberately plain: it admits the gap and points
 * at the human who can close it, rather than dressing a guess up as an answer.
 */
export const REFUSALS: Record<RefusalReason, string> = {
  "no-explanation":
    "The answer is marked, but nobody has written the explanation for this one yet — so I won't invent one. Work through it with the notes for this chapter.",
  "not-verified":
    "I don't have a verified answer for that, and I'm not going to guess at it. Ask Capt. Pahil.",
  "needs-figure":
    "This one depends on a diagram you can't see from here, so reading it out would mislead you. Open the chapter notes instead.",
  "out-of-scope":
    "That's outside what I can answer. I stick to this site, its chapters, and the questions in the bank.",
};

const refuse = (reason: RefusalReason): GiniReply => ({
  kind: "refusal",
  text: REFUSALS[reason],
  reason,
});

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
 * already wrote for it. No paraphrase: paraphrasing exam content is how a
 * limit or a value silently changes.
 */
export function explainQuestion(q: DemoQuestion): GiniReply {
  if (!isRealExplanation(q.exp)) return refuse("no-explanation");
  if (NEEDS_FIGURE.test(q.exp)) return refuse("needs-figure");
  if (!isSpeakable(q)) return refuse("not-verified");

  const correct = q.opts[q.ans];
  const text = correct
    ? `The answer is ${correct}. ${q.exp.trim()}`
    : q.exp.trim();

  return {
    kind: "answer",
    text,
    source: {
      type: "explanation",
      subjectId: q.subjectIds[0] ?? "unknown",
      chapterId: q.chapterId,
    },
  };
}

/** How much of a subject's bank Gini can actually speak to. Honest counts. */
export function speakableStats(subjectId?: string) {
  const pool = subjectId
    ? ALL_QUESTIONS.filter(q => q.subjectIds.includes(subjectId))
    : ALL_QUESTIONS;
  const speakable = pool.filter(isSpeakable).length;
  return { total: pool.length, speakable, silent: pool.length - speakable };
}

/* ──────────────────────────── site questions ──────────────────────────── */

/**
 * Answer a typed question from the FAQ — the only free-text path, and it is a
 * lookup, not a search over prose. Scores by how many distinctive words of the
 * query appear in the stored question. No match means refusal, never a
 * best-effort guess.
 */
const STOP = new Set([
  "the", "a", "an", "is", "are", "do", "does", "i", "you", "to", "of", "in",
  "for", "on", "what", "how", "when", "why", "can", "and", "it", "my", "me",
  "there", "any", "much", "many", "get", "be",
]);

const words = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2 && !STOP.has(w));

export function answerFromFaq(query: string): GiniReply {
  const qs = words(query);
  if (!qs.length) return refuse("out-of-scope");

  let best: { entry: FaqEntry; score: number } | null = null;
  for (const entry of FAQS) {
    const hay = new Set(words(entry.q + " " + entry.a));
    const score = qs.reduce((n, w) => n + (hay.has(w) ? 1 : 0), 0);
    if (!best || score > best.score) best = { entry, score };
  }

  // Require real overlap. A single incidental word is not a match, and
  // answering on one is how an assistant confidently answers the wrong question.
  if (!best || best.score < 2) return refuse("not-verified");

  return {
    kind: "answer",
    text: best.entry.a,
    source: { type: "faq", question: best.entry.q },
    href: best.entry.href,
  };
}

/* ────────────────────────── chapters & structure ────────────────────────── */

/** The verified one-liners for a chapter, if any exist. Never padded. */
export function chapterFacts(subjectId: string, chapterId: string): GiniReply {
  const facts = keyFactsFor(subjectId, chapterId);
  if (!facts || !facts.facts?.length) return refuse("not-verified");
  return {
    kind: "answer",
    text: facts.facts.map(f => f.fact).join(" "),
    source: { type: "key-fact", subjectId, chapterId },
  };
}

/** Structural facts — derived from the data, so they cannot go stale. */
export function describeSubject(subjectId: string): GiniReply {
  const s = CPL_SUBJECTS.find(x => x.id === subjectId);
  if (!s) return refuse("out-of-scope");

  const v = verificationFor(subjectId);
  const status = v ? ` Its answers are currently ${LEVEL_LABEL[v.level].toLowerCase()}.` : "";
  const { total, speakable } = speakableStats(subjectId);

  return {
    kind: "answer",
    text:
      `${s.name} has ${s.chapters.length} chapters and ${total} practice questions. ` +
      `I can explain ${speakable} of them in full.${status}`,
    source: { type: "structure" },
    href: `/cpl/${s.id}`,
  };
}

/** Where something lives on the site. Pure structure, always true. */
export function findChapter(query: string): GiniReply {
  const qs = words(query);
  if (!qs.length) return refuse("out-of-scope");

  let best: { href: string; label: string; score: number } | null = null;
  for (const s of CPL_SUBJECTS) {
    for (const c of s.chapters) {
      const hay = new Set(words(`${c.title} ${s.name}`));
      const score = qs.reduce((n, w) => n + (hay.has(w) ? 1 : 0), 0);
      if (score > 0 && (!best || score > best.score)) {
        best = {
          href: `/cpl/${s.id}/${c.id}/notes`,
          label: `${s.name} — Chapter ${c.number}: ${c.title}`,
          score,
        };
      }
    }
  }
  if (!best || best.score < 1) return refuse("not-verified");
  return {
    kind: "answer",
    text: `That's ${best.label}.`,
    source: { type: "structure" },
    href: best.href,
  };
}

/* ────────────────────────────── the router ────────────────────────────── */

/**
 * The single entry point. Order matters: structure and FAQ are answerable with
 * certainty, so they are tried first; anything else falls through to a refusal
 * rather than to a generated sentence.
 */
export function ask(query: string): GiniReply {
  const faq = answerFromFaq(query);
  if (faq.kind === "answer") return faq;

  const where = /\b(where|find|which chapter|show me|take me)\b/i.test(query);
  if (where) {
    const found = findChapter(query);
    if (found.kind === "answer") return found;
  }

  return refuse("not-verified");
}
