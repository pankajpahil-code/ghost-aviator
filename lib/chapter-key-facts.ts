/**
 * Per-chapter key facts — the extractable layer.
 *
 * WHY THIS EXISTS. The chapter notes are served from /content/ inside an iframe
 * that is noindex and now disallowed to crawlers, deliberately, because they are
 * the Captain's own work and not offered for redistribution. The consequence is
 * that a chapter page has had nothing quotable on it at all: a title, a frame,
 * and no facts. These short entries are the part we DO offer — a handful of
 * exam-critical figures per chapter, rendered visibly in the page.
 *
 * TWO HARD RULES.
 *
 * 1. VISIBLE, ALWAYS. Render these in the page where a student can read them.
 *    Never `sr-only`, never `aria-hidden`, never a crawler-only block — that is
 *    hidden text under Google's spam policies and risks a manual action on the
 *    whole domain. This site already shipped that mistake once and had to undo
 *    it; see the SEO section of D:\pk\CLAUDE.md.
 *
 * 2. IRON RULE 1. These are the most quotable sentences on the site, which makes
 *    them the most dangerous place to be wrong. A fact goes in only if it is
 *    verified — standard tables, an ICAO Annex, the eAIP, or the Captain's own
 *    confirmation — and `source` records which. A chapter with no verified facts
 *    gets NO entry; the page simply omits the section. Do not pad.
 *
 * Keys are `${subjectId}/${chapterId}`.
 */

export type KeyFact = {
  /** Short label — the thing being stated. */
  term: string;
  /** The fact. One sentence, self-contained, quotable on its own. */
  fact: string;
};

export type ChapterKeyFacts = {
  facts: KeyFact[];
  /** Internal provenance. Not rendered. */
  source: string;
};

export const CHAPTER_KEY_FACTS: Record<string, ChapterKeyFacts> = {
  "meteorology/met-1": {
    source:
      "ISA as defined by ICAO — standard values, cross-checked against the verified Meteorology bank (654 questions, two-pass verified July 2026)",
    facts: [
      {
        term: "ISA sea level pressure",
        fact: "The International Standard Atmosphere takes mean sea level pressure as 1013.25 hPa (29.92 inches of mercury).",
      },
      {
        term: "ISA sea level temperature",
        fact: "ISA mean sea level temperature is +15°C, with a density of 1.225 kg/m³.",
      },
      {
        term: "ISA lapse rate",
        fact: "Temperature in the ISA falls by 1.98°C per 1000 ft — used as 2°C per 1000 ft in practice — up to the tropopause.",
      },
      {
        term: "ISA tropopause",
        fact: "The ISA tropopause is at 36 090 ft (11 km), where the temperature is −56.5°C and stops falling with height.",
      },
      {
        term: "Composition of the atmosphere",
        fact: "Dry air is about 78% nitrogen and 21% oxygen by volume, the remaining 1% being argon, carbon dioxide and trace gases.",
      },
      {
        term: "Vertical divisions",
        fact: "From the surface upward the atmosphere divides into troposphere, stratosphere, mesosphere and thermosphere, each separated from the next by a pause.",
      },
    ],
  },
};

export const keyFactsFor = (subjectId: string, chapterId: string): ChapterKeyFacts | undefined =>
  CHAPTER_KEY_FACTS[`${subjectId}/${chapterId}`];
