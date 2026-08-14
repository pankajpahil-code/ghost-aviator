import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EXAM_PAPERS, getExamPaper } from "@/lib/exam-papers";
import ExamRunner from "../ExamRunner";

export function generateStaticParams() {
  return EXAM_PAPERS.map(p => ({ paperId: p.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ paperId: string }> },
): Promise<Metadata> {
  const { paperId } = await params;
  const paper = getExamPaper(paperId);
  if (!paper) return {};
  return {
    title: `${paper.title} — Exam Mode | Ghost Aviator`,
    description: `Sit the full ${paper.title} paper in real DGCA format: ${paper.questionCount} questions, ${paper.durationMin} minutes, ${paper.passMark}% to pass.`,
    alternates: { canonical: `/exam/${paper.id}` },
    // These are the runner itself — ExamRunner is a client component, so the
    // server sends 22-90 words of shell. Measured 2026-08-14 alongside the
    // chapter drills and treated the same way: the page students use, not a
    // page search should judge the domain by. /exam is the landing page that
    // describes the papers and stays indexable.
    robots: { index: false, follow: true },
  };
}

export default async function ExamPaperPage(
  { params }: { params: Promise<{ paperId: string }> },
) {
  const { paperId } = await params;
  const paper = getExamPaper(paperId);
  if (!paper) notFound();
  return <ExamRunner paper={paper} />;
}
