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
//
// PENDING MEANS PENDING UNTIL THE SERVER SAYS OTHERWISE. The pending ids are
// stored on the device (lib/exam-history.ts) and one is removed only after its
// row is confirmed uploaded. A failed push leaves it there for the next start
// or the next attempt. Before 2026-10-08 the list was emptied first and the
// result of the upload was never looked at, so a failure was permanent.
// ─────────────────────────────────────────────────────────────────────────────
import { getSupabase } from "./supabase";
import {
  EXAM_HISTORY_EVENT,
  readExamHistory,
  mergeRemoteAttempts,
  readPendingIds,
  confirmPendingIds,
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

// Postgres "unique_violation": the row is already on the server.
const DUPLICATE = "23505";
// Classes 22 (bad data) and 23 (constraint) are about ONE row, so the rest of
// the batch is worth sending row by row. Anything else (table missing, not
// allowed, offline) would fail for every row alike, so it is not retried now.
const isRowLevel = (code: string | undefined) => /^2[23]/.test(code ?? "");

function rowsForIds(userId: string, history: ExamAttempt[], ids: string[]): Row[] {
  const byId = new Map(history.map(a => [a.id, a]));
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
  let pushing = false;
  let again = false;

  const pushPending = async () => {
    if (stopped) return;
    // One push at a time: the start-up reconcile and the debounced push can
    // overlap, and two of them would send the same rows twice.
    if (pushing) { again = true; return; }
    pushing = true;
    try {
      const ids = readPendingIds();
      if (!ids.length) return;
      const history = readExamHistory();
      const rows = rowsForIds(userId, history, ids);
      const settled: string[] = [];
      // An id whose attempt has aged out of the local log (only the newest 50
      // are kept) can never be sent. Only trusted when the log is readable and
      // non-empty, so a storage hiccup cannot wipe the list.
      if (history.length) {
        const sendable = new Set(rows.map(r => r.id));
        settled.push(...ids.filter(id => !sendable.has(id)));
      }
      if (rows.length) {
        // Plain INSERT, not upsert: attempts are an immutable log with insert
        // and select policies only (SECURITY.md 3c), and an id being retried
        // may already be there if the first answer was lost on the way back.
        const { error } = await sb.from(TABLE).insert(rows);
        if (!error) {
          settled.push(...rows.map(r => r.id));
        } else if (isRowLevel(error.code)) {
          for (const row of rows) {
            const { error: rowError } = await sb.from(TABLE).insert(row);
            if (!rowError || rowError.code === DUPLICATE) settled.push(row.id);
          }
        }
      }
      confirmPendingIds(settled);
    } finally {
      pushing = false;
      if (again && !stopped) {
        again = false;
        void pushPending().catch(() => {});
      }
    }
  };

  const onLocalChange = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { void pushPending().catch(() => {}); }, PUSH_DEBOUNCE_MS);
  };

  // Initial reconcile: pull everything the server has, merge into local,
  // then push up anything still pending: recorded before sign-in, in an
  // earlier visit, or left over from an upload that failed.
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
