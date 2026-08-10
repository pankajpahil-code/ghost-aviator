// Types for lib/adapt/telemetry-core.mjs

export interface AttemptRow {
  device_id: string;
  session_seed: number;
  module_id: string;
  module_kind: string;
  stanine: number | null;
  headline_pct: number | null;
  input_class: string | null;
  completed: boolean;
}

export declare const ALLOWED_KEYS: string[];
export declare function buildRows(
  seed: number,
  results: unknown[] | null,
  device: string
): AttemptRow[];
