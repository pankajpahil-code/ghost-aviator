// ADAPT — sten scores and colour bands: the reporting currency the real
// screening actually hands the student.
//
// ── Why this exists alongside stanine.mjs ──────────────────────────────────
//
// Capt. Pahil ruled (2026-08-09) that this site scores in stanines, and that
// stands. But the report a candidate receives from the real system is not a
// bare stanine. Verified first-party from the publisher's own product pages
// (2026-08-10, see ADAPT_COMPETITIVE_AUDIT.md §1.3):
//
//   * the Control & Co-Ordination test reports "a graph with normed STEN
//     scores and colour bands";
//   * the Cognitive Reasoning test reports "an overall score plus scores for
//     each section, all normed and shown within a COLOUR BANDING for easy
//     identification of level";
//   * the knowledge tests report "a score, which fits within a colour banding".
//
// So the colour band is the thing a student will actually be looking at on the
// day, and familiarisation with that report IS the product. The stanine stays
// as the headline number; this module adds the two presentations that sit
// beside it.
//
// ── The honest problem, and how it is handled ─────────────────────────────
//
// The publisher does not publish its band boundaries, and I did not buy the
// test to observe them. Inventing boundaries and presenting them as the real
// ones would be exactly the fabrication Iron Rule 1 forbids.
//
// So the bands here are DERIVED FROM THE SCALE ITSELF — sten deciles, which is
// what the sten scale means — and the result page says so in as many words.
// The shape is faithful (a 1-10 score inside a coloured level); the boundaries
// are ours and are declared as ours. If the real bands are ever observed from
// a purchased sitting, only this file changes.

// ── The sten scale ─────────────────────────────────────────────────────────
//
// STEN = STandard TEN. Mean 5.5, sd 2, ten integer bins. It differs from the
// stanine in having no middle bin: 5 and 6 straddle the mean, so there is no
// "dead centre" for a marginal performance to hide in. That property is why
// psychomotor testing tends to prefer it.

export const STEN_MEAN = 5.5;
export const STEN_SD = 2;

/** z -> sten, bounded to the scale. */
export function stenFromZ(z) {
  if (!Number.isFinite(z)) throw new RangeError("stenFromZ: z must be finite");
  const s = Math.round(STEN_MEAN + STEN_SD * z);
  return Math.min(10, Math.max(1, s));
}

/**
 * Stanine (1-9) -> sten (1-10).
 *
 * Both are linear maps of the same z, so the honest conversion goes back
 * through z rather than stretching one integer range onto the other:
 *
 *     z    = (stanine - 5) / 2
 *     sten = round(5.5 + 2z)
 *
 * which collapses to `stanine + 0.5` rounded. A stanine of 5 lands on sten 6
 * and a stanine of 4 on sten 5 — correct, because the stanine's middle bin
 * spans the mean while the sten scale has no bin that does.
 */
export function stenFromStanine(stanine) {
  if (!Number.isInteger(stanine) || stanine < 1 || stanine > 9) {
    throw new RangeError(`stenFromStanine: expected a stanine 1-9, got ${stanine}`);
  }
  return stenFromZ((stanine - 5) / 2);
}

// ── Colour bands ───────────────────────────────────────────────────────────
//
// Five levels over the sten scale, split on the scale's own deciles. Wording is
// developmental rather than judgemental: on this site the same score an airline
// reads as a sift decision is a pointer at what to train next.
//
// `hex` is used by the report and nowhere else; keep it in step with the
// contrast requirements of the dark result page (all five clear AA on #0b1117).

export const COLOUR_BANDS = [
  {
    key: "well-below",
    sten: [1, 2],
    label: "Well below the level",
    colour: "#ef4444",
    hex: "#ef4444",
    advice: "Train this before anything else. A gap here costs more marks than polish anywhere else on the battery.",
  },
  {
    key: "below",
    sten: [3, 4],
    label: "Below the level",
    colour: "#f97316",
    hex: "#f97316",
    advice: "The method is there and the speed is not yet. Short daily runs move this band faster than long occasional ones.",
  },
  {
    key: "at",
    sten: [5, 6],
    label: "At the level",
    colour: "#eab308",
    hex: "#eab308",
    advice: "Where most candidates sit. Consistency is what separates this band from the one above, not raw ability.",
  },
  {
    key: "above",
    sten: [7, 8],
    label: "Above the level",
    colour: "#84cc16",
    hex: "#84cc16",
    advice: "Comfortably competitive. Keep it warm with short runs and spend your hours on your weaker modules.",
  },
  {
    key: "well-above",
    sten: [9, 10],
    label: "Well above the level",
    colour: "#22c55e",
    hex: "#22c55e",
    advice: "A genuine strength. Do not spend more time here — it is already doing its job for you.",
  },
];

/** The colour band a sten score falls in. */
export function colourBandForSten(sten) {
  if (!Number.isInteger(sten) || sten < 1 || sten > 10) {
    throw new RangeError(`colourBandForSten: expected a sten 1-10, got ${sten}`);
  }
  const band = COLOUR_BANDS.find((b) => sten >= b.sten[0] && sten <= b.sten[1]);
  // Unreachable while the table covers 1-10 with no gaps — asserted rather than
  // silently returning undefined, because a missing band would render blank.
  if (!band) throw new RangeError(`no colour band covers sten ${sten}; the COLOUR_BANDS table has a gap`);
  return band;
}

/**
 * The full report line for a stanine: the number the site scores in, the sten
 * the real system reports in, and the colour band both sit inside.
 *
 * `basis` is carried through unchanged from stanine.mjs so the page can keep
 * saying whether the grade came from a published standard or from measured
 * norms. It is never inferred here.
 */
export function reportLine(stanine, basis = null) {
  const sten = stenFromStanine(stanine);
  return { stanine, sten, band: colourBandForSten(sten), basis };
}

/**
 * The sentence the result page prints under the band, so no student can mistake
 * our derived boundaries for the publisher's.
 *
 * Kept here rather than in the component because it is a factual claim about
 * how the score was produced, and factual claims belong next to the code that
 * produces them.
 */
export const BAND_PROVENANCE =
  "The 1-10 sten score and colour band mirror the format the real screening reports in. The band boundaries are our own, set on the sten scale's deciles — the test publisher does not publish theirs.";
