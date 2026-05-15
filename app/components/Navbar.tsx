"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

export default function Navbar() {
  const [open, setOpen]   = useState(false);
  const [drop, setDrop]   = useState<string | null>(null);

  return (
    <nav style={{ background:"rgba(6,4,14,0.97)", borderBottom:"1px solid rgba(180,100,255,0.15)", backdropFilter:"blur(12px)" }}
         className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <Image src="/ghost-badge.png" alt="Ghost Aviator" width={44} height={44} className="object-contain rounded-lg" style={{ filter:"drop-shadow(0 0 8px rgba(180,100,255,0.5))" }}/>
            <div>
              <div className="text-lg font-black leading-none"
                   style={{ background:"linear-gradient(135deg,#ff6000,#c020ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                Ghost Aviator
              </div>
              <div className="text-xs leading-none" style={{ color:"rgba(180,100,255,0.55)" }}>Capt. Pankaj Pahil</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">

            {/* CPL dropdown */}
            <div className="relative" onMouseEnter={() => setDrop("cpl")} onMouseLeave={() => setDrop(null)}>
              <Link href="/cpl" className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold no-underline transition-colors"
                    style={{ color: drop==="cpl" ? "#c080ff" : "#94a3b8" }}>
                CPL <ChevronDown className="w-3 h-3"/>
              </Link>
              {drop === "cpl" && (
                <div className="absolute top-full left-0 mt-1 w-64 rounded-xl overflow-hidden z-50"
                     style={{ background:"rgba(15,8,30,0.98)", border:"1px solid rgba(124,58,237,0.35)", boxShadow:"0 20px 40px rgba(0,0,0,0.5)" }}>
                  {[
                    ["Air Navigation",          "air-navigation"],
                    ["Aviation Meteorology",    "meteorology"],
                    ["Air Regulations",         "air-regulations"],
                    ["Technical General",       "technical-general"],
                    ["Technical Specific",      "technical-specific"],
                    ["Technical Performance",   "technical-performance"],
                    ["Radio Telephony",         "radio-telephony"],
                  ].map(([label, slug], i, arr) => (
                    <Link key={slug} href={`/cpl/${slug}`} className="block px-4 py-2.5 text-sm no-underline hover:bg-purple-900/20 transition-colors"
                          style={{ color:"#94a3b8", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* ATPL dropdown */}
            <div className="relative" onMouseEnter={() => setDrop("atpl")} onMouseLeave={() => setDrop(null)}>
              <Link href="/atpl" className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold no-underline transition-colors"
                    style={{ color: drop==="atpl" ? "#00d4ff" : "#94a3b8" }}>
                ATPL <ChevronDown className="w-3 h-3"/>
              </Link>
              {drop === "atpl" && (
                <div className="absolute top-full left-0 mt-1 w-64 rounded-xl overflow-hidden z-50"
                     style={{ background:"rgba(15,8,30,0.98)", border:"1px solid rgba(0,180,255,0.3)", boxShadow:"0 20px 40px rgba(0,0,0,0.5)" }}>
                  {["Air Regulations (Adv)","Meteorology (Adv)","Navigation (Adv)","Technical (Adv)","Radio Aids (Adv)","Performance (Adv)","Human Performance","Flight Planning"].map((s,i) => {
                    const slugs = ["atpl-air-regulations","atpl-meteorology","atpl-navigation","atpl-technical","atpl-radio-aids","atpl-performance","human-performance","flight-planning"];
                    return (
                      <Link key={s} href={`/atpl/${slugs[i]}`} className="block px-4 py-2.5 text-sm no-underline hover:bg-blue-900/20 transition-colors"
                            style={{ color:"#94a3b8", borderBottom: i<7 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
                        {s}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link href="/mock-test" className="px-3 py-2 rounded-lg text-sm font-bold no-underline" style={{ color:"#94a3b8" }}>Mock Test</Link>
            <Link href="/notes"     className="px-3 py-2 rounded-lg text-sm font-bold no-underline" style={{ color:"#94a3b8" }}>Notes</Link>
            <Link href="/question-bank" className="px-3 py-2 rounded-lg text-sm font-bold no-underline" style={{ color:"#94a3b8" }}>Question Bank</Link>
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login"  className="text-sm font-medium no-underline" style={{ color:"#64748b" }}>Log In</Link>
            <Link href="/signup" className="text-sm font-black px-4 py-2 rounded-lg no-underline"
                  style={{ background:"linear-gradient(135deg,#9020ff,#ff2060)", color:"#fff" }}>
              Get Started Free
            </Link>
          </div>

          <button className="md:hidden" style={{ color:"#c080ff" }} onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-5 flex flex-col gap-1" style={{ borderTop:"1px solid rgba(180,100,255,0.12)" }}>
          <Link href="/cpl"           onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#c080ff" }}>✈ CPL Prep</Link>
          <Link href="/atpl"          onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#00d4ff" }}>✈ ATPL Prep</Link>
          <Link href="/mock-test"     onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#94a3b8" }}>Mock Test</Link>
          <Link href="/notes"         onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#94a3b8" }}>Notes</Link>
          <Link href="/question-bank" onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#94a3b8" }}>Question Bank</Link>
          <Link href="/signup" onClick={() => setOpen(false)}
                className="mt-2 py-3 px-4 rounded-xl text-sm font-black text-center no-underline"
                style={{ background:"linear-gradient(135deg,#9020ff,#ff2060)", color:"#fff" }}>
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  );
}
