import Link from "next/link";
import { FileText, Download, ArrowRight } from "lucide-react";

const notes = [
  {
    subject: "Air Regulations",
    slug: "air-regulations",
    icon: "⚖️",
    color: "#7c3aed",
    topics: [
      { title: "DGCA CAR Overview & Licensing", pages: 12 },
      { title: "Airspace Classification in India", pages: 8 },
      { title: "Air Navigation Orders (ANO)", pages: 15 },
      { title: "Rules of the Air — ICAO Annex 2", pages: 10 },
    ],
  },
  {
    subject: "Aviation Meteorology",
    slug: "meteorology",
    icon: "🌤️",
    color: "#0ea5e9",
    topics: [
      { title: "Atmosphere & Standard Atmosphere", pages: 10 },
      { title: "Clouds — Types, Formation, Levels", pages: 14 },
      { title: "METAR & TAF Decoding", pages: 8 },
      { title: "Thunderstorms, Icing & Turbulence", pages: 12 },
    ],
  },
  {
    subject: "General Navigation",
    slug: "general-navigation",
    icon: "🗺️",
    color: "#10b981",
    topics: [
      { title: "Earth & Coordinate Systems", pages: 9 },
      { title: "Map Projections & Charts", pages: 11 },
      { title: "Dead Reckoning & Wind Triangle", pages: 13 },
      { title: "Radio Navigation — VOR, NDB, GPS", pages: 10 },
    ],
  },
  {
    subject: "Technical General",
    slug: "technical-general",
    icon: "⚙️",
    color: "#f59e0b",
    topics: [
      { title: "Piston Engines — Theory & Systems", pages: 16 },
      { title: "Turbine Engines — Jet & Turboprop", pages: 14 },
      { title: "Hydraulic & Electrical Systems", pages: 10 },
      { title: "Pressurisation & Air Conditioning", pages: 8 },
    ],
  },
  {
    subject: "Radio Aids & Instruments",
    slug: "radio-aids",
    icon: "📡",
    color: "#ef4444",
    topics: [
      { title: "Pitot-Static Instruments", pages: 11 },
      { title: "Gyroscopic Instruments", pages: 9 },
      { title: "ILS, VOR & DME Systems", pages: 13 },
      { title: "Altimeter Errors & Settings", pages: 7 },
    ],
  },
  {
    subject: "Performance",
    slug: "performance",
    icon: "📈",
    color: "#8b5cf6",
    topics: [
      { title: "V-Speeds & Takeoff Performance", pages: 10 },
      { title: "Landing Performance & Charts", pages: 9 },
      { title: "Climb & Cruise Performance", pages: 11 },
      { title: "Density Altitude & Effect on Performance", pages: 7 },
    ],
  },
];

export default function NotesPage() {
  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
               style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff" }}>
            <FileText className="w-4 h-4" /> Study Notes
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Concise <span className="gradient-text">DGCA Notes</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: "#94a3b8" }}>
            Written by CPL holders. Perfect for quick revision before your exam.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {notes.map(n => (
            <div key={n.slug} className="glass-card p-6">
              {/* Subject header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{n.icon}</span>
                  <h2 className="text-xl font-bold">{n.subject}</h2>
                </div>
                <Link href={`/notes/${n.slug}`}
                      className="flex items-center gap-1 text-sm font-medium no-underline"
                      style={{ color: n.color }}>
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Topics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {n.topics.map(t => (
                  <div key={t.title} className="p-4 rounded-xl flex flex-col gap-3"
                       style={{ background: "rgba(5,5,16,0.6)", border: "1px solid rgba(0,212,255,0.1)" }}>
                    <p className="text-sm font-medium leading-snug" style={{ color: "#e2e8f0" }}>{t.title}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs" style={{ color: "#475569" }}>{t.pages} pages</span>
                      <button className="flex items-center gap-1 text-xs font-medium"
                              style={{ color: n.color, background: "none", border: "none", cursor: "pointer" }}>
                        <Download className="w-3 h-3" /> Read
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
