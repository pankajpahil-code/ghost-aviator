import Link from "next/link";
import { BookOpen, ListChecks, ChevronRight } from "lucide-react";
import type { Subject, Chapter } from "@/lib/subjects";

const TYPE_INFO: Record<string, { icon: string; title: string; desc: string; eta: string }> = {
  video: {
    icon: "🎥",
    title: "Video Lecture",
    desc: "Full-length video explanation by Capt. Pankaj Pahil, walking through every topic in this chapter with real-world cockpit examples.",
    eta: "In Production",
  },
};

type Props = {
  track: "cpl" | "atpl";
  subject: Subject;
  chapter: Chapter;
  type: string;
};

export default function ComingSoonPage({ track, subject, chapter, type }: Props) {
  const info = TYPE_INFO[type] ?? {
    icon: "🔒",
    title: type.charAt(0).toUpperCase() + type.slice(1),
    desc: "This content is being prepared.",
    eta: "Coming Soon",
  };

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen">

      {/* Header */}
      <div className="relative" style={{ borderBottom: `1px solid ${subject.color}25` }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${subject.color}10 0%, transparent 65%)` }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex items-center gap-1.5 text-xs mb-6 flex-wrap" style={{ color: "#475569" }}>
            <Link href="/" className="no-underline" style={{ color: "#475569" }}>Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${track}`} className="no-underline uppercase" style={{ color: "#475569" }}>{track}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${track}/${subject.id}`} className="no-underline" style={{ color: "#475569" }}>{subject.shortName}</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: "#94a3b8" }}>Ch.{chapter.number} — {info.title}</span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
                 style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}40`, color: subject.color }}>
              {chapter.number}
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest mb-1"
                   style={{ color: subject.color, letterSpacing: "0.18em" }}>
                {subject.shortName.toUpperCase()} — CHAPTER {chapter.number}
              </div>
              <h1 className="text-3xl font-black text-white">{chapter.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center text-center">
        <div className="text-6xl mb-5">{info.icon}</div>
        <div className="inline-block text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-5"
             style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316", letterSpacing: "0.18em" }}>
          {info.eta.toUpperCase()}
        </div>
        <h2 className="text-3xl font-black text-white mb-3">{info.title} — Ch.{chapter.number}</h2>
        <p className="text-base max-w-lg mb-12 leading-relaxed" style={{ color: "#64748b" }}>{info.desc}</p>

        <div className="w-full max-w-sm">
          <p className="text-sm font-bold mb-4" style={{ color: "#475569" }}>Try these in the meantime:</p>
          <div className="flex flex-col gap-3">
            <Link href={`/${track}/${subject.id}/${chapter.id}/notes`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl no-underline"
                  style={{ background: "rgba(171,121,77,0.1)", border: "1px solid rgba(171,121,77,0.3)", color: "#f3c889" }}>
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-bold">Read Chapter Notes</span>
            </Link>
            <Link href={`/${track}/${subject.id}/${chapter.id}/chapter-quiz`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl no-underline"
                  style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316" }}>
              <ListChecks className="w-4 h-4" />
              <span className="text-sm font-bold">Take Chapter Quiz</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
