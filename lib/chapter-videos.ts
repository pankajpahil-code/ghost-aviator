// Chapter → YouTube lecture mapping — the single source of truth.
// Consumed by the chapter /video route, the notes-page lecture card, and the
// sitemap (whose gate must stay identical to the route's render condition).
//
// The Captain uploads continuously to two channels:
//   https://www.youtube.com/@PankajPahil          (Radio Navigation series)
//   https://www.youtube.com/@Capt.GhostAviator    (Air Regulations, Meteorology)
//
// TO WIRE A NEW LECTURE: add one line below — the video page, the notes-page
// card and the sitemap all light up on their own. Helper:
//   node tools/suggest-chapter-videos.mjs
// prints the newest uploads from both channels next to the chapter they look
// like they belong to, so a human confirms every pairing before it ships.
//
// ⚠️ MAP BY TOPIC, NEVER BY CHAPTER NUMBER. The Radio Navigation lecture
// series follows a fuller syllabus than this site's 20-chapter Radio Nav
// subject: lecture "Ch.14" is MLS, while the site's rnav-14 is SSR. Mapping by
// number would have shown a student studying SSR a lecture on MLS. Always read
// the video title against the chapter title in lib/subjects.ts.

/** One lecture. `label` is only needed for multi-part series. */
export type ChapterVideo = { id: string; label?: string };

// Key: "<subjectId>/<chapterId>". Value: lectures in viewing order.
export const CHAPTER_VIDEOS: Record<string, ChapterVideo[]> = {
  /* ---------------- Air Regulations (@Capt.GhostAviator) ----------------
     Lecture numbering matches this site's chapter numbering exactly here. */
  "air-regulations/ar-1":  [{ id: "U-3qsvPNXSQ" }],
  "air-regulations/ar-2":  [{ id: "3clEEVEFjhs" }],
  "air-regulations/ar-3":  [{ id: "49Pb_y2Jy4Y" }],
  "air-regulations/ar-4":  [{ id: "-wNK3jt0_Vc" }],
  "air-regulations/ar-5":  [{ id: "gSiElA8OTKY" }],
  "air-regulations/ar-6":  [{ id: "yEk9FYgRTho" }],
  "air-regulations/ar-7":  [{ id: "wvN_ol_zXPo" }],
  "air-regulations/ar-8":  [{ id: "urz6tppqass" }],
  "air-regulations/ar-9":  [{ id: "a1Zda_GDGSs" }],
  "air-regulations/ar-10": [{ id: "cncICehqRws" }],
  // National Law ← "Ch13 The DGCA National Law Matrix"
  "air-regulations/ar-13": [{ id: "ojBmyaj53cE" }],
  "air-regulations/ar-14": [{ id: "ID4_Qo4yYeY" }],
  // Airworthiness ← "Ch#15 The Regulatory Life Cycle: ICAO Annex 8" (Annex 8 = Airworthiness)
  "air-regulations/ar-15": [{ id: "iM98a2v25q8" }],
  "air-regulations/ar-16": [{ id: "2m5VJdr9_SI" }],
  "air-regulations/ar-17": [{ id: "PrXRLBTukPw" }],
  "air-regulations/ar-18": [{ id: "3NWp7gmYYw8" }],
  "air-regulations/ar-24": [{ id: "rqM1zkllly4" }],
  "air-regulations/ar-25": [
    { id: "AQRtHqEQsMY", label: "Part 1" },
    { id: "A7pRpWqpIME", label: "Part 2" },
    { id: "JgpQEckZSS4", label: "Part 3" },
    { id: "eMGIQclKFM0", label: "Part 4" },
    { id: "bZc-_oEVCxE", label: "Part 5" },
  ],

  /* ---------------------- Meteorology (@Capt.GhostAviator) ---------------- */
  "meteorology/met-10": [{ id: "LC_B_w6ErHc" }],

  /* ------------- Radio Navigation (@PankajPahil) — TOPIC-MATCHED -------------
     Lecture number in brackets; it deliberately differs from the chapter id. */
  "radio-navigation/rnav-10": [{ id: "QbzAevd4qjA" }],                 // [Ch.14] MLS
  "radio-navigation/rnav-11": [{ id: "xhQVSoXaib4" }],                 // [Ch.16] Radar Principles of Operation
  "radio-navigation/rnav-12": [{ id: "sUEZolnnsKk" }],                 // [Ch.17] Ground Radar
  "radio-navigation/rnav-13": [{ id: "IozBeMZ_8kw" }],                 // [Ch.18] Airborne Weather Radar
  // SSR covers interrogation modes A/C/S, so the Mode S lecture is part 2 here.
  "radio-navigation/rnav-14": [
    { id: "3c7dyP8_zJM", label: "Secondary Surveillance Radar" },      // [Ch.19]
    { id: "Jiq8HSaEymI", label: "Mode S" },                            // [Ch.20]
  ],
  "radio-navigation/rnav-15": [{ id: "mIMrrpsvMJM" }],                 // [Ch.15] DME
  // The FMS lectures are titled "Area Navigation Systems — FMS ...", i.e. the
  // equipment this chapter's syllabus covers, so they run on as parts 2-4.
  "radio-navigation/rnav-16": [
    { id: "AO9CCreBDrM", label: "Area Navigation (RNAV)" },            // [Ch.21]
    { id: "64e3Tgd0aHk", label: "FMS — purpose & components" },        // [Ch.22]
    { id: "rQngpjEKLLE", label: "FMS — equipment operation" },         // [Ch.23]
    { id: "ogIdZu-eiv0", label: "FMS — supplement" },                  // [Ch.24]
  ],
  "radio-navigation/rnav-18": [
    { id: "jHL9w-I707A", label: "GPS · GLONASS · Galileo" },           // [Ch.26]
    { id: "7QzFqzUpfYc", label: "GPS principles of operation" },       // [Ch.27]
  ],
};

/* AWAITING THE CAPTAIN'S RULING — deliberately NOT mapped, because a guess here
   would put the wrong lecture on a chapter a student is trusting:

   • au8nFcs0z0c  "[Ch.25] Area Nav — Electronic Horizontal Situation Indicator"
       EHSI is an EFIS display format, so rnav-17 (EFIS) fits; but the lecture is
       framed as Area Nav, which would make it another part of rnav-16. Captain
       decides which chapter it teaches.
   • P8lKdWQgwEA  "[Ch.28] Loran C"
       This site's 20-chapter Radio Nav subject has no Loran chapter at all. It
       needs either a new chapter or a home inside an existing one.
   • s8eDBrSIr9g + pAJnbSVahLk  "DGCA Computer Number" (x2)
       Not chapter material — this is the eGCA computer-number process, which is
       exactly the subject of the /guides/computer-number guide. Best embedded
       there, which needs a small guide-page video slot (not built yet). */

export function getChapterVideos(subjectId: string, chapterId: string): ChapterVideo[] {
  return CHAPTER_VIDEOS[`${subjectId}/${chapterId}`] ?? [];
}

/** First lecture for a chapter, or null — for callers that show just one. */
export function getChapterVideo(subjectId: string, chapterId: string): string | null {
  return getChapterVideos(subjectId, chapterId)[0]?.id ?? null;
}
