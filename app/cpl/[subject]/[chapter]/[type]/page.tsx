import { notFound } from "next/navigation";
import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import { CPL_SUBJECTS } from "@/lib/subjects";
import { getQuestionsForChapter } from "@/lib/questions";
import { getChapterVideos } from "@/lib/chapter-videos";
import { getSeoHtmlForNotes } from "@/lib/seo-notes";
import { SITE_URL } from "@/lib/site";
import NotesPage              from "@/app/components/content/NotesPage";
import AirRegsChapter1Notes   from "@/app/components/content/AirRegsChapter1Notes";
import QuestionsPage          from "@/app/components/content/QuestionsPage";
import ChapterTestPage        from "@/app/components/content/ChapterTestPage";
import ChapterQuizPage        from "@/app/components/content/ChapterQuizPage";
import HtmlNotesPage          from "@/app/components/content/HtmlNotesPage";
import SlidesPage             from "@/app/components/content/SlidesPage";
import AudioPage              from "@/app/components/content/AudioPage";
import VideoPage              from "@/app/components/content/VideoPage";
import ComingSoonPage         from "@/app/components/content/ComingSoonPage";

const VALID_TYPES = ["notes", "slides", "video", "audio", "questions", "mock-test", "chapter-quiz"] as const;

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
    description: chapter.description,
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

  // Whether a given content type is actually published for this chapter.
  // Mirrors the `available` flags shown on the subject index, so direct
  // navigation (or prev/next inside a viewer) can't land on broken media.
  const isAvailable = (t: string) => chapter.content.find(c => c.type === t)?.available ?? false;

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
        "provider": {
          "@type": "EducationalOrganization",
          "name": "Ghost Aviator",
          "url": SITE_URL,
        },
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
    const notesHtmlPath = `/content/${subject.id}/${chapter.id}/notes.html`;

    // Instrumentation: auto-serve HTML notes whenever the chapter's notes.html
    // has been published to public/content/ (the daily notes task drops files
    // there), so newly added chapters appear without editing this allow-list.
    if (subject.id === "instrumentation" || subject.id === "radio-navigation" || subject.id === "technical-general" || subject.id === "radio-telephony") {
      const notesFile = path.join(process.cwd(), "public", "content", subject.id, chapter.id, "notes.html");
      if (fs.existsSync(notesFile)) {
        const seoHtml = getSeoHtmlForNotes(subject.id, chapter.id);
        return (
          <>
            {jsonLdScript}
            {/* Server-rendered copy of the chapter text. `sr-only` keeps it out of the
    visual layout (the styled notes render in the iframe below) while leaving
    it in the accessibility tree, so screen-reader users get the real chapter.
    Do NOT add aria-hidden here: content that no user can reach by any means
    but a crawler can is hidden text under Google's spam policies, and risks a
    manual action on the whole domain. It was aria-hidden until 2026-07-26. */}
{seoHtml && <article className="sr-only" dangerouslySetInnerHTML={{ __html: seoHtml }} />}
            <HtmlNotesPage
              track="cpl"
              subject={subject}
              chapter={chapter}
              prevChapter={prevChapter}
              nextChapter={nextChapter}
              src={notesHtmlPath}
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
    if (HTML_NOTES_CHAPTERS[`${subject.id}/${chapter.id}`]) {
      const seoHtml = getSeoHtmlForNotes(subject.id, chapter.id);
      return (
        <>
          {jsonLdScript}
          {/* Server-rendered copy of the chapter text. `sr-only` keeps it out of the
    visual layout (the styled notes render in the iframe below) while leaving
    it in the accessibility tree, so screen-reader users get the real chapter.
    Do NOT add aria-hidden here: content that no user can reach by any means
    but a crawler can is hidden text under Google's spam policies, and risks a
    manual action on the whole domain. It was aria-hidden until 2026-07-26. */}
{seoHtml && <article className="sr-only" dangerouslySetInnerHTML={{ __html: seoHtml }} />}
          <HtmlNotesPage
            track="cpl"
            subject={subject}
            chapter={chapter}
            prevChapter={prevChapter}
            nextChapter={nextChapter}
            src={notesHtmlPath}
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
      />
    );
  }

  if (type === "slides") {
    if (!isAvailable("slides")) {
      return <ComingSoonPage track="cpl" subject={subject} chapter={chapter} type={type} />;
    }
    const slidesPath = `/content/${subject.id}/${chapter.id}/slides.pdf`;
    return (
      <SlidesPage
        track="cpl"
        subject={subject}
        chapter={chapter}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
        src={slidesPath}
      />
    );
  }

  if (type === "video") {
    // A mapped lecture IS availability — the mapping in lib/chapter-videos.ts
    // is the single source of truth, and the sitemap uses the same condition.
    const videos = getChapterVideos(subject.id, chapter.id);
    if (videos.length > 0) {
      return (
        <VideoPage
          track="cpl"
          subject={subject}
          chapter={chapter}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          videos={videos}
        />
      );
    }
  }

  if (type === "audio") {
    if (!isAvailable("audio")) {
      return <ComingSoonPage track="cpl" subject={subject} chapter={chapter} type={type} />;
    }
    const AUDIO_TITLES: Record<string, string> = {
      "air-regulations/ar-1": "Aasman Ke Kanoon Aur Hawai Niyam",
      "air-regulations/ar-2": "The Secret Logic of Aircraft Tail Numbers",
      "air-regulations/ar-3": "DGCA Air Regulations and Emergency Procedures",
      "air-regulations/ar-4": "Indian Airspace Classifications and ATC Protocols",
      "air-regulations/ar-5": "DGCA Aircraft Separation Methods and Minima",
      "air-regulations/ar-6": "DGCA Separation Rules and Visual Minima",
      "air-regulations/ar-7": "DGCA Procedures for Aerodrome Control Service",
      "air-regulations/ar-8": "ATS Surveillance Systems and Separation Standards",
      "air-regulations/ar-9": "Aeronautical Information Services Exam Essentials",
      "air-regulations/ar-10": "Global Aviation Search and Rescue Protocols",
    };
    const audioPath = `/content/${subject.id}/${chapter.id}/audio.m4a`;
    return (
      <AudioPage
        track="cpl"
        subject={subject}
        chapter={chapter}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
        src={audioPath}
        title={AUDIO_TITLES[`${subject.id}/${chapter.id}`]}
      />
    );
  }

  if (type === "questions") {
    return (
      <QuestionsPage
        track="cpl"
        subject={subject}
        chapter={chapter}
        questions={questions}
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
