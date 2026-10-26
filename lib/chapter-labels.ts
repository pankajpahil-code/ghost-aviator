import { ATPL_SUBJECTS, CPL_SUBJECTS } from "@/lib/subjects";

// One label table for every subject. CPL and ATPL share chapter ids for
// Meteorology, Navigation and Air Regulations, so the first label wins.
const labels: Record<string, string> = { sar: "Search and Rescue" };

for (const subject of [...CPL_SUBJECTS, ...ATPL_SUBJECTS]) {
  for (const chapter of subject.chapters) {
    if (!labels[chapter.id]) labels[chapter.id] = `${chapter.number}. ${chapter.title}`;
  }
}

export const CHAPTER_LABELS: Readonly<Record<string, string>> = labels;

/** A chapter id that is not in a subject list is still shown honestly. */
export function chapterLabel(chapterId: string | null | undefined): string {
  if (!chapterId) return "Unclassified";
  return CHAPTER_LABELS[chapterId] ?? chapterId;
}
