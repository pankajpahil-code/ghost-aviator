"use client";

// ADAPT — attempt history, the storage half. The reasoning lives in
// history-core.mjs; this is localStorage and a hook.
//
// LOCAL ONLY, on purpose. Progress a student can see belongs on their device
// and nowhere else — the anonymous counts the Captain asked for travel
// separately through telemetry.ts, carrying stanines and nothing that could be
// tied back to a person. Mirroring this history to a server would turn a
// private record of how someone is doing into an account of it.

import { useEffect, useState } from "react";
import { addAttempt, summariseSession } from "@/lib/adapt/history-core.mjs";
import type { Attempt } from "@/lib/adapt/history-core.mjs";

const KEY = "ga-adapt-history-v1";
export const ADAPT_HISTORY_EVENT = "ga-adapt-history-change";

export function readHistory(): Attempt[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? (raw as Attempt[]) : [];
  } catch {
    return [];
  }
}

/** Record a finished session. Returns the new list, or [] if storage is unavailable. */
export function recordSession(seed: number, results: unknown[]): Attempt[] {
  if (typeof window === "undefined") return [];
  try {
    const attempt = summariseSession(seed, results, new Date().toISOString());
    const next = addAttempt(readHistory(), attempt);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(ADAPT_HISTORY_EVENT));
    return next;
  } catch {
    // A full or disabled localStorage must not cost the student their debrief.
    return readHistory();
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(ADAPT_HISTORY_EVENT));
  } catch {
    /* nothing to do */
  }
}

/**
 * History for the current device.
 *
 * Starts empty and fills in after mount rather than reading localStorage during
 * render — the server has no localStorage, and a first paint that disagrees
 * with the client is a hydration mismatch.
 */
export function useAdaptHistory(): Attempt[] {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  useEffect(() => {
    const sync = () => setAttempts(readHistory());
    sync();
    window.addEventListener(ADAPT_HISTORY_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ADAPT_HISTORY_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return attempts;
}
