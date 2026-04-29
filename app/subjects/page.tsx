import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

const subjects = [
  { name: "Air Regulations",         slug: "air-regulations",    icon: "⚖️",  questions: 1200, topics: 18, color: "#7c3aed", desc: "DGCA rules, ANO, ICAO annexures, air space, licensing requirements." },
  { name: "Aviation Meteorology",    slug: "meteorology",         icon: "🌤️", questions: 1800, topics: 22, color: "#0ea5e9", desc: "Weather systems, METAR, TAF, turbulence, icing, thunderstorms." },
  { name: "General Navigation",      slug: "general-navigation",  icon: "🗺️", questions: 2500, topics: 25, color: "#10b981", desc: "Charts, dead reckoning, heading, groundspeed, descent planning." },
  { name: "Technical General",       slug: "technical-general",   icon: "⚙️", questions: 1500, topics: 20, color: "#f59e0b", desc: "Engines, hydraulics, electrical systems, pressurisation, fuel systems." },
  { name: "Radio Aids & Instruments",slug: "radio-aids",          icon: "📡", questions: 1300, topics: 16, color: "#ef4444", desc: "VOR, NDB, ILS, DME, ADI, HSI, altimeters, airspeed indicators." },
  { name: "Performance",             slug: "performance",         icon: "📈", questions: 900,  topics: 12, color: "#8b5cf6", desc: "Takeoff, landing, climb, cruise performance, V-speeds, charts." },
  { name: "Mass & Balance",          slug: "mass-balance",        icon: "⚖️", questions: 600,  topics: 10, color: "#06b6d4", desc: "CG limits, load sheets, weight calculations, moment arms." },
  { name: "Air Laws",                slug: "air-laws",            icon: "📋", questions: 800,  topics: 14, color: "#f97316", desc: "International air law, Chicago convention, bilateral agreements." },
];

export default function SubjectsPage() {
  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
               style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff" }}>
            <BookOpen className="w-4 h-4" /> All DGCA Subjects
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Choose Your <span className="gradient-text">Subject</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#94a3b8" }}>
            10,000+ questions across 8 DGCA CPL subjects. Practice, revise, and track your progress.
          </p>
        </div>

        {/* Subject grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(s => (
            <Link key={s.slug} href={`/subjects/${s.slug}`}
                  className="glass-card p-6 no-underline flex flex-col gap-4 group">
              <div className="flex items-start justify-between">
                <span className="text-4xl">{s.icon}</span>
                <span className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ background: `${s.color}22`, color: s.color }}>
                  {s.questions.toLocaleString()} Qs
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold mb-2" style={{ color: "#fff" }}>{s.name}</h2>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{s.desc}</p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-2"
                   style={{ borderTop: "1px solid rgba(0,212,255,0.1)" }}>
                <span className="text-xs" style={{ color: "#475569" }}>{s.topics} topics</span>
                <span className="flex items-center gap-1 text-sm font-medium" style={{ color: s.color }}>
                  Start <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
