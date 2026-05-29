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

const chapterKey = (track: Track, subjectId: string, chapterId: string) =>
  `${track}/${subjectId}/${chapterId}`;

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
  writeProgress(map);
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
