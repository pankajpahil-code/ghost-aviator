export const MIN_QUESTIONS_FOR_VERDICT = 10;

export function canStartRun(run: { poolSize: number; fallback: boolean }): boolean {
  return run.poolSize > 0 && (!run.fallback || run.poolSize >= MIN_QUESTIONS_FOR_VERDICT);
}

export function quizLinkLabel(poolSize: number, chapterSpecific: boolean) {
  if (!canStartRun({ poolSize, fallback: !chapterSpecific })) return null;
  return chapterSpecific ? "Chapter Quiz" : "Subject Revision";
}
