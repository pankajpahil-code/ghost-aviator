import type { MetadataRoute } from "next";
import { CPL_SUBJECTS, ATPL_SUBJECTS, type Subject } from "@/lib/subjects";
import { isIndexableChapterRoute } from "@/lib/indexability";
import { ALL_PAST_PAPERS } from "@/lib/past-papers";
import { GUIDES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";
import { LASTMOD } from "@/lib/generated/lastmod";
import { getChapterVideos } from "@/lib/chapter-videos";
import { videoSitemapEntriesFor, isWatchPage } from "@/lib/video-schema";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${SITE_URL}${path}`;

  /**
   * LASTMOD IS A CLAIM, SO IT IS EITHER TRUE OR ABSENT.
   *
   * This file used to open `const now = new Date()` and stamp it on every
   * entry. Measured on the live sitemap 2026-08-23: 603 of 609 URLs carried the
   * build timestamp, so each deploy announced that six hundred pages had just
   * changed. Google uses lastmod only while it stays verifiably accurate and
   * ignores it once it does not — which threw away the one signal that could
   * tell it which of these pages is actually new, on a domain with 633 URLs
   * stuck in "Discovered - currently not indexed".
   *
   * The dates now come from git history via tools/build-lastmod.mts, generated
   * and committed because Vercel's shallow clone cannot compute them at build
   * time. A route the tool could not date is omitted here rather than guessed:
   * no lastmod is an honest "we do not know", and Google falls back to its own
   * heuristics, which is the correct outcome.
   */
  const mod = (path: string) => {
    const d = LASTMOD[path];
    return d ? { lastModified: new Date(d) } : {};
  };

  /**
   * The <video:video> entries for a chapter, on the page that is its watch page.
   *
   * Search Console has reported "Video indexed: 0" every day for 90 days and
   * "Discovered videos: 0" against the sitemap. The cause is that
   * VideoLectureCard is a click-to-load facade — deliberately, so a budget
   * phone never pulls the YouTube player unasked — which means no video element
   * exists in the DOM when Googlebot renders, because Googlebot does not click.
   * A video sitemap is Google's documented answer for exactly that case, and
   * none has ever been supplied. See lib/video-schema.ts.
   */
  const videosFor = (track: "cpl" | "atpl", subjectId: string, chapterId: string,
                     chapterTitle: string, type: string) => {
    if (!isWatchPage(track, subjectId, chapterId, type)) return {};
    const entries = videoSitemapEntriesFor(chapterTitle, getChapterVideos(subjectId, chapterId));
    return entries.length ? { videos: entries } : {};
  };

  const staticPages: MetadataRoute.Sitemap = [
    { url: url("/"),             changeFrequency: "weekly"  as const, priority: 1.0 },
    { url: url("/live-classes"), changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/about"),        changeFrequency: "monthly" as const, priority: 0.8 },
    { url: url("/cpl"),          changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/atpl"),         changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/notes"),        changeFrequency: "weekly"  as const, priority: 0.8 },
    // The lecture index. Unlike the per-chapter /video drills this is a real
    // server-rendered page — every lecture title, chapter and subject is in the
    // HTML, so it carries substantive content rather than being a shell.
    { url: url("/video-lectures"), changeFrequency: "weekly" as const, priority: 0.9 },
    { url: url("/question-bank"),changeFrequency: "weekly"  as const, priority: 0.8 },
    { url: url("/resources"),    changeFrequency: "monthly" as const, priority: 0.7 },
    { url: url("/exam"),         changeFrequency: "weekly"  as const, priority: 0.8 },
    { url: url("/rtr-simulator"),changeFrequency: "weekly"  as const, priority: 0.9 },
    // Landing + runner on one indexable route. It carries real prose (what the
    // practice is, how it is scored, the honest-notes section) rather than being
    // a client-rendered shell, so it is worth submitting — unlike the drill
    // routes, which duplicate their sibling questions page.
    { url: url("/adapt-test"),   changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/books"),        changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/past-papers"),  changeFrequency: "weekly"  as const, priority: 0.8 },
    { url: url("/guides"),       changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/how-answers-are-verified"), changeFrequency: "monthly" as const, priority: 0.7 },
    { url: url("/faq"),          changeFrequency: "monthly" as const, priority: 0.8 },
    { url: url("/cpl-cost-calculator"), changeFrequency: "monthly" as const, priority: 0.9 },
    // /login and /signup are deliberately absent: thin, no search intent, and
    // they are marked noindex. Submitting them only spends crawl budget.
  ].map(p => ({ ...p, ...mod(p.url.replace(SITE_URL, "") || "/") }));

  // Per-subject index + only those chapter routes that have real content behind
  // them. What counts as "real" is decided in ONE place — lib/indexability.ts —
  // which the routes' own generateMetadata also reads to emit robots noindex.
  //
  // Keeping the two in one predicate is the point. This file previously made the
  // call itself, from a filesystem check that merely happened to agree with the
  // route's render condition, and the drift that pattern invites has already
  // produced orphaned pages and duplicate submissions twice in this codebase.
  //
  // The same module carries the evidence for why the excluded routes are
  // excluded: a Googlebot crawl on 2026-08-14 found 1,038 reachable URLs, of
  // which roughly half carry under 150 words of unique content.
  const CHAPTER_TYPES = ["notes", "questions", "video"] as const;

  const subjectPages = (track: "cpl" | "atpl", subjects: Subject[]): MetadataRoute.Sitemap =>
    subjects.flatMap(s => [
      { url: url(`/${track}/${s.id}`), ...mod(`/${track}/${s.id}`), changeFrequency: "weekly" as const, priority: 0.8 },
      ...s.chapters.flatMap(ch =>
        CHAPTER_TYPES.filter(type => isIndexableChapterRoute(s.id, ch.id, type)).map(type => ({
          url: url(`/${track}/${s.id}/${ch.id}/${type}`),
          ...mod(`/${track}/${s.id}/${ch.id}/${type}`),
          ...videosFor(track, s.id, ch.id, ch.title, type),
          changeFrequency: "monthly" as const,
          // Notes are the substantive page; drills are secondary.
          priority: type === "notes" ? 0.7 : 0.5,
        })),
      ),
    ]);

  const paperPages: MetadataRoute.Sitemap = ALL_PAST_PAPERS.map(p => ({
    url: url(`/past-papers/${p.id}`),
    ...mod(`/past-papers/${p.id}`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // /exam/<paper> is deliberately absent. Each is the exam runner — a client
  // component behind 22-90 words of server-rendered shell — so it is the same
  // kind of page as the chapter drills and is now noindex for the same reason.
  // The /exam landing page, which actually describes the papers, is submitted
  // above and is the URL that should rank for "DGCA mock test".

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
    ...guidePages,
  ];
}
