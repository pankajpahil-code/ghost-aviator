import Link from "next/link";
import { ChevronRight, ChevronLeft, Clock, BookOpen, ListChecks } from "lucide-react";
import type { Subject, Chapter } from "@/lib/subjects";
import Watermark from "@/app/components/Watermark";
import VideoLectureCard from "@/app/components/content/VideoLectureCard";
import type { ChapterVideo } from "@/lib/chapter-videos";

function parseDescription(desc: string): Array<{ heading: string; topics: string[] }> {
  const sentences = desc.split(/\.\s+/).filter(Boolean);

  if (sentences.length <= 1) {
    const topics = desc.replace(/\.$/, "").split(",").map(t => t.trim()).filter(Boolean);
    return [{ heading: "", topics }];
  }

  return sentences.map(s => {
    const clean = s.replace(/\.$/, "").trim();
    const colonIdx = clean.indexOf(": ");
    if (colonIdx !== -1) {
      return {
        heading: clean.substring(0, colonIdx),
        topics: clean.substring(colonIdx + 2).split(",").map(t => t.trim()).filter(Boolean),
      };
    }
    return {
      heading: "",
      topics: clean.split(",").map(t => t.trim()).filter(Boolean),
    };
  }).filter(s => s.topics.length > 0);
}

type Props = {
  track: "cpl" | "atpl";
  subject: Subject;
  chapter: Chapter;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
  /** The Captain's lecture(s) for this chapter — card renders above the notes
   *  when non-empty, exactly as it does on HtmlNotesPage. A chapter that has a
   *  lecture but no written notes yet is the case that most needs it. */
  videos?: ChapterVideo[];
};

export default function NotesPage({ track, subject, chapter, prevChapter, nextChapter, videos }: Props) {
  const sections = parseDescription(chapter.description);
  const topicCount = sections.reduce((n, s) => n + s.topics.length, 0);

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen">
      <Watermark />

      {/* Header */}
      <div className="relative" style={{ borderBottom: `1px solid ${subject.color}25` }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${subject.color}12 0%, transparent 65%)` }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs mb-6 flex-wrap" style={{ color: "#475569" }}>
            <Link href="/" className="no-underline hover:text-white transition-colors" style={{ color: "#475569" }}>Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${track}`} className="no-underline hover:text-white transition-colors uppercase" style={{ color: "#475569" }}>{track}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${track}/${subject.id}`} className="no-underline hover:text-white transition-colors" style={{ color: "#475569" }}>{subject.shortName}</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: "#94a3b8" }}>Ch.{chapter.number} Notes</span>
          </div>

          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
                 style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}40`, color: subject.color }}>
              {chapter.number}
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest mb-1"
                   style={{ color: subject.color, letterSpacing: "0.18em" }}>
                {subject.shortName.toUpperCase()} — CHAPTER {chapter.number}
              </div>
              <h1 className="text-3xl font-black text-white mb-1">{chapter.title}</h1>
            </div>
          </div>

          {/* Quick stats + jump links */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-3 py-1 rounded-full"
                  style={{ background: `${subject.color}18`, border: `1px solid ${subject.color}35`, color: subject.color }}>
              📄 Notes
            </span>
            <span className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
              <Clock className="w-3 h-3" /> {chapter.duration}
            </span>
            <span className="text-xs px-3 py-1 rounded-full"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
              {topicCount} topics
            </span>
            <Link href={`/${track}/${subject.id}/${chapter.id}/chapter-quiz`}
                  className="text-xs px-3 py-1 rounded-full no-underline flex items-center gap-1"
                  style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316" }}>
              <ListChecks className="w-3 h-3" /> Chapter Quiz
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Lecture first, then the chapter — watch it, then read it. */}
        {videos && videos.length > 0 && (
          <div className="mb-8">
            <VideoLectureCard videos={videos} title={chapter.title} color={subject.color} />
          </div>
        )}

        {/* Syllabus overview */}
        <div className="rounded-2xl p-5 mb-8"
             style={{ background: "rgba(17,24,32,0.95)", border: `1px solid ${subject.color}30` }}>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4" style={{ color: subject.color }} />
            <span className="text-sm font-bold" style={{ color: subject.color }}>DGCA Syllabus — What to Know</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{chapter.description}</p>
        </div>

        {/* Topics */}
        <h2 className="text-xl font-black text-white mb-5">Topics in this Chapter</h2>
        <div className="flex flex-col gap-4 mb-10">
          {sections.map((sec, i) => (
            <div key={i} className="rounded-2xl p-5"
                 style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.07)" }}>
              {sec.heading && (
                <div className="text-sm font-bold mb-3" style={{ color: subject.color }}>{sec.heading}</div>
              )}
              <div className="flex flex-wrap gap-2">
                {sec.topics.map((topic, j) => (
                  <span key={j} className="text-xs px-3 py-1.5 rounded-lg"
                        style={{ background: `${subject.color}10`, border: `1px solid ${subject.color}22`, color: "#94a3b8" }}>
                    {topic.trim()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Full notes callout */}
        <div className="rounded-2xl p-8 mb-10 text-center"
             style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-lg font-black text-white mb-2">Detailed Notes Being Prepared</h3>
          <p className="text-sm max-w-md mx-auto mb-6" style={{ color: "#64748b" }}>
            Full chapter notes with diagrams, mnemonics, and exam-focused explanations are being written by Capt. Pankaj Pahil.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href={`/${track}/${subject.id}/${chapter.id}/chapter-quiz`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold no-underline"
                  style={{ background: "rgba(249,115,22,0.15)", border: "1px solid rgba(249,115,22,0.35)", color: "#f97316" }}>
              <ListChecks className="w-4 h-4" /> Take Chapter Quiz
            </Link>
          </div>
        </div>

        {/* Prev / Subject / Next navigation */}
        <div className="flex items-center justify-between gap-4">
          {prevChapter ? (
            <Link href={`/${track}/${subject.id}/${prevChapter.id}/notes`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl no-underline min-w-0"
                  style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs truncate" style={{ color: "#475569" }}>Previous</div>
                <div className="text-sm font-semibold truncate">Ch.{prevChapter.number}: {prevChapter.title}</div>
              </div>
            </Link>
          ) : <div />}

          <Link href={`/${track}/${subject.id}`}
                className="text-sm font-bold no-underline px-4 py-2 rounded-xl whitespace-nowrap flex-shrink-0"
                style={{ color: subject.color, border: `1px solid ${subject.color}30`, background: `${subject.color}10` }}>
            ↑ All Chapters
          </Link>

          {nextChapter ? (
            <Link href={`/${track}/${subject.id}/${nextChapter.id}/notes`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl no-underline min-w-0"
                  style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
              <div className="text-right min-w-0">
                <div className="text-xs truncate" style={{ color: "#475569" }}>Next</div>
                <div className="text-sm font-semibold truncate">Ch.{nextChapter.number}: {nextChapter.title}</div>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          ) : <div />}
        </div>

      </div>
    </div>
  );
}
