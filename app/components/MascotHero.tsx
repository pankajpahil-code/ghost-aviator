"use client";

import { useEffect, useRef } from "react";

/**
 * The mascot hero — real footage.
 *
 * This replaced a rigged still. The still could only ever fake motion: the
 * trident swung on a cut layer and the body was nudged as a whole, because
 * rebuilding the sunset and the castle behind a moving wing is not possible
 * from one flat frame. With actual footage the character moves properly, so
 * all the synthetic impact FX are gone — they would only fight the real thing.
 *
 * TWO EDITS ARE BAKED INTO THE CROP AND MUST SURVIVE ANY RE-ENCODE
 * (see tools/prepare-mascot-video.mjs):
 *   • the book in the source reads "OXFORD" — a publisher name, barred from
 *     student-facing content by Iron Rule 2. It moves with the camera, so it is
 *     removed by geometry rather than by a patch that could drift.
 *   • the generator's sparkle watermark, bottom-right, goes with the same crop.
 * A first mobile crop kept the cover plainly legible; it was caught by zooming
 * the ENCODED output, which is the only place that check is meaningful.
 */

const DESK_ASPECT = "1600 / 500";
const MOB_ASPECT = "704 / 450";

export default function MascotHero({ children }: { children?: React.ReactNode }) {
  const videos = useRef<HTMLVideoElement[]>([]);

  useEffect(() => {
    // The <video> elements are rendered on the SERVER so the browser starts
    // fetching them with the document. Gating the ELEMENT behind a state flag
    // (the first attempt) meant no video reached the initial HTML at all and
    // playback began only after hydration. What is gated instead is PLAY:
    // nothing autoplays from markup, and this starts it only when motion is
    // welcome. Reduced-motion and metered visitors simply keep the poster.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as unknown as {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    const thrifty = !!conn?.saveData || /^(slow-2g|2g)$/.test(conn?.effectiveType ?? "");
    if (reduce || thrifty) return;
    for (const v of videos.current) {
      // play() rejects if the browser declines autoplay; the poster stays, which
      // is a perfectly good outcome and must not throw an unhandled rejection.
      v.play().catch(() => {});
    }
  }, []);

  const shot = (base: string, aspect: string, className: string, poster: string, alt: string) => (
    <div className={`${className} relative w-full`} style={{ aspectRatio: aspect, background: "var(--storm-deep)" }}>
      <video
        ref={el => { if (el && !videos.current.includes(el)) videos.current.push(el); }}
        className="absolute inset-0 w-full h-full object-cover"
        muted loop playsInline preload="auto" poster={poster} aria-label={alt}
      >
        <source src={`${base}.webm`} type="video/webm" />
        <source src={`${base}.mp4`} type="video/mp4" />
      </video>
      {/* grade: warm the middle, sink the edges, land the bottom on the page */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background:
          "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(240,145,58,0.08) 0%, rgba(0,0,0,0) 62%)," +
          "radial-gradient(ellipse 120% 95% at 50% 45%, rgba(0,0,0,0) 45%, rgba(6,9,13,0.45) 88%, rgba(11,17,23,0.9) 100%)",
      }} />
      <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
           style={{ background: "linear-gradient(to bottom, rgba(11,17,23,0) 0%, var(--storm-deep) 95%)" }} />
    </div>
  );

  return (
    <section className="relative w-full overflow-hidden" style={{ background: "var(--storm-deep)" }}>
      {shot("/mascot-hero", DESK_ASPECT, "hidden sm:block", "/mascot-hero-poster.webp",
            "Ghost Aviator mascot on the storm peak")}
      {shot("/mascot-hero-m", MOB_ASPECT, "sm:hidden", "/mascot-hero-m-poster.webp",
            "Ghost Aviator mascot on the storm peak")}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
