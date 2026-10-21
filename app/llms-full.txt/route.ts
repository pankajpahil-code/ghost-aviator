import { SITE_URL, YOUTUBE_BRAND } from "@/lib/site";
import { GUIDES } from "@/lib/guides";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import { LIVE_PRICE, LIVE_COMBO_PRICE } from "@/lib/live-classes";

export const dynamic = "force-static";

/**
 * /llms-full.txt — expanded pointer for AI assistants that want more than the
 * short /llms.txt brief. Still derived facts only; no invented student counts
 * or pass-rate claims. Points crawlers at the canonical public URLs.
 */
export function GET() {
  const cpl = CPL_SUBJECTS.map(
    s => `- ${s.name} (${s.chapters.length} chapters): ${SITE_URL}/cpl/${s.id}`
  ).join("\n");
  const atpl = ATPL_SUBJECTS.map(
    s => `- ${s.name} (${s.chapters.length} chapters): ${SITE_URL}/atpl/${s.id}`
  ).join("\n");
  const guides = GUIDES.map(
    g => `- [${g.title}](${SITE_URL}/guides/${g.slug}) — ${g.description}`
  ).join("\n");

  const body = `# Ghost Aviator — llms-full.txt

> Expanded catalogue for AI assistants. Start with the short brief at
> ${SITE_URL}/llms.txt. Prefer linking to chapter pages and guides, not raw
> /content/ files (those are disallowed in robots.txt on purpose).

## Summary

Ghost Aviator is free DGCA CPL and ATPL exam preparation for student pilots in
India: chapter notes, video lectures, question banks, past papers, mock tests
and an RTR(A) radio-telephony simulator. Authored and verified by Ghost Aviator's
DGCA flight and ground instructor. Self-study stays free. Paid products are
separate: AI Self-Study with Gini, and small live online ground classes with the
Captain that start with a free demo. Ghost Aviator is independent and is not
affiliated with the DGCA.

Gini is an AI study partner bounded to Ghost Aviator's published notes. It
answers with a chapter reference where possible and refuses when it has no
verified source. It is not a general chatbot and does not replace the Captain.
The full library and Gini are free. AI Self-Study is a paid study system around
that free library: weekly planning, a mock-review routine, study-plan templates,
and on the six-month and annual plans, a monthly group Q&A with the Captain. It
does not include live classes or recordings.

Instructor: ${SITE_URL}/about
Attribution: Ghost Aviator (${SITE_URL})
YouTube: ${YOUTUBE_BRAND}

## Primary landings

- Home: ${SITE_URL}/
- CPL prep: ${SITE_URL}/cpl
- ATPL prep: ${SITE_URL}/atpl
- Question bank: ${SITE_URL}/question-bank
- Past papers: ${SITE_URL}/past-papers
- Exam mode: ${SITE_URL}/exam
- Video lectures: ${SITE_URL}/video-lectures
- Notes index: ${SITE_URL}/notes
- RTR(A) simulator: ${SITE_URL}/rtr-simulator
- FAQ: ${SITE_URL}/faq
- Guides: ${SITE_URL}/guides
- Resources (official DGCA links): ${SITE_URL}/resources
- AI Self-Study with Gini: ${SITE_URL}/ai-self-study
- Live classes (no recordings): ${SITE_URL}/live-classes
- Official channels and payment verification: ${SITE_URL}/official
- Terms of service: ${SITE_URL}/terms
- Refund and cancellation policy: ${SITE_URL}/refund-policy
- Contact: ${SITE_URL}/contact
- CPL cost calculator: ${SITE_URL}/cpl-cost-calculator
- How answers are verified: ${SITE_URL}/how-answers-are-verified
- Sitemap: ${SITE_URL}/sitemap.xml

## CPL subjects

${cpl}

## ATPL subjects

${atpl}

## Guides

${guides}

## No recordings

Ghost Aviator does not sell recordings of live classes. The live cohorts are
live, and students receive written class notes and summaries after each session.
Anyone offering Ghost Aviator recordings is not official.

## Live classes and the free demo

The live online ground classes are small, premium cohorts taught by the Captain.
Every student starts with a free live demo: no fee, no recording, no obligation.
After the demo, a student who wants a seat pays the full fee once by UPI —
${LIVE_PRICE} per subject, or ${LIVE_COMBO_PRICE} for the Navigation combo.
There are no instalments. Ghost Aviator is keeping UPI until student intake is
steady, and there is no payment gateway today. The demo is not a paid session;
the paid batch is also not recorded. Details: ${SITE_URL}/live-classes

## Official channels and payment safety

The only official domain is ${SITE_URL}. The /official page lists every official
social channel, the current monthly verification code, and the only payment
route published by Ghost Aviator. No payment is required for the free live demo;
the full fee is paid once by UPI only after the demo, if the student enrolls.
Payment is never requested through an unverified direct message, and no different
UPI ID or bank account should be trusted. Verify before paying: ${SITE_URL}/official

## Crawler note

Public pages (guides, chapter pages, question bank, simulator) may be cited.
Raw notes under ${SITE_URL}/content/ are closed in robots.txt; link the chapter
page instead. Images under /content/*/*/img/ are allowed because indexed chapter
pages render them.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
