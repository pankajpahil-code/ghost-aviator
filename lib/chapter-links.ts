import type { Chapter, Subject } from "./subjects";
import { isIndexableChapterRoute } from "./indexability";

/**
 * Cross-links between one chapter's notes, video lecture and practice questions
 * (ticket #6). Server-only: isIndexableChapterRoute reads the notes files.
 *
 * Every link is gated on the SAME predicate the route's robots tag and the
 * sitemap use, so a chapter page only ever points at a sibling that is real,
 * indexable content — never at a stub, a noindex drill, or a question set that
 * canonically lives under another chapter.
 */
export type StudyRoute = "notes" | "video" | "questions";

export type StudyLink = { type: StudyRoute; href: string; label: string };
export type StudyNeighbour = { href: string; chapter: Chapter } | null;

export type ChapterStudyLinkData = {
  links: StudyLink[];
  /** Only filled for the questions route: the nearest indexable question set either side. */
  prev: StudyNeighbour;
  next: StudyNeighbour;
};

const LABELS: Record<StudyRoute, string> = {
  notes: "Read the chapter notes",
  video: "Watch the video lecture",
  questions: "Practice questions",
};

export function chapterStudyLinks(
  track: "cpl" | "atpl",
  subject: Subject,
  chapterIdx: number,
  current: string,
): ChapterStudyLinkData {
  const chapter = subject.chapters[chapterIdx];
  const base = `/${track}/${subject.id}`;
  const links: StudyLink[] = (["notes", "video", "questions"] as const)
    .filter(type => type !== current && isIndexableChapterRoute(subject.id, chapter.id, type))
    .map(type => ({ type, href: `${base}/${chapter.id}/${type}`, label: LABELS[type] }));

  let prev: StudyNeighbour = null;
  let next: StudyNeighbour = null;
  if (current === "questions") {
    for (let i = chapterIdx - 1; i >= 0; i--) {
      const ch = subject.chapters[i];
      if (isIndexableChapterRoute(subject.id, ch.id, "questions")) { prev = { href: `${base}/${ch.id}/questions`, chapter: ch }; break; }
    }
    for (let i = chapterIdx + 1; i < subject.chapters.length; i++) {
      const ch = subject.chapters[i];
      if (isIndexableChapterRoute(subject.id, ch.id, "questions")) { next = { href: `${base}/${ch.id}/questions`, chapter: ch }; break; }
    }
  }
  return { links, prev, next };
}
