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
/** "PT1H7M48S" -> 68. Returns null for anything it cannot read. */
function isoMinutes(iso: string | undefined): number | null {
  if (!iso) return null;
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return null;
  const [, h, mi, s] = m;
  const total = (Number(h ?? 0) * 60) + Number(mi ?? 0) + (Number(s ?? 0) / 60);
  return total > 0 ? Math.round(total) : null;
}

/**
 * The visible lecture-part list for a chapter's video page.
 *
 * The labels are the Captain's own topic names from lib/chapter-videos.ts (246
 * of 285 lectures carry one); the runtimes come from YouTube via
 * lib/generated/video-metadata.ts. Both are facts already on record here.
 *
 * Deliberately NOT included: the YouTube `description` field. 272 of 273 of
 * those are cut off at 160 characters by YouTube's own meta tag and most open
 * with the same boilerplate line, so rendering them would put near-identical
 * text on 140 pages — the exact duplication this page is being fixed to escape.
 * They stay in the VideoObject, where a truncated description is normal, and
 * off the page, where it would be filler.
 */
export function lecturePartsFor(
  videos: ChapterVideo[],
): { id: string; label: string; minutes: number | null }[] {
  return videos.map((v, i) => ({
    id: v.id,
    label: v.label ?? `Part ${i + 1}`,
    minutes: isoMinutes(VIDEO_METADATA[v.id]?.duration),
  }));
}

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
