import Link from "next/link";
import type { Metadata } from "next";
import { EXAM_PAPERS } from "@/lib/exam-papers";
import { FileCheck, ArrowRight, Clock, ListChecks, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "Exam Mode — Full DGCA Mock Exams | Ghost Aviator",
  description:
    "Sit a full-length DGCA CPL paper exactly as it's examined — real question count, real time, real pass mark. Every attempt is saved to your performance dashboard.",
};

export default function ExamModePage() {
  return (
    <div className="grid-bg min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(0,212,255,0.2)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.15) 0%, transparent 70%)" }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="inline-block text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-5"
               style={{ color: "#00d4ff", border: "1px solid rgba(0,212,255,0.35)", background: "rgba(0,212,255,0.08)", letterSpacing: "0.18em" }}>
            REAL DGCA FORMAT
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4">
            Exam <span className="gradient-text">Mode</span>
          </h1>
          <p className="max-w-2xl mb-2" style={{ color: "#94a3b8" }}>
            Every paper below matches the actual DGCA CPL exam — the same question count,
            the same time allowed, the same pass mark. No shortcuts, no rounding.
          </p>
          <p className="max-w-2xl text-sm" style={{ color: "#475569" }}>
            Sign in to keep your attempt history and see your progress on the{" "}
            <Link href="/dashboard" className="underline" style={{ color: "#00d4ff" }}>performance dashboard</Link>.
          </p>
        </div>
      </div>

      {/* Papers */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {EXAM_PAPERS.map(p => (
            <Link key={p.id} href={`/exam/${p.id}`}
                  className="glass-card group p-6 no-underline block">
              <div className="flex items-start justify-between mb-4">
                <FileCheck className="w-7 h-7" style={{ color: "#00d4ff" }} />
                <span className="text-xs font-bold px-2 py-1 rounded" style={{ color: "#94a3b8", background: "rgba(255,255,255,0.05)" }}>
                  {p.track.toUpperCase()}
                </span>
              </div>
              <div className="font-black text-white text-lg mb-1">{p.title}</div>
              {p.note && <p className="text-xs mb-3" style={{ color: "#64748b" }}>{p.note}</p>}
              <div className="flex items-center gap-4 text-xs mb-4" style={{ color: "#64748b" }}>
                <span className="flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" /> {p.questionCount} Qs</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {Math.round(p.durationMin / 60 * 10) / 10}h</span>
                <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> {p.passMark}%</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-black" style={{ color: "#00d4ff" }}>
                Start Exam <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
        <p className="text-sm mt-10" style={{ color: "#475569" }}>
          RTR(A) Part 2 (the practical voice/ATC test) isn&apos;t a written paper — practise it in{" "}
          <Link href="/rtr-simulator" className="underline font-bold" style={{ color: "#00d4ff" }}>
            Ghost Tower
          </Link>, India&apos;s first R/T simulator.
        </p>
      </div>
    </div>
  );
}
