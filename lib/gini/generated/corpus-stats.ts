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
  total: 4326,
  speakable: 2522,
  bySubject: {
      "air-navigation": {
          "total": 958,
          "speakable": 264
      },
      "meteorology": {
          "total": 653,
          "speakable": 618
      },
      "air-regulations": {
          "total": 899,
          "speakable": 320
      },
      "technical-general": {
          "total": 184,
          "speakable": 184
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
          "total": 774,
          "speakable": 355
      },
      "instrumentation": {
          "total": 265,
          "speakable": 262
      },
      "radio-navigation": {
          "total": 446,
          "speakable": 397
      }
  } as Record<string, CorpusCount>,
} as const;

export const corpusFor = (subjectId: string): CorpusCount | undefined =>
  CORPUS.bySubject[subjectId];
