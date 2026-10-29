import { PQ_BASE, publishedPQSubjects, pqTopics, type PQSubject } from "./previous-questions";

/**
 * Internal links into /dgca-exam-questions (2026-10-29). SERVER ONLY.
 *
 * The 52 previous-question pages were in the sitemap with zero internal links
 * pointing at them (index diagnosis 2026-10-27), so Google had no reason to
 * treat them as important. These helpers give the homepage, the CPL subject
 * hubs and the matching notes/questions chapters plain links into them.
 *
 * The chapter -> topic map below is written by hand, not guessed from words:
 * a keyword match sent "Flight Management System" to "The ICAO Flight Plan".
 * A chapter not listed links to its paper's subject page only, which is always
 * correct. A topic slug that stops existing in the data is skipped, never
 * linked, so a renamed topic can not create a broken link.
 */

/** Which DGCA paper's previous questions cover a CPL subject's syllabus. */
const PAPER_FOR_SUBJECT: Record<string, string> = {
  "meteorology": "cpl-meteorology",
  "air-regulations": "cpl-air-regulations",
  // The DGCA CPL Air Navigation paper also examines instruments and radio aids.
  "air-navigation": "cpl-navigation",
  "instrumentation": "cpl-navigation",
  "radio-navigation": "cpl-navigation",
};

/** CPL chapter id -> previous-question topic slug, for confident matches only. */
const TOPIC_FOR_CHAPTER: Record<string, string> = {
  // Air Navigation
  "nav-13": "the-earth-latitude-longitude-and-distance",
  "nav-14": "the-earth-latitude-longitude-and-distance",
  "nav-21": "the-earth-latitude-longitude-and-distance",
  "nav-15": "earth-magnetism-and-the-magnetic-compass",
  "nav-16": "dead-reckoning-wind-and-the-cx-3",
  "nav-17": "dead-reckoning-wind-and-the-cx-3",
  "nav-18": "dead-reckoning-wind-and-the-cx-3",
  "nav-3": "maps-charts-and-projections",
  "nav-19": "maps-charts-and-projections",
  "nav-20": "maps-charts-and-projections",
  "nav-22": "maps-charts-and-projections",
  "nav-23": "maps-charts-and-projections",
  "nav-24": "maps-charts-and-projections",
  "nav-25": "maps-charts-and-projections",
  "nav-26": "maps-charts-and-projections",
  "nav-27": "time-the-sun-and-twilight",
  "nav-28": "time-the-sun-and-twilight",
  "nav-29": "time-the-sun-and-twilight",
  "nav-cp-pnr": "critical-point-and-point-of-no-return",
  "nav-6": "mass-balance-and-stability",
  "nav-7": "performance-and-v-speeds",
  "nav-8": "performance-and-v-speeds",
  "nav-9": "dead-reckoning-wind-and-the-cx-3",
  "nav-cx3-5": "dead-reckoning-wind-and-the-cx-3",
  "nav-cx3-6": "airspeed-mach-and-vertical-speed",
  "nav-cx3-7": "dead-reckoning-wind-and-the-cx-3",
  "nav-cx3-8a": "dead-reckoning-wind-and-the-cx-3",
  "nav-cx3-9": "dead-reckoning-wind-and-the-cx-3",
  // Instrumentation
  "inst-4": "airspeed-mach-and-vertical-speed",
  "inst-5": "altimeter-pressure-altitude-and-qnh",
  "inst-6": "airspeed-mach-and-vertical-speed",
  "inst-7": "airspeed-mach-and-vertical-speed",
  "inst-9": "earth-magnetism-and-the-magnetic-compass",
  "inst-10": "earth-magnetism-and-the-magnetic-compass",
  "inst-16": "earth-magnetism-and-the-magnetic-compass",
  "inst-17": "earth-magnetism-and-the-magnetic-compass",
  "inst-11": "gyros-and-heading-instruments",
  "inst-12": "gyros-and-heading-instruments",
  "inst-13": "gyros-and-heading-instruments",
  "inst-14": "gyros-and-heading-instruments",
  "inst-15": "gyros-and-heading-instruments",
  "inst-18": "gnss-ins-irs-and-fms",
  "inst-19": "gnss-ins-irs-and-fms",
  "inst-21": "gnss-ins-irs-and-fms",
  "inst-20": "ils-radio-altimeter-and-landing-aids",
  // Radio Navigation
  "rnav-1": "radio-waves-radar-and-ssr",
  "rnav-2": "radio-waves-radar-and-ssr",
  "rnav-5": "radio-waves-radar-and-ssr",
  "rnav-11": "radio-waves-radar-and-ssr",
  "rnav-12": "radio-waves-radar-and-ssr",
  "rnav-13": "radio-waves-radar-and-ssr",
  "rnav-14": "radio-waves-radar-and-ssr",
  "rnav-6": "vor-adf-dme-and-bearings",
  "rnav-7": "vor-adf-dme-and-bearings",
  "rnav-8": "vor-adf-dme-and-bearings",
  "rnav-15": "vor-adf-dme-and-bearings",
  "rnav-9": "ils-radio-altimeter-and-landing-aids",
  "rnav-10": "ils-radio-altimeter-and-landing-aids",
  "rnav-16": "gnss-ins-irs-and-fms",
  "rnav-18": "gnss-ins-irs-and-fms",
  // Meteorology
  "met-1": "the-atmosphere-and-isa",
  "met-2": "pressure-and-altimetry",
  "met-3": "temperature-and-radiation",
  "met-4": "density",
  "met-5": "humidity",
  "met-6": "wind",
  "met-7": "visibility-and-fog",
  "met-8": "clouds-and-precipitation",
  "met-9": "lapse-rates-and-stability",
  "met-10": "optical-phenomena",
  "met-11": "clouds-and-precipitation",
  "met-12": "icing",
  "met-13": "thunderstorms",
  "met-14": "air-masses-and-fronts",
  "met-15": "jet-streams-and-upper-winds",
  "met-16": "mountain-waves-and-turbulence",
  "met-17": "mountain-waves-and-turbulence",
  "met-18": "tropical-systems-and-cyclones",
  "met-19": "indian-climatology",
  "met-20": "general-circulation",
  "met-25": "reports-forecasts-and-warnings",
  "met-26": "reports-forecasts-and-warnings",
  "met-27": "reports-forecasts-and-warnings",
  "met-29": "reports-forecasts-and-warnings",
  // Air Regulations
  "ar-1": "icao-conventions-and-documents",
  "ar-3": "rules-of-the-air-and-signals",
  "ar-4": "air-traffic-services-and-airspace",
  "ar-5": "separation-and-wake-turbulence",
  "ar-6": "separation-and-wake-turbulence",
  "ar-7": "air-traffic-services-and-airspace",
  "ar-8": "air-traffic-services-and-airspace",
  "ar-9": "aeronautical-information",
  "ar-12": "instrument-procedures",
  "ar-13": "licensing-medical-and-national-rules",
  "ar-14": "licensing-medical-and-national-rules",
  "ar-18": "communications-and-phraseology",
  "ar-22": "human-performance",
  "ar-24": "human-performance",
  "ar-25": "human-performance",
  "ar-26": "human-performance",
};

export type PQLink = { href: string; label: string };

/** The previous-question paper that covers this CPL subject, if published. */
export function pqPaperFor(subjectId: string): PQSubject | undefined {
  const slug = PAPER_FOR_SUBJECT[subjectId];
  return slug ? publishedPQSubjects().find(s => s.slug === slug) : undefined;
}

/**
 * The exam-question links for one CPL chapter: its matching topic page (when
 * mapped) and the paper's subject page. Empty when no paper is published.
 */
export function pqLinksForChapter(subjectId: string, chapterId: string): PQLink[] {
  const paper = pqPaperFor(subjectId);
  if (!paper) return [];
  const out: PQLink[] = [];
  const slug = TOPIC_FOR_CHAPTER[chapterId];
  const topic = slug ? pqTopics(paper).find(t => t.slug === slug) : undefined;
  if (topic) out.push({ href: `${PQ_BASE}/${paper.slug}/${topic.slug}`, label: `Past DGCA exam questions: ${topic.name}` });
  out.push({ href: `${PQ_BASE}/${paper.slug}`, label: `Practice exam questions for this subject (${paper.title})` });
  return out;
}

/**
 * Topic links for a CPL subject hub. The paper's own subject gets every topic;
 * a subject that shares a paper (Instrumentation, Radio Navigation) gets only
 * the topics its chapters map to.
 */
export function pqTopicLinksForSubject(subjectId: string, chapterIds: string[]): PQLink[] {
  const paper = pqPaperFor(subjectId);
  if (!paper) return [];
  const topics = pqTopics(paper);
  const wanted = paper.subjectId === subjectId
    ? topics
    : topics.filter(t => chapterIds.some(id => TOPIC_FOR_CHAPTER[id] === t.slug));
  return wanted.map(t => ({ href: `${PQ_BASE}/${paper.slug}/${t.slug}`, label: t.name }));
}
