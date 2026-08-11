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
