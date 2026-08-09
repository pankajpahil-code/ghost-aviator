"use client";

// Divided Attention — three tasks at once.
//
// The schedule, the gauge and the scoring all live in
// lib/adapt/divided-attention.mjs. This component draws a needle, plays two
// tones, and collects what the student did.
//
// ── Why tones and not speech ───────────────────────────────────────────────
//
// The real battery reads callsigns aloud. `speechSynthesis` cannot be routed
// through Web Audio, fails silently on some Android builds, and its timing
// varies by device and installed voice — none of which is acceptable in a task
// that is being SCORED on when you responded. Two synthesised tones are
// sample-accurate on the audio clock, cost nothing, need no TTS provider, and
// still test the thing that matters: telling your call from someone else's
// while your eyes are somewhere else. When a pre-generated voice bank exists, a
// spoken callsign drops into this same slot without touching the scoring.

import { useCallback, useEffect, useRef, useState } from "react";
import { Radio, Volume2 } from "lucide-react";
import { makeGauge, GAUGE, WINDOW_SEC } from "@/lib/adapt/divided-attention.mjs";
import type { DividedRun, DividedResponse, Interruption } from "@/lib/adapt/divided-attention.mjs";

const cyan = "#f0913a";

type Props = { run: DividedRun; onComplete: (responses: DividedResponse[]) => void };

export default function DividedAttentionTask({ run, onComplete }: Props) {
  const [phase, setPhase] = useState<"ready" | "running">("ready");
  const [remaining, setRemaining] = useState(run.durationSec);
  const [prompt, setPrompt] = useState<Interruption | null>(null);
  const [promptLeft, setPromptLeft] = useState(0);
  const [flash, setFlash] = useState<null | "ack" | "key">(null);
  const [audioOk, setAudioOk] = useState<boolean | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const responsesRef = useRef<DividedResponse[]>([]);
  const startedRef = useRef(0);
  const doneRef = useRef(false);
  const playedRef = useRef<Set<string>>(new Set());
  const shownRef = useRef<Set<string>>(new Set());
  const answeredRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<AudioContext | null>(null);
  const gaugeRef = useRef(makeGauge(run.gaugeSeed));

  const elapsed = () => (performance.now() - startedRef.current) / 1000;

  /** Two-tone radio call. Rising means it is for you; falling is other traffic. */
  const playCall = useCallback((mine: boolean) => {
    const ctx = audioRef.current;
    if (!ctx) return;
    const now = ctx.currentTime;
    const pair = mine ? [880, 1320] : [660, 440];
    pair.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      const t0 = now + i * 0.17;
      // Short attack/release: a hard square-wave edge clicks unpleasantly, and
      // this is meant to sound like a radio, not an alarm clock.
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.16, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.15);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.18);
    });
  }, []);

  const begin = useCallback(() => {
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctor();
      void ctx.resume();
      audioRef.current = ctx;
      setAudioOk(ctx.state !== "suspended");
    } catch {
      setAudioOk(false);
    }
    responsesRef.current = [];
    playedRef.current = new Set();
    shownRef.current = new Set();
    answeredRef.current = new Set();
    doneRef.current = false;
    startedRef.current = performance.now();
    setRemaining(run.durationSec);
    setPhase("running");
  }, [run.durationSec]);

  const acknowledge = () => {
    if (phase !== "running") return;
    responsesRef.current.push({ stream: "monitor", t: elapsed() });
    setFlash("ack");
    setTimeout(() => setFlash(null), 180);
  };

  const keyMic = () => {
    if (phase !== "running") return;
    responsesRef.current.push({ stream: "radio", t: elapsed() });
    setFlash("key");
    setTimeout(() => setFlash(null), 180);
  };

  const answerPrompt = (item: Interruption, chosen: number | null) => {
    if (answeredRef.current.has(item.id)) return;
    answeredRef.current.add(item.id);
    responsesRef.current.push({ stream: "arithmetic", id: item.id, chosen });
    setPrompt(null);
  };

  // The loop: draw the needle, fire radio calls and interruptions on schedule.
  useEffect(() => {
    if (phase !== "running") return;
    let raf = 0;
    const loop = () => {
      const t = elapsed();
      const canvas = canvasRef.current;

      for (const call of run.radio) {
        if (t >= call.t && !playedRef.current.has(call.id)) {
          playedRef.current.add(call.id);
          playCall(call.mine);
        }
      }

      for (const item of run.arithmetic) {
        if (t >= item.t && !shownRef.current.has(item.id)) {
          shownRef.current.add(item.id);
          setPrompt(item);
        }
        // Time-out an unanswered prompt rather than letting it sit there.
        if (t > item.t + WINDOW_SEC.arithmetic && !answeredRef.current.has(item.id)) {
          answeredRef.current.add(item.id);
          responsesRef.current.push({ stream: "arithmetic", id: item.id, chosen: null });
          setPrompt((p) => (p && p.id === item.id ? null : p));
        }
      }
      const live = run.arithmetic.find((i) => t >= i.t && t <= i.t + WINDOW_SEC.arithmetic && !answeredRef.current.has(i.id));
      setPromptLeft(live ? Math.max(0, live.t + WINDOW_SEC.arithmetic - t) : 0);

      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = Math.round(rect.width * dpr), h = Math.round(rect.height * dpr);
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
          const W = rect.width, H = rect.height;
          const cx = W / 2, cy = H * 0.82, R = Math.min(W / 2, H * 0.72) - 8;
          ctx.clearRect(0, 0, W, H);

          const A0 = Math.PI, A1 = 2 * Math.PI; // half-dial, left to right
          const angleFor = (v: number) => A0 + ((v - GAUGE.min) / (GAUGE.max - GAUGE.min)) * (A1 - A0);

          ctx.lineWidth = 12;
          ctx.strokeStyle = "rgba(255,255,255,0.10)";
          ctx.beginPath(); ctx.arc(cx, cy, R, A0, A1); ctx.stroke();

          ctx.strokeStyle = "rgba(239,68,68,0.85)";
          ctx.beginPath(); ctx.arc(cx, cy, R, angleFor(GAUGE.redline), A1); ctx.stroke();

          const value = gaugeRef.current.at(Math.min(t, run.durationSec));
          const hot = value >= GAUGE.redline;
          const a = angleFor(value);
          ctx.strokeStyle = hot ? "#ef4444" : cyan;
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(a) * (R - 14), cy + Math.sin(a) * (R - 14));
          ctx.stroke();
          ctx.fillStyle = hot ? "#ef4444" : cyan;
          ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill();
        }
      }

      const left = run.durationSec - t;
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        if (!doneRef.current) {
          doneRef.current = true;
          for (const item of run.arithmetic) {
            if (!answeredRef.current.has(item.id)) responsesRef.current.push({ stream: "arithmetic", id: item.id, chosen: null });
          }
          try { void audioRef.current?.close(); } catch { /* already closed */ }
          onComplete(responsesRef.current);
        }
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, run, playCall, onComplete]);

  // Leaving the page ends the run — animation frames stop in a hidden tab and
  // the task would otherwise freeze forever.
  useEffect(() => {
    if (phase !== "running") return;
    const onHide = () => {
      if (document.visibilityState !== "hidden" || doneRef.current) return;
      doneRef.current = true;
      onComplete(responsesRef.current);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [phase, onComplete]);

  if (phase === "ready") {
    return (
      <div className="glass-card p-6 sm:p-8">
        <h3 className="text-xl font-black text-white mb-2">Three things at once</h3>
        <ul className="text-sm space-y-2 mb-5" style={{ color: "#94a3b8" }}>
          <li><strong className="text-white">Watch the gauge.</strong> When the needle enters the red, press ACKNOWLEDGE — and only then. Pressing when it is safe costs you marks.</li>
          <li><strong className="text-white">Listen to the radio.</strong> A <em>rising</em> two-tone call is for you: key the mic. A <em>falling</em> call is another aircraft — leave it alone.</li>
          <li><strong className="text-white">Answer the sums.</strong> They interrupt without warning and do not wait.</li>
        </ul>
        <div className="rounded-lg p-3 mb-5 text-xs" style={{ background: "rgba(240,145,58,0.07)", border: "1px solid rgba(240,145,58,0.25)", color: "#cbd5e1" }}>
          <Volume2 className="w-3.5 h-3.5 inline mr-1.5" style={{ color: cyan }} />
          Sound is required for the radio stream — turn it up before you start.
          You cannot ace this by picking a favourite task: abandoning one stream is
          scored as fixation and costs more than being merely average at all three.
        </div>
        <button onClick={begin} className="btn-primary px-6 py-2.5 font-bold rounded-lg text-sm">Start the run</button>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 sm:p-7 select-none" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-widest" style={{ color: cyan, letterSpacing: "0.15em" }}>DIVIDED ATTENTION</span>
        <span className="text-lg font-black tabular-nums" style={{ color: remaining < 20 ? "#ef4444" : "#cbd5e1" }}>
          {Math.ceil(remaining)}s
        </span>
      </div>

      {audioOk === false && (
        <div className="text-xs p-2 rounded mb-3" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}>
          Sound could not start, so the radio stream cannot be heard. Your result will say so.
        </div>
      )}

      <canvas ref={canvasRef} className="w-full" style={{ height: 150 }} />

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button onClick={acknowledge}
                className="py-4 rounded-lg font-black text-sm"
                style={{ border: `2px solid ${flash === "ack" ? "#22c55e" : "rgba(255,255,255,0.18)"}`,
                         background: flash === "ack" ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.03)", color: "#e2e8f0" }}>
          ACKNOWLEDGE
        </button>
        <button onClick={keyMic}
                className="py-4 rounded-lg font-black text-sm flex items-center justify-center gap-2"
                style={{ border: `2px solid ${flash === "key" ? "#22c55e" : "rgba(255,255,255,0.18)"}`,
                         background: flash === "key" ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.03)", color: "#e2e8f0" }}>
          <Radio className="w-4 h-4" /> KEY MIC
        </button>
      </div>

      {prompt && (
        <div className="mt-4 p-4 rounded-lg" style={{ background: "rgba(240,145,58,0.10)", border: `1px solid ${cyan}` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-white text-lg">{prompt.stem} = ?</span>
            <span className="text-sm font-black tabular-nums" style={{ color: promptLeft < 2 ? "#ef4444" : cyan }}>
              {promptLeft.toFixed(1)}s
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {prompt.options.map((o, i) => (
              <button key={i} onClick={() => answerPrompt(prompt, i)}
                      className="py-2.5 rounded font-bold text-sm"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.14)", color: "#e2e8f0" }}>
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
