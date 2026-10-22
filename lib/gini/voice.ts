/**
 * GINI'S EYES, EARS AND VOICE — browser only (2026-10-22, the Captain's brief).
 *
 * Three small things, kept out of Gini.tsx so each can be read on its own:
 *
 *   screenAwareness()  the notes heading on screen and what the student has
 *                      highlighted, sent with a question so "explain this"
 *                      needs no repeating (lib/gini/tutor.ts cleanAwareness).
 *   speakable()        a reply as it should be SPOKEN: no markdown symbols,
 *                      no links, no arrows.
 *   listen()           one question by microphone, via the Web Speech API.
 *
 * Nothing here records, stores or uploads audio. Speech recognition is done by
 * the browser; what reaches this site is the transcript, exactly as if typed.
 */

import { notesRoot } from "@/lib/read-aloud";

/* ───────────────────────────── what is on screen ────────────────────────── */

/**
 * The selection is remembered for two minutes, because clicking into Gini's own
 * input box clears the page selection before the question is sent. After that
 * it is forgotten, so an old highlight cannot hijack a new question.
 */
const SELECTION_TTL_MS = 120_000;
let lastSelection = { text: "", at: 0 };

function rememberSelection() {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || !sel.rangeCount) return;
  const root = notesRoot() ?? document.querySelector("main");
  const range = sel.getRangeAt(0);
  if (!root || !root.contains(range.commonAncestorContainer)) return;
  const text = sel.toString().replace(/\s+/g, " ").trim();
  if (text) lastSelection = { text: text.slice(0, 300), at: Date.now() };
}

let watching = 0;
/** Start remembering highlights; returns the stop function, for an effect cleanup. */
export function watchSelection(): () => void {
  if (typeof document === "undefined") return () => {};
  if (++watching === 1) document.addEventListener("selectionchange", rememberSelection);
  return () => { if (--watching === 0) document.removeEventListener("selectionchange", rememberSelection); };
}

/**
 * The section being read: the last h2/h3 whose top has scrolled into the upper
 * 40% of the window, else the first heading that is visible at all.
 */
export function visibleSection(): string {
  const root = notesRoot();
  if (!root) return "";
  const line = window.innerHeight * 0.4;
  let best: HTMLElement | null = null;
  let firstVisible: HTMLElement | null = null;
  for (const h of root.querySelectorAll<HTMLElement>("h2, h3")) {
    const r = h.getBoundingClientRect();
    if (r.height === 0) continue;
    if (r.top <= line) best = h;
    else if (!firstVisible && r.top < window.innerHeight) firstVisible = h;
  }
  return ((best ?? firstVisible)?.innerText ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
}

export function screenAwareness(): { visibleSection?: string; selectedText?: string } {
  if (typeof window === "undefined") return {};
  rememberSelection();
  const section = visibleSection();
  const selected = Date.now() - lastSelection.at < SELECTION_TTL_MS ? lastSelection.text : "";
  return { ...(section ? { visibleSection: section } : {}), ...(selected ? { selectedText: selected } : {}) };
}

export function forgetSelection() { lastSelection = { text: "", at: 0 }; }

/* ─────────────────────────────── speaking ───────────────────────────────── */

/** Text as it should be heard: formatting symbols and links are not words. */
export function speakable(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[*_#`~>|]+/g, " ")
    .replace(/[→←↑↓★⚠✓✗]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ───────────────────────── Gini's server-made voice ──────────────────────── */

/**
 * ONE shared <audio> element. Created and "unlocked" inside a tap (Ask, the
 * mic, Listen) because mobile Safari only lets media start from a user gesture,
 * and Gini's reply arrives seconds later, after a network call. Playing a tiny
 * silent clip during the tap marks the element as allowed; the real audio then
 * reuses it.
 */
const SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
let player: HTMLAudioElement | null = null;
let current: { url: string | null; ctl: AbortController } | null = null;

export function primeAudio() {
  if (typeof window === "undefined") return;
  if (!player) player = new Audio();
  if (!player.src || player.src === SILENT_WAV) {
    player.src = SILENT_WAV;
    void player.play().catch(() => { /* not a gesture yet; the real play will try again */ });
  }
}

export function stopGiniAudio() {
  if (current) {
    current.ctl.abort();
    if (current.url) URL.revokeObjectURL(current.url);
    current = null;
  }
  if (player) { player.pause(); player.onended = null; player.onerror = null; }
}

/** "spent" = the day's free voice allowance is used up (lib/gini/tts.ts); "busy" = try again in a minute. */
export type VoiceResult = "played" | "busy" | "spent" | "failed" | "aborted";

/**
 * Fetch Gini's reply as audio from /api/gini/tts and play it. Resolves when it
 * ends, is stopped, or cannot be made. `token` is the one /api/gini returned
 * with the reply; the server speaks nothing else.
 */
export async function playGiniAudio(text: string, lang: string, token: string, onStart?: () => void): Promise<VoiceResult> {
  stopGiniAudio();
  if (!player) player = new Audio();
  const ctl = new AbortController();
  current = { url: null, ctl };
  try {
    const res = await fetch("/api/gini/tts", {
      method: "POST", signal: ctl.signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang, token }),
    });
    if (!res.ok || !/^audio\//.test(res.headers.get("content-type") || "")) {
      if (res.status !== 429) return "failed";
      const why = await res.json().then((j: { why?: string }) => j.why).catch(() => "");
      return why === "daily-quota" ? "spent" : "busy";
    }
    const blob = await res.blob();
    if (ctl.signal.aborted) return "aborted";
    const url = URL.createObjectURL(blob);
    current.url = url;
    const p = player;
    return await new Promise<VoiceResult>(resolve => {
      p.onended = () => { resolve("played"); stopGiniAudio(); };
      p.onerror = () => { resolve("failed"); stopGiniAudio(); };
      ctl.signal.addEventListener("abort", () => resolve("aborted"), { once: true });
      p.src = url;
      p.play().then(() => onStart?.()).catch(() => { resolve("failed"); stopGiniAudio(); });
    });
  } catch {
    return ctl.signal.aborted ? "aborted" : "failed";
  }
}

/* ─────────────────────────────── listening ──────────────────────────────── */

type Recognition = {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean;
  start(): void; abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

const ctor = (): RecognitionCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

export const listeningSupported = () => !!ctor();

/**
 * Listen for one question. `lang` is the language Gini last answered in, so a
 * student talking Tamil is heard as Tamil. Returns a function that stops it.
 */
export function listen(
  lang: string,
  onText: (transcript: string) => void,
  onEnd: (error?: string) => void,
): () => void {
  const C = ctor();
  if (!C) { onEnd("unsupported"); return () => {}; }
  const rec = new C();
  rec.lang = lang;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false;
  let finished = false;
  const end = (err?: string) => { if (!finished) { finished = true; onEnd(err); } };
  rec.onresult = e => {
    const r = e.results[e.results.length - 1];
    const t = r?.[0]?.transcript?.trim();
    if (t) onText(t);
  };
  rec.onerror = e => end(e.error);
  rec.onend = () => end();
  try { rec.start(); } catch { end("start-failed"); }
  return () => { try { rec.abort(); } catch { /* already stopped */ } end(); };
}
