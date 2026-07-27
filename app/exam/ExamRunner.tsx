"use client";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight, RotateCcw, BookOpen, Flag } from "lucide-react";
import type { ExamPaper } from "@/lib/exam-papers";
import { getPaperQuestionPool } from "@/lib/exam-papers";
import { recordExamAttempt, type ChapterBreakdown } from "@/lib/exam-history";
import LiveClassUpsell from "@/app/components/LiveClassUpsell";

type Phase = "setup" | "exam" | "result";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ExamRunner({ paper }: { paper: ExamPaper }) {
  // Composed once per mount — retaking the exam (restart) reshuffles for variety.
  const [seed, setSeed] = useState(0);
  const questions = useMemo(() => {
    const pool = getPaperQuestionPool(paper);
    return shuffle(pool).slice(0, Math.min(paper.questionCount, pool.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paper, seed]);

  const durationSec = paper.durationMin * 60;
  const [phase, setPhase] = useState<Phase>("setup");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(questions.length).fill(null));
  const [flagged, setFlagged] = useState<boolean[]>(() => Array(questions.length).fill(false));
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const startedAtRef = useRef<number | null>(null);
  const recorded = useRef(false);

  const submit = useCallback(() => setPhase("result"), []);

  useEffect(() => {
    if (phase !== "exam") return;
    // A countdown that expires MUST change state from an effect — the trigger is
    // time passing, not a user action or a render. This is the legitimate case
    // the rule cannot distinguish. It cannot double-submit: submit() flips phase,
    // after which this effect early-returns above.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (timeLeft <= 0) { submit(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, submit]);

  const answeredCount = answers.filter(a => a !== null).length;
  const score = answers.filter((a, i) => a === questions[i]?.ans).length;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed = pct >= paper.passMark;
  const urgent = timeLeft < 300;

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // Record the attempt once, when results appear — answers are never revealed
  // mid-paper (real DGCA CBT format), only in this final review.
  useEffect(() => {
    if (phase !== "result" || recorded.current || questions.length === 0) return;
    recorded.current = true;
    const chapterBreakdown: ChapterBreakdown = {};
    questions.forEach((q, i) => {
      if (!q.chapterId) return;
      const cur = chapterBreakdown[q.chapterId] ?? { correct: 0, total: 0 };
      cur.total += 1;
      if (answers[i] === q.ans) cur.correct += 1;
      chapterBreakdown[q.chapterId] = cur;
    });
    recordExamAttempt({
      paperId: paper.id,
      track: paper.track,
      scorePct: pct,
      correctCount: score,
      totalCount: questions.length,
      durationTakenSec: startedAtRef.current ? Math.round((Date.now() - startedAtRef.current) / 1000) : durationSec - timeLeft,
      chapterBreakdown,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function selectAnswer(oi: number) {
    const next = [...answers];
    next[current] = oi;
    setAnswers(next);
  }

  function goto(i: number) {
    setCurrent(Math.max(0, Math.min(questions.length - 1, i)));
  }

  function toggleFlag() {
    const f = [...flagged];
    f[current] = !f[current];
    setFlagged(f);
  }

  function restart() {
    setSeed(s => s + 1);
    setPhase("setup");
    setCurrent(0);
    setTimeLeft(durationSec);
    setAnswers(Array(questions.length).fill(null));
    setFlagged(Array(questions.length).fill(false));
    recorded.current = false;
    startedAtRef.current = null;
    window.scrollTo(0, 0);
  }

  const track = paper.track;
  const backHref = track === "cpl" ? "/exam" : "/exam";

  /* ── EMPTY (bank not deep enough for this paper yet) ── */
  if (questions.length === 0) return (
    <div className="grid-bg min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">📝</div>
        <h1 className="text-2xl font-extrabold mb-2">{paper.title}</h1>
        <p className="mb-8" style={{ color: "#94a3b8" }}>
          The question bank for this paper is still being prepared. Try the chapter quizzes in the meantime.
        </p>
        <Link href="/exam" className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold no-underline"
              style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
          <BookOpen className="w-4 h-4" /> All Papers
        </Link>
      </div>
    </div>
  );

  /* ── SETUP ── */
  if (phase === "setup") return (
    <div className="grid-bg min-h-screen flex items-center justify-center px-4 py-16">
      <div className="glass-card p-10 max-w-lg w-full text-center">
        <div className="text-5xl mb-4">✈️</div>
        <h1 className="text-3xl font-extrabold mb-2">{paper.title}</h1>
        <p className="mb-2" style={{ color: "#94a3b8" }}>Real DGCA format · {paper.passMark}% required to pass.</p>
        {paper.note && (
          <p className="mb-6 text-xs px-4 py-3 rounded-xl text-left" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24" }}>
            {paper.note}
          </p>
        )}
        <div className="grid grid-cols-3 gap-4 mb-8 mt-6">
          {[["Questions", `${questions.length}`], ["Duration", `${paper.durationMin} min`], ["Pass Mark", `${paper.passMark}%`]].map(([l, v]) => (
            <div key={l} className="glass-card p-3">
              <div className="text-xl font-bold" style={{ color: "#00d4ff" }}>{v}</div>
              <div className="text-xs" style={{ color: "#64748b" }}>{l}</div>
            </div>
          ))}
        </div>
        <ul className="text-left mb-8 flex flex-col gap-2">
          {["Each question has one correct answer", "No negative marking — attempt every question", "You can move between questions and flag ones to revisit", "Answers are shown only after you submit the whole paper", "Timer starts immediately and auto-submits at zero"].map(item => (
            <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "#94a3b8" }}>
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }} /> {item}
            </li>
          ))}
        </ul>
        <button onClick={() => { startedAtRef.current = Date.now(); setPhase("exam"); window.scrollTo(0, 0); }}
                className="w-full py-4 rounded-xl font-bold text-lg"
                style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
          Start Exam
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
            {passed ? `You cleared the ${paper.passMark}% benchmark on ${paper.title}. Great work!` : `You need ${paper.passMark}% to pass ${paper.title}. Review the explanations below.`}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[["Score", `${pct}%`, passed ? "#22c55e" : "#ef4444"],
              ["Correct", `${score}/${questions.length}`, "#00d4ff"],
              ["Status", passed ? "PASS" : "FAIL", passed ? "#22c55e" : "#ef4444"]].map(([l, v, c]) => (
              <div key={l} className="glass-card p-4">
                <div className="text-2xl font-bold" style={{ color: c }}>{v}</div>
                <div className="text-xs" style={{ color: "#64748b" }}>{l}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={restart}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                    style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
              <RotateCcw className="w-4 h-4" /> Retake Exam
            </button>
            <Link href="/dashboard" className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold no-underline"
                  style={{ border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", background: "rgba(0,212,255,0.06)" }}>
              View Dashboard
            </Link>
            <Link href={backHref} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold no-underline"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
              <BookOpen className="w-4 h-4" /> All Papers
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <LiveClassUpsell subjectId={paper.subjectIds[0]} subjectColor="#00d4ff" />
        </div>

        <h3 className="text-xl font-bold mb-4">Answer Review</h3>
        <div className="flex flex-col gap-4">
          {questions.map((rq, i) => {
            const userAns = answers[i];
            const isRight = userAns === rq.ans;
            return (
              <div key={i} className="glass-card p-6">
                <div className="flex items-start gap-3 mb-4">
                  {isRight
                    ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#22c55e" }} />
                    : <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />}
                  <div>
                    <div className="text-xs mb-1" style={{ color: "#475569" }}>Q{i + 1}{flagged[i] ? " · 🚩 flagged" : ""}</div>
                    <p className="text-sm font-medium">{rq.q}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  {rq.opts.map((opt, oi) => (
                    <div key={oi} className="px-4 py-2 rounded-lg text-sm"
                         style={{
                           background: oi === rq.ans ? "rgba(34,197,94,0.15)" : oi === userAns ? "rgba(239,68,68,0.15)" : "rgba(13,13,26,0.5)",
                           border: oi === rq.ans ? "1px solid #22c55e" : oi === userAns ? "1px solid #ef4444" : "1px solid rgba(0,212,255,0.1)",
                           color: oi === rq.ans ? "#22c55e" : oi === userAns ? "#ef4444" : "#94a3b8",
                         }}>
                      {String.fromCharCode(65 + oi)}. {opt}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", color: "#94a3b8" }}>
                  💡 {rq.exp}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ── EXAM (no reveal — real DGCA CBT behaviour) ── */
  const q = questions[current];
  const chosen = answers[current];
  return (
    <div className="grid-bg min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header bar */}
        <div className="glass-card px-6 py-4 flex items-center justify-between mb-6 flex-wrap gap-2">
          <div className="text-sm font-medium" style={{ color: "#94a3b8" }}>
            Question <span style={{ color: "#00d4ff" }}>{current + 1}</span> / {questions.length}
          </div>
          <div className={`flex items-center gap-2 font-mono text-lg font-bold ${urgent ? "timer-urgent" : ""}`}
               style={{ color: urgent ? "#ef4444" : "#00d4ff" }}>
            <Clock className="w-5 h-5" /> {fmt(timeLeft)}
          </div>
          <div className="text-sm" style={{ color: "#94a3b8" }}>{answeredCount} answered</div>
        </div>

        {/* Progress */}
        <div className="w-full h-1 rounded-full mb-6" style={{ background: "rgba(0,212,255,0.1)" }}>
          <div className="h-1 rounded-full transition-all duration-500"
               style={{ width: `${((current + 1) / questions.length) * 100}%`, background: "linear-gradient(90deg,#00d4ff,#7c3aed)" }} />
        </div>

        {/* Question map */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {questions.map((_, i) => (
            <button key={i} onClick={() => goto(i)}
                    className="w-7 h-7 rounded-md text-xs font-bold flex items-center justify-center"
                    style={{
                      background: i === current ? "rgba(0,212,255,0.25)" : answers[i] !== null ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                      border: flagged[i] ? "1px solid #f59e0b" : i === current ? "1px solid #00d4ff" : "1px solid rgba(255,255,255,0.08)",
                      color: i === current ? "#00d4ff" : answers[i] !== null ? "#22c55e" : "#64748b",
                      cursor: "pointer",
                    }}>
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question card */}
        <div className="glass-card p-8 mb-4">
          <p className="text-lg font-semibold mb-8 leading-relaxed">{q.q}</p>
          <div className="flex flex-col gap-3">
            {q.opts.map((opt, oi) => (
              <button key={oi} className={`option-btn ${chosen === oi ? "selected" : ""}`} onClick={() => selectAnswer(oi)}>
                <span className="font-bold mr-3" style={{ color: "#475569" }}>{String.fromCharCode(65 + oi)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          <button onClick={() => goto(current - 1)} disabled={current === 0}
                  className="flex-1 py-3 rounded-xl text-sm font-medium disabled:opacity-30"
                  style={{ border: "1px solid rgba(0,212,255,0.2)", color: "#64748b", background: "transparent" }}>
            ← Previous
          </button>
          <button onClick={toggleFlag}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ border: `1px solid ${flagged[current] ? "#f59e0b" : "rgba(0,212,255,0.2)"}`, color: flagged[current] ? "#f59e0b" : "#64748b", background: "transparent" }}>
            <Flag className="w-4 h-4" /> {flagged[current] ? "Flagged" : "Flag"}
          </button>
          {current < questions.length - 1 ? (
            <button onClick={() => goto(current + 1)}
                    className="flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={submit}
                    className="flex-1 py-3 rounded-xl text-sm font-bold"
                    style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)", color: "#000" }}>
              Submit Paper
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
