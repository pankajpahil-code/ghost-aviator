"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight, RotateCcw, BookOpen, Check } from "lucide-react";
import type { Subject, Chapter } from "@/lib/subjects";
import type { DemoQuestion } from "@/lib/demo-questions";
import { isRealExplanation } from "@/lib/explanation";
import {
  recordResult, isSubjectFallback, questionsForRun, countsTowardChapter,
  QUIZ_SAMPLE_SIZE, MIN_QUESTIONS_FOR_VERDICT,
} from "@/lib/progress";
import LiveClassUpsell from "@/app/components/LiveClassUpsell";

type Phase = "setup" | "quiz" | "result";

type Props = {
  track: "cpl" | "atpl";
  subject: Subject;
  chapter: Chapter;
  questions: DemoQuestion[];
  /** True when `questions` are this chapter's own (getChapterSpecificQuestions().length > 0).
   *  Optional: when the route does not pass it, the data is read instead. */
  chapterSpecific?: boolean;
};

export default function ChapterQuizPage({ track, subject, chapter, questions: pool, chapterSpecific }: Props) {
  // A chapter with no bank of its own receives the whole subject pool. That is a
  // revision quiz on a random sample of it, not a quiz of this chapter.
  const fallback = isSubjectFallback(pool, chapterSpecific);
  const plannedCount = fallback ? Math.min(QUIZ_SAMPLE_SIZE, pool.length) : pool.length;
  const passMark = subject.passMark;

  const [phase, setPhase] = useState<Phase>("setup");
  const [current, setCurrent] = useState(0);
  // The questions of the run in progress. Fixed when Start is pressed (never at
  // render, so server and browser agree on the page); a fallback run is a fresh
  // random sample each time.
  const [questions, setQuestions] = useState<DemoQuestion[]>(() => (fallback ? [] : pool));
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(questions.length).fill(null));

  const score  = answers.filter((a, i) => a === questions[i]?.ans).length;
  const pct    = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed = pct >= passMark;
  // Only a full-size run of the chapter's own questions counts as a chapter result.
  // Before Start the planned size stands in, so the setup card can say so up front.
  const counts = countsTowardChapter({ questionCount: phase === "setup" ? plannedCount : questions.length, fallback });

  // Save the result once when the quiz finishes (best score is kept).
  const recorded = useRef(false);
  useEffect(() => {
    if (phase === "result" && !recorded.current && questions.length > 0) {
      recorded.current = true;
      if (counts) recordResult("quiz", track, subject.id, chapter.id, pct);
    }
  }, [phase, pct, counts, track, subject.id, chapter.id, questions.length]);

  function start() {
    const run = questionsForRun(pool, fallback);
    setQuestions(run);
    setAnswers(Array(run.length).fill(null));
    setCurrent(0);
    setPhase("quiz");
    window.scrollTo(0, 0);
  }

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
    recorded.current = false;
    window.scrollTo(0, 0);
  }

  // Empty state
  if (pool.length === 0) {
    return (
      <div style={{ background: "#0b1117" }} className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">📝</div>
          {/* h1, not h2. Every other state of this page has one; this branch had
              none at all, so 18 chapters shipped a page with no top-level
              heading — the document just started at level 2. Invisible to a
              sighted reader, but it is how a screen-reader user finds out what
              page they are on. Matches the empty state in QuestionsPage. */}
          <h1 className="text-2xl font-black text-white mb-3">Quiz Coming Soon</h1>
          <p className="mb-6 text-sm" style={{ color: "#64748b" }}>
            Questions for <strong style={{ color: subject.color }}>{chapter.title}</strong> are being prepared.
            Target: {chapter.questionCount} {chapter.questionCount === 1 ? "question" : "questions"}.
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
    <div style={{ background: "#0b1117" }} className="min-h-screen flex items-center justify-center px-4">
      <div className="rounded-3xl p-10 max-w-lg w-full text-center"
           style={{ background: "rgba(17,24,32,0.95)", border: `1px solid ${subject.color}35` }}>
        <div className="text-4xl mb-1">{subject.icon}</div>
        <div className="text-xs font-bold tracking-widest mb-2 mt-1"
             style={{ color: subject.color, letterSpacing: "0.18em" }}>
          {fallback ? "SUBJECT REVISION QUIZ" : `CH.${chapter.number} CHAPTER QUIZ`}
        </div>
        <h1 className="text-2xl font-black text-white mb-1">{chapter.title}</h1>
        <p className="text-sm mb-7" style={{ color: "#64748b" }}>
          {subject.shortName} · No timer · Answer all questions, then see your results
        </p>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            ["Questions", `${plannedCount}`],
            ["Pass Mark",  `${passMark}%`],
          ].map(([l, v]) => (
            <div key={l} className="p-3 rounded-xl"
                 style={{ background: `${subject.color}10`, border: `1px solid ${subject.color}25` }}>
              <div className="text-xl font-black" style={{ color: subject.color }}>{v}</div>
              <div className="text-xs" style={{ color: "#475569" }}>{l}</div>
            </div>
          ))}
        </div>
        {/* Say plainly what this run is, and that it will not be filed as chapter progress. */}
        {fallback ? (
          <p className="text-xs mb-8" style={{ color: "#94a3b8" }}>
            This chapter has no questions of its own yet, so this is a revision quiz: {plannedCount} random
            questions from across {subject.shortName}, a different set each time. It is not saved as chapter progress.
          </p>
        ) : !counts ? (
          <p className="text-xs mb-8" style={{ color: "#94a3b8" }}>
            This chapter has only {pool.length} {pool.length === 1 ? "question" : "questions"} so far. A quiz needs at
            least {MIN_QUESTIONS_FOR_VERDICT} to count, so your score will not be saved as chapter progress.
          </p>
        ) : <div className="mb-4" />}
        <button onClick={start}
                className="w-full py-4 rounded-xl font-black text-lg"
                style={{ background: `linear-gradient(135deg, ${subject.color}, #f0913a)`, color: "#fff" }}>
          Start Quiz →
        </button>
      </div>
    </div>
  );

  // Result screen
  if (phase === "result") return (
    <div style={{ background: "#0b1117" }} className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="rounded-3xl p-10 text-center mb-8"
             style={{ background: "rgba(17,24,32,0.95)", border: `1px solid ${passed ? "#22c55e" : "#ef4444"}40` }}>
          <div className="text-5xl mb-4">{passed ? "🏆" : "📚"}</div>
          {/* The result is a distinct screen with its own early return, so this
              is the page's top-level heading, not a section under one. */}
          <h1 className="text-3xl font-black text-white mb-2">
            {!counts ? "Practice Round Complete" : passed ? "Quiz Cleared!" : "Keep Practising"}
          </h1>
          <p className="mb-8" style={{ color: "#64748b" }}>
            {!counts
              ? `You scored ${pct}% (${score}/${questions.length}). This was ${fallback ? "a subject revision quiz" : "a short quiz"}, so it is not saved as progress for ${chapter.title}.`
              : passed
                ? `Passed with ${pct}%. Great work on ${chapter.title}!`
                : `Need ${passMark}% to pass. You scored ${pct}%. Revise and try again.`}
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              ["Score",   `${pct}%`,                     !counts ? "#f0913a" : passed ? "#22c55e" : "#ef4444"],
              ["Correct", `${score}/${questions.length}`, "#f0913a"],
              ["Status",  !counts ? "PRACTICE" : passed ? "PASS" : "FAIL", !counts ? "#f0913a" : passed ? "#22c55e" : "#ef4444"],
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

        <div className="mb-8">
          <LiveClassUpsell subjectId={subject.id} subjectColor={subject.color} />
        </div>

        {/* Answer review */}
        <h3 className="text-lg font-black text-white mb-4">Answer Review</h3>
        <div className="flex flex-col gap-3">
          {questions.map((q, i) => {
            const userAns = answers[i];
            const correct = userAns === q.ans;
            return (
              <div key={i} className="rounded-2xl p-5"
                   style={{ background: "rgba(17,24,32,0.95)", border: `1px solid ${correct ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.2)"}` }}>
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
                {isRealExplanation(q.exp) && (
                  <div className="text-xs px-3 py-2 rounded-lg"
                       style={{ background: "rgba(240,145,58,0.05)", border: "1px solid rgba(240,145,58,0.12)", color: "#64748b" }}>
                    💡 {q.exp}
                  </div>
                )}
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
    <div style={{ background: "#0b1117", minHeight: "100vh", paddingBottom: "2rem" }}>

      {/* Progress bar — no timer, just position */}
      <div style={{
        position: "fixed", top: "4rem", left: 0, right: 0, zIndex: 20,
        background: "rgba(11,17,23,0.97)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "0.75rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "#94a3b8", fontSize: "0.875rem", fontWeight: 500 }}>
            Q{current + 1} / {questions.length}
          </span>
          <span style={{ color: subject.color, fontSize: "0.875rem", fontWeight: 700 }}>
            {fallback ? "Revision Quiz" : "Chapter Quiz"}
          </span>
          <span style={{ color: "#475569", fontSize: "0.75rem" }}>
            {answers.filter(a => a !== null).length} answered
          </span>
        </div>
        <div style={{ height: "2px", background: "rgba(255,255,255,0.06)" }}>
          <div style={{
            height: "100%",
            width: `${((current + 1) / questions.length) * 100}%`,
            background: `linear-gradient(90deg, ${subject.color}, #f0913a)`,
            transition: "width 0.4s",
          }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "8rem 1rem 0" }}>

        {/* Question card */}
        <div style={{ background: "rgba(17,24,32,0.95)", border: `1px solid ${subject.color}20`, borderRadius: "1rem", padding: "1.75rem", marginBottom: "1rem" }}>
          <p style={{ color: "#ffffff", fontSize: "1.0625rem", fontWeight: 600, lineHeight: 1.65, marginBottom: "1.5rem" }}>
            {q.q}
          </p>

          {/* Options */}
          <div role="group" aria-label="Answer options" style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {q.opts.map((opt, oi) => {
              const isSelected = selected === oi;
              return (
                <button key={oi}
                        onClick={() => selectAnswer(oi)}
                        aria-pressed={isSelected}
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
                  <span>{opt}</span>
                  {isSelected && <Check aria-hidden className="w-4 h-4 flex-shrink-0 ml-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Next / Skip */}
        {selected !== null ? (
          <button onClick={advance}
                  style={{ width: "100%", padding: "1rem", borderRadius: "0.75rem", fontWeight: 900, fontSize: "1rem", background: `linear-gradient(135deg, ${subject.color}, #f0913a)`, color: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
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
