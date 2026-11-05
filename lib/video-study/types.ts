/**
 * Study guide shown on a chapter's /video watch page, under the player.
 *
 * Written from the chapter's own published notes (public/content/... or the
 * notes component), never from the video, which is not transcribed here. So
 * the page labels it as a summary of the notes, and every fact in it must be
 * one the notes state (Iron Rule 1). Each chapter's text is written for that
 * chapter alone: no shared template sentences.
 */
export type VideoStudy = {
  /** 2-3 paragraphs: what the chapter is about and how its parts fit together. */
  summary: string[];
  /** 5-8 facts the DGCA paper actually tests. */
  keyPoints: string[];
  /** The mistakes and look-alike distractors students fall for. */
  traps: string[];
};

/** Keyed by chapter id (e.g. "ar-3"). */
export type VideoStudyMap = Record<string, VideoStudy>;
