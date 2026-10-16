"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/lib/supabase";
import AdaptPanel from "./AdaptPanel";
import WeakChapterBars from "./WeakChapterBars";
// Metadata module, NOT lib/exam-papers: that one imports the whole question bank.
import { EXAM_PAPERS, getExamPaper } from "@/lib/exam-papers-meta";
import { readExamHistory, weakChapters, useExamHistoryVersion, type ExamAttempt } from "@/lib/exam-history";
import { useStoredChapterResolution, looksLikeAirRegsBankId } from "@/lib/chapter-links";
import { TrendingUp, AlertTriangle, FileCheck, Trophy, XCircle, CheckCircle, RotateCcw } from "lucide-react";

// Stable empty list for the pre-mount render, so memos downstream keep a steady input.
const NO_HISTORY: ExamAttempt[] = [];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Single-series score trend for one paper — 2px line, endpoint dot + label only,
// a recessive hairline at the pass mark for context. No axis clutter.
function ScoreTrend({ attempts, passMark }: { attempts: ExamAttempt[]; passMark: number }) {
  const ordered = [...attempts].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const w = 280, h = 80, pad = 10;
  const x = (i: number) => pad + (ordered.length > 1 ? (i / (ordered.length - 1)) * (w - pad * 2) : (w - pad * 2) / 2);
  const y = (pct: number) => h - pad - (pct / 100) * (h - pad * 2);
  const points = ordered.map((a, i) => [x(i), y(a.scorePct)] as const);
  const path = points.map(([px, py], i) => `${i === 0 ? "M" : "L"}${px.toFixed(1)},${py.toFixed(1)}`).join(" ");
  const last = ordered[ordered.length - 1];
  const lastPassed = last.scorePct >= passMark;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ maxWidth: w, height: h }}>
      {/* pass-mark reference line */}
      <line x1={pad} x2={w - pad} y1={y(passMark)} y2={y(passMark)} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />
      <text x={w - pad} y={y(passMark) - 4} textAnchor="end" fontSize="9" fill="#475569">Pass {passMark}%</text>
      {/* trend line */}
      {ordered.length > 1 && <path d={path} fill="none" stroke="#f0913a" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
      {points.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r={i === points.length - 1 ? 5 : 3}
                fill={i === points.length - 1 ? (lastPassed ? "#22c55e" : "#ef4444") : "#f0913a"}
                stroke="#0b1117" strokeWidth={2} />
      ))}
      <text x={points[points.length - 1][0]} y={points[points.length - 1][1] - 10} textAnchor="middle" fontSize="11" fontWeight="bold"
            fill={lastPassed ? "#22c55e" : "#ef4444"}>
        {last.scorePct}%
      </text>
    </svg>
  );
}

// Horizontal bar list of weakest chapters — extracted to WeakChapterBars.tsx
// in Phase 2 (2026-10-17) so the per-attempt review page can use the same
// renderer, and because each row now links to the chapter's notes.

export default function DashboardPage() {
  const { user } = useUser();
  const version = useExamHistoryVersion(); // bumps on attempt/sync changes
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // History lives in localStorage, which the server cannot see. Reading it
    // during render made the first client render differ from the prerendered
    // HTML for returning students. So the first render (server AND client) sees
    // an empty history, and the real read happens once mounted.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  // `version` looks "unnecessary" to the lint rule because readExamHistory()
  // takes no arguments — but it reads localStorage, so `version` is the ONLY
  // thing that invalidates this memo once mounted. Removing it freezes the
  // dashboard: new attempts and cross-device syncs would stop appearing. Do not
  // "clean up".
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const history = useMemo(() => (mounted ? readExamHistory() : NO_HISTORY), [mounted, version]);

  const byPaper = useMemo(() => {
    const groups = new Map<string, ExamAttempt[]>();
    for (const a of history) {
      if (!groups.has(a.paperId)) groups.set(a.paperId, []);
      groups.get(a.paperId)!.push(a);
    }
    return groups;
  }, [history]);

  const weak = useMemo(() => weakChapters(history, 6), [history]);
  const recent = useMemo(() => history.slice(0, 10), [history]);

  // Stored chapter ids -> notes routes. The Air Regulations bank-id translation
  // is a bank-coupled module, so it is only requested when the weak list
  // actually holds such an id (lib/chapter-links.ts).
  const needsBank = useMemo(() => weak.some(it => looksLikeAirRegsBankId(it.chapterId)), [weak]);
  const { hrefFor, labelsFor } = useStoredChapterResolution(needsBank);

  return (
    <div className="grid-bg min-h-screen">
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(240,145,58,0.2)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(240,145,58,0.15) 0%, transparent 70%)" }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Performance Dashboard</h1>
          <p className="max-w-2xl" style={{ color: "#94a3b8" }}>
            Every Exam Mode attempt, tracked over time — where you stand per paper and which chapters need another pass.
          </p>
          {!user && history.length > 0 && (
            <p className="max-w-2xl text-sm mt-3 px-4 py-3 rounded-xl" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }}>
              You&apos;re not signed in — this history lives on this device only.{" "}
              <Link href="/signup" className="underline">Create a free account</Link> to keep it across devices.
            </p>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 flex flex-col gap-10">
        {/* Deliberately OUTSIDE the exam-history branch. A student who has only
            sat the screening practice has attempts — just not Exam Mode ones —
            and hiding their results behind an "no attempts yet" card would be
            wrong, and would break the promise made when they signed up. */}
        <AdaptPanel userId={user?.id ?? null} />

        {history.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-2xl font-extrabold mb-2">No Exam Mode attempts yet</h2>
            <p className="mb-8" style={{ color: "#94a3b8" }}>
              Sit a full-length paper in Exam Mode and your score history, trend, and weak chapters will show up here.
            </p>
            <Link href="/exam" className="inline-flex items-center gap-2 py-3 px-5 rounded-xl font-bold no-underline"
                  style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}>
              <FileCheck className="w-4 h-4" /> Go to Exam Mode
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Score trend per paper */}
            <section>
              <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: "#f0913a" }} /> Score Trend
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...byPaper.entries()].map(([paperId, attempts]) => {
                  const paper = getExamPaper(paperId);
                  return (
                    <div key={paperId} className="glass-card p-5">
                      <div className="font-bold text-white mb-1">{paper?.shortTitle ?? paperId}</div>
                      <div className="text-xs mb-3" style={{ color: "#64748b" }}>{attempts.length} attempt{attempts.length === 1 ? "" : "s"}</div>
                      <ScoreTrend attempts={attempts} passMark={paper?.passMark ?? 70} />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Weak chapters */}
            {weak.length > 0 && (
              <section>
                <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" style={{ color: "#f59e0b" }} /> Weakest Chapters
                </h2>
                <div className="glass-card p-6">
                  <WeakChapterBars
                    items={weak}
                    // CPL first, then the ATPL map — an aggregate list mixes both
                    // tracks, and ATPL-only chapter ids (aar-N, amet-N…) only
                    // resolve in the ATPL map. Bank ids keep their existing
                    // CPL-terms labels (pre-2026-10-17 behaviour) so the label
                    // shown and the link opened always agree.
                    labelFor={id => {
                      const cpl = labelsFor(id, "cpl");
                      if (cpl && cpl.length) return cpl.join(" / ");
                      const atpl = labelsFor(id, "atpl");
                      return atpl && atpl.length ? atpl.join(" / ") : undefined;
                    }}
                    hrefFor={id => hrefFor(id, "cpl") ?? hrefFor(id, "atpl")}
                  />
                  <p className="text-xs mt-4" style={{ color: "#475569" }}>
                    Based on your answers within Exam Mode attempts, chapters seen 3+ times. Rows marked revise → open the chapter notes.
                  </p>
                </div>
              </section>
            )}

            {/* Recent attempts */}
            <section>
              <h2 className="text-xl font-black text-white mb-5 flex items-center gap-2">
                <Trophy className="w-5 h-5" style={{ color: "#f0913a" }} /> Recent Attempts
              </h2>
              <div className="glass-card overflow-hidden">
                {recent.map((a, i) => {
                  const paper = getExamPaper(a.paperId);
                  const passed = a.scorePct >= (paper?.passMark ?? 70);
                  // Sittings from Phase 2 (2026-10-17) carry the answer trace and
                  // open the question-by-question review; older ones fall back to
                  // the paper page, exactly as they did before review mode existed.
                  const reviewable = Array.isArray(a.review) && a.review.length > 0;
                  return (
                    <div key={a.id} className="flex items-center gap-3 px-5 py-4"
                         style={{ borderBottom: i < recent.length - 1 ? "1px solid rgba(255,255,255,0.06)" : undefined }}>
                      <Link href={reviewable ? `/dashboard/review/${a.id}` : `/exam/${a.paperId}`}
                            className="flex items-center gap-3 no-underline min-w-0 flex-1">
                        {passed
                          ? <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#22c55e" }} />
                          : <XCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#ef4444" }} />}
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate">{paper?.shortTitle ?? a.paperId}</div>
                          <div className="text-xs" style={{ color: "#64748b" }}>{fmtDate(a.createdAt)} · {a.correctCount}/{a.totalCount} correct</div>
                        </div>
                      </Link>
                      {reviewable && (
                        <Link href={`/dashboard/review/${a.id}`}
                              className="text-xs font-bold px-2.5 py-1 rounded-full no-underline flex-shrink-0"
                              style={{ color: "#f0913a", border: "1px solid rgba(240,145,58,0.35)", background: "rgba(240,145,58,0.06)" }}>
                          Review
                        </Link>
                      )}
                      {reviewable && (
                        <Link href={`/exam/${a.paperId}`} title="Retake this paper"
                              aria-label={`Retake ${paper?.title ?? a.paperId}`}
                              className="p-1.5 rounded-lg no-underline flex-shrink-0 hidden sm:inline-flex"
                              style={{ color: "#64748b", border: "1px solid rgba(255,255,255,0.1)" }}>
                          <RotateCcw className="w-3.5 h-3.5" />
                        </Link>
                      )}
                      <div className="text-lg font-black flex-shrink-0" style={{ color: passed ? "#22c55e" : "#ef4444" }}>{a.scorePct}%</div>
                    </div>
                  );
                })}
              </div>
            </section>

            <p className="text-xs text-center" style={{ color: "#334155" }}>
              {EXAM_PAPERS.length} papers available in Exam Mode · attempt history capped at your last 50 sittings on this device
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
