/**
 * Syllabus pages: which paper is which, and which mapped chapters a student can
 * actually open. The syllabus text is generated (lib/generated/dgca-syllabus.ts);
 * this file only adds presentation and resolves chapter links at build time.
 */
import { SYLLABUS_PAPERS, type SyllabusPaper, type SyllabusSection } from "./generated/dgca-syllabus";
import { CPL_SUBJECTS } from "./subjects";
import { servesRealNotes } from "./indexability";

export type PaperMeta = {
  slug: string;
  name: string;
  /**
   * Plain-language scope. questions/duration are the DGCA paper as stated in
   * /guides/dgca-cpl-exam-pattern. Deliberately NOT Subject.totalQuestions /
   * examDuration from lib/subjects.ts: those size the site's own practice tests
   * (air-navigation there is 50 questions in 60 minutes, one third of the pooled
   * DGCA Navigation paper).
   */
  blurb: string;
  questions: number;
  duration: string;
};

export const PAPER_META: PaperMeta[] = [
  {
    slug: "air-navigation",
    name: "Air Navigation",
    blurb: "The widest paper. Appendix A of the CAR puts general navigation, mass and balance, performance, flight planning, radio navigation and instruments into this one paper.",
    questions: 100,
    duration: "3 hours",
  },
  {
    slug: "meteorology",
    name: "Aviation Meteorology",
    blurb: "The atmosphere, wind, clouds and fog, fronts and pressure systems, the climatology of India, flight hazards and the met reports and forecasts you will read before every flight.",
    questions: 50,
    duration: "2 hours",
  },
  {
    slug: "air-regulations",
    name: "Air Regulations",
    blurb: "International and Indian air law, air traffic services, aerodromes and search and rescue, plus Human Performance and Limitations, operational procedures and VFR and IFR communications, all of which Appendix C places in this paper.",
    questions: 50,
    duration: "2 hours",
  },
  {
    slug: "technical-general",
    name: "Technical General (Aircraft & Engines)",
    blurb: "Airframe and systems, electrics, piston and turbine engines, emergency equipment and the principles of flight.",
    questions: 100,
    duration: "3 hours",
  },
];

export function paper(slug: string): SyllabusPaper | undefined {
  return SYLLABUS_PAPERS.find(p => p.slug === slug);
}

export function paperMeta(slug: string): PaperMeta | undefined {
  return PAPER_META.find(p => p.slug === slug);
}

export type ChapterLink = { href: string; label: string; subject: string };

const subjectName = (id: string) => CPL_SUBJECTS.find(s => s.id === id)?.shortName ?? id;

/** Mapped chapters that serve real notes, as links. A chapter written later appears on the next build. */
export function chapterLinks(refs: string[]): ChapterLink[] {
  const out: ChapterLink[] = [];
  for (const ref of refs) {
    const [subjectId, chapterId] = ref.split("/");
    const subject = CPL_SUBJECTS.find(s => s.id === subjectId);
    const chapter = subject?.chapters.find(c => c.id === chapterId);
    if (!subject || !chapter || !servesRealNotes(subjectId, chapterId)) continue;
    out.push({
      href: `/cpl/${subjectId}/${chapterId}/notes`,
      label: `Ch.${chapter.number} ${chapter.title}`,
      subject: subjectName(subjectId),
    });
  }
  return out;
}

/** The units a student studies: each lettered topic, or a section that has none. */
export function studyUnits(p: SyllabusPaper) {
  const units: { id: string; chapters: string[] }[] = [];
  for (const s of p.sections) {
    if (s.topics.length) s.topics.forEach(t => units.push({ id: `${s.key}.${t.letter}`, chapters: t.chapters }));
    else if (s.items.length || isLeafHeading(p, s)) units.push({ id: s.key, chapters: s.chapters });
  }
  return units;
}

/** A heading-only section counts as a topic unless it just groups numbered children. */
export function isLeafHeading(p: SyllabusPaper, s: SyllabusSection): boolean {
  if (s.topics.length || s.items.length) return false;
  if (!/^\d+\.\d+/.test(s.num)) return false;
  return !p.sections.some(o => o.num.startsWith(s.num + "."));
}

/** How many study units link to at least one readable chapter. */
export function coverage(p: SyllabusPaper) {
  const units = studyUnits(p);
  const covered = units.filter(u => chapterLinks(u.chapters).length > 0).length;
  return { covered, total: units.length };
}
