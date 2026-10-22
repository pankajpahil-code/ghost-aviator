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
