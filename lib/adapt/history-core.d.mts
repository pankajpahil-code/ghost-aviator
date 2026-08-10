// Types for lib/adapt/history-core.mjs

export interface AttemptModule {
  id: string;
  name: string;
  kind: string;
  /** Absent on the behavioural module, which has no stanine by design. */
  stanine?: number;
  headline?: string;
  completed?: boolean;
}

export interface Attempt {
  id: string;
  seed: number;
  at: string;
  modules: AttemptModule[];
  /** Mean stanine across scored modules; null when nothing was scored. */
  mean: number | null;
}

export interface ModuleBest {
  id: string;
  name: string;
  best: number;
  latest: number;
  sittings: number;
}

export declare const MAX_ATTEMPTS: number;
export declare function summariseSession(seed: number, results: unknown[], at: string): Attempt;
export declare function addAttempt(attempts: Attempt[], attempt: Attempt, max?: number): Attempt[];
export declare function bestByModule(attempts: Attempt[]): Record<string, ModuleBest>;
export declare function trendFor(attempts: Attempt[], moduleId: string): number[];
export declare function movement(trend: number[]): "up" | "down" | "steady" | null;
