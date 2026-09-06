/**
 * Emits videoId -> canonical chapter URL, for the YouTube description pass.
 *
 * A lecture may legitimately serve several chapters (the GPS lectures run on
 * rnav-18, anav-1 and ari-1). A description can only carry one primary link, so
 * CPL wins over ATPL — the CPL paper is what most of this audience is sitting —
 * and within a track the first chapter claiming the video wins, which is its
 * position in reading order. Every other chapter it serves is emitted as `also`
 * so the description can still mention them.
 */
import { writeFileSync } from "node:fs";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import { CHAPTER_VIDEOS } from "@/lib/chapter-videos";
import { SITE_URL } from "@/lib/site";

// Iron Rule 5: derived, never hardcoded. This read "https://www.ghostaviator.com"
// until 2026-09-06 while lib/site.ts has always canonicalised to the apex, so
// every one of the 201 lecture descriptions published a URL that 307-redirects
// — an extra hop for exactly the student on a cheap phone this site is built
// for, and a channel pointing all its links at a host the site does not consider
// canonical. The file comment above already called this "the canonical chapter
// URL"; it just was not one.
const SITE = SITE_URL;

type Placement = {
  track: "cpl" | "atpl";
  subjectId: string; subjectName: string; subjectShort: string;
  chapterId: string; chapterNumber: number; chapterTitle: string;
  url: string;
  questionCount: number;
};

const chapterMeta = new Map<string, Omit<Placement, "url">>();
for (const [track, subjects] of [["cpl", CPL_SUBJECTS], ["atpl", ATPL_SUBJECTS]] as const) {
  for (const s of subjects) {
    for (const c of s.chapters) {
      chapterMeta.set(`${s.id}/${c.id}`, {
        track, subjectId: s.id, subjectName: s.name, subjectShort: s.shortName,
        chapterId: c.id, chapterNumber: c.number, chapterTitle: c.title,
        questionCount: c.questionCount,
      });
    }
  }
}

const byVideo = new Map<string, Placement[]>();
for (const [key, vids] of Object.entries(CHAPTER_VIDEOS)) {
  const m = chapterMeta.get(key);
  if (!m) throw new Error(`chapter-videos key has no chapter in subjects.ts: ${key}`);
  const url = `${SITE}/${m.track}/${m.subjectId}/${m.chapterId}/notes`;
  for (const v of vids) {
    if (!byVideo.has(v.id)) byVideo.set(v.id, []);
    byVideo.get(v.id)!.push({ ...m, url });
  }
}

const out: Record<string, { primary: Placement; also: Placement[] }> = {};
for (const [id, places] of byVideo) {
  const sorted = [...places].sort((a, b) =>
    a.track === b.track ? 0 : a.track === "cpl" ? -1 : 1);
  out[id] = { primary: sorted[0], also: sorted.slice(1) };
}

writeFileSync("tools/_video-chapter-map.json", JSON.stringify(out, null, 2));
console.log(`wrote ${Object.keys(out).length} video -> chapter placements`);
