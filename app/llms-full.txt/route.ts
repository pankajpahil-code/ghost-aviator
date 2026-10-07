import { SITE_URL, YOUTUBE_BRAND, YOUTUBE_PERSONAL } from "@/lib/site";
import { GUIDES } from "@/lib/guides";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";

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
and an RTR(A) radio-telephony simulator. Authored and verified by Capt. Pankaj
Pahil (DGCA flight and ground instructor). Self-study stays free; live online
ground classes are optional and paid.

Instructor: ${SITE_URL}/about
Attribution: Capt. Pankaj Pahil, Ghost Aviator (${SITE_URL})
YouTube: ${YOUTUBE_BRAND} · ${YOUTUBE_PERSONAL}

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
- Live classes: ${SITE_URL}/live-classes
- CPL cost calculator: ${SITE_URL}/cpl-cost-calculator
- How answers are verified: ${SITE_URL}/how-answers-are-verified
- Sitemap: ${SITE_URL}/sitemap.xml

## CPL subjects

${cpl}

## ATPL subjects

${atpl}

## Guides

${guides}

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
