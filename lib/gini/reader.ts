/**
 * GINI'S READING VOICE.
 *
 * Lets Gini read a chapter aloud SECTION BY SECTION, rather than droning the
 * whole thing as one block the way the page's own toolbar does. He announces
 * the heading, reads that section, highlights it while he speaks, and stops at
 * the end so the student can decide whether to continue.
 *
 * WHY IT READS THE DOM INSTEAD OF IMPORTING FROM HtmlNotesPage
 * -----------------------------------------------------------
 * That component keeps its notes container in a local `useRef` and exports
 * nothing — its read-aloud state is `{state, toggle, stop, voices, voiceURI,
 * setVoiceURI}` and has no concept of a section. Reaching in would mean
 * refactoring a page that already works and that carries the site's content
 * protection. Reading the rendered `.ga-notes` element keeps Gini a bystander:
 * if the notes are not on screen, he simply has nothing to read.
 *
 * IRON RULE 3 (content protection) — deliberately preserved:
 *   - This SPEAKS text; it never exposes, copies, downloads or serialises it.
 *     The same words are already spoken by the page's own read-aloud button.
 *   - There is no "read everything" call. A caller must ask for one section at
 *     a time, so this cannot become a bulk-extraction route.
 *   - Nothing is written to the clipboard or to storage.
 */

export type NoteSection = {
  index: number;
  title: string;
  /** Spoken text for this section only. Trimmed and collapsed. */
  text: string;
  el: HTMLElement;
};

/** How much of one section we will ever speak. Keeps a runaway page bounded. */
const MAX_SECTION_CHARS = 4000;

/**
 * Voice ranking, matching the page's own logic so Gini and the toolbar sound
 * the same: Indian English first, then anything neural/natural, then Google,
 * then network voices (offline SAPI voices are the robotic ones).
 */
function scoreVoice(v: SpeechSynthesisVoice): number {
  let s = 0;
  if (v.lang === "en-IN") s += 100;
  if (/online|natural|neural/i.test(v.name)) s += 50;
  if (/google/i.test(v.name)) s += 25;
  if (v.localService === false) s += 20;
  return s;
}

export function bestVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const all = [...window.speechSynthesis.getVoices()].filter(v => v.lang.startsWith("en"));
  if (!all.length) return null;
  return all.sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

/** The chapter body, if a chapter is actually on screen. */
function notesRoot(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(".ga-notes");
}

export function hasNotes(): boolean {
  return !!notesRoot();
}

/**
 * Split the rendered chapter into sections at its headings.
 *
 * `lib/notes-inline.ts` demotes the chapter's own h1 to h2, so h2 is the real
 * top level here and h3 marks sub-sections. A chapter with no headings at all
 * comes back as a single section rather than nothing, so Gini can still read it.
 */
export function sections(): NoteSection[] {
  const root = notesRoot();
  if (!root) return [];

  const heads = [...root.querySelectorAll<HTMLElement>("h2, h3")];
  if (!heads.length) {
    const text = (root.innerText || "").replace(/\s+/g, " ").trim();
    return text ? [{ index: 0, title: "This chapter", text: text.slice(0, MAX_SECTION_CHARS), el: root }] : [];
  }

  const out: NoteSection[] = [];
  heads.forEach((h, i) => {
    const stop = heads[i + 1] ?? null;
    let text = "";
    for (let n = h.nextElementSibling; n && n !== stop; n = n.nextElementSibling) {
      text += " " + ((n as HTMLElement).innerText || "");
    }
    text = text.replace(/\s+/g, " ").trim();
    if (!text) return;                       // a heading with nothing under it
    out.push({
      index: out.length,
      title: (h.innerText || "").replace(/\s+/g, " ").trim() || `Section ${out.length + 1}`,
      text: text.slice(0, MAX_SECTION_CHARS),
      el: h,
    });
  });
  return out;
}

let highlighted: HTMLElement | null = null;

function highlight(el: HTMLElement | null) {
  if (highlighted) {
    highlighted.style.background = "";
    highlighted.style.transition = "";
  }
  highlighted = el;
  if (el) {
    el.style.transition = "background .3s ease";
    el.style.background = "rgba(240,145,58,0.22)";
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

export function stop() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  highlight(null);
}

/**
 * Read one section aloud. Resolves when it finishes or is cancelled.
 *
 * Long sections are split at sentence boundaries: most engines hold pitch and
 * pacing far better across short utterances than droning through one huge block,
 * which is the same reason the page's own reader chunks.
 */
export function speakSection(s: NoteSection, onDone?: () => void): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onDone?.();
    return;
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  highlight(s.el);

  const voice = bestVoice();
  const chunks = `${s.title}. ${s.text}`
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  let i = 0;
  const next = () => {
    if (i >= chunks.length) {
      highlight(null);
      onDone?.();
      return;
    }
    const u = new SpeechSynthesisUtterance(chunks[i++]);
    if (voice) { u.voice = voice; u.lang = voice.lang; } else { u.lang = "en-IN"; }
    u.rate = 0.95;
    u.onend = next;
    u.onerror = () => { highlight(null); onDone?.(); };
    synth.speak(u);
  };
  next();
}

export function supported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}
