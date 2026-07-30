import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { CPL_SUBJECTS, ATPL_SUBJECTS, type Subject } from "@/lib/subjects";
import { getQuestionsForChapter } from "@/lib/questions";
import { getChapterVideos } from "@/lib/chapter-videos";
import { ALL_PAST_PAPERS } from "@/lib/past-papers";
import { EXAM_PAPERS } from "@/lib/exam-papers";
import { GUIDES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string) => `${SITE_URL}${path}`;

  const staticPages: MetadataRoute.Sitemap = [
    { url: url("/"),             changeFrequency: "weekly"  as const, priority: 1.0 },
    { url: url("/live-classes"), changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/about"),        changeFrequency: "monthly" as const, priority: 0.8 },
    { url: url("/cpl"),          changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/atpl"),         changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/notes"),        changeFrequency: "weekly"  as const, priority: 0.8 },
    { url: url("/question-bank"),changeFrequency: "weekly"  as const, priority: 0.8 },
    { url: url("/resources"),    changeFrequency: "monthly" as const, priority: 0.7 },
    { url: url("/exam"),         changeFrequency: "weekly"  as const, priority: 0.8 },
    { url: url("/rtr-simulator"),changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/books"),        changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/past-papers"),  changeFrequency: "weekly"  as const, priority: 0.8 },
    { url: url("/guides"),       changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/cpl-cost-calculator"), changeFrequency: "monthly" as const, priority: 0.9 },
    // /login and /signup are deliberately absent: thin, no search intent, and
    // they are marked noindex. Submitting them only spends crawl budget.
  ].map(p => ({ ...p, lastModified: now }));

  // A chapter's notes route is only worth submitting when real notes exist.
  // `content[].available` cannot be trusted for this — makeContent() hardcodes
  // notes to available:true for every chapter, including the ~56 that are still
  // placeholders. Check the filesystem, which is the actual source of truth.
  const hasRealNotes = (subjectId: string, chapterId: string): boolean => {
    // ar-1 renders from a React component rather than a published HTML file.
    if (subjectId === "air-regulations" && chapterId === "ar-1") return true;
    return fs.existsSync(
      path.join(process.cwd(), "public", "content", subjectId, chapterId, "notes.html"),
    );
  };

  // Per-subject index + only those chapter routes that have real content behind
  // them. A sitemap full of "Detailed Notes Being Prepared" placeholders and
  // zero-question quizzes teaches Google that this domain is mostly thin pages.
  const subjectPages = (track: "cpl" | "atpl", subjects: Subject[]): MetadataRoute.Sitemap =>
    subjects.flatMap(s => [
      { url: url(`/${track}/${s.id}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
      ...s.chapters.flatMap(ch => {
        const types = new Set<string>();
        if (hasRealNotes(s.id, ch.id)) types.add("notes");
        // Quiz and practice-question routes are empty shells without questions.
        const questionCount = getQuestionsForChapter(s.id, ch.id).length;
        if (questionCount > 0) {
          types.add("chapter-quiz");
          types.add("questions");
        }
        // Slides/audio stay gated on their availability flags, which are honest.
        for (const c of ch.content) {
          if (c.available && ["slides", "audio"].includes(c.type)) types.add(c.type);
        }
        // Video is gated on the SAME condition the route renders with: a
        // mapped lecture in lib/chapter-videos.ts (the flag alone can lie).
        if (getChapterVideos(s.id, ch.id).length > 0) types.add("video");
        return Array.from(types).map(type => ({
          url: url(`/${track}/${s.id}/${ch.id}/${type}`),
          lastModified: now,
          changeFrequency: "monthly" as const,
          // Notes are the substantive page; drills are secondary.
          priority: type === "notes" ? 0.7 : 0.5,
        }));
      }),
    ]);

  const paperPages: MetadataRoute.Sitemap = ALL_PAST_PAPERS.map(p => ({
    url: url(`/past-papers/${p.id}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const examPages: MetadataRoute.Sitemap = EXAM_PAPERS.map(p => ({
    url: url(`/exam/${p.id}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const guidePages: MetadataRoute.Sitemap = GUIDES.map(g => ({
    url: url(`/guides/${g.slug}`),
    lastModified: new Date(g.date),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    ...staticPages,
    ...subjectPages("cpl", CPL_SUBJECTS),
    ...subjectPages("atpl", ATPL_SUBJECTS),
    ...paperPages,
    ...examPages,
    ...guidePages,
  ];
}
