import type { MetadataRoute } from "next";
import fs from "node:fs";
import path from "node:path";
import { CPL_SUBJECTS, ATPL_SUBJECTS, type Subject } from "@/lib/subjects";
import { getChapterSpecificQuestions } from "@/lib/questions";
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
    { url: url("/how-answers-are-verified"), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: url("/faq"),          changeFrequency: "monthly" as const, priority: 0.8 },
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
  //
  // SUBMIT ONLY WHAT CAN RANK (2026-08-08). A crawl of the previous 931-URL
  // sitemap measured what Googlebot actually receives per route type:
  //
  //     notes         median 2,514 words
  //     questions     median   243 words
  //     chapter-quiz  median   201 words
  //     video/slides/audio  ~215-285 words
  //
  // Everything except notes and questions is a client-rendered drill: the page
  // is a shell, the content arrives after hydration, and it duplicates the
  // sibling questions page besides. That was 331 of 931 submitted URLs — a
  // third of everything we asked Google to look at — spending crawl budget on
  // pages that cannot win a query, on a domain whose real asset is the notes.
  //
  // These routes stay live and stay internally linked; they are simply not
  // *submitted*. Google is free to find and index them by following links.
  const SUBMITTED_TYPES = new Set(["notes", "questions"]);

  // ONE URL PER DISTINCT QUESTION SET (2026-08-08).
  //
  // getQuestionsForChapter falls back to the whole subject pool for a chapter
  // with no bank of its own. That is right for a student — there is always
  // something to practise — but it means many chapters serve identical
  // questions: 16 Air Navigation chapters return the same 1,020, 8 Meteorology
  // chapters the same 651, 6 ATPL Navigation the same 865. 114 of 284 question
  // pages duplicated another. Asking Google to index 16 identical URLs is how a
  // site teaches it that most of the domain is redundant, and Search Console
  // was reporting 303 of 343 known pages as "Crawled - currently not indexed".
  //
  // A chapter is submitted only if its question set is genuinely its own AND no
  // earlier chapter already claimed that exact set. The others stay live and
  // linked; they just do not compete with themselves in the index.
  const seenQuestionSets = new Set<string>();
  const questionSetKey = (subjectId: string, chapterId: string): string | null => {
    const own = getChapterSpecificQuestions(subjectId, chapterId);
    if (own.length === 0) return null;               // subject-wide fallback — not this chapter's content
    return own.map(q => q.q).join("|");
  };

  const subjectPages = (track: "cpl" | "atpl", subjects: Subject[]): MetadataRoute.Sitemap =>
    subjects.flatMap(s => [
      { url: url(`/${track}/${s.id}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
      ...s.chapters.flatMap(ch => {
        const types = new Set<string>();
        if (hasRealNotes(s.id, ch.id)) types.add("notes");
        const key = questionSetKey(s.id, ch.id);
        if (key && !seenQuestionSets.has(key)) {
          seenQuestionSets.add(key);
          types.add("questions");
        }
        return Array.from(types).filter(t => SUBMITTED_TYPES.has(t)).map(type => ({
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
