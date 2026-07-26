"use client";
import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, notFound } from "next/navigation";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight, RotateCcw, BookOpen } from "lucide-react";
import { getSubjectQuestionPool } from "@/lib/questions";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";

// Unified shape used by the exam UI.
type MockQ = { q: string; opts: string[]; ans: number; exp: string; subject: string };

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
  sample: "DGCA Sample Paper",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type TestConfig = {
  questions: MockQ[];
  durationSec: number;
  title: string;
  subtitle: string;
  passMark: number;
  backHref: string;
};

function buildConfig(subjectId: string | null, type: string | null): TestConfig {
  const subject = subjectId ? SUBJECT_MAP[subjectId] : undefined;

  // No subject (or unknown) â†’ return 404 since generic mock-test page is removed.
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
    .map(q => ({ q: q.q, opts: q.opts, ans: q.ans, exp: q.exp, subject: subject.shortName }));

  const track = CPL_SUBJECTS.some(s => s.id === subject.id) ? "cpl" : "atpl";

  return {
    questions,
    durationSec: durationMin * 60,
    title: `${subject.name} â€” ${label}`,
    subtitle: `${subject.shortName} Â· DGCA format Â· ${questions.length} questions`,
    passMark: subject.passMark,
    backHref: `/${track}/${subject.id}`,
  };
}

type Phase = "setup" | "exam" | "result";

function MockTestInner() {
  const params    = useSearchParams();
  const subjectId = params.get("subject");
  const type      = params.get("type");

  // Built once per subject/type combination (stable across the sitting).
  const config = useMemo(() => buildConfig(subjectId, type), [subjectId, type]);
  const { questions, durationSec, title, subtitle, passMark, backHref } = config;

  const [phase, setPhase]       = useState<Phase>("setup");
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(durationSec);
  const [flagged, setFlagged]   = useState<boolean[]>(Array(questions.length).fill(false));

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

  const q = questions[current];
  const answered = answers.filter(a => a !== null).length;
  const score    = answers.filter((a, i) => a === questions[i]?.ans).length;
  const pct      = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed   = pct >= passMark;

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
    setPhase("setup"); setCurrent(0); setTimeLeft(durationSec);
    setAnswers(Array(questions.length).fill(null));
    setRevealed(false);
    setFlagged(Array(questions.length).fill(false));
  }

  /* â”€â”€ EMPTY (subject has no questions yet) â”€â”€ */
  if (questions.length === 0) return (
    <div className="grid-bg min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <div className="text-5xl mb-4">ðŸ“</div>
        <h1 className="text-2xl font-extrabold mb-2">{title}</h1>
        <p className="mb-8" style={{ color: "#94a3b8" }}>
          The question bank for this paper is still being prepared. Try the chapter quizzes in the meantime.
        </p>
        <Link href={backHref} className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold no-underline"
              style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
          <BookOpen className="w-4 h-4" /> Back to Chapters
        </Link>
      </div>
    </div>
  );

  /* â”€â”€ SETUP â”€â”€ */
  if (phase === "setup") return (
    <div className="grid-bg min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-lg w-full text-center">
        <div className="text-5xl mb-4">âœˆï¸</div>
        <h1 className="text-3xl font-extrabold mb-2">{title}</h1>
        <p className="mb-8" style={{ color: "#94a3b8" }}>{subtitle} Â· {passMark}% required to pass.</p>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[["Questions", `${questions.length}`], ["Duration", `${Math.round(durationSec / 60)} min`], ["Pass Mark", `${passMark}%`]].map(([l, v]) => (
            <div key={l} className="glass-card p-3">
              <div className="text-xl font-bold" style={{ color: "#00d4ff" }}>{v}</div>
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
        <button onClick={() => setPhase("exam")}
                className="w-full py-4 rounded-xl font-bold text-lg"
                style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
          Start Test
        </button>
      </div>
    </div>
  );

  /* â”€â”€ RESULT â”€â”€ */
  if (phase === "result") return (
    <div className="grid-bg min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-10 text-center mb-8">
          <div className="text-6xl mb-4">{passed ? "ðŸŽ‰" : "ðŸ˜”"}</div>
          <h2 className="text-3xl font-extrabold mb-2">{passed ? "Congratulations! You Passed!" : "Keep Practising!"}</h2>
          <p className="mb-8" style={{ color: "#94a3b8" }}>
            {passed ? `You cleared the ${passMark}% benchmark. Great work!` : `You need ${passMark}% to pass. Review the explanations below.`}
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
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
            <Link href={backHref} className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold no-underline"
                  style={{ border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff", background: "rgba(0,212,255,0.06)" }}>
              <BookOpen className="w-4 h-4" /> Back to Chapters
            </Link>
          </div>
        </div>

        {/* Review */}
        <h3 className="text-xl font-bold mb-4">Review Answers</h3>
        <div className="flex flex-col gap-4">
          {questions.map((rq, i) => {
            const userAns = answers[i];
            const isRight = userAns === rq.ans;
            return (
              <div key={i} className="glass-card p-6">
                <div className="flex items-start gap-3 mb-4">
                  {isRight
                    ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#22c55e" }} />
                    : <XCircle    className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />}
                  <div>
                    <div className="text-xs mb-1" style={{ color: "#475569" }}>Q{i + 1} Â· {rq.subject}</div>
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
                                 : oi === userAns  ? "1px solid #ef4444" : "1px solid rgba(0,212,255,0.1)",
                           color: oi === rq.ans ? "#22c55e" : oi === userAns ? "#ef4444" : "#94a3b8",
                         }}>
                      {String.fromCharCode(65 + oi)}. {opt}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", color: "#94a3b8" }}>
                  ðŸ’¡ {rq.exp}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* â”€â”€ EXAM â”€â”€ */
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
            Question <span style={{ color: "#00d4ff" }}>{current + 1}</span> / {questions.length}
          </div>
          <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 300 ? "timer-urgent" : ""}`}
               style={{ color: timeLeft < 300 ? "#ef4444" : "#00d4ff" }}>
            <Clock className="w-5 h-5" /> {fmt(timeLeft)}
          </div>
          <div className="text-sm" style={{ color: "#94a3b8" }}>
            {answered} answered
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-1 rounded-full mb-6" style={{ background: "rgba(0,212,255,0.1)" }}>
          <div className="h-1 rounded-full transition-all duration-500"
               style={{ width: `${((current + 1) / questions.length) * 100}%`, background: "linear-gradient(90deg,#00d4ff,#7c3aed)" }} />
        </div>

        {/* Question card */}
        <div className="glass-card p-8 mb-4">
          <div className="text-xs mb-4 px-2 py-1 rounded-full inline-block"
               style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.2)" }}>
            {q.subject}
          </div>
          <p className="text-lg font-semibold mb-8 leading-relaxed">{q.q}</p>
          <div className="flex flex-col gap-3">
            {q.opts.map((opt, oi) => (
              <button key={oi} className={optClass(oi)} onClick={() => selectAnswer(oi)} disabled={revealed}>
                <span className="font-bold mr-3" style={{ color: "#475569" }}>{String.fromCharCode(65 + oi)}.</span>
                {opt}
              </button>
            ))}
          </div>

          {/* Explanation */}
          {revealed && (
            <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", color: "#94a3b8" }}>
              <span className="font-semibold" style={{ color: "#00d4ff" }}>ðŸ’¡ Explanation: </span>
              {q.exp}
            </div>
          )}
        </div>

        {/* Next button */}
        {revealed && (
          <button onClick={next}
                  className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
            {current < questions.length - 1 ? <><ArrowRight className="w-5 h-5" /> Next Question</> : "Submit & See Results"}
          </button>
        )}

        {/* Flag / Skip */}
        {!revealed && (
          <div className="flex gap-3 mt-4">
            <button onClick={() => { const f = [...flagged]; f[current] = !f[current]; setFlagged(f); }}
                    className="flex-1 py-3 rounded-xl text-sm font-medium"
                    style={{ border: `1px solid ${flagged[current] ? "#f59e0b" : "rgba(0,212,255,0.2)"}`, color: flagged[current] ? "#f59e0b" : "#64748b", background: "transparent" }}>
              {flagged[current] ? "ðŸš© Flagged" : "ðŸ³ï¸ Flag Question"}
            </button>
            <button onClick={next}
                    className="flex-1 py-3 rounded-xl text-sm font-medium"
                    style={{ border: "1px solid rgba(0,212,255,0.2)", color: "#64748b", background: "transparent" }}>
              Skip â†’
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MockTestPage() {
  return (
    <Suspense fallback={<div className="grid-bg min-h-screen" />}>
      <MockTestInner />
    </Suspense>
  );
}
