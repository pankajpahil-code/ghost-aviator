import { notFound } from "next/navigation";
import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { CPL_SUBJECTS } from "@/lib/subjects";
import { getQuestionsForChapter, getChapterSpecificQuestions } from "@/lib/questions";
import { getChapterVideos } from "@/lib/chapter-videos";
import { getInlineNotes } from "@/lib/notes-inline";
import { chapterMetaDescription } from "@/lib/chapter-meta";
import { videoObjectsFor } from "@/lib/video-schema";
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
  const label = type === "mock-test" ? "Chapter Test"
    : type.charAt(0).toUpperCase() + type.slice(1);
  return {
    title: `Ch.${chapter.number} ${chapter.title} — ${label} | ${subject.shortName} CPL | Ghost Aviator`,
    description: chapterMetaDescription(
      "cpl", subject, chapter, type, getQuestionsForChapter(subject.id, chapter.id).length,
    ),
    alternates: { canonical: `/cpl/${subject.id}/${chapter.id}/${type}` },
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

  const chapter     = subject.chapters[chapterIdx];
  const prevChapter = chapterIdx > 0 ? subject.chapters[chapterIdx - 1] : null;
  const nextChapter = chapterIdx < subject.chapters.length - 1 ? subject.chapters[chapterIdx + 1] : null;

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
    // Instrumentation: auto-serve HTML notes whenever the chapter's notes.html
    // has been published to public/content/ (the daily notes task drops files
    // there), so newly added chapters appear without editing this allow-list.
    if (subject.id === "instrumentation" || subject.id === "radio-navigation" || subject.id === "technical-general" || subject.id === "radio-telephony") {
      const notesFile = path.join(process.cwd(), "public", "content", subject.id, chapter.id, "notes.html");
      const inlineNotes = fs.existsSync(notesFile) ? getInlineNotes(subject.id, chapter.id) : null;
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
      return (
        <ComingSoonPage track="cpl" subject={subject} chapter={chapter} type={type} />
      );
    }

    // serve HTML notes for any chapter that has a notes.html in public/content/
    const HTML_NOTES_CHAPTERS: Record<string, boolean> = {
      "air-regulations/ar-2":  true,
      "air-regulations/ar-3":  true,
      "air-regulations/ar-4":  true,
      "air-regulations/ar-5":  true,
      "air-regulations/ar-6":  true,
      "air-regulations/ar-7":  true,
      "air-regulations/ar-8":  true,
      "air-regulations/ar-9":  true,
      "air-regulations/ar-10": true,
      "air-regulations/ar-11": true,
      "air-regulations/ar-14": true,
      "air-regulations/ar-15": true,
      "air-regulations/ar-16": true,
      "air-regulations/ar-17": true,
      "air-regulations/ar-12": true,
      "air-regulations/ar-13": true,
      "air-regulations/ar-18": true,
      "air-regulations/ar-19": true,
      "air-regulations/ar-20": true,
      "air-regulations/ar-21": true,
      "air-regulations/ar-22": true,
      "air-regulations/ar-23": true,
      "air-regulations/ar-24": true,
      "air-regulations/ar-25": true,
      "air-regulations/ar-26": true,
      // IC Joshi Meteorology study notes (Ch.1–11)
      "meteorology/met-1":  true,
      "meteorology/met-2":  true,
      "meteorology/met-3":  true,
      "meteorology/met-4":  true,
      "meteorology/met-5":  true,
      "meteorology/met-6":  true,
      "meteorology/met-7":  true,
      "meteorology/met-8":  true,
      "meteorology/met-9":  true,
      "meteorology/met-10": true,
      "meteorology/met-11": true,
      "meteorology/met-12": true,
      "meteorology/met-13": true,
      "meteorology/met-14": true,
      "meteorology/met-15": true,
      "meteorology/met-16": true,
      "meteorology/met-17": true,
      "meteorology/met-18": true,
      "meteorology/met-19": true,
      "meteorology/met-20": true,
      "meteorology/met-21": true,
      "meteorology/met-22": true,
      "meteorology/met-23": true,
      "meteorology/met-24": true,
      "meteorology/met-25": true,
      "meteorology/met-26": true,
      "meteorology/met-27": true,
      "meteorology/met-28": true,
      "meteorology/met-29": true,
      // Oxford General Navigation study notes (merged into Air Navigation)
      "air-navigation/nav-1":  true,
      "air-navigation/nav-13": true,
      "air-navigation/nav-14": true,
      "air-navigation/nav-15": true,
      "air-navigation/nav-16": true,
      "air-navigation/nav-17": true,
      "air-navigation/nav-18": true,
      "air-navigation/nav-19": true,
      "air-navigation/nav-20": true,
      "air-navigation/nav-21": true,
      "air-navigation/nav-22": true,
      "air-navigation/nav-23": true,
      "air-navigation/nav-24": true,
      "air-navigation/nav-25": true,
      "air-navigation/nav-26": true,
      "air-navigation/nav-27": true,
      "air-navigation/nav-28": true,
      "air-navigation/nav-29": true,
      "air-navigation/nav-30": true,
      "air-navigation/nav-31": true,
      "air-navigation/nav-32": true,
      "air-navigation/nav-33": true,
      // DA-42 NG (Austro) type-specific study notes
      "technical-specific/da42-1":  true,
      "technical-specific/da42-2":  true,
      "technical-specific/da42-3":  true,
      "technical-specific/da42-4":  true,
      "technical-specific/da42-5":  true,
      "technical-specific/da42-6":  true,
      "technical-specific/da42-7":  true,
      "technical-specific/da42-8":  true,
      "technical-specific/da42-9":  true,
      "technical-specific/da42-10": true,
    };
    const inlineNotes = HTML_NOTES_CHAPTERS[`${subject.id}/${chapter.id}`]
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
