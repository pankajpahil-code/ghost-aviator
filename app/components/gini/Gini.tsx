"use client";

/**
 * GINI — the Ghost Aviator who lives on the site. The receptionist.
 *
 * BODY: sprite frames cut from the Captain's own hero video, so he IS the
 * mascot — real face, glowing eyes, trident, book — rather than a generated
 * approximation of him. See GiniSprite.tsx for why the 3D route was dropped.
 *
 * DESIGN RULES, and they exist because Clippy is the canonical hated assistant:
 *   1. He never covers content. He lives in a corner; the page is untouched.
 *   2. He never speaks first with sound. Voice only when asked.
 *   3. Dismissing him STICKS — across pages and across sessions.
 *   4. `prefers-reduced-motion` stops him moving — but a person can override
 *      that with the Motion button, because an OS hint is a default, not a
 *      prison. Windows' "Show animations" being off froze him completely.
 *   5. He costs nothing until hydration; nothing about him is server-rendered,
 *      so no crawler ever sees a word of him.
 *   6. Every sentence he says comes from lib/gini/knowledge.ts, which retrieves
 *      verified text and never composes any. He refuses rather than guesses.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ask, PROMOS, type GiniReply } from "@/lib/gini/knowledge";
import { sections, speakSection, stop as stopReading, hasNotes, supported as speechSupported } from "@/lib/gini/reader";
import GiniSprite, { GINI_KEYFRAMES, type GiniMood } from "./GiniSprite";

const DISMISS_KEY = "ga:gini:dismissed";
/**
 * Explicit motion choice, which OVERRIDES the OS hint.
 *   "1" = always animate, "0" = never, absent = follow prefers-reduced-motion.
 *
 * Why this exists: Windows' "Show animations in Windows" being off makes Chrome
 * report prefers-reduced-motion: reduce, which froze Gini completely — he looked
 * broken rather than considerate. Respecting the OS is the right DEFAULT, but a
 * person who wants the animation must be able to say so.
 */
const MOTION_KEY = "ga:gini:motion";

/**
 * Where he can perch. Edges only — never the middle, because covering the page
 * is the single thing that made Clippy hated. Six stops means he actually
 * travels rather than ping-ponging between two corners.
 */
const PERCHES = [
  { right: "1rem",  bottom: "1.25rem" },
  { left:  "1rem",  bottom: "1.25rem" },
  { right: "1rem",  bottom: "42vh"    },
  { left:  "1rem",  bottom: "42vh"    },
  { right: "18vw",  bottom: "1.25rem" },
  { left:  "18vw",  bottom: "1.25rem" },
] as const;

export default function Gini() {
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(true);   // assume gone until proven otherwise
  const [osReduced, setOsReduced] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [motionPref, setMotionPref] = useState<"auto" | "on" | "off">("auto");
  const [mood, setMood] = useState<GiniMood>("idle");
  const [perch, setPerch] = useState(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const [bubbleHref, setBubbleHref] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);
  const [query, setQuery] = useState("");
  const [vanishing, setVanishing] = useState(false);
  const [entering, setEntering] = useState(false);
  const timers = useRef<number[]>([]);
  const pathname = usePathname();
  const greeted = useRef<string | null>(null);
  const [onNotes, setOnNotes] = useState(false);
  const [reading, setReading] = useState(false);
  const sectionIdx = useRef(0);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  /* eslint-disable react-hooks/set-state-in-effect -- localStorage and
   * matchMedia are browser facts that CANNOT be known while rendering on the
   * server, so an effect is the correct mechanism here, not a smell. This repo
   * already carries the same justified suppression for its mic-capability,
   * speechSynthesis-support and localStorage-progress reads.
   *
   * Guessing an initial value instead would flash Gini onto the screen for
   * users who dismissed him — the precise behaviour the flag exists to prevent.
   */
  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
    try {
      const m = localStorage.getItem(MOTION_KEY);
      if (m === "1") setMotionPref("on");
      else if (m === "0") setMotionPref("off");
    } catch { /* private mode */ }
    // Phones. Gini is a fixed-position character ~230px wide; on a 375px screen
    // that is 61% of the viewport, and the mid-screen perches would sit right
    // on top of the content. Both are the exact sin the design exists to avoid.
    const nq = window.matchMedia("(max-width: 640px)");
    setNarrow(nq.matches);
    const onNarrow = () => setNarrow(nq.matches);
    nq.addEventListener("change", onNarrow);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setOsReduced(mq.matches);
    const onChange = () => setOsReduced(mq.matches);
    mq.addEventListener("change", onChange);
    setReady(true);
    return () => {
      mq.removeEventListener("change", onChange);
      nq.removeEventListener("change", onNarrow);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // The explicit choice wins; the OS hint is only the default.
  const reduced = motionPref === "on" ? false : motionPref === "off" ? true : osReduced;

  const toggleMotion = useCallback(() => {
    const next = reduced ? "on" : "off";
    setMotionPref(next);
    try { localStorage.setItem(MOTION_KEY, next === "on" ? "1" : "0"); } catch { /* ignore */ }
  }, [reduced]);

  // On a phone only the two bottom corners are safe; the mid-screen and inset
  // perches would cover the page.
  const perches = useMemo(() => (narrow ? PERCHES.slice(0, 2) : PERCHES), [narrow]);
  const perchCss = useMemo(() => perches[perch % perches.length], [perch, perches]);
  const figureH = narrow ? 116 : 200;
  const panelW = narrow ? 150 : 230;

  // Whether a chapter is rendered is a DOM fact, unknowable during render.
  // Checked shortly after paint so the Read button never appears where there
  // is nothing to read. (setState sits inside the timeout, so no directive
  // is needed — and an unused one is itself a lint warning.)
  useEffect(() => {
    const t = window.setTimeout(() => setOnNotes(hasNotes() && speechSupported()), 500);
    return () => window.clearTimeout(t);
  }, [pathname]);

  /** Read the chapter aloud, one section at a time, announcing each heading. */
  const readNext = useCallback(() => {
    const all = sections();
    if (!all.length) {
      setBubble("There's no chapter text on this page for me to read.");
      return;
    }
    if (sectionIdx.current >= all.length) sectionIdx.current = 0;
    const s = all[sectionIdx.current];
    setReading(true);
    setMood("talk");
    setBubble(`Reading ${sectionIdx.current + 1} of ${all.length}: ${s.title}`);
    speakSection(s, () => {
      setReading(false);
      setMood("idle");
      sectionIdx.current += 1;
      if (sectionIdx.current >= all.length) {
        sectionIdx.current = 0;
        setBubble("That's the whole chapter. Ask me about any of it.");
      } else {
        setBubble(`Done. Press Read again for "${all[sectionIdx.current].title}".`);
      }
    });
  }, []);

  const haltReading = useCallback(() => {
    stopReading();
    setReading(false);
    setMood("idle");
    setBubble(null);
  }, []);

  // Never keep talking after he is dismissed or the student navigates away.
  useEffect(() => () => stopReading(), []);
  // Silence him the moment he is dismissed. Deliberately calls the DOM-only
  // stopReading() rather than haltReading(): an effect must not set React
  // state synchronously. The `reading` flag is cleared in recall() instead.
  useEffect(() => { if (dismissed) stopReading(); }, [dismissed]);

  /**
   * ARRIVING ON A CHAPTER. He is holding the Captain's book in every frame, so
   * he offers it when a student lands on notes — once per chapter, briefly, and
   * never while they are already talking to him. Silent everywhere else: a
   * receptionist greets you at the door, not in every room.
   */
  useEffect(() => {
    if (dismissed || !pathname || asking) return;
    if (!/\/notes$/.test(pathname)) return;
    if (greeted.current === pathname) return;
    greeted.current = pathname;
    setMood("present_book");
    setBubble("Chapter's open. Ask me about it, or hit Vanish and I'll leave you to read.");
    later(() => setMood("idle"), 3000);
    later(() => setBubble(null), 7000);
  }, [pathname, dismissed, asking, later]);

  /**
   * IDLE LIFE. Every 30 seconds he does ONE small thing — either drifts to a
   * new perch, or just pulls a face and settles again. Not both, and not often.
   *
   * The first version fired every 11s and always flew, which read as twitchy
   * and restless rather than alive. A receptionist stands still and occasionally
   * shifts; he does not pace the lobby. Held back entirely while he is speaking
   * or being asked something, and off under reduced motion.
   */
  useEffect(() => {
    if (dismissed || reduced || asking || bubble) return;
    const id = window.setInterval(() => {
      if (Math.random() < 0.5) {
        // Drift somewhere new.
        setMood("fly");
        setPerch(p => (p + 1 + Math.floor(Math.random() * 3)) % perches.length);
        window.setTimeout(() => setMood("idle"), 2200);
      } else if (Math.random() < 0.45) {
        // Mention what the Captain actually offers — his live batches and the
        // groups where he answers doubts. Boon 8: the free school stays free,
        // but a receptionist who never mentions the paid path is not doing his
        // job. Rotated, never repeated back to back, and always dismissable.
        const promo = PROMOS[Math.floor(Math.random() * PROMOS.length)];
        setMood("present_book");
        setBubbleHref(promo.href);
        setBubble(promo.text);
        window.setTimeout(() => setMood("idle"), 2600);
        window.setTimeout(() => { setBubble(null); setBubbleHref(null); }, 12000);
      } else {
        // Just a flicker of personality, staying put.
        const faces: GiniMood[] = ["happy", "laugh", "surprised"];
        setMood(faces[Math.floor(Math.random() * faces.length)]);
        window.setTimeout(() => setMood("idle"), 2000);
      }
    }, 30000);
    return () => window.clearInterval(id);
  }, [dismissed, reduced, asking, bubble, perches.length]);

  /** Say something, wearing the right face, then settle back to idle. */
  const say = useCallback((text: string, face: GiniMood, href?: string) => {
    setBubbleHref(href ?? null);
    setBubble(text);
    setMood(face);
    later(() => setMood("talk"), 1400);
  }, [later]);

  const flyTo = useCallback((next: number) => {
    setMood("fly");
    setPerch(next);
    later(() => setMood("idle"), 2200);
  }, [later]);

  const vanish = useCallback(() => {
    stopReading();
    setBubble(null);
    setBubbleHref(null);
    setVanishing(true);
    later(() => {
      setDismissed(true);
      setVanishing(false);
      try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* private mode */ }
    }, reduced ? 0 : 900);
  }, [reduced, later]);

  const recall = useCallback(() => {
    try { localStorage.removeItem(DISMISS_KEY); } catch { /* ignore */ }
    setDismissed(false);
    setReading(false);
    setEntering(true);
    setMood("happy");
    setBubble("Back. What do you need?");
    later(() => { setEntering(false); setMood("idle"); }, 900);
  }, [later]);

  const submit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const reply: GiniReply = ask(q);
    if (reply.kind === "answer") {
      // He knows this one — trident up, lightning, then settle into laughing.
      setMood("thunder");
      setBubbleHref(reply.href ?? null);
      setBubble(reply.text);
      later(() => setMood("laugh"), 1500);
      later(() => setMood("talk"), 3200);
    } else {
      say(reply.text, "angry");
    }
    setQuery("");
  }, [query, say, later]);


  if (!ready) return null;

  if (dismissed) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: GINI_KEYFRAMES }} />
        <button
          onClick={recall}
          aria-label="Bring back Gini, the Ghost Aviator guide"
          title="Bring back Gini"
          style={{
            position: "fixed", right: "1rem", bottom: "1.25rem", zIndex: 60,
            width: 46, height: 46, borderRadius: "50%",
            border: "1px solid rgba(240,145,58,0.5)",
            background: "rgba(10,15,20,0.88)", color: "#f0913a",
            fontSize: 21, lineHeight: "1", cursor: "pointer",
            backdropFilter: "blur(6px)",
          }}
        >
          👻
        </button>
      </>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GINI_KEYFRAMES }} />
      <div
        style={{
          position: "fixed", zIndex: 60, ...perchCss,
          width: panelW, pointerEvents: "none",
          display: "flex", flexDirection: "column", alignItems: "center",
          transition: reduced ? "none" : "left 1.9s cubic-bezier(.45,0,.25,1), right 1.9s cubic-bezier(.45,0,.25,1), bottom 1.9s cubic-bezier(.45,0,.25,1)",
        }}
      >
        {bubble && (
          <div
            role="status"
            style={{
              pointerEvents: "auto", alignSelf: "stretch",
              marginBottom: 10, padding: "11px 13px",
              borderRadius: 13, fontSize: 13, lineHeight: 1.45,
              background: "rgba(10,15,20,0.95)", color: "#e6edf3",
              border: "1px solid rgba(240,145,58,0.4)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              maxHeight: 200, overflowY: "auto",
            }}
          >
            {bubble}
            {bubbleHref && (
              <a
                href={bubbleHref}
                target={bubbleHref.startsWith("http") ? "_blank" : undefined}
                rel={bubbleHref.startsWith("http") ? "noopener noreferrer" : undefined}
                style={{
                  display: "block", marginTop: 8, fontWeight: 700,
                  color: "#f0913a", textDecoration: "none", fontSize: 12,
                }}
              >
                {bubbleHref.startsWith("http") ? "Open →" : "Take me there →"}
              </a>
            )}
          </div>
        )}

        {asking && (
          <form onSubmit={submit} style={{ pointerEvents: "auto", alignSelf: "stretch", marginBottom: 10 }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Ask me about the site…"
              aria-label="Ask Gini a question"
              style={{
                width: "100%", padding: "9px 11px", borderRadius: 11, fontSize: 13,
                background: "rgba(10,15,20,0.95)", color: "#e6edf3",
                border: "1px solid rgba(240,145,58,0.4)", outline: "none",
              }}
            />
          </form>
        )}

        <GiniSprite mood={mood} reduced={reduced} vanishing={vanishing} entering={entering} height={figureH} />

        <div style={{ pointerEvents: "auto", display: "flex", gap: 6, marginTop: 4 }}>
          <GiniBtn onClick={() => setAsking(a => !a)} label={asking ? "Close" : "Ask"} />
          {onNotes && (
            <GiniBtn onClick={reading ? haltReading : readNext} label={reading ? "Stop" : "Read"} />
          )}
          <GiniBtn onClick={() => flyTo(perch + 1)} label="Fly" />
          <GiniBtn onClick={() => { setMood("thunder"); later(() => setMood("idle"), 2600); }} label="⚡" />
          <GiniBtn onClick={toggleMotion} label={reduced ? "Motion on" : "Still"} />
          <GiniBtn onClick={vanish} label="Vanish" />
        </div>
      </div>
    </>
  );
}

function GiniBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 10px", fontSize: 11, borderRadius: 8, cursor: "pointer",
        background: "rgba(10,15,20,0.88)", color: "#cbd5e1",
        border: "1px solid rgba(203,213,225,0.3)",
      }}
    >
      {label}
    </button>
  );
}
