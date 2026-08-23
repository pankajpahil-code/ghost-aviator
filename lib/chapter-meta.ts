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
export function chapterTitle(
  track: "cpl" | "atpl",
  subject: Subject,
  chapter: Chapter,
  type: string,
): string {
  const exam = `DGCA ${track.toUpperCase()}`;
  const subj = subject.shortName;
  const brand = "Ghost Aviator";

  switch (type) {
    // "Practice Questions" and "Video Lecture" were trimmed to one word each:
    // at ~60 visible characters, the second word was being cut off mid-way on
    // most chapters and bought no relevance the first one did not.
    case "questions":
      return `${chapter.title} — ${exam} ${subj} Questions | ${brand}`;
    case "video":
      return `${chapter.title} — ${exam} ${subj} Lecture | ${brand}`;
    case "chapter-quiz":
      return `${chapter.title} Quiz — ${exam} ${subj} | ${brand}`;
    case "mock-test":
      return `${chapter.title} Chapter Test — ${exam} ${subj} | ${brand}`;
    case "notes":
    default:
      return `${chapter.title} — ${exam} ${subj} Notes | ${brand}`;
  }
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

export function chapterMetaDescription(
  track: "cpl" | "atpl",
  subject: Subject,
  chapter: Chapter,
  type: string,
  questionCount: number,
): string {
  const exam = `DGCA ${track.toUpperCase()}`;
  const topic = chapter.title;
  const subj = subject.shortName;
  const qty = questionCount > 0 ? `${questionCount} ` : "";

  switch (type) {
    case "questions":
      return fitSnippet(`${qty}exam-style practice questions on ${topic}, with the correct answer and reasoning shown for each. Free ${exam} ${subj} preparation.`);
    case "chapter-quiz":
      return fitSnippet(`Timed self-test on ${topic} — ${qty}questions scored instantly, so you know what you actually know before the ${exam} ${subj} paper.`);
    case "video":
      return fitSnippet(`Video lecture on ${topic} for the ${exam} ${subj} paper, taught by Capt. Pankaj Pahil. Free to watch, no sign-up.`);
    case "mock-test":
      return fitSnippet(`Chapter test on ${topic}, marked against the ${exam} ${subj} syllabus. ${qty}questions, instant result.`);
    case "notes":
    default:
      // The notes page is the real article; its own description is the best one
      // we have. Fall back to a built line only when a chapter has none.
      return fitSnippet(
        chapter.description ||
        `Study notes on ${topic} for the ${exam} ${subj} paper, written for Indian student pilots and free to read.`,
      );
  }
}
