import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ALL_PAST_PAPERS, getPastPaper } from "@/lib/past-papers";
import { SITE_URL, PERSON_ID, ORG_ID } from "@/lib/site";
import PaperRunner from "../PaperRunner";

export function generateStaticParams() {
  return ALL_PAST_PAPERS.map(p => ({ paperId: p.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ paperId: string }> },
): Promise<Metadata> {
  const { paperId } = await params;
  const paper = getPastPaper(paperId);
  if (!paper) return {};
  return {
    title: `${paper.title} | Ghost Aviator`,
    description: `Attempt ${paper.title} — ${paper.questions.length} exam-style questions with full answer key.`,
    alternates: { canonical: `/past-papers/${paper.id}` },
  };
}

export default async function PastPaperPage(
  { params }: { params: Promise<{ paperId: string }> },
) {
  const { paperId } = await params;
  const paper = getPastPaper(paperId);
  if (!paper) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Quiz",
        "@id": `${SITE_URL}/past-papers/${paper.id}#quiz`,
        "name": paper.title,
        "description": `Full-length DGCA exam practice paper: ${paper.title} with ${paper.questions.length} questions with answers and explanations.`,
        "educationalLevel": "Advanced",
        "inLanguage": "en-IN",
        "isAccessibleForFree": true,
        "provider": { "@id": ORG_ID },
        "author": { "@id": PERSON_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/past-papers/${paper.id}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Past Papers", item: `${SITE_URL}/past-papers` },
          { "@type": "ListItem", position: 3, name: paper.title },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PaperRunner paper={paper} />
    </>
  );
}
