// Previous-year / sample papers — full exam-style papers with answer keys,
// organised by subject. Papers are intentionally titled by subject only.
import { AIR_REGULATIONS_PAPERS } from "./generated/past-papers-air-regulations";

export type PastPaperQuestion = { q: string; opts: string[]; ans: number; exp?: string };

export type PastPaper = {
  id: string;
  subjectId: string;
  track: "cpl" | "atpl";
  title: string;
  questions: PastPaperQuestion[];
};

import { SAMPLE_PAPERS } from "./sample-papers";

export const ALL_PAST_PAPERS: PastPaper[] = [
  ...AIR_REGULATIONS_PAPERS,
  ...SAMPLE_PAPERS,
];

export function getPastPaper(id: string): PastPaper | undefined {
  return ALL_PAST_PAPERS.find(p => p.id === id);
}

// Papers grouped by subject, preserving paper order.
export function papersBySubject(): { subjectId: string; papers: PastPaper[] }[] {
  const groups = new Map<string, PastPaper[]>();
  for (const p of ALL_PAST_PAPERS) {
    if (!groups.has(p.subjectId)) groups.set(p.subjectId, []);
    groups.get(p.subjectId)!.push(p);
  }
  return [...groups.entries()].map(([subjectId, papers]) => ({ subjectId, papers }));
}
