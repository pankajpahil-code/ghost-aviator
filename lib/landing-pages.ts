import { EXAM_PAPERS, type ExamPaper } from "@/lib/exam-papers-meta";

export type Faq = { q: string; a: string };

/** schema.org FAQPage node built from exactly the Q&A a page renders. */
export const faqPageJsonLd = (faqs: Faq[]) => ({
  "@type": "FAQPage",
  mainEntity: faqs.map(f => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});

export function formatDuration(min: number): string {
  if (min % 60 === 0) {
    const h = min / 60;
    return h === 1 ? "1 hour" : `${h} hours`;
  }
  return `${min} minutes`;
}

export const paperById = (id: string): ExamPaper | undefined => EXAM_PAPERS.find(p => p.id === id);

/**
 * Subjects that get their own question-bank landing page at /question-bank/<subjectId>.
 * The question COUNT is never stored here: pages read it from the live bank.
 * paperId ties the subject to the real DGCA paper in lib/exam-papers-meta.ts.
 */
export type QbLanding = {
  subjectId: string;
  label: string;
  paperId: string;
  intro: string;
  /** Extra sentence for the exam-format FAQ answer. */
  formatNote?: string;
};

export const QB_LANDINGS: QbLanding[] = [
  {
    subjectId: "meteorology",
    label: "Meteorology",
    paperId: "meteorology",
    intro: "Atmosphere, pressure, wind, cloud, stability, icing, thunderstorms, visibility and METAR/TAF reading, practised chapter by chapter.",
  },
  {
    subjectId: "air-regulations",
    label: "Air Regulations",
    paperId: "air-regulations",
    intro: "Rules of the air, licensing, ATS and separation, aerodromes, SAR, accident reporting, human performance and the other chapters the Air Regulations paper draws on.",
  },
  {
    subjectId: "air-navigation",
    label: "Air Navigation",
    paperId: "navigation",
    intro: "General navigation: direction, latitude and longitude, charts, dead reckoning, time, convergency and flight planning.",
    formatNote: "The DGCA Navigation paper pools Air Navigation, Radio Navigation and Instrumentation into one paper, so prepare all three together.",
  },
  {
    subjectId: "radio-navigation",
    label: "Radio Navigation",
    paperId: "navigation",
    intro: "Radio waves and propagation, ADF/NDB, VOR, ILS, DME, radar, SSR and satellite navigation systems.",
    formatNote: "Radio Navigation is one of the three subjects pooled into the single DGCA Navigation paper, together with Air Navigation and Instrumentation.",
  },
  {
    subjectId: "instrumentation",
    label: "Instrumentation",
    paperId: "navigation",
    intro: "Pressure instruments, gyroscopic instruments, compasses, air data and flight-instrument systems.",
    formatNote: "Instrumentation is one of the three subjects pooled into the single DGCA Navigation paper, together with Air Navigation and Radio Navigation.",
  },
  {
    subjectId: "technical-general",
    label: "Technical General",
    paperId: "technical-general",
    intro: "Aircraft and engines: principles of flight, airframes, systems and powerplant, practised chapter by chapter.",
  },
  {
    subjectId: "technical-specific",
    label: "Technical Specific",
    paperId: "technical-specific",
    intro: "Aircraft-type questions. The type covered on this site is the Diamond DA-42 NG: systems, limitations and handling.",
    formatNote: "Technical Specific is examined on the aircraft type you fly, and the type-specific material on this site is built around the Diamond DA-42 NG.",
  },
  {
    subjectId: "radio-telephony",
    label: "RTR(A) Radio Telephony",
    paperId: "rtr-part1",
    intro: "RTR(A) theory: radio-telephony phraseology, procedures and the written Part 1 question style.",
    formatNote: "RTR(A) Part 2 is a practical voice/ATC test rather than a written paper, so practise it in the free Radio Simulator.",
  },
];

export const qbLandingFor = (subjectId: string) => QB_LANDINGS.find(l => l.subjectId === subjectId);