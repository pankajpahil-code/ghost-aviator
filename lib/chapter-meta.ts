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
      return `${qty}exam-style practice questions on ${topic}, with the correct answer and reasoning shown for each. Free ${exam} ${subj} preparation.`;
    case "chapter-quiz":
      return `Timed self-test on ${topic} — ${qty}questions scored instantly, so you know what you actually know before the ${exam} ${subj} paper.`;
    case "video":
      return `Video lecture on ${topic} for the ${exam} ${subj} paper, taught by Capt. Pankaj Pahil. Free to watch, no sign-up.`;
    case "mock-test":
      return `Chapter test on ${topic}, marked against the ${exam} ${subj} syllabus. ${qty}questions, instant result.`;
    case "notes":
    default:
      // The notes page is the real article; its own description is the best one
      // we have. Fall back to a built line only when a chapter has none.
      return (
        chapter.description ||
        `Study notes on ${topic} for the ${exam} ${subj} paper, written for Indian student pilots and free to read.`
      );
  }
}
