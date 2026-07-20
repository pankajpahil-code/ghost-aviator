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
import {
  buildVfrDeparture, buildIfrFlight, buildEmergencyFlight, buildRadioFailureFlight,
} from "@/lib/rtr-sim/director.mjs";
import type { SimStep } from "@/lib/rtr-sim/scn1";
import { voiceBank } from "@/lib/rtr-sim/voicebank";
import { useUser } from "@/lib/supabase";

/* -------------------------- Radio-head frequency ---------------------------
   Frequencies live as integer "cents" (118.35 → 11835) so tuning arithmetic
   and equality checks never meet floating point. VHF band 118–136, 25 kHz. */
const toCents = (f: string) => Math.round(parseFloat(f) * 100);
const fmtFreq = (c: number) => {
  const s = (c / 100).toFixed(2);
  return s.endsWith("0") ? s.slice(0, -1) : s;
};
const stepMhz = (c: number, d: number) => {
  let m = Math.floor(c / 100) + d;
  if (m < 118) m = 136;
  if (m > 136) m = 118;
  return m * 100 + (c % 100);
};
const stepKhz = (c: number, d: number) => {
  let k = (c % 100) + d * 5;
  if (k < 0) k = 95;
  if (k > 95) k = 0;
  return Math.floor(c / 100) * 100 + k;
};

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
type SRErrEvent = { error?: string };
type SRInstance = {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous?: boolean;
  start(): void; stop(): void; abort(): void;
  onresult: ((e: SREvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: SRErrEvent) => void) | null;
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
  const [flightType, setFlightType] = useState<"vfr" | "ifr" | "emergency" | "radiofail">("vfr");
  const [typedText, setTypedText] = useState("");
  const { user } = useUser();
  const scn = useMemo(() => {
    const w = rollWorld(seed);
    switch (flightType) {
      case "ifr": return buildIfrFlight(w);
      case "emergency": return buildEmergencyFlight(w);
      case "radiofail": return buildRadioFailureFlight(w);
      default: return buildVfrDeparture(w);
    }
  }, [seed, flightType]);
  const [stepIndex, setStepIndex] = useState(0);
  const [activeCents, setActiveCents] = useState(11800);
  const [stbyCents, setStbyCents] = useState(11800);
  const [xpdr, setXpdr] = useState("2000");
  const [identOn, setIdentOn] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [outcomes, setOutcomes] = useState<StepOutcome[]>([]);
  const [inputOpen, setInputOpen] = useState(false);
  const [composed, setComposed] = useState<string[]>([]);
  const [atcSpeaking, setAtcSpeaking] = useState(false);
  const [ptt, setPtt] = useState(false);
  const [micAvailable, setMicAvailable] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [bankReady, setBankReady] = useState(false);

  const fx = useRef<RadioFx>(new RadioFx());
  const retriedRef = useRef(false);
  const recRef = useRef<SRInstance | null>(null);
  const heardRef = useRef("");
  const errRef = useRef("");
  const primedRef = useRef(false);
  // Set by the getUserMedia prime: proves whether the MIC itself is usable, so
  // a speech-service failure is never misreported as a permission problem.
  const micGrantedRef = useRef<boolean | null>(null);
  const pttStartRef = useRef(0);
  const lastDeliveryRef = useRef<{ wpm: number; fillers: number } | null>(null);
  const disciplineRef = useRef({ freq: 0, squawk: 0 });
  const squawkProbeRef = useRef<string | null>(null);
  // The mode chosen at click time — state alone is stale inside the very first
  // beginStep/onTransmit closures of a run.
  const modeRef = useRef<"learn" | "practice">("learn");
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
    // Pre-rendered neural ATC bank — silent no-op if it can't load.
    voiceBank.load().then(setBankReady);
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

  // Fallback voice: whatever the device has installed (robotic on most desktops).
  const speakSynth = useCallback((text: string, done: () => void) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) { done(); return; }
    const synth = window.speechSynthesis;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = voices.find(x => x.voiceURI === voiceURI) ?? voices[0];
    if (v) { u.voice = v; u.lang = v.lang; } else u.lang = "en-IN";
    u.rate = 0.92;
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
      done();
    };
    u.onend = u.onerror = finish;
    window.setTimeout(finish, Math.min(14000, 2000 + text.length * 90));
    synth.speak(u);
  }, [voices, voiceURI]);

  const speakAtc = useCallback((text: string, after?: () => void) => {
    lastAtcRef.current = text;
    setLog(l => [...l, { who: "atc", text }]);
    setAtcSpeaking(true);
    const done = () => { setAtcSpeaking(false); after?.(); };

    // Preferred: pre-rendered neural Indian-English ATC, stitched inside one
    // continuous VHF carrier. Falls back to the device voice on any miss.
    const ctx = fx.current.ensure();
    if (ctx && voiceBank.ready && voiceBank.canSpeak(text)) {
      voiceBank
        .speak(ctx, text, {
          open: () => { fx.current.click(); fx.current.startHiss(); },
          close: () => { fx.current.stopHiss(); fx.current.click(); },
        })
        .then(ok => { if (ok) done(); else speakSynth(text, done); })
        .catch(() => speakSynth(text, done));
      return;
    }
    speakSynth(text, done);
  }, [speakSynth]);

  /* ------------------------------- Step flow ------------------------------- */
  const beginStep = useCallback((i: number) => {
    const st = scn.steps[i];
    retriedRef.current = false;
    setComposed([]);
    setTypedText("");
    setLog(l => [...l, { who: "sys", text: st.cue }]);
    // Learn mode is training wheels: the radio and transponder set themselves,
    // with a note. Practice makes the student work the cockpit.
    if (modeRef.current === "learn" && st.requiresFreq && activeCents !== toCents(st.requiresFreq)) {
      setActiveCents(toCents(st.requiresFreq));
      setLog(l => [...l, { who: "sys", text: `Radio tuned to ${st.requiresFreq} for you — in Practice you'll tune it yourself.` }]);
    }
    if (modeRef.current === "learn" && st.requiresSquawk && xpdr !== st.requiresSquawk) {
      setXpdr(st.requiresSquawk);
      setLog(l => [...l, { who: "sys", text: `Transponder set to ${st.requiresSquawk} for you — in Practice you'll set it yourself.` }]);
    }
    if (st.atcBefore) speakAtc(st.atcBefore, () => setInputOpen(true));
    else setInputOpen(true);
  }, [speakAtc, scn, activeCents, xpdr]);

  const start = useCallback((m: "learn" | "practice") => {
    fx.current.ensure();
    // Prime microphone permission once, at a calm moment, so the first
    // hold-to-talk doesn't collide with a permission prompt (the silent-mic bug).
    if (micAvailable && !primedRef.current &&
        typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      primedRef.current = true;
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(s => { micGrantedRef.current = true; s.getTracks().forEach(t => t.stop()); })
        .catch(() => { micGrantedRef.current = false; });
    }
    setMode(m);
    modeRef.current = m;
    setPhase("sim");
    // First lines of the session teach the controls for the chosen mode.
    setLog([{
      who: "sys",
      text: m === "learn"
        ? "LEARN MODE — build each call by tapping the phrase chips in order, then press TRANSMIT. The radio tunes itself here, and SAY AGAIN replays ATC any time you missed a word."
        : "PRACTICE MODE — hold the round MIC while you speak (release to send), or type your call and press TRANSMIT. Handoffs are yours: dial STBY with M−/M+/k−/k+, then press ⇄. Set the SQK digits when ATC assigns a squawk.",
    }]);
    setOutcomes([]);
    setStepIndex(0);
    setActiveCents(toCents(scn.freq));
    setStbyCents(toCents(scn.freq));
    setXpdr("2000");
    disciplineRef.current = { freq: 0, squawk: 0 };
    squawkProbeRef.current = null;
    busyRef.current = false;
    beginStep(0);
  }, [beginStep, scn, micAvailable]);

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

    // Cockpit discipline gates (Practice only — Learn auto-sets with a note).
    if (modeRef.current === "practice" && step.requiresFreq && activeCents !== toCents(step.requiresFreq)) {
      disciplineRef.current.freq += 1;
      fx.current.click();
      setLog(l => [...l,
        { who: "you", text: clean },
        { who: "sys", text: `Only static answers — ${fmtFreq(activeCents)} is the wrong frequency. Tune the radio and transmit again.` },
      ]);
      return;
    }
    if (modeRef.current === "practice" && step.requiresSquawk && xpdr !== step.requiresSquawk) {
      if (squawkProbeRef.current !== step.id) {
        squawkProbeRef.current = step.id;
        setLog(l => [...l, { who: "you", text: clean }]);
        if (step.gateSilent) {
          setLog(l => [...l, { who: "sys", text: `Your transponder still shows ${xpdr}. The situation demands a specific code — set it, then transmit.` }]);
        } else {
          speakAtc(`${scn.callsign}, negative radar contact — confirm squawk?`);
        }
        return;
      }
      disciplineRef.current.squawk += 1;
      setLog(l => [...l, { who: "sys", text: "The transponder is still on the wrong code — logged." }]);
    }

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
  }, [step, inputOpen, speakAtc, finishStep, scn, mode, activeCents, xpdr]);

  /* ------------------------------ Voice input ------------------------------ */
  const pttDown = useCallback(() => {
    if (!micAvailable || !inputOpen || atcSpeaking || ptt) return;
    const SR = getSR();
    if (!SR) return;
    try { recRef.current?.abort(); } catch { /* none running */ }
    heardRef.current = "";
    errRef.current = "";
    const rec = new SR();
    rec.lang = "en-IN";
    rec.interimResults = true;   // keep partial words even if released early
    rec.maxAlternatives = 1;
    rec.onresult = (e: SREvent) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += (e.results[i][0]?.transcript ?? "") + " ";
      heardRef.current = t.trim();
    };
    rec.onerror = (e: SRErrEvent) => { errRef.current = e?.error ?? "error"; };
    rec.onend = () => {
      setPtt(false);
      fx.current.click();
      const heard = heardRef.current.trim();
      if (heard) {
        const durSec = Math.max(0.6, (performance.now() - pttStartRef.current) / 1000);
        const words = heard.split(/\s+/).length;
        lastDeliveryRef.current = {
          wpm: Math.round((words / durSec) * 60),
          fillers: (heard.match(FILLER_RE) ?? []).length,
        };
        onTransmit(heard);
      } else {
        // Never fail silently — and never blame the wrong thing. If the mic
        // itself opened fine, a "not-allowed" is the speech SERVICE, not you.
        const err = errRef.current;
        const permissionBlocked =
          (err === "not-allowed" || err === "service-not-allowed") && micGrantedRef.current === false;
        const serviceFailed =
          (err === "not-allowed" || err === "service-not-allowed") && micGrantedRef.current !== false;
        const msg =
          permissionBlocked
            ? "🎤 Microphone is blocked for this site. Click the tune/lock icon at the left of the address bar → allow the Microphone → reload. Meanwhile you can type your call and press TRANSMIT."
            : serviceFailed
            ? "🎤 Your mic is fine, but the browser's speech service refused this transmission. Try once more — if it keeps happening, use Chrome, or type your call and press TRANSMIT (it scores exactly the same)."
            : err === "no-speech"
            ? "Didn't catch anything — press and HOLD the mic, wait half a second, then speak. Or type your call and press TRANSMIT."
            : err === "audio-capture"
            ? "No microphone found. Plug one in, or type your call and press TRANSMIT."
            : "Voice didn't come through — hold the mic and speak clearly, or type your call and press TRANSMIT.";
        // Don't stack the same warning over and over.
        setLog(l => (l[l.length - 1]?.text === msg ? l : [...l, { who: "sys", text: msg }]));
      }
    };
    recRef.current = rec;
    fx.current.click();
    setPtt(true);
    pttStartRef.current = performance.now();
    try { rec.start(); } catch { setPtt(false); }
  }, [micAvailable, inputOpen, atcSpeaking, ptt, onTransmit]);

  const pttUp = useCallback(() => {
    // Give recognition a beat to finalize before stopping — a too-fast release
    // otherwise cuts the capture off with nothing recognized.
    const rec = recRef.current;
    if (!rec) return;
    const held = performance.now() - pttStartRef.current;
    const stop = () => { try { rec.stop(); } catch { /* not started */ } };
    if (held < 350) window.setTimeout(stop, 350 - held);
    else stop();
  }, []);

  // IDENT: momentary flash — and on action steps, the press IS the answer
  // (a pilot who cannot transmit can still be seen).
  const identPress = useCallback(() => {
    fx.current.click();
    setIdentOn(true);
    window.setTimeout(() => setIdentOn(false), 1600);
    if (!inputOpen || busyRef.current || !step.requiresIdent) return;
    busyRef.current = true;
    setInputOpen(false);
    setLog(l => [...l, { who: "sys", text: "▲ IDENT — your return blossoms on the radar screen." }]);
    finishStep({
      step,
      res: {
        norm: [], slots: [], callsign: null, forbidden: [],
        points: 1, maxPoints: 1, wrongCritical: [], missingCritical: [],
      } as ReturnType<typeof scoreTransmission>,
      saidText: "(IDENT)",
      retried: false,
      delivery: null,
    });
  }, [inputOpen, step, finishStep]);

  /* ------------------------------- Debrief math ---------------------------- */
  const debrief = useMemo(() => {
    if (phase !== "debrief") return null;
    // A probed/corrected step costs one point — the examiner had to help — and
    // every wrong-frequency call or missed squawk costs one more.
    const adjusted = outcomes.map(o => ({
      points: Math.max(0, o.res.points - (o.retried ? 1 : 0)),
      maxPoints: o.res.maxPoints,
    }));
    const base = scoreScenario(adjusted as Parameters<typeof scoreScenario>[0]);
    const discipline = { ...disciplineRef.current };
    const points = Math.max(0, base.points - discipline.freq - discipline.squawk);
    const percent = base.maxPoints === 0 ? 0 : Math.round((points / base.maxPoints) * 100);
    return { points, maxPoints: base.maxPoints, percent, pass: percent >= scn.passMark, discipline };
  }, [phase, outcomes, scn]);

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
        <div className="flex flex-wrap gap-2 mb-5">
          {([["vfr", "SCENARIO 1 · VFR Departure", false],
             ["ifr", "SCENARIO 2 · IFR Full Flight", true],
             ["emergency", "SCENARIO 3 · Emergency", true],
             ["radiofail", "SCENARIO 4 · Radio Failure", true]] as const).map(([ft, label, gated]) => (
            <button key={ft} onClick={() => setFlightType(ft)}
                    className="text-xs font-black px-3 py-2 rounded-lg"
                    style={flightType === ft
                      ? { background: "rgba(0,212,255,0.12)", border: `1px solid ${cyan}`, color: cyan }
                      : { border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8" }}>
              {label}{gated && !user && " 🔒"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 mb-5">
          <Radio className="w-7 h-7" style={{ color: cyan }} />
          <div>
            <div className="font-black text-white text-xl">{scn.title}</div>
            <div className="text-xs" style={{ color: "#64748b" }}>{scn.subtitle}</div>
          </div>
          {flightType === "vfr" ? (
            <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full" style={{ color: "#4ade80", border: "1px solid rgba(74,222,128,0.35)", background: "rgba(74,222,128,0.08)" }}>FREE</span>
          ) : (
            <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full" style={{ color: user ? "#4ade80" : "#fbbf24", border: `1px solid ${user ? "rgba(74,222,128,0.35)" : "rgba(251,191,36,0.35)"}`, background: user ? "rgba(74,222,128,0.08)" : "rgba(251,191,36,0.08)" }}>
              {user ? "UNLOCKED" : "FREE SIGN-IN"}
            </span>
          )}
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
        {flightType !== "vfr" && !user ? (
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/login" className="inline-flex items-center gap-2 font-black px-6 py-3 rounded-xl text-black no-underline"
                  style={{ background: cyan }}>
              <Lock className="w-5 h-5" /> Sign in free to fly this scenario
            </Link>
            <span className="text-xs" style={{ color: "#475569" }}>
              Free forever — sign-in just keeps your progress and unlocks the full flights.
            </span>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => start("learn")}
                      className="inline-flex items-center gap-2 font-black px-6 py-3 rounded-xl text-black"
                      style={{ background: cyan }}>
                <Play className="w-5 h-5" /> Learn Mode
              </button>
              <button onClick={() => start("practice")}
                      className="inline-flex items-center gap-2 font-black px-6 py-3 rounded-xl"
                      style={{ color: cyan, border: `2px solid ${cyan}` }}>
                <Mic className="w-5 h-5" /> Practice Mode
              </button>
            </div>
            <p className="text-xs mt-3" style={{ color: "#475569" }}>
              Learn = phrase chips guide you, radio tunes itself. Practice = freeform — speak or
              type from memory, work the radio and transponder yourself.
            </p>
            <p className="text-xs mt-3 flex flex-wrap gap-x-4 gap-y-1" style={{ color: "#475569" }}>
              <a href="#how-to-use" className="underline" style={{ color: cyan }}>
                First flight? Read the walkaround below ↓
              </a>
              <Link href="/cpl/radio-telephony" className="underline" style={{ color: cyan }}>
                Theory first? Open the RTR(A) book
              </Link>
            </p>
          </>
        )}
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
            {(debrief.discipline.freq > 0 || debrief.discipline.squawk > 0) && (
              <div className="text-xs mt-1" style={{ color: amber }}>
                Cockpit discipline: {debrief.discipline.freq > 0 && `${debrief.discipline.freq} wrong-frequency call${debrief.discipline.freq > 1 ? "s" : ""}`}
                {debrief.discipline.freq > 0 && debrief.discipline.squawk > 0 && " · "}
                {debrief.discipline.squawk > 0 && `${debrief.discipline.squawk} squawk miss${debrief.discipline.squawk > 1 ? "es" : ""}`}
                {" "}(−1 each)
              </div>
            )}
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <button onClick={() => start(mode)} className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg"
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
                {o.res.callsign !== null && o.res.callsign !== "ok-end" && (
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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 sm:px-6 py-3" style={{ background: "rgba(0,0,0,0.35)", borderBottom: "1px solid rgba(0,212,255,0.15)" }}>
        <Radio className="w-5 h-5" style={{ color: cyan }} />
        <div className="font-mono font-black text-lg tracking-widest" title="Active frequency" style={{ color: amber }}>{fmtFreq(activeCents)}</div>
        {/* Standby tuner + flip — handoffs must actually be TUNED */}
        <div className="flex items-center gap-1 font-mono text-[10px]" style={{ color: "#64748b" }}>
          <span>STBY</span>
          <span className="font-black text-xs" style={{ color: "#94a3b8" }}>{fmtFreq(stbyCents)}</span>
          {([["M−", () => setStbyCents(c => stepMhz(c, -1))],
             ["M+", () => setStbyCents(c => stepMhz(c, 1))],
             ["k−", () => setStbyCents(c => stepKhz(c, -1))],
             ["k+", () => setStbyCents(c => stepKhz(c, 1))]] as const).map(([lab, fn]) => (
            <button key={lab} onClick={fn} className="px-1 py-0.5 rounded"
                    style={{ border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8" }}>{lab}</button>
          ))}
          <button onClick={() => { setStbyCents(activeCents); setActiveCents(stbyCents); fx.current.click(); }}
                  title="Flip standby to active" className="px-1.5 py-0.5 rounded font-black"
                  style={{ color: cyan, border: `1px solid ${cyan}55` }}>⇄</button>
        </div>
        {scn.hasTransponder && (
          <div className="flex items-center gap-0.5 font-mono text-[10px]" style={{ color: "#64748b" }}>
            <span className="mr-0.5">SQK</span>
            {xpdr.split("").map((d, i) => (
              <button key={i}
                      onClick={() => setXpdr(x => x.slice(0, i) + String((Number(x[i]) + 1) % 8) + x.slice(i + 1))}
                      title="Tap to change (0–7)"
                      className="w-5 h-6 rounded font-black text-xs"
                      style={{ background: "rgba(255,255,255,0.06)", color: amber, border: "1px solid rgba(255,255,255,0.12)" }}>
                {d}
              </button>
            ))}
            <button onClick={identPress} title="IDENT — flash your radar return"
                    className="ml-1 px-1.5 h-6 rounded font-black text-[10px] transition-colors"
                    style={identOn
                      ? { background: amber, color: "#000", border: `1px solid ${amber}` }
                      : { color: amber, border: `1px solid ${amber}55` }}>
              IDENT
            </button>
          </div>
        )}
        <div className="text-xs hidden lg:block" style={{ color: "#64748b" }}>{scn.callsign} · {scn.aircraft}</div>
        {/* signal bars */}
        <div className="ml-auto flex items-end gap-0.5 h-4" aria-hidden>
          {[3, 6, 9, 12, 15].map((h, i) => (
            <div key={i} className="w-1 rounded-sm transition-all"
                 style={{ height: h, background: atcSpeaking || ptt ? cyan : "rgba(255,255,255,0.15)", opacity: atcSpeaking || ptt ? 0.4 + i * 0.15 : 1 }} />
          ))}
        </div>
        {bankReady ? (
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide"
                title="Pre-rendered neural Indian-English controller voice, through a VHF radio filter"
                style={{ color: "#4ade80", border: "1px solid rgba(74,222,128,0.35)", background: "rgba(74,222,128,0.08)" }}>
            ATC ▸ en-IN
          </span>
        ) : voices.length > 1 && (
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
        {step.requiresIdent ? (
          <div className="rounded-lg px-3 py-3 text-sm text-center font-bold"
               style={{ border: `1px dashed ${amber}66`, color: amber, background: "rgba(251,191,36,0.05)" }}>
            {step.actionLabel ?? "Use the transponder"} — the IDENT button is on the radio head ↑
          </div>
        ) : mode === "learn" ? (
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

/* ----------------------- Coming-soon scenario teasers ---------------------- */
export function LockedScenarios() {
  const items = ["Weather Diversion & Go-Around", "Exam Mode — Examiner-led Mock + Viva"];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
      {items.map((t, i) => (
        <div key={i} className="glass-card p-5 opacity-70">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4" style={{ color: "#64748b" }} />
            <span className="text-xs font-bold" style={{ color: "#64748b" }}>
              {i === 0 ? "SCENARIO 5" : "COMING SOON"}
            </span>
          </div>
          <div className="font-bold text-white text-sm mb-2">{t}</div>
          <span className="text-xs" style={{ color: "#64748b" }}>In build — the tower grows weekly</span>
        </div>
      ))}
    </div>
  );
}
