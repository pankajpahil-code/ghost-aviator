"use client";

// ─────────────────────────────────────────────────────────────────────────────
// Cross-device sync for Exam Mode attempt history — mirrors the pattern in
// lib/progress-sync.ts, but simpler: attempts are an immutable log (insert
// once, never updated), so there's no best-score merge logic to worry about.
//
//   on start   → pull server rows, merge into local (dedupe by id)
//   on attempt → recordExamAttempt marks it pending; we debounce-push it
//
// Every server call fails soft: if the table is missing or the network is
// down, the site keeps working on localStorage alone.
// ─────────────────────────────────────────────────────────────────────────────
import { getSupabase } from "./supabase";
import {
  EXAM_HISTORY_EVENT,
  readExamHistory,
  mergeRemoteAttempts,
  drainPendingIds,
  type ExamAttempt,
} from "./exam-history";

const TABLE = "exam_attempts";
const PUSH_DEBOUNCE_MS = 1500;

type Row = {
  id: string;
  user_id: string;
  paper_id: string;
  track: string;
  score_pct: number;
  correct_count: number;
  total_count: number;
  duration_taken_sec: number | null;
  chapter_breakdown: ExamAttempt["chapterBreakdown"];
  created_at: string;
};

function rowsForIds(userId: string, ids: string[]): Row[] {
  const byId = new Map(readExamHistory().map(a => [a.id, a]));
  return ids
    .filter(id => byId.has(id))
    .map(id => {
      const a = byId.get(id)!;
      return {
        id: a.id,
        user_id: userId,
        paper_id: a.paperId,
        track: a.track,
        score_pct: a.scorePct,
        correct_count: a.correctCount,
        total_count: a.totalCount,
        duration_taken_sec: a.durationTakenSec ?? null,
        chapter_breakdown: a.chapterBreakdown,
        created_at: a.createdAt,
      };
    });
}

function fromRow(r: Row): ExamAttempt {
  return {
    id: r.id,
    paperId: r.paper_id,
    track: (r.track as "cpl" | "atpl") ?? "cpl",
    scorePct: r.score_pct,
    correctCount: r.correct_count,
    totalCount: r.total_count,
    durationTakenSec: r.duration_taken_sec ?? 0,
    chapterBreakdown: r.chapter_breakdown ?? {},
    createdAt: r.created_at,
  };
}

export function startExamHistorySync(userId: string): () => void {
  const sb = getSupabase();
  if (!sb) return () => {};

  let timer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  const pushPending = async () => {
    if (stopped) return;
    const rows = rowsForIds(userId, drainPendingIds());
    if (rows.length) {
      await sb.from(TABLE).upsert(rows, { onConflict: "id" });
    }
  };

  const onLocalChange = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { void pushPending().catch(() => {}); }, PUSH_DEBOUNCE_MS);
  };

  // Initial reconcile: pull everything the server has, merge into local,
  // then push up anything recorded locally before sign-in.
  void (async () => {
    try {
      const { data, error } = await sb
        .from(TABLE)
        .select("id, paper_id, track, score_pct, correct_count, total_count, duration_taken_sec, chapter_breakdown, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error || stopped) return;
      mergeRemoteAttempts((data ?? []).map(r => fromRow(r as Row)));
      await pushPending();
    } catch {
      /* offline / table missing — localStorage continues to work */
    }
  })();

  window.addEventListener(EXAM_HISTORY_EVENT, onLocalChange);
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
    window.removeEventListener(EXAM_HISTORY_EVENT, onLocalChange);
  };
}
