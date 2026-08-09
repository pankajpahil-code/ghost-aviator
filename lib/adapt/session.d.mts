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

import type { DividedRun, DividedScore, DividedResponse, StreamName } from "./divided-attention.mjs";
import type { Scenario, PersonalityResponse, AttitudeProfile } from "./personality.mjs";

export type ModuleKind = "knowledge" | "psychomotor" | "divided-attention" | "behavioural";

export interface TrackingRun {
  seed: number;
  durationSec: number;
  sampleHz: number;
}

/**
 * A module is either a paper (`items`) or a timed run (`run`), never both.
 * Branch on `kind`, never on which field happens to be present.
 */
export interface AdaptModule {
  id: string;
  name: string;
  kind: ModuleKind;
  blurb: string;
  timeLimitSec: number;
  items?: AdaptItem[];
  run?: TrackingRun | DividedRun;
  /** Present only on the behavioural module. */
  scenarios?: Scenario[];
}

export interface AdaptModuleDef {
  id: string;
  name: string;
  kind: ModuleKind;
  blurb: string;
  itemCount?: number;
  durationSec?: number;
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
  /** Discriminant: lets a mixed result list be narrowed safely. */
  kind: "knowledge";
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

export interface TrackingResult {
  moduleId: string;
  moduleName: string;
  kind: "psychomotor";
  rmse: number | null;
  baseline: number | null;
  worstError: number | null;
  /** Share of the disturbance the student cancelled, 0-100. */
  cancellation: number | null;
  sampleCount: number;
  /** Never pool scores across input classes — see tracking.mjs. */
  inputClass: string;
  durationSec: number;
  stanine: number;
  band: Band;
  basis: "criterion" | "observed";
  cuts: number[];
  rationale: string | null;
  anomalies: { code: string; detail: string }[];
}

export interface DividedAttentionResult {
  moduleId: string;
  moduleName: string;
  kind: "divided-attention";
  durationSec: number;
  detail: DividedScore | null;
  composite: number;
  /** The stream to train first; null when nothing stood out. */
  weakest: StreamName | null;
  stanine: number;
  band: Band;
  basis: "criterion" | "observed";
  cuts: number[];
  rationale: string | null;
  anomalies: { code: string; detail: string }[];
}

export interface PersonalityResult {
  moduleId: string;
  moduleName: string;
  kind: "behavioural";
  profile: AttitudeProfile;
  /** Always null. This module is not an aptitude score and never becomes one. */
  stanine: null;
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
export declare function scoreTracking(
  module: AdaptModule,
  raw: { rmse: number | null; sampleCount?: number; inputClass?: string; worstError?: number | null }
): TrackingResult;
export declare function scoreDividedAttention(
  module: AdaptModule,
  responses?: DividedResponse[]
): DividedAttentionResult;
export declare function scorePersonality(
  module: AdaptModule,
  responses?: PersonalityResponse[]
): PersonalityResult;
export declare function scoreSession(
  moduleResults: (ModuleResult | TrackingResult | DividedAttentionResult | PersonalityResult)[]
): CompositeResult | null;
