// Types for lib/rtr-sim/engine.mjs — the RTR simulator scoring engine.

export type SlotStatus = "ok" | "wrong" | "missing";
export type CallsignStatus = "ok-end" | "ok" | "missing";

export interface ValueSlot {
  key: string;
  critical?: boolean;
  /** Canonical value after normalization, e.g. "1013", "27", "fl" values like "100". */
  value: string | number;
  /** Phrase spoken before the value, e.g. "qnh", "squawk", "hold short of runway". */
  anchor?: string;
  /** Tokens searched after the anchor for the value (default 4). */
  window?: number;
}

export interface PhraseSlot {
  key: string;
  critical?: boolean;
  /** Accepted variants; any one satisfies the slot. */
  phrases: string[];
}

export type Slot = ValueSlot | PhraseSlot;

export interface ExpectedTransmission {
  slots?: Slot[];
  /** Written or spoken form; both normalize identically. */
  callsign?: string;
  /** Phrases that are flagged and taught in debrief, e.g. "over and out". */
  forbidden?: string[];
}

export interface ScoreWeights {
  criticalOk: number;
  minorOk: number;
  callsignOk: number;
  callsignMisplacedPenalty: number;
}

export interface SlotResult {
  key: string;
  critical: boolean;
  status: SlotStatus;
}

export interface TransmissionResult {
  norm: string[];
  slots: SlotResult[];
  callsign: CallsignStatus | null;
  forbidden: string[];
  points: number;
  maxPoints: number;
  wrongCritical: string[];
  missingCritical: string[];
}

export interface ScenarioResult {
  points: number;
  maxPoints: number;
  percent: number;
  /** DGCA RTR(A) Part 2 pass mark: 50%. */
  pass: boolean;
}

export declare const DEFAULT_WEIGHTS: ScoreWeights;
export declare function tokenize(text: string): string[];
export declare function normalize(text: string): string[];
export declare function containsPhrase(normTokens: string[], phrase: string): boolean;
export declare function matchSlot(normTokens: string[], slot: Slot): SlotStatus;
export declare function matchCallsign(normTokens: string[], callsign: string): CallsignStatus;
export declare function scoreTransmission(
  expect: ExpectedTransmission,
  utterance: string,
  weights?: ScoreWeights
): TransmissionResult;
export declare function scoreScenario(results: TransmissionResult[]): ScenarioResult;

/**
 * Score several candidate readings of ONE transmission and return the best.
 * Used so a student is never failed for the speech recognizer's mistake — the
 * correct reading of Indian-accented R/T is often not the top hypothesis.
 * The winning candidate is used whole, its own forbidden-phrase list included.
 */
export declare function scoreBestOf(
  expect: ExpectedTransmission,
  utterances: ReadonlyArray<string | null | undefined>,
  weights?: ScoreWeights
): TransmissionResult & { chosenText: string; candidatesTried: number };
