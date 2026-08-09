"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import GhostMark from "@/app/components/GhostMark";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import { useUser, getSupabase } from "@/lib/supabase";

// Derived once — dropdowns always reflect the real subject list.
const CPL_LINKS  = CPL_SUBJECTS.map(s => [s.name, s.id] as const);
const ATPL_LINKS = ATPL_SUBJECTS.map(s => [s.name, s.id] as const);

export default function Navbar() {
  const [open, setOpen]   = useState(false);
  const [drop, setDrop]   = useState<string | null>(null);
  const { user } = useUser();
  const displayName =
    (user?.user_metadata?.name as string | undefined)?.split(" ")[0] ||
    user?.email?.split("@")[0] || "";
  const signOut = () => { void getSupabase()?.auth.signOut(); };

  return (
    <nav style={{ background:"rgba(11,17,23,0.97)", borderBottom:"1px solid rgba(243,200,137,0.15)", backdropFilter:"blur(12px)" }}
         className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span style={{ filter:"drop-shadow(0 0 8px rgba(240,145,58,0.45))" }}><GhostMark size={40} /></span>
            <div>
              <div className="text-lg font-black leading-none"
                   style={{ background:"linear-gradient(135deg,#7ad9ff,#f3c889)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                Ghost Aviator
              </div>
              <div className="text-xs leading-none" style={{ color:"rgba(243,200,137,0.55)" }}>Capt. Pankaj Pahil</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">

            {/* CPL dropdown */}
            <div className="relative" onMouseEnter={() => setDrop("cpl")} onMouseLeave={() => setDrop(null)}>
              <Link href="/cpl" className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold no-underline transition-colors"
                    style={{ color: drop==="cpl" ? "#f3c889" : "#94a3b8" }}>
                CPL <ChevronDown className="w-3 h-3"/>
              </Link>
              {drop === "cpl" && (
                <div className="absolute top-full left-0 mt-1 w-64 rounded-xl overflow-hidden z-50"
                     style={{ background:"rgba(17,24,32,0.98)", border:"1px solid rgba(171,121,77,0.35)", boxShadow:"0 20px 40px rgba(0,0,0,0.5)" }}>
                  {CPL_LINKS.map(([label, slug], i, arr) => (
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
                    style={{ color: drop==="atpl" ? "#f0913a" : "#94a3b8" }}>
                ATPL <ChevronDown className="w-3 h-3"/>
              </Link>
              {drop === "atpl" && (
                <div className="absolute top-full left-0 mt-1 w-64 rounded-xl overflow-hidden z-50"
                     style={{ background:"rgba(17,24,32,0.98)", border:"1px solid rgba(240,145,58,0.3)", boxShadow:"0 20px 40px rgba(0,0,0,0.5)" }}>
                  {ATPL_LINKS.map(([label, slug], i, arr) => (
                    <Link key={slug} href={`/atpl/${slug}`} className="block px-4 py-2.5 text-sm no-underline hover:bg-blue-900/20 transition-colors"
                          style={{ color:"#94a3b8", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}>
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/live-classes" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-black no-underline" style={{ color:"#ff5a5a" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background:"#ff3030", boxShadow:"0 0 8px rgba(255,48,48,0.8)" }}/> Live Classes
            </Link>
            <Link href="/books"     className="px-3 py-2 rounded-lg text-sm font-bold no-underline" style={{ color:"#fbbf24" }}>Books</Link>
            <Link href="/about"     className="px-3 py-2 rounded-lg text-sm font-bold no-underline" style={{ color:"#f3c889" }}>The Captain</Link>
            <Link href="/rtr-simulator" className="px-3 py-2 rounded-lg text-sm font-black no-underline" style={{ color:"#f0913a" }}>Radio Simulator</Link>
            <Link href="/adapt-test" className="px-3 py-2 rounded-lg text-sm font-black no-underline" style={{ color:"#f0913a" }}>ADAPT Test</Link>
          </div>

          {/* CTA / account */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm font-bold px-3 py-1.5 rounded-lg"
                      style={{ color:"#f3c889", border:"1px solid rgba(243,200,137,0.35)", background:"rgba(243,200,137,0.08)" }}
                      title="Signed in — progress syncs across your devices">
                  ✈ {displayName}
                </span>
                <button onClick={signOut} className="text-sm font-medium cursor-pointer bg-transparent border-0" style={{ color:"#64748b" }}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login"  className="text-sm font-medium no-underline" style={{ color:"#64748b" }}>Log In</Link>
                <Link href="/signup" className="text-sm font-black px-4 py-2 rounded-lg no-underline"
                      style={{ background:"linear-gradient(135deg,#c25a1e,#c25a1e)", color:"#fff" }}>
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" style={{ color:"#f3c889" }} onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
          </button>
        </div>
      </div>

      {/* Second row — the study tools.
          The top row carries the destinations a visitor chooses between (CPL,
          ATPL, classes, the two simulators) and the account CTA; this row
          carries the tools they use once they are studying. Splitting them is
          what stopped the single bar overflowing: at 1280px it was 1391px of
          links in a 1274px bar, which silently clipped Cost Calculator, Log In
          and "Get Started Free" — the signup CTA — right off the edge.
          Desktop only: the mobile menu already lists every link. */}
      <div className="hidden md:block" style={{ borderTop:"1px solid rgba(243,200,137,0.08)", background:"rgba(255,255,255,0.015)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 h-11">
            <Link href="/exam" className="px-3 py-1.5 rounded-lg text-sm font-bold no-underline transition-colors hover:text-white" style={{ color:"#94a3b8" }}>Exam Mode</Link>
            <Link href="/past-papers" className="px-3 py-1.5 rounded-lg text-sm font-bold no-underline transition-colors hover:text-white" style={{ color:"#94a3b8" }}>Past Papers</Link>
            <Link href="/question-bank" className="px-3 py-1.5 rounded-lg text-sm font-bold no-underline transition-colors hover:text-white" style={{ color:"#94a3b8" }}>Question Bank</Link>
            <Link href="/notes" className="px-3 py-1.5 rounded-lg text-sm font-bold no-underline transition-colors hover:text-white" style={{ color:"#94a3b8" }}>Notes</Link>
            <Link href="/guides" className="px-3 py-1.5 rounded-lg text-sm font-bold no-underline transition-colors hover:text-white" style={{ color:"#94a3b8" }}>Guides</Link>
            <Link href="/resources" className="px-3 py-1.5 rounded-lg text-sm font-bold no-underline transition-colors hover:text-white" style={{ color:"#94a3b8" }}>Resources</Link>
            <Link href="/dashboard" className="px-3 py-1.5 rounded-lg text-sm font-bold no-underline transition-colors hover:text-white" style={{ color:"#94a3b8" }}>Dashboard</Link>
            <Link href="/cpl-cost-calculator" className="px-3 py-1.5 rounded-lg text-sm font-bold no-underline transition-colors hover:text-white" style={{ color:"#38bdf8" }}>Cost Calculator</Link>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-5 flex flex-col gap-1" style={{ borderTop:"1px solid rgba(243,200,137,0.12)" }}>
          <Link href="/cpl"           onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#f3c889" }}>✈ CPL Prep</Link>
          <Link href="/atpl"          onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#f0913a" }}>✈ ATPL Prep</Link>
          <Link href="/live-classes"  onClick={() => setOpen(false)} className="py-2.5 text-sm font-black no-underline" style={{ color:"#ff5a5a" }}>🔴 Live Classes</Link>
          <Link href="/books"         onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#fbbf24" }}>📚 Books</Link>
          <Link href="/about"         onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#f3c889" }}>👨‍✈️ The Captain</Link>
          <Link href="/rtr-simulator" onClick={() => setOpen(false)} className="py-2.5 text-sm font-black no-underline" style={{ color:"#f0913a" }}>📻 Radio Simulator</Link>
          <Link href="/adapt-test"    onClick={() => setOpen(false)} className="py-2.5 text-sm font-black no-underline" style={{ color:"#f0913a" }}>🧭 ADAPT Test</Link>
          <Link href="/exam"          onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#94a3b8" }}>Exam Mode</Link>
          <Link href="/past-papers"   onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#94a3b8" }}>Past Papers</Link>
          <Link href="/dashboard"     onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#94a3b8" }}>Dashboard</Link>
          <Link href="/notes"         onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#94a3b8" }}>Notes</Link>
          <Link href="/question-bank" onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#94a3b8" }}>Question Bank</Link>
          <Link href="/resources"     onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#94a3b8" }}>Resources</Link>
          <Link href="/guides"        onClick={() => setOpen(false)} className="py-2.5 text-sm font-bold no-underline" style={{ color:"#94a3b8" }}>Guides</Link>
          {user ? (
            <button onClick={() => { signOut(); setOpen(false); }}
                    className="mt-2 py-3 px-4 rounded-xl text-sm font-black text-center cursor-pointer border-0"
                    style={{ background:"rgba(243,200,137,0.12)", color:"#f3c889", border:"1px solid rgba(243,200,137,0.35)" }}>
              ✈ {displayName} — Sign Out
            </button>
          ) : (
            <Link href="/signup" onClick={() => setOpen(false)}
                  className="mt-2 py-3 px-4 rounded-xl text-sm font-black text-center no-underline"
                  style={{ background:"linear-gradient(135deg,#c25a1e,#c25a1e)", color:"#fff" }}>
              Get Started Free
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
