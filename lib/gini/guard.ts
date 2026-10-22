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
 * OVERRULED BY THE CAPTAIN ON 2026-10-22: on a chapter the model may now teach,
 * in its own words, from that chapter's text. Those replies go through
 * guardTutorProse() at the bottom of this file, not through guardModelProse().
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

/**
 * Never suggest the free material will stop being free.
 *
 * WIDENED 2026-08-21 after finding this guard had never actually fired in a
 * test. Its one selftest case ("It is free for a limited time, so join today")
 * is caught by FAKE_URGENCY first, so the case passed on the wrong guard and
 * hid the gap — which is why the cases below now assert the REASON, not just
 * that something was blocked. Two plain threats sailed through: "The free notes
 * will not stay free forever" (the pattern had `won't` but not `will not`) and
 * "Enjoy the free material while it lasts" (not covered at all).
 *
 * The line to walk: block the THREAT, never the honest reassurance. "It is free
 * forever", "the free notes are unaffected" and "it lasts about 60 minutes" must
 * all still pass — telling a student the material stays free is the mission,
 * and a guard that gagged that would be worse than the hole it closed.
 */
export const FREE_THREAT =
  /\b(free (for a limited|until|till|only until|for now|while)|(wo|will|would|may|might|could)n'?t (stay|remain|be) free|will not (stay|remain|be) free|no longer (be )?free|stops? being free|going paid|becomes? paid|before it becomes paid|price goes? up|prices? (will )?(go|going) up|soon be paid|start(s|ing)? charging|while (it|they|this|these|stocks?) lasts?)\b/i;

/**
 * Every rupee figure Gini may utter. A model asked to "mention the courses"
 * will cheerfully round ₹7,999 to "about ₹8,000", or recall a price from its
 * training data. Either is a false price claim on the Captain's own business.
 */
export const ALLOWED_PRICES = new Set<string>([
  LIVE_PRICE, LIVE_LIST_PRICE, LIVE_COMBO_PRICE, LIVE_COMBO_LIST_PRICE,
]);

/**
 * HOW A PRICE IS FOUND IN A SENTENCE, and it is not only the rupee glyph.
 *
 * Until 2026-10-08 the check was one pattern anchored on the glyph, with two
 * holes found by the site audit:
 *
 *   1. It swallowed the sentence comma, so a CORRECT price was thrown away:
 *      "costs ₹7,999, down from ₹12,999" compared "₹7,999," against the list.
 *   2. It never looked at "Rs. 8,000", "INR 9,999" or "8000 rupees" at all, so
 *      a price nobody charges reached the student as long as it avoided "₹".
 *
 * So a figure now counts as a price when it carries ANY rupee marker, before
 * it (₹ / Rs / INR) or after it (rupees / Rs / INR / "/-"), and what is
 * compared is the NUMBER, not the spelling: digits only, commas and a ".00"
 * dropped. The allowed numbers are still derived from ALLOWED_PRICES above,
 * which is still imported from lib/live-classes.ts. Nothing is typed here.
 *
 * A multiplier ("8k", "8 thousand", "60 lakh") is never how this site states
 * a price, so a rupee figure carrying one is rejected outright, as is a
 * spelled-out amount ("eight thousand rupees").
 *
 * WHAT THIS STILL CANNOT SEE: a bare number with no rupee marker anywhere
 * near it ("the batch is 8,000 a subject"). Blocking every number would gag
 * "4,414 questions" and "20 Oct 2026", so that case is left to the brief.
 *
 * No lookbehind on purpose: this module is also imported by the browser
 * bundle, and older Safari refuses to parse a pattern that contains one.
 */
const ALLOWED_AMOUNTS = new Set<string>([...ALLOWED_PRICES].map(p => p.replace(/\D/g, "")));

// Written as regex literals and joined by .source, so no backslash has to
// survive a string escape.
const AMOUNT = /\d(?:[\d,]*\d)?(?:\.\d+)?/.source;
const MULTIPLIER = /(?:\s?(?:k|thousand|lakhs?|lacs?|crores?)(?![a-z]))?/.source;
const RUPEE_WORD = /(?:rupees?|rs\.?|inr)(?![a-z])/.source;
// The marker may be set off from the figure by spaces, a full stop or a colon
// ("Rs: 8,000", "INR. 8000", "₹  8,000").
const MARKER_FIRST = /(?:₹|\b(?:rs|inr|rupees?))[\s.:]*/.source;
const SPELLED_OUT = /\b(?:hundred|thousand|lakhs?|lacs?|crores?)\s+/.source;
const PRICE_MENTION = new RegExp(
  `${MARKER_FIRST}(${AMOUNT})(${MULTIPLIER})` +
  `|(${AMOUNT})(${MULTIPLIER})\\s?(?:in\\s+)?(?:${RUPEE_WORD}|/-)` +
  `|${SPELLED_OUT}${RUPEE_WORD}`,
  "gi",
);

function isAllowedAmount(amount: string): boolean {
  const [whole, paise] = amount.split(".");
  if (paise && /[1-9]/.test(paise)) return false;
  return ALLOWED_AMOUNTS.has(whole.replace(/,/g, ""));
}

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


/**
 * CODE AND MARKUP LEAKING INTO PROSE — the same failure as the Bengali
 * fragment above, wearing the Latin alphabet, so FOREIGN_SCRIPT never saw it.
 *
 * Caught on the live site, 2026-08-21, on a plain "hello":
 *
 *   "...Have a look around the library. same.href = "/""
 *
 * A fragment of the model's own scratch reasoning welded onto the end of an
 * otherwise perfect greeting. Every existing guard passed it: it states no
 * fact, quotes no price, names no source and uses no foreign script. It is
 * simply not English, and a mascot that hands a student a line of JavaScript
 * reads as a broken site on a domain whose whole pitch is that it is careful.
 *
 * Deliberately narrow. Gini's real replies carry paths (/live-classes),
 * domains (ghostaviator.com), abbreviations (Capt. Pahil) and currency, none
 * of which are code. What is matched is SYNTAX: assignment to a property, a
 * declaration keyword, an arrow, a tag, a JSON pair, a template hole, or a
 * sentence ending on a brace or semicolon. Prose does none of those things.
 */
export const CODE_FRAGMENT =
  /[A-Za-z_$][\w$]*\s*\.\s*[A-Za-z_$][\w$]*\s*=|\b(?:const|let|var|function|return)\s+[\w$]*\s*[=({["'`]|=>|<\/?[a-z][a-z0-9-]*(?:\s[^>]*)?\/?>|"[\w-]+"\s*:|[{};]\s*$|\$\{|\bconsole\.[a-z]+\(/i;

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
  if (CODE_FRAGMENT.test(t)) return { ok: false, why: "contains code or markup (token garbage)" };
  if (ATTRIBUTION.test(t)) return { ok: false, why: "names a third-party source (Iron Rule 2)" };
  if (FAKE_URGENCY.test(t)) return { ok: false, why: "manufactured urgency" };
  if (FREE_THREAT.test(t)) return { ok: false, why: "implies the free material will end" };
  if (OVERCLAIM.test(t)) return { ok: false, why: "unverifiable claim about outcomes" };

  // Every price must be one this repository actually charges.
  for (const m of t.matchAll(PRICE_MENTION)) {
    const amount = m[1] ?? m[3];
    const multiplier = m[2] ?? m[4];
    if (!amount || multiplier || !isAllowedAmount(amount)) {
      return { ok: false, why: `price not from lib/live-classes.ts: ${m[0].trim()}` };
    }
  }

  if (!opts.allowTeaching && SOUNDS_LIKE_TEACHING.test(t)) {
    return { ok: false, why: "reads as aviation teaching, which the model may not author" };
  }

  return { ok: true };
}

/* ─────────────────────── the tutor's guard (2026-10-22) ─────────────────── */

/**
 * WHEN THE MODEL TEACHES. The Captain overruled the route-only contract on
 * 2026-10-22: the model may now explain aviation in its own words, in any
 * language, from the chapter text it is handed (lib/gini/tutor.ts). Two of the
 * checks above were written for a model that must NOT teach and are wrong here:
 * SOUNDS_LIKE_TEACHING (teaching is the job now) and FOREIGN_SCRIPT (a student
 * who asks in Tamil must be answered in Tamil). Everything else still applies.
 *
 * What replaces them:
 *
 *   SCRIPT DISCIPLINE. The Bengali fragment welded onto an English greeting
 *   (2026-08-21) is still garbage, so a non-Latin script is allowed only if the
 *   STUDENT wrote in it or named its language, and only one per reply.
 *
 *   NUMBER GROUNDING. Every number in the reply must appear in the chapter text
 *   the model was given, or in what the student typed. This is the check that
 *   stops an invented limit, frequency, validity period or CAR number — the
 *   wrong answers that cost a student a paper. It cannot see a wrong fact with
 *   no digit in it; tutor.ts says so plainly.
 *
 *   FAA ONLY IF THE NOTES SAY IT. He asked for Indian rules first. A reply that
 *   brings in the FAA when the chapter does not is answering from memory.
 */

/** Indian scripts, and the one Arabic-script language a student may ask for. */
const SCRIPTS: Record<string, RegExp> = {
  devanagari: /[ऀ-ॿ]/,
  bengali: /[ঀ-৿]/,
  gurmukhi: /[਀-੿]/,
  gujarati: /[઀-૿]/,
  odia: /[଀-୿]/,
  tamil: /[஀-௿]/,
  telugu: /[ఀ-౿]/,
  kannada: /[ಀ-೿]/,
  malayalam: /[ഀ-ൿ]/,
  arabic: /[؀-ۿ]/,
};

/** A language named in English letters maps to the script it is written in. */
const LANGUAGE_SCRIPT: [RegExp, string][] = [
  [/\b(hindi|marathi|nepali|sanskrit|konkani|maithili|bhojpuri)\b/i, "devanagari"],
  [/\b(bengali|bangla|assamese)\b/i, "bengali"],
  [/\b(punjabi|panjabi|gurmukhi)\b/i, "gurmukhi"],
  [/\bgujarati\b/i, "gujarati"],
  [/\b(odia|oriya)\b/i, "odia"],
  [/\btamil\b/i, "tamil"],
  [/\btelugu\b/i, "telugu"],
  [/\b(kannada|kanarese)\b/i, "kannada"],
  [/\bmalayalam\b/i, "malayalam"],
  [/\burdu\b/i, "arabic"],
];

/** Never legitimate in an answer to an Indian student pilot. Greek stays allowed: θ, Δ, σ are formula letters. */
const NEVER_SCRIPT = /[Ѐ-ӿ֐-׿඀-෿฀-๿぀-ヿ一-鿿가-힯]/;

/**
 * The danda (। ॥) sits in the Devanagari block but is the full stop of Gurmukhi,
 * Bengali and Odia too. Counting it as Devanagari dropped a clean Punjabi reply
 * as "mixes scripts" on the live probe, 2026-10-22, so it is set aside first.
 */
const scriptsIn = (s: string) => {
  const letters = s.replace(/[।॥]/g, "");
  return Object.keys(SCRIPTS).filter(k => SCRIPTS[k].test(letters));
};

/** Scripts the student has opened the door to, by writing in one or by naming its language. */
export function scriptsAllowedBy(studentText: string): Set<string> {
  const out = new Set(scriptsIn(studentText));
  for (const [re, script] of LANGUAGE_SCRIPT) if (re.test(studentText)) out.add(script);
  return out;
}

/** Native digits (०१२, ௦௧௨ …) read as 0-9, so a number cannot hide from the check by changing script. */
export function asciiDigits(s: string): string {
  return s.replace(/[٠-٩۰-۹०-९০-৯੦-੯૦-૯୦-୯௦-௯౦-౯೦-೯൦-൯]/g, ch => {
    const cp = ch.codePointAt(0)!;
    if (cp >= 0x660 && cp <= 0x669) return String(cp - 0x660);
    if (cp >= 0x6f0 && cp <= 0x6f9) return String(cp - 0x6f0);
    return String((cp & 0x7f) - 0x66);
  });
}

/** Every number in a text, as values: "1,013.25" and "1013.25" are one number, "045" and "45" are one. */
export function numbersIn(s: string): number[] {
  const out: number[] = [];
  for (const m of asciiDigits(s).matchAll(/\d+(?:,\d{3})+(?:\.\d+)?|\d*\.\d+|\d+/g)) {
    const v = Number(m[0].replace(/,/g, ""));
    if (Number.isFinite(v)) out.push(v);
  }
  return out;
}

/**
 * NUMBERS WRITTEN AS WORDS. Found on the first live probe, 2026-10-22: asked in
 * Hindi, the model wrote "साठ knots यानी तीस m/sec" — 60 and 30 as words — in
 * spite of the instruction to use digits, and a digit-only check never saw them.
 * They were right that time. "Ten years" written wrong would not be.
 *
 * So English and Hindi number words are read as their values and must be
 * grounded too. Deliberately not covered: Hinglish spellings ("saath" is also
 * "together", "das" is a name), compounds like "twenty-five" (each part is read
 * alone), and the other Indian languages. The brief's digits rule is the only
 * defence there.
 */
const NUMBER_WORDS: Record<string, number> = {
  three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90,
  "तीन": 3, "चार": 4, "पाँच": 5, "पांच": 5, "छह": 6, "छः": 6, "सात": 7, "आठ": 8, "नौ": 9, "दस": 10,
  "बारह": 12, "पंद्रह": 15, "बीस": 20, "पच्चीस": 25, "तीस": 30, "चालीस": 40, "पचास": 50,
  "साठ": 60, "सत्तर": 70, "अस्सी": 80, "नब्बे": 90, "सौ": 100, "हज़ार": 1000, "हजार": 1000,
};
const NUMBER_WORD = new RegExp(
  `(?:^|[^\\p{L}\\p{M}])(${Object.keys(NUMBER_WORDS).sort((a, b) => b.length - a.length).join("|")})(?![\\p{L}\\p{M}])`,
  "giu",
);
export function numberWordsIn(s: string): number[] {
  return [...s.matchAll(NUMBER_WORD)].map(m => NUMBER_WORDS[m[1].toLowerCase()] ?? NUMBER_WORDS[m[1]]);
}

/** Small counting words a teacher uses with no fact behind them ("1 in 60", "2 sentences"). */
const FREE_NUMBERS = new Set([0, 1, 2]);

const FAA = /\b(FAA|FARs?|CFR)\b/;

const MAX_TUTOR_CHARS = 1400;

export type TutorGrounding = {
  /** The chapter text the model was given. */
  source: string;
  /** Everything the student typed in this conversation, current question included. */
  student: string;
};

/**
 * Validate a teaching turn the MODEL wrote. Like guardModelProse, it rejects
 * rather than repairs: one untraceable number discredits the whole reply.
 */
export function guardTutorProse(text: string, g: TutorGrounding): GuardVerdict {
  const t = (text ?? "").trim();
  if (!t) return { ok: false, why: "empty" };
  if (t.length > MAX_TUTOR_CHARS) return { ok: false, why: `too long (${t.length})` };

  if (NEVER_SCRIPT.test(t)) return { ok: false, why: "contains a script no student asked for (token garbage)" };
  const used = scriptsIn(t);
  if (used.length > 1) return { ok: false, why: `mixes scripts: ${used.join(", ")}` };
  if (used.length === 1 && !scriptsAllowedBy(g.student).has(used[0])) {
    return { ok: false, why: `${used[0]} script, but the student did not write in it or ask for it` };
  }

  if (CODE_FRAGMENT.test(t)) return { ok: false, why: "contains code or markup (token garbage)" };
  if (ATTRIBUTION.test(t)) return { ok: false, why: "names a third-party source (Iron Rule 2)" };
  if (FAKE_URGENCY.test(t)) return { ok: false, why: "manufactured urgency" };
  if (FREE_THREAT.test(t)) return { ok: false, why: "implies the free material will end" };
  if (OVERCLAIM.test(t)) return { ok: false, why: "unverifiable claim about outcomes" };

  for (const m of t.matchAll(PRICE_MENTION)) {
    const amount = m[1] ?? m[3];
    const multiplier = m[2] ?? m[4];
    if (!amount || multiplier || !isAllowedAmount(amount)) {
      return { ok: false, why: `price not from lib/live-classes.ts: ${m[0].trim()}` };
    }
  }

  if (FAA.test(t) && !FAA.test(g.source)) {
    return { ok: false, why: "brings in the FAA, which these notes do not" };
  }

  const known = new Set([
    ...numbersIn(g.source), ...numbersIn(g.student),
    ...numberWordsIn(g.source), ...numberWordsIn(g.student),
  ]);
  for (const n of [...numbersIn(t), ...numberWordsIn(t)]) {
    if (!FREE_NUMBERS.has(n) && !known.has(n)) {
      return { ok: false, why: `number not in the chapter notes or the student's words: ${n}` };
    }
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
