import type { Metadata } from "next";
import Link from "next/link";
import { Radio, Mic, BookOpen, Award } from "lucide-react";
import GhostTower, { LockedScenarios } from "./GhostTower";

export const metadata: Metadata = {
  title: "Ghost Tower — RTR(A) Radio Simulator | Ghost Aviator",
  description:
    "India's first RTR(A) practical R/T simulator. Talk to ATC, read back clearances, get graded like the real WPC exam — free for every student pilot.",
};

export default function RtrSimulatorPage() {
  return (
    <div className="grid-bg min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(0,212,255,0.2)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.15) 0%, transparent 70%)" }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <div className="inline-block text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-5"
               style={{ color: "#00d4ff", border: "1px solid rgba(0,212,255,0.35)", background: "rgba(0,212,255,0.08)", letterSpacing: "0.18em" }}>
            INDIA&apos;S FIRST R/T PRACTICE SIMULATOR
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4">
            Ghost <span className="gradient-text">Tower</span>
          </h1>
          <p className="max-w-2xl mb-3" style={{ color: "#94a3b8" }}>
            The RTR(A) written paper tests what you know. Part 2 tests how you <em>sound</em> —
            live, on frequency, with an examiner playing ATC. Ghost Tower puts you on that
            frequency today: real ICAO phraseology, mandatory read-backs, examiner probes,
            and a gradesheet at the end.
          </p>
          <div className="flex flex-wrap gap-4 text-xs" style={{ color: "#64748b" }}>
            <span className="flex items-center gap-1.5"><Mic className="w-4 h-4" /> Speak or tap your calls</span>
            <span className="flex items-center gap-1.5"><Radio className="w-4 h-4" /> ATC voice with real radio feel</span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> Graded to the 50% Part-2 pass mark</span>
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Every rule cross-linked to the RTR(A) book</span>
          </div>
        </div>
      </div>

      {/* Simulator */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <GhostTower />
        <LockedScenarios />
        <p className="text-sm mt-10" style={{ color: "#475569" }}>
          Studying for Part 1 as well? The complete{" "}
          <Link href="/cpl/radio-telephony" className="underline" style={{ color: "#00d4ff" }}>
            RTR(A) book
          </Link>{" "}
          covers regulations, radio theory and every phraseology chapter behind this simulator.
        </p>
      </div>
    </div>
  );
}
