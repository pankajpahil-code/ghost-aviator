"use client";

import Link from "next/link";
import { ChevronRight, ChevronLeft, BookOpen, ListChecks, HelpCircle } from "lucide-react";
import type { Subject, Chapter } from "@/lib/subjects";
import type { ChapterVideo } from "@/lib/chapter-videos";
import VideoLectureCard from "@/app/components/content/VideoLectureCard";

/** One lecture part, with the runtime read off YouTube (null when unknown). */
export type LecturePart = { id: string; label: string; minutes: number | null };

type Props = {
  track: "cpl" | "atpl";
  subject: Subject;
  chapter: Chapter;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
  videos: ChapterVideo[];
  /** Computed server-side from lib/generated/video-metadata.ts. */
  parts?: LecturePart[];
  /** Whether this chapter's notes and question bank actually exist. */
  hasNotes?: boolean;
  hasQuestions?: boolean;
};

export default function VideoPage({
  track, subject, chapter, prevChapter, nextChapter, videos,
  parts = [], hasNotes = true, hasQuestions = true,
}: Props) {
  const totalMinutes = parts.reduce((sum, p) => sum + (p.minutes ?? 0), 0);
  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen">

      {/* Header */}
      <div className="relative" style={{ borderBottom: `1px solid ${subject.color}25` }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${subject.color}12 0%, transparent 65%)` }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">

          <div className="flex items-center gap-1.5 text-xs mb-4 flex-wrap" style={{ color: "#475569" }}>
            <Link href="/" className="no-underline hover:text-white transition-colors" style={{ color: "#475569" }}>Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${track}`} className="no-underline hover:text-white transition-colors uppercase" style={{ color: "#475569" }}>{track}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${track}/${subject.id}`} className="no-underline hover:text-white transition-colors" style={{ color: "#475569" }}>{subject.shortName}</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: "#94a3b8" }}>Ch.{chapter.number} — Video</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black flex-shrink-0"
                 style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}40`, color: subject.color }}>
              {chapter.number}
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest mb-0.5"
                   style={{ color: subject.color, letterSpacing: "0.18em" }}>
                {subject.shortName.toUpperCase()} — CHAPTER {chapter.number} · VIDEO LECTURE
              </div>
              <h1 className="text-xl font-black text-white">{chapter.title}</h1>
              <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>by Capt. Pankaj Pahil</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Lecture player — same component the notes page uses, so multi-part
            series and the click-to-load behaviour stay identical everywhere. */}
        <div className="mb-6">
          <VideoLectureCard videos={videos} title={chapter.title} color={subject.color} />
        </div>

        {/* What the lecture covers.
            This page used to be a player and a row of buttons — 63 words of
            server-rendered text, on 140 URLs. The chapter's syllabus coverage
            was already written in lib/subjects.ts and shown on every other
            surface but this one, which is the page a student most needs it on:
            it is what tells them whether this lecture is the one they need
            before they spend twenty minutes watching it. */}
        <div className="rounded-2xl p-5 mb-6"
             style={{ background: "rgba(17,24,32,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 className="text-sm font-black mb-2" style={{ color: subject.color, letterSpacing: "0.06em" }}>
            WHAT THIS LECTURE COVERS
          </h2>
          <p className="text-sm leading-relaxed mb-0" style={{ color: "#94a3b8" }}>
            {chapter.description}
          </p>
          <p className="text-xs mt-3 mb-0" style={{ color: "#64748b" }}>
            Chapter {chapter.number} of the DGCA {track.toUpperCase()} {subject.name} syllabus
            {totalMinutes > 0 && ` · ${totalMinutes} min of lecture`}
            {parts.length > 1 && ` across ${parts.length} parts`}
            {" · free, no sign-up."}
          </p>
        </div>

        {/* Lecture parts. Only worth listing when the chapter is taught across
            more than one video — with a single part the player above says it. */}
        {parts.length > 1 && (
          <div className="rounded-2xl p-5 mb-6"
               style={{ background: "rgba(17,24,32,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 className="text-sm font-black mb-3" style={{ color: subject.color, letterSpacing: "0.06em" }}>
              LECTURE PARTS
            </h2>
            <ol className="m-0 pl-5 space-y-1.5">
              {parts.map(p => (
                <li key={p.id} className="text-sm" style={{ color: "#94a3b8" }}>
                  {p.label}
                  {p.minutes !== null && (
                    <span className="text-xs ml-2" style={{ color: "#475569" }}>{p.minutes} min</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Cross-links. Notes and Practice Questions are shown only when the
            chapter actually has them — an inviting button that lands on "being
            prepared" costs more trust than a missing button does. */}
        <div className="flex flex-wrap gap-3 mb-10">
          {hasNotes && (
            <Link href={`/${track}/${subject.id}/${chapter.id}/notes`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl no-underline text-sm font-bold"
                  style={{ background: `${subject.color}12`, border: `1px solid ${subject.color}30`, color: subject.color }}>
              <BookOpen className="w-4 h-4" /> Read Notes
            </Link>
          )}
          {hasQuestions && (
            <Link href={`/${track}/${subject.id}/${chapter.id}/questions`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl no-underline text-sm font-bold"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981" }}>
              <HelpCircle className="w-4 h-4" /> Practice Questions
            </Link>
          )}
          <Link href={`/${track}/${subject.id}/${chapter.id}/chapter-quiz`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl no-underline text-sm font-bold"
                style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316" }}>
            <ListChecks className="w-4 h-4" /> Chapter Quiz
          </Link>
        </div>

        {/* Chapter navigation */}
        <div className="flex items-center justify-between gap-4">
          {prevChapter ? (
            <Link href={`/${track}/${subject.id}/${prevChapter.id}/video`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl no-underline min-w-0"
                  style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs" style={{ color: "#475569" }}>Previous</div>
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
            <Link href={`/${track}/${subject.id}/${nextChapter.id}/video`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl no-underline min-w-0"
                  style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
              <div className="text-right min-w-0">
                <div className="text-xs" style={{ color: "#475569" }}>Next</div>
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
