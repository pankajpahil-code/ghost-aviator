"use client";

// Control & Co-ordination — the compensatory tracking task.
//
// A marker drifts under a seeded disturbance and the student holds it on the
// centre. All the maths lives in lib/adapt/tracking.mjs; this component only
// draws, reads the input device, and runs the clock.
//
// Two deliberate choices worth keeping:
//
// * Canvas 2D at devicePixelRatio, not WebGL. A crosshair and a circle do not
//   need a GPU pipeline, and WebGL is the thing most likely to fail on the
//   budget Android this site is built for.
// * The scoring clock is NOT the render loop. `tracker.sample()` takes samples
//   on a fixed 50 Hz grid however often we happen to draw, so a 144 Hz laptop
//   and a 60 Hz phone are scored on the same number of samples at the same
//   instants. Drawing is best-effort; scoring is a metronome.

import { useCallback, useEffect, useRef, useState } from "react";
import { Gamepad2, Hand, MousePointer2 } from "lucide-react";
import { makeTracker, inputClass, inputLabel } from "@/lib/adapt/tracking.mjs";

const cyan = "#f0913a";

export type TrackingRaw = {
  rmse: number | null;
  sampleCount: number;
  worstError: number;
  inputClass: string;
};

type Props = {
  run: { seed: number; durationSec: number; sampleHz: number };
  onComplete: (raw: TrackingRaw) => void;
};

export default function TrackingTask({ run, onComplete }: Props) {
  const [phase, setPhase] = useState<"ready" | "counting" | "running">("ready");
  const [countIn, setCountIn] = useState(3);
  const [remaining, setRemaining] = useState(run.durationSec);
  const [device, setDevice] = useState<string>("pointer");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controlRef = useRef({ x: 0, y: 0 });
  const deviceRef = useRef<string>("pointer");
  const trackerRef = useRef<ReturnType<typeof makeTracker> | null>(null);
  const startedRef = useRef(0);
  const doneRef = useRef(false);

  const clampUnit = (x: number, y: number) => {
    const r = Math.hypot(x, y);
    return r > 1 ? { x: x / r, y: y / r } : { x, y };
  };

  // ── Input ────────────────────────────────────────────────────────────────
  const readPointer = useCallback((clientX: number, clientY: number, pointerType: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const radius = Math.min(rect.width, rect.height) / 2;
    const nx = (clientX - (rect.left + rect.width / 2)) / radius;
    const ny = (clientY - (rect.top + rect.height / 2)) / radius;
    controlRef.current = clampUnit(nx, ny);
    const cls = inputClass(pointerType === "touch" ? "touch" : "pointer");
    if (deviceRef.current !== cls) { deviceRef.current = cls; setDevice(cls); }
  }, []);

  // A connected gamepad wins: an analogue stick is the device the real
  // assessment uses, and a student who owns one should be able to train on it.
  const readGamepad = useCallback(() => {
    const pads = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];
    for (const pad of pads) {
      if (!pad || pad.axes.length < 2) continue;
      const [ax, ay] = pad.axes;
      // Dead zone: a resting stick that reads 0.03 must not count as an input.
      if (Math.hypot(ax, ay) < 0.08 && deviceRef.current.startsWith("gamepad:") === false) continue;
      controlRef.current = clampUnit(ax, ay);
      const cls = inputClass("gamepad", pad.id);
      if (deviceRef.current !== cls) { deviceRef.current = cls; setDevice(cls); }
      return true;
    }
    return false;
  }, []);

  // ── Draw + score loop ────────────────────────────────────────────────────
  //
  // The loop lives inside the effect rather than in a useCallback so it can
  // safely schedule itself. A self-referencing useCallback captures whichever
  // version of itself existed on the first frame, so once any dependency
  // changed the loop would keep running the stale closure for the rest of the
  // minute — reading a dead tracker and scoring nothing.
  useEffect(() => {
    if (phase !== "running") return;
    let raf = 0;
    const loop = () => {
      const canvas = canvasRef.current;
      const tracker = trackerRef.current;
      if (!canvas || !tracker) return;

      const elapsed = (performance.now() - startedRef.current) / 1000;
      readGamepad();
      tracker.sample(Math.min(elapsed, run.durationSec), controlRef.current);

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = Math.round(rect.width * dpr);
      const h = Math.round(rect.height * dpr);
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const R = Math.min(rect.width, rect.height) / 2 - 6;

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Field
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.02)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Target rings and crosshair
      for (const frac of [0.18, 0.36]) {
        ctx.beginPath();
        ctx.arc(cx, cy, R * frac, 0, Math.PI * 2);
        ctx.strokeStyle = frac === 0.18 ? "rgba(34,197,94,0.55)" : "rgba(255,255,255,0.10)";
        ctx.lineWidth = frac === 0.18 ? 2 : 1;
        ctx.stroke();
      }
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R);
      ctx.stroke();

      // The marker: disturbance plus the student's control.
      const d = tracker.at(Math.min(elapsed, run.durationSec));
      const mx = cx + (d.x + controlRef.current.x) * R;
      const my = cy + (d.y + controlRef.current.y) * R;
      const err = Math.hypot(d.x + controlRef.current.x, d.y + controlRef.current.y);
      const onTarget = err < 0.18;

      ctx.beginPath();
      ctx.arc(mx, my, 11, 0, Math.PI * 2);
      ctx.fillStyle = onTarget ? "rgba(34,197,94,0.22)" : "rgba(240,145,58,0.18)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(mx, my, 6, 0, Math.PI * 2);
      ctx.fillStyle = onTarget ? "#22c55e" : cyan;
      ctx.fill();

      // Only push state when the DISPLAYED value changes. Calling setRemaining
      // every frame re-renders the whole component sixty times a second to show
      // a number that changes once a second — wasted work everywhere, and
      // visible jank on the budget Android this site is built for.
      const left = Math.max(0, run.durationSec - elapsed);
      setRemaining((prev) => (Math.ceil(prev) === Math.ceil(left) ? prev : left));

      if (left <= 0) {
        if (!doneRef.current) {
          doneRef.current = true;
          onComplete({
            rmse: tracker.rmse(),
            sampleCount: tracker.sampleCount,
            worstError: tracker.worstError,
            inputClass: deviceRef.current,
          });
        }
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, run.durationSec, readGamepad, onComplete]);

  // Leaving the page ends the run.
  //
  // Animation frames stop entirely in a hidden tab, so the task would otherwise
  // sit frozen forever waiting for a clock that is not running. Ending it here
  // means the student gets told the run was interrupted — scoreTracking sees
  // the short sample count and flags it — rather than staring at a dead canvas.
  useEffect(() => {
    if (phase !== "running") return;
    const onHide = () => {
      if (document.visibilityState !== "hidden" || doneRef.current) return;
      const tracker = trackerRef.current;
      doneRef.current = true;
      onComplete({
        rmse: tracker?.rmse() ?? null,
        sampleCount: tracker?.sampleCount ?? 0,
        worstError: tracker?.worstError ?? 0,
        inputClass: deviceRef.current,
      });
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [phase, onComplete]);

  // Count-in, so nobody starts mid-blink.
  //
  // The state changes happen inside the timer callback rather than in the
  // effect body. That is not lint appeasement: a transition fired from the
  // effect body runs during render-commit, whereas this one is genuinely
  // triggered by time elapsing, which is what a timer callback expresses.
  useEffect(() => {
    if (phase !== "counting") return;
    const id = setTimeout(() => {
      if (countIn <= 1) {
        trackerRef.current = makeTracker({ seed: run.seed, sampleHz: run.sampleHz });
        startedRef.current = performance.now();
        doneRef.current = false;
        setPhase("running");
      } else {
        setCountIn((c) => c - 1);
      }
    }, 800);
    return () => clearTimeout(id);
  }, [phase, countIn, run.seed, run.sampleHz]);

  const pointerProps = {
    onPointerDown: (e: React.PointerEvent<HTMLCanvasElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      readPointer(e.clientX, e.clientY, e.pointerType);
    },
    onPointerMove: (e: React.PointerEvent<HTMLCanvasElement>) => readPointer(e.clientX, e.clientY, e.pointerType),
  };

  const DeviceIcon = device.startsWith("gamepad:") ? Gamepad2 : device === "touch" ? Hand : MousePointer2;

  return (
    <div className="glass-card p-5 sm:p-7 select-none" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold tracking-widest" style={{ color: cyan, letterSpacing: "0.15em" }}>
          CONTROL &amp; CO-ORDINATION
        </span>
        <span className="text-lg font-black tabular-nums" style={{ color: remaining < 10 ? "#ef4444" : "#cbd5e1" }}>
          {Math.ceil(remaining)}s
        </span>
      </div>
      <p className="text-xs mb-4" style={{ color: "#64748b" }}>
        Keep the marker inside the green ring. It will fight you the whole minute — that is the test.
      </p>

      <div className="flex justify-center mb-4">
        <div className="relative" style={{ width: "min(340px, 80vw)", aspectRatio: "1 / 1" }}>
          <canvas
            ref={canvasRef}
            {...pointerProps}
            className="w-full h-full rounded-full"
            // touch-action:none is load-bearing on a phone: without it, dragging
            // the marker scrolls the page instead of flying the task.
            style={{ touchAction: "none", cursor: "none", background: "rgba(0,0,0,0.25)" }}
          />
          {phase !== "running" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full text-center px-6"
                 style={{ background: "rgba(11,18,32,0.82)" }}>
              {phase === "ready" ? (
                <>
                  <p className="text-xs mb-4" style={{ color: "#cbd5e1" }}>
                    Drag anywhere inside the circle to steer. A joystick is used automatically if
                    one is plugged in.
                  </p>
                  <button onClick={() => { setCountIn(3); setPhase("counting"); }}
                          className="btn-primary px-6 py-2.5 font-bold rounded-lg text-sm">
                    Start the run
                  </button>
                </>
              ) : (
                <span className="text-6xl font-black" style={{ color: cyan }}>{countIn === 0 ? "GO" : countIn}</span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs" style={{ color: "#64748b" }}>
        <DeviceIcon className="w-3.5 h-3.5" />
        <span>Scored against others using a {inputLabel(device)} — never across different devices.</span>
      </div>
    </div>
  );
}
