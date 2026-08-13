/**
 * The whole lecture library, grouped subject → chapter, for the /video-lectures
 * hub.
 *
 * Derived entirely from lib/chapter-videos.ts + lib/subjects.ts (Iron Rule 5) —
 * there is no second list to keep in step. A lecture appears here the moment it
 * is mapped to a chapter, and disappears the moment it is unmapped, which is
 * the same condition the chapter routes and the notes-page card use.
 *
 * A lecture legitimately serves more than one chapter (the GPS lectures run on
 * rnav-18, anav-1 and ari-1), so the same video can appear under several
 * chapters here. That is correct for a study index — a student looking at
 * Radio Aids should see it without having to know it also lives under
 * Radio Navigation.
 */
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import { getChapterVideos } from "@/lib/chapter-videos";
import { VIDEO_METADATA } from "@/lib/generated/video-metadata";

export type IndexedLecture = {
  id: string;
  /** Curated label from chapter-videos.ts, else YouTube's own title. */
  title: string;
  /** "12:43" — only when real metadata was read for this video. */
  duration: string | null;
  thumbnail: string;
  watchUrl: string;
};

export type IndexedChapter = {
  id: string;
  number: number;
  title: string;
  chapterUrl: string;
  lectures: IndexedLecture[];
};

export type IndexedSubject = {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  subjectUrl: string;
  chapters: IndexedChapter[];
  lectureCount: number;
};

/* Series boilerplate carried by the raw YouTube titles. Stripped only when this
   index has to fall back to the YouTube title, i.e. when chapter-videos.ts has
   no curated label. Matched against whole pipe-separated segments, never as
   substrings — a substring match would eat real topic words. */
const TITLE_BOILERPLATE = new Set([
  "free", "free course", "free ground school", "atpl & cpl", "cpl & atpl",
  "atpl", "cpl", "youtube", "atpl instruments", "air law & regs", "air law",
  "radio navigation", "meteorology", "atpl & cpl meteorology", "air regulations",
  "instruments", "dgca", "ground school",
]);
const CH_SEGMENT = /^ch\.?\s*0*\d+(\s*part\s*\d+)?$/i;

/** "Ch.21 | TAFs Terminal Aerodrome Forecast | ATPL & CPL | FREE" → "TAFs Terminal Aerodrome Forecast" */
function tidyYouTubeTitle(raw: string): string | null {
  const kept = raw
    .split("|")
    .map(p => p.trim())
    .filter(p => p && !CH_SEGMENT.test(p) && !TITLE_BOILERPLATE.has(p.toLowerCase().replace(/\.$/, "")));
  const out = kept.join(" — ").replace(/\s{2,}/g, " ").trim();
  return out || null;
}

/** ISO-8601 "PT10M37S" → "10:37". Returns null rather than guessing. */
function readableDuration(iso: string | undefined): string | null {
  if (!iso) return null;
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
  if (!m) return null;
  const [h, min, s] = [Number(m[1] ?? 0), Number(m[2] ?? 0), Number(m[3] ?? 0)];
  const mm = h > 0 ? String(min).padStart(2, "0") : String(min);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}

function buildTrack(track: "cpl" | "atpl"): IndexedSubject[] {
  const subjects = track === "cpl" ? CPL_SUBJECTS : ATPL_SUBJECTS;

  return subjects
    .map(s => {
      const chapters = s.chapters
        .map(c => {
          const vids = getChapterVideos(s.id, c.id);
          return {
            id: c.id,
            number: c.number,
            title: c.title,
            chapterUrl: `/${track}/${s.id}/${c.id}/notes`,
            lectures: vids.map((v, i) => {
              const meta = VIDEO_METADATA[v.id];
              return {
                id: v.id,
                // The curated label is the better one: it was written against
                // the chapter. Otherwise use YouTube's title with its series
                // boilerplate stripped, then the chapter's own title, then a
                // plain part number — never an invented topic.
                title: v.label
                  ?? (meta?.name ? tidyYouTubeTitle(meta.name) : null)
                  ?? (vids.length === 1 ? c.title : `Part ${i + 1}`),
                duration: readableDuration(meta?.duration),
                thumbnail: meta?.thumbnailUrl ?? `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`,
                watchUrl: `https://www.youtube.com/watch?v=${v.id}`,
              };
            }),
          };
        })
        .filter(c => c.lectures.length > 0);

      return {
        id: s.id,
        name: s.name,
        shortName: s.shortName,
        icon: s.icon,
        color: s.color,
        subjectUrl: `/${track}/${s.id}`,
        chapters,
        lectureCount: chapters.reduce((n, c) => n + c.lectures.length, 0),
      };
    })
    .filter(s => s.chapters.length > 0);
}

export function videoIndex(): { cpl: IndexedSubject[]; atpl: IndexedSubject[] } {
  return { cpl: buildTrack("cpl"), atpl: buildTrack("atpl") };
}

/** Totals for the hub header and the nav badge — always derived, never typed. */
export function videoIndexTotals() {
  const { cpl, atpl } = videoIndex();
  const all = [...cpl, ...atpl];
  const distinct = new Set(
    all.flatMap(s => s.chapters.flatMap(c => c.lectures.map(l => l.id))),
  );
  return {
    subjects: all.length,
    chapters: all.reduce((n, s) => n + s.chapters.length, 0),
    lectureSlots: all.reduce((n, s) => n + s.lectureCount, 0),
    distinctLectures: distinct.size,
  };
}
