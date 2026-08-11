// Types for lib/adapt/tracking.mjs — the compensatory tracking task.

export interface Vec2 { x: number; y: number }

export interface Disturbance {
  /** Disturbance offset at time t seconds, each axis within ±0.8. */
  at(t: number): Vec2;
}

export interface Tracker {
  disturbance: Disturbance;
  at(t: number): Vec2;
  /**
   * Feed the current wall-clock time and control input. Samples are taken on a
   * fixed grid regardless of how often this is called, so the score does not
   * depend on the device's frame rate.
   */
  sample(nowSec: number, control: Vec2): void;
  readonly sampleCount: number;
  readonly worstError: number;
  /** Root-mean-square radial error; null before the first sample. */
  rmse(): number | null;
  /** RMSE per reporting segment, oldest first. Segments barely flown are omitted. */
  segmentRmse(): { index: number; rmse: number; samples: number }[];
}

export declare const SAMPLE_HZ: number;
export declare const SEGMENT_SEC: number;
export declare const MIN_SEGMENT_SHARE: number;
export declare function makeDisturbance(seed: number): Disturbance;
export declare function markerPosition(disturbanceAt: Vec2, control: Vec2): Vec2;
export declare function makeTracker(opts: { seed: number; sampleHz?: number; maxCatchUpSec?: number; segmentSec?: number }): Tracker;
export declare function evaluate(opts: {
  seed: number;
  durationSec: number;
  sampleHz?: number;
  controlAt?: (t: number, d: Vec2) => Vec2;
}): { rmse: number | null; samples: number };
export declare function passiveRmse(seed: number, durationSec: number, sampleHz?: number): number | null;
export declare function passiveSegmentRmse(
  seed: number,
  durationSec: number,
  sampleHz?: number,
  segmentSec?: number
): { index: number; rmse: number }[];
export declare function cancellationPercent(rmse: number | null, baseline: number | null): number | null;
export declare const CANCELLATION_NORM: {
  mode: "criterion";
  direction: "higher-better";
  cuts: number[];
  rationale: string;
};
export declare function inputClass(kind: string, gamepadId?: string): string;
export declare function inputLabel(cls: string): string;
