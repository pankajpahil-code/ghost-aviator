// Types for lib/adapt/session.mjs — ADAPT session assembly and scoring.

export interface AdaptItem {
  id: string;
  family: string;
  stem: string;
  unit: string;
  options: string[];
  answerIndex: number;
  /** Per-option explanation of the error that produces it. null on the correct option. */
  optionNotes: (string | null)[];
  solution: string;
  meta: Record<string, number | string>;
  /**
   * Inline SVG for items that must be READ off an instrument rather than
   * computed from a sentence. Generated entirely by lib/adapt code from numeric
   * inputs — it never contains anything a user supplied.
   */
  figure?: string;
}

export interface AdaptModule {
  id: string;
  name: string;
  kind: "knowledge" | "aptitude" | "behavioural";
  blurb: string;
  timeLimitSec: number;
  items: AdaptItem[];
}

export interface AdaptModuleDef {
  id: string;
  name: string;
  kind: "knowledge" | "aptitude" | "behavioural";
  blurb: string;
  itemCount: number;
  timeLimitSec: number;
  weight: number;
}

export interface AdaptSession {
  seed: number;
  modules: AdaptModule[];
}

export interface Band {
  key: "low" | "average" | "high";
  range: [number, number];
  label: string;
  advice: string;
}

export interface ItemResult {
  family: string;
  stem: string;
  figure?: string;
  options: string[];
  chosen: number | null;
  answerIndex: number;
  correct: boolean;
  solution: string;
  /** Why the option the student actually picked is wrong. null if blank or correct. */
  errorNote: string | null;
}

export interface ModuleResult {
  moduleId: string;
  moduleName: string;
  correct: number;
  total: number;
  unanswered: number;
  percent: number;
  durationSec: number | null;
  overTime: boolean;
  stanine: number;
  band: Band;
  basis: "criterion" | "observed";
  /** The published raw-score cuts for stanines 2..9. */
  cuts: number[];
  rationale: string | null;
  byFamily: Record<string, { correct: number; total: number }>;
  perItem: ItemResult[];
  anomalies: { code: string; detail: string }[];
}

export interface CompositeResult {
  stanine: number;
  band: Band;
  z: number;
  basis: "observed" | "mixed";
  modules: number;
}

export declare const PERCENT_LADDER: number[];
export declare const MODULES: Record<string, AdaptModuleDef>;
export declare const MODULE_IDS: string[];
export declare function criterionNormFor(total: number): {
  mode: "criterion";
  direction: "higher-better";
  cuts: number[];
  rationale: string;
};
export declare function buildSession(seed: number, moduleIds?: string[]): AdaptSession;
export declare function scoreModule(
  module: AdaptModule,
  responses: (number | null)[],
  durationSec?: number | null
): ModuleResult;
export declare function scoreSession(moduleResults: ModuleResult[]): CompositeResult | null;
