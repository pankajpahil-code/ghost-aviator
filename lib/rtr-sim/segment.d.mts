// Types for lib/rtr-sim/segment.mjs — the shared VoiceBank segmenter.

export interface Segment {
  type: "atom" | "phrase";
  key: string;
  text: string;
}

export interface Fragment {
  id: string;
  type: "atom" | "phrase";
  text: string;
}

export declare function fragmentId(seg: { type: string; key: string }): string;
export declare function segmentLine(text: string): Segment[];
export declare function collectFragments(lines: string[]): Map<string, Fragment>;
