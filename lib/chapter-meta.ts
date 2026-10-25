import type { Subject, Chapter } from "@/lib/subjects";

/**
 * Per-route-type meta descriptions for chapter pages.
 *
 * Why this exists: every chapter publishes several routes (notes, questions,
 * chapter-quiz, video, mock-test) and all of them were emitting the SAME
 * `chapter.description`. A crawl of the live sitemap on 2026-08-08 found 931
 * URLs sharing far fewer distinct descriptions — six identical ones per chapter
 * in the worst case (slides and audio were retired 2026-08-13, leaving five).
 * Duplicate descriptions are a de-duplication signal: Google
 * picks one URL per cluster to rank and drops the rest, and it rewrites the
 * snippet itself rather than using ours, so we lose control of the one line a
 * student reads before deciding whether to click.
 *
 * The notes route keeps the real chapter description — it is the substantive
 * page and the description was written for it. Every other route gets a line
 * that describes what that page actually *does*, which is both more accurate
 * and naturally distinct.
 *
 * Kept under ~155 characters so Google does not truncate mid-sentence.
 */
/**
 * The <title> for a chapter route.
 *
 * WHY THE ORDER CHANGED (2026-08-14). Every chapter title used to open with
 * "Ch.7 " — six characters of the most valuable real estate in search, spent on
 * a string no student has ever typed. A crawl measured 196 of the 235 notes
 * titles running past the ~60 characters Google displays, so what a searcher
 * actually saw was:
 *
 *     Ch.16 The 1 in 60 Rule — Notes | Navigation CPL | Ghost A…
 *
 * and the word "DGCA" — the qualifier that separates a student sitting an Indian
 * exam from someone idly reading about navigation — appeared in none of them.
 *
 * The topic now leads, because that is the part of the query a student types
 * ("the 1 in 60 rule", "vertical speed indicator" — both are real queries this
 * site has already drawn impressions for). Then the exam, then the paper, then
 * the brand last where truncation costs nothing.
 *
 * Dropping the chapter number is safe: no two chapters within one subject share
 * a title, so every title stays unique. The number is still in the h1, the
 * breadcrumb and the URL.
 */
/**
 * The subject's full name as it reads in a title or heading: "Aviation
 * Meteorology", "Air Regulations". Ticket #7 (2026-10-25) asked for full names
 * instead of the short labels ("Tech Perf", "HPL"). Parentheticals such as
 * "(Advanced)" are dropped, and "Navigation — Instrumentation" reads as
 * "Instrumentation" (the part after the dash names the paper).
 */
export function subjectLabel(subject: Subject): string {
  const name = subject.name.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  const parts = name.split(/\s+[—–]\s+/);
  return parts[parts.length - 1] || subject.shortName;
}

/** Google shows roughly 60 characters of a title. */
export const TITLE_MAX = 60;

/**
 * Pick the most complete title that fits in TITLE_MAX: the topic always leads,
 * then the exam and the full subject, then the page kind, then the brand —
 * which is the first thing dropped when space runs out (ticket #7). Only if no
 * variant fits is the topic itself shortened.
 */
export function fitTitle(topic: string, variants: string[]): string {
  for (const v of variants) {
    const t = `${topic} – ${v}`;
    if (t.length <= TITLE_MAX) return t;
  }
  if (topic.length <= TITLE_MAX) return topic;
  const cut = topic.slice(0, TITLE_MAX - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[\s,;:—–-]+$/, "") + "…";
}

export function chapterTitle(
  track: "cpl" | "atpl",
  subject: Subject,
  chapter: Chapter,
  type: string,
): string {
  const exam = `DGCA ${track.toUpperCase()}`;
  const full = subjectLabel(subject);
  const short = subject.shortName;
  const brand = "Ghost Aviator";
  const kinds: Record<string, string[]> = {
    notes: ["Notes"],
    questions: ["Practice Questions", "Questions"],
    video: ["Video Lecture", "Lecture"],
    "chapter-quiz": ["Chapter Quiz", "Quiz"],
    "mock-test": ["Chapter Test", "Test"],
  };
  const kind = kinds[type] ?? kinds.notes;
  const subjects = full === short ? [full] : [full, short];

  const variants: string[] = [];
  // Most complete first: full subject + kind + brand, then without the brand,
  // then the short subject label, then the shorter page kind.
  for (const k of kind) {
    for (const subj of subjects) variants.push(`${exam} ${subj} ${k} | ${brand}`);
  }
  for (const k of kind) {
    for (const subj of subjects) variants.push(`${exam} ${subj} ${k}`);
  }
  for (const k of kind) variants.push(`${exam} ${k}`);
  // Long chapter names: keep at least the exam (and the page kind if it fits).
  const trackOnly = track.toUpperCase();
  for (const k of kind) variants.push(`${trackOnly} ${k}`);
  variants.push(exam, trackOnly);
  return fitTitle(chapter.title, variants);
}

/**
 * Fit a description into the snippet Google actually shows.
 *
 * THE DEFECT THIS FIXES. The header above promised "kept under ~155 characters
 * so Google does not truncate mid-sentence", and every branch below honoured it
 * EXCEPT the notes branch, which returns `chapter.description` unbounded.
 * Measured 2026-08-23 across the 437 indexable chapter routes: 114 descriptions
 * ran past 160 characters, 33 past 200, the longest 328.
 *
 * What that looks like to a student is the live snippet for ar-6 — the site's
 * most-seen content page, 36 impressions and no clicks in three months:
 *
 *     …runway occupancy, circuit procedures, visual approach sepa
 *
 * Cut mid-word. A snippet that ends like that reads as a broken page, and it is
 * the one line a searcher weighs before deciding whether to click.
 *
 * This only makes the cut clean; it does not make a keyword list into a
 * sentence. Several chapter descriptions are comma-separated syllabus coverage
 * rather than prose — better copy is worth writing, but it is the Captain's
 * voice and his call, not a truncation function's.
 */
const SNIPPET_MAX = 155;

export function fitSnippet(text: string, max = SNIPPET_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  // Prefer ending on a real sentence, but only if that keeps most of the line —
  // stopping at a full stop 30 characters in would throw away the substance.
  const head = clean.slice(0, max);
  const lastStop = Math.max(head.lastIndexOf(". "), head.lastIndexOf("? "), head.lastIndexOf("! "));
  if (lastStop >= max * 0.6) return clean.slice(0, lastStop + 1);

  // Otherwise cut at the last word boundary and mark it as continuing. Trailing
  // punctuation goes with it, so we never leave "…procedures, …".
  const cut = head.slice(0, head.lastIndexOf(" "));
  return cut.replace(/[\s,;:—–-]+$/, "") + "…";
}

/** Ticket #7: descriptions run 120–160 characters. */
export const DESCRIPTION_MIN = 120;

/** Append true, generic tails to a short description until it reaches the minimum. */
export function padSnippet(text: string, tails: string[]): string {
  let out = fitSnippet(text);
  for (const tail of tails) {
    if (out.length >= DESCRIPTION_MIN) break;
    const next = `${out} ${tail}`;
    if (next.length <= SNIPPET_MAX) out = next;
  }
  return out;
}

/** The first candidate already inside 120–155 characters, else the last one padded. */
function firstFitting(candidates: string[], tails: string[]): string {
  for (const c of candidates) {
    if (c.length >= DESCRIPTION_MIN && c.length <= SNIPPET_MAX) return c;
  }
  return padSnippet(candidates[candidates.length - 1], tails);
}

export function chapterMetaDescription(
  track: "cpl" | "atpl",
  subject: Subject,
  chapter: Chapter,
  type: string,
  questionCount: number,
): string {
  const exam = `DGCA ${track.toUpperCase()}`;
  const topic = chapter.title;
  const subj = subjectLabel(subject);
  const qty = questionCount > 0 ? `${questionCount} ` : "";
  // Three chapters own exactly one question (ar-24, inst-19, rnav-10), and the
  // snippet Google showed for them read "1 exam-style practice questions".
  // Small, and on a site whose entire claim is precision it is the wrong kind
  // of small. Both callers below need the noun, so it is computed once.
  const qWord = questionCount === 1 ? "question" : "questions";
  const tails = [
    `Chapter ${chapter.number} of the ${exam} ${subj} syllabus.`,
    "Free on Ghost Aviator, no sign-up.",
    "Free, no sign-up.",
  ];

  switch (type) {
    case "questions":
      return padSnippet(`${qty}exam-style practice ${qWord} on ${topic}, with the correct answer and reasoning shown for each. Free ${exam} ${subj} preparation.`, tails);
    case "chapter-quiz":
      return padSnippet(`Timed self-test on ${topic} — ${qty}${qWord} scored instantly, so you know what you actually know before the ${exam} ${subj} paper.`, tails);
    case "video":
      return firstFitting([
        `Video lecture on ${topic} for the ${exam} ${subj} paper, taught by Capt. Pankaj Pahil. Free to watch on Ghost Aviator, no sign-up.`,
        `Video lecture on ${topic} for the ${exam} ${subj} paper, taught by Capt. Pankaj Pahil. Free to watch, no sign-up.`,
      ], tails.slice(0, 2));
    case "mock-test":
      return padSnippet(`Chapter test on ${topic}, marked against the ${exam} ${subj} syllabus. ${qty}${qWord}, instant result.`, tails);
    case "notes":
    default:
      // The notes page is the real article; its own description is the best one
      // we have. Fall back to a built line only when a chapter has none.
      return padSnippet(
        chapter.description ||
        `Study notes on ${topic} for the ${exam} ${subj} paper, written for Indian student pilots and free to read.`,
        [`${exam} ${subj} notes, chapter ${chapter.number}.`, ...tails.slice(1)],
      );
  }
}
