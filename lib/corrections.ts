/**
 * "What your notes get wrong" - corrections where circulating DGCA material is out of date or
 * wrong and Capt. Pahil holds the source. Data: tools/shorts/corrections.json (the same file the
 * correction Shorts are rendered from), each entry carrying its citation.
 *
 * GATED ON HIS REVIEW. corrections.json says: "He rules on every line before any of it becomes a
 * card." So an entry reaches the public page ONLY when its id is in APPROVED_CORRECTIONS below.
 * With the list empty, /corrections returns 404 and is absent from the sitemap - nothing
 * unreviewed ships. To publish, add the ids he approved, e.g. "licence-validity".
 *
 * Only `common`, `correct` and `cite` are shown. The `note` field is editorial guidance for
 * authors ("do not over-correct", "Revision 2 has NOT been retrieved") and never reaches a page.
 */
import data from "../tools/shorts/corrections.json";

export type Correction = { id: string; subject: string; common: string; correct: string; cite: string };

/** The ids Capt. Pahil has approved for publication. Empty until he rules. */
export const APPROVED_CORRECTIONS: string[] = [];

const ALL: Correction[] = (data.corrections as Array<Correction & { note?: string | null }>).map(
  ({ id, subject, common, correct, cite }) => ({ id, subject, common, correct, cite }),
);

export const PUBLISHED_CORRECTIONS: Correction[] = ALL.filter((c) => APPROVED_CORRECTIONS.includes(c.id));
export const PENDING_CORRECTIONS: string[] = ALL.filter((c) => !APPROVED_CORRECTIONS.includes(c.id)).map((c) => c.id);
