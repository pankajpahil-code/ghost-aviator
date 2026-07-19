"use client";
// Ghost Tower — RTR(A) practical R/T simulator (scenario runner).
// Deterministic scoring via lib/rtr-sim/engine.mjs; scenario data in
// lib/rtr-sim/scn1.ts. Voice input (Web Speech) is an enhancement — the tap
// composer is the always-works path. No transcript export/copy affordances
// (content-protection rule).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Radio, Mic, Volume2, RotateCcw, Play, ChevronRight, Lock,
  CheckCircle, XCircle, AlertTriangle, Award, Headphones, Delete,
} from "lucide-react";
import {
  scoreTransmission, matchCallsign, scoreScenario,
} from "@/lib/rtr-sim/engine.mjs";
import { rollWorld, randomSeed } from "@/lib/rtr-sim/world.mjs";
import { buildVfrDeparture } from "@/lib/rtr-sim/director.mjs";
import type { SimStep } from "@/lib/rtr-sim/scn1";

/* ----------------------------- ATC voice pick ----------------------------- */
// Same philosophy as the notes read-aloud: quality is the device's; we only
// pick the best installed voice (online/natural voices first, Indian English
// preferred) and let the radio atmosphere do the rest.
function scoreVoice(v: SpeechSynthesisVoice): number {
  let s = 0;
  const n = v.name.toLowerCase();
  if (!v.localService) s += 4;
  if (/natural|neural|online|google/.test(n)) s += 3;
  const lang = v.lang.toLowerCase();
  if (lang.startsWith("en-in")) s += 3;
  else if (lang.startsWith("en-gb")) s += 2;
  else if (lang.startsWith("en")) s += 1;
  else s -= 4;
  return s;
}

/* ----------------------------- Radio atmosphere ---------------------------- */
// speechSynthesis can't be routed through WebAudio, so the VHF feel comes from
// a squelch click at key-up/down plus a low hiss bed under the voice.
class RadioFx {
  private ctx: AudioContext | null = null;
  private hissSrc: AudioBufferSourceNode | null = null;

  ensure() {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    this.ctx?.resume().catch(() => {});
    return this.ctx;
  }
  private noiseBuffer(sec: number) {
    const ctx = this.ctx!;
    const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * sec)), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }
  private band(ctx: AudioContext) {
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 300;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3400;
    hp.connect(lp);
    return { input: hp, output: lp };
  }
  click() {
    const ctx = this.ensure(); if (!ctx) return;
    const src = ctx.createBufferSource(); src.buffer = this.noiseBuffer(0.055);
    const { input, output } = this.band(ctx);
    const g = ctx.createGain(); g.gain.value = 0.22;
    src.connect(input); output.connect(g); g.connect(ctx.destination);
    src.start();
  }
  startHiss() {
    const ctx = this.ensure(); if (!ctx || this.hissSrc) return;
    const src = ctx.createBufferSource(); src.buffer = this.noiseBuffer(1); src.loop = true;
    const { input, output } = this.band(ctx);
    const g = ctx.createGain(); g.gain.value = 0.016;
    src.connect(input); output.connect(g); g.connect(ctx.destination);
    src.start();
    this.hissSrc = src;
  }
  stopHiss() {
    try { this.hissSrc?.stop(); } catch { /* already stopped */ }
    this.hissSrc = null;
  }
}

/* --------------------------------- Types ---------------------------------- */
// Minimal Web Speech recognition typings — the API is not in TS's DOM lib.
type SREvent = { results: ArrayLike<{ 0: { transcript: string } }> };
type SRInstance = {
  lang: string; interimResults: boolean; maxAlternatives: number;
  start(): void; stop(): void;
  onresult: ((e: SREvent) => void) | null;
  onend: (() => void) | null;
};
type SRCtor = new () => SRInstance;
function getSR(): SRCtor | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

type Phase = "brief" | "sim" | "debrief";
type LogEntry = { who: "atc" | "you" | "sys"; text: string };
type StepOutcome = {
  step: SimStep;
  res: ReturnType<typeof scoreTransmission>;
  saidText: string;
  retried: boolean;
  /** Voice-delivery metrics (speech rate, filler words) — voice attempts only. */
  delivery: { wpm: number; fillers: number } | null;
};

const FILLER_RE = /\b(uh|um|umm|ah|ahh|hmm|haan)\b/gi;

/* ================================ Component ================================ */
export default function GhostTower() {
  const [phase, setPhase] = useState<Phase>("brief");
  // Seed 0 renders deterministically on the server; the real roll happens
  // after mount (avoids a hydration mismatch), gated by seedReady.
  const [seed, setSeed] = useState(0);
  const [seedReady, setSeedReady] = useState(false);
  const [mode, setMode] = useState<"learn" | "practice">("learn");
  const [typedText, setTypedText] = useState("");
  const scn = useMemo(() => buildVfrDeparture(rollWorld(seed)), [seed]);
  const [stepIndex, setStepIndex] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [outcomes, setOutcomes] = useState<StepOutcome[]>([]);
  const [inputOpen, setInputOpen] = useState(false);
  const [composed, setComposed] = useState<string[]>([]);
  const [atcSpeaking, setAtcSpeaking] = useState(false);
  const [ptt, setPtt] = useState(false);
  const [micAvailable, setMicAvailable] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");

  const fx = useRef<RadioFx>(new RadioFx());
  const retriedRef = useRef(false);
  const recRef = useRef<SRInstance | null>(null);
  const heardRef = useRef("");
  const pttStartRef = useRef(0);
  const lastDeliveryRef = useRef<{ wpm: number; fillers: number } | null>(null);
  const lastAtcRef = useRef("");
  const logBoxRef = useRef<HTMLDivElement | null>(null);
  const busyRef = useRef(false);

  const step = scn.steps[stepIndex];

  /* ------------------------------ Voice setup ------------------------------ */
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const refresh = () => {
      const ranked = [...window.speechSynthesis.getVoices()].sort((a, b) => scoreVoice(b) - scoreVoice(a));
      setVoices(ranked);
      setVoiceURI(v => v || ranked[0]?.voiceURI || "");
    };
    refresh();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    setMicAvailable(!!getSR());
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", refresh);
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    logBoxRef.current?.scrollTo({ top: logBoxRef.current.scrollHeight, behavior: "smooth" });
  }, [log]);

  // Roll the real flight after mount (server rendered the deterministic seed 0).
  useEffect(() => {
    setSeed(randomSeed());
    setSeedReady(true);
  }, []);

  const speakAtc = useCallback((text: string, after?: () => void) => {
    lastAtcRef.current = text;
    setLog(l => [...l, { who: "atc", text }]);
    if (typeof window === "undefined" || !("speechSynthesis" in window)) { after?.(); return; }
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find(x => x.voiceURI === voiceURI) ?? voices[0];
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-IN";
    u.rate = 0.92;
    setAtcSpeaking(true);
    fx.current.click();
    fx.current.startHiss();
    // Watchdog: some devices never fire onend (broken/absent voices). The
    // scenario must NEVER hang on a silent radio — whichever fires first wins.
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      fx.current.stopHiss();
      fx.current.click();
      setAtcSpeaking(false);
      after?.();
    };
    u.onend = u.onerror = finish;
    window.setTimeout(finish, Math.min(14000, 2000 + text.length * 90));
    synth.speak(u);
  }, [voices, voiceURI]);

  /* ------------------------------- Step flow ------------------------------- */
  const beginStep = useCallback((i: number) => {
    const st = scn.steps[i];
    retriedRef.current = false;
    setComposed([]);
    setTypedText("");
    setLog(l => [...l, { who: "sys", text: st.cue }]);
    if (st.atcBefore) speakAtc(st.atcBefore, () => setInputOpen(true));
    else setInputOpen(true);
  }, [speakAtc, scn]);

  const start = useCallback(() => {
    fx.current.ensure();
    setPhase("sim");
    setLog([]);
    setOutcomes([]);
    setStepIndex(0);
    busyRef.current = false;
    beginStep(0);
  }, [beginStep]);

  const finishStep = useCallback((outcome: StepOutcome) => {
    setOutcomes(o => [...o, outcome]);
    const proceed = () => {
      if (stepIndex + 1 < scn.steps.length) {
        setStepIndex(stepIndex + 1);
        beginStep(stepIndex + 1);
      } else {
        setLog(l => [...l, { who: "sys", text: "Scenario complete. The examiner is totting up your gradesheet…" }]);
        setTimeout(() => setPhase("debrief"), 1200);
      }
      busyRef.current = false;
    };
    if (outcome.step.atcAfter) speakAtc(outcome.step.atcAfter, proceed);
    else proceed();
  }, [stepIndex, beginStep, speakAtc, scn]);

  const onTransmit = useCallback((text: string) => {
    const clean = text.trim();
    if (!clean || busyRef.current || !inputOpen) return;
    busyRef.current = true;
    setInputOpen(false);
    setComposed([]);
    setLog(l => [...l, { who: "you", text: clean }]);

    const res = scoreTransmission(step.expect, clean);
    // Book Ch14: once ATC abbreviates, the abbreviated callsign is legitimate.
    if (res.callsign === "missing" && step.callsignAlt) {
      const alt = matchCallsign(res.norm, step.callsignAlt);
      if (alt !== "missing") {
        res.callsign = alt;
        if (alt === "ok-end") res.points += 1;
      }
    }
    // Initial calls and reports carry the callsign early — that placement is
    // CORRECT there (who you call → who you are); only read-backs must close
    // with it [Ch14 §14.7].
    if (step.callsignPosition === "any" && res.callsign === "ok") {
      res.callsign = "ok-end";
      res.points += 1;
    }

    const needsRetry = (res.wrongCritical.length > 0 || res.missingCritical.length > 0) && !retriedRef.current;
    if (needsRetry) {
      retriedRef.current = true;
      const wrongKey = res.wrongCritical[0];
      const missKey = res.missingCritical[0];
      const line =
        (wrongKey && step.corrections?.[wrongKey]) ||
        (missKey && step.probes?.[missKey]) ||
        `${scn.callsign}, say again.`;
      speakAtc(line, () => { setInputOpen(true); busyRef.current = false; });
      return;
    }
    finishStep({ step, res, saidText: clean, retried: retriedRef.current, delivery: lastDeliveryRef.current });
    lastDeliveryRef.current = null;
  }, [step, inputOpen, speakAtc, finishStep, scn]);

  /* ------------------------------ Voice input ------------------------------ */
  const pttDown = useCallback(() => {
    if (!micAvailable || !inputOpen || atcSpeaking) return;
    const SR = getSR();
    if (!SR) return;
    heardRef.current = "";
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: SREvent) => {
      heardRef.current = Array.from(e.results).map(r => r[0].transcript).join(" ");
    };
    rec.onend = () => {
      setPtt(false);
      fx.current.click();
      const heard = heardRef.current;
      if (heard) {
        const durSec = Math.max(0.6, (performance.now() - pttStartRef.current) / 1000);
        const words = heard.trim().split(/\s+/).length;
        lastDeliveryRef.current = {
          wpm: Math.round((words / durSec) * 60),
          fillers: (heard.match(FILLER_RE) ?? []).length,
        };
        onTransmit(heard);
      }
    };
    recRef.current = rec;
    fx.current.click();
    setPtt(true);
    pttStartRef.current = performance.now();
    try { rec.start(); } catch { setPtt(false); }
  }, [micAvailable, inputOpen, atcSpeaking, onTransmit]);

  const pttUp = useCallback(() => {
    try { recRef.current?.stop(); } catch { /* not started */ }
  }, []);

  /* ------------------------------- Debrief math ---------------------------- */
  const debrief = useMemo(() => {
    if (phase !== "debrief") return null;
    // A probed/corrected step costs one point — the examiner had to help.
    const adjusted = outcomes.map(o => ({
      points: Math.max(0, o.res.points - (o.retried ? 1 : 0)),
      maxPoints: o.res.maxPoints,
    }));
    return scoreScenario(adjusted as Parameters<typeof scoreScenario>[0]);
  }, [phase, outcomes]);

  /* ================================ Render ================================= */
  const cyan = "#00d4ff";
  const amber = "#fbbf24";

  if (phase === "brief") {
    if (!seedReady) {
      return (
        <div className="glass-card p-8 select-none text-sm animate-pulse" style={{ color: "#64748b" }}>
          Rolling your flight — weather, callsign, traffic…
        </div>
      );
    }
    return (
      <div className="glass-card p-6 sm:p-8 select-none">
        <div className="flex items-center gap-3 mb-5">
          <Radio className="w-7 h-7" style={{ color: cyan }} />
          <div>
            <div className="font-black text-white text-xl">Scenario 1 — {scn.title}</div>
            <div className="text-xs" style={{ color: "#64748b" }}>{scn.subtitle}</div>
          </div>
          <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full" style={{ color: "#4ade80", border: "1px solid rgba(74,222,128,0.35)", background: "rgba(74,222,128,0.08)" }}>FREE</span>
        </div>
        <div className="space-y-3 mb-6">
          {scn.briefing.map((b, i) => (
            <p key={i} className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{b}</p>
          ))}
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            The examiner probes exactly like the real WPC practical: miss a mandatory read-back and
            you&apos;ll hear <em>&ldquo;confirm QNH?&rdquo;</em> — get it wrong and you&apos;ll be corrected.
            Pass mark {scn.passMark}%, just like RTR(A) Part&nbsp;2.
          </p>
          <p className="text-xs flex items-center gap-2" style={{ color: "#64748b" }}>
            <Headphones className="w-4 h-4 shrink-0" />
            Headphones recommended. {micAvailable ? "Hold the PTT to speak your calls, or tap the phrase chips." : "Voice input isn't supported in this browser — tap the phrase chips to compose your calls."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => { setMode("learn"); start(); }}
                  className="inline-flex items-center gap-2 font-black px-6 py-3 rounded-xl text-black"
                  style={{ background: cyan }}>
            <Play className="w-5 h-5" /> Learn Mode
          </button>
          <button onClick={() => { setMode("practice"); start(); }}
                  className="inline-flex items-center gap-2 font-black px-6 py-3 rounded-xl"
                  style={{ color: cyan, border: `2px solid ${cyan}` }}>
            <Mic className="w-5 h-5" /> Practice Mode
          </button>
        </div>
        <p className="text-xs mt-3" style={{ color: "#475569" }}>
          Learn = phrase chips guide you. Practice = freeform — speak or type from memory,
          the way the examiner expects it.
        </p>
      </div>
    );
  }

  if (phase === "debrief" && debrief) {
    return (
      <div className="glass-card p-6 sm:p-8 select-none">
        <div className="flex items-center gap-3 mb-6">
          <Award className="w-8 h-8" style={{ color: debrief.pass ? "#4ade80" : "#f87171" }} />
          <div>
            <div className="font-black text-white text-2xl">{debrief.percent}% — {debrief.pass ? "PASS" : "NOT YET"}</div>
            <div className="text-xs" style={{ color: "#64748b" }}>
              {debrief.points} of {debrief.maxPoints} points · RTR(A) Part 2 pass mark {scn.passMark}%
              · flight #{seed} · {mode === "learn" ? "Learn" : "Practice"} mode
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <button onClick={start} className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg"
                    title="Same weather, same callsign, same traffic — beat your score"
                    style={{ color: "#94a3b8", border: "1px solid rgba(255,255,255,0.2)" }}>
              <RotateCcw className="w-4 h-4" /> Same flight
            </button>
            <button onClick={() => { setSeed(randomSeed()); setPhase("brief"); }}
                    className="inline-flex items-center gap-2 text-sm font-black px-4 py-2 rounded-lg text-black"
                    title="Roll a fresh flight — new airport, weather, callsign, traffic"
                    style={{ background: cyan }}>
              <Play className="w-4 h-4" /> New flight
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {outcomes.map((o, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-xs mb-1 font-bold tracking-wide" style={{ color: "#64748b" }}>
                {i + 1}. {o.step.cue}
              </div>
              <div className="text-sm mb-2 font-mono" style={{ color: "#cbd5e1" }}>&ldquo;{o.saidText}&rdquo;</div>
              <div className="flex flex-wrap gap-2">
                {o.res.slots.map(s => {
                  const label = o.step.labels[s.key] ?? s.key;
                  const c = s.status === "ok" ? "#4ade80" : s.status === "wrong" ? "#f87171" : amber;
                  const Icon = s.status === "ok" ? CheckCircle : s.status === "wrong" ? XCircle : AlertTriangle;
                  return (
                    <span key={s.key} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
                          style={{ color: c, border: `1px solid ${c}44`, background: `${c}11` }}>
                      <Icon className="w-3 h-3" /> {label}{s.status === "wrong" ? " — wrong value" : s.status === "missing" ? " — missed" : ""}
                    </span>
                  );
                })}
                {o.res.callsign !== "ok-end" && (
                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
                        style={{ color: amber, border: `1px solid ${amber}44`, background: `${amber}11` }}>
                    <AlertTriangle className="w-3 h-3" /> {o.res.callsign === "missing" ? "Callsign missing" : "End with your callsign"}
                  </span>
                )}
                {o.res.forbidden.map(f => (
                  <span key={f} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded"
                        style={{ color: "#f87171", border: "1px solid #f8717144", background: "#f8717111" }}>
                    <XCircle className="w-3 h-3" /> &ldquo;{f}&rdquo; — non-standard
                  </span>
                ))}
                {o.retried && (
                  <span className="text-xs px-2 py-1 rounded" style={{ color: "#94a3b8", border: "1px solid rgba(255,255,255,0.15)" }}>
                    examiner probed (−1)
                  </span>
                )}
                {o.delivery && (
                  <span className="text-xs px-2 py-1 rounded" style={{ color: "#94a3b8", border: "1px solid rgba(255,255,255,0.15)" }}>
                    🎙 {o.delivery.wpm} wpm{o.delivery.fillers > 0 ? ` · ${o.delivery.fillers} filler${o.delivery.fillers > 1 ? "s" : ""}` : ""}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs mt-6" style={{ color: "#475569" }}>
          Every rule on this gradesheet is taught in the{" "}
          <Link href="/cpl/radio-telephony" className="underline" style={{ color: cyan }}>RTR(A) book</Link>{" "}
          — chapters 13 to 21 cover the exact phraseology.
        </p>
      </div>
    );
  }

  /* --------------------------------- Sim ----------------------------------- */
  return (
    <div className="glass-card overflow-hidden select-none">
      {/* Radio head */}
      <div className="flex items-center gap-3 px-4 sm:px-6 py-3" style={{ background: "rgba(0,0,0,0.35)", borderBottom: "1px solid rgba(0,212,255,0.15)" }}>
        <Radio className="w-5 h-5" style={{ color: cyan }} />
        <div className="font-mono font-black text-lg tracking-widest" style={{ color: amber }}>{scn.freq}</div>
        <div className="text-xs hidden sm:block" style={{ color: "#64748b" }}>{scn.station} · {scn.callsign} · {scn.aircraft}</div>
        {/* signal bars */}
        <div className="ml-auto flex items-end gap-0.5 h-4" aria-hidden>
          {[3, 6, 9, 12, 15].map((h, i) => (
            <div key={i} className="w-1 rounded-sm transition-all"
                 style={{ height: h, background: atcSpeaking || ptt ? cyan : "rgba(255,255,255,0.15)", opacity: atcSpeaking || ptt ? 0.4 + i * 0.15 : 1 }} />
          ))}
        </div>
        {voices.length > 1 && (
          <select value={voiceURI} onChange={e => setVoiceURI(e.target.value)}
                  className="text-xs rounded px-1 py-0.5 max-w-[110px]"
                  style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}
                  title="ATC voice — depends on what's installed on your device">
            {voices.slice(0, 8).map(v => (
              <option key={v.voiceURI} value={v.voiceURI} style={{ background: "#0f081e", color: "#fff" }}>{v.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Transcript */}
      <div ref={logBoxRef} className="px-4 sm:px-6 py-4 space-y-3 overflow-y-auto" style={{ height: "290px" }}>
        {log.map((e, i) => (
          e.who === "sys" ? (
            <div key={i} className="text-xs italic" style={{ color: "#64748b" }}>✦ {e.text}</div>
          ) : (
            <div key={i} className={`flex ${e.who === "you" ? "justify-end" : "justify-start"}`}>
              <div className="max-w-[85%] rounded-xl px-3 py-2 text-sm"
                   style={e.who === "atc"
                     ? { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)", color: "#fde68a" }
                     : { background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.25)", color: "#a5f3fc" }}>
                <span className="block text-[10px] font-bold tracking-widest mb-0.5" style={{ color: e.who === "atc" ? amber : cyan }}>
                  {e.who === "atc" ? "ATC" : scn.callsign}
                </span>
                {e.text}
              </div>
            </div>
          )
        ))}
        {atcSpeaking && <div className="text-xs animate-pulse" style={{ color: amber }}>▮▮ receiving…</div>}
      </div>

      {/* Controls */}
      <div className="px-4 sm:px-6 py-4 space-y-3" style={{ background: "rgba(0,0,0,0.25)", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {mode === "learn" ? (
          <>
            {/* composed line */}
            <div className="min-h-[38px] rounded-lg px-3 py-2 text-sm font-mono flex items-center flex-wrap gap-1"
                 style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(0,212,255,0.3)", color: "#cbd5e1" }}>
              {composed.length === 0
                ? <span style={{ color: "#475569" }}>{inputOpen ? "Compose your transmission…" : "Stand by…"}</span>
                : composed.join(" ")}
            </div>
            {/* chips */}
            <div className="flex flex-wrap gap-2">
              {step.chips.map((c, i) => (
                <button key={i} disabled={!inputOpen}
                        onClick={() => setComposed(p => [...p, c])}
                        className="text-xs px-2.5 py-1.5 rounded-lg font-medium disabled:opacity-30 transition-opacity"
                        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#cbd5e1" }}>
                  {c}
                </button>
              ))}
            </div>
          </>
        ) : (
          <input
            value={typedText}
            onChange={e => setTypedText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && inputOpen && typedText.trim()) {
                lastDeliveryRef.current = null;
                const t = typedText; setTypedText("");
                onTransmit(t);
              }
            }}
            disabled={!inputOpen}
            placeholder={inputOpen
              ? (micAvailable ? "Hold the mic to speak — or type your transmission…" : "Type your transmission…")
              : "Stand by…"}
            className="w-full rounded-lg px-3 py-2.5 text-sm font-mono disabled:opacity-40"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px dashed rgba(0,212,255,0.3)", color: "#e2e8f0", outline: "none" }}
          />
        )}
        <div className="flex items-center gap-2">
          <button disabled={!inputOpen || (mode === "learn" ? composed.length === 0 : typedText.trim() === "")}
                  onClick={() => {
                    lastDeliveryRef.current = null;
                    if (mode === "learn") onTransmit(composed.join(" "));
                    else { const t = typedText; setTypedText(""); onTransmit(t); }
                  }}
                  className="inline-flex items-center gap-2 font-black px-5 py-2.5 rounded-xl text-black disabled:opacity-30"
                  style={{ background: cyan }}>
            <ChevronRight className="w-4 h-4" /> TRANSMIT
          </button>
          {mode === "learn" && (
            <button disabled={composed.length === 0} onClick={() => setComposed(p => p.slice(0, -1))}
                    className="p-2.5 rounded-xl disabled:opacity-30" title="Remove last phrase"
                    style={{ border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8" }}>
              <Delete className="w-4 h-4" />
            </button>
          )}
          <button disabled={!lastAtcRef.current || atcSpeaking} onClick={() => speakAtc(lastAtcRef.current)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2.5 rounded-xl disabled:opacity-30"
                  title="Replay the last ATC transmission" style={{ border: "1px solid rgba(251,191,36,0.35)", color: amber }}>
            <Volume2 className="w-4 h-4" /> SAY AGAIN
          </button>
          {micAvailable && (
            <button onPointerDown={pttDown} onPointerUp={pttUp} onPointerLeave={pttUp}
                    disabled={!inputOpen || atcSpeaking}
                    className="ml-auto inline-flex items-center justify-center rounded-full w-14 h-14 font-black disabled:opacity-30 transition-transform active:scale-95"
                    title="Hold to transmit by voice"
                    style={{ background: ptt ? "#ef4444" : "rgba(0,212,255,0.12)", border: `2px solid ${ptt ? "#ef4444" : cyan}`, color: ptt ? "#fff" : cyan, touchAction: "none" }}>
              <Mic className="w-6 h-6" />
            </button>
          )}
        </div>
        <div className="text-[11px] flex items-center justify-between" style={{ color: "#475569" }}>
          <span>Step {stepIndex + 1} of {scn.steps.length}</span>
          {micAvailable && <span>{ptt ? "TRANSMITTING — release to send" : "Hold the mic to speak"}</span>}
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Locked scenario teasers ------------------------- */
export function LockedScenarios() {
  const items = [
    "IFR Clearance & Departure", "En-route & Position Reports",
    "Radar Vectors & Traffic", "Weather Arrival & Go-Around", "MAYDAY — Emergency",
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
      {items.map((t, i) => (
        <div key={i} className="glass-card p-5 opacity-70">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4" style={{ color: "#64748b" }} />
            <span className="text-xs font-bold" style={{ color: "#64748b" }}>SCENARIO {i + 2}</span>
          </div>
          <div className="font-bold text-white text-sm mb-2">{t}</div>
          <Link href="/login" className="text-xs underline" style={{ color: "#00d4ff" }}>
            Sign in free to unlock
          </Link>
        </div>
      ))}
    </div>
  );
}
