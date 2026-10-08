"use client";

// Lightweight client-side progress tracking backed by localStorage.
// No account needed — best quiz/test score per chapter is remembered on-device.
import { useCallback, useEffect, useRef, useState } from "react";

export type ChapterStat = {
  quizBest?: number; // best chapter-quiz %
  testBest?: number; // best chapter-test %
  updatedAt: string;
};

export type ProgressMap = Record<string, ChapterStat>;

export type Track = "cpl" | "atpl";

const KEY = "ga-progress-v1";
export const PROGRESS_EVENT = "ga-progress-change";

export const chapterKey = (track: Track, subjectId: string, chapterId: string) =>
  `${track}/${subjectId}/${chapterId}`;

// ── Sync bookkeeping (consumed by lib/progress-sync.ts) ─────────────────────
// Local writes mark their chapter keys dirty; subject clears record a prefix.
// Remote merges write WITHOUT marking dirty, so pulls never echo back as pushes.
const dirtyKeys = new Set<string>();
const clearedPrefixes = new Set<string>();
export function drainDirtyKeys(): string[] {
  const out = [...dirtyKeys];
  dirtyKeys.clear();
  return out;
}
export function drainClearedPrefixes(): string[] {
  const out = [...clearedPrefixes];
  clearedPrefixes.clear();
  return out;
}

export function readProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}") as ProgressMap;
  } catch {
    return {};
  }
}

function writeProgress(map: ProgressMap) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(map));
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

export function recordResult(
  kind: "quiz" | "test",
  track: Track,
  subjectId: string,
  chapterId: string,
  pct: number,
) {
  const map = readProgress();
  const k = chapterKey(track, subjectId, chapterId);
  const cur: ChapterStat = map[k] ?? { updatedAt: "" };
  const field = kind === "quiz" ? "quizBest" : "testBest";
  if (cur[field] === undefined || pct > (cur[field] as number)) cur[field] = pct;
  cur.updatedAt = new Date().toISOString();
  map[k] = cur;
  dirtyKeys.add(k);
  writeProgress(map);
}

// Merge rows pulled from the server into local storage (best score wins).
// Returns the chapter keys where LOCAL is better/newer — those need pushing up.
export function mergeRemoteProgress(
  rows: { key: string; quizBest?: number | null; testBest?: number | null; updatedAt: string }[],
): string[] {
  const map = readProgress();
  const localWins: string[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    seen.add(r.key);
    const cur: ChapterStat = map[r.key] ?? { updatedAt: "" };
    const mergedQuiz = Math.max(cur.quizBest ?? -1, r.quizBest ?? -1);
    const mergedTest = Math.max(cur.testBest ?? -1, r.testBest ?? -1);
    const merged: ChapterStat = {
      ...(mergedQuiz >= 0 ? { quizBest: mergedQuiz } : {}),
      ...(mergedTest >= 0 ? { testBest: mergedTest } : {}),
      updatedAt: cur.updatedAt > r.updatedAt ? cur.updatedAt : r.updatedAt,
    };
    map[r.key] = merged;
    if ((cur.quizBest ?? -1) > (r.quizBest ?? -1) || (cur.testBest ?? -1) > (r.testBest ?? -1)) {
      localWins.push(r.key);
    }
  }
  // Local-only chapters the server has never seen also need pushing.
  for (const k of Object.keys(map)) if (!seen.has(k)) localWins.push(k);
  writeProgress(map);
  return localWins;
}

export function getChapterStat(
  track: Track,
  subjectId: string,
  chapterId: string,
): ChapterStat | undefined {
  return readProgress()[chapterKey(track, subjectId, chapterId)];
}

export function isChapterCleared(stat: ChapterStat | undefined, passMark: number): boolean {
  if (!stat) return false;
  return (stat.quizBest ?? 0) >= passMark || (stat.testBest ?? 0) >= passMark;
}

export function bestScore(stat: ChapterStat | undefined): number {
  if (!stat) return 0;
  return Math.max(stat.quizBest ?? 0, stat.testBest ?? 0);
}

export function clearSubjectProgress(track: Track, subjectId: string) {
  const map = readProgress();
  const prefix = `${track}/${subjectId}/`;
  for (const key of Object.keys(map)) if (key.startsWith(prefix)) delete map[key];
  clearedPrefixes.add(prefix);
  writeProgress(map);
}

// ── Which quiz runs may count towards a chapter ─────────────────────────────
// A chapter with no questions of its own is handed the WHOLE subject pool by
// getQuestionsForChapter (1,020 questions on 16 Air Navigation chapters, 1-2 on
// others). Neither is a quiz OF that chapter, so such a run is sampled and
// labelled honestly, and it must never be able to mark the chapter "Cleared".
// These helpers are pure and take no question bank: the quiz components import
// this file and must not drag the bank into their bundle.
export const QUIZ_SAMPLE_SIZE = 25;
/** Below this many questions a score says nothing: no verdict, no progress. */
export const MIN_QUESTIONS_FOR_VERDICT = 10;

type HasChapterId = { chapterId?: string };

/**
 * True when `questions` is a subject-wide fallback rather than the chapter's own
 * bank. `chapterSpecific` is authoritative when the route passes it
 * (getChapterSpecificQuestions(...).length > 0). Without it we read the data:
 * a chapter's own set always shares ONE bank chapterId (including the Air
 * Regulations sets that CPL_AR_CHAPTER_MAP routes to a different id), while a
 * subject pool spans several, or carries questions with no chapterId at all.
 * Checked against all 302 chapters on 2026-10-08, zero disagreements.
 */
export function isSubjectFallback(
  questions: readonly HasChapterId[],
  chapterSpecific?: boolean,
): boolean {
  if (chapterSpecific !== undefined) return !chapterSpecific && questions.length > 0;
  if (questions.length === 0) return false;
  const ids = new Set(questions.map(q => q.chapterId ?? ""));
  return ids.size > 1 || ids.has("");
}

/** Up to `max` items in random order. Fewer than `max` items come back whole. */
export function sampleQuestions<T>(items: readonly T[], max: number, rand: () => number = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, Math.max(0, max));
}

/** The questions a chapter quiz/test actually runs: a sample for a fallback set, otherwise all. */
export function questionsForRun<T>(
  questions: readonly T[],
  fallback: boolean,
  rand: () => number = Math.random,
): T[] {
  return fallback ? sampleQuestions(questions, QUIZ_SAMPLE_SIZE, rand) : [...questions];
}

/**
 * A subject-wide fallback pool smaller than the verdict minimum cannot make an
 * honest revision quiz (a "random 25 from the subject" of 2 questions is not a
 * quiz), so no run is started. A chapter's OWN short bank still runs, but is
 * labelled and never stored (see countsTowardChapter).
 */
export function canStartRun(run: { poolSize: number; fallback: boolean }): boolean {
  return run.poolSize > 0 && !(run.fallback && run.poolSize < MIN_QUESTIONS_FOR_VERDICT);
}

/** Only a full-size run of the chapter's OWN questions may be stored as a chapter result. */
export function countsTowardChapter(run: { questionCount: number; fallback: boolean }): boolean {
  // A chapter's own bank counts at any size, as it always has: many chapters hold
  // fewer than ten questions of their own and must still be able to show progress.
  return !run.fallback && run.questionCount > 0;
}

// ── Deadline-based countdown ────────────────────────────────────────────────
// Counting timer ticks loses time whenever the browser throttles or suspends
// timers (locked phone, backgrounded tab). The deadline is fixed when the run
// starts and the time left is always read from the clock.
export function secondsLeft(deadlineMs: number, nowMs: number): number {
  return Math.max(0, Math.ceil((deadlineMs - nowMs) / 1000));
}

export type CountdownState = { deadline: number | null; fired: boolean };

export function startCountdown(state: CountdownState, nowMs: number, durationSec: number): void {
  state.deadline = nowMs + durationSec * 1000;
  state.fired = false;
}

export function stopCountdown(state: CountdownState): void {
  state.deadline = null;
  state.fired = false;
}

/**
 * Re-read the clock. Returns null when no run is armed. `expire` is true exactly
 * once per startCountdown(), on the first poll at or after the deadline, however
 * many polls (interval ticks, visibilitychange) arrive after that.
 */
export function pollCountdown(state: CountdownState, nowMs: number): { left: number; expire: boolean } | null {
  if (state.deadline === null) return null;
  const left = secondsLeft(state.deadline, nowMs);
  const expire = left <= 0 && !state.fired;
  if (expire) state.fired = true;
  return { left, expire };
}

/**
 * Countdown for a timed run. Call start(durationSec) from the click that begins
 * the run and reset(durationSec) when it is restarted; `running` switches the
 * polling on. The clock is re-read every 500 ms and on visibilitychange, so a
 * phone that was locked past the deadline submits the moment it wakes.
 */
export function useDeadlineCountdown(running: boolean, initialSec: number, onExpire: () => void) {
  const [timeLeft, setTimeLeft] = useState(initialSec);
  const state = useRef<CountdownState>({ deadline: null, fired: false });
  const start = useCallback((durationSec: number) => {
    startCountdown(state.current, Date.now(), durationSec);
    setTimeLeft(durationSec);
  }, []);
  const reset = useCallback((durationSec: number) => {
    stopCountdown(state.current);
    setTimeLeft(durationSec);
  }, []);
  useEffect(() => {
    if (!running) return;
    const check = () => {
      const r = pollCountdown(state.current, Date.now());
      if (!r) return;
      setTimeLeft(r.left);
      if (r.expire) onExpire();
    };
    const id = setInterval(check, 500);
    document.addEventListener("visibilitychange", check);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", check);
    };
  }, [running, onExpire]);
  return { timeLeft, start, reset };
}

// Re-render hook: returns a counter that increments whenever progress changes
// (in this tab via the custom event, or another tab via the storage event).
export function useProgressVersion(): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    const bump = () => setV(x => x + 1);
    window.addEventListener(PROGRESS_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);
  return v;
}
