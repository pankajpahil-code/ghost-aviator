/**
 * Published verification status, per subject.
 *
 * This is the data behind /how-answers-are-verified, and it is a PROMISE MADE IN
 * PUBLIC. Every entry here must be true of the bank as it stands today. If you
 * are a model editing this file:
 *
 *   - Never upgrade a status to describe work you have not personally seen
 *     evidence of. "Audited" means an audit happened and its findings are on
 *     record, not that the content looks fine.
 *   - Never quietly remove a subject to avoid admitting it is unaudited. The
 *     honesty is the entire value of this page; a student who reads "not yet
 *     audited" and trusts the rest is exactly the outcome we want.
 *   - `note` is shown to students verbatim. No source or author names ever
 *     (Iron Rule 2) — "a standard ATPL meteorology reference", not a title.
 */

export type VerificationLevel = "verified" | "audited" | "partial" | "unaudited";

export type SubjectVerification = {
  subjectId: string;
  level: VerificationLevel;
  /** Month the work was completed, e.g. "July 2026". Empty for unaudited. */
  when: string;
  /** One or two sentences, student-facing, verbatim. */
  note: string;
};

export const LEVEL_LABEL: Record<VerificationLevel, string> = {
  verified: "Fully verified",
  audited: "Audited and repaired",
  partial: "Partly verified",
  unaudited: "Not yet audited",
};

export const LEVEL_COLOR: Record<VerificationLevel, string> = {
  verified: "#10b981",
  audited: "#38bdf8",
  partial: "#f59e0b",
  unaudited: "#64748b",
};

export const VERIFICATION: SubjectVerification[] = [
  {
    subjectId: "meteorology",
    level: "verified",
    when: "July 2026",
    note:
      "Every answer in this bank was checked against a standard ATPL meteorology reference and against standard theory, in two independent passes — one to verify, a second to argue against the first. Twenty-four answers were corrected. Questions that could not be answered without a chart or coded report you were never shown were removed rather than left in.",
  },
  {
    subjectId: "air-regulations",
    level: "audited",
    when: "July 2026",
    note:
      "The bank was audited and repaired: 161 printing defects fixed, 13 questions that had been split beyond recovery removed, and one wrong answer key corrected. A seeded random sample was verified answer by answer. Worked explanations — each one cited to the paragraph of the regulation it comes from — are now being written chapter by chapter, starting with Separation Methods and Minima. Questions whose answer cannot yet be traced to a source I hold are deliberately left without an explanation rather than given a plausible one.",
  },
  {
    subjectId: "air-navigation",
    level: "partial",
    when: "July 2026",
    note:
      "Of the questions in this subject, the 187 written for the general navigation chapters have been through full verification: every numerical answer was recomputed from first principles rather than trusted, and twenty-three questions were removed — some needed a chart or almanac you were never shown, and three had simply been marked with the wrong answer. The remaining questions in this subject have not yet had that pass.",
  },
  {
    subjectId: "technical-specific",
    level: "audited",
    when: "July 2026",
    note:
      "The twin-engine type notes were checked claim by claim against the manufacturer's approved flight manual. Two numeric errors were found and corrected — a load-factor limit and a fuel-quantity column. Two further figures that could not be traced to the manual were flagged rather than left standing.",
  },
];

export const verificationFor = (subjectId: string): SubjectVerification | undefined =>
  VERIFICATION.find(v => v.subjectId === subjectId);
