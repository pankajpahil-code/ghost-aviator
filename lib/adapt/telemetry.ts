"use client";

// ADAPT — anonymous attempt telemetry.
//
// Capt. Pahil's decision, 2026-08-09: collect results so we can see how many
// students use this, how often, and how they actually score. Two things follow
// from that decision, and both are binding.
//
// ── 1. What is sent, and what is never sent ────────────────────────────────
//
// Sent: one row per module attempted — which module, its stanine, a single
// headline percentage, and for the tracking task the input device (because
// scores must never be pooled across a phone screen and a joystick).
//
// NEVER sent, and there is no code path that could:
//   * the questions or the student's answers;
//   * tracking samples or reaction times;
//   * anything at all from the attitudes questionnaire beyond the bare fact
//     that it was completed. No attitude, no tally, no profile. That is the
//     most sensitive thing this feature touches and a good share of these
//     students are under 18.
//
// ── 2. Why this is worth having ───────────────────────────────────────────
//
// Every stanine on this site is currently CRITERION-scored, because there is no
// normative population to score against and inventing one would be a lie. These
// rows are how that population comes to exist. At 500 attempts per module the
// criterion ladder can be replaced by measured norms — see stanine.mjs, which
// already takes either.
//
// Fails soft in every direction: no Supabase, no network, no table, no problem.
// A student's practice must never break because analytics did.

import { getSupabase, SUPABASE_ENABLED } from "@/lib/supabase";
import { buildRows } from "@/lib/adapt/telemetry-core.mjs";

const DEVICE_KEY = "ga-adapt-device-v1";
const OPT_OUT_KEY = "ga-adapt-no-telemetry";

/**
 * A random per-device id, so "how many students" can be answered without
 * knowing who any of them are. Not derived from anything about the person, and
 * cleared whenever they clear site data.
 */
function deviceId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch {
    return null; // private mode, storage disabled — collect nothing rather than fail
  }
}

/** Students can turn this off; the results page says so and offers the switch. */
export function telemetryEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(OPT_OUT_KEY) !== "1";
  } catch {
    return false;
  }
}

export const TELEMETRY_EVENT = "ga-adapt-telemetry-change";

export function setTelemetryEnabled(on: boolean): void {
  try {
    if (on) localStorage.removeItem(OPT_OUT_KEY);
    else localStorage.setItem(OPT_OUT_KEY, "1");
    window.dispatchEvent(new Event(TELEMETRY_EVENT));
  } catch {
    /* nothing we can do, and nothing that should break the page */
  }
}

/**
 * Subscribe/snapshot pair for `useSyncExternalStore`.
 *
 * localStorage is an external store, so reading it with an effect that calls
 * setState is the wrong shape — it cascades an extra render on every mount.
 * This is the mechanism React provides for exactly this, and it also gives a
 * stable server snapshot so hydration cannot mismatch.
 */
export function subscribeTelemetry(cb: () => void): () => void {
  window.addEventListener(TELEMETRY_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(TELEMETRY_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** On the server there is no opt-out to read; assume on, and let the client correct it. */
export const telemetryServerSnapshot = () => true;

export type AnyResult = {
  moduleId?: string;
  kind?: string;
  stanine?: number | null;
  correct?: number;
  total?: number;
  cancellation?: number | null;
  composite?: number;
  inputClass?: string;
  profile?: { complete?: boolean };
};

/** Fire and forget. Never throws, never blocks the debrief. */
export async function recordAttempt(seed: number, results: AnyResult[]): Promise<void> {
  try {
    if (!SUPABASE_ENABLED || !telemetryEnabled()) return;
    const device = deviceId();
    if (!device) return;
    const rows = buildRows(seed, results, device);
    if (rows.length === 0) return;
    await getSupabase()?.from("adapt_attempts").insert(rows);
  } catch {
    /* analytics must never break a student's practice */
  }
}
