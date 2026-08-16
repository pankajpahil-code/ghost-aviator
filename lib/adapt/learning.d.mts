export const MIN_SITTINGS: number;
export const IMPROVING: number;

export type LearningDirection = "improving" | "slipping" | "flat";

export interface Learning {
  sittings: number;
  first: number | null;
  latest: number | null;
  best: number | null;
  slope: number | null;
  gained: number | null;
  direction: LearningDirection | null;
  readable: boolean;
  sittingsNeeded: number;
}

export interface PairedImprovement {
  first: number;
  second: number;
  delta: number;
  atCeiling: boolean;
}

export function slope(scores: (number | null | undefined)[]): number | null;
export function pairedImprovement(first: number | null, second: number | null): PairedImprovement | null;
export function learningFor(scores: (number | null | undefined)[]): Learning;
export function learningNote(learning: Learning | null): string | null;

/** Learning curves kept separate per difficulty — pooling them draws a lie. */
export declare function learningByDifficulty(
  attempts: { score: number; difficulty?: string | null }[],
  fallback?: string
): Record<string, Learning>;
/** The setting with the most sittings behind it, or null. */
export declare function mostPractised(byDifficulty: Record<string, Learning>): string | null;
