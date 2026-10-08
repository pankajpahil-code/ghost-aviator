"use client";

// Local-first Exam Mode attempt history. Unlike lib/progress.ts (which only
// ever keeps the BEST quiz/test score per chapter), this logs every full-paper
// mock exam attempt so the performance dashboard can show a trend over time
// and find weak chapters. No account needed — attempts live in localStorage
// and are mirrored to Supabase only when signed in (see exam-history-sync.ts).
import { useEffect, useState } from "react";

export type ChapterBreakdown = Record<string, { correct: number; total: number }>;

export type ExamAttempt = {
  id: string;
  paperId: string;
  track: "cpl" | "atpl";
  scorePct: number;
  correctCount: number;
  totalCount: number;
  durationTakenSec: number;
  chapterBreakdown: ChapterBreakdown;
  createdAt: string;
};

const KEY = "ga-exam-history-v1";
const MAX_LOCAL_ATTEMPTS = 50; // bounds localStorage growth; oldest attempts drop first
export const EXAM_HISTORY_EVENT = "ga-exam-history-change";

// ── Sync bookkeeping (consumed by lib/exam-history-sync.ts) ─────────────────
// New local attempts mark themselves pending; remote pulls merge in WITHOUT
// marking pending, so a pull never echoes back as a push.
//
// The pending ids are PERSISTED, and an id leaves the list only when the sync
// says its upload was confirmed. Until 2026-10-08 they lived in a module-level
// Set that was emptied before the upload was attempted, so two things lost
// attempts for good: closing the tab between sitting an exam and signing in,
// and any upload that failed (offline, server error). Both left the attempt on
// this device only, and the dashboard on another device never showed it.
//
// This is a NEW key. The attempt log itself (KEY above) is unchanged, so
// history written by an older build loads exactly as before; it simply has no
// pending list yet, which reads as empty.
const PENDING_KEY = "ga-exam-history-pending-v1";
// Kept as well as the stored list, so a browser that refuses storage writes
// still syncs within the session, as it did before.
const memoryPending = new Set<string>();

export function readPendingIds(): string[] {
  const ids = new Set(memoryPending);
  if (typeof window !== "undefined") {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(PENDING_KEY) || "[]");
      if (Array.isArray(stored)) {
        for (const id of stored) if (typeof id === "string" && id) ids.add(id);
      }
    } catch {
      /* unreadable or blocked storage: the in-memory set still stands */
    }
  }
  return [...ids];
}

function writePendingIds(ids: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify(ids));
  } catch {
    /* storage full or blocked: memoryPending carries the session */
  }
}

function markPending(id: string) {
  memoryPending.add(id);
  writePendingIds(readPendingIds());
}

// Called by the sync ONLY for ids it has finished with: the server took the
// row, or the attempt has aged out of the local log and can never be sent.
export function confirmPendingIds(done: string[]): void {
  if (!done.length) return;
  const gone = new Set(done);
  for (const id of gone) memoryPending.delete(id);
  writePendingIds(readPendingIds().filter(id => !gone.has(id)));
}

export function readExamHistory(): ExamAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]") as ExamAttempt[];
  } catch {
    return [];
  }
}

function writeExamHistory(attempts: ExamAttempt[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(attempts));
  window.dispatchEvent(new Event(EXAM_HISTORY_EVENT));
}

function randomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function recordExamAttempt(input: {
  paperId: string;
  track: "cpl" | "atpl";
  scorePct: number;
  correctCount: number;
  totalCount: number;
  durationTakenSec: number;
  chapterBreakdown: ChapterBreakdown;
}): ExamAttempt {
  const attempt: ExamAttempt = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : randomId(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  const attempts = [attempt, ...readExamHistory()].slice(0, MAX_LOCAL_ATTEMPTS);
  markPending(attempt.id);
  writeExamHistory(attempts);
  return attempt;
}

// Merge rows pulled from the server into local storage — dedupe by id, newest first.
export function mergeRemoteAttempts(remote: ExamAttempt[]): void {
  const local = readExamHistory();
  const seen = new Set(local.map(a => a.id));
  const merged = [...local, ...remote.filter(a => !seen.has(a.id))]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_LOCAL_ATTEMPTS);
  writeExamHistory(merged);
}

export function getPaperAttempts(paperId: string): ExamAttempt[] {
  return readExamHistory().filter(a => a.paperId === paperId);
}

// Weak-chapter aggregation across a set of attempts (whole history, or one paper's).
export function weakChapters(
  attempts: ExamAttempt[],
  limit = 5,
): { chapterId: string; accuracy: number; total: number }[] {
  const agg = new Map<string, { correct: number; total: number }>();
  for (const a of attempts) {
    for (const [chapterId, stat] of Object.entries(a.chapterBreakdown)) {
      const cur = agg.get(chapterId) ?? { correct: 0, total: 0 };
      cur.correct += stat.correct;
      cur.total += stat.total;
      agg.set(chapterId, cur);
    }
  }
  return [...agg.entries()]
    .map(([chapterId, { correct, total }]) => ({
      chapterId,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      total,
    }))
    .filter(c => c.total >= 3) // a chapter seen once or twice is too noisy to call "weak"
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, limit);
}

// Re-render hook: bumps whenever attempt history changes (this tab or another).
export function useExamHistoryVersion(): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    const bump = () => setV(x => x + 1);
    window.addEventListener(EXAM_HISTORY_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(EXAM_HISTORY_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);
  return v;
}
