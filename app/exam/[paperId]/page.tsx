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
