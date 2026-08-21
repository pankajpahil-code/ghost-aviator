/**
 * WHAT GINI REMEMBERS ABOUT YOU, WHICH IS ALMOST NOTHING.
 *
 * Three numbers, in the browser, never sent anywhere: how many times you have
 * visited, whether he has already greeted you in this tab, and which of the
 * Captain's offers he has already mentioned this session so he cannot repeat
 * one at you.
 *
 * Deliberately localStorage/sessionStorage and not a cookie or an account:
 * nothing here is worth a server round trip, and a mascot has no business
 * creating a user record. Every accessor is wrapped, because private mode
 * throws on access rather than returning null.
 */

import type { PitchState } from "./marketing";

const VISITS_KEY = "ga:gini:visits";
const GREETED_KEY = "ga:gini:greeted";      // per tab
const PITCH_KEY = "ga:gini:pitched";        // per tab
const START_KEY = "ga:gini:started";        // per tab

const readLocal = (k: string) => {
  try { return localStorage.getItem(k); } catch { return null; }
};
const writeLocal = (k: string, v: string) => {
  try { localStorage.setItem(k, v); } catch { /* private mode */ }
};
const readSession = (k: string) => {
  try { return sessionStorage.getItem(k); } catch { return null; }
};
const writeSession = (k: string, v: string) => {
  try { sessionStorage.setItem(k, v); } catch { /* private mode */ }
};

/** Bump and return the visit count. First ever visit returns 1. */
export function countVisit(): number {
  const n = Number(readLocal(VISITS_KEY) ?? 0) + 1;
  writeLocal(VISITS_KEY, String(n));
  return n;
}

/** Has he already said hello in this tab? Greeting is per session, not per page. */
export const hasGreeted = () => readSession(GREETED_KEY) === "1";
export const markGreeted = () => writeSession(GREETED_KEY, "1");

/**
 * When this tab's session began — the warm-up before the first offer is
 * measured from here, so navigating between pages does not reset the clock and
 * hand a student a pitch on every page load.
 */
export function sessionStart(now: number): number {
  const stored = Number(readSession(START_KEY) ?? 0);
  if (stored > 0) return stored;
  writeSession(START_KEY, String(now));
  return now;
}

export function readPitchState(now: number): PitchState {
  const raw = readSession(PITCH_KEY);
  const startedAt = sessionStart(now);
  if (!raw) return { shown: [], lastAt: 0, startedAt };
  try {
    const parsed = JSON.parse(raw) as Partial<PitchState>;
    return {
      shown: Array.isArray(parsed.shown) ? parsed.shown.filter(x => typeof x === "string") : [],
      lastAt: typeof parsed.lastAt === "number" ? parsed.lastAt : 0,
      startedAt,
    };
  } catch {
    return { shown: [], lastAt: 0, startedAt };
  }
}

export function recordPitch(state: PitchState, id: string, now: number): PitchState {
  const next: PitchState = { shown: [...state.shown, id], lastAt: now, startedAt: state.startedAt };
  writeSession(PITCH_KEY, JSON.stringify({ shown: next.shown, lastAt: next.lastAt }));
  return next;
}
