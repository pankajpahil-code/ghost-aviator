"use client";

/**
 * Gini's body — animated sprite-sheet edition.
 *
 * WHY SHEETS, NOT A 3D MESH
 * -------------------------
 * The generated 3D route produced a faceless grey mannequin. The Captain's own
 * footage already contains the real character doing everything needed — flying
 * with wings beating, laughing, snarling, smiling, trident held out. So both
 * identity and motion come from his artwork:
 *
 *   - `seq_*.webp` are horizontal STRIPS of matted frames, animated with CSS
 *     `steps()` — which is how sprite animation has always worked, and how
 *     Clippy worked.
 *   - single-frame poses carry the expressions, which read better held still.
 *
 * The lightning is DRAWN here rather than extracted: in the source footage it is
 * sky behind him, so background removal correctly deletes it. Drawing it means
 * it can fire on cue instead of only when a frame happens to contain it.
 */

import { useEffect, useRef } from "react";

// The union lives in lib/gini/types.ts, beside the code that CHOOSES a mood.
// This file owns the frames for each one, not the list of names.
import type { GiniMood } from "@/lib/gini/types";
export type { GiniMood };

/** Animated strips: `frames` cells of fw x fh, walked with steps(). */
type Seq = { src: string; frames: number; fw: number; fh: number; fps: number };
/**
 * ONLY EVENTS ANIMATE.
 *
 * `idle` is deliberately absent: looping its 10-frame strip read as "a video is
 * playing in a box" rather than a character breathing, because the camera drifts
 * between source frames so consecutive cells differ too much. Standing still is
 * a STILL, with a gentle CSS float for life. Sequences fire only for fly and
 * thunder, which last a couple of seconds and then hand back to the still.
 */
const SEQS: Partial<Record<GiniMood, Seq>> = {
  fly:     { src: "/gini/sprites/seq_fly.webp",     frames: 12, fw: 247, fh: 200, fps: 12 },
  thunder: { src: "/gini/sprites/seq_thunder.webp", frames: 12, fw: 247, fh: 200, fps: 12 },
};

/** Held single frames for expression. */
const STILLS: Partial<Record<GiniMood, { src: string; w: number; h: number }>> = {
  idle:         { src: "/gini/sprites/idle.webp",         w: 520, h: 434 },
  talk:         { src: "/gini/sprites/talk.webp",         w: 482, h: 520 },
  happy:        { src: "/gini/sprites/happy.webp",        w: 505, h: 520 },
  laugh:        { src: "/gini/sprites/laugh.webp",        w: 520, h: 486 },
  angry:        { src: "/gini/sprites/angry.webp",        w: 487, h: 520 },
  surprised:    { src: "/gini/sprites/surprised.webp",    w: 485, h: 520 },
  point:        { src: "/gini/sprites/point.webp",        w: 520, h: 400 },
  present_book: { src: "/gini/sprites/present_book.webp", w: 392, h: 520 },
};

export const GINI_KEYFRAMES = `
@keyframes gini-bob   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes gini-hover { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-14px) rotate(1.5deg)} }
@keyframes gini-pop   { 0%{transform:scale(.7);opacity:0} 60%{transform:scale(1.06);opacity:1} 100%{transform:scale(1);opacity:1} }
@keyframes gini-poof  { 0%{transform:scale(1) translateY(0);opacity:1;filter:blur(0)} 100%{transform:scale(.5) translateY(-30px);opacity:0;filter:blur(7px)} }
@keyframes gini-bolt  { 0%{opacity:0} 8%{opacity:1} 18%{opacity:.2} 30%{opacity:1} 55%{opacity:0} 100%{opacity:0} }
@keyframes gini-strip-12 { from{background-position:0 0} to{background-position:var(--gini-sheet-w) 0} }
`;

/** Lightning arcing off the trident head. */
function Bolts() {
  return (
    <svg
      viewBox="0 0 247 200" aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
               pointerEvents: "none", overflow: "visible" }}
    >
      {/* The trident head sits around (60,40) in the body strips. */}
      <g style={{ animation: "gini-bolt .75s ease-out 2" }}>
        <path d="M60 40 L44 10 L54 16 L36 -16" fill="none" stroke="#cfe9ff" strokeWidth="2.6"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px #6cc0ff)" }} />
        <path d="M60 40 L88 18 L76 24 L104 -4" fill="none" stroke="#eef8ff" strokeWidth="1.9"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 6px #6cc0ff)" }} />
        <path d="M60 40 L30 50 L45 53 L12 72" fill="none" stroke="#cfe9ff" strokeWidth="1.7"
              strokeLinecap="round" strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 5px #6cc0ff)" }} />
        <circle cx="60" cy="40" r="8" fill="#e6f4ff" opacity=".9" style={{ filter: "blur(4px)" }} />
      </g>
    </svg>
  );
}

export default function GiniSprite({
  mood, reduced, vanishing, entering, height = 200,
}: {
  mood: GiniMood;
  reduced: boolean;
  vanishing?: boolean;
  entering?: boolean;
  height?: number;
}) {
  // Warm every asset once so a mood change never flashes an empty frame.
  const warmed = useRef(false);
  useEffect(() => {
    if (warmed.current) return;
    warmed.current = true;
    for (const u of [...Object.values(SEQS).map(s => s.src),
                     ...Object.values(STILLS).map(s => s.src)]) {
      const i = new window.Image();
      i.src = u;
    }
  }, []);

  const outer =
    vanishing ? "gini-poof .9s ease-in forwards"
    : entering ? "gini-pop .5s cubic-bezier(.34,1.56,.64,1)"
    : reduced ? "none"
    : (mood === "fly" || mood === "thunder") ? "gini-hover 2.4s ease-in-out infinite"
    : "gini-bob 3.6s ease-in-out infinite";

  const seq = SEQS[mood];
  if (seq) {
    const w = Math.round(seq.fw * (height / seq.fh));
    const sheetW = w * seq.frames;
    return (
      <div style={{ position: "relative", width: w, height, animation: outer }}>
        <div
          role="img"
          aria-label="Gini, the Ghost Aviator guide"
          style={{
            width: w, height,
            backgroundImage: `url(${seq.src})`,
            backgroundSize: `${sheetW}px ${height}px`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "0 0",
            // Custom property feeds the shared keyframes, so one @keyframes rule
            // serves every 12-cell strip instead of one rule per sheet width.
            ["--gini-sheet-w" as string]: `-${sheetW}px`,
            animation: reduced
              ? "none"
              : `gini-strip-12 ${(seq.frames / seq.fps).toFixed(2)}s steps(${seq.frames}) infinite`,
            filter: "drop-shadow(0 10px 14px rgba(0,0,0,.55))",
          }}
        />
        {mood === "thunder" && !reduced && <Bolts />}
      </div>
    );
  }

  const still = STILLS[mood] ?? STILLS.talk!;
  const w = Math.round(height * (still.w / still.h));
  return (
    /* next/image is wrong here: these are pre-optimised WebP at a fixed size, so
       the optimizer gains nothing, and its URLs would defeat the preload above. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={still.src} width={w} height={height} alt="" aria-hidden="true" draggable={false}
      style={{
        width: w, height, display: "block", animation: outer,
        filter: "drop-shadow(0 10px 14px rgba(0,0,0,.55))",
        pointerEvents: "none", userSelect: "none",
      }}
    />
  );
}
