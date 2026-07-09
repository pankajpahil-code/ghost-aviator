import type { MetadataRoute } from "next";
import { CPL_SUBJECTS, ATPL_SUBJECTS, type Subject } from "@/lib/subjects";
import { ALL_PAST_PAPERS } from "@/lib/past-papers";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const url = (path: string) => `${SITE_URL}${path}`;

  const staticPages: MetadataRoute.Sitemap = [
    { url: url("/"),             changeFrequency: "weekly"  as const, priority: 1.0 },
    { url: url("/live-classes"), changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/cpl"),          changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/atpl"),         changeFrequency: "weekly"  as const, priority: 0.9 },
    { url: url("/notes"),        changeFrequency: "weekly"  as const, priority: 0.8 },
    { url: url("/question-bank"),changeFrequency: "weekly"  as const, priority: 0.8 },
    { url: url("/resources"),    changeFrequency: "monthly" as const, priority: 0.7 },
    { url: url("/mock-test"),    changeFrequency: "monthly" as const, priority: 0.7 },
    { url: url("/past-papers"),  changeFrequency: "weekly"  as const, priority: 0.8 },
    { url: url("/signup"),       changeFrequency: "monthly" as const, priority: 0.4 },
    { url: url("/login"),        changeFrequency: "monthly" as const, priority: 0.3 },
  ].map(p => ({ ...p, lastModified: now }));

  // Per-subject index + per-chapter content that is actually published.
  const subjectPages = (track: "cpl" | "atpl", subjects: Subject[]): MetadataRoute.Sitemap =>
    subjects.flatMap(s => [
      { url: url(`/${track}/${s.id}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
      ...s.chapters.flatMap(ch => {
        // Notes & chapter-quiz always exist; other types only when available.
        const types = new Set<string>(["notes", "chapter-quiz"]);
        for (const c of ch.content) if (c.available) types.add(c.type);
        return Array.from(types).map(type => ({
          url: url(`/${track}/${s.id}/${ch.id}/${type}`),
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        }));
      }),
    ]);

  const paperPages: MetadataRoute.Sitemap = ALL_PAST_PAPERS.map(p => ({
    url: url(`/past-papers/${p.id}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...staticPages,
    ...subjectPages("cpl", CPL_SUBJECTS),
    ...subjectPages("atpl", ATPL_SUBJECTS),
    ...paperPages,
  ];
}
