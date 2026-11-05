import type { VideoStudy, VideoStudyMap } from "./types";
import { AIR_REGULATIONS } from "./air-regulations";
import { AIR_NAVIGATION } from "./air-navigation";
import { METEOROLOGY } from "./meteorology";
import { INSTRUMENTATION } from "./instrumentation";

export type { VideoStudy } from "./types";

/** CPL subject id -> chapter id -> study guide. */
const BY_SUBJECT: Record<string, VideoStudyMap> = {
  "air-regulations": AIR_REGULATIONS,
  "air-navigation": AIR_NAVIGATION,
  "meteorology": METEOROLOGY,
  "instrumentation": INSTRUMENTATION,
};

/** The study guide for a CPL chapter's video page, or null if none is written yet. */
export function getVideoStudy(subjectId: string, chapterId: string): VideoStudy | null {
  return BY_SUBJECT[subjectId]?.[chapterId] ?? null;
}

/** Every written guide, for tests and audits. */
export function allVideoStudies(): { subjectId: string; chapterId: string; study: VideoStudy }[] {
  return Object.entries(BY_SUBJECT).flatMap(([subjectId, map]) =>
    Object.entries(map).map(([chapterId, study]) => ({ subjectId, chapterId, study })));
}
