"use client";

import Link from "next/link";
import { ChevronRight, ChevronLeft } from "lucide-react";
import type { Subject, Chapter } from "@/lib/subjects";
import Watermark from "@/app/components/Watermark";

type Props = {
  track: "cpl" | "atpl";
  subject: Subject;
  chapter: Chapter;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
  src: string;
};

export default function SlidesPage({ track, subject, chapter, prevChapter, nextChapter, src }: Props) {
  return (
    <div style={{ background: "#06040e" }} className="min-h-screen flex flex-col">
      <Watermark />

      {/* Header */}
      <div className="relative flex-shrink-0" style={{ borderBottom: `1px solid ${subject.color}25` }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${subject.color}12 0%, transparent 65%)` }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs mb-4 flex-wrap" style={{ color: "#475569" }}>
            <Link href="/" className="no-underline hover:text-white transition-colors" style={{ color: "#475569" }}>Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${track}`} className="no-underline hover:text-white transition-colors uppercase" style={{ color: "#475569" }}>{track}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${track}/${subject.id}`} className="no-underline hover:text-white transition-colors" style={{ color: "#475569" }}>{subject.shortName}</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: "#94a3b8" }}>Ch.{chapter.number} — Slides</span>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black flex-shrink-0"
                   style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}40`, color: subject.color }}>
                {chapter.number}
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest mb-0.5"
                     style={{ color: subject.color, letterSpacing: "0.18em" }}>
                  {subject.shortName.toUpperCase()} — CHAPTER {chapter.number} · SLIDES
                </div>
                <h1 className="text-xl font-black text-white">{chapter.title}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-4">
        <div className="rounded-2xl overflow-hidden flex-1"
             style={{ border: `1px solid ${subject.color}25`, minHeight: "75vh" }}>
          <iframe
            src={`${src}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full h-full"
            style={{ minHeight: "75vh", background: "#1a1a2e" }}
            title={`${chapter.title} — Slides`}
          />
        </div>

        {/* Chapter navigation */}
        <div className="flex items-center justify-between gap-4 mt-2">
          {prevChapter ? (
            <Link href={`/${track}/${subject.id}/${prevChapter.id}/slides`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl no-underline min-w-0"
                  style={{ background: "rgba(15,8,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
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
            <Link href={`/${track}/${subject.id}/${nextChapter.id}/slides`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl no-underline min-w-0"
                  style={{ background: "rgba(15,8,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
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
