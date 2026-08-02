"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

/**
 * The storm-peak mascot plate, animated.
 *
 * DIRECTION NOTE — why the figure is not cut into limbs.
 * The brief was "thumping the trident, offering the book". The artwork is a
 * single flat render, so genuinely swinging an arm would mean matting the limb
 * out and rebuilding what sits behind it; on a plate this detailed that reads as
 * a torn sticker, which is worse than no motion at all. So the beat is sold the
 * way a compositor sells it: the WHOLE figure drives down a fraction of a
 * percent, the camera shakes, a shock ring races out from the trident butt, dust
 * kicks, and the sky flashes — all on the same frame. The eye reads an impact,
 * not a translation. The book gets its own moment on the off-beat so the two
 * gestures never compete.
 *
 * Every FX position is anchored to a measured point in the plate, and the wide
 * and mobile crops need different anchors because the mobile asset is cropped
 * from x=345 of a 1408px frame.
 */

const BEAT = "7s";

// Deterministic ember seeds — no Math.random during render, which would desync
// the server and client markup and break hydration.
const EMBERS = [
  { l: 44, d: 0.0, x: 14, s: 5 }, { l: 48, d: 1.3, x: -10, s: 4 },
  { l: 52, d: 2.6, x: 8, s: 6 },  { l: 41, d: 3.9, x: -6, s: 3 },
  { l: 57, d: 5.2, x: 12, s: 5 }, { l: 63, d: 0.9, x: -14, s: 4 },
  { l: 37, d: 2.1, x: 9, s: 3 },  { l: 60, d: 4.4, x: -8, s: 5 },
];

type FxProps = { tridentX: string; tridentY: string; bookX: string; bookY: string };

/** Impact ring, spark bloom and book glow, anchored to one crop's geometry. */
function Fx({ tridentX, tridentY, bookX, bookY }: FxProps) {
  return (
    <>
      {/* shock ring at the trident butt — flattened to sit on the ground plane */}
      <div className="mascot-anim absolute pointer-events-none"
           style={{
             left: tridentX, top: tridentY, width: "42vw", maxWidth: 620, height: "42vw", maxHeight: 620,
             borderRadius: "50%",
             border: "2px solid rgba(240,145,58,0.55)",
             boxShadow: "0 0 60px rgba(240,145,58,0.35), inset 0 0 40px rgba(240,145,58,0.25)",
             animation: `mascotShock ${BEAT} cubic-bezier(0.16,0.9,0.3,1) infinite`,
             willChange: "transform, opacity",
           }} />
      {/* hot bloom at the point of contact */}
      <div className="mascot-anim absolute pointer-events-none"
           style={{
             left: tridentX, top: tridentY, width: "26vw", maxWidth: 340, height: "12vw", maxHeight: 150,
             borderRadius: "50%",
             background: "radial-gradient(ellipse at center, rgba(255,225,170,0.95) 0%, rgba(240,145,58,0.55) 35%, rgba(240,145,58,0) 70%)",
             filter: "blur(6px)",
             animation: `mascotSpark ${BEAT} ease-out infinite`,
             willChange: "transform, opacity",
           }} />
      {/* the offered book, on the off-beat */}
      <div className="mascot-anim absolute pointer-events-none"
           style={{
             left: bookX, top: bookY, width: "20vw", maxWidth: 260, height: "20vw", maxHeight: 260,
             borderRadius: "50%",
             background: "radial-gradient(circle at center, rgba(243,200,137,0.55) 0%, rgba(240,145,58,0.28) 40%, rgba(240,145,58,0) 72%)",
             filter: "blur(10px)",
             animation: `mascotBook ${BEAT} ease-in-out infinite`,
             willChange: "transform, opacity",
           }} />
      {/* embers lifting off the book */}
      {EMBERS.map((e, i) => (
        <span key={i} className="mascot-anim absolute pointer-events-none rounded-full"
              style={{
                left: `calc(${bookX} + ${e.l - 50}px)`, top: bookY,
                width: e.s, height: e.s,
                background: "rgba(243,200,137,0.9)",
                boxShadow: "0 0 8px rgba(240,145,58,0.9)",
                ["--ex" as string]: `${e.x}px`,
                animation: `emberRise 6s ease-out ${e.d}s infinite`,
                willChange: "transform, opacity",
              }} />
      ))}
    </>
  );
}

export default function MascotHero({ children }: { children?: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [fine, setFine] = useState(false);

  useEffect(() => {
    // Pointer parallax only where there is a real pointer, and never when the
    // visitor has asked for reduced motion.
    const mq = window.matchMedia("(pointer: fine)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- capability is unknowable during SSR
    setFine(mq.matches && !rm.matches);
  }, []);

  useEffect(() => {
    if (!fine) return;
    const el = wrapRef.current;
    if (!el) return;
    let frame = 0;
    const onMove = (ev: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = el.getBoundingClientRect();
        const cx = (ev.clientX - r.left) / r.width - 0.5;
        const cy = (ev.clientY - r.top) / r.height - 0.5;
        setTilt({ x: cx, y: cy });
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(frame); };
  }, [fine]);

  return (
    <section ref={wrapRef}
             className="relative w-full overflow-hidden"
             style={{ background: "var(--storm-deep)" }}>
      {/* shake wrapper — kept separate from the figure's own transform so the
          two animations compose rather than clobber each other */}
      <div className="mascot-anim absolute inset-0"
           style={{ animation: `mascotShake ${BEAT} ease-out infinite`, willChange: "transform" }}>
        {/* the plate itself: slow drift + pointer parallax + the thump */}
        <div className="mascot-anim absolute inset-0"
             style={{
               animation: `mascotDrift 26s ease-in-out infinite, mascotThump ${BEAT} ease-out infinite`,
               willChange: "transform",
             }}>
          <div className="absolute inset-0 transition-transform duration-500 ease-out"
               style={{ transform: `translate3d(${tilt.x * -14}px, ${tilt.y * -10}px, 0)` }}>
            {/* ── RIGGED PLATE (tablet and up) ──
                Two layers: the plate with the trident painted out, and the
                trident itself pivoting on the hand. That makes the weapon
                genuinely articulate rather than the whole frame nudging. */}
            <div className="mascot-anim hidden sm:block absolute inset-0"
                 style={{ animation: `mascotStride 3.4s ease-in-out infinite`, willChange: "transform" }}>
              <Image src="/mascot-base.webp" alt="" fill priority sizes="100vw"
                     className="object-cover" style={{ objectPosition: "50% 48%" }} />
              <Image src="/mascot-trident.webp" alt="" fill priority sizes="100vw"
                     className="mascot-anim object-cover"
                     style={{
                       objectPosition: "50% 48%",
                       transformOrigin: "63.42% 41.41%",   // the hand grip, measured
                       animation: `tridentSwing ${BEAT} cubic-bezier(0.3,0,0.2,1) infinite`,
                       willChange: "transform",
                     }} />
            </div>
            {/* Tall narrow crop for phones. The wide plate renders him far too
                small on a 390px screen, and a squarer crop made object-cover eat
                the trident entirely — verified by rendering both. 35% pushes the
                figure up so the lower third stays dark for the copy. Phones get
                the unrigged plate and the stride only: the rig's second image
                would double the bytes on mobile data for motion that is barely
                readable at that size. */}
            <div className="mascot-anim sm:hidden absolute inset-0"
                 style={{ animation: `mascotStride 3.4s ease-in-out infinite`, willChange: "transform" }}>
              <Image src="/mascot-hero-mobile.webp" alt="" fill priority sizes="100vw"
                     className="object-cover" style={{ objectPosition: "50% 35%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* lightning wash over the whole frame */}
      <div className="mascot-anim absolute inset-0 pointer-events-none"
           style={{
             background: "linear-gradient(180deg, rgba(207,216,238,0.85) 0%, rgba(207,216,238,0.25) 45%, rgba(207,216,238,0) 75%)",
             mixBlendMode: "screen",
             animation: `mascotFlash ${BEAT} linear infinite`,
             willChange: "opacity",
           }} />

      {/* Impact and book FX. Anchors were MEASURED off a render of the composed
          hero, not estimated: the trident butt meets the rock at ~62%/85% on the
          wide plate. An earlier guess of 91% would have fired the shock ring
          below the ground contact, which reads as a bug rather than a blow. */}
      <div className="hidden sm:block"><Fx tridentX="62%" tridentY="85%" bookX="46.5%" bookY="51%" /></div>
      <div className="sm:hidden"><Fx tridentX="73%" tridentY="84%" bookX="42%" bookY="50%" /></div>

      {/* grade: warm the lows, sink the edges, land the bottom on the page */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background:
          "radial-gradient(ellipse 75% 55% at 50% 42%, rgba(240,145,58,0.10) 0%, rgba(0,0,0,0) 65%)," +
          "radial-gradient(ellipse 120% 90% at 50% 45%, rgba(0,0,0,0) 40%, rgba(6,9,13,0.55) 85%, rgba(11,17,23,0.95) 100%)",
      }} />
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none"
           style={{ background: "linear-gradient(to bottom, rgba(11,17,23,0) 0%, var(--storm-deep) 92%)" }} />
      {/* Copy scrim. The headline block sits bottom-left, and on the wide plate
          that lands over the sunset — the brightest part of the frame. Without
          this the strapline and body copy fight the glow. Left-weighted so the
          mascot's right side stays untouched. */}
      <div className="absolute inset-0 pointer-events-none hidden sm:block" style={{
        background: "linear-gradient(105deg, rgba(6,9,13,0.88) 0%, rgba(6,9,13,0.62) 26%, rgba(6,9,13,0.18) 48%, rgba(6,9,13,0) 66%)",
      }} />
      <div className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none sm:hidden" style={{
        background: "linear-gradient(to top, rgba(6,9,13,0.92) 0%, rgba(6,9,13,0.55) 45%, rgba(6,9,13,0) 100%)",
      }} />

      {/* headline and calls to action ride above everything */}
      <div className="relative z-10">{children}</div>
    </section>
  );
}
