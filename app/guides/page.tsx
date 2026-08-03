import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { BookOpen, Calendar, User, ChevronRight } from "lucide-react";

export const metadata = {
  title: "DGCA Exam Guides — CPL, RTR(A) & Pilot Training in India | Ghost Aviator",
  description: "Comprehensive guides on DGCA exams, eGCA computer numbers, RTR(A) exam patterns, and CPL mock tests by Capt. Pankaj Pahil.",
  alternates: { canonical: "/guides" },
};

export default function GuidesIndexPage() {
  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen pb-20">
      {/* Header */}
      <div className="relative overflow-hidden" style={{ borderBottom: `1px solid #ab794d25` }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, #ab794d18 0%, transparent 65%)` }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 rounded-full mb-6" style={{ background: "#ab794d15", color: "#ab794d" }}>
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Aviation Study Guides</h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#94a3b8" }}>
            Expert advice, step-by-step procedures, and deep dives into the Indian aviation landscape. Learn how to navigate the DGCA system efficiently.
          </p>
        </div>
      </div>

      {/* Guide List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-6">
          {GUIDES.map(guide => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="block group no-underline">
              <div className="rounded-2xl p-6 transition-all duration-300"
                   style={{ background: "rgba(17,24,32,0.95)", border: `1px solid rgba(255,255,255,0.06)` }}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {guide.title}
                    </h2>
                    <p className="text-sm mb-4" style={{ color: "#64748b" }}>
                      {guide.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-medium" style={{ color: "#475569" }}>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> {guide.author}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" /> {new Date(guide.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full"
                       style={{ background: "#ab794d10", color: "#ab794d" }}>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
