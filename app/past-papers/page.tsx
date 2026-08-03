import Link from "next/link";
import type { Metadata } from "next";
import { papersBySubject } from "@/lib/past-papers";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import { FileText, ArrowRight, Clock, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "DGCA Previous Year Question Papers — Practice Online Free | Ghost Aviator",
  description:
    "Practice full DGCA previous-year and sample question papers online with answer keys — free exam-style practice for CPL and ATPL, subject by subject.",
  alternates: { canonical: "/past-papers" },
};

const SUBJECTS = [...CPL_SUBJECTS, ...ATPL_SUBJECTS];

export default function PastPapersPage() {
  const groups = papersBySubject();
  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(171,121,77,0.25)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(171,121,77,0.2) 0%, transparent 70%)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="inline-block text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-5"
               style={{ color: "#f3c889", border: "1px solid rgba(243,200,137,0.35)", background: "rgba(243,200,137,0.08)", letterSpacing: "0.18em" }}>
            EXAM-STYLE PRACTICE
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4">
            Previous Year <span style={{ background: "linear-gradient(135deg,#f3c889,#c25a1e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Papers</span>
          </h1>
          <p className="max-w-2xl" style={{ color: "#64748b" }}>
            Full question papers exactly as they appear in the exam — attempt the whole paper,
            submit, and review every answer. The best rehearsal before the real thing.
          </p>
        </div>
      </div>

      {/* Papers by subject */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {groups.map(({ subjectId, papers }) => {
          const subject = SUBJECTS.find(s => s.id === subjectId);
          return (
            <section key={subjectId} className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{subject?.icon ?? "📄"}</span>
                <h2 className="text-2xl font-black text-white">{subject?.name ?? subjectId}</h2>
                <span className="text-sm font-bold px-3 py-1 rounded-full"
                      style={{ color: "#f0913a", border: "1px solid rgba(240,145,58,0.3)", background: "rgba(240,145,58,0.07)" }}>
                  {papers.length} papers
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {papers.map(p => (
                  <Link key={p.id} href={`/past-papers/${p.id}`}
                        className="group rounded-2xl p-5 no-underline block transition-transform hover:-translate-y-0.5"
                        style={{ background: "rgba(22,30,38,0.6)", border: "1px solid rgba(171,121,77,0.3)" }}>
                    <div className="flex items-start justify-between mb-3">
                      <FileText className="w-6 h-6" style={{ color: "#f3c889" }} />
                      <span className="text-xs font-bold px-2 py-1 rounded" style={{ color: "#94a3b8", background: "rgba(255,255,255,0.05)" }}>
                        {p.questions.length} Qs
                      </span>
                    </div>
                    <div className="font-bold text-white mb-2">{p.title}</div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: "#64748b" }}>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> self-paced</span>
                      <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> answer key</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm font-black" style={{ color: "#f3c889" }}>
                      Attempt Paper <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
        <p className="text-sm" style={{ color: "#475569" }}>
          More subjects&apos; papers are being added — check back soon.
        </p>
      </div>
    </div>
  );
}
