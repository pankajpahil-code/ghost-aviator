import { notFound } from "next/navigation";
import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { ATPL_SUBJECTS } from "@/lib/subjects";
import { getQuestionsForChapter } from "@/lib/questions";
import { getChapterVideos } from "@/lib/chapter-videos";
import { chapterMetaDescription } from "@/lib/chapter-meta";
import { getInlineNotes } from "@/lib/notes-inline";
import NotesPage       from "@/app/components/content/NotesPage";
import HtmlNotesPage   from "@/app/components/content/HtmlNotesPage";
import QuestionsPage   from "@/app/components/content/QuestionsPage";
import ChapterTestPage from "@/app/components/content/ChapterTestPage";
import ChapterQuizPage from "@/app/components/content/ChapterQuizPage";
import VideoPage       from "@/app/components/content/VideoPage";
import ComingSoonPage  from "@/app/components/content/ComingSoonPage";

const VALID_TYPES = ["notes", "slides", "video", "audio", "questions", "mock-test", "chapter-quiz"] as const;

export function generateStaticParams() {
  return ATPL_SUBJECTS.flatMap(s =>
    s.chapters.flatMap(ch =>
      VALID_TYPES.map(type => ({ subject: s.id, chapter: ch.id, type })),
    ),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string; chapter: string; type: string }>;
}): Promise<Metadata> {
  const { subject: subjectId, chapter: chapterId, type } = await params;
  const subject = ATPL_SUBJECTS.find(s => s.id === subjectId);
  const chapter = subject?.chapters.find(c => c.id === chapterId);
  if (!subject || !chapter) return {};
  const label = type === "mock-test" ? "Chapter Test"
    : type.charAt(0).toUpperCase() + type.slice(1);
  return {
    title: `Ch.${chapter.number} ${chapter.title} — ${label} | ${subject.shortName} ATPL | Ghost Aviator`,
    description: chapterMetaDescription(
      "atpl", subject, chapter, type, getQuestionsForChapter(subject.id, chapter.id).length,
    ),
    alternates: { canonical: `/atpl/${subject.id}/${chapter.id}/${type}` },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ subject: string; chapter: string; type: string }>;
}) {
  const { subject: subjectId, chapter: chapterId, type } = await params;

  if (!VALID_TYPES.includes(type as typeof VALID_TYPES[number])) notFound();

  const subject = ATPL_SUBJECTS.find(s => s.id === subjectId);
  if (!subject) notFound();

  const chapterIdx = subject.chapters.findIndex(c => c.id === chapterId);
  if (chapterIdx === -1) notFound();

  const chapter     = subject.chapters[chapterIdx];
  const prevChapter = chapterIdx > 0 ? subject.chapters[chapterIdx - 1] : null;
  const nextChapter = chapterIdx < subject.chapters.length - 1 ? subject.chapters[chapterIdx + 1] : null;

  const questions = getQuestionsForChapter(subject.id, chapter.id);

  if (type === "notes") {
    // Human Performance & Limitations book: auto-serve HTML notes whenever
    // notes.html has been published to public/content/, same pattern as the
    // CPL instrumentation/radio-telephony/radio-navigation/technical-general subjects.
    if (subject.id === "human-performance") {
      const notesFile = path.join(process.cwd(), "public", "content", subject.id, chapter.id, "notes.html");
      const inlineNotes = fs.existsSync(notesFile) ? getInlineNotes(subject.id, chapter.id) : null;
      if (inlineNotes) {
        return (
          <HtmlNotesPage
            track="atpl"
            subject={subject}
            chapter={chapter}
            prevChapter={prevChapter}
            nextChapter={nextChapter}
            notes={inlineNotes}
            videos={getChapterVideos(subject.id, chapter.id)}
          />
        );
      }
    }
    return (
      <NotesPage
        track="atpl"
        subject={subject}
        chapter={chapter}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
      />
    );
  }

  if (type === "questions") {
    return (
      <QuestionsPage
        track="atpl"
        subject={subject}
        chapter={chapter}
        questions={questions}
      />
    );
  }

  if (type === "mock-test") {
    return (
      <ChapterTestPage
        track="atpl"
        subject={subject}
        chapter={chapter}
        questions={questions}
      />
    );
  }

  if (type === "chapter-quiz") {
    return (
      <ChapterQuizPage
        track="atpl"
        subject={subject}
        chapter={chapter}
        questions={questions}
      />
    );
  }

  if (type === "video") {
    // Same rule as the CPL route: a mapping in lib/chapter-videos.ts IS the
    // availability — one line there lights up the route and the sitemap.
    const videos = getChapterVideos(subject.id, chapter.id);
    if (videos.length > 0) {
      return (
        <VideoPage
          track="atpl"
          subject={subject}
          chapter={chapter}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          videos={videos}
        />
      );
    }
  }

  return (
    <ComingSoonPage
      track="atpl"
      subject={subject}
      chapter={chapter}
      type={type}
    />
  );
}
