import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CPL_SUBJECTS } from "@/lib/subjects";
import { getQuestionsForChapter } from "@/lib/questions";
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

  if (type === "notes") {
    if (subject.id === "air-regulations" && chapter.id === "ar-1") {
      return (
        <AirRegsChapter1Notes
          track="cpl"
          subject={subject}
          chapter={chapter}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
        />
      );
    }
    const notesHtmlPath = `/content/${subject.id}/${chapter.id}/notes.html`;
    // serve HTML notes for any chapter that has a notes.html in public/content/
    const HTML_NOTES_CHAPTERS: Record<string, boolean> = {
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
    };
    if (HTML_NOTES_CHAPTERS[`${subject.id}/${chapter.id}`]) {
      return (
        <HtmlNotesPage
          track="cpl"
          subject={subject}
          chapter={chapter}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          src={notesHtmlPath}
        />
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

  if (type === "video" && isAvailable("video")) {
    const YOUTUBE_IDS: Record<string, string> = {
      "air-regulations/ar-1": "U-3qsvPNXSQ",
      "air-regulations/ar-2": "3clEEVEFjhs",
      "air-regulations/ar-3": "49Pb_y2Jy4Y",
      "air-regulations/ar-4": "-wNK3jt0_Vc",
      "air-regulations/ar-5": "gSiElA8OTKY",
      "air-regulations/ar-6": "yEk9FYgRTho",
      "air-regulations/ar-7": "wvN_ol_zXPo",
      "air-regulations/ar-8": "urz6tppqass",
      "air-regulations/ar-9": "a1Zda_GDGSs",
      "air-regulations/ar-10": "cncICehqRws",
    };
    const youtubeId = YOUTUBE_IDS[`${subject.id}/${chapter.id}`];
    if (youtubeId) {
      return (
        <VideoPage
          track="cpl"
          subject={subject}
          chapter={chapter}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          youtubeId={youtubeId}
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
