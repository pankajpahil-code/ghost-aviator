"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, BookOpen } from "lucide-react";
import type { Subject, Chapter } from "@/lib/subjects";
import type { DemoQuestion } from "@/lib/demo-questions";

type Phase = "setup" | "quiz" | "result";
const PASS_MARK = 70;

type Props = {
  track: "cpl" | "atpl";
  subject: Subject;
  chapter: Chapter;
  questions: DemoQuestion[];
};

export default function ChapterQuizPage({ track, subject, chapter, questions }: Props) {
  const [phase, setPhase] = useState<Phase>("setup");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));

  const score  = answers.filter((a, i) => a === questions[i]?.ans).length;
  const pct    = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed = pct >= PASS_MARK;

  function selectAnswer(oi: number) {
    if (answers[current] !== null) return;
    const next = [...answers];
    next[current] = oi;
    setAnswers(next);
  }

  function advance() {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
    } else {
      setPhase("result");
      window.scrollTo(0, 0);
    }
  }

  function restart() {
    setPhase("setup");
    setCurrent(0);
    setAnswers(Array(questions.length).fill(null));
    window.scrollTo(0, 0);
  }

  // Empty state
  if (questions.length === 0) {
    return (
      <div style={{ background: "#06040e" }} className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-2xl font-black text-white mb-3">Quiz Coming Soon</h2>
          <p className="mb-6 text-sm" style={{ color: "#64748b" }}>
            Questions for <strong style={{ color: subject.color }}>{chapter.title}</strong> are being prepared.
            Target: {chapter.questionCount} questions.
          </p>
          <Link href={`/${track}/${subject.id}/${chapter.id}/notes`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold no-underline"
                style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}45`, color: subject.color }}>
            <BookOpen className="w-4 h-4" /> Study Notes
          </Link>
        </div>
      </div>
    );
  }

  // Setup screen
  if (phase === "setup") return (
    <div style={{ background: "#06040e" }} className="min-h-screen flex items-center justify-center px-4">
      <div className="rounded-3xl p-10 max-w-lg w-full text-center"
           style={{ background: "rgba(15,8,30,0.95)", border: `1px solid ${subject.color}35` }}>
        <div className="text-4xl mb-1">{subject.icon}</div>
        <div className="text-xs font-bold tracking-widest mb-2 mt-1"
             style={{ color: subject.color, letterSpacing: "0.18em" }}>
          CH.{chapter.number} CHAPTER QUIZ
        </div>
        <h1 className="text-2xl font-black text-white mb-1">{chapter.title}</h1>
        <p className="text-sm mb-7" style={{ color: "#64748b" }}>
          {subject.shortName} · No timer · Answer all questions, then see your results
        </p>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {[
            ["Questions", `${questions.length}`],
            ["Pass Mark",  `${PASS_MARK}%`],
          ].map(([l, v]) => (
            <div key={l} className="p-3 rounded-xl"
                 style={{ background: `${subject.color}10`, border: `1px solid ${subject.color}25` }}>
              <div className="text-xl font-black" style={{ color: subject.color }}>{v}</div>
              <div className="text-xs" style={{ color: "#475569" }}>{l}</div>
            </div>
          ))}
        </div>
        <button onClick={() => { setPhase("quiz"); window.scrollTo(0, 0); }}
                className="w-full py-4 rounded-xl font-black text-lg"
                style={{ background: `linear-gradient(135deg, ${subject.color}, #c020ff)`, color: "#fff" }}>
          Start Quiz →
        </button>
      </div>
    </div>
  );

  // Result screen
  if (phase === "result") return (
    <div style={{ background: "#06040e" }} className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl p-10 text-center mb-8"
             style={{ background: "rgba(15,8,30,0.95)", border: `1px solid ${passed ? "#22c55e" : "#ef4444"}40` }}>
          <div className="text-5xl mb-4">{passed ? "🏆" : "📚"}</div>
          <h2 className="text-3xl font-black text-white mb-2">
            {passed ? "Quiz Cleared!" : "Keep Practising"}
          </h2>
          <p className="mb-8" style={{ color: "#64748b" }}>
            {passed
              ? `Passed with ${pct}%. Great work on ${chapter.title}!`
              : `Need ${PASS_MARK}% to pass. You scored ${pct}%. Revise and try again.`}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              ["Score",   `${pct}%`,                     passed ? "#22c55e" : "#ef4444"],
              ["Correct", `${score}/${questions.length}`, "#00d4ff"],
              ["Status",  passed ? "PASS" : "FAIL",      passed ? "#22c55e" : "#ef4444"],
            ].map(([l, v, c]) => (
              <div key={l} className="p-4 rounded-xl" style={{ background: `${c}10`, border: `1px solid ${c}25` }}>
                <div className="text-2xl font-black" style={{ color: c }}>{v}</div>
                <div className="text-xs" style={{ color: "#475569" }}>{l}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={restart}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm"
                    style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}45`, color: subject.color }}>
              <RotateCcw className="w-4 h-4" /> Retry Quiz
            </button>
            <Link href={`/${track}/${subject.id}/${chapter.id}/notes`}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm no-underline"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
              <BookOpen className="w-4 h-4" /> Revise Notes
            </Link>
          </div>
        </div>

        {/* Answer review */}
        <h3 className="text-lg font-black text-white mb-4">Answer Review</h3>
        <div className="flex flex-col gap-3">
          {questions.map((q, i) => {
            const userAns = answers[i];
            const correct = userAns === q.ans;
            return (
              <div key={i} className="rounded-2xl p-5"
                   style={{ background: "rgba(15,8,30,0.95)", border: `1px solid ${correct ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"}` }}>
                <div className="flex items-start gap-3 mb-3">
                  {correct
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#22c55e" }} />
                    : <XCircle    className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />}
                  <p className="text-sm font-medium text-white">{q.q}</p>
                </div>
                <div className="flex flex-col gap-1.5 mb-3">
                  {q.opts.map((opt, oi) => (
                    <div key={oi} className="px-3 py-2 rounded-lg text-xs"
                         style={{
                           background: oi === q.ans  ? "rgba(34,197,94,0.12)"
                             : oi === userAns         ? "rgba(239,68,68,0.12)"
                             : "rgba(255,255,255,0.03)",
                           border: `1px solid ${oi === q.ans ? "#22c55e" : oi === userAns ? "#ef4444" : "rgba(255,255,255,0.06)"}`,
                           color: oi === q.ans ? "#22c55e" : oi === userAns ? "#ef4444" : "#64748b",
                         }}>
                      {String.fromCharCode(65 + oi)}. {opt}
                    </div>
                  ))}
                </div>
                <div className="text-xs px-3 py-2 rounded-lg"
                     style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.12)", color: "#64748b" }}>
                  💡 {q.exp}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Active quiz screen
  const q        = questions[current];
  const selected = answers[current];

  return (
    <div style={{ background: "#06040e", minHeight: "100vh", paddingBottom: "2rem" }}>

      {/* Progress bar — no timer, just position */}
      <div style={{
        position: "fixed", top: "4rem", left: 0, right: 0, zIndex: 20,
        background: "rgba(6,4,14,0.97)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.875rem", fontWeight: 500 }}>
            Q{current + 1} / {questions.length}
          </span>
          <span style={{ color: subject.color, fontSize: "0.875rem", fontWeight: 700 }}>
            Chapter Quiz
          </span>
          <span style={{ color: "#475569", fontSize: "0.75rem" }}>
            {answers.filter(a => a !== null).length} answered
          </span>
        </div>
        <div style={{ height: "2px", background: "rgba(255,255,255,0.06)" }}>
          <div style={{
            height: "100%",
            width: `${((current + 1) / questions.length) * 100}%`,
            background: `linear-gradient(90deg, ${subject.color}, #c020ff)`,
            transition: "width 0.4s",
          }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "8rem 1rem 0" }}>

        {/* Question card */}
        <div style={{ background: "rgba(15,8,30,0.95)", border: `1px solid ${subject.color}20`, borderRadius: "1rem", padding: "1.75rem", marginBottom: "1rem" }}>
          <p style={{ color: "#ffffff", fontSize: "1.0625rem", fontWeight: 600, lineHeight: 1.65, marginBottom: "1.5rem" }}>
            {q.q}
          </p>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {q.opts.map((opt, oi) => {
              const isSelected = selected === oi;
              return (
                <button key={oi}
                        onClick={() => selectAnswer(oi)}
                        disabled={selected !== null}
                        style={{
                          textAlign: "left", padding: "0.75rem 1rem",
                          borderRadius: "0.75rem", fontSize: "0.875rem",
                          background: isSelected ? `${subject.color}20` : "rgba(255,255,255,0.03)",
                          border: `1px solid ${isSelected ? subject.color : "rgba(255,255,255,0.08)"}`,
                          color: isSelected ? subject.color : "#94a3b8",
                          cursor: selected !== null ? "default" : "pointer",
                          display: "flex", alignItems: "flex-start", gap: "0.5rem",
                          transition: "all 0.15s",
                        }}>
                  <span style={{ color: isSelected ? subject.color : "#475569", fontWeight: 700, flexShrink: 0 }}>
                    {String.fromCharCode(65 + oi)}.
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next / Skip */}
        {selected !== null ? (
          <button onClick={advance}
                  style={{ width: "100%", padding: "1rem", borderRadius: "0.75rem", fontWeight: 900, fontSize: "1rem", background: `linear-gradient(135deg, ${subject.color}, #c020ff)`, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            {current < questions.length - 1
              ? <><ArrowRight className="w-5 h-5" /> Next Question</>
              : "Submit & See Results"}
          </button>
        ) : (
          <button onClick={advance}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", fontSize: "0.875rem", fontWeight: 500, border: "1px solid rgba(255,255,255,0.1)", color: "#64748b", background: "transparent", cursor: "pointer" }}>
            Skip →
          </button>
        )}
      </div>
    </div>
  );
}
