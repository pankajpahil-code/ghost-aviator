"use client";

import { useCallback, useEffect, useState } from "react";

// Flags are a private study list. They stay on the student's device, like the
// ADAPT history, and are never sent to a server.
const KEY = "ga-question-flags-v1";
export const QUESTION_FLAGS_EVENT = "ga-question-flags-change";

export type QuestionFlags = Record<string, boolean>;

export function readQuestionFlags(): QuestionFlags {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    const clean: QuestionFlags = {};
    for (const [key, value] of Object.entries(raw)) {
      if (value === true && key.trim()) clean[key] = true;
    }
    return clean;
  } catch {
    return {};
  }
}

export function writeQuestionFlags(flags: QuestionFlags): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(flags));
    window.dispatchEvent(new Event(QUESTION_FLAGS_EVENT));
  } catch {
    // A full or disabled localStorage must not stop the student flagging a
    // question for this sitting.
  }
}

export function useQuestionFlags() {
  const [flags, setFlags] = useState<QuestionFlags>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setFlags(readQuestionFlags());
      setReady(true);
    };
    sync();
    window.addEventListener(QUESTION_FLAGS_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(QUESTION_FLAGS_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((key: string) => {
    const next = { ...readQuestionFlags() };
    if (next[key]) delete next[key];
    else next[key] = true;
    writeQuestionFlags(next);
    setFlags(next);
  }, []);

  return { flags, toggle, ready };
}
