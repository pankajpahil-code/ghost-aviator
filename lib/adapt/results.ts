"use client";

// ADAPT — saving a signed-in student's results to their own account.
//
// Capt. Pahil's decision, 2026-08-10: ask students to sign up free, save their
// results, and use the data to improve the simulator. Schema, RLS and the
// queries that make the data useful are in SECURITY.md §3e.
//
// ── How this differs from telemetry.ts ────────────────────────────────────
//
// telemetry.ts writes an ANONYMOUS score line keyed to a random device id, and
// it keeps working for a student who never signs in. This module writes the
// student's OWN history, keyed to their account, which they can read back on
// their dashboard and which survives losing a phone. Both run; neither replaces
// the other.
//
// ── Two rules that are not negotiable ─────────────────────────────────────
//
// 1. What may be sent is decided in results-core.mjs and enforced by its tests.
//    This file adds a second, independent check before the insert: a row that
//    somehow acquired a forbidden field is DROPPED rather than sent. A
//    guarantee that lives only in a test holds only in the test.
//
// 2. Saving must never break practice. No Supabase, no account, no table, no
//    network — the student still gets their result. Everything here fails soft
//    and reports whether it saved, so the result page can say so honestly
//    rather than implying a save that did not happen.

import { getSupabase, SUPABASE_ENABLED } from "@/lib/supabase";
import { buildResultRows, findForbidden } from "@/lib/adapt/results-core.mjs";
import type { AnyResult } from "@/lib/adapt/telemetry";

const TABLE = "adapt_results";

export type SaveOutcome =
  | { status: "saved"; rows: number }
  | { status: "signed-out" }
  | { status: "unavailable" }
  /** The table does not exist yet. Expected, temporary, and not the student's fault. */
  | { status: "not-ready" }
  | { status: "failed"; reason: string };

/**
 * Is this error "the table has not been created yet" rather than a real failure?
 *
 * This matters because the code and the table ship separately: the site deploys
 * from a git push, the table is created by hand in Supabase, and whichever
 * happens second leaves a window in between. Without this check, that window
 * shows every signed-in student an alarming apology quoting a Postgres
 * schema-cache message — for a condition that is entirely ours, entirely
 * temporary, and nothing to do with them or their result.
 *
 * PostgREST reports it differently across versions, so both the Postgres code
 * for an undefined table and PostgREST's own schema-cache message are matched.
 */
function tableMissing(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "42P01" || error.code === "PGRST205") return true;
  return /does not exist|schema cache|could not find the table/i.test(error.message ?? "");
}

/**
 * Save one finished session to the signed-in student's account.
 *
 * Returns what actually happened rather than a boolean, because the result page
 * says different things for "not signed in" (an invitation) and "could not
 * save" (an apology), and collapsing them would make one of the two a lie.
 */
export async function saveResults(seed: number, results: AnyResult[], userId: string | null): Promise<SaveOutcome> {
  try {
    if (!SUPABASE_ENABLED) return { status: "unavailable" };
    if (!userId) return { status: "signed-out" };

    const rows = buildResultRows(seed, results, userId);
    if (rows.length === 0) return { status: "failed", reason: "nothing to save" };

    // Defence in depth. results-core decides what may leave the device; this
    // refuses to be the thing that sends it if that decision is ever broken.
    const leak = findForbidden(rows);
    if (leak) {
      // Deliberately not sent, and deliberately loud in development — a silent
      // drop here would hide a real regression in what we promise students.
      console.error(`[adapt] refusing to save: forbidden field at ${leak}`);
      return { status: "failed", reason: "blocked by the privacy guard" };
    }

    const { error } = await getSupabase()!.from(TABLE).insert(rows);
    if (tableMissing(error)) return { status: "not-ready" };
    if (error) return { status: "failed", reason: error.message };
    return { status: "saved", rows: rows.length };
  } catch (e) {
    return { status: "failed", reason: e instanceof Error ? e.message : "unknown error" };
  }
}

export type SavedRow = {
  module_id: string;
  module_kind: string;
  stanine: number | null;
  sten: number | null;
  band: string | null;
  headline_pct: number | null;
  input_class: string | null;
  created_at: string;
};

/**
 * The student's own saved results, oldest first.
 *
 * Oldest first because everything that consumes this — the learning slope, the
 * sparkline — reads a series in time order, and reversing it at three call
 * sites is three chances to reverse it at only two.
 *
 * RLS restricts this to the caller's own rows; there is no policy under which
 * it could return anyone else's, and none should ever be added.
 */
export async function loadResults(userId: string | null, limit = 400): Promise<SavedRow[]> {
  try {
    if (!SUPABASE_ENABLED || !userId) return [];
    const { data, error } = await getSupabase()!
      .from(TABLE)
      .select("module_id, module_kind, stanine, sten, band, headline_pct, input_class, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(limit);
    if (error || !data) return [];
    return data as SavedRow[];
  } catch {
    return [];
  }
}

/**
 * Stanines for one module, oldest first — the series `learningFor` expects.
 *
 * Tracking runs are split by input device. A student who practised on a phone
 * and then bought a joystick has two different skills in one list, and a slope
 * drawn through both would be measuring the purchase rather than the practice.
 */
export function seriesFor(rows: SavedRow[], moduleId: string, inputClass?: string | null): number[] {
  return rows
    .filter((r) => r.module_id === moduleId)
    .filter((r) => (inputClass ? r.input_class === inputClass : true))
    .map((r) => r.stanine)
    .filter((s): s is number => Number.isInteger(s));
}
