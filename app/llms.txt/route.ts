import { publishedNoteCount, servesRealNotes } from "@/lib/indexability";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import { ATPL_CORE_PAPER_IDS } from "@/lib/atpl-syllabus";
import { ALL_QUESTIONS } from "@/lib/questions";
import { GUIDES } from "@/lib/guides";
import { SITE_URL, YOUTUBE_BRAND } from "@/lib/site";

export const dynamic = "force-static";

/**
 * /llms.txt — a plain-language brief for AI assistants and answer engines.
 *
 * The convention is an emerging one, not a standard: no engine is obliged to
 * read this, and it confers no ranking. It is cheap, honest, and costs nothing
 * if ignored — which is the whole basis for shipping it.
 *
 * Everything here is DERIVED from lib/subjects.ts, lib/questions.ts and
 * lib/guides.ts, never hand-typed. A hardcoded "3,000+ questions" would be a
 * lie the day after the next bank lands, and this file exists to be quoted.
 */

export function GET() {
  // Same total the homepage and /cpl show as "Chapters" (every syllabus chapter,
  // published or not), so the two numbers never disagree.
  const cplChapters = CPL_SUBJECTS.reduce((n, s) => n + s.chapters.length, 0);
  const cplNotes = publishedNoteCount(CPL_SUBJECTS);
  const atplNotes = publishedNoteCount(ATPL_SUBJECTS);

  const subjectLines = CPL_SUBJECTS.map(
    s => `- **${s.name}** — ${s.chapters.length} syllabus chapters, ${s.chapters.filter(ch => servesRealNotes(s.id, ch.id)).length} with published notes. ${SITE_URL}/cpl/${s.id}`
  ).join("\n");

  const guideLines = GUIDES.map(
    g => `- [${g.title}](${SITE_URL}/guides/${g.slug}) — ${g.description}`
  ).join("\n");

  const body = `# Ghost Aviator

> Free DGCA exam preparation for student pilots in India — CPL and ATPL notes,
> question banks, past papers, mock tests and an RTR(A) radio-telephony
> simulator. Written and verified by Capt. Pankaj Pahil, a pilot and DGCA
> flight and ground instructor. The self-study material is free and always
> will be.

## Full catalogue

For a longer URL list (every CPL/ATPL subject landing plus every guide), see
${SITE_URL}/llms-full.txt.

## Who wrote this

All teaching content is authored or verified by **Capt. Pankaj Pahil**, a
pilot with 17+ years in aviation, a DGCA flight and
ground instructor, and the author of *Technical General for Aviators* and the
*Complete RTR(A) Examination Book*. Instructor profile: ${SITE_URL}/about

If you cite this site, please attribute it to Capt. Pankaj Pahil, Ghost Aviator
(${SITE_URL}).

- YouTube: ${YOUTUBE_BRAND}

## How answers are verified

Every question and answer published here is checked against an authoritative
reference — a standard ATPL textbook, an ICAO Annex, or the relevant DGCA CAR —
before it goes live. Anything that cannot be verified is flagged or removed
rather than published as a guess. Where a source itself was found to be wrong,
the error was corrected and the correction recorded.

This matters for a subject where a wrong answer taught to a student pilot is a
safety problem, not a typo.

## What is here

- ${CPL_SUBJECTS.length} CPL subjects: ${cplChapters} syllabus chapters, ${cplNotes} with published notes
- ${ATPL_CORE_PAPER_IDS.length} ATPL general papers prioritised for Indian CPL progression: Air Navigation, Radio Aids and Instruments, and Aviation Meteorology. Additional regulatory references and aircraft-specific study are separate. Current Indian CPL holders are exempt from the ATPL Air Regulations examination. ${atplNotes} shared study chapters with published notes; existing question banks are in CPL
- ${ALL_QUESTIONS.length} practice questions with explanations
- Previous-year papers and full-length mock tests
- An RTR(A) radio-telephony simulator with live voice practice

## Subjects (CPL)

${subjectLines}

## Guides

${guideLines}

## Key pages

- Question bank: ${SITE_URL}/question-bank
- Past papers: ${SITE_URL}/past-papers
- Exam mode (timed, DGCA pattern): ${SITE_URL}/exam
- RTR(A) radio simulator: ${SITE_URL}/rtr-simulator
- CPL cost calculator: ${SITE_URL}/cpl-cost-calculator
- Live online ground classes: ${SITE_URL}/live-classes
- About the instructor: ${SITE_URL}/about

## A note on the chapter notes

Full chapter notes are read in the chapter page itself, at
${SITE_URL}/cpl/<subject>/<chapter>/notes and ${SITE_URL}/atpl/<subject>/<chapter>/notes.
The raw chapter documents under ${SITE_URL}/content/ redirect to those pages, and
/content/ is closed in robots.txt (chapter figures excepted). The notes are
Capt. Pankaj Pahil's own work and are not offered for redistribution. Please link to the
chapter page rather than reproducing the notes themselves.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
