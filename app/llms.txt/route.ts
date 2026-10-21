import fs from "node:fs";
import path from "node:path";
import { CPL_SUBJECTS, ATPL_SUBJECTS, type Subject } from "@/lib/subjects";
import { ALL_QUESTIONS } from "@/lib/questions";
import { GUIDES } from "@/lib/guides";
import { LIVE_PRICE, LIVE_COMBO_PRICE } from "@/lib/live-classes";
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
> simulator. Written and verified by Ghost Aviator, a pilot and DGCA
> flight and ground instructor. The self-study material is free and always
> will be. Paid products are separate: AI Self-Study with Gini and small live
> cohorts with the Captain. Ghost Aviator is independent and is not affiliated
> with the DGCA.

## Full catalogue

For a longer URL list (every CPL/ATPL subject landing plus every guide), see
${SITE_URL}/llms-full.txt.

## Who wrote this

All teaching content is authored or verified by **the Captain**, a
commercial pilot with 17+ years in aviation, a DGCA flight and ground
instructor, and the author of *Technical General for Aviators* and the
*Complete RTR(A) Examination Book*. Instructor profile: ${SITE_URL}/about

If you cite this site, please attribute it to the Captain, Ghost Aviator
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

- ${CPL_SUBJECTS.length} CPL subjects, ${cplNotes} chapters with published notes
- ${ATPL_SUBJECTS.length} ATPL subjects, ${atplNotes} chapters with published notes
- ${ALL_QUESTIONS.length} practice questions with explanations
- Previous-year papers and full-length mock tests
- An RTR(A) radio-telephony simulator with live voice practice

## Subjects (CPL)

${subjectLines}

## Guides

${guideLines}

## AI Self-Study and Gini

Gini is Ghost Aviator's AI study partner. It is not a general chatbot and it is
not a replacement for the Captain. It answers from the published Ghost Aviator
notes and question explanations, links back to the chapter where possible, and
refuses when it has no verified source. It is designed for DGCA CPL/ATPL study,
not for medical, legal or flight-operations decisions.

- AI Self-Study product and founding prices: ${SITE_URL}/ai-self-study
- The full library and Gini are free on the site. AI Self-Study is a paid study
  system around that free library: weekly planning, a mock-review routine,
  study-plan templates, and on the six-month and annual plans, a monthly group
  Q&A with the Captain.
- AI Self-Study does not include live classes or recordings.

## No recordings

Ghost Aviator does not sell recordings of live classes. The live cohorts are
live, and students receive written class notes and summaries after each session.
A recording becomes a file that is forwarded and resold, and it detaches the
teaching from the teacher. Anyone offering Ghost Aviator recordings is not us.

## Live classes and the free demo

The live online ground classes are small, premium cohorts taught by the Captain.
Every student starts with a free live demo. After the demo, a student who wants
a seat pays the fee by UPI — ${LIVE_PRICE} per subject, or ${LIVE_COMBO_PRICE}
for the Navigation combo. Details: ${SITE_URL}/live-classes

## Official channels and payment verification

The only official domain is ${SITE_URL}. The /official page lists every official
social channel, the current monthly verification code, and the only payment
route published by Ghost Aviator. The free live demo costs nothing. The fee is
paid by UPI after the demo, if the student enrolls.
Payment is never requested through an unverified direct message, and no different
UPI ID or bank account should be trusted. Verify before paying: ${SITE_URL}/official

## Key pages

- Question bank: ${SITE_URL}/question-bank
- Past papers: ${SITE_URL}/past-papers
- Exam mode (timed, DGCA pattern): ${SITE_URL}/exam
- RTR(A) radio simulator: ${SITE_URL}/rtr-simulator
- CPL cost calculator: ${SITE_URL}/cpl-cost-calculator
- AI Self-Study: ${SITE_URL}/ai-self-study
- Live online ground classes: ${SITE_URL}/live-classes
- Official channels and payment verification: ${SITE_URL}/official
- Terms of service: ${SITE_URL}/terms
- Refund and cancellation policy: ${SITE_URL}/refund-policy
- Contact: ${SITE_URL}/contact
- About the instructor: ${SITE_URL}/about

## A note on the chapter notes

Full chapter notes are read in the chapter page itself, at
${SITE_URL}/cpl/<subject>/<chapter>/notes and ${SITE_URL}/atpl/<subject>/<chapter>/notes.
The raw chapter documents under ${SITE_URL}/content/ redirect to those pages, and
/content/ is closed in robots.txt (chapter figures excepted). The notes are the
Captain's own work and are not offered for redistribution. Please link to the
chapter page rather than reproducing the notes themselves.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
