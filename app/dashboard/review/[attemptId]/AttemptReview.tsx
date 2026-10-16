"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle, ArrowLeft, BookOpen, Calendar, CheckCircle, Flag, RotateCcw, XCircle,
} from "lucide-react";
import { readExamHistory, useExamHistoryVersion, weakChapters, type ExamAttempt } from "@/lib/exam-history";
import { getExamPaper } from "@/lib/exam-papers-meta";
import { getPaperQuestionPool } from "@/lib/exam-papers";
import { stemKey } from "@/lib/questions";
import { isRealExplanation } from "@/lib/explanation";
import { matchReviewEntries, filterReviewItems, reviewStats } from "@/lib/exam-review.mjs";
import type { ReviewFilter } from "@/lib/exam-review.mjs";
import { useStoredChapterResolution, looksLikeAirRegsBankId, type Track } from "@/lib/chapter-links";
import WeakChapterBars from "../../WeakChapterBars";

// ─────────────────────────────────────────────────────────────────────────────
// One saved sitting, reviewed question by question at any later date.
//
// The page only ever shows TODAY's bank: every trace entry is re-resolved by
// its stem key against the live question pool (lib/exam-review.mjs), so a
// corrected answer key shows corrected. If the current keys disagree with
// what the sitting recorded, the page says so; if a question has left the
// bank it renders a labelled placeholder.
//
// The question wording and your chosen/flagged answers come from the trace on
// THIS device (localStorage) — see lib/exam-history.ts for why the trace is
// never uploaded.
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "—";
  if (sec < 60) return `${Math.round(sec)} sec`;
  return `${Math.round(sec / 60)} min`;
}

const FILTERS: { id: ReviewFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "wrong", label: "Wrong" },
  { id: "unanswered", label: "Unanswered" },
  { id: "flagged", label: "Flagged" },
];

export default function AttemptReview({ attemptId }: { attemptId: string }) {
  const version = useExamHistoryVersion(); // bumps on attempt/sync changes
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // History lives in localStorage, which the server cannot see. The first
    // render (server AND client) shows the looking-up shell; the real read
    // happens once mounted — same pattern as the dashboard.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  // undefined = not read yet; null = this device has no such attempt.
  // `version` is the only invalidation once mounted (readExamHistory reads
  // localStorage and takes no arguments — see the dashboard's note).
  const attempt: ExamAttempt | null | undefined = useMemo(() => {
    if (!mounted) return undefined;
    return readExamHistory().find(a => a.id === attemptId) ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, version, attemptId]);

  const paper = useMemo(() => (attempt ? getExamPaper(attempt.paperId) : undefined), [attempt]);
  const pool = useMemo(() => (paper ? getPaperQuestionPool(paper) : []), [paper]);
  const byKey = useMemo(() => new Map(pool.map(q => [stemKey(q), q])), [pool]);
  const items = useMemo(
    () => (attempt?.review ? matchReviewEntries(byKey, attempt.review) : []),
    [attempt, byKey],
  );
  const stats = useMemo(() => reviewStats(items), [items]);
  const [filter, setFilter] = useState<ReviewFilter>("all");
  const shown = useMemo(() => filterReviewItems(items, filter), [items, filter]);
  const weak = useMemo(() => (attempt ? weakChapters([attempt], 5) : []), [attempt]);

  const track: Track = attempt?.track === "atpl" ? "atpl" : "cpl";
  const needsBank = useMemo(
    () =>
      items.some(it => !!it.question?.chapterId && looksLikeAirRegsBankId(it.question.chapterId)) ||
      Object.keys(attempt?.chapterBreakdown ?? {}).some(looksLikeAirRegsBankId),
    [items, attempt],
  );
  const { hrefFor, labelsFor } = useStoredChapterResolution(needsBank);
  const chapterLabel = (id: string): string | undefined => {
    const ls = labelsFor(id, track);
    return ls && ls.length > 0 ? ls.join(" / ") : undefined;
  };

  const shell = (children: ReactNode) => (
    <div className="grid-bg min-h-screen py-14 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm no-underline mb-6" style={{ color: "#64748b" }}>
          <ArrowLeft className="w-4 h-4" /> Performance dashboard
        </Link>
        {children}
      </div>
    </div>
  );

  if (attempt === undefined) {
    return shell(
      <div className="glass-card p-10 text-center">
        <p style={{ color: "#64748b" }}>Looking up your sitting…</p>
      </div>,
    );
  }

  if (attempt === null) {
    return shell(
      <div className="glass-card p-10 text-center">
        <div className="text-5xl mb-4">🧭</div>
        <h1 className="text-2xl font-extrabold mb-2">This sitting isn&apos;t on this device</h1>
        <p className="mb-8 text-sm" style={{ color: "#94a3b8" }}>
          Attempts live in your browser. Scores and weak-chapter data sync across devices when you
          sign in, but the question-by-question review is kept only on the device that sat the
          paper — and only for sittings taken after review mode was added.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold no-underline text-sm"
                style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}>
            Back to dashboard
          </Link>
          <Link href="/exam" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold no-underline text-sm"
                style={{ border: "1px solid rgba(240,145,58,0.3)", color: "#f0913a", background: "rgba(240,145,58,0.06)" }}>
            <BookOpen className="w-4 h-4" /> All papers
          </Link>
        </div>
      </div>,
    );
  }

  if (!attempt.review || attempt.review.length === 0) {
    return shell(
      <div className="glass-card p-10 text-center">
        <div className="text-5xl mb-4">🗂️</div>
        <h1 className="text-2xl font-extrabold mb-2">No saved answer review for this sitting</h1>
        <p className="mb-2 text-sm" style={{ color: "#94a3b8" }}>
          It was recorded before answer-by-answer review existed (or its saved answers were cleared
          from this browser). The score record is intact on your dashboard.
        </p>
        <p className="mb-8 text-sm" style={{ color: "#64748b" }}>
          {paper?.shortTitle ?? attempt.paperId} · {fmtDate(attempt.createdAt)} ·{" "}
          {attempt.scorePct}% ({attempt.correctCount}/{attempt.totalCount})
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href={`/exam/${attempt.paperId}`} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold no-underline text-sm"
                style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}>
            <RotateCcw className="w-4 h-4" /> Retake this paper
          </Link>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold no-underline text-sm"
                style={{ border: "1px solid rgba(240,145,58,0.3)", color: "#f0913a", background: "rgba(240,145,58,0.06)" }}>
            Back to dashboard
          </Link>
        </div>
      </div>,
    );
  }

  const passMark = paper?.passMark ?? 70;
  const passed = attempt.scorePct >= passMark;
  // Current keys disagree with the recorded score? Only said when every
  // question still resolves — with placeholders the comparison is not exact.
  const scoreDrift = stats.missing === 0 && stats.correct !== attempt.correctCount;
  const countFor = (id: ReviewFilter) =>
    id === "all" ? stats.total
    : id === "wrong" ? stats.wrong
    : id === "unanswered" ? stats.unanswered
    : stats.flagged;

  return shell(
    <>
      {/* Header — the recorded sitting */}
      <div className="glass-card p-8 mb-6">
        <div className="flex items-center gap-2 text-xs mb-2 flex-wrap" style={{ color: "#64748b" }}>
          <Calendar className="w-3.5 h-3.5" />
          {fmtDate(attempt.createdAt)} · took {fmtDuration(attempt.durationTakenSec)}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-6">{paper?.title ?? attempt.paperId}</h1>
        <div className="grid grid-cols-3 gap-4">
          {[
            ["Score", `${attempt.scorePct}%`, passed ? "#22c55e" : "#ef4444"],
            ["Correct", `${attempt.correctCount}/${attempt.totalCount}`, "#f0913a"],
            ["Status", passed ? "PASS" : "FAIL", passed ? "#22c55e" : "#ef4444"],
          ].map(([l, v, c]) => (
            <div key={l} className="glass-card p-4 text-center">
              <div className="text-2xl font-bold" style={{ color: c }}>{v}</div>
              <div className="text-xs" style={{ color: "#64748b" }}>{l}</div>
            </div>
          ))}
        </div>
        {(scoreDrift || stats.missing > 0) && (
          <div className="mt-6 text-xs px-4 py-3 rounded-xl" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }}>
            {scoreDrift && (
              <p>
                The answer keys have been revised since this sitting — today&apos;s verified keys
                give {stats.correct}/{stats.total}. The review below shows the current answers.
              </p>
            )}
            {stats.missing > 0 && (
              <p>
                {stats.missing} question{stats.missing === 1 ? "" : "s"} from this sitting{" "}
                {stats.missing === 1 ? "is" : "are"} no longer in the question bank and can&apos;t be
                shown.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Filter questions">
        {FILTERS.map(f => {
          const active = filter === f.id;
          return (
            <button key={f.id} onClick={() => setFilter(f.id)} aria-pressed={active}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold"
                    style={{
                      color: active ? "#000" : "#94a3b8",
                      background: active ? "linear-gradient(135deg,#f0913a,#0099cc)" : "rgba(255,255,255,0.05)",
                      border: active ? "1px solid transparent" : "1px solid rgba(255,255,255,0.1)",
                    }}>
              {f.label} ({countFor(f.id)})
            </button>
          );
        })}
      </div>

      {/* Questions in sitting order */}
      <div className="flex flex-col gap-4 mb-10">
        {shown.length === 0 ? (
          <div className="glass-card p-8 text-center text-sm" style={{ color: "#64748b" }}>
            Nothing under this filter.
          </div>
        ) : (
          shown.map(it => {
            if (it.missing || !it.question) {
              return (
                <div key={it.index} className="glass-card p-6" style={{ border: "1px solid rgba(245,158,11,0.25)" }}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap text-xs mb-1" style={{ color: "#475569" }}>
                        <span>Q{it.index + 1}</span>
                        {it.flagged && <span className="inline-flex items-center gap-1" style={{ color: "#f59e0b" }}><Flag className="w-3 h-3" /> flagged</span>}
                      </div>
                      <p className="text-sm" style={{ color: "#94a3b8" }}>
                        This question is no longer in the question bank, so it can&apos;t be
                        reviewed here. Your sitting&apos;s score already counted it.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
            const q = it.question;
            // Chapter route + label for this question (Air Regulations bank ids
            // translate in the same track the paper was sat in).
            let chapterLink: ReactNode = null;
            if (q.chapterId) {
              const label = chapterLabel(q.chapterId);
              const href = hrefFor(q.chapterId, track);
              if (href && label) {
                chapterLink = <Link href={href} className="no-underline" style={{ color: "#f0913a" }}>{label} →</Link>;
              } else if (label) {
                chapterLink = <span>{label}</span>;
              }
            }
            return (
              <div key={it.index} className="glass-card p-6">
                <div className="flex items-start gap-3 mb-4">
                  {it.chosen === q.ans
                    ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#22c55e" }} />
                    : <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />}
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 flex-wrap text-xs mb-1" style={{ color: "#475569" }}>
                      <span>Q{it.index + 1}</span>
                      {it.flagged && <span className="inline-flex items-center gap-1" style={{ color: "#f59e0b" }}><Flag className="w-3 h-3" /> flagged</span>}
                      {it.chosen === null && <span>left blank</span>}
                      {chapterLink}
                    </div>
                    <p className="text-sm font-medium">{q.q}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  {q.opts.map((opt, oi) => (
                    <div key={oi} className="px-4 py-2 rounded-lg text-sm"
                         style={{
                           background: oi === q.ans ? "rgba(34,197,94,0.15)" : oi === it.chosen ? "rgba(239,68,68,0.15)" : "rgba(13,13,26,0.5)",
                           border: oi === q.ans ? "1px solid #22c55e" : oi === it.chosen ? "1px solid #ef4444" : "1px solid rgba(240,145,58,0.1)",
                           color: oi === q.ans ? "#22c55e" : oi === it.chosen ? "#ef4444" : "#94a3b8",
                         }}>
                      {String.fromCharCode(65 + oi)}. {opt}
                    </div>
                  ))}
                </div>
                {isRealExplanation(q.exp) && (
                  <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(240,145,58,0.05)", border: "1px solid rgba(240,145,58,0.15)", color: "#94a3b8" }}>
                    💡 {q.exp}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Weakest chapters of this sitting — same renderer as the dashboard */}
      {weak.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" style={{ color: "#f59e0b" }} /> Weakest chapters in this sitting
          </h2>
          <div className="glass-card p-6">
            <WeakChapterBars
              items={weak}
              labelFor={id => chapterLabel(id)}
              hrefFor={id => hrefFor(id, track)}
            />
          </div>
        </section>
      )}

      <div className="flex gap-3 justify-center flex-wrap">
        <Link href={`/exam/${attempt.paperId}`} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold no-underline text-sm"
              style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}>
          <RotateCcw className="w-4 h-4" /> Retake this paper
        </Link>
        <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-bold no-underline text-sm"
              style={{ border: "1px solid rgba(240,145,58,0.3)", color: "#f0913a", background: "rgba(240,145,58,0.06)" }}>
          Back to dashboard
        </Link>
      </div>
    </>,
  );
}
