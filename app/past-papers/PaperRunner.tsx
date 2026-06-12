"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { PastPaper } from "@/lib/past-papers";
import { ArrowLeft, CheckCircle, XCircle, RotateCcw, Trophy } from "lucide-react";

// Exam-style runner for a full previous-year/sample paper:
// answer all questions at your pace → submit → score + full answer review.
export default function PaperRunner({ paper }: { paper: PastPaper }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const answered = Object.keys(answers).length;
  const total = paper.questions.length;
  const score = useMemo(
    () => paper.questions.reduce((n, q, i) => n + (answers[i] === q.ans ? 1 : 0), 0),
    [answers, paper.questions],
  );
  const pct = total ? Math.round((score / total) * 100) : 0;
  const passed = pct >= 70;

  const choose = (qi: number, oi: number) => {
    if (submitted) return;
    setAnswers(a => ({ ...a, [qi]: oi }));
  };

  const reset = () => { setAnswers({}); setSubmitted(false); window.scrollTo({ top: 0 }); };

  return (
    <div style={{ background: "#06040e" }} className="min-h-screen">
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(124,58,237,0.25)" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <Link href="/past-papers" className="inline-flex items-center gap-1 text-sm mb-4 no-underline" style={{ color: "#64748b" }}>
            <ArrowLeft className="w-4 h-4" /> All Papers
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">{paper.title}</h1>
          <p className="text-sm" style={{ color: "#64748b" }}>
            {total} questions · pass mark 70% · answer at your own pace, then submit for the full key.
          </p>
        </div>
      </div>

      {/* Result banner */}
      {submitted && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
          <div className="rounded-2xl p-6 flex flex-wrap items-center gap-5"
               style={{ background: passed ? "rgba(34,197,94,0.1)" : "rgba(255,32,96,0.1)", border: `1px solid ${passed ? "rgba(34,197,94,0.4)" : "rgba(255,32,96,0.4)"}` }}>
            <Trophy className="w-10 h-10" style={{ color: passed ? "#22c55e" : "#ff2060" }} />
            <div className="flex-1">
              <div className="text-2xl font-black text-white">{pct}% — {score}/{total} correct</div>
              <div className="text-sm font-bold" style={{ color: passed ? "#22c55e" : "#ff2060" }}>
                {passed ? "PASS — exam standard met. Review the few you missed below." : "Below the 70% pass mark — review the answers below and re-attempt."}
              </div>
            </div>
            <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black cursor-pointer border-0"
                    style={{ background: "rgba(124,58,237,0.25)", color: "#c080ff" }}>
              <RotateCcw className="w-4 h-4" /> Re-attempt
            </button>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-5">
        {paper.questions.map((q, qi) => {
          const chosen = answers[qi];
          return (
            <div key={qi} className="rounded-2xl p-5"
                 style={{ background: "rgba(20,10,40,0.6)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <div className="flex gap-3 mb-4">
                <span className="font-black shrink-0" style={{ color: "#c080ff" }}>Q{qi + 1}.</span>
                <p className="text-white font-medium m-0">{q.q}</p>
              </div>
              <div className="flex flex-col gap-2">
                {q.opts.map((opt, oi) => {
                  const isChosen = chosen === oi;
                  const isAns = q.ans === oi;
                  let border = "1px solid rgba(255,255,255,0.08)", bg = "rgba(255,255,255,0.02)", color = "#94a3b8";
                  if (!submitted && isChosen) { border = "1px solid rgba(124,58,237,0.7)"; bg = "rgba(124,58,237,0.15)"; color = "#fff"; }
                  if (submitted && isAns) { border = "1px solid rgba(34,197,94,0.6)"; bg = "rgba(34,197,94,0.12)"; color = "#86efac"; }
                  if (submitted && isChosen && !isAns) { border = "1px solid rgba(255,32,96,0.6)"; bg = "rgba(255,32,96,0.1)"; color = "#fda4af"; }
                  return (
                    <button key={oi} onClick={() => choose(qi, oi)}
                            className="text-left px-4 py-2.5 rounded-xl text-sm cursor-pointer flex items-start gap-2"
                            style={{ border, background: bg, color }}>
                      <span className="font-black shrink-0">({"abcde"[oi]})</span>
                      <span>{opt}</span>
                      {submitted && isAns && <CheckCircle className="w-4 h-4 ml-auto shrink-0" style={{ color: "#22c55e" }} />}
                      {submitted && isChosen && !isAns && <XCircle className="w-4 h-4 ml-auto shrink-0" style={{ color: "#ff2060" }} />}
                    </button>
                  );
                })}
              </div>
              {submitted && q.exp && (
                <div className="mt-3 px-4 py-3 rounded-xl text-sm" style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)", color: "#7dd3fc" }}>
                  <span className="font-black">Explanation: </span>{q.exp}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit bar */}
      {!submitted && (
        <div className="sticky bottom-0 z-40" style={{ background: "rgba(6,4,14,0.95)", borderTop: "1px solid rgba(124,58,237,0.3)", backdropFilter: "blur(10px)" }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="text-sm font-bold" style={{ color: answered === total ? "#22c55e" : "#94a3b8" }}>
              {answered}/{total} answered
            </div>
            <button onClick={() => { setSubmitted(true); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={answered === 0}
                    className="px-6 py-3 rounded-xl text-sm font-black cursor-pointer border-0 disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#9020ff,#ff2060)", color: "#fff" }}>
              Submit Paper
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
