import { VIDEO_METADATA } from "@/lib/generated/video-metadata";
import { SITE_URL, PERSON_ID, ORG_ID } from "@/lib/site";
import { servesRealNotes } from "@/lib/indexability";
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

/**
 * WHERE A LECTURE'S WATCH PAGE IS — and why it moved.
 *
 * Search Console, 2026-08-23: Video indexed 0, every day for 90 days, and the
 * one video Google looked at came back "Video isn't on a watch page".
 *
 * It was telling the truth. The VideoObject was emitted only on the chapter's
 * /video route, which carries a median of 119 words — the lecture, a part list
 * and a syllabus line. Meanwhile the SAME lecture already renders at the top of
 * the chapter's notes page, immediately above a median 2,656 words of the
 * Captain's own teaching. The thin duplicate was claiming to be the watch page
 * and the real one was not claiming anything.
 *
 * So the watch page is the notes page wherever there is one — 94 of the 109
 * chapters that have a lecture. For the remaining 15 there is no notes page, so
 * /video genuinely is the lecture's only home and keeps the claim.
 *
 * Derived here rather than passed in, because three callers need the same
 * answer — the notes route, the video route, and the sitemap — and a second
 * copy of this rule is exactly the drift that has produced orphaned pages and
 * duplicate submissions twice in this codebase.
 */
export function watchPageFor(
  track: "cpl" | "atpl",
  subjectId: string,
  chapterId: string,
): string {
  const type = servesRealNotes(subjectId, chapterId) ? "notes" : "video";
  return `${SITE_URL}/${track}/${subjectId}/${chapterId}/${type}`;
}

/** True when THIS route is the one that should carry the lecture's schema. */
export function isWatchPage(
  track: "cpl" | "atpl",
  subjectId: string,
  chapterId: string,
  type: string,
): boolean {
  return watchPageFor(track, subjectId, chapterId).endsWith(`/${type}`);
}

export function videoObjectsFor(
  track: "cpl" | "atpl",
  subjectId: string,
  chapterId: string,
  chapterTitle: string,
  videos: ChapterVideo[],
): object[] {
  const pageUrl = watchPageFor(track, subjectId, chapterId);

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

/**
 * XML-escape a text value bound for the sitemap.
 *
 * NEXT DOES NOT DO THIS FOR YOU. next/dist/build/webpack/loaders/metadata/
 * resolve-route-data.js interpolates every video field straight into the
 * document — `<video:title>${video.title}</video:title>` — with no escaping of
 * any kind. Measured against lib/generated/video-metadata.ts on 2026-08-23:
 * 218 of the lecture titles and 54 of the descriptions contain a character XML
 * reserves, almost all of them the ampersand in "CPL & ATPL".
 *
 * One of those unescaped would make sitemap.xml malformed, and a malformed
 * sitemap is not partially accepted — Google rejects the file, taking all 515
 * URLs with it. That would be considerably worse than the missing video
 * entries this function exists to add, so the escaping happens here, at the
 * only point that knows the value is going into XML.
 */
const xml = (v: string) => v
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&apos;");

/**
 * The <video:video> entries for a chapter's watch page in the sitemap.
 *
 * THIS IS THE PART THAT ACTUALLY LETS GOOGLE SEE THE LECTURES, and it is not a
 * belt-and-braces duplicate of the VideoObject above.
 *
 * VideoLectureCard is a click-to-load facade: until a student taps, the page
 * holds a 15 KB thumbnail and no iframe, so the YouTube player is never pulled
 * on a budget phone that may never press play. That is a deliberate and correct
 * trade-off and it must not be undone. But it means there is no video element
 * in the DOM when Googlebot renders the page — Googlebot does not click — so
 * the only `youtube.com/embed/` string on the page is inside the JSON-LD.
 *
 * Google's documented answer for a video its renderer cannot find is a video
 * sitemap, and Search Console confirms none has ever been supplied here:
 * "Discovered videos: 0" against a sitemap last read 6 August. Next 16 emits
 * the video extension natively from this field.
 *
 * Every value is one we already hold from YouTube's own watch page. A lecture
 * with no stored metadata is skipped rather than described with a guess.
 */
export function videoSitemapEntriesFor(
  chapterTitle: string,
  videos: ChapterVideo[],
): { title: string; thumbnail_loc: string; description: string; player_loc: string; duration?: number; publication_date?: string }[] {
  return videos.flatMap(v => {
    const meta = VIDEO_METADATA[v.id];
    if (!meta || !meta.thumbnailUrl) return [];
    const description = meta.description || `${chapterTitle} — DGCA lecture by Capt. Pankaj Pahil.`;
    const seconds = isoSeconds(meta.duration);
    return [{
      title: xml(meta.name),
      thumbnail_loc: xml(meta.thumbnailUrl),
      // The spec caps description at 2048 characters. Truncate BEFORE escaping,
      // so the limit counts the text the reader sees; escaping afterwards can
      // only lengthen it, and never past a limit Google applies to the decoded
      // value. Slicing after would risk cutting an entity in half.
      description: xml(description.slice(0, 2048)),
      player_loc: `https://www.youtube.com/embed/${v.id}`,
      // The spec's valid range is 1..28800 seconds; anything outside it makes
      // Google reject the whole entry, so an out-of-range value is omitted
      // rather than clamped to a number we did not measure.
      ...(seconds !== null && seconds >= 1 && seconds <= 28800 ? { duration: seconds } : {}),
      ...(meta.uploadDate ? { publication_date: meta.uploadDate } : {}),
    }];
  });
}

/** "PT1H7M48S" -> 4068 seconds. Null for anything it cannot read. */
function isoSeconds(iso: string | undefined): number | null {
  if (!iso) return null;
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return null;
  const [, h, mi, sec] = m;
  const total = (Number(h ?? 0) * 3600) + (Number(mi ?? 0) * 60) + Number(sec ?? 0);
  return total > 0 ? total : null;
}
