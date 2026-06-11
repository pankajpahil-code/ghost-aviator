"use client";

// Lightweight client-side progress tracking backed by localStorage.
// No account needed — best quiz/test score per chapter is remembered on-device.
import { useEffect, useState } from "react";

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
