"use client";
import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// HeroGhost — the home-page centrepiece.
// The Guardian Captain: a calm, translucent ghost aviator drawn entirely in
// SVG — peaked cap, gentle face, four gold captain stripes, saluting — who
// levitates inside a mouse-tilted 3D stage under a golden halo, spectral
// wings flapping slowly, stars twinkling behind. No canvas, no heavy PNG:
// crisp at any size and light enough for budget phones.
// Honours prefers-reduced-motion.
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
        @keyframes gaWingL { 0%,100%{ transform:rotate(-4deg) scaleY(1);} 50%{ transform:rotate(-13deg) scaleY(1.06);} }
        @keyframes gaWingR { 0%,100%{ transform:rotate(4deg)  scaleY(1);} 50%{ transform:rotate(13deg)  scaleY(1.06);} }
        @keyframes gaLevitate { 0%,100%{ transform:translateZ(50px) translateY(0);} 50%{ transform:translateZ(50px) translateY(-18px);} }
        @keyframes gaHalo { 0%,100%{ opacity:.8; filter:drop-shadow(0 0 12px rgba(255,220,120,.7));} 50%{ opacity:1; filter:drop-shadow(0 0 24px rgba(255,230,150,.95));} }
        @keyframes gaShadow { 0%,100%{ transform:rotateX(74deg) scale(1); opacity:.5;} 50%{ transform:rotateX(74deg) scale(.8); opacity:.25;} }
        @keyframes gaMist { 0%{ transform:translateX(-8%);} 50%{ transform:translateX(8%);} 100%{ transform:translateX(-8%);} }
        @keyframes gaBlink { 0%, 91%, 100% { transform: scaleY(1); } 94%, 96% { transform: scaleY(0.08); } }
        @keyframes gaTwinkle { 0%,100%{ opacity:.15; transform:scale(.8);} 50%{ opacity:.9; transform:scale(1.15);} }
        @keyframes gaTail { 0%,100%{ transform:translateY(0) scaleX(1);} 50%{ transform:translateY(6px) scaleX(1.03);} }
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

        {/* calm night aurora */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transform: "translateZ(-120px)" }}>
          <div style={{ width: 480, height: 480, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(0,180,255,0.20) 0%, rgba(80,60,220,0.14) 45%, transparent 70%)",
                        filter: "blur(46px)" }} />
        </div>

        {/* spectral angel wings — pure moonlight, no menace */}
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none" style={{ transform: "translateZ(-60px)", top: 30 }}>
          <svg width="560" height="380" viewBox="0 0 560 380" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="gaWing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor="#e8fbff" stopOpacity="0.95" />
                <stop offset="55%" stopColor="#7ad9ff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#00d4ff" stopOpacity="0.08" />
              </linearGradient>
              <filter id="gaGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="7" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <g filter="url(#gaGlow)" style={{ transformOrigin: "275px 95px", animation: "gaWingL 5.2s ease-in-out infinite" }}>
              <path d="M272 95 C 200 18, 92 8, 18 66 C 92 70, 128 88, 152 106 C 110 104, 64 116, 30 146 C 96 140, 140 148, 168 164 C 136 170, 104 188, 86 216 C 142 198, 186 196, 214 204 C 240 178, 258 138, 272 95 Z" fill="url(#gaWing)" opacity="0.85" />
              <path d="M268 110 C 216 70, 150 58, 96 80 C 150 88, 186 104, 208 124 C 230 116, 250 114, 268 110 Z" fill="#eefaff" opacity="0.3" />
            </g>
            <g filter="url(#gaGlow)" style={{ transformOrigin: "285px 95px", animation: "gaWingR 5.2s ease-in-out infinite" }}>
              <path d="M288 95 C 360 18, 468 8, 542 66 C 468 70, 432 88, 408 106 C 450 104, 496 116, 530 146 C 464 140, 420 148, 392 164 C 424 170, 456 188, 474 216 C 418 198, 374 196, 346 204 C 320 178, 302 138, 288 95 Z" fill="url(#gaWing)" opacity="0.85" />
              <path d="M292 110 C 344 70, 410 58, 464 80 C 410 88, 374 104, 352 124 C 330 116, 310 114, 292 110 Z" fill="#eefaff" opacity="0.3" />
            </g>
          </svg>
        </div>

        {/* halo — steady, warm, earned */}
        <div className="absolute left-1/2 pointer-events-none" style={{ top: 18, transform: "translateX(-50%) translateZ(20px)" }}>
          <div style={{ width: 140, height: 32, borderRadius: "50%", border: "4px solid rgba(255,225,130,0.9)",
                        boxShadow: "0 0 20px rgba(255,210,100,0.7), inset 0 0 12px rgba(255,210,100,0.55)",
                        transform: "rotateX(62deg)", animation: "gaHalo 5s ease-in-out infinite" }} />
        </div>

        {/* THE GUARDIAN CAPTAIN — levitating, saluting */}
        <div className="relative" style={{ animation: "gaLevitate 4.2s ease-in-out infinite", transformStyle: "preserve-3d" }}>
          <svg viewBox="0 0 400 500"
               role="img" aria-label="The Ghost Aviator — a friendly guardian captain"
               style={{ width: "min(360px, 82vw)", height: "auto",
                        filter: "drop-shadow(0 0 40px rgba(0,212,255,0.35))", display: "block" }}>
            <defs>
              <radialGradient id="gaBody" cx="50%" cy="18%" r="85%">
                <stop offset="0%"  stopColor="#f4ffff" />
                <stop offset="45%" stopColor="#c9f2ff" />
                <stop offset="78%" stopColor="rgba(140,225,255,0.35)" />
                <stop offset="100%" stopColor="rgba(0,212,255,0.03)" />
              </radialGradient>
              <linearGradient id="gaCap" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1d3a63" />
                <stop offset="100%" stopColor="#0d1f3c" />
              </linearGradient>
              <filter id="gaSoft" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* body / robe with ghost-tail scallops */}
            <g style={{ animation: "gaTail 4.2s ease-in-out infinite", transformOrigin: "200px 300px" }}>
              <path d="M148 210
                       C 136 265, 134 335, 141 398
                       Q 152 428, 166 404
                       Q 178 432, 194 406
                       Q 208 433, 224 406
                       Q 238 430, 251 402
                       C 262 335, 262 265, 252 210
                       Q 200 192, 148 210 Z"
                    fill="url(#gaBody)" opacity="0.96" filter="url(#gaSoft)" />
            </g>

            {/* uniform hints — collar, tie, buttons */}
            <path d="M184 214 L200 232 L216 214" fill="none" stroke="rgba(13,45,80,0.35)" strokeWidth="3" strokeLinecap="round" />
            <path d="M200 232 L193 246 L200 268 L207 246 Z" fill="rgba(16,58,96,0.5)" />
            <g fill="#ffd97a" opacity="0.9">
              <circle cx="186" cy="262" r="2.6" /><circle cx="186" cy="284" r="2.6" /><circle cx="186" cy="306" r="2.6" />
              <circle cx="214" cy="262" r="2.6" /><circle cx="214" cy="284" r="2.6" /><circle cx="214" cy="306" r="2.6" />
            </g>

            {/* epaulettes — four captain stripes each */}
            <g opacity="0.95">
              <rect x="146" y="206" width="30" height="11" rx="4" fill="#10253f" />
              {[0, 1, 2, 3].map(i => <rect key={`l${i}`} x={149 + i * 7} y="208" width="3.4" height="7" rx="1" fill="#ffd97a" />)}
              <rect x="224" y="206" width="30" height="11" rx="4" fill="#10253f" />
              {[0, 1, 2, 3].map(i => <rect key={`r${i}`} x={227 + i * 7} y="208" width="3.4" height="7" rx="1" fill="#ffd97a" />)}
            </g>

            {/* left arm — relaxed at his side */}
            <path d="M150 226 C 130 258, 128 296, 142 322" fill="none"
                  stroke="rgba(210,242,255,0.85)" strokeWidth="17" strokeLinecap="round" filter="url(#gaSoft)" />

            {/* right arm — crisp salute to the cap */}
            <path d="M250 228 C 282 214, 278 168, 254 140" fill="none"
                  stroke="rgba(215,244,255,0.9)" strokeWidth="17" strokeLinecap="round" filter="url(#gaSoft)" />
            <circle cx="252" cy="136" r="11" fill="#e9fbff" opacity="0.95" filter="url(#gaSoft)" />

            {/* head */}
            <circle cx="200" cy="164" r="50" fill="url(#gaBody)" filter="url(#gaSoft)" />

            {/* gentle eyes (they blink) + smile */}
            <g style={{ animation: "gaBlink 6s ease-in-out infinite", transformOrigin: "200px 166px" }}>
              <ellipse cx="183" cy="166" rx="6.5" ry="10.5" fill="#0d2c46" />
              <ellipse cx="217" cy="166" rx="6.5" ry="10.5" fill="#0d2c46" />
              <circle cx="185.5" cy="162" r="2.2" fill="#bdefff" />
              <circle cx="219.5" cy="162" r="2.2" fill="#bdefff" />
            </g>
            <path d="M188 192 Q 200 201, 212 192" fill="none" stroke="#0d2c46" strokeWidth="3.4" strokeLinecap="round" />

            {/* peaked captain's cap */}
            <g filter="url(#gaSoft)">
              <path d="M147 122 C 147 80, 176 60, 200 60 C 224 60, 253 80, 253 122 Q 200 138, 147 122 Z" fill="url(#gaCap)" />
              <path d="M147 122 Q 200 138, 253 122 L 253 112 Q 200 128, 147 112 Z" fill="#091629" />
              <path d="M146 120 Q 200 142, 254 120 L 262 128 Q 200 152, 138 128 Z" fill="#060f1e" />
              {/* gold braid + winged emblem */}
              <path d="M158 112 Q 200 126, 242 112" fill="none" stroke="#ffd97a" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
              <g fill="#ffd97a" opacity="0.95">
                <circle cx="200" cy="96" r="5" />
                <path d="M195 96 C 186 88, 172 86, 162 92 C 172 94, 180 98, 186 102 Z" />
                <path d="M205 96 C 214 88, 228 86, 238 92 C 228 94, 220 98, 214 102 Z" />
              </g>
            </g>
          </svg>
        </div>

        {/* soft breathing shadow beneath */}
        <div className="absolute left-1/2 pointer-events-none" style={{ bottom: -30, transform: "translateX(-50%)", width: 300, height: 100 }}>
          <div className="absolute inset-0" style={{ borderRadius: "50%",
               background: "radial-gradient(ellipse, rgba(0,180,255,0.30) 0%, transparent 65%)",
               animation: "gaShadow 4.2s ease-in-out infinite" }} />
        </div>

        {/* drifting night mist */}
        <div className="absolute pointer-events-none" style={{ left: -60, right: -60, bottom: -20, height: 120,
             background: "linear-gradient(to top, rgba(0,170,255,0.10), transparent)", filter: "blur(22px)",
             animation: "gaMist 11s ease-in-out infinite" }} />
      </div>
    </div>
  );
}
