// Real DGCA CPL written-exam paper definitions.
//
// lib/subjects.ts organises content for STUDY (chapters, notes, chapter quizzes).
// This file models how DGCA actually EXAMINES — a different shape, because the
// DGCA Navigation paper combines three study subjects (Air Navigation, Radio
// Navigation, Instrumentation) into one 100-question paper. Papers therefore
// pool one or more subjectIds rather than mapping 1:1 to a subject.
//
// Figures verified with Capt. Pankaj Pahil (DGCA flight & ground instructor)
// 2026-07-12/13: his own instructor knowledge, cross-checked by him against
// current sources. No public DGCA document states these numbers, but the CEO's
// official "Instruction to Candidates" (pariksha.dgca.gov.in) corroborates
// structurally: its break policy (permitted after 1h, banned in the last 30min)
// only makes sense for papers longer than 90 minutes — refuting third-party
// blogs claiming uniform 90-minute papers. RTR(A) Part 2 (the 6-scenario
// voice/ATC practical test) is not an MCQ paper and is intentionally excluded —
// that belongs to the future RTR(A) practice simulator, not this pool-based runner.
import { ALL_QUESTIONS, type DemoQuestion } from "./questions";

export type ExamPaper = {
  id: string;
  title: string;
  shortTitle: string;
  subjectIds: string[]; // study subjects pooled to build this paper's questions
  questionCount: number;
  durationMin: number;
  passMark: number;
  track: "cpl" | "atpl";
  note?: string; // shown on the setup screen for special-case papers
};

export const EXAM_PAPERS: ExamPaper[] = [
  {
    id: "navigation",
    title: "Air Navigation (Nav + Radio Nav + Instruments)",
    shortTitle: "Navigation",
    subjectIds: ["air-navigation", "radio-navigation", "instrumentation"],
    questionCount: 100,
    durationMin: 180,
    passMark: 70,
    track: "cpl",
  },
  {
    id: "meteorology",
    title: "Aviation Meteorology",
    shortTitle: "Meteorology",
    subjectIds: ["meteorology"],
    questionCount: 50,
    durationMin: 120,
    passMark: 70,
    track: "cpl",
  },
  {
    id: "air-regulations",
    title: "Air Regulations",
    shortTitle: "Air Regulations",
    subjectIds: ["air-regulations"],
    questionCount: 50,
    durationMin: 120,
    passMark: 70,
    track: "cpl",
  },
  {
    id: "technical-general",
    title: "Technical General",
    shortTitle: "Tech. General",
    subjectIds: ["technical-general"],
    questionCount: 100,
    durationMin: 180,
    passMark: 70,
    track: "cpl",
  },
  {
    id: "technical-specific",
    title: "Technical Specific",
    shortTitle: "Tech. Specific",
    subjectIds: ["technical-specific"],
    questionCount: 50,
    durationMin: 120,
    passMark: 70,
    track: "cpl",
  },
  {
    id: "rtr-part1",
    title: "RTR(A) — Part 1 (Written / CBT)",
    shortTitle: "RTR(A) Part 1",
    subjectIds: ["radio-telephony"],
    questionCount: 50,
    durationMin: 60,
    passMark: 70,
    track: "cpl",
    note: "Part 2 (the 6-scenario practical voice/ATC test) isn't a written paper and isn't covered by this mock exam.",
  },
  {
    id: "composite-met-nav",
    title: "Composite — Meteorology & Navigation",
    shortTitle: "Composite Met+Nav",
    subjectIds: ["meteorology", "air-navigation", "radio-navigation", "instrumentation"],
    questionCount: 100,
    durationMin: 180,
    passMark: 70,
    track: "cpl",
    note: "For candidates converting a foreign CPL: Meteorology and Navigation are combined into one paper instead of sat separately. Air Regulations is still a separate, standard paper.",
  },
];

export function getExamPaper(id: string): ExamPaper | undefined {
  return EXAM_PAPERS.find(p => p.id === id);
}

export function getPaperQuestionPool(paper: ExamPaper): DemoQuestion[] {
  return ALL_QUESTIONS.filter(q => q.subjectIds.some(id => paper.subjectIds.includes(id)));
}
