export interface PanelQuestion {
  question: string;
  /** What a selection panel is actually listening for underneath the question. */
  listeningFor: string;
  /** The hazardous attitude that raised it, or null for the consistency prompt. */
  attitude: string | null;
}

export const BY_ATTITUDE: Record<string, { question: string; listeningFor: string }[]>;
export const CONSISTENCY_QUESTION: { question: string; listeningFor: string };
export const CONSISTENCY_FLOOR: number;
export const MAX_QUESTIONS: number;
export const PANEL_PREAMBLE: string;

/** Questions this student's own answers invite. Empty for an incomplete profile. */
export function panelQuestionsFor(profile: unknown): PanelQuestion[];
