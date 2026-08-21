/**
 * THE GUARDS — the last thing that runs before any sentence reaches a student.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * WHY THIS FILE EXISTS SEPARATELY FROM EVERYTHING ELSE.
 *
 * Until 2026-08-21 every sentence Gini could say was written by a human in this
 * repository, so a guard was a belt-and-braces check on our own copy. Now a
 * language model can write SOME of what he says — the conversational half — and
 * these stop being a formality. They are the boundary.
 *
 * The rule the Captain set, and the architecture enforces it rather than asking
 * the model to respect it:
 *
 *   THE MODEL MAY ROUTE. IT MAY NOT TEACH.
 *
 * Aviation content is never model-authored: the model returns the ID of a
 * stored, verified answer, and the server sends that stored text back verbatim.
 * The model's own prose is allowed only for greetings, small talk, and talking
 * about the site and the courses — and every word of that passes through here.
 *
 * If a check fails we do NOT repair the sentence. We throw it away and fall
 * back to the deterministic Gini, because a model that produced one bad
 * sentence has no credibility for the repaired one either.
 * ────────────────────────────────────────────────────────────────────────────
 */

import {
  LIVE_PRICE, LIVE_LIST_PRICE, LIVE_COMBO_PRICE, LIVE_COMBO_LIST_PRICE,
} from "@/lib/live-classes";

/**
 * Iron Rule 2 — nothing student-facing may attribute teaching to a third party.
 * A model that has read the whole internet knows exactly which textbooks Indian
 * CPL students use, and will name them helpfully if not stopped.
 */
export const ATTRIBUTION =
  /\b(oxford|cae|nordian|redbird|jeppesen|ic\s*joshi|joshi|rk\s*bali|bali|sahil|surender|ecqb)\b/i;

/** Fabricated pressure. Invented scarcity is a lie told to a student about money. */
export const FAKE_URGENCY =
  /\b(only \d+ (seats?|spots?|places?) (left|remaining)|hurry|limited time|last chance|offer ends|act now|don'?t miss out|book now before|selling fast|few seats|filling fast|enroll today)\b/i;

/** Never suggest the free material will stop being free. */
export const FREE_THREAT =
  /\b(free (for a limited|until|till|only until)|won'?t stay free|going paid|before it becomes paid|price goes up|soon be paid)\b/i;

/**
 * Every rupee figure Gini may utter. A model asked to "mention the courses"
 * will cheerfully round ₹7,999 to "about ₹8,000", or recall a price from its
 * training data. Either is a false price claim on the Captain's own business.
 */
export const ALLOWED_PRICES = new Set<string>([
  LIVE_PRICE, LIVE_LIST_PRICE, LIVE_COMBO_PRICE, LIVE_COMBO_LIST_PRICE,
]);

/**
 * Claims a model must not make on this site's behalf. Guarantees about passing
 * an exam are the specific thing coaching centres in this market lie about, and
 * the reason students distrust all of them.
 */
export const OVERCLAIM =
  /\b(guarantee[ds]?|guaranteed pass|100% (pass|result|success)|sure ?shot|assured (pass|success|selection)|crack (the|your) exam in|best (institute|academy) in india|number one)\b/i;

/**
 * Anything that sounds like the model teaching aviation. This is the crude
 * backstop, not the real defence — the real defence is that the "talk" path is
 * only ever reached for questions the router classified as non-exam. But a
 * misrouted question must not turn into invented teaching, so a reply that
 * starts stating aviation numbers is dropped.
 */
export const SOUNDS_LIKE_TEACHING =
  /\b(\d+\s?(kt|kts|knots|ft|feet|nm|hpa|mb|°c|degrees|rpm|psi|bar|fl\s?\d+)|the answer is|correct option|formula is|is calculated (as|by)|equals)\b/i;

/**
 * TOKEN GARBAGE, AND IT IS NOT HYPOTHETICAL.
 *
 * Caught on the live site, 2026-08-21, in an otherwise perfect greeting:
 *
 *   "…Tell me if you need help finding anything.ান্তরিত"
 *
 * A fragment of Bengali script welded onto the end of an English sentence. No
 * wrong fact, nothing unsafe — just a mascot that looks broken on a site whose
 * entire pitch is that it is careful. The other guards all passed it, because
 * they were looking for lies and this was corruption.
 *
 * The brief instructs Indian English, so any run of an unrelated script is a
 * defect rather than a translation. Listed by block instead of by an allow-list
 * of Latin, so ordinary typography (— ₹ ' " …) can never trip it.
 */
export const FOREIGN_SCRIPT = new RegExp(
  "[" +
  "\\u0370-\\u03FF" +   // Greek
  "\\u0400-\\u04FF" +   // Cyrillic
  "\\u0590-\\u06FF" +   // Hebrew, Arabic
  "\\u0900-\\u0DFF" +   // Devanagari through Sinhala (incl. Bengali, Tamil, Telugu)
  "\\u0E00-\\u0E7F" +   // Thai
  "\\u3040-\\u30FF" +   // Hiragana, Katakana
  "\\u4E00-\\u9FFF" +   // CJK
  "\\uAC00-\\uD7AF" +   // Hangul
  "]",
);

export type GuardVerdict = { ok: true } | { ok: false; why: string };

const MAX_CHARS = 700;

/**
 * Validate a sentence the MODEL wrote (never used on stored text — stored text
 * is already verified and may legitimately contain numbers and formulas).
 */
export function guardModelProse(text: string, opts: { allowTeaching?: boolean } = {}): GuardVerdict {
  const t = (text ?? "").trim();
  if (!t) return { ok: false, why: "empty" };
  if (t.length > MAX_CHARS) return { ok: false, why: `too long (${t.length})` };

  if (FOREIGN_SCRIPT.test(t)) return { ok: false, why: "contains stray non-Latin script (token garbage)" };
  if (ATTRIBUTION.test(t)) return { ok: false, why: "names a third-party source (Iron Rule 2)" };
  if (FAKE_URGENCY.test(t)) return { ok: false, why: "manufactured urgency" };
  if (FREE_THREAT.test(t)) return { ok: false, why: "implies the free material will end" };
  if (OVERCLAIM.test(t)) return { ok: false, why: "unverifiable claim about outcomes" };

  // Every price must be one this repository actually charges.
  const prices = t.match(/₹\s?[\d,]+/g) ?? [];
  for (const p of prices) {
    if (!ALLOWED_PRICES.has(p.replace(/\s/g, ""))) {
      return { ok: false, why: `price not from lib/live-classes.ts: ${p}` };
    }
  }

  if (!opts.allowTeaching && SOUNDS_LIKE_TEACHING.test(t)) {
    return { ok: false, why: "reads as aviation teaching, which the model may not author" };
  }

  return { ok: true };
}

/**
 * Links the model may point at. It is not allowed to invent a URL — a broken
 * link from the mascot is a small thing that reads as a broken site, and an
 * off-site link is a way to send a student somewhere nobody vetted.
 */
export function isAllowedHref(href: string | null | undefined, allowed: Set<string>): boolean {
  if (!href) return true;              // no link is always fine
  return allowed.has(href);
}
