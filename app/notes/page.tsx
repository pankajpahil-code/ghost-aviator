import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";

const CPL_CHAPTER_COUNT  = CPL_SUBJECTS.reduce((n, s) => n + s.chapters.length, 0);
const ATPL_CHAPTER_COUNT = ATPL_SUBJECTS.reduce((n, s) => n + s.chapters.length, 0);

export default function NotesPage() {
  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen">

      {/* Header */}
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(243,200,137,0.2)" }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(171,121,77,0.15) 0%, transparent 65%)" }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5"
               style={{ background: "rgba(171,121,77,0.12)", border: "1px solid rgba(171,121,77,0.35)", color: "#f3c889" }}>
            <FileText className="w-4 h-4" /> Study Notes
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            DGCA Chapter Notes
          </h1>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#64748b" }}>
            Concise, exam-focused notes written by Capt. Pankaj Pahil — one page per chapter, exactly on syllabus.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* CPL */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🛩️</span>
            <h2 className="text-2xl font-black text-white">CPL Subjects</h2>
            <span className="text-xs px-3 py-1 rounded-full font-bold"
                  style={{ background: "rgba(171,121,77,0.12)", border: "1px solid rgba(171,121,77,0.3)", color: "#f3c889" }}>
              {CPL_SUBJECTS.length} Subjects · {CPL_CHAPTER_COUNT} Chapters
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CPL_SUBJECTS.map(s => (
              <Link key={s.id} href={`/cpl/${s.id}`}
                    className="rounded-2xl p-5 no-underline flex flex-col gap-3 group"
                    style={{ background: "rgba(17,24,32,0.95)", border: `1px solid ${s.color}20` }}>
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
                    {s.chapters.length} chapters
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-white mb-1 text-sm">{s.name}</h3>
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#475569" }}>{s.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold mt-auto"
                     style={{ color: s.color }}>
                  View Chapters <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ATPL */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">✈️</span>
            <h2 className="text-2xl font-black text-white">ATPL Subjects</h2>
            <span className="text-xs px-3 py-1 rounded-full font-bold"
                  style={{ background: "rgba(240,145,58,0.1)", border: "1px solid rgba(240,145,58,0.25)", color: "#f0913a" }}>
              {ATPL_SUBJECTS.length} Subjects · {ATPL_CHAPTER_COUNT} Chapters
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ATPL_SUBJECTS.map(s => (
              <Link key={s.id} href={`/atpl/${s.id}`}
                    className="rounded-2xl p-5 no-underline flex flex-col gap-3 group"
                    style={{ background: "rgba(17,24,32,0.95)", border: `1px solid ${s.color}20` }}>
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-xs px-2 py-1 rounded-full font-medium"
                        style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
                    {s.chapters.length} chapters
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-white mb-1 text-sm">{s.name}</h3>
                  <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#475569" }}>{s.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold mt-auto"
                     style={{ color: s.color }}>
                  View Chapters <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
