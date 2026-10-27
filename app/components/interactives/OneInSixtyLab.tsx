"use client";

// Interactive version of Air Navigation Ch.11 figures 3-11: the student sets the
// distance gone, the distance off and the leg length, and steps through the
// double-TEA and TEA + closing-angle corrections; a third tab drills the sums.
// All arithmetic comes from lib/interactives/one-in-sixty.ts, which is checked
// against the chapter's own worked examples (tools/audit/one-in-sixty-check.mts).
// The chapter's static figures stay on the page below this, unchanged.
//
// Styles are inline on purpose: this renders inside .ga-notes, where each
// chapter's own stylesheet targets bare button/input/h3, and inline styles are
// the one thing those rules cannot override.

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import {
  trackErrorAngle, closingAngle, directTurn, combinedTurn, doubleTea, exactAngle,
  turnDirection, fmt, type Side,
} from "@/lib/interactives/one-in-sixty";

type Mode = "double" | "direct" | "drill";

const C = {
  ink: "#0f172a", muted: "#475569", line: "#cbd5e1", card: "#ffffff", soft: "#f1f5f9",
  track: "#64748b", tmg: "#dc2626", fix: "#2563eb", good: "#16a34a", accent: "#7c3aed",
};

const H = 230, YMID = 115;

// On a phone the 640-wide drawing shrank to half size and its labels to ~6 px.
// A narrower drawing area with larger type keeps them readable at 375 px.
const NARROW = "(max-width: 560px)";
function useNarrow() {
  return useSyncExternalStore(
    cb => { const q = window.matchMedia(NARROW); q.addEventListener("change", cb); return () => q.removeEventListener("change", cb); },
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
}
const FontSize = createContext(13);

// ─── Diagram ────────────────────────────────────────────────────────────────

function Segment({ x1, y1, x2, y2, color, shown, dashed }: {
  x1: number; y1: number; x2: number; y2: number; color: string; shown: boolean; dashed?: boolean;
}) {
  // A solid leg draws itself in from its start: one dash as long as the leg,
  // offset by its own length until shown. (pathLength=1 did not scale a
  // CSS-set dash array in Chrome and drew only a stub.)
  const len = Math.hypot(x2 - x1, y2 - y1);
  return (
    <path
      d={`M${x1},${y1} L${x2},${y2}`}
      fill="none"
      stroke={color}
      strokeWidth={dashed ? 2 : 3}
      strokeLinecap="round"
      style={{
        strokeDasharray: dashed ? "6 5" : `${len} ${len}`,
        strokeDashoffset: shown || dashed ? 0 : len,
        opacity: shown ? 1 : 0,
        transition: "stroke-dashoffset .7s ease, opacity .3s",
      }}
    />
  );
}

function Label({ x, y, text, color, anchor = "middle" }: {
  x: number; y: number; text: string; color: string; anchor?: "start" | "middle" | "end";
}) {
  const fs = useContext(FontSize);
  return (
    <text x={x} y={Math.min(H - 6, Math.max(fs + 3, y))} fill={color} fontSize={fs} fontWeight={700} textAnchor={anchor}
          fontFamily="system-ui, sans-serif" style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 4 }}>
      {text}
    </text>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────

export default function OneInSixtyLab() {
  const [mode, setMode] = useState<Mode>("double");
  const [gone, setGone] = useState(30);
  const [off, setOff] = useState(4);
  const [total, setTotal] = useState(78);
  const [side, setSide] = useState<Side>("left");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const narrow = useNarrow();
  const W = narrow ? 380 : 640, X0 = narrow ? 24 : 36, X1 = W - X0;
  const lastStep = mode === "double" ? 4 : 3;

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStep(s => Math.min(lastStep, s + 1)), 1400);
    return () => clearInterval(t);
  }, [playing, lastStep]);
  // Stop at the last step (state adjusted during render, not in the timer's updater).
  if (playing && step >= lastStep) setPlaying(false);

  const changeMode = (m: Mode) => { setMode(m); setStep(0); setPlaying(false); };
  // Moving a slider shows at least the fix, so the student sees what changed.
  const touched = () => setStep(s => Math.max(s, 1));
  const onGone = (n: number) => { setGone(n); if (total <= n) setTotal(n + 5); touched(); };
  const onOff = (n: number) => { setOff(n); touched(); };
  const onTotal = (n: number) => { setTotal(n); touched(); };

  const tea = trackErrorAngle(off, gone);
  const toGo = total - gone;
  const ca = closingAngle(off, toGo);
  const dir = turnDirection(side);
  const back = side; // after regaining track you turn back towards the side you were on
  const dbl = doubleTea(off, gone);
  const pastHalf = dbl.regainAt > total;

  // Along-track scale covers B, and the regain point when it falls beyond B.
  const span = mode === "double" ? Math.max(total, dbl.regainAt) : total;
  const kx = (X1 - X0) / span;
  // Sideways the picture is scaled up when the leg is long, or the error would be invisible.
  const ky = Math.max(kx, 7);
  const exaggerated = ky > kx * 1.05;
  const x = (d: number) => X0 + d * kx;
  const sgn = side === "left" ? -1 : 1;
  const yC = YMID + sgn * off * ky;
  const xC = x(gone);

  // Where the aircraft symbol sits, and which way it points, at each step.
  const pts: Record<Mode, [number, number][]> = {
    double: [[X0, YMID], [xC, yC], [xC, yC], [x(dbl.regainAt), YMID], [x(Math.min(span, dbl.regainAt + span * 0.12)), YMID]],
    direct: [[X0, YMID], [xC, yC], [x(total), YMID], [x(total), YMID]],
    drill: [[X0, YMID]],
  };
  const path = pts[mode];
  const si = Math.min(step, path.length - 1);
  const [px, py] = path[si];
  // Point the aircraft along the leg it arrived on; at A, along the planned track.
  let prev = si;
  while (prev > 0 && path[prev - 1][0] === px && path[prev - 1][1] === py) prev--;
  const rot = prev > 0 ? (Math.atan2(py - path[prev - 1][1], px - path[prev - 1][0]) * 180) / Math.PI : 0;

  const caption: Record<Mode, string[]> = {
    double: [
      `Planned track from A to B, ${total} NM. Press Next or Play.`,
      `Fix after ${gone} NM: ${off} NM ${side} of track. TEA = ${off} ÷ ${gone} × 60 = ${fmt(tea)}°.`,
      `Do nothing and the error keeps growing. Turning only ${fmt(tea)}° ${dir} would just parallel the track, still ${off} NM off.`,
      `Turn double the TEA: 2 × ${fmt(tea)}° = ${fmt(dbl.turn)}° ${dir}. You close at ${fmt(tea)}° and meet the track after another ${gone} NM, at ${dbl.regainAt} NM: the same time it took to go off.`,
      `Back on track: turn ${fmt(tea)}° ${back}. You now hold a heading ${fmt(tea)}° ${dir} of the original, which is right for the actual wind.`,
    ],
    direct: [
      `Planned track from A to B, ${total} NM. Press Next or Play.`,
      `Fix after ${gone} NM: ${off} NM ${side} of track. TEA = ${off} ÷ ${gone} × 60 = ${fmt(tea)}°.`,
      `${toGo} NM to go. Closing angle = ${off} ÷ ${toGo} × 60 = ${fmt(ca)}°.`,
      `Turn ${dir} by TEA + CA = ${fmt(tea)}° + ${fmt(ca)}° = ${fmt(directTurn(off, gone, total))}°. One step: CA × total ÷ gone = ${fmt(ca)}° × ${total} ÷ ${gone} = ${fmt(combinedTurn(off, gone, total))}°.`,
    ],
    drill: [""],
  };

  return (
    <section aria-label="Interactive: the 1 in 60 rule" style={S.card}>
      <div style={S.head}>
        <span style={S.badge}>TRY IT</span>
        <span style={S.title}>Track correction lab: the 1 in 60 rule</span>
      </div>
      <div style={S.tabs} role="tablist">
        {([["double", "Double TEA"], ["direct", "TEA + Closing angle"], ["drill", "Test me"]] as [Mode, string][]).map(([m, label]) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => changeMode(m)}
                  style={{ ...S.tab, ...(mode === m ? S.tabOn : null) }}>{label}</button>
        ))}
      </div>

      {mode === "drill" ? <Drill /> : (
        <FontSize.Provider value={narrow ? 15 : 13}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" style={{ display: "block", maxWidth: "100%", height: "auto", background: C.soft, borderRadius: 12 }}
               aria-label={caption[mode][Math.min(step, lastStep)]}>
            {/* planned track */}
            <line x1={X0} y1={YMID} x2={x(total)} y2={YMID} stroke={C.track} strokeWidth={2} strokeDasharray="6 5" />
            <circle cx={X0} cy={YMID} r={5} fill={C.ink} />
            <circle cx={x(total)} cy={YMID} r={5} fill={C.ink} />
            <Label x={X0} y={YMID + (sgn > 0 ? -12 : 24)} text="A" color={C.ink} />
            <Label x={x(total)} y={YMID + (sgn > 0 ? -12 : 24)} text="B" color={C.ink} />

            {/* A to the fix */}
            <Segment x1={X0} y1={YMID} x2={xC} y2={yC} color={C.tmg} shown={step >= 1} />
            {step >= 1 && <>
              <circle cx={xC} cy={yC} r={4.5} fill={C.tmg} />
              <Label x={xC} y={yC + sgn * 20} text={`${off} NM ${side}`} color={C.tmg} />
              <Label x={X0 + 54} y={YMID + sgn * 18} text={`TEA ${fmt(tea)}°`} color={C.tmg} anchor="start" />
            </>}

            {mode === "double" && <>
              {/* no correction: same line carried on */}
              <Segment x1={xC} y1={yC} x2={x(dbl.regainAt)} y2={YMID + sgn * 2 * off * ky} color={C.track} dashed shown={step >= 2} />
              {step >= 2 && <Label x={x(dbl.regainAt)} y={YMID + sgn * (2 * off * ky + 16)} text="no correction" color={C.track} anchor="end" />}
              <Segment x1={xC} y1={yC} x2={x(dbl.regainAt)} y2={YMID} color={C.fix} shown={step >= 3} />
              {step >= 3 && <Label x={(xC + x(dbl.regainAt)) / 2} y={(yC + YMID) / 2 + sgn * 18}
                                   text={`turn ${fmt(dbl.turn)}° ${dir}`} color={C.fix} />}
              <Segment x1={x(dbl.regainAt)} y1={YMID} x2={x(Math.min(span, dbl.regainAt + span * 0.12))} y2={YMID} color={C.good} shown={step >= 4} />
              {step >= 3 && <>
                <circle cx={x(dbl.regainAt)} cy={YMID} r={4.5} fill={C.good} />
                <Label x={x(dbl.regainAt)} y={YMID - sgn * 14} text={`${dbl.regainAt} NM`} color={C.good} />
              </>}
            </>}

            {mode === "direct" && <>
              <Segment x1={xC} y1={yC} x2={x(total)} y2={YMID} color={C.fix} shown={step >= 2} />
              {step >= 2 && <Label x={(xC + x(total)) / 2} y={(yC + YMID) / 2 + sgn * 18}
                                   text={`CA ${fmt(ca)}°`} color={C.fix} />}
              {step >= 3 && <Label x={xC} y={yC + sgn * 42} text={`turn ${fmt(directTurn(off, gone, total))}° ${dir}`} color={C.accent} />}
            </>}

            {/* aircraft */}
            <g style={{ transform: `translate(${px}px, ${py}px) rotate(${rot}deg)`, transition: "transform .7s ease" }}>
              <path d="M10,0 L-7,-6 L-3,0 L-7,6 Z" fill={C.ink} />
            </g>
          </svg>

          <p aria-live="polite" style={S.caption}>{caption[mode][Math.min(step, lastStep)]}</p>
          {mode === "double" && pastHalf && step >= 3 && (
            <p style={S.warn}>
              You are more than half-way along the leg, so double the TEA meets the track only after B.
              Use the TEA + Closing angle tab instead.
            </p>
          )}

          <div style={S.row}>
            <button type="button" style={S.btn} onClick={() => { setPlaying(false); setStep(s => Math.max(0, s - 1)); }} disabled={step === 0}>← Back</button>
            <button type="button" style={{ ...S.btn, ...S.btnMain }} onClick={() => { if (step >= lastStep) setStep(0); setPlaying(p => !p); }}>
              {playing ? "Pause" : step >= lastStep ? "Replay" : "Play"}
            </button>
            <button type="button" style={S.btn} onClick={() => { setPlaying(false); setStep(s => Math.min(lastStep, s + 1)); }} disabled={step >= lastStep}>Next →</button>
            <span style={{ ...S.small, marginLeft: "auto" }}>Step {Math.min(step, lastStep)} of {lastStep}</span>
          </div>

          <div style={S.controls}>
            <Slider label="Distance gone" unit="NM" min={5} max={150} value={gone} onChange={onGone} />
            <Slider label="Distance off track" unit="NM" min={1} max={10} value={off} onChange={onOff} />
            <Slider label="Leg length A to B" unit="NM" min={gone + 1} max={200} value={total} onChange={onTotal} />
            <div style={S.ctl}>
              <span style={S.ctlLabel}>Fix is</span>
              <div style={{ display: "flex", gap: 6 }}>
                {(["left", "right"] as Side[]).map(s => (
                  <button key={s} type="button" aria-pressed={side === s} onClick={() => { setSide(s); touched(); }}
                          style={{ ...S.btn, ...(side === s ? S.tabOn : null) }}>{s} of track</button>
                ))}
              </div>
            </div>
          </div>

          <p style={S.small}>
            The rule is an approximation. For {off} NM off after {gone} NM the exact angle is {fmt(exactAngle(off, gone))}°
            against {fmt(tea)}° by the rule; the gap grows as the angle grows.
            {exaggerated ? " The sideways scale of the picture is stretched so the error stays visible." : ""}
          </p>
        </FontSize.Provider>
      )}
    </section>
  );
}

function Slider({ label, unit, min, max, value, onChange }: {
  label: string; unit: string; min: number; max: number; value: number; onChange: (n: number) => void;
}) {
  return (
    <label style={S.ctl}>
      <span style={S.ctlLabel}>{label}: <b style={{ color: C.ink }}>{value} {unit}</b></span>
      <input type="range" min={min} max={max} step={1} value={Math.min(max, Math.max(min, value))}
             onChange={e => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: C.accent }} />
    </label>
  );
}

// ─── Test me ────────────────────────────────────────────────────────────────

type Kind = "tea" | "ca" | "direct" | "double";
type Problem = { kind: Kind; off: number; gone: number; total: number; side: Side };

const FIRST: Problem = { kind: "direct", off: 7, gone: 35, total: 95, side: "right" };

function makeProblem(): Problem {
  const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
  const kinds: Kind[] = ["tea", "ca", "direct", "double"];
  for (let i = 0; i < 500; i++) {
    const gone = pick([10, 12, 15, 20, 24, 30, 36, 40, 45, 60]);
    const toGo = pick([12, 15, 20, 24, 30, 40, 45, 60, 90]);
    const off = pick([1, 2, 3, 4, 5, 6]);
    const tea = trackErrorAngle(off, gone), ca = closingAngle(off, toGo);
    // whole-degree answers only, and angles small enough for the rule to be honest
    if (!(Number.isInteger(tea) && Number.isInteger(ca) && tea <= 15 && ca <= 15)) continue;
    const kind = pick(kinds);
    // The chapter: double the TEA only works before half-way, so never ask it after.
    if (kind === "double" && gone > toGo) continue;
    return { kind, off, gone, total: gone + toGo, side: pick(["left", "right"]) };
  }
  return FIRST;
}

function answerFor(p: Problem) {
  const tea = trackErrorAngle(p.off, p.gone);
  const ca = closingAngle(p.off, p.total - p.gone);
  const dir = turnDirection(p.side);
  switch (p.kind) {
    case "tea": return { value: tea, dir: null, working: `TEA = ${p.off} ÷ ${p.gone} × 60 = ${fmt(tea)}°` };
    case "ca": return { value: ca, dir: null, working: `To go = ${p.total} − ${p.gone} = ${p.total - p.gone} NM. CA = ${p.off} ÷ ${p.total - p.gone} × 60 = ${fmt(ca)}°` };
    case "direct": return { value: tea + ca, dir, working: `TEA = ${fmt(tea)}°, CA = ${p.off} ÷ ${p.total - p.gone} × 60 = ${fmt(ca)}°. Turn = ${fmt(tea + ca)}° ${dir}, away from the side you are on.` };
    case "double": return { value: 2 * tea, dir, working: `TEA = ${fmt(tea)}°. Turn 2 × ${fmt(tea)}° = ${fmt(2 * tea)}° ${dir}; you regain track after ${2 * p.gone} NM.` };
  }
}

function question(p: Problem) {
  const fix = `Leg A to B is ${p.total} NM. After ${p.gone} NM a fix puts you ${p.off} NM ${p.side} of track.`;
  switch (p.kind) {
    case "tea": return `${fix} What is the track error angle?`;
    case "ca": return `${fix} What is the closing angle to B?`;
    case "direct": return `${fix} What alteration of heading takes you direct to B?`;
    case "double": return `${fix} You decide to regain track by the double track error method. What alteration?`;
  }
}

function Drill() {
  const [p, setP] = useState<Problem>(FIRST);
  const [val, setVal] = useState("");
  const [dir, setDir] = useState<"left" | "right" | "">("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState({ right: 0, tried: 0 });

  const a = answerFor(p);
  const num = Number(val);
  const numOk = val.trim() !== "" && Math.abs(num - a.value) <= 0.5;
  const dirOk = a.dir === null || dir === a.dir;
  const ok = numOk && dirOk;

  const check = () => {
    if (checked || val.trim() === "") return;
    setChecked(true);
    setScore(s => ({ right: s.right + (ok ? 1 : 0), tried: s.tried + 1 }));
  };
  const next = () => { setP(makeProblem()); setVal(""); setDir(""); setChecked(false); };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <p style={{ ...S.caption, fontWeight: 600 }}>{question(p)}</p>
      <div style={S.row}>
        <input type="number" inputMode="decimal" value={val} aria-label="Your answer in degrees"
               onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") check(); }}
               style={S.input} placeholder="degrees" />
        {a.dir !== null && (["left", "right"] as const).map(d => (
          <button key={d} type="button" aria-pressed={dir === d} onClick={() => setDir(d)}
                  style={{ ...S.btn, ...(dir === d ? S.tabOn : null) }}>{d}</button>
        ))}
        <button type="button" style={{ ...S.btn, ...S.btnMain }} onClick={check} disabled={checked || val.trim() === ""}>Check</button>
        <button type="button" style={S.btn} onClick={next}>New question</button>
      </div>
      {checked && (
        <div style={{ ...S.result, borderColor: ok ? C.good : C.tmg }}>
          <b style={{ color: ok ? C.good : C.tmg }}>
            {ok ? "Correct." : !numOk ? `Not quite: ${fmt(a.value)}°${a.dir ? ` ${a.dir}` : ""}.` : `Right number, wrong way: turn ${a.dir}.`}
          </b>{" "}
          <span style={{ color: C.muted }}>{a.working}</span>
        </div>
      )}
      <p style={S.small}>Score this visit: {score.right} of {score.tried}. Answers within half a degree count.</p>
    </div>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const S: Record<string, CSSProperties> = {
  card: { margin: "1.5rem 0", padding: 16, background: C.card, border: `1px solid ${C.line}`, borderRadius: 16,
          boxShadow: "0 1px 3px rgba(15,23,42,.08)", fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          color: C.ink, fontSize: 15, lineHeight: 1.5 },
  head: { display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" },
  badge: { fontSize: 11, fontWeight: 800, letterSpacing: ".08em", color: "#fff", background: C.accent, borderRadius: 6, padding: "2px 8px" },
  title: { fontSize: 17, fontWeight: 800, color: C.ink },
  tabs: { display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" },
  // borderWidth/Style/Color, never the `border` shorthand: tabOn overrides only
  // the colour, and React warns when a shorthand and its longhand are mixed.
  tab: { padding: "6px 12px", borderRadius: 999, borderWidth: 1, borderStyle: "solid", borderColor: C.line, background: C.soft, color: C.muted,
         fontSize: 14, fontWeight: 700, cursor: "pointer", margin: 0, lineHeight: 1.3 },
  tabOn: { background: C.accent, borderColor: C.accent, color: "#fff" },
  caption: { margin: "10px 0 0", fontSize: 15, color: C.ink, minHeight: 46 },
  warn: { margin: "8px 0 0", padding: "8px 12px", borderRadius: 10, background: "#fef3c7", border: "1px solid #f59e0b", color: "#78350f", fontSize: 14 },
  row: { display: "flex", alignItems: "center", gap: 8, marginTop: 10, flexWrap: "wrap" },
  btn: { padding: "7px 14px", borderRadius: 10, borderWidth: 1, borderStyle: "solid", borderColor: C.line, background: "#fff", color: C.ink,
         fontSize: 14, fontWeight: 700, cursor: "pointer", margin: 0, lineHeight: 1.3, textTransform: "none" },
  btnMain: { background: C.ink, borderColor: C.ink, color: "#fff" },
  controls: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 14,
              padding: 12, background: C.soft, borderRadius: 12 },
  ctl: { display: "grid", gap: 4, margin: 0 },
  ctlLabel: { fontSize: 13, color: C.muted },
  small: { margin: "10px 0 0", fontSize: 13, color: C.muted },
  input: { width: 110, padding: "7px 10px", borderRadius: 10, border: `1px solid ${C.line}`, fontSize: 15, color: C.ink, background: "#fff", margin: 0 },
  result: { padding: "10px 12px", borderRadius: 10, borderWidth: 2, borderStyle: "solid", background: "#fff", fontSize: 14 },
};
