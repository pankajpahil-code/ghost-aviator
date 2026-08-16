// Types for lib/adapt/divided-attention.mjs

export interface RedWindow { start: number; end: number }

export type ClearanceKind = "heading" | "altitude" | "speed" | "waypoint";

/** A datum ATC assigns you mid-run and asks you for again in the debrief. */
export interface Clearance {
  kind: ClearanceKind;
  value: number | string;
  /** Rendered exactly as the student saw it, and exactly as an option is printed. */
  text: string;
  /** Which heading/altitude/speed/waypoint this was, 1-based. */
  ordinal: number;
}

export interface RadioCall {
  id: string;
  t: number;
  mine: boolean;
  phase: PhaseKey;
  window: number;
  /** Null on another aircraft's call — you do not copy someone else's clearance. */
  clearance: Clearance | null;
}

export type SightingType = "traffic" | "landmark";

export interface Sighting {
  id: string;
  t: number;
  type: SightingType;
  phase: PhaseKey;
  /** Seconds it stays in view. Tightens with the phases and the difficulty. */
  visible: number;
  /** Position across the outside view, 0-1. */
  x: number;
  y: number;
}

export interface SightingTypeScore {
  total: number;
  correct: number;
  missed: number;
  accuracy: number | null;
}

export interface SightingScore {
  total: number;
  correct: number;
  missed: number;
  /** Reported, but as the wrong type — calling traffic a landmark. */
  misidentified: number;
  /** Reported with nothing in view at all. */
  falseReports: number;
  byType: Record<SightingType, SightingTypeScore>;
  accuracy: number;
}

export interface RecallQuestion {
  id: string;
  kind: string;
  stem: string;
  options: string[];
  answerIndex: number;
}

export interface LatencyReport {
  /** Median seconds from the event appearing to a correct response. */
  medianSec: number;
  /** Median share (0-1) of the window that was available at the time. */
  medianWindowUsed: number;
  n: number;
}

export interface RecallScore {
  correct: number;
  total: number;
  unanswered: number;
  accuracy: number;
}

export type InterruptionFamily = "sum" | "heading" | "series" | "odd" | "spelling";

export interface Interruption {
  id: string;
  /** Which kind of item this is — the slot fires five, not just arithmetic. */
  family: InterruptionFamily;
  t: number;
  phase: PhaseKey;
  /** The response window this item was actually SHOWN with — it tightens as the run escalates. */
  window: number;
  /** Complete, question mark and all — the component renders it verbatim. */
  stem: string;
  options: string[];
  answerIndex: number;
  /** The correct value; a number for numeric families, the word for verbal ones. */
  answer: number | string;
}

export interface DividedRun {
  seed: number;
  /** Event-density multiplier from the difficulty setting. 1 at Standard. */
  loadScale: number;
  /** The seed the gauge actually settled on — draw from THIS, not from `seed`. */
  gaugeSeed: number;
  durationSec: number;
  monitor: RedWindow[];
  radio: RadioCall[];
  arithmetic: Interruption[];
  /** The lookout: targets that appear in the outside view and must be called. */
  sightings: Sighting[];
  /** The debrief, built from the finished schedule. Empty on a run too short to ask anything. */
  recall: RecallQuestion[];
  phases: PhaseWindow[];
  /** Seed for the continuous stream — its own, so it never drifts in lockstep with the gauge. */
  trackingSeed: number;
  tracking: { seed: number; sampleHz: number; gain: Record<string, number> };
}

export type PhaseKey = "settling" | "building" | "saturated";

export interface Phase {
  key: PhaseKey;
  label: string;
  /** Multiplier on the gap between events — below 1 means they arrive faster. */
  gapScale: number;
  /** Multiplier on the time allowed to respond — below 1 means less time. */
  windowScale: number;
}

export interface PhaseWindow extends Phase {
  index: number;
  start: number;
  end: number;
}

export interface PhaseScore extends PhaseWindow {
  accuracies: Record<StreamName, number | null>;
  /** Null when the phase contained no scorable events at all. */
  composite: number | null;
  weakest: StreamName | null;
}

export type StreamName = "tracking" | "monitor" | "radio" | "arithmetic";

export type DividedResponse =
  | { stream: "tracking"; rmse: number; samples?: number; inputClass?: string }
  | { stream: "monitor"; t: number }
  | { stream: "radio"; t: number }
  | { stream: "arithmetic"; id: string; chosen: number | null; t?: number }
  | { stream: "recall"; id: string; chosen: number | null }
  | { stream: "sighting"; t: number; type: SightingType };

export interface DividedScore {
  monitor: { hits: number; total: number; misses: number; falseAlarms: number; accuracy: number | null };
  radio: { hits: number; total: number; othersOnFrequency: number; wrongKeys: number; accuracy: number | null };
  arithmetic: { correct: number; total: number; unanswered: number; accuracy: number | null };
  /**
   * The debrief. Null when the run asked nothing — which is not a zero.
   * Reported BESIDE the composite and deliberately not inside it.
   */
  /** The lookout. Null when the run scheduled no targets — which is not a zero. */
  sightings: SightingScore | null;
  recall: RecallScore | null;
  /** Median latency of CORRECT responses, per stream. Null where nothing was timed. */
  responseTime: {
    radio: LatencyReport | null;
    interruptions: LatencyReport | null;
  };
  mean: number;
  spread: number;
  fixationPenalty: number;
  composite: number;
  weakest: StreamName | null;
  phases: PhaseScore[];
  /** The phase where performance stepped down, or null if it never did. */
  collapsePhase: PhaseKey | null;
  /** Null when the continuous stream was never flown — never a zero. */
  tracking: {
    rmse: number;
    baseline: number;
    cancellation: number;
    samples: number | null;
    inputClass: string | null;
    incomplete: boolean | null;
  } | null;
}

export declare const STREAMS: StreamName[];
export declare const WINDOW_SEC: { radio: number; arithmetic: number };
/** Extra seconds a clearance strip stays up after its response window. Display-only. */
export declare const CLEARANCE_SHOW_EXTRA_SEC: number;
export declare const FIXATION_WEIGHT: number;
export declare const MIN_EXCURSIONS: number;
export declare const TRACKING_GAIN: Record<string, number>;
/** Disturbance multiplier at time t — used by BOTH the component and the scorer. */
export declare function trackingGainAt(t: number, durationSec: number): number;
/** Do-nothing baseline for the gained disturbance. */
export declare function passiveRmseGained(seed: number, durationSec: number, sampleHz?: number): number | null;
export declare const PHASES: Phase[];
export declare const COLLAPSE_DROP: number;
export declare function phaseIndexAt(t: number, durationSec: number): number;
export declare function phaseWindows(durationSec: number): PhaseWindow[];
export declare const GAUGE: { min: number; max: number; redline: number };
export declare function makeGauge(seed: number): { at(t: number): number };
export declare function redWindows(seed: number, durationSec: number, step?: number): RedWindow[];
export declare const WAYPOINTS: string[];
export declare const CLEARANCE_KINDS: ClearanceKind[];
export declare const RECALL_COUNT: number;
export declare const SIGHTING_TYPES: SightingType[];
export declare const SIGHTING_VISIBLE_SEC: number;
/** Score the lookout. Null when there were no targets. */
export declare function scoreSightings(
  sightings: Sighting[],
  reports?: { t: number; type: SightingType }[]
): SightingScore | null;
/** Exported so the invariants that make these families correct can be tested. */
export declare const ODD_SETS: { same: string[]; odd: string[] }[];
export declare const SPELLINGS: { correct: string; wrong: string[] }[];
export declare const INTERRUPTION_FAMILIES: Record<InterruptionFamily, { numeric: boolean; label: string }>;
/** Middle value of a list. Null when empty — never a zero. */
export declare function median(values: number[]): number | null;
export declare function clearanceText(kind: ClearanceKind, value: number | string): string;
/** The debrief for a finished run. Deterministic from the run's seed. */
export declare function buildRecall(run: DividedRun, count?: number): RecallQuestion[];
/** Mark the debrief. Null when there were no questions; a blank is wrong, never negative. */
export declare function scoreRecall(
  items: RecallQuestion[],
  answers?: { id: string; chosen: number | null }[]
): RecallScore | null;
export declare function buildRun(seed: number, durationSec?: number, loadScale?: number): DividedRun;
export declare function scoreRun(run: DividedRun, responses?: DividedResponse[]): DividedScore | null;
export declare const DIVIDED_NORM: {
  mode: "criterion";
  direction: "higher-better";
  cuts: number[];
  rationale: string;
};
