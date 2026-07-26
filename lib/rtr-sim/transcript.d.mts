// Types for lib/rtr-sim/transcript.mjs

export interface SRResultLike {
  0: { transcript: string };
  /** Present once maxAlternatives > 1 — indexable alternatives, best-first. */
  readonly [index: number]: { transcript: string } | undefined;
  length?: number;
  isFinal?: boolean;
}

export declare function newFinalSegments(
  results: ArrayLike<SRResultLike> | null | undefined,
  resultIndex?: number,
): string[];

export declare function joinTranscript(segments: string[]): string;

/**
 * New finalised segments WITH every alternative reading the recognizer offered,
 * best-first. One inner array per segment.
 */
export declare function newFinalAlternatives(
  results: ArrayLike<SRResultLike> | null | undefined,
  resultIndex?: number,
): string[][];

/**
 * Bounded, LINEAR set of transmission strings worth scoring: the all-best
 * reading first, then one variant per alternative. Never a cartesian product.
 */
export declare function candidateTranscripts(
  altsPerSegment: string[][] | null | undefined,
  cap?: number,
): string[];
