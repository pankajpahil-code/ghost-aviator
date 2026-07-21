// Types for lib/rtr-sim/transcript.mjs

export interface SRResultLike {
  0: { transcript: string };
  isFinal?: boolean;
}

export declare function newFinalSegments(
  results: ArrayLike<SRResultLike> | null | undefined,
  resultIndex?: number,
): string[];

export declare function joinTranscript(segments: string[]): string;
