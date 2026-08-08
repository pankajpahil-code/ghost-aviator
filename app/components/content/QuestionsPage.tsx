"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, BookOpen, CheckCircle, XCircle, RotateCcw, HelpCircle } from "lucide-react";
import type { Subject, Chapter } from "@/lib/subjects";
import type { DemoQuestion } from "@/lib/demo-questions";

type Props = {
  track: "cpl" | "atpl";
  subject: Subject;
  chapter: Chapter;
  questions: DemoQuestion[];
  /** True when these questions genuinely belong to this chapter. False when
   *  they are the subject-wide fallback shared with other chapters — the drill
   *  still runs, but the full list is not rendered, because 16 chapters
   *  publishing the same 1,020 questions is duplicate content, not content.
   *  See getChapterSpecificQuestions in lib/questions.ts. */
  chapterSpecific?: boolean;
};

/**
 * True when an explanation actually explains something.
 *
 * 782 of the bank's 1,277 explanations (61%) are still the placeholder
 * `Correct answer: B` — measured 2026-08-08, and tracked as an open task in
 * CLAUDE.md. Rendering those under a "Why:" label would put one near-identical
 * meaningless sentence on every question of every page: padding that teaches a
 * student nothing and hands Google exactly the boilerplate-repetition signal
 * the full question list exists to escape. A question with no real explanation
 * simply shows its marked answer and nothing more.
 */
function isRealExplanation(exp: string | undefined): boolean {
  if (!exp || !exp.trim()) return false;
  return !/^\s*correct answer\s*[:\-]?\s*[A-D]?\s*\.?\s*$/i.test(exp.trim());
}

export default function QuestionsPage({ track, subject, chapter, questions, chapterSpecific = true }: Props) {
  // Content protection for the full question list below — same deterrents the
  // notes carry. Iron Rule 3: the answers are the most valuable thing on the
  // site and the easiest to lift.
  const blockCopy = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); };

  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selfScore, setSelfScore] = useState<("correct" | "wrong" | null)[]>(
    Array(questions.length).fill(null),
  );
  const [done, setDone] = useState(false);

  function markAndAdvance(result: "correct" | "wrong") {
    const next = [...selfScore];
    next[current] = result;
    setSelfScore(next);
    setRevealed(false);
    if (current < questions.length - 1) setCurrent(c => c + 1);
    else setDone(true);
  }

  function restart() {
    setCurrent(0);
    setRevealed(false);
    setSelfScore(Array(questions.length).fill(null));
    setDone(false);
  }

  // Empty state
  if (questions.length === 0) {
    return (
      <div style={{ background: "#0b1117" }} className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">❓</div>
          <h1 className="text-2xl font-black text-white mb-3">Questions Coming Soon</h1>
          <p className="mb-6 text-sm" style={{ color: "#64748b" }}>
            Chapter-specific questions for{" "}
            <strong style={{ color: subject.color }}>{chapter.title}</strong> are being prepared.
            Target: {chapter.questionCount} practice questions.
          </p>
          <Link href={`/${track}/${subject.id}/${chapter.id}/notes`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold no-underline"
                style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}45`, color: subject.color }}>
            <BookOpen className="w-4 h-4" /> Read Notes Instead
          </Link>
        </div>
      </div>
    );
  }

  const correct = selfScore.filter(s => s === "correct").length;
  const attempted = selfScore.filter(s => s !== null).length;

  // Done / summary state
  if (done) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div style={{ background: "#0b1117" }} className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-3xl p-8 max-w-md w-full text-center"
             style={{ background: "rgba(17,24,32,0.95)", border: `1px solid ${subject.color}30` }}>
          <div className="text-5xl mb-4">{pct >= 70 ? "🎉" : "📚"}</div>
          <h2 className="text-2xl font-black text-white mb-1">Practice Complete</h2>
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            {pct >= 70 ? "Great recall! Ready for the chapter test." : "Review the topics and try again."}
          </p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-xl text-center"
                 style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)" }}>
              <div className="text-2xl font-black" style={{ color: "#22c55e" }}>{correct}</div>
              <div className="text-xs" style={{ color: "#475569" }}>Got It</div>
            </div>
            <div className="p-3 rounded-xl text-center"
                 style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <div className="text-2xl font-black" style={{ color: "#ef4444" }}>{questions.length - correct}</div>
              <div className="text-xs" style={{ color: "#475569" }}>Review</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={restart}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold"
                    style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}40`, color: subject.color }}>
              <RotateCcw className="w-4 h-4" /> Retry
            </button>
            <Link href={`/${track}/${subject.id}/${chapter.id}/chapter-quiz`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold no-underline"
                  style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.35)", color: "#f97316" }}>
              ✅ Take Quiz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen">

      {/* Sticky progress bar */}
      <div className="sticky top-16 z-10 backdrop-blur-md"
           style={{ background: "rgba(11,17,23,0.97)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs" style={{ color: "#475569" }}>
            <Link href={`/${track}/${subject.id}/${chapter.id}/notes`}
                  className="no-underline hover:text-white transition-colors" style={{ color: "#475569" }}>Notes</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: subject.color, fontWeight: "700" }}>
              <HelpCircle className="w-3 h-3 inline mr-1" />Questions
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: "#475569" }}>{attempted}/{questions.length}</span>
            <span className="text-xs px-2 py-1 rounded-full"
                  style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
              {correct} correct
            </span>
          </div>
        </div>
        <div className="h-0.5" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full transition-all duration-500"
               style={{ width: `${((current + 1) / questions.length) * 100}%`, background: `linear-gradient(90deg, ${subject.color}, #f3c889)` }} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Chapter context */}
        <div className="mb-6">
          <div className="text-xs font-bold tracking-widest mb-1" style={{ color: subject.color, letterSpacing: "0.15em" }}>
            {subject.shortName.toUpperCase()} — CH.{chapter.number}
          </div>
          {/* h1, not h2. All 284 practice-question pages in the sitemap shipped
              with no h1 at all — the one heading every search engine reads
              first to decide what a page is about. The subject line below it
              is visible, not sr-only: it names the exam and the subject, which
              is the query a student actually types. */}
          <h1 className="text-xl font-black text-white">
            {chapter.title}
            <span className="block text-xs font-bold mt-1" style={{ color: "#64748b" }}>
              {subject.name} — DGCA {track.toUpperCase()} practice questions
            </span>
          </h1>
          <p className="text-xs mt-1" style={{ color: "#475569" }}>Question {current + 1} of {questions.length}</p>
        </div>

        {/* Question card */}
        <div className="rounded-2xl p-6 mb-4"
             style={{ background: "rgba(17,24,32,0.95)", border: `1px solid ${subject.color}20` }}>
          <p className="text-base font-semibold text-white mb-6 leading-relaxed">{q.q}</p>
          <div className="flex flex-col gap-2.5">
            {q.opts.map((opt, oi) => {
              const isCorrect = oi === q.ans;
              return (
                <div key={oi} className="px-4 py-3 rounded-xl text-sm"
                     style={{
                       background: revealed && isCorrect ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)",
                       border: `1px solid ${revealed && isCorrect ? "#22c55e" : "rgba(255,255,255,0.08)"}`,
                       color: revealed && isCorrect ? "#22c55e" : "#94a3b8",
                     }}>
                  <span className="font-bold mr-2" style={{ color: revealed && isCorrect ? "#22c55e" : "#475569" }}>
                    {String.fromCharCode(65 + oi)}.
                  </span>
                  {opt}
                </div>
              );
            })}
          </div>

          {!revealed ? (
            <button onClick={() => setRevealed(true)}
                    className="mt-5 w-full py-3 rounded-xl text-sm font-bold"
                    style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}40`, color: subject.color }}>
              Show Answer
            </button>
          ) : (
            <div className="mt-5">
              <div className="p-4 rounded-xl text-sm mb-4"
                   style={{ background: "rgba(240,145,58,0.05)", border: "1px solid rgba(240,145,58,0.15)", color: "#94a3b8" }}>
                <span className="font-bold" style={{ color: "#f0913a" }}>💡 </span>{q.exp}
              </div>
              <div className="flex gap-3">
                <button onClick={() => markAndAdvance("correct")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold"
                        style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", color: "#22c55e" }}>
                  <CheckCircle className="w-4 h-4" /> Got it ✓
                </button>
                <button onClick={() => markAndAdvance("wrong")}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold"
                        style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" }}>
                  <XCircle className="w-4 h-4" /> Review ✗
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Navigation dots + prev/next */}
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => { setCurrent(c => c - 1); setRevealed(false); }}
                  disabled={current === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-30"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "#64748b", background: "transparent" }}>
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <div className="flex gap-1.5 flex-wrap justify-center">
            {questions.map((_, i) => (
              <button key={i} onClick={() => { setCurrent(i); setRevealed(false); }}
                      className="w-6 h-6 rounded text-xs font-bold"
                      style={{
                        background: i === current ? `${subject.color}30`
                          : selfScore[i] === "correct" ? "rgba(34,197,94,0.2)"
                          : selfScore[i] === "wrong"   ? "rgba(239,68,68,0.15)"
                          : "rgba(255,255,255,0.05)",
                        border: `1px solid ${i === current ? subject.color
                          : selfScore[i] === "correct" ? "#22c55e"
                          : selfScore[i] === "wrong"   ? "#ef4444"
                          : "rgba(255,255,255,0.08)"}`,
                        color: i === current ? subject.color : "#64748b",
                      }}>
                {i + 1}
              </button>
            ))}
          </div>

          <button onClick={() => {
            if (current < questions.length - 1) { setCurrent(c => c + 1); setRevealed(false); }
            else setDone(true);
          }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium"
                  style={{ border: `1px solid ${subject.color}40`, color: subject.color, background: `${subject.color}10` }}>
            {current < questions.length - 1 ? <>Next <ChevronRight className="w-4 h-4" /></> : "Finish"}
          </button>
        </div>

        {/* ── Full question list ────────────────────────────────────────────
            Every question, rendered into the page rather than revealed one at
            a time by the drill above.

            WHY: the drill is a client component that shows question 1 of N.
            Search Console (2026-08-08) reported 303 of 343 known pages as
            "Crawled - currently not indexed" — fetched, then judged not worth
            indexing — and these 284 pages were handing Googlebot ~269 words
            each: the navigation, and one question. 284 near-identical thin
            pages, all submitted in the sitemap, while the site was already
            being de-indexed. Rendering the full set makes each page what it
            claims to be.

            It is also better for the student: a revision list you can read
            end-to-end beats clicking through 56 cards. Protection matches the
            notes — selectable text and copy are blocked, no print. */}
        {chapterSpecific && (
        <section
          className="mt-14 mb-4"
          onContextMenu={blockCopy}
          onCopy={blockCopy}
          onCut={blockCopy}
          style={{ userSelect: "none", WebkitUserSelect: "none" }}
        >
          <h2 className="text-lg font-black text-white mb-1">
            All {questions.length} questions — {chapter.title}
          </h2>
          <p className="text-xs mb-6" style={{ color: "#64748b" }}>
            {subject.name} · DGCA {track.toUpperCase()}. The correct option is marked on each.
          </p>

          <ol className="list-none p-0 m-0 flex flex-col gap-5">
            {questions.map((qq, qi) => (
              <li key={qi}
                  className="rounded-xl p-4"
                  style={{ background: "rgba(17,24,32,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-sm font-semibold text-white mb-3 leading-relaxed">
                  <span style={{ color: subject.color }}>Q{qi + 1}.</span> {qq.q}
                </p>
                <ul className="list-none p-0 m-0 flex flex-col gap-1.5">
                  {qq.opts.map((opt, oi) => {
                    const isAns = oi === qq.ans;
                    return (
                      <li key={oi}
                          className="text-sm px-3 py-1.5 rounded-lg"
                          style={{
                            background: isAns ? "rgba(34,197,94,0.12)" : "transparent",
                            border: `1px solid ${isAns ? "rgba(34,197,94,0.35)" : "rgba(255,255,255,0.06)"}`,
                            color: isAns ? "#22c55e" : "#94a3b8",
                          }}>
                        <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>
                        {opt}
                        {isAns && <span className="ml-2 font-bold">✓</span>}
                      </li>
                    );
                  })}
                </ul>
                {/* Explanations are only worth rendering when they explain
                    something. Much of the bank still carries placeholder text
                    of the form "Correct answer: B", which teaches nothing and
                    would pad every page with a near-identical sentence — the
                    exact thin-content signal this section exists to fix. */}
                {isRealExplanation(qq.exp) && (
                  <p className="text-xs mt-3 mb-0 leading-relaxed" style={{ color: "#64748b" }}>
                    <span className="font-bold" style={{ color: "#94a3b8" }}>Why: </span>
                    {qq.exp}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
        )}
      </div>
    </div>
  );
}
