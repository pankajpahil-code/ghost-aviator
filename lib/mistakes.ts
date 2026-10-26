"use client";

import { useEffect, useState } from "react";

// The Mistakes Bank is a private review list. Like flags and ADAPT history, it
// stays in this browser and is never sent to a server. A question is added when
// it is answered wrong or skipped in a mock test; it stays until the student
// marks it mastered or clears the bank.
const KEY = "ga-mistakes-v1";
export const MISTAKES_EVENT = "ga-mistakes-change";
export const MAX_MISTAKES = 200; // bounds localStorage growth; oldest missed drops first

export type MistakeSource = "mock-test";

export type MistakeEntry = {
  key: string; // stable question key (the stem, as used by question flags)
  subjectId: string;
  subjectName: string;
  chapterId?: string;
  chapterLabel: string;
  q: string;
  opts: string[];
  ans: number;
  exp: string;
  userAnswer: number | null; // null means the question was skipped
  source: MistakeSource;
  sourceDetail: string;
  createdAt: string; // first time this question entered the bank
  updatedAt: string; // last time it was missed
  wrongCount: number;
};

export type NewMistake = Omit<MistakeEntry, "createdAt" | "updatedAt" | "wrongCount">;
export type MistakeSaveResult = { added: number; updated: number };

function cleanEntry(value: unknown): MistakeEntry | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const opts = Array.isArray(raw.opts)
    ? raw.opts.filter((option): option is string => typeof option === "string")
    : [];
  const ans = raw.ans;
  if (typeof raw.key !== "string" || !raw.key.trim()) return null;
  if (typeof raw.q !== "string" || !raw.q.trim()) return null;
  if (typeof raw.subjectId !== "string" || !raw.subjectId) return null;
  if (opts.length < 2) return null;
  if (typeof ans !== "number" || !Number.isInteger(ans) || ans < 0 || ans >= opts.length) return null;

  const userAnswer =
    typeof raw.userAnswer === "number" &&
    Number.isInteger(raw.userAnswer) &&
    raw.userAnswer >= 0 &&
    raw.userAnswer < opts.length
      ? raw.userAnswer
      : null;
  const now = new Date().toISOString();
  const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : now;
  const updatedAt = typeof raw.updatedAt === "string" ? raw.updatedAt : createdAt;
  const wrongCount =
    typeof raw.wrongCount === "number" && Number.isFinite(raw.wrongCount) && raw.wrongCount >= 1
      ? Math.floor(raw.wrongCount)
      : 1;

  return {
    key: raw.key,
    subjectId: raw.subjectId,
    subjectName:
      typeof raw.subjectName === "string" && raw.subjectName.trim()
        ? raw.subjectName
        : raw.subjectId,
    chapterId: typeof raw.chapterId === "string" && raw.chapterId ? raw.chapterId : undefined,
    chapterLabel:
      typeof raw.chapterLabel === "string" && raw.chapterLabel.trim()
        ? raw.chapterLabel
        : "Unclassified",
    q: raw.q,
    opts,
    ans,
    exp: typeof raw.exp === "string" ? raw.exp : "",
    userAnswer,
    source: "mock-test",
    sourceDetail:
      typeof raw.sourceDetail === "string" && raw.sourceDetail.trim()
        ? raw.sourceDetail
        : "Mock test",
    createdAt,
    updatedAt,
    wrongCount,
  };
}

export function readMistakes(): MistakeEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .map(cleanEntry)
      .filter((entry): entry is MistakeEntry => entry !== null)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, MAX_MISTAKES);
  } catch {
    return [];
  }
}

function writeMistakes(entries: MistakeEntry[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(0, MAX_MISTAKES)));
    window.dispatchEvent(new Event(MISTAKES_EVENT));
    return true;
  } catch {
    // A full or disabled localStorage must not stop the result screen from
    // opening. The caller can still show the answers on screen.
    return false;
  }
}

/**
 * Add or refresh mistakes from one sitting. Existing entries keep their original
 * createdAt, move to the top, and increment wrongCount; new entries start at 1.
 * Returns null when the browser refused the write.
 */
export function addMistakes(items: NewMistake[]): MistakeSaveResult | null {
  const unique = new Map<string, NewMistake>();
  for (const item of items) {
    if (item.key && item.q) unique.set(item.key, item);
  }
  if (unique.size === 0) return { added: 0, updated: 0 };

  const now = new Date().toISOString();
  const byKey = new Map(readMistakes().map((entry) => [entry.key, entry]));
  let added = 0;
  let updated = 0;

  for (const item of unique.values()) {
    const prior = byKey.get(item.key);
    if (prior) {
      byKey.set(item.key, {
        ...prior,
        ...item,
        createdAt: prior.createdAt,
        updatedAt: now,
        wrongCount: prior.wrongCount + 1,
      });
      updated += 1;
    } else {
      byKey.set(item.key, {
        ...item,
        createdAt: now,
        updatedAt: now,
        wrongCount: 1,
      });
      added += 1;
    }
  }

  const next = [...byKey.values()]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, MAX_MISTAKES);
  return writeMistakes(next) ? { added, updated } : null;
}

export function removeMistake(key: string): void {
  writeMistakes(readMistakes().filter((entry) => entry.key !== key));
}

export function clearMistakes(): void {
  writeMistakes([]);
}

// Re-render hook: reads on mount and bumps whenever the bank changes in this
// tab (custom event) or another tab (storage event).
export function useMistakes() {
  const [mistakes, setMistakes] = useState<MistakeEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setMistakes(readMistakes());
      setReady(true);
    };
    sync();
    window.addEventListener(MISTAKES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(MISTAKES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { mistakes, ready };
}
