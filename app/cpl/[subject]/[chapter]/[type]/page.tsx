import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CPL_SUBJECTS } from "@/lib/subjects";
import { getQuestionsForChapter, getChapterSpecificQuestions } from "@/lib/questions";
import { getChapterVideos } from "@/lib/chapter-videos";
import { getInlineNotes } from "@/lib/notes-inline";
import { isIndexableChapterRoute, servesRealNotes, adjacentWithContent, NOINDEX } from "@/lib/indexability";
import { chapterMetaDescription, chapterTitle } from "@/lib/chapter-meta";
import { videoObjectsFor, lecturePartsFor } from "@/lib/video-schema";
import { SITE_URL, PERSON_ID, ORG_ID } from "@/lib/site";
import NotesPage              from "@/app/components/content/NotesPage";
import AirRegsChapter1Notes   from "@/app/components/content/AirRegsChapter1Notes";
import QuestionsPage          from "@/app/components/content/QuestionsPage";
import ChapterTestPage        from "@/app/components/content/ChapterTestPage";
import ChapterQuizPage        from "@/app/components/content/ChapterQuizPage";
import HtmlNotesPage          from "@/app/components/content/HtmlNotesPage";
import VideoPage              from "@/app/components/content/VideoPage";
import ComingSoonPage         from "@/app/components/content/ComingSoonPage";

// "slides" and "audio" were retired 2026-08-13. Old URLs are 308-redirected to
// the chapter's notes in next.config.ts rather than 404'd, so any link a student
// bookmarked still lands on the teaching for that chapter.
const VALID_TYPES = ["notes", "video", "questions", "mock-test", "chapter-quiz"] as const;

export function generateStaticParams() {
  return CPL_SUBJECTS.flatMap(s =>
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
  const subject = CPL_SUBJECTS.find(s => s.id === subjectId);
  const chapter = subject?.chapters.find(c => c.id === chapterId);
  if (!subject || !chapter) return {};
  return {
    title: chapterTitle("cpl", subject, chapter, type),
    description: chapterMetaDescription(
      "cpl", subject, chapter, type, getQuestionsForChapter(subject.id, chapter.id).length,
    ),
    alternates: { canonical: `/cpl/${subject.id}/${chapter.id}/${type}` },
    // A route that renders a stub or a drill asks not to be indexed. Leaving it
    // out of the sitemap was never enough — it stays linked, stays crawled, and
    // still counts toward what Google concludes this domain is made of. See
    // lib/indexability.ts for the crawl that measured it.
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

  const subject = CPL_SUBJECTS.find(s => s.id === subjectId);
  if (!subject) notFound();

  const chapterIdx = subject.chapters.findIndex(c => c.id === chapterId);
  if (chapterIdx === -1) notFound();

  const chapter = subject.chapters[chapterIdx];

  // Previous/Next skip to the nearest chapter that actually HAS this route's
  // content, rather than the literally adjacent one — see adjacentWithContent.
  // The drill routes keep plain adjacency: every chapter has a quiz.
  const skips = type === "notes" || type === "video" || type === "questions";
  const { prev, next } = skips
    ? adjacentWithContent(subject.chapters, subject.id, chapterIdx, type as "notes")
    : { prev: chapterIdx - 1, next: chapterIdx + 1 };
  const prevChapter = prev >= 0 ? subject.chapters[prev] : null;
  const nextChapter = next >= 0 && next < subject.chapters.length ? subject.chapters[next] : null;

  const questions = getQuestionsForChapter(subject.id, chapter.id);

  // Course + BreadcrumbList. The breadcrumb is what turns a bare URL in the
  // search result into "Home › CPL › Meteorology › Ch.3", which measurably
  // improves click-through on deep pages like these.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        "@id": `${SITE_URL}/cpl/${subject.id}/${chapter.id}/${type}#course`,
        "name": `Chapter ${chapter.number}: ${chapter.title} - ${subject.shortName} CPL`,
        "description": chapter.description || `${subject.shortName} Chapter ${chapter.number} study material for DGCA CPL/ATPL exams.`,
        "url": `${SITE_URL}/cpl/${subject.id}/${chapter.id}/${type}`,
        "inLanguage": "en",
        "isAccessibleForFree": true,
        "teaches": chapter.title,
        // Who taught this. Without it, the site's largest content surface —
        // every chapter — carries no expertise signal at all, and a search or
        // answer engine has no way to attribute 290 chapters to a real
        // instructor with a licence, two books and a public teaching record.
        "author": { "@id": PERSON_ID },
        "provider": { "@id": ORG_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/cpl/${subject.id}/${chapter.id}/${type}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "CPL", item: `${SITE_URL}/cpl` },
          { "@type": "ListItem", position: 3, name: subject.name, item: `${SITE_URL}/cpl/${subject.id}` },
          { "@type": "ListItem", position: 4, name: `Ch.${chapter.number} ${chapter.title}` },
        ],
      },
    ],
  };

  // Plain element, not a component defined during render — declaring a
  // component inside the render body gives it a new identity on every render,
  // which defeats reconciliation and is why react-hooks/static-components
  // flags it.
  const jsonLdScript = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );

  if (type === "notes") {
    if (subject.id === "air-regulations" && chapter.id === "ar-1") {
      return (
        <AirRegsChapter1Notes
          track="cpl"
          subject={subject}
          chapter={chapter}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          videos={getChapterVideos(subject.id, chapter.id)}
        />
      );
    }
    // Whether a chapter serves real notes is decided in lib/indexability.ts —
    // the same predicate the sitemap and this route's own robots tag read, so a
    // chapter can never be advertised as content while rendering a stub. The
    // per-chapter allow-list that used to sit here moved there with it.
    const inlineNotes = servesRealNotes(subject.id, chapter.id)
      ? getInlineNotes(subject.id, chapter.id)
      : null;
    if (inlineNotes) {
      return (
        <>
          {jsonLdScript}
          <HtmlNotesPage
            track="cpl"
            subject={subject}
            chapter={chapter}
            prevChapter={prevChapter}
            nextChapter={nextChapter}
            notes={inlineNotes}
            videos={getChapterVideos(subject.id, chapter.id)}
          />
        </>
      );
    }
    // No notes published for this chapter yet. These subjects' chapters arrive
    // one published file at a time, so they show the explicit waiting state;
    // the rest fall back to the chapter overview.
    if (subject.id === "instrumentation" || subject.id === "radio-navigation"
        || subject.id === "technical-general" || subject.id === "radio-telephony") {
      return (
        <ComingSoonPage track="cpl" subject={subject} chapter={chapter} type={type} />
      );
    }
    return (
      <NotesPage
        track="cpl"
        subject={subject}
        chapter={chapter}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
        videos={getChapterVideos(subject.id, chapter.id)}
      />
    );
  }

  if (type === "video") {
    // A mapped lecture IS availability — the mapping in lib/chapter-videos.ts
    // is the single source of truth, and the sitemap uses the same condition.
    const videos = getChapterVideos(subject.id, chapter.id);
    if (videos.length > 0) {
      // VideoObject, so this page can be recognised as the lecture's watch page.
      // Search Console reported the site's one detected video as "Video isn't on
      // a watch page" — nothing here was eligible for video results at all.
      const videoNodes = videoObjectsFor("cpl", subject.id, chapter.id, chapter.title, videos);
      return (
        <>
          {jsonLdScript}
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
            track="cpl"
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

  if (type === "questions") {
    return (
      <QuestionsPage
        track="cpl"
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
        track="cpl"
        subject={subject}
        chapter={chapter}
        questions={questions}
      />
    );
  }

  if (type === "chapter-quiz") {
    return (
      <ChapterQuizPage
        track="cpl"
        subject={subject}
        chapter={chapter}
        questions={questions}
      />
    );
  }

  return (
    <ComingSoonPage
      track="cpl"
      subject={subject}
      chapter={chapter}
      type={type}
    />
  );
}
