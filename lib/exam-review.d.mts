// Types for lib/exam-review.mjs

/** One question in a saved answer trace, in sitting order. */
export interface ReviewEntry {
  /** Normalised-stem key of the question that was served (stemKey, lib/questions.ts). */
  k: string;
  /** Chosen option index in the sitting (options are never shuffled), or null when left blank. */
  a: number | null;
  /** Present (and true) only when the student flagged the question. */
  f?: boolean;
}

/** A trace entry after matching against the live bank. */
export interface ReviewedItem<Q> {
  /** Position in the sitting, 0-based. */
  index: number;
  /** The live question this entry resolved to, or null when it left the bank. */
  question: Q | null;
  chosen: number | null;
  flagged: boolean;
  missing: boolean;
}

export interface ReviewStats {
  total: number;
  correct: number;
  wrong: number;
  unanswered: number;
  flagged: number;
  missing: number;
  scorePct: number;
}

export type ReviewFilter = "all" | "wrong" | "unanswered" | "flagged";

export declare function normaliseChosen(value: unknown): number | null;
export declare function matchReviewEntries<Q>(
  byKey: ReadonlyMap<string, Q>,
  review: unknown,
): ReviewedItem<Q>[];
export declare function filterReviewItems<Q>(
  items: ReviewedItem<Q>[],
  filter: ReviewFilter,
): ReviewedItem<Q>[];
export declare function reviewStats<Q>(items: ReviewedItem<Q>[]): ReviewStats;
