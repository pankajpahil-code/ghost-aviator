"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import GhostMark from "@/app/components/GhostMark";
import GiniLauncher from "@/app/components/GiniLauncher";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import { useUser, getSupabase } from "@/lib/supabase";

// Derived once — dropdowns always reflect the real subject list.
const CPL_LINKS = CPL_SUBJECTS.map(s => [s.name, s.id] as const);
const ATPL_LINKS = ATPL_SUBJECTS.map(s => [s.name, s.id] as const);

type DropdownId = "cpl" | "atpl" | "more";

// Everything that used to live in the second nav row. Keeping these behind one
// "More" menu means the first row is a choice between six destinations, not a
// wall of sixteen links.
const MORE_LINKS = [
  { href: "/about", label: "The Captain", desc: "Who teaches and writes this" },
  { href: "/notes", label: "Notes", desc: "Free chapter notes" },
  { href: "/question-bank", label: "Question Bank", desc: "4,300+ explained MCQs" },
  { href: "/mistakes", label: "Mistakes Bank", desc: "Review your missed questions" },
  { href: "/video-lectures", label: "Video Lectures", desc: "Chapter videos" },
  { href: "/exam", label: "Exam Mode", desc: "Timed practice" },
  { href: "/past-papers", label: "Past Papers", desc: "DGCA-style papers" },
  { href: "/books", label: "Books", desc: "7 free PDFs" },
  { href: "/rtr-simulator", label: "RTR Simulator", desc: "Radio telephony practice" },
  { href: "/adapt-test", label: "ADAPT Test", desc: "Readiness check" },
  { href: "/ai-self-study", label: "AI Self-Study", desc: "Gini, the study partner" },
  { href: "/cpl-cost-calculator", label: "Cost Calculator", desc: "Plan the training spend" },
  { href: "/guides", label: "Guides", desc: "Career and exam guides" },
  { href: "/resources", label: "Resources", desc: "Downloads and links" },
  { href: "/dashboard", label: "Dashboard", desc: "Your progress" },
] as const;

const MOBILE_GROUPS = [
  {
    title: "Start here",
    links: [
      ["CPL Prep", "/cpl"],
      ["ATPL Prep", "/atpl"],
      ["Live Classes", "/live-classes"],
      ["AI Self-Study", "/ai-self-study"],
    ],
  },
  {
    title: "Study",
    links: [
      ["Question Bank", "/question-bank"],
      ["Notes", "/notes"],
      ["Free Mock Test", "/free-dgca-mock-test"],
      ["Past Papers", "/past-papers"],
      ["Video Lectures", "/video-lectures"],
      ["Exam Mode", "/exam"],
      ["Mistakes Bank", "/mistakes"],
    ],
  },
  {
    title: "Tools",
    links: [
      ["Books", "/books"],
      ["RTR Simulator", "/rtr-simulator"],
      ["ADAPT Test", "/adapt-test"],
      ["Cost Calculator", "/cpl-cost-calculator"],
      ["Guides", "/guides"],
      ["Resources", "/resources"],
      ["Dashboard", "/dashboard"],
    ],
  },
  {
    title: "Ghost Aviator",
    links: [
      ["The Captain", "/about"],
      ["Official Channels", "/official"],
      ["Contact", "/contact"],
    ],
  },
] as const;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState<DropdownId | null>(null);
  const moreTrigger = useRef<HTMLButtonElement>(null);
  const { user } = useUser();
  const displayName =
    (user?.user_metadata?.name as string | undefined)?.split(" ")[0] ||
    user?.email?.split("@")[0] || "";
  const signOut = () => { void getSupabase()?.auth.signOut(); };

  // Hover alone used to be the only way to open the CPL / ATPL lists, so a
  // keyboard user tabbing to "CPL" never saw the subject links. Focus now opens
  // them too, they stay open while focus is anywhere inside, and Escape closes
  // them and hands focus back to the trigger link.
  const escaping = useRef(false);
  const dropdown = (id: "cpl" | "atpl") => ({
    onMouseEnter: () => setDrop(id),
    onMouseLeave: () => setDrop(null),
    onFocus: () => { if (!escaping.current) setDrop(id); },
    onBlur: (e: React.FocusEvent<HTMLDivElement>) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDrop(null);
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
      const trigger = e.currentTarget.querySelector("a");
      if (e.key === "Escape" && drop === id) {
        escaping.current = true;
        setDrop(null);
        trigger?.focus();
        escaping.current = false;
        return;
      }
      if (drop !== id && e.target === trigger && (e.key === "ArrowDown" || e.key === " ")) {
        e.preventDefault();
        setDrop(id);
      }
    },
  });

  return (
    <nav
      style={{ background: "rgba(11,17,23,0.97)", borderBottom: "1px solid rgba(243,200,137,0.15)", backdropFilter: "blur(12px)" }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 no-underline shrink-0">
            <span style={{ filter: "drop-shadow(0 0 8px rgba(240,145,58,0.45))" }}><GhostMark size={40} /></span>
            <div>
              <div
                className="text-lg font-black leading-none"
                style={{ background: "linear-gradient(135deg,#7ad9ff,#f3c889)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
              >
                Ghost Aviator
              </div>
              <div className="text-xs leading-none" style={{ color: "rgba(243,200,137,0.55)" }}>Free DGCA self-study</div>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            <div className="relative" {...dropdown("cpl")}>
              <Link
                href="/cpl"
                aria-expanded={drop === "cpl"}
                aria-haspopup="true"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold no-underline transition-colors whitespace-nowrap"
                style={{ color: drop === "cpl" ? "#f3c889" : "#94a3b8" }}
              >
                CPL <ChevronDown className="w-3 h-3" aria-hidden="true" />
              </Link>
              {drop === "cpl" && (
                <div
                  className="absolute top-full left-0 mt-1 w-64 rounded-xl overflow-hidden z-50"
                  style={{ background: "rgba(17,24,32,0.98)", border: "1px solid rgba(171,121,77,0.35)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
                >
                  {CPL_LINKS.map(([label, slug], i, arr) => (
                    <Link
                      key={slug}
                      href={`/cpl/${slug}`}
                      onClick={() => setDrop(null)}
                      className="block px-4 py-2.5 text-sm no-underline hover:bg-purple-900/20 transition-colors"
                      style={{ color: "#94a3b8", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="relative" {...dropdown("atpl")}>
              <Link
                href="/atpl"
                aria-expanded={drop === "atpl"}
                aria-haspopup="true"
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold no-underline transition-colors whitespace-nowrap"
                style={{ color: drop === "atpl" ? "#f0913a" : "#94a3b8" }}
              >
                ATPL <ChevronDown className="w-3 h-3" aria-hidden="true" />
              </Link>
              {drop === "atpl" && (
                <div
                  className="absolute top-full left-0 mt-1 w-64 rounded-xl overflow-hidden z-50"
                  style={{ background: "rgba(17,24,32,0.98)", border: "1px solid rgba(240,145,58,0.3)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
                >
                  {ATPL_LINKS.map(([label, slug], i, arr) => (
                    <Link
                      key={slug}
                      href={`/atpl/${slug}`}
                      onClick={() => setDrop(null)}
                      className="block px-4 py-2.5 text-sm no-underline hover:bg-blue-900/20 transition-colors"
                      style={{ color: "#94a3b8", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : undefined }}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/question-bank" className="px-3 py-2 rounded-lg text-sm font-bold no-underline whitespace-nowrap" style={{ color: "#94a3b8" }}>
              Question Bank
            </Link>
            <Link href="/free-dgca-mock-test" className="px-3 py-2 rounded-lg text-sm font-bold no-underline whitespace-nowrap" style={{ color: "#94a3b8" }}>
              Mock Tests
            </Link>
            <Link href="/live-classes" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-black no-underline whitespace-nowrap" style={{ color: "#ff8a8a" }}>
              <span className="w-2 h-2 rounded-full" style={{ background: "#ff5a5a", boxShadow: "0 0 8px rgba(255,48,48,0.8)" }} /> Live Classes
            </Link>

            <div
              className="relative"
              onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDrop(null); }}
              onKeyDown={(e) => {
                if (e.key === "Escape" && drop === "more") {
                  setDrop(null);
                  moreTrigger.current?.focus();
                }
              }}
            >
              <button
                ref={moreTrigger}
                type="button"
                aria-expanded={drop === "more"}
                aria-haspopup="true"
                aria-controls={drop === "more" ? "more-menu" : undefined}
                onClick={() => setDrop(d => d === "more" ? null : "more")}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold cursor-pointer border-0 bg-transparent whitespace-nowrap"
                style={{ color: drop === "more" ? "#f3c889" : "#94a3b8" }}
              >
                More <ChevronDown className="w-3 h-3" aria-hidden="true" />
              </button>
              {drop === "more" && (
                <div
                  id="more-menu"
                  className="absolute top-full right-0 mt-1 w-[min(92vw,560px)] rounded-2xl p-2 z-50 grid grid-cols-2 gap-0.5"
                  style={{ background: "rgba(17,24,32,0.99)", border: "1px solid rgba(243,200,137,0.25)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)" }}
                >
                  {MORE_LINKS.map(({ href, label, desc }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setDrop(null)}
                      className="block rounded-xl px-3 py-2.5 no-underline hover:bg-white/5 transition-colors"
                    >
                      <span className="block text-sm font-bold text-white">{label}</span>
                      <span className="block text-[11px] mt-0.5" style={{ color: "#64748b" }}>{desc}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <GiniLauncher />
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-bold px-3 py-1.5 rounded-lg no-underline"
                  style={{ color: "#f3c889", border: "1px solid rgba(243,200,137,0.35)", background: "rgba(243,200,137,0.08)" }}
                  title="Signed in — open your dashboard. Progress syncs across your devices."
                >
                  ✈ {displayName}
                </Link>
                <button onClick={signOut} className="text-sm font-medium cursor-pointer bg-transparent border-0" style={{ color: "#64748b" }}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium no-underline" style={{ color: "#64748b" }}>Log In</Link>
                <Link
                  href="/cpl"
                  className="text-sm font-black px-4 py-2 rounded-lg no-underline"
                  style={{ background: "linear-gradient(135deg,#c25a1e,#c25a1e)", color: "#fff" }}
                >
                  Start Free
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <GiniLauncher />
            <button
              style={{ color: "#f3c889", minWidth: 40, minHeight: 40 }}
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls={open ? "mobile-menu" : undefined}
            >
              {open ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="lg:hidden px-4 pb-5 flex flex-col gap-4 max-h-[calc(100vh-4rem)] overflow-y-auto"
          style={{ borderTop: "1px solid rgba(243,200,137,0.12)" }}
        >
          {MOBILE_GROUPS.map(group => (
            <div key={group.title}>
              <div className="text-[11px] font-black tracking-widest uppercase mb-1.5" style={{ color: "#ab794d" }}>
                {group.title}
              </div>
              <div className="flex flex-col">
                {group.links.map(([label, href]) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="py-2 text-sm font-semibold no-underline"
                    style={{ color: "#cbd5e1" }}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {user ? (
            <button
              onClick={() => { signOut(); setOpen(false); }}
              className="mt-1 py-3 px-4 rounded-xl text-sm font-black text-center cursor-pointer"
              style={{ background: "rgba(243,200,137,0.12)", color: "#f3c889", border: "1px solid rgba(243,200,137,0.35)" }}
            >
              ✈ {displayName} — Sign Out
            </button>
          ) : (
            <div className="mt-1 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="py-3 px-4 rounded-xl text-sm font-black text-center no-underline"
                style={{ background: "rgba(243,200,137,0.08)", color: "#f3c889", border: "1px solid rgba(243,200,137,0.35)" }}
              >
                Log In
              </Link>
              <Link
                href="/cpl"
                onClick={() => setOpen(false)}
                className="py-3 px-4 rounded-xl text-sm font-black text-center no-underline"
                style={{ background: "linear-gradient(135deg,#c25a1e,#c25a1e)", color: "#fff" }}
              >
                Start Free — No Sign-Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
