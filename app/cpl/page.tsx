import Link from "next/link";
import type { Metadata } from "next";
import { CPL_SUBJECTS } from "@/lib/subjects";
import { ALL_QUESTIONS } from "@/lib/questions";
import { ArrowRight, Clock, FileQuestion, CheckCircle } from "lucide-react";

import { SITE_URL } from "@/lib/site";

const CHAPTERS = CPL_SUBJECTS.reduce((n, s) => n + s.chapters.length, 0);
const cplIds = new Set(CPL_SUBJECTS.map(s => s.id));
const QUESTIONS = `${(Math.floor(ALL_QUESTIONS.filter(q => q.subjectIds.some(id => cplIds.has(id))).length / 100) * 100).toLocaleString("en-IN")}+`;

export const metadata: Metadata = {
  title: "DGCA CPL Exam Preparation — Free Question Bank, Notes & Mock Tests | Ghost Aviator",
  description: "Free online DGCA CPL exam preparation for India — complete question bank, chapter-wise notes, video lectures and mock tests for every Commercial Pilot Licence paper.",
  alternates: { canonical: "/cpl" }
};

export default function CPLPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": CPL_SUBJECTS.map((subject, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "Course",
        "url": `${SITE_URL}/cpl/${subject.id}`,
        "name": `${subject.name} (CPL) Syllabus, Question Bank & Notes`,
        "description": subject.description,
        "provider": {
          "@type": "Organization",
          "name": "Ghost Aviator",
          "sameAs": SITE_URL
        }
      }
    }))
  };

  return (
    <div style={{ background:"#06040e" }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* Header */}
      <div className="relative overflow-hidden" style={{ borderBottom:"1px solid rgba(124,58,237,0.25)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background:"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,58,237,0.2) 0%, transparent 70%)" }}/>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <Link href="/" className="inline-flex items-center gap-1 text-sm mb-6 no-underline" style={{ color:"#64748b" }}>
            ← Back to Home
          </Link>
          <div className="inline-block text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-5"
               style={{ color:"#c080ff", border:"1px solid rgba(180,100,255,0.35)", background:"rgba(180,100,255,0.08)", letterSpacing:"0.18em" }}>
            DGCA INDIA
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4">
            CPL <span style={{ background:"linear-gradient(135deg,#c080ff,#ff2060)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Prep</span>
          </h1>
          <p className="text-xl font-semibold mb-2" style={{ color:"#c080ff" }}>Commercial Pilot Licence — Written Examinations</p>
          <p className="max-w-2xl mb-10" style={{ color:"#64748b" }}>
            7 DGCA papers as per CAR Section 7 Series B Part IV. Every chapter mapped directly to the official DGCA CPL syllabus appendices with notes, slides, videos, audio, questions, and tests.
          </p>
          <div className="flex flex-wrap gap-4">
            {[["7","Written Papers"],[`${CHAPTERS}`,"Chapters"],[QUESTIONS,"Questions"],["70%","Pass Mark"]].map(([v,l]) => (
              <div key={l} className="px-5 py-3 rounded-xl text-center" style={{ background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.3)" }}>
                <div className="text-2xl font-black text-white">{v}</div>
                <div className="text-xs" style={{ color:"#7c3aed" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subjects */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-black text-white mb-8">All 7 CPL Papers</h2>
        <div className="flex flex-col gap-5">
          {CPL_SUBJECTS.map((subject, idx) => (
            <Link key={subject.id} href={`/cpl/${subject.id}`}
                  className="group rounded-2xl overflow-hidden no-underline block transition-all duration-300"
                  style={{ background:"rgba(15,8,30,0.95)", border:`1px solid ${subject.color}30` }}>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-5 flex-1">
                    {/* Number */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl"
                         style={{ background:`${subject.color}20`, border:`1px solid ${subject.color}40`, color: subject.color }}>
                      {String(idx + 1).padStart(2,"0")}
                    </div>
                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{subject.icon}</span>
                        <h3 className="text-lg font-black text-white">{subject.name}</h3>
                      </div>
                      <p className="text-sm mb-3" style={{ color:"#64748b" }}>{subject.description}</p>
                      <div className="flex flex-wrap gap-4">
                        <span className="flex items-center gap-1 text-xs" style={{ color:"#475569" }}>
                          <Clock className="w-3 h-3"/> {subject.examDuration} min exam
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color:"#475569" }}>
                          <FileQuestion className="w-3 h-3"/> {subject.totalQuestions} Qs in paper
                        </span>
                        <span className="flex items-center gap-1 text-xs" style={{ color:"#475569" }}>
                          <CheckCircle className="w-3 h-3"/> Pass: {subject.passMark}%
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                              style={{ background:`${subject.color}18`, color: subject.color }}>
                          {subject.chapters.length} Chapters
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-bold text-sm flex-shrink-0" style={{ color: subject.color }}>
                    Study Now <ArrowRight className="w-4 h-4"/>
                  </div>
                </div>

                {/* Chapter preview */}
                <div className="mt-4 pt-4 flex flex-wrap gap-2" style={{ borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                  {subject.chapters.slice(0, 5).map(ch => (
                    <span key={ch.id} className="text-xs px-3 py-1 rounded-full" style={{ background:"rgba(255,255,255,0.04)", color:"#475569" }}>
                      Ch.{ch.number} {ch.title}
                    </span>
                  ))}
                  {subject.chapters.length > 5 && (
                    <span className="text-xs px-3 py-1 rounded-full" style={{ background:"rgba(255,255,255,0.04)", color:"#475569" }}>
                      +{subject.chapters.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Tests section */}
        <div className="mt-16 p-8 rounded-3xl" style={{ background:"rgba(15,8,30,0.95)", border:"1px solid rgba(124,58,237,0.2)" }}>
          <h3 className="text-xl font-black text-white mb-6">CPL Full Tests & Sample Papers</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label:"Full CPL Mock Test",     icon:"🎯", desc:"All 6 subjects combined · 300 Qs · 6 hrs", color:"#7c3aed", href:"/mock-test?type=cpl-full" },
              { label:"Subject-wise Tests",     icon:"📝", desc:"60 Qs per subject · 60 min each",          color:"#0ea5e9", href:"/mock-test?type=cpl-subject" },
              { label:"DGCA Sample Papers",     icon:"📋", desc:"Previous style papers · Actual format",    color:"#10b981", href:"/mock-test?type=cpl-sample" },
            ].map(t => (
              <Link key={t.label} href={t.href} className="p-5 rounded-2xl no-underline block"
                    style={{ background:`${t.color}12`, border:`1px solid ${t.color}30` }}>
                <div className="text-3xl mb-3">{t.icon}</div>
                <h4 className="font-bold text-white mb-1">{t.label}</h4>
                <p className="text-xs" style={{ color:"#64748b" }}>{t.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
