export const FORBIDDEN_KEYS: string[];

export interface ResultRow {
  user_id: string;
  session_seed: number;
  module_id: string;
  module_kind: string;
  stanine: number | null;
  sten: number | null;
  band: string | null;
  headline_pct: number | null;
  detail: Record<string, unknown>;
  input_class: string | null;
  duration_sec: number | null;
  completed: boolean;
}

export function buildResultRows(seed: number | null, results: unknown[], userId: string | null): ResultRow[];

/** Path of the first field a saved row must never carry, or null when clean. */
export function findForbidden(value: unknown, path?: string): string | null;

/** True when an error means the table does not exist yet, rather than a real failure. */
export function tableMissing(error: { code?: string; message?: string } | null | undefined): boolean;
