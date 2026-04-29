export default function SkullPilot({ size = 500 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, animation: "floatSkull 4s ease-in-out infinite", filter: "drop-shadow(0 0 40px rgba(255,0,0,0.4))" }}>
      <style>{`
        @keyframes floatSkull {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%      { transform: translateY(-18px) rotate(1deg); }
        }
        @keyframes eyePulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.4; }
        }
        @keyframes eyeRing {
          0%   { r:52; opacity:0.6; }
          100% { r:70; opacity:0; }
        }
        @keyframes smokeDrift {
          0%   { transform:translateY(0) scaleX(1);   opacity:0.5; }
          100% { transform:translateY(-60px) scaleX(1.6); opacity:0; }
        }
        .eye-ring { animation: eyeRing 1.8s ease-out infinite; }
        .eye-ring-2 { animation: eyeRing 1.8s ease-out infinite 0.9s; }
        .eye-pulse { animation: eyePulse 1.8s ease-in-out infinite; }
        .smoke1 { animation: smokeDrift 3s ease-out infinite; }
        .smoke2 { animation: smokeDrift 3s ease-out infinite 1s; }
        .smoke3 { animation: smokeDrift 3s ease-out infinite 2s; }
      `}</style>
      <svg viewBox="0 0 500 560" fill="none" xmlns="http://www.w3.org/2000/svg" width={size} height={size}>
        <defs>
          <radialGradient id="boneGrad" cx="38%" cy="32%" r="60%">
            <stop offset="0%"   stopColor="#eae6d8"/>
            <stop offset="55%"  stopColor="#c8c2b0"/>
            <stop offset="100%" stopColor="#7a7060"/>
          </radialGradient>
          <radialGradient id="jawGrad" cx="50%" cy="30%" r="70%">
            <stop offset="0%"   stopColor="#d4cfc0"/>
            <stop offset="100%" stopColor="#7a7060"/>
          </radialGradient>
          <radialGradient id="eyeGrad" cx="35%" cy="30%" r="65%">
            <stop offset="0%"   stopColor="#ff6666"/>
            <stop offset="40%"  stopColor="#ff0000"/>
            <stop offset="100%" stopColor="#6b0000"/>
          </radialGradient>
          <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#ff0000" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#ff0000" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#ff0000" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="#ff0000" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="wingL" x1="100%" y1="50%" x2="0%" y2="50%">
            <stop offset="0%"   stopColor="#00d4ff" stopOpacity="0.9"/>
            <stop offset="40%"  stopColor="#c8a020" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#c8a020" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="wingR" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%"   stopColor="#00d4ff" stopOpacity="0.9"/>
            <stop offset="40%"  stopColor="#c8a020" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#c8a020" stopOpacity="0"/>
          </linearGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="8" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="redBloom">
            <feGaussianBlur stdDeviation="16" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="skullGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#00d4ff" floodOpacity="0.25"/>
          </filter>
          <clipPath id="teethClip">
            <rect x="190" y="340" width="120" height="40"/>
          </clipPath>
        </defs>

        {/* Background red halo */}
        <ellipse cx="250" cy="270" rx="200" ry="200" fill="url(#bgGlow)"/>

        {/* ── LEFT WING ── */}
        <g opacity="0.85">
          <path d="M145 285 C110 265 55 255 10 235 C40 215 85 225 120 248 C90 235 55 245 90 272 C58 262 25 275 62 300 C30 295 5 308 45 328 L145 298 Z" fill="url(#wingL)"/>
          {/* Wing feather lines */}
          <path d="M145 290 C100 270 50 258 15 240" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.4" fill="none"/>
          <path d="M145 298 C95 278 48 265 18 250" stroke="#00d4ff" strokeWidth="0.6" strokeOpacity="0.3" fill="none"/>
          <path d="M140 306 C90 290 45 275 20 260" stroke="#c8a020" strokeWidth="0.6" strokeOpacity="0.25" fill="none"/>
        </g>

        {/* ── RIGHT WING ── */}
        <g opacity="0.85" transform="translate(500,0) scale(-1,1)">
          <path d="M145 285 C110 265 55 255 10 235 C40 215 85 225 120 248 C90 235 55 245 90 272 C58 262 25 275 62 300 C30 295 5 308 45 328 L145 298 Z" fill="url(#wingR)"/>
          <path d="M145 290 C100 270 50 258 15 240" stroke="#00d4ff" strokeWidth="0.8" strokeOpacity="0.4" fill="none"/>
          <path d="M145 298 C95 278 48 265 18 250" stroke="#00d4ff" strokeWidth="0.6" strokeOpacity="0.3" fill="none"/>
          <path d="M140 306 C90 290 45 275 20 260" stroke="#c8a020" strokeWidth="0.6" strokeOpacity="0.25" fill="none"/>
        </g>

        {/* ── PILOT CAP ── */}
        {/* Cap top */}
        <path d="M118 210 C112 140 140 80 250 72 C360 80 388 140 382 210 Z" fill="#12122a"/>
        {/* Cap top flat panel */}
        <ellipse cx="250" cy="90" rx="90" ry="28" fill="#0a0a1e"/>
        {/* Cap brim */}
        <path d="M95 205 C95 200 405 200 405 205 C408 220 390 232 250 232 C110 232 92 220 95 205 Z" fill="#080818"/>
        {/* Cap seam */}
        <path d="M145 200 C145 140 355 140 355 200" stroke="#1a1a3a" strokeWidth="2" fill="none"/>
        {/* Center emblem on cap */}
        <circle cx="250" cy="148" r="22" fill="#0a0a1e" stroke="#00d4ff" strokeWidth="1.5"/>
        <circle cx="250" cy="148" r="17" fill="none" stroke="#00d4ff" strokeWidth="0.5" strokeOpacity="0.5"/>
        <text x="250" y="154" textAnchor="middle" fill="#00d4ff" fontSize="18" fontWeight="bold">✈</text>
        {/* Cap chin strap */}
        <path d="M148 218 C150 245 158 262 168 272" stroke="#1e1e3a" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M352 218 C350 245 342 262 332 272" stroke="#1e1e3a" strokeWidth="5" fill="none" strokeLinecap="round"/>

        {/* ── MAIN SKULL HEAD ── */}
        <ellipse cx="250" cy="210" rx="148" ry="148" fill="url(#boneGrad)" filter="url(#skullGlow)"/>

        {/* Skull depth/shadow on sides */}
        <ellipse cx="122" cy="190" rx="22" ry="38" fill="#6a6050" opacity="0.5"/>
        <ellipse cx="378" cy="190" rx="22" ry="38" fill="#6a6050" opacity="0.5"/>

        {/* Cheekbones */}
        <ellipse cx="152" cy="278" rx="40" ry="22" fill="#c4bfaf"/>
        <ellipse cx="348" cy="278" rx="40" ry="22" fill="#c4bfaf"/>

        {/* Subtle skull texture cracks */}
        <path d="M222 105 C226 128 224 148 220 165" stroke="#a09882" strokeWidth="1.5" fill="none" opacity="0.45"/>
        <path d="M278 100 C275 122 280 142 283 158" stroke="#a09882" strokeWidth="1"   fill="none" opacity="0.35"/>
        <path d="M330 148 C318 162 314 175 318 188" stroke="#a09882" strokeWidth="1"   fill="none" opacity="0.3"/>
        <path d="M175 130 C182 148 186 162 183 178" stroke="#a09882" strokeWidth="1"   fill="none" opacity="0.3"/>

        {/* ── GOGGLES ── */}
        {/* Goggle frame band */}
        <rect x="145" y="205" width="210" height="100" rx="50" fill="#111128" stroke="#222244" strokeWidth="3"/>

        {/* Left goggle */}
        <circle cx="195" cy="254" r="54" fill="#080818" stroke="#2a2a50" strokeWidth="7"/>
        <circle cx="195" cy="254" r="48" fill="#080818" stroke="#3a3a60" strokeWidth="1.5"/>
        {/* Left eye glow layers */}
        <circle cx="195" cy="254" r="44" fill="url(#eyeGrad)" filter="url(#redBloom)" className="eye-pulse"/>
        <circle cx="195" cy="254" r="22" fill="#0a0000"/>
        <circle cx="195" cy="254" r="14" fill="#ff1a1a" opacity="0.9"/>
        <circle cx="183" cy="243" r="6"  fill="#ff8888" opacity="0.55"/>
        {/* Animated rings */}
        <circle cx="195" cy="254" r="48" fill="none" stroke="#ff0000" strokeWidth="1.5" opacity="0" className="eye-ring"/>
        <circle cx="195" cy="254" r="48" fill="none" stroke="#ff0000" strokeWidth="1"   opacity="0" className="eye-ring-2"/>

        {/* Right goggle */}
        <circle cx="305" cy="254" r="54" fill="#080818" stroke="#2a2a50" strokeWidth="7"/>
        <circle cx="305" cy="254" r="48" fill="#080818" stroke="#3a3a60" strokeWidth="1.5"/>
        <circle cx="305" cy="254" r="44" fill="url(#eyeGrad)" filter="url(#redBloom)" className="eye-pulse"/>
        <circle cx="305" cy="254" r="22" fill="#0a0000"/>
        <circle cx="305" cy="254" r="14" fill="#ff1a1a" opacity="0.9"/>
        <circle cx="293" cy="243" r="6"  fill="#ff8888" opacity="0.55"/>
        <circle cx="305" cy="254" r="48" fill="none" stroke="#ff0000" strokeWidth="1.5" opacity="0" className="eye-ring"/>
        <circle cx="305" cy="254" r="48" fill="none" stroke="#ff0000" strokeWidth="1"   opacity="0" className="eye-ring-2"/>

        {/* Nose bridge of goggles */}
        <path d="M249 245 C249 238 251 238 251 245 L251 263 C251 270 249 270 249 263 Z" fill="#1e1e3e"/>

        {/* Goggle straps */}
        <path d="M141 228 C105 228 100 252 104 272" stroke="#111128" strokeWidth="10" fill="none" strokeLinecap="round"/>
        <path d="M359 228 C395 228 400 252 396 272" stroke="#111128" strokeWidth="10" fill="none" strokeLinecap="round"/>

        {/* ── LOWER JAW / TEETH ── */}
        {/* Jaw bone */}
        <path d="M175 305 C168 330 168 355 178 375 C200 408 250 418 250 418 C250 418 300 408 322 375 C332 355 332 330 325 305 Z" fill="url(#jawGrad)"/>

        {/* Jaw line definition */}
        <path d="M175 305 C168 340 172 370 185 388" stroke="#8a8070" strokeWidth="2" fill="none" opacity="0.5"/>
        <path d="M325 305 C332 340 328 370 315 388" stroke="#8a8070" strokeWidth="2" fill="none" opacity="0.5"/>

        {/* Nasal cavity */}
        <path d="M250 258 C238 270 225 288 230 302 C234 313 248 318 252 318 C256 318 266 313 270 302 C275 288 262 270 250 258 Z" fill="#100d08" opacity="0.92"/>
        {/* Nasal septum */}
        <path d="M250 270 L250 305" stroke="#1a1710" strokeWidth="3" fill="none" opacity="0.6"/>

        {/* Teeth gap line */}
        <rect x="195" y="338" width="110" height="3" rx="1.5" fill="#5a5448"/>

        {/* Teeth */}
        <rect x="197" y="341" width="16" height="22" rx="3" fill="#e8e3d2"/>
        <rect x="215" y="341" width="16" height="25" rx="3" fill="#eae5d4"/>
        <rect x="233" y="341" width="16" height="27" rx="3" fill="#eae5d4"/>
        <rect x="251" y="341" width="16" height="27" rx="3" fill="#eae5d4"/>
        <rect x="269" y="341" width="16" height="25" rx="3" fill="#eae5d4"/>
        <rect x="287" y="341" width="16" height="22" rx="3" fill="#e8e3d2"/>

        {/* Tooth gaps */}
        <rect x="213" y="341" width="2" height="25" rx="1" fill="#5a5448" opacity="0.6"/>
        <rect x="231" y="341" width="2" height="27" rx="1" fill="#5a5448" opacity="0.6"/>
        <rect x="249" y="341" width="2" height="27" rx="1" fill="#5a5448" opacity="0.6"/>
        <rect x="267" y="341" width="2" height="25" rx="1" fill="#5a5448" opacity="0.6"/>
        <rect x="285" y="341" width="2" height="22" rx="1" fill="#5a5448" opacity="0.6"/>

        {/* ── GHOST SMOKE WISPS ── */}
        <g opacity="0.35" className="smoke1">
          <ellipse cx="215" cy="430" rx="15" ry="8" fill="#8888ff"/>
          <ellipse cx="218" cy="445" rx="10" ry="6" fill="#8888ff"/>
          <ellipse cx="212" cy="458" rx="7"  ry="5" fill="#8888ff"/>
        </g>
        <g opacity="0.28" className="smoke2">
          <ellipse cx="250" cy="435" rx="12" ry="7" fill="#aaaaff"/>
          <ellipse cx="253" cy="450" rx="8"  ry="5" fill="#aaaaff"/>
          <ellipse cx="248" cy="462" rx="5"  ry="4" fill="#aaaaff"/>
        </g>
        <g opacity="0.25" className="smoke3">
          <ellipse cx="282" cy="428" rx="13" ry="7" fill="#8888ff"/>
          <ellipse cx="280" cy="443" rx="9"  ry="5" fill="#8888ff"/>
          <ellipse cx="284" cy="455" rx="6"  ry="4" fill="#8888ff"/>
        </g>

        {/* Red eye light cast on cheeks */}
        <ellipse cx="168" cy="275" rx="30" ry="18" fill="#ff0000" opacity="0.06"/>
        <ellipse cx="332" cy="275" rx="30" ry="18" fill="#ff0000" opacity="0.06"/>
      </svg>
    </div>
  );
}
