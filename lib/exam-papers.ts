// Exam-paper definitions live in ./exam-papers-meta (data only, no question
// bank). This module re-exports them so existing importers keep working, and
// adds the one function that needs the bank. CLIENT PAGES THAT ONLY NEED
// TITLES OR PASS MARKS MUST IMPORT ./exam-papers-meta, NOT THIS FILE — importing
// this one pulls the whole question bank into their bundle.
import { ALL_QUESTIONS, type DemoQuestion } from "./questions";
import type { ExamPaper } from "./exam-papers-meta";

export type { ExamPaper } from "./exam-papers-meta";
export { EXAM_PAPERS, getExamPaper } from "./exam-papers-meta";

export function getPaperQuestionPool(paper: ExamPaper): DemoQuestion[] {
  return ALL_QUESTIONS.filter(q => q.subjectIds.some(id => paper.subjectIds.includes(id)));
}
