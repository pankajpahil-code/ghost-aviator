// Types for lib/adapt/personality.mjs — Attitudes & Airmanship.

export type AttitudeKey = "anti-authority" | "impulsivity" | "invulnerability" | "macho" | "resignation";

export interface Attitude {
  key: AttitudeKey;
  name: string;
  reads: string;
  meaning: string;
  /** The published antidote, reproduced verbatim — it is meant to be memorised. */
  antidote: string;
  coaching: string;
}

export interface Scenario {
  id: string;
  situation: string;
  options: Record<AttitudeKey, string>;
  /** Scenarios written to probe the same ground twice, for the consistency check. */
  pairOf?: string;
}

export interface PersonalityResponse {
  id: string;
  most: string | null;
  least: string | null;
}

export interface AttitudeProfile {
  answered: number;
  total: number;
  complete: boolean;
  tally: Record<AttitudeKey, { most: number; least: number; net: number }>;
  ranked?: { key: AttitudeKey; most: number; least: number; net: number }[];
  /** Null unless one attitude genuinely outranked the next. */
  dominant: Attitude | null;
  pairsChecked: number;
  /** Share of paired scenarios answered congruently; null if none were reached. */
  consistency: number | null;
}

export declare const ATTITUDES: Record<AttitudeKey, Attitude>;
export declare const ATTITUDE_KEYS: AttitudeKey[];
export declare const SCENARIOS: Scenario[];
export declare const PAIRS: number;
export declare function scoreProfile(responses?: PersonalityResponse[]): AttitudeProfile;
