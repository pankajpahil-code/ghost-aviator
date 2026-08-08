import { VIDEO_METADATA } from "@/lib/generated/video-metadata";
import { SITE_URL, PERSON_ID, ORG_ID } from "@/lib/site";
import type { ChapterVideo } from "@/lib/chapter-videos";

/**
 * VideoObject nodes for a chapter's lectures.
 *
 * Search Console (2026-08-08) reported the site's only detected video as
 * "Video isn't on a watch page" — meaning nothing here was eligible for video
 * results. A chapter's /video route genuinely IS a watch page: the lecture is
 * the point of the page, not decoration. It just never said so in a way a
 * crawler could read.
 *
 * Every field comes from lib/generated/video-metadata.ts, which reads YouTube's
 * own watch page for each ID. A lecture whose metadata could not be read is
 * stored as null and is skipped here rather than described with a guess —
 * `uploadDate` in particular is a factual claim about when the Captain
 * published, and this codebase has shipped invented dates before.
 */
export function videoObjectsFor(
  track: "cpl" | "atpl",
  subjectId: string,
  chapterId: string,
  chapterTitle: string,
  videos: ChapterVideo[],
): object[] {
  const pageUrl = `${SITE_URL}/${track}/${subjectId}/${chapterId}/video`;

  return videos.flatMap(v => {
    const meta = VIDEO_METADATA[v.id];
    if (!meta) return [];                       // no verified metadata — assert nothing
    return [{
      "@type": "VideoObject",
      "@id": `${pageUrl}#video-${v.id}`,
      name: meta.name,
      description: meta.description || `${chapterTitle} — DGCA ${track.toUpperCase()} lecture by Capt. Pankaj Pahil.`,
      thumbnailUrl: meta.thumbnailUrl,
      uploadDate: meta.uploadDate,
      ...(meta.duration ? { duration: meta.duration } : {}),
      embedUrl: `https://www.youtube.com/embed/${v.id}`,
      contentUrl: `https://www.youtube.com/watch?v=${v.id}`,
      // The lecture is the page's main content — that is precisely what
      // "isn't on a watch page" was telling us was missing.
      mainEntityOfPage: pageUrl,
      isFamilyFriendly: true,
      inLanguage: "en",
      creator: { "@id": PERSON_ID },
      publisher: { "@id": ORG_ID },
    }];
  });
}
