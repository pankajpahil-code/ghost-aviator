/**
 * Which chapter notes the sitemap submits (2026-10-29).
 *
 * WHY THE SITEMAP IS SHORT NOW. Search Console on 2026-10-27: 1 page indexed,
 * 848 not indexed (486 "Discovered – currently not indexed", 354 "Crawled –
 * currently not indexed"). The domain was registered 2 Jun 2026 and was asking
 * Google about 690 URLs at once. On a new domain with little outside authority
 * Google crawls a small budget, and "Discovered – not indexed" is that budget
 * running out, not a technical block. See /workspace/seo/index-diagnosis-2026-10-27.md.
 *
 * So the sitemap now names the best ~150 URLs, not every indexable one. Leaving
 * a page OUT of the sitemap does not noindex it: every chapter notes page below
 * and every one not below stays indexable, self-canonical and linked from its
 * subject hub. Google can still find and index them through links. The sitemap
 * only tells Google where to start.
 *
 * HOW THESE WERE PICKED (per CPL subject):
 *   1. Chapters Google already showed in search (impressions in the Jun–Jul GSC
 *      export, gsc-data/Pages.csv) — evidence Google once judged them worth it.
 *   2. The chapters featured on the homepage (START_HERE in app/page.tsx).
 *   3. Then the longest notes by visible word count, skipping revision/mock
 *      chapters (question lists, which overlap the /questions pages).
 *   About 5 per paper, 3 for the DA-42 and Human Performance references.
 *
 * This is an editorial list: the Captain can add or swap chapters. A chapter
 * listed here that stops serving real notes is dropped automatically
 * (app/sitemap.ts still checks isIndexableChapterRoute), so it can never submit
 * a stub. Grow the list as pages get indexed; do not jump back to all of them.
 */
export const SITEMAP_NOTES: ReadonlyArray<readonly [subjectId: string, chapterId: string]> = [
  // Air Navigation
  ["air-navigation", "nav-6"],      // Mass & Balance — Aeroplanes
  ["air-navigation", "nav-16"],     // The 1 in 60 Rule (homepage)
  ["air-navigation", "nav-cx3-5"],  // CX-3: Distance, Speed and Time
  ["air-navigation", "nav-cx3-6"],  // CX-3: True Airspeed and Altitude
  ["air-navigation", "nav-cx3-9"],  // CX-3: Multi-Drift and Wind Components
  ["air-navigation", "nav-9"],      // CX-3: Wind Finding and Flight Planning
  // Meteorology
  ["meteorology", "met-21"],        // Meteorological Services for Aviation (had impressions)
  ["meteorology", "met-18"],        // Tropical Systems (had impressions)
  ["meteorology", "met-23"],        // Met Instruments (had impressions)
  ["meteorology", "met-13"],        // Thunderstorm (homepage)
  ["meteorology", "met-25"],        // METAR, SPECI & TREND (homepage)
  ["meteorology", "met-6"],         // Winds
  ["meteorology", "met-1"],         // Atmosphere
  // Air Regulations
  ["air-regulations", "ar-6"],      // Separation in the Vicinity of Aerodromes (had impressions)
  ["air-regulations", "ar-8"],      // ATS Surveillance (had impressions)
  ["air-regulations", "ar-10"],     // Search and Rescue (had impressions)
  ["air-regulations", "ar-12"],     // PANS-OPS (had impressions)
  ["air-regulations", "ar-4"],      // Air Traffic Services (had impressions)
  ["air-regulations", "ar-3"],      // Rules of the Air (homepage)
  // Technical General
  ["technical-general", "tg-7"],    // Stalling, Spinning, and Recovery (had impressions)
  ["technical-general", "tg-1"],    // The Atmosphere and Its Properties
  ["technical-general", "tg-9"],    // Aircraft Stability
  ["technical-general", "tg-6"],    // A Deeper Dive into Drag
  ["technical-general", "tg-10"],   // Aircraft Controls
  // Technical Specific (DA-42 NG)
  ["technical-specific", "da42-1"], // The Aircraft & Its Systems
  ["technical-specific", "da42-2"], // Powerplant
  ["technical-specific", "da42-3"], // Fuel System
  // Radio Telephony
  ["radio-telephony", "rtf-5"],     // FIRs, Frequencies & Aeronautical Information (had impressions)
  ["radio-telephony", "rtf-12"],    // Navigation Aids
  ["radio-telephony", "rtf-1"],     // The RTR(A) Exam
  ["radio-telephony", "rtf-3"],     // Licensing, Radio Apparatus & Minimum Equipment
  ["radio-telephony", "rtf-20"],    // Distress, Urgency & Communications Failure (homepage)
  // Instrumentation
  ["instrumentation", "inst-7"],    // The Machmeter (had impressions)
  ["instrumentation", "inst-10"],   // The Direct Indicating Compass (had impressions)
  ["instrumentation", "inst-11"],   // Gyroscopes (had impressions)
  ["instrumentation", "inst-13"],   // The Artificial Horizon (had impressions)
  ["instrumentation", "inst-3"],    // Air Temperature Measurement (had impressions, homepage)
  ["instrumentation", "inst-5"],    // The Pressure Altimeter (homepage)
  // Radio Navigation
  ["radio-navigation", "rnav-7"],   // ADF / NDB (had impressions, homepage)
  ["radio-navigation", "rnav-8"],   // VOR (had impressions, homepage)
  ["radio-navigation", "rnav-9"],   // ILS (had impressions, homepage)
  ["radio-navigation", "rnav-6"],   // VHF Direction Finder (had impressions)
  ["radio-navigation", "rnav-3"],   // Modulation (had impressions)
  // Human Performance (supporting reference)
  ["human-performance", "hpl-14"],  // Illusions & Spatial Disorientation
  ["human-performance", "hpl-5"],   // Breath & Blood
  ["human-performance", "hpl-24"],  // Sleep & Body Clock
];

const SET = new Set(SITEMAP_NOTES.map(([s, c]) => `${s}/${c}`));

/** Is this CPL chapter's notes page one of the submitted ones? */
export function isSitemapNotes(subjectId: string, chapterId: string): boolean {
  return SET.has(`${subjectId}/${chapterId}`);
}
