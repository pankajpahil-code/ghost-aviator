"use client";

// ADAPT practice runner.
//
// All logic lives in lib/adapt/* as pure, unit-tested modules; this component
// only renders them and works the clock. Nothing is fetched, nothing is
// inferred at runtime, and the whole paper is generated on the device from a
// single seed — so it costs nothing to run at any number of students and works
// on a slow connection.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock, RotateCcw, XCircle } from "lucide-react";
import { buildSession, scoreModule, scoreTracking, scoreSession, MODULES, MODULE_IDS } from "@/lib/adapt/session.mjs";
import type { AdaptSession, ModuleResult, TrackingResult, CompositeResult } from "@/lib/adapt/session.mjs";
import { randomSeed } from "@/lib/adapt/rng.mjs";
import { inputLabel } from "@/lib/adapt/tracking.mjs";
import TrackingTask, { type TrackingRaw } from "./TrackingTask";

type AnyResult = ModuleResult | TrackingResult;
const isTracking = (r: AnyResult): r is TrackingResult => r.kind === "psychomotor";

const cyan = "#f0913a";

type Phase = "brief" | "running" | "done";

function clock(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

const BAND_COLOUR: Record<string, string> = { low: "#ef4444", average: "#eab308", high: "#22c55e" };

export default function AdaptRunner() {
  const [phase, setPhase] = useState<Phase>("brief");
  const [session, setSession] = useState<AdaptSession | null>(null);
  const [moduleIndex, setModuleIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);
  const [responses, setResponses] = useState<(number | null)[][]>([]);
  const [results, setResults] = useState<AnyResult[]>([]);
  const [remaining, setRemaining] = useState(0);
  const [reviewOpen, setReviewOpen] = useState<string | null>(null);

  // Wall-clock deadline rather than a decremented counter: an interval that is
  // throttled in a background tab would otherwise hand the student free time.
  const deadlineRef = useRef<number>(0);
  const startedAtRef = useRef<number>(0);

  const currentModule = session?.modules[moduleIndex] ?? null;
  const currentItem = currentModule?.items?.[itemIndex] ?? null;
  const currentResponses = responses[moduleIndex] ?? [];
  const isPsychomotor = currentModule?.kind === "psychomotor";

  const start = useCallback((seed?: number) => {
    const s = Number.isInteger(seed) ? (seed as number) : randomSeed();
    const built = buildSession(s, MODULE_IDS);
    setSession(built);
    setResponses(built.modules.map((m) => (m.items ?? []).map(() => null)));
    setResults([]);
    setModuleIndex(0);
    setItemIndex(0);
    setReviewOpen(null);
    deadlineRef.current = Date.now() + built.modules[0].timeLimitSec * 1000;
    startedAtRef.current = Date.now();
    setRemaining(built.modules[0].timeLimitSec);
    setPhase("running");
  }, []);

  const finishModule = useCallback((trackingRaw?: TrackingRaw) => {
    if (!session) return;
    const mod = session.modules[moduleIndex];
    const durationSec = Math.round((Date.now() - startedAtRef.current) / 1000);
    const result: AnyResult =
      mod.kind === "psychomotor"
        // A run with no raw data — the student navigated away mid-task — scores
        // as an unflown run rather than silently as a zero.
        ? scoreTracking(mod, trackingRaw ?? { rmse: null, sampleCount: 0, inputClass: "pointer", worstError: null })
        : scoreModule(mod, responses[moduleIndex], durationSec);
    const nextResults = [...results, result];
    setResults(nextResults);

    const next = moduleIndex + 1;
    if (next >= session.modules.length) {
      setPhase("done");
      return;
    }
    setModuleIndex(next);
    setItemIndex(0);
    deadlineRef.current = Date.now() + session.modules[next].timeLimitSec * 1000;
    startedAtRef.current = Date.now();
    setRemaining(session.modules[next].timeLimitSec);
  }, [session, moduleIndex, responses, results]);

  // The countdown. The trigger here is time passing, not a render, so an effect
  // is the correct mechanism rather than a smell — same reasoning as the other
  // timers in this codebase.
  useEffect(() => {
    // The tracking task owns its own clock and reports when it is finished, so
    // this countdown must stay out of its way — two timers racing to end the
    // same module would double-score it.
    if (phase !== "running" || isPsychomotor) return;
    const id = setInterval(() => {
      const left = (deadlineRef.current - Date.now()) / 1000;
      setRemaining(left);
      if (left <= 0) finishModule();
    }, 250);
    return () => clearInterval(id);
  }, [phase, isPsychomotor, finishModule]);

  const choose = (optionIndex: number) => {
    setResponses((prev) => {
      const copy = prev.map((r) => r.slice());
      copy[moduleIndex][itemIndex] = optionIndex;
      return copy;
    });
  };

  const composite: CompositeResult | null = useMemo(
    () => (phase === "done" ? scoreSession(results) : null),
    [phase, results]
  );

  const answeredCount = currentResponses.filter((r) => r !== null).length;

  // ── Briefing ─────────────────────────────────────────────────────────────
  if (phase === "brief" || !session || !currentModule) {
    return (
      <div className="glass-card p-6 sm:p-8">
        <h2 className="text-2xl font-black text-white mb-2">Your practice session</h2>
        <p className="text-sm mb-6" style={{ color: "#94a3b8" }}>
          {MODULE_IDS.length} timed modules, back to back, exactly as a screening battery runs
          them. No calculator — that is the point. Everything is generated fresh, so you can sit
          this as often as you like and never meet the same paper or the same disturbance twice.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {MODULE_IDS.map((id) => {
            const m = MODULES[id];
            return (
              <div key={id} className="glass-card p-5">
                <div className="font-bold text-white mb-1">{m.name}</div>
                <p className="text-xs mb-3" style={{ color: "#94a3b8" }}>{m.blurb}</p>
                <div className="flex gap-4 text-xs" style={{ color: "#64748b" }}>
                  <span>{m.kind === "psychomotor" ? "one continuous run" : `${m.itemCount} questions`}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {m.timeLimitSec < 60 ? `${m.timeLimitSec} sec` : `${Math.round(m.timeLimitSec / 60)} min`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-lg p-4 mb-6 text-xs leading-relaxed"
             style={{ background: "rgba(240,145,58,0.07)", border: "1px solid rgba(240,145,58,0.25)", color: "#cbd5e1" }}>
          <strong style={{ color: cyan }}>There is no negative marking.</strong> A blank is a
          guaranteed zero and a guess costs you nothing — so never leave a box empty, here or
          in the real thing.
        </div>

        <button onClick={() => start()} className="btn-primary px-8 py-3 font-bold rounded-lg">
          Begin the session
        </button>
      </div>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────
  if (phase === "done") {
    return (
      <div className="select-none" onContextMenu={(e) => e.preventDefault()}>
        <div className="glass-card p-6 sm:p-8 mb-6">
          <h2 className="text-2xl font-black text-white mb-1">Your result</h2>
          <p className="text-xs mb-6" style={{ color: "#64748b" }}>
            Session seed <code style={{ color: cyan }}>{session.seed}</code> — the same seed always
            builds the same paper, so you can sit this one again and compare like for like.
          </p>

          {composite && (
            <div className="flex items-center gap-5 mb-8 p-5 rounded-lg"
                 style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-6xl font-black leading-none" style={{ color: BAND_COLOUR[composite.band.key] }}>
                {composite.stanine}
              </div>
              <div>
                <div className="font-bold text-white">Overall stanine · {composite.band.label}</div>
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{composite.band.advice}</p>
              </div>
            </div>
          )}

          {results.map((r) => isTracking(r) ? (
            <div key={r.moduleId} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white">{r.moduleName}</span>
                <span className="text-sm font-bold" style={{ color: BAND_COLOUR[r.band.key] }}>
                  Stanine {r.stanine} · {r.band.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs mb-3" style={{ color: "#94a3b8" }}>
                <span>
                  {r.cancellation == null
                    ? "Run not completed"
                    : <>You cancelled <strong className="text-white">{Math.round(r.cancellation)}%</strong> of the disturbance</>}
                </span>
                <span>on a {inputLabel(r.inputClass)}</span>
              </div>

              {r.cancellation != null && (
                <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full"
                       style={{ width: `${r.cancellation}%`, background: BAND_COLOUR[r.band.key] }} />
                </div>
              )}

              {r.anomalies.length > 0 && (
                <div className="text-xs p-2 rounded mb-3" style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24" }}>
                  <AlertTriangle className="w-3 h-3 inline mr-1" />
                  {r.anomalies.map((a) => a.detail).join(" ")}
                </div>
              )}

              <details className="text-xs">
                <summary className="cursor-pointer" style={{ color: cyan }}>How this stanine was worked out</summary>
                <p className="mt-2 leading-relaxed" style={{ color: "#94a3b8" }}>
                  Your average error was {r.rmse == null ? "not recorded" : r.rmse.toFixed(3)} against{" "}
                  {r.baseline == null ? "—" : r.baseline.toFixed(3)} for leaving the control centred,
                  measured on a fixed 50&nbsp;per-second clock so the score does not depend on how fast
                  your screen refreshes. {r.rationale} Cut scores, as a percentage cancelled:{" "}
                  {r.cuts.map((c, i) => `${i + 2}→${c}%`).join(", ")}.
                </p>
              </details>
            </div>
          ) : (
            <div key={r.moduleId} className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white">{r.moduleName}</span>
                <span className="text-sm font-bold" style={{ color: BAND_COLOUR[r.band.key] }}>
                  Stanine {r.stanine} · {r.band.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-xs mb-3" style={{ color: "#94a3b8" }}>
                <span>{r.correct} / {r.total} correct ({r.percent}%)</span>
                {r.unanswered > 0 && (
                  <span style={{ color: "#f59e0b" }}>
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    {r.unanswered} left blank — those were free marks
                  </span>
                )}
                {r.overTime && <span style={{ color: "#f59e0b" }}>ran past the clock</span>}
              </div>

              <div className="space-y-1 mb-3">
                {Object.entries(r.byFamily)
                  .sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total)
                  .map(([family, f]) => (
                    <div key={family} className="flex items-center gap-3 text-xs">
                      <span className="w-48 shrink-0 truncate" style={{ color: "#94a3b8" }}>
                        {family.replace(/-/g, " ")}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
                        <div className="h-full rounded-full"
                             style={{ width: `${(f.correct / f.total) * 100}%`, background: f.correct === f.total ? "#22c55e" : cyan }} />
                      </div>
                      <span className="w-10 text-right" style={{ color: "#64748b" }}>{f.correct}/{f.total}</span>
                    </div>
                  ))}
              </div>

              <details className="text-xs">
                <summary className="cursor-pointer" style={{ color: cyan }}>
                  How this stanine was worked out
                </summary>
                <p className="mt-2 leading-relaxed" style={{ color: "#94a3b8" }}>
                  {r.rationale} Scored against a published standard rather than against other
                  students, because we will not print a number derived from a population we have
                  not measured. Cut scores out of {r.total}:{" "}
                  {r.cuts.map((c, i) => `${i + 2}→${c}`).join(", ")}.
                </p>
              </details>

              <button
                onClick={() => setReviewOpen(reviewOpen === r.moduleId ? null : r.moduleId)}
                className="mt-3 text-xs font-bold underline"
                style={{ color: cyan }}
              >
                {reviewOpen === r.moduleId ? "Hide" : "Review"} all {r.total} questions
              </button>

              {reviewOpen === r.moduleId && (
                <div className="mt-4 space-y-4">
                  {r.perItem.map((p, i) => (
                    <div key={i} className="p-4 rounded-lg"
                         style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-start gap-2 mb-2">
                        {p.correct
                          ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#22c55e" }} />
                          : <XCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#ef4444" }} />}
                        <span className="text-xs text-white leading-relaxed">{p.stem}</span>
                      </div>
                      {p.figure && (
                        <div className="flex justify-center my-3" dangerouslySetInnerHTML={{ __html: p.figure }} />
                      )}
                      <div className="text-xs pl-6 space-y-1" style={{ color: "#94a3b8" }}>
                        <div>
                          Correct: <strong style={{ color: "#22c55e" }}>{p.options[p.answerIndex]}</strong>
                          {p.chosen === null
                            ? <span style={{ color: "#f59e0b" }}> — you left this blank</span>
                            : !p.correct && <span style={{ color: "#ef4444" }}> — you chose {p.options[p.chosen]}</span>}
                        </div>
                        {p.errorNote && (
                          <div className="p-2 rounded" style={{ background: "rgba(239,68,68,0.08)", color: "#fca5a5" }}>
                            {p.errorNote}
                          </div>
                        )}
                        <div style={{ color: "#cbd5e1" }}>{p.solution}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-wrap gap-3 mt-8">
            <button onClick={() => start()} className="btn-primary px-6 py-3 font-bold rounded-lg">
              New session
            </button>
            <button onClick={() => start(session.seed)}
                    className="px-6 py-3 font-bold rounded-lg text-sm flex items-center gap-2"
                    style={{ border: `1px solid ${cyan}`, color: cyan }}>
              <RotateCcw className="w-4 h-4" /> Sit this exact paper again
            </button>
          </div>
        </div>

        <div className="glass-card p-5 text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
          <BookOpen className="w-4 h-4 inline mr-2" style={{ color: cyan }} />
          Weak on the maths? The{" "}
          <Link href="/cpl/air-navigation" className="underline font-bold" style={{ color: cyan }}>
            Air Navigation chapters
          </Link>{" "}
          drill speed, distance, time and fuel properly. For the physics, start with{" "}
          <Link href="/cpl/technical-general" className="underline font-bold" style={{ color: cyan }}>
            Technical General
          </Link>.
        </div>
      </div>
    );
  }

  // ── Running: the tracking task ───────────────────────────────────────────
  if (isPsychomotor && currentModule.run) {
    return (
      <div>
        <div className="text-xs mb-2 text-right" style={{ color: "#64748b" }}>
          Module {moduleIndex + 1} of {session.modules.length}
        </div>
        <TrackingTask
          key={currentModule.id}
          run={currentModule.run}
          onComplete={(raw) => finishModule(raw)}
        />
      </div>
    );
  }

  // ── Running: a question paper ────────────────────────────────────────────
  const items = currentModule.items;
  if (!currentItem || !items) return null;
  const low = remaining < 60;
  return (
    <div className="glass-card p-5 sm:p-7 select-none" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold tracking-widest" style={{ color: cyan, letterSpacing: "0.15em" }}>
          {currentModule.name.toUpperCase()}
        </span>
        <span className="text-lg font-black tabular-nums flex items-center gap-2"
              style={{ color: low ? "#ef4444" : "#cbd5e1" }}>
          <Clock className="w-4 h-4" /> {clock(remaining)}
        </span>
      </div>
      <div className="text-xs mb-5" style={{ color: "#64748b" }}>
        Question {itemIndex + 1} of {items.length} · {answeredCount} answered ·
        module {moduleIndex + 1} of {session.modules.length}
      </div>

      <p className="text-white text-base leading-relaxed mb-5">{currentItem.stem}</p>

      {/* Instrument faces for items that must be read rather than computed. The
          SVG is produced by lib/adapt/items/spatial.mjs from numeric inputs —
          no user-supplied content reaches this markup. */}
      {currentItem.figure && (
        <div className="flex justify-center mb-6" dangerouslySetInnerHTML={{ __html: currentItem.figure }} />
      )}

      <div className="space-y-2 mb-6">
        {currentItem.options.map((opt, i) => {
          const picked = currentResponses[itemIndex] === i;
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: picked ? "rgba(240,145,58,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${picked ? cyan : "rgba(255,255,255,0.09)"}`,
                color: picked ? "#fff" : "#cbd5e1",
              }}
            >
              <span className="font-black mr-3" style={{ color: picked ? cyan : "#64748b" }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setItemIndex(i)}
            aria-label={`Question ${i + 1}`}
            className="w-7 h-7 rounded text-xs font-bold"
            style={{
              background: i === itemIndex ? cyan : currentResponses[i] !== null ? "rgba(34,197,94,0.25)" : "rgba(255,255,255,0.05)",
              color: i === itemIndex ? "#0b1220" : currentResponses[i] !== null ? "#86efac" : "#64748b",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setItemIndex((i) => Math.max(0, i - 1))}
          disabled={itemIndex === 0}
          className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-30"
          style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#cbd5e1" }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {itemIndex < items.length - 1 ? (
          <button
            onClick={() => setItemIndex((i) => i + 1)}
            className="px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
            style={{ border: `1px solid ${cyan}`, color: cyan }}
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={() => finishModule()} className="btn-primary px-6 py-2 font-bold rounded-lg text-sm">
            {moduleIndex + 1 < session.modules.length ? "Finish module" : "Finish & see result"}
          </button>
        )}
      </div>
    </div>
  );
}
