import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ALL_PAST_PAPERS, getPastPaper } from "@/lib/past-papers";
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
  return <PaperRunner paper={paper} />;
}
