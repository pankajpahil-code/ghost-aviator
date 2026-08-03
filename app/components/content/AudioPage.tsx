"use client";

import Link from "next/link";
import { ChevronRight, ChevronLeft, BookOpen, ListChecks } from "lucide-react";
import type { Subject, Chapter } from "@/lib/subjects";
import Watermark from "@/app/components/Watermark";

type Props = {
  track: "cpl" | "atpl";
  subject: Subject;
  chapter: Chapter;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
  src: string;
  title?: string;
};

export default function AudioPage({ track, subject, chapter, prevChapter, nextChapter, src, title }: Props) {
  const audioTitle = title ?? `Chapter ${chapter.number} — ${chapter.title}`;

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
            <span style={{ color: "#94a3b8" }}>Ch.{chapter.number} — Audio</span>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
                 style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}40`, color: subject.color }}>
              {chapter.number}
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest mb-1"
                   style={{ color: subject.color, letterSpacing: "0.18em" }}>
                {subject.shortName.toUpperCase()} — CHAPTER {chapter.number} · AUDIO OVERVIEW
              </div>
              <h1 className="text-3xl font-black text-white">{chapter.title}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Player card */}
        <div className="rounded-2xl p-8 mb-8"
             style={{ background: "rgba(17,24,32,0.95)", border: `1px solid ${subject.color}30` }}>

          {/* Track info */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                 style={{ background: `${subject.color}15`, border: `1px solid ${subject.color}30` }}>
              🎧
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest mb-1"
                 style={{ color: subject.color, letterSpacing: "0.15em" }}>
                AUDIO OVERVIEW
              </p>
              <h2 className="text-lg font-black text-white leading-tight">{audioTitle}</h2>
              <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                by Capt. Pankaj Pahil · {subject.shortName} {track.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Native audio player */}
          <audio
            controls
            controlsList="nodownload noplaybackrate noremoteplayback"
            onContextMenu={(e) => e.preventDefault()}
            className="w-full"
            style={{ borderRadius: "12px", outline: "none" }}
            preload="metadata"
          >
            <source src={src} type="audio/mp4" />
            <source src={src} type="audio/x-m4a" />
            Your browser does not support the audio element.
          </audio>
        </div>

        {/* Listening tips */}
        <div className="rounded-2xl p-5 mb-8"
             style={{ background: "rgba(17,24,32,0.8)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: "#475569", letterSpacing: "0.15em" }}>
            LISTENING TIPS
          </p>
          <ul className="flex flex-col gap-2">
            {[
              "Listen once for an overview, then again while following the chapter notes.",
              "Pause and replay any section you find tricky — don't rush.",
              "Ideal for revision during commute or before sleep.",
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "#64748b" }}>
                <span style={{ color: subject.color }}>›</span> {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Cross-links */}
        <div className="flex flex-col gap-3 mb-10">
          <p className="text-xs font-bold tracking-widest" style={{ color: "#475569", letterSpacing: "0.15em" }}>
            STUDY THIS CHAPTER
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${track}/${subject.id}/${chapter.id}/notes`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl no-underline text-sm font-bold"
                  style={{ background: `${subject.color}12`, border: `1px solid ${subject.color}30`, color: subject.color }}>
              <BookOpen className="w-4 h-4" /> Read Notes
            </Link>
            <Link href={`/${track}/${subject.id}/${chapter.id}/slides`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl no-underline text-sm font-bold"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
              📊 View Slides
            </Link>
            <Link href={`/${track}/${subject.id}/${chapter.id}/chapter-quiz`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl no-underline text-sm font-bold"
                  style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316" }}>
              <ListChecks className="w-4 h-4" /> Chapter Quiz
            </Link>
          </div>
        </div>

        {/* Chapter navigation */}
        <div className="flex items-center justify-between gap-4">
          {prevChapter ? (
            <Link href={`/${track}/${subject.id}/${prevChapter.id}/audio`}
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
            <Link href={`/${track}/${subject.id}/${nextChapter.id}/audio`}
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
