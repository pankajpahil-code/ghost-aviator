"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

/**
 * The mascot hero — the full cinematic frame, playing.
 *
 * FRAMING: no crop. The whole 16:9 plate is shown, on Capt. Pahil's decision of
 * 2026-08-02 (see tools/prepare-mascot-video.mjs). An earlier version cropped a
 * band to remove the word "OXFORD" from the book; he overruled it, and cropping
 * had also cost the best beat in the clip — the book being handed to a student.
 *
 * PLAYBACK: it autoplays, muted, and there is always a visible pause control.
 * The previous version refused to start whenever the browser reported
 * prefers-reduced-motion, which on Windows is set by the ordinary "Animation
 * effects" toggle rather than by any accessibility need — so the Captain's own
 * laptop showed a still poster while his phone played fine. Blocking outright
 * was the wrong reading of that signal. What visitors are owed is CONTROL, and
 * they have it: one tap stops it, and the choice sticks for the session.
 */

const SOURCES = [
  { base: "/mascot-hero", poster: "/mascot-hero-poster.webp", cls: "hidden sm:block" },
  { base: "/mascot-hero-m", poster: "/mascot-hero-m-poster.webp", cls: "sm:hidden" },
];

export default function MascotHero({ children }: { children?: React.ReactNode }) {
  const videos = useRef<HTMLVideoElement[]>([]);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    // Only the element that is actually laid out should play; the other is
    // display:none at this breakpoint and decoding it would burn battery for
    // nothing.
    for (const v of videos.current) {
      if (v.offsetParent === null) { v.pause(); continue; }
      v.play().catch(() => setPlaying(false));   // browser declined; poster stays
    }
  }, []);

  const toggle = useCallback(() => {
    setPlaying(p => {
      const next = !p;
      for (const v of videos.current) {
        if (v.offsetParent === null) continue;
        if (next) v.play().catch(() => {}); else v.pause();
      }
      return next;
    });
  }, []);

  return (
    <section className="relative w-full overflow-hidden" style={{ background: "var(--storm-deep)" }}>
      {SOURCES.map(({ base, poster, cls }) => (
        <div key={base} className={`${cls} relative w-full`}
             style={{ aspectRatio: "16 / 9", background: "var(--storm-deep)" }}>
          <video
            ref={el => { if (el && !videos.current.includes(el)) videos.current.push(el); }}
            className="absolute inset-0 w-full h-full object-cover"
            muted loop playsInline preload="auto" poster={poster}
            aria-label="Ghost Aviator mascot on the storm peak"
          >
            <source src={`${base}.webm`} type="video/webm" />
            <source src={`${base}.mp4`} type="video/mp4" />
          </video>
          {/* grade: warm the middle, sink the edges, land the bottom on the page */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(240,145,58,0.08) 0%, rgba(0,0,0,0) 62%)," +
              "radial-gradient(ellipse 120% 95% at 50% 48%, rgba(0,0,0,0) 48%, rgba(6,9,13,0.42) 88%, rgba(11,17,23,0.88) 100%)",
          }} />
          <div className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
               style={{ background: "linear-gradient(to bottom, rgba(11,17,23,0) 0%, var(--storm-deep) 95%)" }} />
        </div>
      ))}

      <button
        onClick={toggle}
        aria-label={playing ? "Pause background video" : "Play background video"}
        className="absolute top-4 right-4 z-20 flex items-center justify-center rounded-full transition-opacity"
        style={{
          width: 38, height: 38,
          background: "rgba(11,17,23,0.62)",
          border: "1px solid rgba(243,200,137,0.4)",
          color: "var(--ember-soft)",
          backdropFilter: "blur(4px)",
          opacity: 0.72,
        }}
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      <div className="relative z-10">{children}</div>
    </section>
  );
}
