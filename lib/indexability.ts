import fs from "node:fs";
import path from "node:path";
import { CPL_SUBJECTS, ATPL_SUBJECTS, type Subject } from "@/lib/subjects";
import { getChapterSpecificQuestions, getQuestionsForChapter } from "@/lib/questions";
import { getChapterVideos } from "@/lib/chapter-videos";

/**
 * ONE PREDICATE FOR WHETHER A CHAPTER ROUTE BELONGS IN THE INDEX.
 *
 * Written 2026-08-14 after the Search Console coverage export showed 35 pages
 * indexed against 971 known, with 633 "Discovered - currently not indexed" —
 * URLs Google had found and then declined even to crawl.
 *
 * WHAT THE MEASUREMENT SAID. A Googlebot crawl of production found the site's
 * technical hygiene already clean: 604/604 submitted URLs returned 200, every
 * one with a unique title, a unique description, a self-referencing canonical
 * and exactly one h1. Nothing in the markup explains the refusal.
 *
 * What does explain it is the size and shape of the crawlable surface. Following
 * the internal links from those 604 pages reaches 1,038 distinct URLs, and the
 * 434 that are reachable-but-unsubmitted are almost entirely empty:
 *
 *     302 chapter-quiz pages       28 main words   ("74 Questions · Start Quiz →")
 *      67 notes pages           ~100 main words   (no notes.html — a stub)
 *      31 video pages             54 main words   (no lecture — Coming Soon)
 *
 * Add the 109 submitted video pages at 63 words and roughly half of every URL a
 * crawler can reach on this domain carries under 150 words of unique content.
 * That is the message the site has been sending: mostly thin, mostly duplicated.
 * Google's answer was to stop crawling and index 35 pages.
 *
 * THE MISTAKE THIS CORRECTS. The 2026-08-08 pass removed those routes from the
 * sitemap and reasoned that they would be fine because "Google is free to find
 * and index them by following links." On a domain with one external backlink,
 * that is exactly backwards. Un-submitting a URL does not un-publish it: it is
 * still linked from every chapter page, still crawled, and still counted when
 * Google forms a view of what this domain is mostly made of. A crawl spent on a
 * 28-word quiz shell is a crawl not spent on 2,500 words of the Captain's
 * teaching. Removing them from the sitemap was necessary; it was not sufficient.
 *
 * So indexability is now stated once, here, and both the sitemap and the routes'
 * generateMetadata read it. They cannot disagree — which matters, because a
 * sitemap condition drifting from the route's own render condition is how this
 * codebase produced orphans and duplicate submissions twice already.
 *
 * The drills stay live and stay linked. Students still get a quiz on every
 * chapter. They simply stop asking to be indexed.
 */

export type ChapterRouteType = "notes" | "video" | "questions" | "mock-test" | "chapter-quiz";
export type Track = "cpl" | "atpl";

// ─── Notes availability ──────────────────────────────────────────────────────
//
// This list used to live inside app/cpl/[subject]/[chapter]/[type]/page.tsx and
// decide only what to RENDER, while the sitemap made the same decision from a
// separate filesystem check. They happen to agree today; there was nothing
// keeping them that way. Both now read this.

/** Subjects whose chapters serve inline notes as soon as notes.html is published. */
const AUTO_NOTES_SUBJECTS = new Set([
  "instrumentation",
  "radio-navigation",
  "technical-general",
  "radio-telephony",
  // ATPL
  "human-performance",
]);

/** Chapters served from an explicit allow-list rather than a whole-subject rule. */
export const HTML_NOTES_CHAPTERS: ReadonlySet<string> = new Set([
  // Air Regulations (ar-1 is a React component, handled separately below)
  ...Array.from({ length: 25 }, (_, i) => `air-regulations/ar-${i + 2}`),
  // Meteorology
  ...Array.from({ length: 29 }, (_, i) => `meteorology/met-${i + 1}`),
  // Air Navigation — nav-1, then nav-13..nav-33
  "air-navigation/nav-1",
  ...Array.from({ length: 21 }, (_, i) => `air-navigation/nav-${i + 13}`),
  // DA-42 NG type-specific
  ...Array.from({ length: 10 }, (_, i) => `technical-specific/da42-${i + 1}`),
]);

const notesFileExists = (subjectId: string, chapterId: string): boolean =>
  fs.existsSync(
    path.join(process.cwd(), "public", "content", subjectId, chapterId, "notes.html"),
  );

/**
 * Does this chapter's notes route serve real teaching, or the stub?
 *
 * `chapter.content[].available` cannot answer this: makeContent() hardcodes
 * notes to `available: true` for all 290 chapters, including the 67 that have
 * nothing behind them. Iron Rule 5 — derive it from the data.
 */
export function servesRealNotes(subjectId: string, chapterId: string): boolean {
  // Air Regs chapter 1 renders from a React component, not a published file.
  if (subjectId === "air-regulations" && chapterId === "ar-1") return true;
  if (AUTO_NOTES_SUBJECTS.has(subjectId)) return notesFileExists(subjectId, chapterId);
  if (HTML_NOTES_CHAPTERS.has(`${subjectId}/${chapterId}`)) {
    return notesFileExists(subjectId, chapterId);
  }
  return false;
}

// ─── One URL per distinct question set ───────────────────────────────────────
//
// getQuestionsForChapter falls back to the whole subject pool for a chapter with
// no bank of its own. That is right for a student — there is always something to
// practise — but it means 16 Air Navigation chapters serve the same 1,020
// questions and 8 Meteorology chapters the same 651. Only the first chapter to
// claim a given set is indexable; the rest are that page under another URL.
//
// Computed once, over CPL then ATPL in declaration order, so the answer for any
// single chapter is the same whether it is asked by the sitemap building all of
// them or by one page's generateMetadata in isolation.

let questionClaimants: Set<string> | null = null;

function claimants(): Set<string> {
  if (questionClaimants) return questionClaimants;
  const claimed = new Set<string>();
  const seenSets = new Set<string>();
  const walk = (subjects: Subject[]) => {
    for (const s of subjects) {
      for (const ch of s.chapters) {
        const own = getChapterSpecificQuestions(s.id, ch.id);
        if (own.length === 0) continue;          // subject-wide fallback, not this chapter's
        const key = own.map(q => q.q).join("|");
        if (seenSets.has(key)) continue;         // an earlier chapter already owns this set
        seenSets.add(key);
        claimed.add(`${s.id}/${ch.id}`);
      }
    }
  };
  walk(CPL_SUBJECTS);   // CPL is evaluated first, so CPL wins a tie with ATPL
  walk(ATPL_SUBJECTS);
  questionClaimants = claimed;
  return claimed;
}

/** Is this chapter the canonical home of its question set? */
export function ownsQuestionSet(subjectId: string, chapterId: string): boolean {
  return claimants().has(`${subjectId}/${chapterId}`);
}

// ─── The predicate ───────────────────────────────────────────────────────────

/**
 * Should this chapter route be indexed and submitted?
 *
 * Each arm matches the route's own render condition, so a page that renders a
 * stub can never be advertised as content.
 */
export function isIndexableChapterRoute(
  subjectId: string,
  chapterId: string,
  type: string,
): boolean {
  switch (type) {
    case "notes":
      return servesRealNotes(subjectId, chapterId);

    case "questions":
      return ownsQuestionSet(subjectId, chapterId);

    case "video":
      // A mapped lecture IS availability (lib/chapter-videos.ts is the source of
      // truth). Without one the route renders Coming Soon.
      return getChapterVideos(subjectId, chapterId).length > 0;

    // Client-rendered drills over questions the sibling /questions page already
    // publishes in full. 28 main words of server-rendered HTML, and the same 28
    // on all 302 of them. They are a study tool, not a document.
    case "chapter-quiz":
    case "mock-test":
      return false;

    default:
      return false;
  }
}

/**
 * Spread into a Metadata object. `follow` stays on deliberately: these pages sit
 * between the subject index and the chapters, and nofollow would wall off the
 * link equity passing through them for no gain.
 */
export const NOINDEX: { robots: { index: false; follow: true } } = {
  robots: { index: false, follow: true },
};

// ─── Chapter-to-chapter navigation ───────────────────────────────────────────

/**
 * Is there anything here for a student — a different question from whether the
 * URL belongs in the index.
 *
 * The two diverge on `questions`. A chapter with no bank of its own still runs a
 * real drill off the subject-wide pool, so there IS something to practise; it
 * just must not be indexed, because sixteen chapters serving the same 1,020
 * questions is one page under sixteen URLs. Navigation must use this predicate
 * and robots must use the other one. Conflating them would quietly wall off
 * every fallback chapter from the Previous/Next walk.
 */
export function hasRouteContent(
  subjectId: string,
  chapterId: string,
  type: ChapterRouteType,
): boolean {
  switch (type) {
    case "notes":    return servesRealNotes(subjectId, chapterId);
    case "video":    return getChapterVideos(subjectId, chapterId).length > 0;
    // Includes the subject-wide fallback: the drill runs either way.
    case "questions": return getQuestionsForChapter(subjectId, chapterId).length > 0;
    // Every chapter has a quiz and a test.
    default:         return true;
  }
}

/**
 * The nearest chapter either side that actually has this route's content.
 *
 * The Previous/Next pair at the foot of every chapter page used to be the
 * literally adjacent chapters, whatever was behind them. On the video route that
 * produced 31 links into "lecture coming soon", and on the notes route it walked
 * students into stubs — a dead end for the reader, and for a crawler a steady
 * supply of empty URLs discovered from pages that do have content.
 *
 * Skipping to the next chapter that has something is better navigation on its
 * own terms. Returning -1 at the ends is correct: the component already renders
 * nothing when the chapter is null.
 */
export function adjacentWithContent(
  chapters: readonly { id: string }[],
  subjectId: string,
  index: number,
  type: ChapterRouteType,
): { prev: number; next: number } {
  const has = (i: number) => hasRouteContent(subjectId, chapters[i].id, type);
  let prev = -1;
  for (let i = index - 1; i >= 0; i--) if (has(i)) { prev = i; break; }
  let next = -1;
  for (let i = index + 1; i < chapters.length; i++) if (has(i)) { next = i; break; }
  return { prev, next };
}
