"use client";
import { useState, useCallback, useMemo, useRef } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight, RotateCcw, BookOpen, Target } from "lucide-react";
import { getSubjectQuestionPool } from "@/lib/questions";
import { isRealExplanation } from "@/lib/explanation";
import { useDeadlineCountdown, MIN_QUESTIONS_FOR_VERDICT } from "@/lib/progress";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import { CHAPTER_LABELS, chapterLabel } from "@/lib/chapter-labels";
import { siteChapterLabelForAirRegsSubject, siteChaptersForAirRegsBank } from "@/lib/air-regs-chapter-label";
import { addMistakes, type MistakeSaveResult } from "@/lib/mistakes";

// Unified shape used by the exam UI.
type MockQ = {
  q: string;
  opts: string[];
  ans: number;
  exp: string;
  subjectId: string;
  subject: string;
  chapterId?: string;
  chapterLabel: string;
};

// NOTE: a hardcoded 10-question GENERIC_QUESTIONS array used to live here for
// the no-?subject= case. It was superseded by getSubjectQuestionPool and became
// unreachable. Removed 2026-07-26 (recoverable from git). Those 10 questions
// never went through the answer-verification protocol, so do not restore them
// without an audit first — see the Iron Rules in D:\pk\CLAUDE.md.

const SUBJECT_MAP = (() => {
  const m: Record<string, (typeof CPL_SUBJECTS)[number]> = {};
  for (const s of [...CPL_SUBJECTS, ...ATPL_SUBJECTS]) m[s.id] = s;
  return m;
})();

const TYPE_LABEL: Record<string, string> = {
  mid:    "Mid-Subject Test",
  full:   "Full Subject Test",
  sample: "Random Practice Paper",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Air Regulations questions carry a BANK chapter id, which can spell the same
// as a different SITE chapter. Translate it at read time for both CPL and ATPL.
function labelForQuestion(subjectId: string, chapterId?: string): string {
  if (subjectId === "air-regulations" || subjectId === "atpl-air-regulations") {
    return (
      siteChapterLabelForAirRegsSubject(subjectId, chapterId ?? "", (id) => CHAPTER_LABELS[id]) ??
      chapterLabel(chapterId)
    );
  }
  return chapterLabel(chapterId);
}

type TestConfig = {
  questions: MockQ[];
  /** How many questions the subject holds in total (the test may be a slice of it). */
  poolSize: number;
  durationSec: number;
  title: string;
  subtitle: string;
  passMark: number;
  backHref: string;
  sourceDetail: string;
};

function buildConfig(subjectId: string | null, type: string | null): TestConfig {
  const subject = subjectId ? SUBJECT_MAP[subjectId] : undefined;

  // No subject (or unknown) → return 404 since generic mock-test page is removed.
  if (!subject) {
    notFound();
  }

  const label = TYPE_LABEL[type ?? ""] ?? "Subject Test";
  const pool = getSubjectQuestionPool(subject.id);

  // mid-subject = shorter sitting; full / sample = exam-length.
  const targetCount = type === "mid" ? 40 : subject.totalQuestions;
  const durationMin = type === "mid" ? 45 : subject.examDuration;

  const questions = shuffle(pool)
    .slice(0, Math.min(targetCount, pool.length))
    .map(q => ({
      q: q.q,
      opts: q.opts,
      ans: q.ans,
      exp: q.exp,
      subjectId: subject.id,
      subject: subject.shortName,
      chapterId: q.chapterId,
      chapterLabel: labelForQuestion(subject.id, q.chapterId),
    }));

  const track = CPL_SUBJECTS.some(s => s.id === subject.id) ? "cpl" : "atpl";

  return {
    questions,
    poolSize: pool.length,
    durationSec: durationMin * 60,
    title: `${subject.name} — ${label}`,
    subtitle: `${subject.shortName} · ${questions.length} questions drawn at random from the question bank`,
    passMark: subject.passMark,
    backHref: `/${track}/${subject.id}`,
    sourceDetail: `${subject.shortName} · ${label}`,
  };
}

type Phase = "setup" | "exam" | "result";

type MockTestClientProps = {
  subjectId: string;
  type: string | null;
};

export default function MockTestClient({ subjectId, type }: MockTestClientProps) {
  // Built once per subject/type combination (stable across the sitting).
  const config = useMemo(() => buildConfig(subjectId, type), [subjectId, type]);
  const { questions, poolSize, durationSec, title, subtitle, passMark, backHref, sourceDetail } = config;

  const [phase, setPhase]       = useState<Phase>("setup");
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [revealed, setRevealed] = useState(false);
  const [flagged, setFlagged]   = useState<boolean[]>(Array(questions.length).fill(false));
  const [reviewFilter, setReviewFilter] = useState<"all" | "wrong" | "flagged">("all");
  const [mistakeSave, setMistakeSave] = useState<MistakeSaveResult | "failed" | null>(null);
  const savedMistakes = useRef(false);

  const submit = useCallback(() => {
    // The timer and the last-question button can both call submit in the same
    // sitting. Save once, with the answers as they stand at submission.
    if (savedMistakes.current) return;
    savedMistakes.current = true;

    const missed = questions.flatMap((rq, i) =>
      answers[i] === rq.ans
        ? []
        : [{
            key: rq.q,
            subjectId: rq.subjectId,
            subjectName: rq.subject,
            chapterId: rq.chapterId,
            chapterLabel: rq.chapterLabel,
            q: rq.q,
            opts: rq.opts,
            ans: rq.ans,
            exp: rq.exp,
            userAnswer: answers[i],
            source: "mock-test" as const,
            sourceDetail,
          }],
    );
    const result = addMistakes(missed);
    setMistakeSave(result ?? "failed");
    setPhase("result");
  }, [answers, questions, sourceDetail]);
  // Deadline-based: the end time is fixed at Start and the clock is re-read on
  // every tick and on visibilitychange, so a locked phone cannot gain time.
  const { timeLeft, start: startClock, reset: resetClock } = useDeadlineCountdown(phase === "exam", durationSec, submit);

  const q = questions[current];
  const answered = answers.filter(a => a !== null).length;
  const score    = answers.filter((a, i) => a === questions[i]?.ans).length;
  const pct      = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed   = pct >= passMark;
  const timeUsed = Math.max(0, durationSec - timeLeft);
  const wrongCount = questions.filter((rq, i) => answers[i] !== rq.ans).length;
  const flaggedCount = flagged.filter(Boolean).length;

  // A sitting is only useful if it says where the marks went. Group by the
  // chapter the question actually came from and put the weakest chapter first.
  const chapterStats = useMemo(() => {
    const map = new Map<string, { key: string; label: string; correct: number; total: number }>();
    questions.forEach((rq, i) => {
      const key = rq.chapterId ?? "__none__";
      const stat = map.get(key) ?? { key, label: rq.chapterLabel, correct: 0, total: 0 };
      stat.total += 1;
      if (answers[i] === rq.ans) stat.correct += 1;
      map.set(key, stat);
    });
    return [...map.values()].sort(
      (a, b) => a.correct / a.total - b.correct / b.total || a.label.localeCompare(b.label),
    );
  }, [questions, answers]);

  const focusChapter = chapterStats.find(s => s.total >= 2 && s.correct / s.total < 0.7) ?? null;
  const focusSubject = [...CPL_SUBJECTS, ...ATPL_SUBJECTS].find(s => s.id === subjectId);
  const focusTrack = CPL_SUBJECTS.some(s => s.id === subjectId) ? "cpl" : "atpl";
  const focusSiteChapters = !focusChapter || !focusSubject
    ? []
    : subjectId === "air-regulations" || subjectId === "atpl-air-regulations"
      ? siteChaptersForAirRegsBank(subjectId, focusChapter.key)
      : focusSubject.chapters.some(c => c.id === focusChapter.key)
        ? [focusChapter.key]
        : [];
  const focusHref = focusSiteChapters.length === 1
    ? `/${focusTrack}/${subjectId}/${focusSiteChapters[0]}/questions`
    : null;

  // One-question chapters are too thin to read as a trend. Keep the real
  // chapters separate and fold the singletons into one honest aggregate row.
  const groupedChapterStats = useMemo(() => {
    const meaningful = chapterStats.filter(s => s.total >= 2);
    const singles = chapterStats.filter(s => s.total === 1);
    const grouped = [...meaningful];
    if (singles.length > 0) {
      grouped.push({
        key: "__single__",
        label: `Other single-question chapters (${singles.length})`,
        correct: singles.reduce((sum, s) => sum + s.correct, 0),
        total: singles.length,
      });
    }
    // The heading says "Weakest first", so the grouped singleton row must be
    // sorted with the real chapters, not appended regardless of its accuracy.
    return grouped.sort(
      (a, b) => a.correct / a.total - b.correct / b.total || a.label.localeCompare(b.label),
    );
  }, [chapterStats]);

  const reviewItems = questions
    .map((rq, i) => ({ rq, i }))
    .filter(({ rq, i }) => {
      if (reviewFilter === "wrong") return answers[i] !== rq.ans;
      if (reviewFilter === "flagged") return flagged[i];
      return true;
    });

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

  function selectAnswer(idx: number) {
    if (answers[current] !== null) return;
    const next = [...answers];
    next[current] = idx;
    setAnswers(next);
    setRevealed(true);
  }

  function next() {
    setRevealed(false);
    if (current < questions.length - 1) setCurrent(c => c + 1);
    else submit();
  }

  function restart() {
    savedMistakes.current = false;
    setMistakeSave(null);
    setPhase("setup"); setCurrent(0); resetClock(durationSec);
    setAnswers(Array(questions.length).fill(null));
    setRevealed(false);
    setFlagged(Array(questions.length).fill(false));
    setReviewFilter("all");
  }

  /* ── NOT ENOUGH QUESTIONS (none yet, or too few for a score to mean anything) ──
     A "Congratulations! You Passed!" on 100% of one question is a false claim,
     so below the minimum no test is run at all. */
  if (poolSize < MIN_QUESTIONS_FOR_VERDICT || questions.length === 0) return (
    <div className="grid-bg min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">📝</div>
        <h1 className="text-2xl font-extrabold mb-2">{title}</h1>
        <p className="mb-8" style={{ color: "#94a3b8" }}>
          {poolSize === 0 || poolSize >= MIN_QUESTIONS_FOR_VERDICT
            ? "The question bank for this paper is still being prepared. Try the chapter quizzes in the meantime."
            : `Not enough questions yet. This test needs at least ${MIN_QUESTIONS_FOR_VERDICT} questions and the bank holds ${poolSize} so far, too few for a score to mean anything.`}
        </p>
        <Link href={backHref} className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold no-underline"
              style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}>
          <BookOpen className="w-4 h-4" /> Back to Chapters
        </Link>
      </div>
    </div>
  );

  /* ── SETUP ── */
  if (phase === "setup") return (
    <div className="grid-bg min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-lg w-full text-center">
        <div className="text-5xl mb-4">✈️</div>
        <h1 className="text-3xl font-extrabold mb-2">{title}</h1>
        <p className="mb-8" style={{ color: "#94a3b8" }}>{subtitle} · {passMark}% required to pass.</p>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[["Questions", `${questions.length}`], ["Duration", `${Math.round(durationSec / 60)} min`], ["Pass Mark", `${passMark}%`]].map(([l, v]) => (
            <div key={l} className="glass-card p-3">
              <div className="text-xl font-bold" style={{ color: "#f0913a" }}>{v}</div>
              <div className="text-xs" style={{ color: "#64748b" }}>{l}</div>
            </div>
          ))}
        </div>
        <ul className="text-left mb-8 flex flex-col gap-2">
          {["Each question has one correct answer","You cannot go back after answering","Unanswered questions count as wrong","Timer starts immediately"].map(item => (
            <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "#94a3b8" }}>
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }} /> {item}
            </li>
          ))}
        </ul>
        <button onClick={() => { startClock(durationSec); setPhase("exam"); }}
                className="w-full py-4 rounded-xl font-bold text-lg"
                style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}>
          Start Test
        </button>
      </div>
    </div>
  );

  /* ── RESULT ── */
  if (phase === "result") return (
    <div className="grid-bg min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-10 text-center mb-8">
          <div className="text-6xl mb-4">{passed ? "🎉" : "😔"}</div>
          <h2 className="text-3xl font-extrabold mb-2">{passed ? "Congratulations! You Passed!" : "Keep Practising!"}</h2>
          <p className="mb-8" style={{ color: "#94a3b8" }}>
            {passed ? `You cleared the ${passMark}% benchmark. Great work!` : `You need ${passMark}% to pass. Review the explanations below.`}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[["Score", `${pct}%`, passed ? "#22c55e" : "#ef4444"],
              ["Correct", `${score}/${questions.length}`, "#f0913a"],
              ["Time", fmt(timeUsed), "#f0913a"],
              ["Status", passed ? "PASS" : "FAIL", passed ? "#22c55e" : "#ef4444"]].map(([l, v, c]) => (
              <div key={l} className="glass-card p-4">
                <div className="text-2xl font-bold" style={{ color: c }}>{v}</div>
                <div className="text-xs" style={{ color: "#64748b" }}>{l}</div>
              </div>
            ))}
          </div>

          <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
            {wrongCount} wrong or unanswered{flaggedCount > 0 ? ` · ${flaggedCount} flagged for review` : ""}
          </p>

          <div className="rounded-xl p-4 mb-8 text-left flex flex-col sm:flex-row sm:items-center gap-4"
               style={{ background: "rgba(240,145,58,0.06)", border: "1px solid rgba(240,145,58,0.22)" }}>
            <div className="flex-1">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4" style={{ color: "#f0913a" }} /> Mistakes Bank
              </div>
              <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                {wrongCount === 0
                  ? "No wrong or unanswered questions in this sitting."
                  : mistakeSave === "failed"
                    ? "This browser blocked local storage, so these answers were not saved. You can still review them below."
                    : mistakeSave
                      ? `${mistakeSave.added} new${mistakeSave.updated > 0 ? `, ${mistakeSave.updated} repeat` : ""} saved on this device. Review them with the explanations.`
                      : "Wrong and unanswered questions are saved on this device."}
              </p>
            </div>
            <Link href="/mistakes" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold no-underline flex-shrink-0"
                  style={{ border: "1px solid rgba(240,145,58,0.3)", color: "#f0913a", background: "rgba(240,145,58,0.06)" }}>
              Open Mistakes Bank <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={restart}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                    style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}>
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <Link href={backHref} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold no-underline"
                  style={{ border: "1px solid rgba(240,145,58,0.3)", color: "#f0913a", background: "rgba(240,145,58,0.06)" }}>
              <BookOpen className="w-4 h-4" /> Back to Chapters
            </Link>
          </div>
        </div>

        {groupedChapterStats.length > 1 && (
          <div className="glass-card p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="text-lg font-bold">Chapter breakdown</h3>
              <span className="text-xs" style={{ color: "#64748b" }}>Weakest first</span>
            </div>
            <div className="flex flex-col gap-4">
              {groupedChapterStats.map(stat => {
                const chapterPct = Math.round((stat.correct / stat.total) * 100);
                const color = chapterPct >= 70 ? "#22c55e" : chapterPct >= 50 ? "#f59e0b" : "#ef4444";
                return (
                  <div key={stat.key}>
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <span className="text-sm" style={{ color: "#94a3b8" }}>{stat.label}</span>
                      <span className="text-xs font-bold flex-shrink-0" style={{ color }}>
                        {stat.correct}/{stat.total} · {chapterPct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "rgba(240,145,58,0.1)" }}>
                      <div className="h-2 rounded-full" style={{ width: `${chapterPct}%`, background: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {focusChapter && (
              <div className="mt-5 p-4 rounded-xl"
                   style={{ background: "rgba(240,145,58,0.05)", border: "1px solid rgba(240,145,58,0.15)" }}>
                <div className="text-sm font-bold mb-1">Focus next: {focusChapter.label}</div>
                <div className="text-xs mb-3" style={{ color: "#94a3b8" }}>
                  You scored {Math.round((focusChapter.correct / focusChapter.total) * 100)}% here. Revise the chapter, then try another sitting.
                </div>
                <Link href={focusHref ?? backHref} className="text-sm font-bold no-underline" style={{ color: "#f0913a" }}>
                  {focusHref ? `Open ${focusChapter.label} questions →` : `Back to ${title.split(" — ")[0]} →`}
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Review */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h3 className="text-xl font-bold">Review Answers</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all" as const, label: `All (${questions.length})` },
              { value: "wrong" as const, label: `Wrong (${wrongCount})` },
              ...(flaggedCount > 0 ? [{ value: "flagged" as const, label: `Flagged (${flaggedCount})` }] : []),
            ].map(f => (
              <button key={f.value} type="button" onClick={() => setReviewFilter(f.value)}
                      aria-pressed={reviewFilter === f.value}
                      className="px-3 py-1.5 rounded-full text-xs font-bold"
                      style={reviewFilter === f.value
                        ? { background: "rgba(240,145,58,0.15)", border: "1px solid rgba(240,145,58,0.4)", color: "#f0913a" }
                        : { background: "transparent", border: "1px solid rgba(148,163,184,0.2)", color: "#94a3b8" }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {reviewItems.length === 0 && (
            <div className="glass-card p-6 text-sm" style={{ color: "#94a3b8" }}>
              {reviewFilter === "wrong"
                ? "No wrong or unanswered questions in this sitting. Every question was correct."
                : "No flagged questions in this sitting."}
            </div>
          )}
          {reviewItems.map(({ rq, i }) => {
            const userAns = answers[i];
            const isRight = userAns === rq.ans;
            return (
              <div key={i} className="glass-card p-6">
                <div className="flex items-start gap-3 mb-4">
                  {isRight
                    ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#22c55e" }} />
                    : <XCircle    className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />}
                  <div>
                    <div className="text-xs mb-1 flex flex-wrap items-center gap-2" style={{ color: "#475569" }}>
                      <span>Q{i + 1} · {rq.subject} · {rq.chapterLabel}</span>
                      {flagged[i] && <span style={{ color: "#f59e0b" }}>🚩 Flagged</span>}
                    </div>
                    <p className="text-sm font-medium">{rq.q}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  {rq.opts.map((opt, oi) => (
                    <div key={oi} className="px-4 py-2 rounded-lg text-sm"
                         style={{
                           background: oi === rq.ans ? "rgba(34,197,94,0.15)"
                                     : oi === userAns  ? "rgba(239,68,68,0.15)" : "rgba(13,13,26,0.5)",
                           border: oi === rq.ans ? "1px solid #22c55e"
                                 : oi === userAns  ? "1px solid #ef4444" : "1px solid rgba(240,145,58,0.1)",
                           color: oi === rq.ans ? "#22c55e" : oi === userAns ? "#ef4444" : "#94a3b8",
                         }}>
                      {String.fromCharCode(65 + oi)}. {opt}
                    </div>
                  ))}
                </div>
                {isRealExplanation(rq.exp) && (
                  <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(240,145,58,0.05)", border: "1px solid rgba(240,145,58,0.15)", color: "#94a3b8" }}>
                    💡 {rq.exp}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ── EXAM ── */
  const optClass = (oi: number) => {
    if (!revealed) return "option-btn";
    if (oi === q.ans) return "option-btn correct";
    if (oi === answers[current]) return "option-btn wrong";
    return "option-btn";
  };

  return (
    <div className="grid-bg min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header bar */}
        <div className="glass-card px-6 py-4 flex items-center justify-between mb-6">
          <div className="text-sm font-medium" style={{ color: "#94a3b8" }}>
            Question <span style={{ color: "#f0913a" }}>{current + 1}</span> / {questions.length}
          </div>
          <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 300 ? "timer-urgent" : ""}`}
               style={{ color: timeLeft < 300 ? "#ef4444" : "#f0913a" }}>
            <Clock className="w-5 h-5" /> {fmt(timeLeft)}
          </div>
          <div className="text-sm" style={{ color: "#94a3b8" }}>
            {answered} answered
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-1 rounded-full mb-6" style={{ background: "rgba(240,145,58,0.1)" }}>
          <div className="h-1 rounded-full transition-all duration-500"
               style={{ width: `${((current + 1) / questions.length) * 100}%`, background: "linear-gradient(90deg,#f0913a,#ab794d)" }} />
        </div>

        {/* Question card */}
        <div className="glass-card p-8 mb-4">
          <div className="text-xs mb-4 px-2 py-1 rounded-full inline-block"
               style={{ background: "rgba(240,145,58,0.1)", color: "#f0913a", border: "1px solid rgba(240,145,58,0.2)" }}>
            {q.subject}
          </div>
          <p className="text-lg font-semibold mb-8 leading-relaxed">{q.q}</p>
          <div className="flex flex-col gap-3">
            {q.opts.map((opt, oi) => (
              <button key={oi} className={optClass(oi)} onClick={() => selectAnswer(oi)} disabled={revealed}
                      aria-pressed={answers[current] === oi}
                      aria-label={revealed
                        ? `${String.fromCharCode(65 + oi)}. ${opt}${oi === q.ans ? " (correct answer)" : oi === answers[current] ? " (your answer, incorrect)" : ""}`
                        : undefined}>
                <span className="font-bold mr-3" style={{ color: "#475569" }}>{String.fromCharCode(65 + oi)}.</span>
                {opt}
                {revealed && oi === q.ans && <CheckCircle aria-hidden className="inline w-4 h-4 ml-2 align-text-bottom" />}
                {revealed && oi !== q.ans && oi === answers[current] && <XCircle aria-hidden className="inline w-4 h-4 ml-2 align-text-bottom" />}
              </button>
            ))}
          </div>

          {/* Explanation */}
          {revealed && isRealExplanation(q.exp) && (
            <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: "rgba(240,145,58,0.05)", border: "1px solid rgba(240,145,58,0.2)", color: "#94a3b8" }}>
              <span className="font-semibold" style={{ color: "#f0913a" }}>💡 Explanation: </span>
              {q.exp}
            </div>
          )}
        </div>

        {/* Next button */}
        {revealed && (
          <button onClick={next}
                  className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#f0913a,#0099cc)", color: "#000" }}>
            {current < questions.length - 1 ? <><ArrowRight className="w-5 h-5" /> Next Question</> : "Submit & See Results"}
          </button>
        )}

        {/* Flag / Skip */}
        {!revealed && (
          <div className="flex gap-3 mt-4">
            <button onClick={() => { const f = [...flagged]; f[current] = !f[current]; setFlagged(f); }}
                    aria-pressed={flagged[current]}
                    className="flex-1 py-3 rounded-xl text-sm font-medium"
                    style={{ border: `1px solid ${flagged[current] ? "#f59e0b" : "rgba(240,145,58,0.2)"}`, color: flagged[current] ? "#f59e0b" : "#64748b", background: "transparent" }}>
              {flagged[current] ? "🚩 Flagged" : "🏳️ Flag Question"}
            </button>
            <button onClick={next}
                    className="flex-1 py-3 rounded-xl text-sm font-medium"
                    style={{ border: "1px solid rgba(240,145,58,0.2)", color: "#64748b", background: "transparent" }}>
              Skip →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


