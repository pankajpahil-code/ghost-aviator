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
 *   7. He greets ONCE PER SESSION, in text, and the first greeting he ever
 *      gives a person also tells them how to get rid of him.
 *   8. He may mention what the Captain sells, but on a leash: nothing for the
 *      first 90 seconds, a four-minute gap, three per session, never the same
 *      one twice, and nothing at all during an exam, the simulator or signup.
 *      The rules live in lib/gini/marketing.ts, not in this file.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  askDeep, readContext, greeting, choosePitch, suggestionsFor, followUpsFor,
  type GiniReply, type GiniSource, type GiniContext, type PitchState,
} from "@/lib/gini/knowledge";
import {
  countVisit, hasGreeted, markGreeted, readPitchState, recordPitch,
  rememberSubject, rememberedSubject,
} from "@/lib/gini/session";
import { CPL_SUBJECTS } from "@/lib/subjects";
import { askSmart } from "@/lib/gini/smart";
import { sections, speakSection, stop as stopReading, hasNotes, supported as speechSupported } from "@/lib/gini/reader";
import GiniSprite, { GINI_KEYFRAMES, type GiniMood } from "./GiniSprite";

/**
 * The name of the subject an answer came from, for the follow-ups to use. Read
 * from lib/subjects.ts rather than carried in the reply, so it can never be a
 * stale copy of a name the site has since changed (Iron Rule 5).
 */
const subjectNameOf = (src: GiniSource | null, ctx: GiniContext): string | undefined => {
  const id = src && "subjectId" in src ? src.subjectId : ctx.subjectId;
  return id ? CPL_SUBJECTS.find(s => s.id === id)?.name : undefined;
};

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
  /** How much of the current bubble has been "spoken" so far. */
  const [typed, setTyped] = useState(0);
  const [asking, setAsking] = useState(false);
  const [query, setQuery] = useState("");
  const [thinking, setThinking] = useState(false);
  const [vanishing, setVanishing] = useState(false);
  const [entering, setEntering] = useState(false);
  const timers = useRef<number[]>([]);
  const pathname = usePathname();
  const [onNotes, setOnNotes] = useState(false);
  const [reading, setReading] = useState(false);
  const sectionIdx = useRef(0);

  /**
   * WHERE THE STUDENT IS STANDING. Everything context-aware — which greeting,
   * which of the Captain's offers, which subject to bias a bank search towards
   * — is derived from this and from lib/subjects.ts, so none of it can be a
   * stale hardcoded claim.
   */
  const ctx = useMemo(() => readContext(pathname), [pathname]);

  /**
   * WHAT TO OFFER NEXT. Page-appropriate openers until he has answered
   * something, then follow-ups chosen for what he just said — because the most
   * useful next question is almost never the one that was useful before you
   * asked anything.
   */
  const [followUps, setFollowUps] = useState<{ path: string; items: string[] } | null>(null);

  /**
   * TIED TO THE PATH THEY WERE CHOSEN ON, so walking to another page brings
   * back the suggestions for that page instead of leaving the last answer's
   * follow-ups sitting there forever. Derived rather than reset in an effect:
   * setting state from an effect on every navigation is what
   * react-hooks/set-state-in-effect exists to catch, and comparing two strings
   * during render is both cheaper and clearer than suppressing it.
   */
  const suggestions = useMemo(
    () => (followUps && followUps.path === ctx.pathname ? followUps.items : suggestionsFor(ctx)),
    [followUps, ctx],
  );

  /** The offers already made in this tab. Kept in a ref: changing it must not re-render. */
  const pitchState = useRef<PitchState>({ shown: [], lastAt: 0, startedAt: 0 });
  /** The last chapter path he has already remarked on, so he says it once. */
  const roomed = useRef<string | null>(null);

  /**
   * SAY SOMETHING. Every bubble in this component goes through here, so the
   * typewriter can never be left showing a half-revealed previous sentence —
   * the reset and the text are set together, in one place, rather than in the
   * eight places that used to call setBubble directly.
   */
  const show = useCallback((text: string | null, href?: string | null) => {
    setTyped(0);
    setBubbleHref(href ?? null);
    setBubble(text);
  }, []);

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

    // Seed the offer leash from this tab's session, so navigating between
    // pages neither resets the warm-up nor re-offers something already said.
    pitchState.current = readPitchState(Date.now());
    setReady(true);
    return () => {
      mq.removeEventListener("change", onChange);
      nq.removeEventListener("change", onNarrow);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // The explicit choice wins; the OS hint is only the default.
  const reduced = motionPref === "on" ? false : motionPref === "off" ? true : osReduced;

  /**
   * HIM TALKING. The words arrive one at a time and his mouth moves while they
   * do — real articulation, cut from close-up footage the Captain supplied, not
   * a bob standing in for it. `speaking` drives the sprite; this drives the text.
   *
   * No setState in the effect body, so no lint suppression is needed: the
   * counter only advances inside the interval callback, and `show()` does the
   * reset at the moment the text is set.
   *
   * Under reduced motion `typed` simply stays at 0 and the render shows the
   * whole sentence at once — a person who asked for less movement should not
   * have to sit through a letter-by-letter reveal to read an answer.
   */
  useEffect(() => {
    if (!bubble || reduced) return;
    const id = window.setInterval(() => {
      setTyped(n => (n >= bubble.length ? n : n + 1));
    }, 18);
    return () => window.clearInterval(id);
  }, [bubble, reduced]);

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
      show("There's no chapter text on this page for me to read.");
      return;
    }
    if (sectionIdx.current >= all.length) sectionIdx.current = 0;
    const s = all[sectionIdx.current];
    setReading(true);
    setMood("talk");
    show(`Reading ${sectionIdx.current + 1} of ${all.length}: ${s.title}`);
    speakSection(s, () => {
      setReading(false);
      setMood("idle");
      sectionIdx.current += 1;
      if (sectionIdx.current >= all.length) {
        sectionIdx.current = 0;
        show("That's the whole chapter. Ask me about any of it.");
      } else {
        show(`Done. Press Read again for "${all[sectionIdx.current].title}".`);
      }
    });
  }, [show]);

  const haltReading = useCallback(() => {
    stopReading();
    setReading(false);
    setMood("idle");
    show(null);
  }, [show]);

  // Never keep talking after he is dismissed or the student navigates away.
  useEffect(() => () => stopReading(), []);
  // Silence him the moment he is dismissed. Deliberately calls the DOM-only
  // stopReading() rather than haltReading(): an effect must not set React
  // state synchronously. The `reading` flag is cleared in recall() instead.
  useEffect(() => { if (dismissed) stopReading(); }, [dismissed]);

  /**
   * THE GREETING. Once per tab, never per page — a receptionist greets you at
   * the door, not in every room. Text only: he does not make a sound unless
   * asked (design rule 2), and this fires without anyone asking.
   *
   * The line itself is chosen in lib/gini/persona.ts from the time on the
   * student's own clock, whether they have been here before, and which room
   * they walked into. A first-ever visitor is told what he is AND how to
   * dismiss him, in the same breath.
   *
   * He stays silent in a quiet zone — a running exam, the simulator, signup —
   * where greeting someone would be interrupting them.
   */
  useEffect(() => {
    if (dismissed || !ready || asking || bubble) return;
    /**
     * The quiet-zone check has to come BEFORE the greeting is marked as used,
     * and it is not obvious why. Landing straight on /signup or an exam is
     * common — and marking the greeting spent there would mean the student
     * walks into the rest of the site to be met by nobody, all session. Worse,
     * countVisit() sits in the call below, so a page he must stay silent on
     * would have incremented the visit counter on every render.
     */
    if (ctx.quietZone) return;
    if (hasGreeted()) return;
    markGreeted();

    const spoken = greeting(ctx, { visits: countVisit(), hour: new Date().getHours() });
    if (!spoken) return;

    // The greeting already says what the chapter line would say, so claim this
    // path and keep the two from talking over each other in the same commit —
    // `bubble` is still null in both effects on this pass.
    roomed.current = pathname;

    // A BEAT BEFORE HE SPEAKS, and it is doing two jobs. A character who talks
    // the instant the page paints reads as a pop-up; one who takes a moment
    // reads as having noticed you. It also keeps the setState out of the effect
    // body, which is the correct fix for react-hooks/set-state-in-effect rather
    // than a suppression — the same shape the onNotes check above already uses.
    later(() => {
      setMood(spoken.mood);
      show(spoken.text, spoken.href);
    }, 900);
    later(() => setMood("idle"), 4100);
    later(() => show(null), 13900);
  }, [ctx, pathname, dismissed, ready, asking, bubble, later, show]);

  /**
   * ARRIVING ON A CHAPTER, having already been greeted. One short line per
   * chapter, offering the thing he can uniquely do here — read it aloud.
   */
  useEffect(() => {
    if (dismissed || !pathname || asking || bubble) return;
    if (!/\/notes$/.test(pathname)) return;
    if (roomed.current === pathname) return;
    roomed.current = pathname;
    setMood("present_book");
    show(
      ctx.chapterTitle
        ? `${ctx.chapterTitle} is open. I can read it aloud, or answer on it.`
        : "Chapter's open. I can read it aloud, or answer on it.",
    );
    later(() => setMood("idle"), 3000);
    later(() => show(null), 7000);
  }, [pathname, ctx.chapterTitle, dismissed, asking, bubble, later, show]);

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
        // Mention what the Captain actually offers. The free school stays free,
        // but a receptionist who never mentions the paid path is not doing his
        // job. EVERY constraint on this — warm-up, gap, per-session cap, no
        // repeats, silence in a quiet zone, which offer suits this page — is
        // decided in lib/gini/marketing.ts. This branch only asks and obeys;
        // a null answer, which is the common one, means he says nothing.
        const now = Date.now();
        const pitch = choosePitch(ctx, pitchState.current, now, Math.random());
        if (pitch) {
          pitchState.current = recordPitch(pitchState.current, pitch.id, now);
          setMood(pitch.mood);
          show(pitch.say(ctx), pitch.href(ctx));
          window.setTimeout(() => setMood("idle"), 2600);
          window.setTimeout(() => show(null), 14000);
        }
      } else {
        // Just a flicker of personality, staying put.
        const faces: GiniMood[] = ["happy", "laugh", "surprised"];
        setMood(faces[Math.floor(Math.random() * faces.length)]);
        window.setTimeout(() => setMood("idle"), 2000);
      }
    }, 30000);
    return () => window.clearInterval(id);
  }, [ctx, dismissed, reduced, asking, bubble, perches.length, show]);

  /** Say something, wearing the right face, then settle back to idle. */
  const say = useCallback((text: string, face: GiniMood, href?: string) => {
    show(text, href);
    setMood(face);
    later(() => setMood("talk"), 1400);
  }, [later, show]);

  const flyTo = useCallback((next: number) => {
    setMood("fly");
    setPerch(next);
    later(() => setMood("idle"), 2200);
  }, [later]);

  const vanish = useCallback(() => {
    stopReading();
    show(null);
    setVanishing(true);
    later(() => {
      setDismissed(true);
      setVanishing(false);
      try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* private mode */ }
    }, reduced ? 0 : 900);
  }, [reduced, later, show]);

  const recall = useCallback(() => {
    try { localStorage.removeItem(DISMISS_KEY); } catch { /* ignore */ }
    setDismissed(false);
    setReading(false);
    setEntering(true);
    setMood("happy");
    show("Back. What do you need?");
    later(() => { setEntering(false); setMood("idle"); }, 900);
  }, [later, show]);

  /**
   * ANSWERING. askDeep() answers instantly from the light layer where it can
   * — manners, the FAQ, the Captain's offers, site structure — and only pulls
   * in the question bank (a dynamic import, megabytes) when nothing lighter
   * fits. So the common cases stay instant and the bank costs nothing to
   * anyone who never types a question.
   *
   * `thinking` exists because that import is a real network fetch the first
   * time. A character who freezes for a second looks broken; one who says he
   * is looking does not.
   */
  const answerQuery = useCallback(async (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    setQuery("");
    setThinking(true);
    setMood("surprised");
    show("Let me look…");

    /**
     * The subject he was last talking about stands in when the page does not
     * name one. A student on the home page who asks about drift and then asks
     * "how many questions are there" means Navigation, and before this the
     * second question started from nothing.
     */
    const asked: GiniContext = ctx.subjectId
      ? ctx
      : { ...ctx, subjectId: rememberedSubject() };

    let reply: GiniReply;
    try {
      // The smart route first: the server asks Gemini to PICK from answers that
      // already exist here, and returns that stored text verbatim. It returns
      // null for every imperfect outcome — no key, quota gone, timeout, a guard
      // rejection — and then the local layer answers exactly as it always has.
      reply = (await askSmart(q, asked)) ?? (await askDeep(q, asked));
    } catch {
      // A failed lookup must never become a guess.
      reply = { kind: "refusal", text: "Something went wrong looking that up. Try again?", reason: "not-verified" };
    }

    setThinking(false);

    // Remember the subject, and offer what is worth asking next.
    const src = reply.kind === "answer" ? reply.source : null;
    if (src && "subjectId" in src && src.subjectId) rememberSubject(src.subjectId);
    setFollowUps({ path: ctx.pathname, items: followUpsFor(src, asked, subjectNameOf(src, asked)) });

    if (reply.kind === "answer") {
      // He knows this one — trident up, lightning, then settle into laughing.
      setMood("thunder");
      show(reply.text, reply.href);
      later(() => setMood("laugh"), 1500);
      later(() => setMood("talk"), 3200);
    } else {
      say(reply.text, "angry");
    }
  }, [ctx, say, later, show]);

  const submit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    void answerQuery(query);
  }, [query, answerQuery]);


  /**
   * What is on screen right now, and whether he is still saying it. Derived, so
   * there is one source of truth for the text, the articulation animation and
   * whether the call-to-action link has been reached yet.
   */
  const speaking = !!bubble && !reduced && typed < bubble.length;
  const visibleText = !bubble ? null : reduced ? bubble : bubble.slice(0, typed);

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
              cursor: speaking ? "pointer" : "default",
            }}
            // Impatience is legitimate. Tapping the bubble finishes the sentence
            // at once rather than making a student watch him spell it out.
            onClick={() => bubble && setTyped(bubble.length)}
            title={speaking ? "Tap to show it all" : undefined}
          >
            {visibleText}
            {/* The link waits until he has finished the sentence — a call to
                action that appears mid-word reads as a glitch. */}
            {bubbleHref && !speaking && (
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
          <div style={{ pointerEvents: "auto", alignSelf: "stretch", marginBottom: 10 }}>
            <form onSubmit={submit}>
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                disabled={thinking}
                placeholder="Ask about a chapter, a question, the exam…"
                aria-label="Ask Gini a question"
                style={{
                  width: "100%", padding: "9px 11px", borderRadius: 11, fontSize: 13,
                  background: "rgba(10,15,20,0.95)", color: "#e6edf3",
                  border: "1px solid rgba(240,145,58,0.4)", outline: "none",
                }}
              />
            </form>
            {/* One-tap questions he can definitely answer, chosen for this page.
                An assistant that advertises none of what it does gets used for
                none of it. */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void answerQuery(s)}
                  style={{
                    padding: "3px 8px", fontSize: 10.5, borderRadius: 999, cursor: "pointer",
                    background: "rgba(240,145,58,0.12)", color: "#f0b070",
                    border: "1px solid rgba(240,145,58,0.35)", textAlign: "left",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <GiniSprite mood={mood} reduced={reduced} vanishing={vanishing} entering={entering} speaking={speaking} height={figureH} />

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
