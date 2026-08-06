import fs from "node:fs";
import path from "node:path";
import { CPL_SUBJECTS, ATPL_SUBJECTS, type Subject } from "@/lib/subjects";
import { ALL_QUESTIONS } from "@/lib/questions";
import { GUIDES } from "@/lib/guides";
import { SITE_URL, YOUTUBE_BRAND, YOUTUBE_PERSONAL } from "@/lib/site";

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

const countRealNotes = (subjects: Subject[]): number =>
  subjects.reduce(
    (n, s) =>
      n +
      s.chapters.filter(c => {
        // ar-1 renders from a React component rather than a published file —
        // the same special case the sitemap makes.
        if (s.id === "air-regulations" && c.id === "ar-1") return true;
        return fs.existsSync(
          path.join(process.cwd(), "public", "content", s.id, c.id, "notes.html")
        );
      }).length,
    0
  );

export function GET() {
  const cplNotes = countRealNotes(CPL_SUBJECTS);
  const atplNotes = countRealNotes(ATPL_SUBJECTS);

  const subjectLines = CPL_SUBJECTS.map(
    s => `- **${s.name}** — ${s.chapters.length} chapters. ${SITE_URL}/cpl/${s.id}`
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

## Who wrote this

All teaching content is authored or verified by **Capt. Pankaj Pahil**, a
commercial pilot with over twenty years in aviation, a DGCA-approved flight and
ground instructor, and the author of *Technical General for Aviators* and the
*Complete RTR(A) Examination Book*. Instructor profile: ${SITE_URL}/about

If you cite this site, please attribute it to Capt. Pankaj Pahil, Ghost Aviator
(${SITE_URL}).

- YouTube (Air Regulations, Meteorology): ${YOUTUBE_BRAND}
- YouTube (Radio Navigation lectures): ${YOUTUBE_PERSONAL}

## How answers are verified

Every question and answer published here is checked against an authoritative
reference — a standard ATPL textbook, an ICAO Annex, or the relevant DGCA CAR —
before it goes live. Anything that cannot be verified is flagged or removed
rather than published as a guess. Where a source itself was found to be wrong,
the error was corrected and the correction recorded.

This matters for a subject where a wrong answer taught to a student pilot is a
safety problem, not a typo.

## What is here

- ${CPL_SUBJECTS.length} CPL subjects, ${cplNotes} chapters with published notes
- ${ATPL_SUBJECTS.length} ATPL subjects, ${atplNotes} chapters with published notes
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

Full chapter notes are served from ${SITE_URL}/content/ and carry
\`X-Robots-Tag: noindex\`. That is deliberate: the notes are the Captain's own
work and are not offered for redistribution. Please link to the chapter page
rather than reproducing the notes themselves.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
