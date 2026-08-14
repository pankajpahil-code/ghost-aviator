import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ATPL_SUBJECTS } from "@/lib/subjects";
import { getQuestionsForChapter, getChapterSpecificQuestions } from "@/lib/questions";
import { getChapterVideos } from "@/lib/chapter-videos";
import { chapterMetaDescription, chapterTitle } from "@/lib/chapter-meta";
import { isIndexableChapterRoute, servesRealNotes, adjacentWithContent, NOINDEX } from "@/lib/indexability";
import { getInlineNotes } from "@/lib/notes-inline";
import { videoObjectsFor, lecturePartsFor } from "@/lib/video-schema";
import NotesPage       from "@/app/components/content/NotesPage";
import HtmlNotesPage   from "@/app/components/content/HtmlNotesPage";
import QuestionsPage   from "@/app/components/content/QuestionsPage";
import ChapterTestPage from "@/app/components/content/ChapterTestPage";
import ChapterQuizPage from "@/app/components/content/ChapterQuizPage";
import VideoPage       from "@/app/components/content/VideoPage";
import ComingSoonPage  from "@/app/components/content/ComingSoonPage";

// "slides" and "audio" were retired 2026-08-13 — see the CPL route for why.
const VALID_TYPES = ["notes", "video", "questions", "mock-test", "chapter-quiz"] as const;

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
  return {
    title: chapterTitle("atpl", subject, chapter, type),
    description: chapterMetaDescription(
      "atpl", subject, chapter, type, getQuestionsForChapter(subject.id, chapter.id).length,
    ),
    alternates: { canonical: `/atpl/${subject.id}/${chapter.id}/${type}` },
    // See the CPL route and lib/indexability.ts: a stub or a drill asks not to
    // be indexed. On the ATPL side this covers most of the track — 40 of its 68
    // chapters have no notes published yet, and every one of them was an
    // indexable page saying so.
    ...(isIndexableChapterRoute(subject.id, chapter.id, type) ? {} : NOINDEX),
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

  const chapter = subject.chapters[chapterIdx];

  // Skip to the nearest chapter that has this route's content — see the CPL
  // route and adjacentWithContent. This matters more here: 40 of the ATPL
  // track's 68 chapters have no notes yet, so plain adjacency sent a reader
  // straight into a stub most of the time.
  const skips = type === "notes" || type === "video" || type === "questions";
  const { prev, next } = skips
    ? adjacentWithContent(subject.chapters, subject.id, chapterIdx, type as "notes")
    : { prev: chapterIdx - 1, next: chapterIdx + 1 };
  const prevChapter = prev >= 0 ? subject.chapters[prev] : null;
  const nextChapter = next >= 0 && next < subject.chapters.length ? subject.chapters[next] : null;

  const questions = getQuestionsForChapter(subject.id, chapter.id);

  if (type === "notes") {
    // Same predicate as the sitemap and this route's robots tag — see
    // lib/indexability.ts. Human Performance chapters serve inline notes as soon
    // as notes.html is published; the other ATPL subjects have none yet.
    const inlineNotes = servesRealNotes(subject.id, chapter.id)
      ? getInlineNotes(subject.id, chapter.id)
      : null;
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
    return (
      <NotesPage
        track="atpl"
        subject={subject}
        chapter={chapter}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
        videos={getChapterVideos(subject.id, chapter.id)}
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
        chapterSpecific={getChapterSpecificQuestions(subject.id, chapter.id).length > 0}
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
      const videoNodes = videoObjectsFor("atpl", subject.id, chapter.id, chapter.title, videos);
      return (
        <>
          {videoNodes.length > 0 && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": videoNodes,
              }) }}
            />
          )}
          <VideoPage
            track="atpl"
            subject={subject}
            chapter={chapter}
            prevChapter={prevChapter}
            nextChapter={nextChapter}
            videos={videos}
            parts={lecturePartsFor(videos)}
            hasNotes={servesRealNotes(subject.id, chapter.id)}
            hasQuestions={getChapterSpecificQuestions(subject.id, chapter.id).length > 0}
          />
        </>
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
