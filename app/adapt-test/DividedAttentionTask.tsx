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
import { makeGauge, GAUGE, WINDOW_SEC, phaseIndexAt, PHASES, trackingGainAt, CLEARANCE_SHOW_EXTRA_SEC } from "@/lib/adapt/divided-attention.mjs";
import { makeDisturbance, markerPosition, inputClass, SAMPLE_HZ } from "@/lib/adapt/tracking.mjs";

/**
 * How long this particular interruption is shown for.
 *
 * Falls back to the opening constant only for a run built before windows were
 * carried per event — never as the normal path.
 */
const itemWindow = (item: { window?: number }) => item.window ?? WINDOW_SEC.arithmetic;

/** A fifteen-minute run cannot be read as a raw second count. */
const mmss = (sec: number) => {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};
import type { DividedRun, DividedResponse, Interruption } from "@/lib/adapt/divided-attention.mjs";

const cyan = "#f0913a";

type Props = { run: DividedRun; onComplete: (responses: DividedResponse[]) => void };

export default function DividedAttentionTask({ run, onComplete }: Props) {
  const [phase, setPhase] = useState<"ready" | "running">("ready");
  const [remaining, setRemaining] = useState(run.durationSec);
  const [prompt, setPrompt] = useState<Interruption | null>(null);
  const [promptLeft, setPromptLeft] = useState(0);
  const [flash, setFlash] = useState<null | "ack" | "key" | "traffic" | "landmark">(null);
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
  /**
   * The clearance currently on the strip, or null.
   *
   * It is shown and then it GOES. Nothing re-shows it and nothing logs it for
   * the student to scroll back to — the debrief afterwards is only a memory
   * test if the value was allowed to leave the screen.
   */
  const [clearance, setClearance] = useState<{ id: string; text: string } | null>(null);
  /**
   * The target currently in the outside view, if any.
   *
   * A ref and NOT state, deliberately. The canvas reads it every frame; nothing
   * outside the canvas is allowed to know it, because any control that reacts
   * to a target being present tells the student it is there and destroys the
   * search. It also means no re-render at 60 Hz.
   */
  const sightingRef = useRef<{ id: string; type: string; x: number; y: number } | null>(null);

  // ── The continuous stream ────────────────────────────────────────────────
  //
  // Sampled on the SAME fixed 50 Hz clock the standalone tracking task uses, so
  // the score cannot depend on how fast this student's screen refreshes. The
  // disturbance is amplified per phase by the shared trackingGainAt — the same
  // function the scorer grades with, so the two can never drift apart.
  const distRef = useRef(makeDisturbance(run.trackingSeed));
  const controlRef = useRef({ x: 0, y: 0 });
  const trkIdxRef = useRef(0);
  const trkSumSqRef = useRef(0);
  const trkTakenRef = useRef(0);
  const deviceRef = useRef<string>("pointer");
  const markerRef = useRef({ x: 0, y: 0 });
  /**
   * Display-only heading, integrated from bank. Never reaches the scorer.
   *
   * Seeded from the run, not from Math.random(). Two reasons, and the lint rule
   * that flagged it was right on both: an impure call in a useRef initialiser
   * runs on every render, and a run that starts on a different heading each
   * time is not the same run — which breaks the replay guarantee the whole
   * module is built on ("same seed -> the same fifteen minutes").
   */
  const headingRef = useRef(run.seed % 360);

  /**
   * Seconds since the run began.
   *
   * useCallback, not a bare arrow: performance.now() is impure, and declared
   * plainly in the component body the purity rule reads it as a render-time
   * call. It is only ever invoked from handlers and effects, and wrapping it
   * says so to the compiler as well as to a reader.
   */
  const elapsed = useCallback(() => (performance.now() - startedRef.current) / 1000, []);

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
      // Tones are spaced 0.20s and last 0.18s, so they never overlap and can
      // never sum into clipping.
      const t0 = now + i * 0.2;
      // Attack, HOLD, release. An earlier version ramped straight from attack
      // to silence, which measured at about -26 dBFS through the sustained part
      // of the tone — quiet enough that a student on a phone in a normal room
      // would miss calls, and be marked down for a volume problem rather than
      // an attention one. Rendering it offline and measuring the peak is how
      // that was caught; it is inaudible in a silent office either way.
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.015);
      gain.gain.setValueAtTime(0.35, t0 + 0.13);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.17);
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

  /**
   * Pointer position -> control input, in the same normalised space the scorer
   * uses. The control is what the student ADDS to the disturbance, so holding
   * the marker centred means producing the exact opposite of the drift.
   */
  const readControl = (clientX: number, clientY: number, el: HTMLCanvasElement, pointerType: string) => {
    if (phase !== "running") return;
    const rect = el.getBoundingClientRect();
    const bx = rect.left + rect.width / 2;
    const by = rect.top + rect.height * 0.26;
    const br = Math.min(rect.width * 0.30, rect.height * 0.22);
    const nx = Math.max(-1, Math.min(1, (clientX - bx) / br));
    const ny = Math.max(-1, Math.min(1, (clientY - by) / (br * 0.62)));
    controlRef.current = { x: nx, y: ny };
    deviceRef.current = inputClass(pointerType === "touch" ? "touch" : "pointer");
  };

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

  /**
   * Call what you can see. Scored on WHETHER a target was in view and whether
   * the button matched it — the scorer decides both, from the schedule. This
   * only records that a button was pressed and when.
   */
  const report = (type: "traffic" | "landmark") => {
    if (phase !== "running") return;
    responsesRef.current.push({ stream: "sighting", t: elapsed(), type });
    setFlash(type === "traffic" ? "traffic" : "landmark");
    setTimeout(() => setFlash(null), 180);
  };

  const answerPrompt = (item: Interruption, chosen: number | null) => {
    if (answeredRef.current.has(item.id)) return;
    answeredRef.current.add(item.id);
    // The time is carried so the scorer can report how much of the window the
    // student actually used. It changes no accuracy: a right answer at 5.9s of
    // a 6s window is still right.
    responsesRef.current.push({ stream: "arithmetic", id: item.id, chosen, t: elapsed() });
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
        // The window comes off the ITEM, not off the constant: the run
        // escalates, so a sum late in the session is shown for less time than
        // one at the start, and the display must expire it when the scorer
        // does — otherwise a student sees a prompt they can no longer score on.
        if (t > item.t + itemWindow(item) && !answeredRef.current.has(item.id)) {
          answeredRef.current.add(item.id);
          responsesRef.current.push({ stream: "arithmetic", id: item.id, chosen: null });
          setPrompt((p) => (p && p.id === item.id ? null : p));
        }
      }
      // Throttled to the tenth of a second actually shown, not to the frame
      // rate. Pushing state every frame re-renders the whole task sixty times a
      // second — the one thing a three-task module on a budget phone cannot
      // afford, and it would be the arithmetic overlay that stuttered.
      const live = run.arithmetic.find((i) => t >= i.t && t <= i.t + itemWindow(i) && !answeredRef.current.has(i.id));
      const left10 = live ? Math.max(0, live.t + itemWindow(live) - t) : 0;
      setPromptLeft((prev) => (Math.round(prev * 10) === Math.round(left10 * 10) ? prev : left10));

      // The clearance strip, on the same throttle. Identity is compared on the
      // call id rather than the object, so this sets state once when a strip
      // appears and once when it clears — not ten times a second.
      // The lookout target in view, if any. Same identity-on-id trick as the
      // clearance strip so this sets state twice per target, not per frame.
      const liveSighting = (run.sightings ?? []).find((sg) => t >= sg.t && t <= sg.t + sg.visible);
      sightingRef.current = liveSighting
        ? { id: liveSighting.id, type: liveSighting.type, x: liveSighting.x, y: liveSighting.y }
        : null;

      const liveCall = run.radio.find(
        (c) => c.mine && c.clearance && t >= c.t && t <= c.t + (c.window ?? 3.5) + CLEARANCE_SHOW_EXTRA_SEC
      );
      const liveId = liveCall ? liveCall.id : null;
      setClearance((prev) =>
        (prev ? prev.id : null) === liveId
          ? prev
          : liveCall && liveCall.clearance
            ? { id: liveCall.id, text: liveCall.clearance.text }
            : null
      );

      // ── Sample the continuous stream ──────────────────────────────────────
      //
      // On a fixed 50 Hz grid, not per frame: a 120 Hz laptop must not
      // contribute twice as many samples as a 60 Hz phone over the same minute.
      // Sample instants are idx*dt computed fresh rather than a running total,
      // so floating-point drift cannot creep in device-dependently.
      {
        const dt = 1 / SAMPLE_HZ;
        const target = t + 1e-9;
        // A long stall (tab hidden, phone locked) is SKIPPED, not backfilled —
        // crediting a student with seconds of flawless tracking they never flew
        // would be inventing a score.
        if (target - trkIdxRef.current * dt > 1) {
          trkIdxRef.current = Math.ceil(target / dt);
        } else {
          while (trkIdxRef.current * dt <= target) {
            const st = trkIdxRef.current * dt;
            const g = trackingGainAt(st, run.durationSec);
            const d = distRef.current.at(st);
            const ex = d.x * g + controlRef.current.x;
            const ey = d.y * g + controlRef.current.y;
            trkSumSqRef.current += ex * ex + ey * ey;
            trkTakenRef.current++;
            trkIdxRef.current++;
          }
        }
        const gNow = trackingGainAt(Math.min(t, run.durationSec), run.durationSec);
        const dNow = distRef.current.at(Math.min(t, run.durationSec));
        markerRef.current = markerPosition({ x: dNow.x * gNow, y: dNow.y * gNow }, controlRef.current);
      }

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

          // ── Attitude indicator: keep the wings level ───────────────────
          //
          // PROVENANCE, and it matters. Nobody on this project has seen the
          // real test's screen. This is drawn from ONE sentence in a public
          // video description — the task is "keeping a plane level" — plus the
          // NASA MATB tracking paradigm. "Level" is attitude, not heading, so
          // it is an artificial horizon. It is NOT a reproduction of anyone's
          // display, and must never be described as one.
          //
          // Only the DRAWING changed when this replaced a plain box. The error
          // fed to the scorer is still hypot(x, y) on the same disturbance, so
          // every psychometric property and every test is untouched — a student
          // is graded on the same thing, shown on an instrument instead of a dot.
          {
            const m = markerRef.current;
            const cxA = W / 2, cyA = H * 0.27;
            const rA = Math.min(W * 0.26, H * 0.23);
            // Bank from the lateral error, pitch from the vertical — the sign is
            // inverted so pushing the control RIGHT banks right, which is what a
            // hand expects.
            const bank = Math.max(-1, Math.min(1, m.x)) * (Math.PI / 6);   // ±30°
            const pitchPx = Math.max(-1, Math.min(1, m.y)) * rA * 0.75;

            ctx.save();
            ctx.beginPath(); ctx.arc(cxA, cyA, rA, 0, Math.PI * 2); ctx.clip();
            ctx.translate(cxA, cyA);
            ctx.rotate(-bank);
            ctx.translate(0, pitchPx);

            const big = rA * 2.4;
            ctx.fillStyle = "#1e6fa8";                       // sky
            ctx.fillRect(-big, -big, big * 2, big);
            ctx.fillStyle = "#7a4a1e";                       // ground
            ctx.fillRect(-big, 0, big * 2, big);
            ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(-big, 0); ctx.lineTo(big, 0); ctx.stroke();

            // Pitch ladder — long bars every 10°, short every 5°.
            ctx.lineWidth = 1.5;
            for (let deg = -20; deg <= 20; deg += 5) {
              if (deg === 0) continue;
              const y = (deg / 10) * (rA * 0.38);
              const halfW = deg % 10 === 0 ? rA * 0.30 : rA * 0.16;
              ctx.beginPath(); ctx.moveTo(-halfW, y); ctx.lineTo(halfW, y); ctx.stroke();
            }
            ctx.restore();

            // Bank scale and pointer — fixed to the case, as on a real AI.
            ctx.save();
            ctx.translate(cxA, cyA);
            ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1.5;
            for (const deg of [-30, -20, -10, 0, 10, 20, 30]) {
              const a = -Math.PI / 2 + (deg * Math.PI) / 180;
              const inner = deg === 0 ? rA * 0.80 : rA * 0.88;
              ctx.beginPath();
              ctx.moveTo(Math.cos(a) * inner, Math.sin(a) * inner);
              ctx.lineTo(Math.cos(a) * rA, Math.sin(a) * rA);
              ctx.stroke();
            }
            // The moving bank pointer.
            const pa = -Math.PI / 2 + bank;
            ctx.fillStyle = "#f0913a";
            ctx.beginPath();
            ctx.moveTo(Math.cos(pa) * rA * 0.78, Math.sin(pa) * rA * 0.78);
            ctx.lineTo(Math.cos(pa - 0.06) * rA * 0.66, Math.sin(pa - 0.06) * rA * 0.66);
            ctx.lineTo(Math.cos(pa + 0.06) * rA * 0.66, Math.sin(pa + 0.06) * rA * 0.66);
            ctx.closePath(); ctx.fill();
            ctx.restore();

            // Fixed aircraft symbol — wings and centre dot, standard layout.
            const off = Math.hypot(m.x, m.y);
            const col = off < 0.22 ? "#22c55e" : off < 0.5 ? "#eab308" : "#ef4444";
            ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(cxA - rA * 0.55, cyA); ctx.lineTo(cxA - rA * 0.18, cyA);
            ctx.moveTo(cxA + rA * 0.18, cyA); ctx.lineTo(cxA + rA * 0.55, cyA);
            ctx.moveTo(cxA - rA * 0.18, cyA); ctx.lineTo(cxA - rA * 0.18, cyA + rA * 0.10);
            ctx.moveTo(cxA + rA * 0.18, cyA); ctx.lineTo(cxA + rA * 0.18, cyA + rA * 0.10);
            ctx.stroke();
            ctx.fillStyle = col;
            ctx.beginPath(); ctx.arc(cxA, cyA, 2.5, 0, Math.PI * 2); ctx.fill();

            ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(cxA, cyA, rA, 0, Math.PI * 2); ctx.stroke();

            // The lookout target, drawn in the outside view rather than on an
            // instrument — the whole point is that it is NOT in a known place.
            // Traffic is an aeroplane silhouette, a landmark is a ground square;
            // they are deliberately distinguishable at a glance but only if you
            // actually glance, which is the skill.
            const sg = sightingRef.current;
            if (sg) {
              const sx = sg.x * w;
              const sy = sg.y * h * 0.55;
              ctx.save();
              ctx.globalAlpha = 0.95;
              if (sg.type === "traffic") {
                ctx.strokeStyle = "#e2e8f0";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(sx - 9, sy); ctx.lineTo(sx + 9, sy);
                ctx.moveTo(sx, sy - 5); ctx.lineTo(sx, sy + 4);
                ctx.moveTo(sx - 4, sy + 4); ctx.lineTo(sx + 4, sy + 4);
                ctx.stroke();
              } else {
                ctx.strokeStyle = "#fbbf24";
                ctx.lineWidth = 2;
                ctx.strokeRect(sx - 6, sy - 6, 12, 12);
                ctx.beginPath();
                ctx.moveTo(sx - 6, sy + 6); ctx.lineTo(sx, sy - 10); ctx.lineTo(sx + 6, sy + 6);
                ctx.stroke();
              }
              ctx.restore();
            }

            // Heading tape. Bank produces a turn, so heading integrates bank —
            // aviation-correct, and it gives the student a second cue that they
            // are not level. Display only: it never reaches the scorer.
            headingRef.current = (headingRef.current + (bank / (Math.PI / 6)) * 0.55 + 360) % 360;
            const hdg = headingRef.current;
            const tapeY = cyA - rA - 16, tapeW = rA * 2;
            ctx.save();
            ctx.beginPath(); ctx.rect(cxA - tapeW / 2, tapeY - 9, tapeW, 18); ctx.clip();
            ctx.fillStyle = "rgba(255,255,255,0.05)";
            ctx.fillRect(cxA - tapeW / 2, tapeY - 9, tapeW, 18);
            ctx.strokeStyle = "rgba(255,255,255,0.55)";
            ctx.fillStyle = "rgba(255,255,255,0.75)";
            ctx.font = "10px ui-sans-serif, system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.lineWidth = 1;
            for (let d = -60; d <= 60; d += 10) {
              const mark = Math.round((hdg + d) / 10) * 10;
              const x = cxA + ((mark - hdg) * tapeW) / 120;
              ctx.beginPath(); ctx.moveTo(x, tapeY + 4); ctx.lineTo(x, tapeY + 9); ctx.stroke();
              ctx.fillText(String(((mark % 360) + 360) % 360 || 360).padStart(3, "0"), x, tapeY + 1);
            }
            ctx.restore();
            ctx.fillStyle = "#f0913a";
            ctx.beginPath();
            ctx.moveTo(cxA, tapeY + 11); ctx.lineTo(cxA - 4, tapeY + 17); ctx.lineTo(cxA + 4, tapeY + 17);
            ctx.closePath(); ctx.fill();
          }

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

      const left = Math.max(0, run.durationSec - t);
      setRemaining((prev) => (Math.ceil(prev) === Math.ceil(left) ? prev : left));
      if (left <= 0) {
        if (!doneRef.current) {
          doneRef.current = true;
          for (const item of run.arithmetic) {
            if (!answeredRef.current.has(item.id)) responsesRef.current.push({ stream: "arithmetic", id: item.id, chosen: null });
          }
          try { void audioRef.current?.close(); } catch { /* already closed */ }
          {
            const rmse = trkTakenRef.current === 0 ? null : Math.sqrt(trkSumSqRef.current / trkTakenRef.current);
            if (rmse !== null) responsesRef.current.push({ stream: "tracking", rmse, samples: trkTakenRef.current, inputClass: deviceRef.current });
          }
          onComplete(responsesRef.current);
        }
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, run, playCall, onComplete, elapsed]);

  // Leaving the page ends the run — animation frames stop in a hidden tab and
  // the task would otherwise freeze forever.
  useEffect(() => {
    if (phase !== "running") return;
    const onHide = () => {
      if (document.visibilityState !== "hidden" || doneRef.current) return;
      doneRef.current = true;
      {
            const rmse = trkTakenRef.current === 0 ? null : Math.sqrt(trkSumSqRef.current / trkTakenRef.current);
            if (rmse !== null) responsesRef.current.push({ stream: "tracking", rmse, samples: trkTakenRef.current, inputClass: deviceRef.current });
          }
          onComplete(responsesRef.current);
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [phase, onComplete]);

  // Derived from the clock already being tracked rather than from a second
  // piece of state — two sources for "where are we in the run" is how the
  // banner and the scoring end up disagreeing.
  const livePhase = PHASES[phaseIndexAt(Math.max(0, run.durationSec - remaining), run.durationSec)];

  if (phase === "ready") {
    return (
      <div className="glass-card p-6 sm:p-8">
        <h3 className="text-xl font-black text-white mb-2">Four things at once</h3>
        <ul className="text-sm space-y-2 mb-5" style={{ color: "#94a3b8" }}>
          <li>
            <strong className="text-white">Fly the aeroplane.</strong> Drag anywhere in the top box
            to hold the aircraft symbol on the centre. It drifts the whole time, and it drifts
            harder as the run goes on. This one never stops — it is running while you do
            everything else below, and that is the point.
          </li>
          <li><strong className="text-white">Watch the gauge.</strong> When the needle enters the red, press ACKNOWLEDGE — and only then. Pressing when it is safe costs you marks.</li>
          <li><strong className="text-white">Listen to the radio.</strong> A <em>rising</em> two-tone call is for you: key the mic. A <em>falling</em> call is another aircraft — leave it alone.</li>
          <li><strong className="text-white">Answer the sums.</strong> They interrupt without warning and do not wait.</li>
        </ul>
        <div className="rounded-lg p-3 mb-5 text-xs" style={{ background: "rgba(240,145,58,0.07)", border: "1px solid rgba(240,145,58,0.25)", color: "#cbd5e1" }}>
          <Volume2 className="w-3.5 h-3.5 inline mr-1.5" style={{ color: cyan }} />
          Sound is required for the radio stream — turn it up before you start.
          You cannot ace this by picking a favourite task: abandoning one stream is
          scored as fixation and costs more than being merely average at all four — and flying beautifully while ignoring the rest scores close to nothing.
          <strong className="text-white"> It gets harder as it runs</strong> — calls and sums
          arrive closer together and you get less time to answer each one. Your result
          breaks the run into its three phases, so you can see exactly where you ran out
          of capacity.
        </div>
        <button onClick={begin} className="btn-primary px-6 py-2.5 font-bold rounded-lg text-sm">Start the run</button>
      </div>
    );
  }

  return (
    <div className="glass-card p-5 sm:p-7 select-none" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-widest" style={{ color: cyan, letterSpacing: "0.15em" }}>DIVIDED ATTENTION</span>
        <div className="flex items-center gap-3">
          {/* The phase is shown, and deliberately so. The real assessment does
              not announce its escalation, but a student practising alone needs
              to SEE that the workload climbed — otherwise a drop in the last
              third reads as "I got worse" rather than "it got harder". */}
          <span className="text-[10px] font-bold px-2 py-1 rounded"
                style={{ background: "rgba(240,145,58,0.12)", color: cyan, border: "1px solid rgba(240,145,58,0.3)" }}>
            {livePhase.label.toUpperCase()}
          </span>
          <span className="text-lg font-black tabular-nums" style={{ color: remaining < 30 ? "#ef4444" : "#cbd5e1" }}>
            {mmss(remaining)}
          </span>
        </div>
      </div>

      {audioOk === false && (
        <div className="text-xs p-2 rounded mb-3" style={{ background: "rgba(239,68,68,0.1)", color: "#fca5a5" }}>
          Sound could not start, so the radio stream cannot be heard. Your result will say so.
        </div>
      )}

      {/* The clearance strip. Deliberately plain and deliberately temporary:
          ATC has assigned you something and you will be asked for it after the
          run, with nothing on screen to help you. */}
      <div style={{ minHeight: 44 }} className="mb-2">
        {clearance && (
          <div
            className="px-3 py-2 rounded-lg flex items-center gap-2"
            style={{ background: "rgba(56,189,248,0.10)", border: "1px solid rgba(56,189,248,0.45)" }}
          >
            <Radio className="w-4 h-4 shrink-0" style={{ color: "#38bdf8" }} />
            <span className="text-[10px] font-bold tracking-widest" style={{ color: "#7dd3fc", letterSpacing: "0.15em" }}>
              ATC
            </span>
            <span className="font-black text-white text-base sm:text-lg">{clearance.text}</span>
          </div>
        )}
      </div>

      {/* Taller than it was: the canvas now carries the aeroplane as well as
          the gauge, and both must be readable without scrolling. Dragging
          anywhere inside steers — touch-action:none is load-bearing on a phone
          or the browser scrolls the page instead of flying. */}
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: 300, touchAction: "none", cursor: "none" }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          readControl(e.clientX, e.clientY, e.currentTarget, e.pointerType);
        }}
        onPointerMove={(e) => readControl(e.clientX, e.clientY, e.currentTarget, e.pointerType)}
      />

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

      {/* The lookout. Two buttons, because a lookout with one button is a
          reaction test — telling traffic from a landmark is the discrimination.
          NOTHING here indicates that a target is present. An earlier version lit
          a halo round these buttons while one was in view, which would have
          handed the student the harder half of the task: knowing there is
          something to find is most of visual search. The only way to know is to
          look at the window. */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        <button onClick={() => report("traffic")}
                className="py-3 rounded-lg font-black text-xs"
                style={{ border: `2px solid ${flash === "traffic" ? "#22c55e" : "rgba(255,255,255,0.18)"}`,
                         background: flash === "traffic" ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.03)", color: "#e2e8f0" }}>
          TRAFFIC IN SIGHT
        </button>
        <button onClick={() => report("landmark")}
                className="py-3 rounded-lg font-black text-xs"
                style={{ border: `2px solid ${flash === "landmark" ? "#22c55e" : "rgba(255,255,255,0.18)"}`,
                         background: flash === "landmark" ? "rgba(34,197,94,0.18)" : "rgba(255,255,255,0.03)", color: "#e2e8f0" }}>
          LANDMARK IN SIGHT
        </button>
      </div>

      {prompt && (
        <div className="mt-4 p-4 rounded-lg" style={{ background: "rgba(240,145,58,0.10)", border: `1px solid ${cyan}` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-black text-white text-base sm:text-lg">{prompt.stem}</span>
            <span className="text-sm font-black tabular-nums" style={{ color: promptLeft < 2 ? "#ef4444" : cyan }}>
              {promptLeft.toFixed(1)}s
            </span>
          </div>
          {/* Two across, not four: this slot now carries words as well as
              numbers, and AIRSPEED INDICATOR in a quarter-width button on a
              phone is a reading test, not an attention one. */}
          <div className={prompt.family === "odd" || prompt.family === "spelling" ? "grid grid-cols-2 gap-2" : "grid grid-cols-4 gap-2"}>
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
