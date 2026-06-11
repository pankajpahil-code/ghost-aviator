"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Cross-device progress sync.
//
// Signed-out: lib/progress.ts keeps everything in localStorage as before.
// Signed-in:  this module mirrors that data to the user's rows in the
//             Supabase `progress` table (RLS: each user sees only their own).
//
//   on start   → pull server rows, merge into local (best score wins),
//                push back any chapters where local was better/new
//   on result  → recordResult marks the chapter dirty; we debounce-upsert it
//   on clear   → clearSubjectProgress records a prefix; we delete it remotely
//
// Every server call fails soft: if the table is missing or the network is
// down, the site keeps working on localStorage alone.
// ─────────────────────────────────────────────────────────────────────────────
import { getSupabase } from "./supabase";
import {
  PROGRESS_EVENT,
  readProgress,
  mergeRemoteProgress,
  drainDirtyKeys,
  drainClearedPrefixes,
} from "./progress";

const TABLE = "progress";
const PUSH_DEBOUNCE_MS = 1500;

type Row = {
  user_id: string;
  chapter_key: string;
  quiz_best: number | null;
  test_best: number | null;
  updated_at: string;
};

function rowsForKeys(userId: string, keys: string[]): Row[] {
  const map = readProgress();
  return keys
    .filter(k => map[k])
    .map(k => ({
      user_id: userId,
      chapter_key: k,
      quiz_best: map[k].quizBest ?? null,
      test_best: map[k].testBest ?? null,
      updated_at: map[k].updatedAt || new Date().toISOString(),
    }));
}

export function startProgressSync(userId: string): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};

  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  const pushDirty = async () => {
    if (stopped) return;
    const prefixes = drainClearedPrefixes();
    for (const p of prefixes) {
      await sb.from(TABLE).delete().eq("user_id", userId).like("chapter_key", `${p}%`);
    }
    const rows = rowsForKeys(userId, drainDirtyKeys());
    if (rows.length) {
      await sb.from(TABLE).upsert(rows, { onConflict: "user_id,chapter_key" });
    }
  };

  const onLocalChange = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { void pushDirty().catch(() => {}); }, PUSH_DEBOUNCE_MS);
  };

  // Initial reconcile: pull → merge → push what local knows better.
  void (async () => {
    try {
      const { data, error } = await sb
        .from(TABLE)
        .select("chapter_key, quiz_best, test_best, updated_at")
        .eq("user_id", userId);
      if (error || stopped) return;
      const localWins = mergeRemoteProgress(
        (data ?? []).map(r => ({
          key: r.chapter_key as string,
          quizBest: r.quiz_best as number | null,
          testBest: r.test_best as number | null,
          updatedAt: (r.updated_at as string) ?? "",
        })),
      );
      const rows = rowsForKeys(userId, localWins);
      if (rows.length) {
        await sb.from(TABLE).upsert(rows, { onConflict: "user_id,chapter_key" });
      }
    } catch {
      /* offline / table missing — localStorage continues to work */
    }
  })();

  window.addEventListener(PROGRESS_EVENT, onLocalChange);
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    window.removeEventListener(PROGRESS_EVENT, onLocalChange);
  };
}
