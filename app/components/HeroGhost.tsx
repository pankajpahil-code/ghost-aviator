"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// HeroGhost — the home-page centrepiece.
// A layered 3D scene: the ghost aviator levitates inside a perspective stage
// that tilts with the visitor's mouse. Behind him: slow-flapping spectral
// wings and a flickering halo (the "angel on duty"). Below: a glowing
// summoning circle. Around: rising soul-embers on a canvas, drifting fog and
// the occasional lightning flash. Honours prefers-reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

export default function HeroGhost() {
  const stageRef  = useRef<HTMLDivElement>(null);
  const tiltRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Soul-ember particles — tiny spirits rising past the aviator.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const W = 540, H = 600;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    type P = { x: number; y: number; r: number; vy: number; vx: number; hue: number; life: number; max: number };
    const COLORS = [16, 275, 190]; // ember orange, spirit violet, ghost cyan
    const ps: P[] = [];
    const spawn = (): P => ({
      x: 90 + Math.random() * (W - 180),
      y: H - 80 + Math.random() * 60,
      r: 0.8 + Math.random() * 2.2,
      vy: 0.35 + Math.random() * 0.9,
      vx: (Math.random() - 0.5) * 0.35,
      hue: COLORS[(Math.random() * COLORS.length) | 0],
      life: 0,
      max: 240 + Math.random() * 200,
    });
    for (let i = 0; i < 42; i++) { const p = spawn(); p.y = Math.random() * H; p.life = Math.random() * p.max; ps.push(p); }

    let raf = 0;
    const draw = () => {
      if (document.hidden) { raf = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (const p of ps) {
        p.life++; p.y -= p.vy; p.x += p.vx + Math.sin((p.life + p.y) * 0.02) * 0.25;
        if (p.life > p.max || p.y < -10) Object.assign(p, spawn());
        const a = Math.sin((p.life / p.max) * Math.PI) * 0.85;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `hsla(${p.hue},100%,70%,${a})`);
        g.addColorStop(1, `hsla(${p.hue},100%,50%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={stageRef} className="relative flex items-center justify-center select-none"
         style={{ minHeight: 460, perspective: 1100 }}>
      <style>{`
        @keyframes gaWingL { 0%,100%{ transform:rotate(-4deg) scaleY(1);} 50%{ transform:rotate(-13deg) scaleY(1.06);} }
        @keyframes gaWingR { 0%,100%{ transform:rotate(4deg)  scaleY(1);} 50%{ transform:rotate(13deg)  scaleY(1.06);} }
        @keyframes gaLevitate { 0%,100%{ transform:translateZ(50px) translateY(0);} 50%{ transform:translateZ(50px) translateY(-20px);} }
        @keyframes gaHalo { 0%,100%{ opacity:.95; filter:drop-shadow(0 0 14px rgba(255,220,120,.9));} 42%{ opacity:.55;} 45%{ opacity:.95;} 47%{ opacity:.4;} 50%{ opacity:.9; filter:drop-shadow(0 0 26px rgba(255,230,150,1));} }
        @keyframes gaCircle { from{ transform:rotateX(74deg) rotate(0deg);} to{ transform:rotateX(74deg) rotate(360deg);} }
        @keyframes gaCircle2 { from{ transform:rotateX(74deg) rotate(360deg);} to{ transform:rotateX(74deg) rotate(0deg);} }
        @keyframes gaShadow { 0%,100%{ transform:rotateX(74deg) scale(1); opacity:.55;} 50%{ transform:rotateX(74deg) scale(.82); opacity:.3;} }
        @keyframes gaFlash { 0%,93%,100%{ opacity:0;} 94%{ opacity:.5;} 95%{ opacity:0;} 96.5%{ opacity:.7;} 97%{ opacity:.08;} 98%{ opacity:.35;} 99%{ opacity:0;} }
        @keyframes gaFog { 0%{ transform:translateX(-8%) translateZ(10px);} 50%{ transform:translateX(8%) translateZ(10px);} 100%{ transform:translateX(-8%) translateZ(10px);} }
        @keyframes gaEyes { 0%,100%{ opacity:.0;} 50%{ opacity:.55;} }
        @media (prefers-reduced-motion: reduce){
          .ga-anim, .ga-anim * { animation: none !important; }
        }
      `}</style>

      <div ref={tiltRef} className="ga-anim relative" style={{ transformStyle: "preserve-3d", willChange: "transform" }}>

        {/* deep nebula */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateZ(-120px)" }}>
          <div style={{ width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,60,0,0.22) 0%, rgba(150,0,255,0.18) 40%, transparent 70%)", filter: "blur(46px)", animation: "nebulaPulse 4s ease-in-out infinite" }} />
        </div>

        {/* spectral angel wings */}
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none" style={{ transform: "translateZ(-60px)", top: 30 }}>
          <svg width="560" height="380" viewBox="0 0 560 380" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="gaWing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#bfe9ff" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#7c3aed" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#ff2060" stopOpacity="0.12" />
              </linearGradient>
              <filter id="gaGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="7" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            {/* left wing — three sweeping feather tiers */}
            <g filter="url(#gaGlow)" style={{ transformOrigin: "275px 95px", animation: "gaWingL 5.2s ease-in-out infinite" }}>
              <path d="M272 95 C 200 18, 92 8, 18 66 C 92 70, 128 88, 152 106 C 110 104, 64 116, 30 146 C 96 140, 140 148, 168 164 C 136 170, 104 188, 86 216 C 142 198, 186 196, 214 204 C 240 178, 258 138, 272 95 Z" fill="url(#gaWing)" opacity="0.85" />
              <path d="M268 110 C 216 70, 150 58, 96 80 C 150 88, 186 104, 208 124 C 230 116, 250 114, 268 110 Z" fill="#dff4ff" opacity="0.25" />
            </g>
            {/* right wing — mirrored */}
            <g filter="url(#gaGlow)" style={{ transformOrigin: "285px 95px", animation: "gaWingR 5.2s ease-in-out infinite" }}>
              <path d="M288 95 C 360 18, 468 8, 542 66 C 468 70, 432 88, 408 106 C 450 104, 496 116, 530 146 C 464 140, 420 148, 392 164 C 424 170, 456 188, 474 216 C 418 198, 374 196, 346 204 C 320 178, 302 138, 288 95 Z" fill="url(#gaWing)" opacity="0.85" />
              <path d="M292 110 C 344 70, 410 58, 464 80 C 410 88, 374 104, 352 124 C 330 116, 310 114, 292 110 Z" fill="#dff4ff" opacity="0.25" />
            </g>
          </svg>
        </div>

        {/* halo — the angel credential, flickering like faulty neon */}
        <div className="absolute left-1/2 pointer-events-none" style={{ top: -6, transform: "translateX(-50%) translateZ(20px)" }}>
          <div style={{ width: 150, height: 34, borderRadius: "50%", border: "4px solid rgba(255,225,130,0.95)", boxShadow: "0 0 22px rgba(255,210,100,0.8), inset 0 0 14px rgba(255,210,100,0.6)", transform: "rotateX(62deg)", animation: "gaHalo 6s linear infinite" }} />
        </div>

        {/* the aviator — levitating apparition. The source art is a full poster,
            so we zoom onto the figure and dissolve the edges with a feathered
            elliptical mask: no rectangle, he materialises out of the nebula. */}
        <div className="relative" style={{ animation: "gaLevitate 4.2s ease-in-out infinite", transformStyle: "preserve-3d" }}>
          <div className="relative overflow-hidden" style={{ width: "min(400px, 88vw)", height: "min(470px, 103vw)" }}>
            <Image src="/ghost-mascot.png" alt="Ghost Aviator — Capt. Pankaj Pahil" fill priority sizes="400px"
                   className="object-cover"
                   style={{
                     transform: "scale(2.05) translateY(9%)",
                     objectPosition: "50% 14%",
                     maskImage: "radial-gradient(ellipse 36% 40% at 50% 42%, black 48%, transparent 70%)",
                     WebkitMaskImage: "radial-gradient(ellipse 36% 40% at 50% 42%, black 48%, transparent 70%)",
                     filter: "drop-shadow(0 0 45px rgba(255,0,80,0.65)) saturate(1.15)",
                   }} />
            {/* deadly gaze — a red pulse washing over the face */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: "radial-gradient(ellipse 26% 14% at 50% 26%, rgba(255,30,30,0.55) 0%, transparent 70%)", mixBlendMode: "screen", animation: "gaEyes 3.4s ease-in-out infinite" }} />
          </div>
        </div>

        {/* summoning circle + grounded shadow */}
        <div className="absolute left-1/2 pointer-events-none" style={{ bottom: -34, transform: "translateX(-50%)", width: 340, height: 110 }}>
          <div className="absolute inset-0" style={{ borderRadius: "50%", background: "radial-gradient(ellipse, rgba(120,0,200,0.5) 0%, transparent 65%)", animation: "gaShadow 4.2s ease-in-out infinite" }} />
          <div className="absolute inset-0" style={{ borderRadius: "50%", border: "2px dashed rgba(0,212,255,0.55)", animation: "gaCircle 14s linear infinite", boxShadow: "0 0 18px rgba(0,212,255,0.35)" }} />
          <div className="absolute" style={{ inset: 18, borderRadius: "50%", border: "1px solid rgba(255,60,120,0.5)", animation: "gaCircle2 9s linear infinite", boxShadow: "0 0 12px rgba(255,32,96,0.4)" }} />
        </div>

        {/* drifting fog */}
        <div className="absolute pointer-events-none" style={{ left: -60, right: -60, bottom: -20, height: 130, background: "linear-gradient(to top, rgba(140,80,255,0.16), transparent)", filter: "blur(22px)", animation: "gaFog 11s ease-in-out infinite" }} />

        {/* soul embers */}
        <canvas ref={canvasRef} className="absolute pointer-events-none" style={{ width: 540, height: 600, left: "50%", top: "50%", transform: "translate(-50%,-54%) translateZ(70px)" }} aria-hidden="true" />
      </div>

      {/* lightning flash washing the whole stage */}
      <div className="absolute inset-0 pointer-events-none ga-anim" style={{ background: "radial-gradient(circle at 60% 20%, rgba(200,180,255,0.55), transparent 60%)", animation: "gaFlash 9s linear infinite", mixBlendMode: "screen" }} />
    </div>
  );
}
