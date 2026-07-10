"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// HeroGhost — the home-page centrepiece.
// Cinematic guardian captain (Capt. Pahil's generated art: winged spectral
// captain with halo, /ghost-captain.webp, 42 KB) levitating inside a
// mouse-tilted 3D stage. The art's edges dissolve into the night with a
// feathered mask; twinkling stars, a breathing ground-glow and drifting mist
// complete the scene. Honours prefers-reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const STARS: [number, number, number, number][] = [
  // [x%, y%, size(px), delay(s)]
  [8, 18, 2, 0], [16, 62, 1.5, 1.2], [24, 8, 2.5, 2.1], [30, 40, 1.5, 0.6],
  [70, 12, 2, 1.7], [78, 48, 1.5, 0.3], [88, 26, 2.5, 2.6], [92, 66, 1.5, 1.0],
  [12, 84, 2, 2.9], [84, 86, 2, 0.9], [50, 4, 1.5, 1.5], [62, 90, 1.5, 2.3],
];

export default function HeroGhost() {
  const stageRef = useRef<HTMLDivElement>(null);
  const tiltRef  = useRef<HTMLDivElement>(null);

  // Mouse-driven 3D tilt (desktop) / gentle auto-sway (touch).
  useEffect(() => {
    const stage = stageRef.current, tilt = tiltRef.current;
    if (!stage || !tilt) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0, targetX = 0, targetY = 0, curX = 0, curY = 0;
    let auto = true, t = 0;

    const loop = () => {
      if (auto) { t += 0.008; targetY = Math.sin(t) * 7; targetX = Math.cos(t * 0.7) * 3; }
      curX += (targetX - curX) * 0.06;
      curY += (targetY - curY) * 0.06;
      tilt.style.transform = `rotateX(${curX}deg) rotateY(${curY}deg)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: MouseEvent) => {
      auto = false;
      const r = stage.getBoundingClientRect();
      targetY = ((e.clientX - r.left) / r.width  - 0.5) *  22;
      targetX = ((e.clientY - r.top)  / r.height - 0.5) * -16;
    };
    const onLeave = () => { auto = true; };
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", onLeave);
    return () => { cancelAnimationFrame(raf); stage.removeEventListener("mousemove", onMove); stage.removeEventListener("mouseleave", onLeave); };
  }, []);

  return (
    <div ref={stageRef} className="relative flex items-center justify-center select-none"
         style={{ minHeight: 460, perspective: 1100 }}>
      <style>{`
        @keyframes gaLevitate { 0%,100%{ transform:translateZ(50px) translateY(0);} 50%{ transform:translateZ(50px) translateY(-16px);} }
        @keyframes gaShadow { 0%,100%{ transform:rotateX(74deg) scale(1); opacity:.5;} 50%{ transform:rotateX(74deg) scale(.8); opacity:.25;} }
        @keyframes gaMist { 0%{ transform:translateX(-8%);} 50%{ transform:translateX(8%);} 100%{ transform:translateX(-8%);} }
        @keyframes gaTwinkle { 0%,100%{ opacity:.15; transform:scale(.8);} 50%{ opacity:.9; transform:scale(1.15);} }
        @keyframes gaBreathe { 0%,100%{ opacity:.75; filter:drop-shadow(0 0 30px rgba(120,200,255,0.28));} 50%{ opacity:1; filter:drop-shadow(0 0 55px rgba(140,215,255,0.45));} }
        @media (prefers-reduced-motion: reduce){
          .ga-anim, .ga-anim * { animation: none !important; }
        }
      `}</style>

      {/* twinkling stars behind everything */}
      <div className="absolute inset-0 pointer-events-none ga-anim" aria-hidden="true">
        {STARS.map(([x, y, s, d], i) => (
          <span key={i} className="absolute rounded-full"
                style={{ left: `${x}%`, top: `${y}%`, width: s, height: s,
                         background: "#cfeeff", boxShadow: "0 0 6px rgba(160,225,255,0.9)",
                         animation: `gaTwinkle ${3 + (i % 3)}s ease-in-out ${d}s infinite` }} />
        ))}
      </div>

      <div ref={tiltRef} className="ga-anim relative" style={{ transformStyle: "preserve-3d", willChange: "transform" }}>

        {/* calm night aurora behind the apparition */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateZ(-120px)" }}>
          <div style={{ width: 480, height: 480, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(0,180,255,0.18) 0%, rgba(80,60,220,0.12) 45%, transparent 70%)",
                        filter: "blur(46px)" }} />
        </div>

        {/* THE GUARDIAN CAPTAIN — cinematic art, edges dissolved into the night */}
        <div className="relative" style={{ animation: "gaLevitate 4.6s ease-in-out infinite", transformStyle: "preserve-3d" }}>
          <div className="relative ga-anim" style={{ width: "min(430px, 90vw)", aspectRatio: "720 / 983", animation: "gaBreathe 5.5s ease-in-out infinite",
                                                     maskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
                                                     WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)" }}>
            <Image src="/ghost-captain.webp" alt="The Ghost Aviator — guardian captain with wings and halo" fill priority sizes="430px"
                   className="object-cover"
                   style={{
                     maskImage: "radial-gradient(ellipse 80% 66% at 50% 47%, black 55%, transparent 92%)",
                     WebkitMaskImage: "radial-gradient(ellipse 80% 66% at 50% 47%, black 55%, transparent 92%)",
                   }} />
          </div>
        </div>

        {/* soft breathing shadow beneath */}
        <div className="absolute left-1/2 pointer-events-none" style={{ bottom: -26, transform: "translateX(-50%)", width: 300, height: 100 }}>
          <div className="absolute inset-0" style={{ borderRadius: "50%",
               background: "radial-gradient(ellipse, rgba(0,180,255,0.30) 0%, transparent 65%)",
               animation: "gaShadow 4.6s ease-in-out infinite" }} />
        </div>

        {/* drifting night mist */}
        <div className="absolute pointer-events-none" style={{ left: -60, right: -60, bottom: -20, height: 120,
             background: "linear-gradient(to top, rgba(0,170,255,0.10), transparent)", filter: "blur(22px)",
             animation: "gaMist 11s ease-in-out infinite" }} />
      </div>
    </div>
  );
}
