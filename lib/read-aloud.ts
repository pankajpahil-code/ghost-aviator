/** One speech queue shared by the chapter toolbar and Gini. Text stays in memory. */
export type ReadingState = "idle" | "playing" | "paused" | "unsupported";
type ReaderSnapshot = {
  state: ReadingState;
  voices: SpeechSynthesisVoice[];
  voiceURI: string;
  rate: number;
  selection: string;
  label: string;
  progress: number;
  total: number;
  message: string;
};
const initial: ReaderSnapshot = { state: "idle", voices: [], voiceURI: "", rate: 0.95, selection: "", label: "", progress: 0, total: 0, message: "" };
let snapshot = initial;
const listeners = new Set<() => void>();
export const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
export const getSnapshot = () => snapshot;
export const getServerSnapshot = () => initial;
const update = (patch: Partial<ReaderSnapshot>) => { snapshot = { ...snapshot, ...patch }; listeners.forEach(fn => fn()); };
export const speechSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

// Gender is not exposed by Web Speech. Recognise named female voices when the
// device supplies them; let the student preview/override the automatic choice.
export function voiceScore(v: Pick<SpeechSynthesisVoice, "name" | "lang" | "localService">): number {
  const female = /female|swara|neerja|heera|zira|hazel|samantha|victoria|karen|moira|tessa|fiona|aria|jenny|libby|sonia|ava|emma|michelle|susan|veena/i.test(v.name);
  return (/natural|neural|online|enhanced|premium/i.test(v.name) ? 200 : 0)
    + (female ? 120 : 0) + (v.localService === false ? 40 : 0)
    + (/google/i.test(v.name) ? 25 : 0) + (/^en-IN/i.test(v.lang) ? 15 : 0);
}
export function rankedVoices(): SpeechSynthesisVoice[] {
  return speechSupported() ? [...window.speechSynthesis.getVoices()].filter(v => /^en(?:-|$)/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a) || a.name.localeCompare(b.name)) : [];
}
export function chosenVoice(): SpeechSynthesisVoice | null {
  const voices = rankedVoices();
  return voices.find(v => v.voiceURI === snapshot.voiceURI) ?? voices[0] ?? null;
}
const PREF_KEY = "ga:reading-voice:v1";
export function setReadingPreferences(patch: { voiceURI?: string; rate?: number }) {
  stopReading();
  update({ ...patch, ...(patch.rate === undefined ? {} : { rate: Math.max(0.7, Math.min(1.3, patch.rate)) }) });
  try { localStorage.setItem(PREF_KEY, JSON.stringify({ voiceURI: snapshot.voiceURI, rate: snapshot.rate })); } catch { /* Private mode. */ }
}

const SKIP = "script,style,noscript,nav,footer,button,input,textarea,select,option,svg,summary,[hidden],[aria-hidden='true'],[data-ga-read-skip],.ga-watermark-l1,.watermark,.sr-only,.toc,.table-of-contents,.chapter-nav";
export const notesRoot = () => typeof document === "undefined" ? null : document.querySelector<HTMLElement>(".ga-notes");
export type ReadingSection = { index: number; title: string; text: string; el: HTMLElement };

/** Walk text in DOM order, including nested headings without repeating siblings. */
export function readingSections(root: HTMLElement | null = notesRoot()): ReadingSection[] {
  if (!root) return [];
  const out: ReadingSection[] = [];
  let current: ReadingSection = { index: 0, title: "Chapter introduction", text: "", el: root };
  let heading: HTMLElement | null = null;
  let lastBlock: Element | null = null;
  const hidden = new WeakMap<Element, boolean>();
  const isHidden = (el: Element): boolean => {
    if (hidden.has(el)) return hidden.get(el)!;
    const style = getComputedStyle(el);
    const result = el.matches(SKIP) || style.display === "none" || style.visibility === "hidden"
      || (!!el.parentElement && el !== root && isHidden(el.parentElement))
      || (!!el.closest("details:not([open])"));
    hidden.set(el, result);
    return result;
  };
  const flush = () => { if (current.text.trim()) out.push({ ...current, index: out.length, text: current.text.trim() }); };
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    if (!parent || isHidden(parent)) continue;
    const text = (node.textContent || "").replace(/\s+/g, " ");
    if (!text.trim()) continue;
    const nextHeading = parent.closest<HTMLElement>("h2,h3");
    if (nextHeading && nextHeading !== heading) {
      flush();
      heading = nextHeading;
      current = { index: out.length, title: nextHeading.innerText.trim(), text: "", el: nextHeading };
      lastBlock = null;
    }
    if (nextHeading) continue;
    const block = parent.closest("p,li,h4,h5,h6,td,th,figcaption,dt,dd,blockquote,pre") || parent;
    current.text += (lastBlock === block ? " " : "\n") + text.trim();
    lastBlock = block;
  }
  flush();
  return out;
}
export function notesText() { return readingSections().map(s => `${s.title}.\n${s.text}`).join("\n\n"); }

export function captureReadingSelection(): string {
  if (typeof window === "undefined") return "";
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || !selection.rangeCount) return "";
  const range = selection.getRangeAt(0);
  const start = range.startContainer.parentElement;
  const end = range.endContainer.parentElement;
  const main = document.querySelector("main");
  if (!main || !main.contains(range.startContainer) || !main.contains(range.endContainer)
    || start?.closest("input,textarea,[contenteditable='true'],[data-ga-reader]")
    || end?.closest("input,textarea,[contenteditable='true'],[data-ga-reader]")) return "";
  const text = selection.toString().replace(/\s+/g, " ").trim();
  if (text && text !== snapshot.selection) update({ selection: text });
  return text;
}
export function clearReadingSelection() {
  if (typeof window !== "undefined") window.getSelection()?.removeAllRanges();
  if (snapshot.selection) update({ selection: "" });
}

export function speechChunks(text: string): string[] {
  const chunks: string[] = [];
  // The danda (। ॥) is the full stop of most Indian scripts, and the Urdu full stop is ۔.
  for (const sentence of text.replace(/\s+/g, " ").trim().split(/(?<=[.!?।॥۔])\s+/)) {
    let rest = sentence;
    while (rest.length > 240) {
      const space = rest.lastIndexOf(" ", 240);
      const at = space > 80 ? space : 240;
      chunks.push(rest.slice(0, at));
      rest = rest.slice(at).trim();
    }
    if (rest) chunks.push(rest);
  }
  return chunks;
}

let generation = 0;
let utterance: SpeechSynthesisUtterance | null = null;
export function stopReading() {
  generation++;
  if (utterance) { utterance.onend = null; utterance.onerror = null; }
  if (speechSupported()) window.speechSynthesis.cancel();
  utterance = null;
  update({ state: speechSupported() ? "idle" : "unsupported", label: "", progress: 0, total: 0 });
}
export function pauseReading() {
  if (snapshot.state === "playing") { window.speechSynthesis.pause(); update({ state: "paused" }); }
  else if (snapshot.state === "paused") { window.speechSynthesis.resume(); update({ state: "playing" }); }
}
/**
 * WHICH LANGUAGE A REPLY IS IN, by its script (2026-10-22). Gini now teaches in
 * any Indian language, and an English voice reading Tamil script says nothing
 * useful. Devanagari is read as Hindi: Marathi shares the script, and a Hindi
 * voice reads Marathi far better than an English one does.
 */
const SCRIPT_LANG: [RegExp, string][] = [
  [/[ऀ-ॿ]/, "hi-IN"], [/[ঀ-৿]/, "bn-IN"], [/[਀-੿]/, "pa-IN"],
  [/[઀-૿]/, "gu-IN"], [/[଀-୿]/, "or-IN"], [/[஀-௿]/, "ta-IN"],
  [/[ఀ-౿]/, "te-IN"], [/[ಀ-೿]/, "kn-IN"], [/[ഀ-ൿ]/, "ml-IN"],
  [/[؀-ۿ]/, "ur-IN"],
];
export function langForText(text: string): string {
  return SCRIPT_LANG.find(([re]) => re.test(text))?.[1] ?? "en-IN";
}

/**
 * The best installed voice for a language: the exact locale first (hi-IN), then
 * the language anywhere (hi), best-scored first. English keeps the student's
 * own chosen voice. Null when the device has none, and the caller then only sets
 * `lang`, leaving the browser to choose — never an English voice for Tamil.
 */
export function voiceForLang(lang: string): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null;
  if (/^en/i.test(lang)) return chosenVoice();
  const norm = (l: string) => l.replace("_", "-").toLowerCase();
  const all = [...window.speechSynthesis.getVoices()].sort((a, b) => voiceScore(b) - voiceScore(a));
  return all.find(v => norm(v.lang) === norm(lang))
    ?? all.find(v => norm(v.lang).split("-")[0] === norm(lang).split("-")[0])
    ?? null;
}

export function speakText(text: string, label = "Selected text", onDone?: () => void, lang?: string): boolean {
  if (!speechSupported()) { update({ state: "unsupported", message: "Read aloud is not available in this browser." }); return false; }
  const chunks = speechChunks(text);
  if (!chunks.length) { update({ message: "Choose some text or a notes section first." }); return false; }
  stopReading();
  const token = generation;
  window.speechSynthesis.resume();
  update({ state: "playing", label, progress: 0, total: chunks.length, message: "" });
  let index = 0;
  const next = () => {
    if (token !== generation) return;
    if (index === chunks.length) { generation++; utterance = null; update({ state: "idle", progress: chunks.length }); onDone?.(); return; }
    const u = new SpeechSynthesisUtterance(chunks[index++]);
    utterance = u;
    const voice = lang ? voiceForLang(lang) : chosenVoice();
    if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = lang ?? "en-IN"; }
    u.rate = snapshot.rate;
    u.pitch = 1;
    u.onend = next;
    u.onerror = e => {
      if (token !== generation) return;
      generation++;
      utterance = null;
      update({ state: "idle", message: e.error === "not-allowed" ? "Tap Read again to allow audio playback." : "This voice could not finish. Try another voice and read again." });
    };
    update({ progress: index });
    window.speechSynthesis.speak(u);
  };
  next();
  return true;
}

let connections = 0;
let detach: (() => void) | undefined;
export function connectReader() {
  if (++connections === 1) {
    const refresh = () => update({ voices: rankedVoices(), state: speechSupported() ? snapshot.state : "unsupported" });
    try {
      const stored = JSON.parse(localStorage.getItem(PREF_KEY) || "null");
      if (stored) update({ voiceURI: typeof stored.voiceURI === "string" ? stored.voiceURI : "", rate: typeof stored.rate === "number" && Number.isFinite(stored.rate) ? Math.max(0.7, Math.min(1.3, stored.rate)) : 0.95 });
    } catch { /* No saved preferences. */ }
    refresh();
    window.speechSynthesis?.addEventListener("voiceschanged", refresh);
    document.addEventListener("selectionchange", captureReadingSelection);
    window.addEventListener("pagehide", stopReading);
    detach = () => {
      window.speechSynthesis?.removeEventListener("voiceschanged", refresh);
      document.removeEventListener("selectionchange", captureReadingSelection);
      window.removeEventListener("pagehide", stopReading);
      stopReading();
      clearReadingSelection();
    };
  }
  return () => { if (--connections === 0) { detach?.(); detach = undefined; } };
}

/** Explicit commands only; an unmatched request never becomes whole-page narration. */
export function readRequested(query: string): "started" | "missing" | "unmatched" {
  const q = query.trim();
  if (!/^(?:please\s+)?(?:read|speak|narrate)(?:\s|$)/i.test(q)) return "unmatched";
  if (/\b(?:selected|selection|highlighted|highlight)\b/i.test(q) || /^(?:please\s+)?read (?:this|that)(?:\s+(?:aloud|out loud))?[.!]?$/i.test(q)) {
    captureReadingSelection();
    return snapshot.selection && speakText(snapshot.selection, "Selected text") ? "started" : "missing";
  }
  const all = readingSections();
  if (!all.length) return "missing";
  const numbered = q.match(/^(?:please\s+)?read (?:notes )?section (\d+)[.!]?$/i);
  if (numbered) {
    const section = all[Number(numbered[1]) - 1];
    return section && speakText(`${section.title}. ${section.text}`, section.title) ? "started" : "missing";
  }
  if (/^(?:please\s+)?(?:read|speak|narrate)(?:\s+(?:me|out loud|aloud|the|this|my))*\s*(?:notes|chapter)(?:\s+(?:aloud|out loud))?[.!]?$/i.test(q)) {
    return speakText(notesText(), "Chapter notes") ? "started" : "missing";
  }
  const wanted = q.replace(/^(?:please\s+)?(?:read|speak|narrate)\s*(?:the\s+)?(?:section\s+)?/i, "").replace(/\s+(?:aloud|out loud)[.!]?$/i, "").replace(/[.!?]+$/, "").toLowerCase().trim();
  const normal = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const exact = all.find(s => normal(s.title) === normal(wanted));
  const partial = normal(wanted).length >= 3 ? all.filter(s => normal(s.title).includes(normal(wanted))) : [];
  const match = exact ?? (partial.length === 1 ? partial[0] : undefined);
  return match && speakText(`${match.title}. ${match.text}`, match.title) ? "started" : "missing";
}
