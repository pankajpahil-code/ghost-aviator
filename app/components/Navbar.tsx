"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Ghost } from "lucide-react";

const links = [
  { href: "/subjects",       label: "Subjects" },
  { href: "/question-bank",  label: "Question Bank" },
  { href: "/mock-test",      label: "Mock Test" },
  { href: "/notes",          label: "Notes" },
  { href: "/videos",         label: "Video Lectures" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ background: "rgba(5,5,16,0.95)", borderBottom: "1px solid rgba(0,212,255,0.15)", backdropFilter: "blur(10px)" }}
         className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <Ghost className="w-7 h-7" style={{ color: "#00d4ff" }} />
            <span className="text-xl font-bold" style={{ color: "#fff" }}>
              Ghost <span style={{ color: "#00d4ff" }}>Aviator</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                    className="text-sm font-medium transition-colors no-underline"
                    style={{ color: "#94a3b8" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#00d4ff")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium no-underline" style={{ color: "#94a3b8" }}>Log In</Link>
            <Link href="/signup"
                  className="text-sm font-bold px-4 py-2 rounded-lg no-underline"
                  style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
              Get Started Free
            </Link>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" style={{ color: "#00d4ff" }} onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-4 pb-4 flex flex-col gap-3" style={{ borderTop: "1px solid rgba(0,212,255,0.15)" }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className="py-2 text-sm font-medium no-underline" style={{ color: "#94a3b8" }}>
              {l.label}
            </Link>
          ))}
          <Link href="/signup" onClick={() => setOpen(false)}
                className="py-2 px-4 rounded-lg text-sm font-bold text-center no-underline"
                style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
            Get Started Free
          </Link>
        </div>
      )}
    </nav>
  );
}
