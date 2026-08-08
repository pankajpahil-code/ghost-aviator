import Link from "next/link";
import { getChapterSpecificQuestions } from "@/lib/questions";
import { getChapterVideos } from "@/lib/chapter-videos";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ATPL_SUBJECTS } from "@/lib/subjects";
import { FileText, BarChart3, Video, Headphones, HelpCircle, ClipboardList, ListChecks, Lock, ArrowRight, ChevronRight } from "lucide-react";
import SubjectProgressBar from "@/app/components/SubjectProgressBar";
import ChapterProgressBadge from "@/app/components/ChapterProgressBadge";
import { SITE_URL } from "@/lib/site";

const CONTENT_ICONS: Record<string, React.ElementType> = {
  notes: FileText, slides: BarChart3, video: Video,
  audio: Headphones, questions: HelpCircle, "mock-test": ClipboardList, "chapter-quiz": ListChecks,
};
const CONTENT_COLORS: Record<string, string> = {
  notes: "#ab794d", slides: "#0ea5e9", video: "#ef4444",
  audio: "#f59e0b", questions: "#10b981", "mock-test": "#f3c889", "chapter-quiz": "#f97316",
};

export function generateStaticParams() {
  return ATPL_SUBJECTS.map(s => ({ subject: s.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }): Promise<Metadata> {
  const { subject: subjectId } = await params;
  const subject = ATPL_SUBJECTS.find(s => s.id === subjectId);
  if (!subject) return {};
  
  return {
    title: `${subject.name} (ATPL) Syllabus, Question Bank & Notes | Ghost Aviator`,
    description: subject.description,
    alternates: { canonical: `/atpl/${subject.id}` },
  };
}

export default async function ATPLSubjectPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject: subjectId } = await params;
  const subject = ATPL_SUBJECTS.find(s => s.id === subjectId);
  if (!subject) notFound();

  const midpoint = Math.ceil(subject.chapters.length / 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `${subject.name} (ATPL) DGCA Prep`,
    "description": subject.description,
    "provider": {
      "@type": "Organization",
      "name": "Ghost Aviator",
      "sameAs": SITE_URL
    }
  };

  return (
    <div style={{ background:"#0b1117" }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="relative overflow-hidden" style={{ borderBottom:`1px solid ${subject.color}25` }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background:`radial-gradient(ellipse 80% 50% at 50% 0%, ${subject.color}15 0%, transparent 65%)` }}/>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="flex items-center gap-2 text-sm mb-6" style={{ color:"#475569" }}>
            <Link href="/" className="no-underline" style={{ color:"#475569" }}>Home</Link>
            <ChevronRight className="w-3 h-3"/>
            <Link href="/atpl" className="no-underline" style={{ color:"#475569" }}>ATPL</Link>
            <ChevronRight className="w-3 h-3"/>
            <span style={{ color:"#94a3b8" }}>{subject.name}</span>
          </div>
          <div className="flex items-start gap-5 mb-6">
            <span className="text-5xl">{subject.icon}</span>
            <div>
              <div className="text-xs font-bold tracking-widest mb-2" style={{ color: subject.color, letterSpacing:"0.18em" }}>ATPL PAPER</div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">{subject.name}</h1>
              <p className="text-base" style={{ color:"#64748b" }}>{subject.description}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              [`${subject.chapters.length} Chapters`, subject.color],
              [`${subject.examDuration} min Exam`, "#475569"],
              [`${subject.totalQuestions} Qs in Paper`, "#475569"],
              [`${subject.passMark}% to Pass`, "#22c55e"],
            ].map(([v, c]) => (
              <span key={v} className="text-sm px-3 py-1 rounded-full font-medium"
                    style={{ background:`${c}15`, border:`1px solid ${c}35`, color: c }}>
                {v}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap gap-3 mb-10">
          {["notes","slides","video","audio","chapter-quiz"].map(type => {
            const Icon = CONTENT_ICONS[type];
            const color = CONTENT_COLORS[type];
            return (
              <div key={type} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
                   style={{ background:`${color}12`, border:`1px solid ${color}30`, color }}>
                <Icon className="w-3 h-3"/> {type === "mock-test" ? "Chapter Test" : type === "chapter-quiz" ? "Chapter Quiz" : type.charAt(0).toUpperCase() + type.slice(1)}
              </div>
            );
          })}
        </div>

        <SubjectProgressBar
          track="atpl"
          subjectId={subject.id}
          chapterIds={subject.chapters.map(c => c.id)}
          passMark={subject.passMark}
          color={subject.color}
        />

        <h2 className="text-xl font-black text-white mb-5">Chapters</h2>
        <div className="flex flex-col gap-3 mb-8">
          {subject.chapters.map(ch => (
            <div key={ch.id} className="rounded-2xl overflow-hidden"
                 style={{ background:"rgba(17,24,32,0.95)", border:`1px solid ${subject.color}20` }}>
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black"
                       style={{ background:`${subject.color}20`, border:`1px solid ${subject.color}40`, color: subject.color }}>
                    {ch.number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <h3 className="font-bold text-white">{ch.title}</h3>
                      <ChapterProgressBadge track="atpl" subjectId={subject.id} chapterId={ch.id} passMark={subject.passMark} />
                    </div>
                    <p className="text-xs mb-3" style={{ color:"#475569" }}>{ch.description}</p>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs" style={{ color:"#334155" }}>⏱ {ch.duration}</span>
                      <span className="text-xs" style={{ color:"#334155" }}>❓ {ch.questionCount} practice Qs</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ch.content.map(c => {
                        const Icon = CONTENT_ICONS[c.type];
                        const color = CONTENT_COLORS[c.type];
                        // Same drift as the CPL index: the questions flag is hand-kept
                        // and lies in both directions. Derived from the bank instead.
                        const available =
                          c.type === "questions" ? getChapterSpecificQuestions(subject.id, ch.id).length > 0
                          : c.type === "video"   ? getChapterVideos(subject.id, ch.id).length > 0
                          : c.available;
                        return available ? (
                          <Link key={c.type} href={`/atpl/${subject.id}/${ch.id}/${c.type}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold no-underline"
                                style={{ background:`${color}18`, border:`1px solid ${color}40`, color }}>
                            <Icon className="w-3 h-3"/> {c.label}
                          </Link>
                        ) : (
                          <div key={c.type}
                               className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                               style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)", color:"#334155" }}>
                            <Lock className="w-3 h-3"/> {c.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-6 mb-4 flex items-center gap-5"
             style={{ background:`linear-gradient(135deg, ${subject.color}18, rgba(240,145,58,0.08))`, border:`1px solid ${subject.color}35` }}>
          <div className="text-3xl">🎯</div>
          <div className="flex-1">
            <h3 className="font-black text-white mb-1">Mid-Subject Test</h3>
            <p className="text-sm" style={{ color:"#64748b" }}>After first {midpoint} chapters · 40 questions · 50 minutes</p>
          </div>
          <Link href={`/mock-test?subject=${subject.id}&type=mid`}
                className="flex items-center gap-1 text-sm font-bold px-4 py-2 rounded-xl no-underline"
                style={{ background:`${subject.color}25`, border:`1px solid ${subject.color}45`, color: subject.color }}>
            Take Test <ArrowRight className="w-4 h-4"/>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6" style={{ background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.25)" }}>
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="font-black text-white mb-1">Full Subject Test</h3>
            <p className="text-sm mb-4" style={{ color:"#64748b" }}>All {subject.chapters.length} chapters · {subject.totalQuestions} Qs · {subject.examDuration} min · DGCA format</p>
            <Link href={`/mock-test?subject=${subject.id}&type=full`}
                  className="inline-flex items-center gap-1 text-sm font-bold px-4 py-2 rounded-xl no-underline"
                  style={{ background:"rgba(34,197,94,0.18)", border:"1px solid rgba(34,197,94,0.35)", color:"#22c55e" }}>
              Start Full Test <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
          <div className="rounded-2xl p-6" style={{ background:"rgba(249,115,22,0.08)", border:"1px solid rgba(249,115,22,0.25)" }}>
            <div className="text-3xl mb-3">📋</div>
            <h3 className="font-black text-white mb-1">DGCA Sample Papers</h3>
            <p className="text-sm mb-4" style={{ color:"#64748b" }}>ATPL-style papers for {subject.shortName} · Actual exam pattern</p>
            <Link href={`/mock-test?subject=${subject.id}&type=sample`}
                  className="inline-flex items-center gap-1 text-sm font-bold px-4 py-2 rounded-xl no-underline"
                  style={{ background:"rgba(249,115,22,0.18)", border:"1px solid rgba(249,115,22,0.35)", color:"#f97316" }}>
              View Papers <ArrowRight className="w-4 h-4"/>
            </Link>
          </div>
        </div>

        {/* Related ATPL Subjects & Tools */}
        <div className="mt-12 pt-10 border-t border-white/10 space-y-8">
          <div>
            <h3 className="text-xl font-black text-white mb-2">Explore Other ATPL Subjects</h3>
            <p className="text-sm text-slate-400 mb-6">Complete your Airline Transport Pilot License ground training syllabus.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {ATPL_SUBJECTS.filter(s => s.id !== subject.id).map(other => (
                <Link key={other.id} href={`/atpl/${other.id}`}
                      className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-all no-underline group">
                  <div className="text-xl mb-1">{other.icon}</div>
                  <div className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{other.shortName}</div>
                  <div className="text-xs text-slate-500">{other.chapters.length} Chapters</div>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-black text-white mb-2">ATPL Prep Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link href="/question-bank" className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 no-underline hover:bg-emerald-500/20 transition-all">
                <div className="text-base font-bold text-emerald-400 mb-1">Question Bank</div>
                <div className="text-xs text-slate-300">Practice ATPL & CPL exam questions with full explanations.</div>
              </Link>
              <Link href="/past-papers" className="p-4 rounded-xl border border-purple-500/30 bg-purple-500/10 no-underline hover:bg-purple-500/20 transition-all">
                <div className="text-base font-bold text-purple-400 mb-1">DGCA Past Papers</div>
                <div className="text-xs text-slate-300">Review solved papers for ATPL Navigation, Meteorology & Radio.</div>
              </Link>
              <Link href="/cpl-cost-calculator" className="p-4 rounded-xl border border-sky-500/30 bg-sky-500/10 no-underline hover:bg-sky-500/20 transition-all">
                <div className="text-base font-bold text-sky-400 mb-1">CPL & Flight Cost Calculator</div>
                <div className="text-xs text-slate-300">Interactive calculator for flying hours and exam fees.</div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
