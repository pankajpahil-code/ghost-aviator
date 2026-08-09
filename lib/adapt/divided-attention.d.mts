// Types for lib/adapt/divided-attention.mjs

export interface RedWindow { start: number; end: number }
export interface RadioCall { id: string; t: number; mine: boolean }
export interface Interruption {
  id: string;
  t: number;
  stem: string;
  options: string[];
  answerIndex: number;
  answer: number;
}

export interface DividedRun {
  seed: number;
  /** The seed the gauge actually settled on — draw from THIS, not from `seed`. */
  gaugeSeed: number;
  durationSec: number;
  monitor: RedWindow[];
  radio: RadioCall[];
  arithmetic: Interruption[];
}

export type StreamName = "monitor" | "radio" | "arithmetic";

export type DividedResponse =
  | { stream: "monitor"; t: number }
  | { stream: "radio"; t: number }
  | { stream: "arithmetic"; id: string; chosen: number | null };

export interface DividedScore {
  monitor: { hits: number; total: number; misses: number; falseAlarms: number; accuracy: number | null };
  radio: { hits: number; total: number; othersOnFrequency: number; wrongKeys: number; accuracy: number | null };
  arithmetic: { correct: number; total: number; unanswered: number; accuracy: number | null };
  mean: number;
  spread: number;
  fixationPenalty: number;
  composite: number;
  weakest: StreamName | null;
}

export declare const STREAMS: StreamName[];
export declare const WINDOW_SEC: { radio: number; arithmetic: number };
export declare const FIXATION_WEIGHT: number;
export declare const MIN_EXCURSIONS: number;
export declare const GAUGE: { min: number; max: number; redline: number };
export declare function makeGauge(seed: number): { at(t: number): number };
export declare function redWindows(seed: number, durationSec: number, step?: number): RedWindow[];
export declare function buildRun(seed: number, durationSec?: number): DividedRun;
export declare function scoreRun(run: DividedRun, responses?: DividedResponse[]): DividedScore | null;
export declare const DIVIDED_NORM: {
  mode: "criterion";
  direction: "higher-better";
  cuts: number[];
  rationale: string;
};
