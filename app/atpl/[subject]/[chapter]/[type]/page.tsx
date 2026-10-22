import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ATPL_TO_CPL } from "@/lib/atpl-syllabus";
import { ATPL_SUBJECTS, getNotesSource } from "@/lib/subjects";
import { getQuestionsForChapter, getChapterSpecificQuestions } from "@/lib/questions";
import { getChapterVideos } from "@/lib/chapter-videos";
import { chapterMetaDescription, chapterTitle } from "@/lib/chapter-meta";
import { isIndexableChapterRoute, servesRealNotes, adjacentWithContent, NOINDEX } from "@/lib/indexability";
import { getInlineNotes } from "@/lib/notes-inline";
import { openerFactsFor } from "@/lib/opener-key-facts";
import { videoObjectsFor, lecturePartsFor, isWatchPage } from "@/lib/video-schema";
import NotesPage       from "@/app/components/content/NotesPage";
import HtmlNotesPage   from "@/app/components/content/HtmlNotesPage";
import AirRegsChapter1Notes from "@/app/components/content/AirRegsChapter1Notes";
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
      ["notes", "video"].filter(type => type === "notes" ? servesRealNotes(s.id, ch.id) : getChapterVideos(s.id,ch.id).length > 0).map(type => ({ subject: s.id, chapter: ch.id, type })),
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
    alternates: { canonical: type === "notes" ? `/cpl/${getNotesSource(subject.id, chapter.id).subjectId}/${getNotesSource(subject.id, chapter.id).chapterId}/notes` : `/atpl/${subject.id}/${chapter.id}/${type}` },
    // Shared notes retain their source canonical; drills and stubs stay noindex.
    ...(isIndexableChapterRoute(subject.id, chapter.id, type) ? {} : NOINDEX),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ subject: string; chapter: string; type: string }>;
}) {
  const { subject: subjectId, chapter: chapterId, type } = await params;

  if (["questions", "chapter-quiz", "mock-test"].includes(type) && ATPL_TO_CPL[subjectId]) {
    redirect(`/cpl/${ATPL_TO_CPL[subjectId]}`);
  }
  if (!VALID_TYPES.includes(type as typeof VALID_TYPES[number])) notFound();

  const subject = ATPL_SUBJECTS.find(s => s.id === subjectId);
  if (!subject) notFound();

  const chapterIdx = subject.chapters.findIndex(c => c.id === chapterId);
  if (chapterIdx === -1) notFound();

  const chapter = subject.chapters[chapterIdx];

  // Walk the topic order, skipping legacy chapters without this content type.
  const skips = type === "notes" || type === "video" || type === "questions";
  const { prev, next } = skips
    ? adjacentWithContent(subject.chapters, subject.id, chapterIdx, type as "notes")
    : { prev: chapterIdx - 1, next: chapterIdx + 1 };
  const prevChapter = prev >= 0 ? subject.chapters[prev] : null;
  const nextChapter = next >= 0 && next < subject.chapters.length ? subject.chapters[next] : null;

  const questions = getQuestionsForChapter(subject.id, chapter.id);

  // The lecture's schema goes only on /video — that is the watch page
  // (lib/video-schema.ts). Notes may still embed VideoLectureCard for students,
  // but must not claim VideoObject / video sitemap entries.
  const chapterVideos = getChapterVideos(subject.id, chapter.id);
  const watchNodes = isWatchPage("atpl", subject.id, chapter.id, type)
    ? videoObjectsFor("atpl", subject.id, chapter.id, chapter.title, chapterVideos)
    : [];
  const videoLdScript = watchNodes.length > 0 ? (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": watchNodes,
      }) }}
    />
  ) : null;

  if (type === "notes") {
    const source = getNotesSource(subject.id, chapter.id);
    if (source.subjectId === "air-regulations" && source.chapterId === "ar-1") {
      return <AirRegsChapter1Notes track="atpl" subject={subject} chapter={chapter}
        prevChapter={prevChapter} nextChapter={nextChapter} videos={chapterVideos} />;
    }
    // Reuse the same authored teaching and renderer in either study track.
    const inlineNotes = servesRealNotes(subject.id, chapter.id)
      ? getInlineNotes(subject.id, chapter.id)
      : null;
    if (inlineNotes) {
      return (
        <>
          {videoLdScript}
          <HtmlNotesPage
            track="atpl"
            subject={subject}
            chapter={chapter}
            prevChapter={prevChapter}
            nextChapter={nextChapter}
            notes={inlineNotes}
            videos={chapterVideos}
            openerFacts={openerFactsFor(subject.id, chapter.id)}
          />
        </>
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
        hasNotes={servesRealNotes(subject.id, chapter.id)}
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
        chapterSpecific={getChapterSpecificQuestions(subject.id, chapter.id).length > 0}
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
        chapterSpecific={getChapterSpecificQuestions(subject.id, chapter.id).length > 0}
      />
    );
  }

  if (type === "video") {
    // Same rule as the CPL route: a mapping in lib/chapter-videos.ts IS the
    // availability — one line there lights up the route and the sitemap.
    const videos = chapterVideos;
    if (videos.length > 0) {
      // Null whenever this chapter has notes — the lecture is claimed there.
      return (
        <>
          {videoLdScript}
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
