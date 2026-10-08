// Air Regulations: which SITE chapter(s) does a stored BANK chapterId belong to?
//
// An exam attempt files each answer under the question's own chapterId. For Air
// Regulations that is a BANK id from the old 13-chapter structure, while the site
// has 26 chapters, and CPL_AR_CHAPTER_MAP (lib/questions.ts) routes site -> bank
// many-to-one with no name correspondence (site ar-4 is served bank ar-6; bank
// ar-8 is NOT site ar-8). So the stored id has to be translated when it is READ
// for display. It is never rewritten when stored: an attempt saved before this
// file existed and one saved after it must mean the same thing.
//
// Nothing here copies the map. Each site chapter is asked which bank id its own
// question set carries (getChapterSpecificQuestions applies CPL_AR_CHAPTER_MAP,
// including the ar-14+ own-bank rule), and that is inverted. Where several site
// chapters draw on one bank chapter (bank ar-7 serves site ar-9 and ar-11) the
// answer is ALL of them, in syllabus order: picking one would be a guess.
//
// This file imports the question bank. It is meant for the dashboard, which
// already carries the bank through lib/exam-papers; do not import it from the
// quiz/test components (lib/progress.ts is the bank-free home for those).
import { getChapterSpecificQuestions } from "./questions";
import { CPL_SUBJECTS } from "./subjects";

export const AIR_REGS_SUBJECT_ID = "air-regulations";

/** Pure: site chapter id -> bank chapter id, in the order given. */
export type SiteToBank = ReadonlyArray<readonly [siteChapterId: string, bankChapterId: string]>;

/** Pure: the site chapters (syllabus order) whose question set carries `bankChapterId`. */
export function siteChaptersServedBy(bankChapterId: string, siteToBank: SiteToBank): string[] {
  return siteToBank.filter(([, bank]) => bank === bankChapterId).map(([site]) => site);
}

/**
 * Pure: the label for a stored chapterId.
 *  - Air Regulations: the label(s) of every site chapter that bank chapter feeds,
 *    joined with " / "; undefined when no site chapter draws on it (the caller
 *    must then show a neutral label, never the same-looking site id).
 *  - Any other subject: the stored id already is the site chapter id.
 * `labelOf` maps a SITE chapter id to its display label.
 */
export function labelForStoredChapter(
  subjectId: string,
  storedChapterId: string,
  labelOf: (siteChapterId: string) => string | undefined,
  siteToBank: SiteToBank,
): string | undefined {
  if (subjectId !== AIR_REGS_SUBJECT_ID) return labelOf(storedChapterId);
  const labels = siteChaptersServedBy(storedChapterId, siteToBank)
    .map(labelOf)
    .filter((l): l is string => !!l);
  return labels.length > 0 ? labels.join(" / ") : undefined;
}

let cached: SiteToBank | null = null;

/** The live site -> bank pairs for CPL Air Regulations, derived from the bank. */
export function airRegsSiteToBank(): SiteToBank {
  if (cached) return cached;
  const subject = CPL_SUBJECTS.find(s => s.id === AIR_REGS_SUBJECT_ID);
  const pairs: [string, string][] = [];
  for (const ch of subject?.chapters ?? []) {
    const bankId = getChapterSpecificQuestions(AIR_REGS_SUBJECT_ID, ch.id)[0]?.chapterId;
    if (bankId) pairs.push([ch.id, bankId]);
  }
  cached = pairs;
  return pairs;
}

/**
 * What the dashboard calls at READ time for each stored weak-chapter id.
 * `labelOf` maps a SITE chapter id to its display label (the dashboard's CHAPTER_LABEL).
 */
export function siteChapterLabelForBank(
  subjectId: string,
  storedChapterId: string,
  labelOf: (siteChapterId: string) => string | undefined,
): string | undefined {
  return labelForStoredChapter(subjectId, storedChapterId, labelOf, airRegsSiteToBank());
}

/** Pure: does this stored id look like an Air Regulations BANK chapter id ("ar-N", "sar")? */
export function looksLikeAirRegsBankId(storedChapterId: string): boolean {
  return /^ar-\d+$/.test(storedChapterId) || storedChapterId === "sar";
}

/**
 * Pure: label for a stored weak-chapter id when the subject is not known (the
 * exam-history breakdown is keyed by chapterId alone). Air Regulations bank ids
 * go through the inverse map; every other id is already a site chapter id.
 * An Air Regulations-looking id that no site chapter draws on returns undefined,
 * never the site chapter that merely shares its spelling.
 */
export function labelForStoredChapterId(
  storedChapterId: string,
  labelOf: (siteChapterId: string) => string | undefined,
  siteToBank: SiteToBank,
): string | undefined {
  if (looksLikeAirRegsBankId(storedChapterId)) {
    return labelForStoredChapter(AIR_REGS_SUBJECT_ID, storedChapterId, labelOf, siteToBank);
  }
  return labelOf(storedChapterId);
}

/** The one call the dashboard needs: `siteChapterLabelForStoredId(id, id => CHAPTER_LABEL[id])`. */
export function siteChapterLabelForStoredId(
  storedChapterId: string,
  labelOf: (siteChapterId: string) => string | undefined,
): string | undefined {
  return labelForStoredChapterId(storedChapterId, labelOf, airRegsSiteToBank());
}
