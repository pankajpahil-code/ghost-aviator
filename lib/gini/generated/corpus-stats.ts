/**
 * GENERATED — do not edit by hand.
 *   npx tsx tools/gini/build-corpus-stats.mts
 *
 * The only numbers Gini quotes about the size of the question bank. They live
 * here, pre-counted, so that putting a mascot on every page does not put the
 * whole question bank in every page's JavaScript bundle.
 *
 * These are claims, so they are checked: tools/audit/gini-selftest.mts
 * recomputes all of them from lib/questions.ts and fails on any drift.
 */

export type CorpusCount = { total: number; speakable: number };

export const CORPUS = {
  total: 4414,
  speakable: 3063,
  bySubject: {
      "air-navigation": {
          "total": 1020,
          "speakable": 910
      },
      "meteorology": {
          "total": 651,
          "speakable": 616
      },
      "air-regulations": {
          "total": 923,
          "speakable": 220
      },
      "technical-general": {
          "total": 183,
          "speakable": 183
      },
      "technical-specific": {
          "total": 145,
          "speakable": 120
      },
      "technical-performance": {
          "total": 2,
          "speakable": 2
      },
      "radio-telephony": {
          "total": 769,
          "speakable": 349
      },
      "instrumentation": {
          "total": 272,
          "speakable": 263
      },
      "radio-navigation": {
          "total": 447,
          "speakable": 398
      }
  } as Record<string, CorpusCount>,
} as const;

export const corpusFor = (subjectId: string): CorpusCount | undefined =>
  CORPUS.bySubject[subjectId];
