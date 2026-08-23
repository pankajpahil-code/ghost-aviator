/**
 * BUILD GINI'S TOPIC INDEX — from the Captain's own published chapters.
 *
 *   npx tsx tools/gini/build-topics.mts [--review]
 *
 * ────────────────────────────────────────────────────────────────────────────
 * WHY THIS EXISTS.
 *
 * Gini could search 3,041 worked exam explanations and 12 FAQ entries, and
 * nothing else. So a student typing "what is QNH" got an applied altimetry
 * problem — verified, correct, and not an answer to the question asked. The
 * site's actual teaching, 234 chapters of it, was unreachable unless the
 * student was already standing on the right page.
 *
 * This walks those chapters and records two things with very different risk
 * profiles:
 *
 *   1. TOPICS — the heading, the chapter it is in, and the link. This asserts
 *      NO aviation fact. It is structure, exactly like lib/subjects.ts, and it
 *      is what lets Gini say "that is covered under <heading> in <chapter>"
 *      across thousands of topics instead of the 234 chapter titles he had.
 *
 *   2. OPENERS — one sentence, VERBATIM, from under that heading, spoken only
 *      with the heading and a link to the chapter it came from. This IS an
 *      aviation claim, so it is gated hard (see the GATES section) and never
 *      paraphrased. It is the Captain's own published sentence, quoted, with a
 *      one-click path back to its source.
 *
 * NOTHING HERE IS COMPOSED. Every string this emits was written by a human and
 * is already live on ghostaviator.com. The generator's only job is to decide
 * what NOT to keep — which is why the gates below are deliberately mean, and
 * why the run prints what it dropped and why.
 *
 * EXTRACTS FROM THE INJECTED HTML, NOT THE SOURCE FILE. getInlineNotes() strips
 * the cover block and demotes h1 to h2, so the source and the page differ. A
 * scan of these same 234 source files once reported 2 defects where the
 * rendered output had 123, because the transform was the defect. Build the
 * index from what the student actually sees.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "../../lib/subjects";
import { GUIDES } from "../../lib/guides";
import { getInlineNotes } from "../../lib/notes-inline";

const REVIEW = process.argv.includes("--review");

/* ─────────────────────────────── cleaning ─────────────────────────────── */

const NAMED: Record<string, string> = {
  nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'",
  ndash: "-", mdash: "\u2014", rsquo: "\u2019", lsquo: "\u2018",
  ldquo: "\u201C", rdquo: "\u201D",
  deg: "\u00B0", times: "\u00D7", hellip: "\u2026", plusmn: "\u00B1", micro: "\u00B5",
};

const decode = (s: string) =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z0-9]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);

/** Pictographs, dingbats, arrows and variation selectors. Never letters. */
const EMOJI =
  /[\u{1F000}-\u{1FAFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{2460}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}]/gu;

const text = (html: string) =>
  decode(html.replace(/<[^>]+>/g, " ")).replace(EMOJI, " ").replace(/\s+/g, " ").trim();

/**
 * SPLIT THE BODY THE WAY THE BROWSER LAYS IT OUT, INSTEAD OF FLATTENING IT.
 *
 * The chapters print a small bold label immediately before a definition —
 * "IN PLAIN TERMS", "Mandatory Application — Code 3 or 4", "ICAO Doc 9869 —
 * Definitions". Flatten the tags and that label welds itself onto the front of
 * the sentence, and the result reads as though the label were part of the
 * teaching. Adding each one to a keyword list would be an endless game.
 *
 * They are all separate ELEMENTS, though — checked in the raw markup — so
 * splitting at block boundaries removes the whole class at once, for a reason
 * that stays true when a chapter invents a new label tomorrow.
 *
 * Only genuine block elements split. Not <strong>/<span>, because those appear
 * mid-sentence for emphasis and splitting on them would shred good prose into
 * fragments — the exact damage this is meant to prevent, inflicted the other
 * way round.
 */
const BLOCK_END =
  /<(?:br|hr)\s*\/?>|<\/(?:p|div|li|td|th|tr|h[1-6]|section|article|blockquote|figcaption|dt|dd|caption)>/gi;

/**
 * A leading INLINE label — the same thing wrapped in <strong> or <span> rather
 * than a block. Peeled only when it is short and carries no terminal
 * punctuation, i.e. when it is a label and not the first sentence itself.
 */
function stripInlineLabel(blockHtml: string): string {
  let h = blockHtml;
  for (let i = 0; i < 3; i++) {
    // Leading OPENING tags are skipped: the label is usually the first child of
    // a wrapper — `<div class="box"><span class="box-label">Strict Requirement`
    // — so anchoring at position 0 found nothing and the label survived.
    const m = /^(?:\s*<(?!\/)[a-z][a-z0-9]*\b[^>]*>)*\s*<(strong|b|em|span|u|mark)\b[^>]*>([\s\S]*?)<\/\1>\s*/i.exec(h);
    if (!m) break;
    const inner = text(m[2]);
    if (!inner || inner.length > 80) break;

    // IS IT A LABEL OR IS IT THE SENTENCE? Emphasis at the start of a paragraph
    // is often the definition itself — "<strong>The Retina is a light sensitive
    // screen</strong> lining the inside of the eyeball" — and peeling that
    // would behead the answer. A label either ends in a colon, or is a short
    // noun phrase with no linking verb in it.
    const rest = h.slice(m[0].length);

    /**
     * AND WHAT FOLLOWS DECIDES IT, which the first version missed and which
     * shipped: the emphasised word is often the TERM BEING DEFINED, not a
     * label. "<strong>Aquaplaning</strong> (also known as hydroplaning) is a
     * condition..." has one word and no verb, so it looked exactly like
     * "Strict Requirement" — and stripping it left a student reading
     * "(also known as hydroplaning) is a condition...", a sentence with no
     * subject. Five of 663 openers went out that way.
     *
     * A real label is followed by the start of a new sentence, so the next
     * character is a CAPITAL ("Strict Requirement" → "All aeroplanes..."). A
     * defined term is followed by the rest of its own sentence, so the next
     * character is punctuation or lowercase. A trailing colon is still decisive
     * on its own, since nothing but a label ends that way.
     */
    // BOTH tests must hold. The shape test alone let a defined term through;
    // the follows-with-a-capital test alone would strip a genuine opening
    // clause that happens to precede a new sentence.
    const looksLikeLabel =
      /:$/.test(inner) || (inner.split(/\s+/).length <= 7 && !DEFINING.test(inner));
    if (!looksLikeLabel) break;

    const nextChar = text(rest).charAt(0);
    if (!/:$/.test(inner) && !/[A-Z]/.test(nextChar)) break;

    h = rest;
  }
  return h;
}

/** The body's paragraphs, in order, as plain text. */
const blocks = (html: string): string[] =>
  html
    .split(BLOCK_END)
    .map(b => text(stripInlineLabel(b)))
    .filter(b => b.length > 0);

/**
 * Strip the numbering the chapters use for their own sections — "2.3 ", "7 ",
 * "Ch.4 ", "(a) ". The number is real, but a student searching types "cross
 * country flight", never "2.3 cross country flight", and leaving it in front
 * costs the match its best token.
 */
const cleanHeading = (raw: string) =>
  raw
    .replace(/^[\s\u00A7#*\u2022\-\u2013\u2014]+/, "")
    .replace(/^(?:ch(?:apter)?\.?\s*)?\d+(?:\.\d+)*[.):]?\s+/i, "")
    .replace(/^\([a-z0-9]{1,3}\)\s*/i, "")
    .replace(/\s*[:\-\u2013\u2014]\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();

/* ──────────────────────────────── gates ──────────────────────────────── */

/**
 * Section headings that are furniture, not topics.
 *
 * PREFIX-MATCHED, NOT ANCHORED AT BOTH ENDS. The first version ended in `$`
 * and therefore matched "Practice Questions" but not "Practice Questions &
 * Answer Key" — which sailed through and offered a student a fill-in-the-blank
 * exam question ("Flight Duty Period ... is ______ hrs") as though it were
 * teaching. Same for "Part A — MCQs". A heading that OPENS with one of these
 * words is furniture however it ends.
 */
const BOILERPLATE =
  /^(in this chapter|contents?|table of contents|index|practice|questions?\b|answers?\b|summary|revision|self[- ]test|test yourself|exercises?|quiz|mcqs?\b|part [a-z]\b|references?|further reading|introduction|overview|objectives|learning objectives|key points?|quick reference|recap|conclusion|notes?\b|glossary|abbreviations?|worked example|example|note |step \d|appendix)/i;

/** Iron Rule 2 — nothing Gini says may attribute teaching to a third party. */
const ATTRIBUTION = /\b(oxford|cae|nordian|redbird|jeppesen|ic\s*joshi|joshi|rk\s*bali|bali)\b/i;

/** An explanation that needs a picture is worse than silence when spoken. */
const NEEDS_FIGURE =
  /\b(figure|diagram|graph|chart|as shown|shown above|shown below|in the picture|refer to the|see the illustration)\b/i;

/**
 * Multiple-choice scaffolding that leaked out of an embedded practice block.
 * The interactive chapters render their own quizzes inline, so stripping tags
 * leaves the machinery ("Show Answer", "click an option", the blank rules used
 * for fill-ins) sitting in the middle of otherwise ordinary prose.
 */
const MCQ_SCAFFOLD =
  /(\b[A-D]\)\s|\([a-d]\)\s|\boption\s+\(?[A-D]\)?\b|\u270F|correct answer|show answer|answer\s*:|click an option|_{3,}|\btick\b|\bmark all\b)/i;

/**
 * Anaphora. "This is why long-haul routes fly Great Circle tracks" is a true
 * sentence and a useless answer: it points at a paragraph the student cannot
 * see. Found in the first extraction pass, and the reason that pass was
 * thrown away rather than shipped.
 */
const ANAPHORIC_START =
  /^(this|these|those|that|it|they|he|she|there|such|both|either|hence|thus|therefore|so|then|also|however|unfortunately|note|step|first|second|third|next|finally|when|where|if|because|since|although|while|after|before|during|for example|e\.g|i\.e|p-?\d|q-?\d|we|our|you|let|in this (chapter|section)|how|why|what|which|who)\b/i;

/**
 * A worked example wearing a definition's clothes: "At 1000 hrs, 150 NM from
 * DME, ETA is 1017." Guarded on a following number rather than on the
 * preposition alone, because "At the equator..." opens plenty of real
 * definitions and blacklisting "At" outright would cost them.
 */
const WORKED_EXAMPLE_START = /^(at|from|by|with|given|assume|suppose)\s+[\d(]/i;

/** Anaphora in the body, pointing outside the sentence. */
const DANGLING =
  /\b(those (connections|values|factors|points|figures)|the above|the following|as (we|described) (saw|above)|previous (section|chapter)|see below)\b/i;

/** A linking verb. Without one it is not a definition, it is a remark. */
const DEFINING =
  /\b(is|are|means|refers? to|is defined as|is called|is known as|stands for|consists? of|occurs? when|describes?)\b/i;

/**
 * Labels the chapters print before a definition. A closed, inspectable list —
 * anything not on it is left alone rather than guessed at.
 *
 * Applied REPEATEDLY, and after a repeated heading is removed, because the
 * chapters stack them: "The Retina — DGCA-quoted The Retina is a light
 * sensitive screen..." puts the topic name, a separator and the label all in
 * front of the sentence. Stripping only at position 0 left "The Retina —
 * DGCA-quoted" glued to the front of an otherwise perfect definition.
 */
const LEAD_LABEL =
  /^(definitions?( & purpose| and purpose)?|dgca[- ]quoted( definition)?|key (properties|facts?|points?|exam facts?)|rules?|purpose|meaning|note|important|remember|exam tip|tip|overall purpose|one sentence|what this section covers|basis of [a-z]+|hazard|general)\b[\s:\u2014\u2013-]*/i;

/**
 * TABLE ROWS MASQUERADING AS PROSE. A stripped table reads as one long line of
 * capitalised fragments — "Rule Meaning Formula Var West, Mag Best M > T..." —
 * which passes a length check and every keyword check. Real prose is mostly
 * function words; a table row has almost none.
 */
const FUNCTION_WORDS =
  /\b(the|a|an|of|to|in|on|for|with|from|by|that|which|when|as|and|or|is|are|be|it|its|this|at|not)\b/gi;
const looksLikeTable = (s: string) => {
  const words = s.split(/\s+/).length;
  const fn = (s.match(FUNCTION_WORDS) || []).length;
  return words >= 8 && fn / words < 0.22;
};

/* ─────────────────────────────── extraction ─────────────────────────────── */

type Topic = {
  t: string;        // heading, cleaned
  a?: string[];     // aliases (an abbreviation and its expansion, etc.)
  s: string;        // subjectId, or "guides"
  c: string;        // chapterId, or the guide slug
  n: number;        // chapter number; 0 for a guide
  o?: string;       // opener sentence, verbatim, only if it passed every gate
  /** Set on a guide, so the href resolves to /guides/<slug> rather than a chapter. */
  g?: 1;
};

const drops: Record<string, number> = {};
const drop = (why: string) => { drops[why] = (drops[why] || 0) + 1; };

/**
 * Aliases: "ARIWS — Advanced Runway Incursion Warning System" must be findable
 * by either half, and "Compass Swing (Deviation)" by either. Split only on the
 * separators the chapters actually use, and keep pieces that stand alone.
 */
function aliasesFor(h: string): string[] {
  const out = new Set<string>();
  for (const part of h.split(/\s*[\u2014\u2013-]\s+|\s*[():]\s*/)) {
    const p = part.trim().replace(/[.,;]$/, "");
    if (p.length >= 3 && p.length <= 60 && p.toLowerCase() !== h.toLowerCase() && /[a-z]/i.test(p)) {
      out.add(p);
    }
  }
  return [...out];
}

/** Words too common to prove an opener is about its own heading. */
const STOP = new Set([
  "the", "a", "an", "of", "and", "or", "to", "in", "on", "for", "with", "from",
  "by", "at", "is", "are", "be", "its", "it", "this", "that", "as", "not",
  "system", "systems", "general", "basic", "part", "type", "types", "use", "uses",
]);

/** The words that would prove a sentence is about this heading. */
const keyWords = (h: string): string[] =>
  h.toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length >= 3 && !STOP.has(w));

/**
 * THE GATE THAT DID THE MOST WORK, AND IT IS ALMOST TAUTOLOGICAL:
 * a definition of X mentions X.
 *
 * Under the heading "Squall" the first sentence was "The strongest speeds are
 * ahead of the direction of movement." True, published, checked — and it never
 * says squall, so read out on its own it is a sentence about nothing. Under
 * "Air Almanac Table Methodology" the opener was "Step 3 — Result is LMT of
 * sunrise/sunset at your latitude."
 *
 * Requiring one significant word of the heading to appear in the sentence
 * removes that whole class at once, and it removes it for a reason that is
 * true rather than for a pattern that happened to fit.
 *
 * A heading made entirely of stop-words has nothing to test against, so it is
 * refused an opener rather than granted one on a technicality.
 */
function isAboutItsTopic(sentence: string, heading: string): boolean {
  const words = keyWords(heading);
  if (!words.length) return false;
  const hay = sentence.toLowerCase();
  return words.some(w => {
    // Match on the stem so "isogonals" satisfies "isogonal" and vice versa.
    const stem = w.replace(/(ies|es|s)$/, "");
    /**
     * WORD BOUNDARY, NOT SUBSTRING — found by reading the output, which is the
     * only way it could have been found. Under the heading "Air Navigation
     * (with Radio Nav and Instruments)" the kept sentence was "The most feared
     * paper, and fairly so — it is the widest", which names none of those
     * things. It passed because `includes("air")` matches "f-AIR-ly".
     *
     * Short aviation words are exactly the ones this bites: air, nav, met, sat,
     * ils, cg. Every one of them is a substring of ordinary English.
     */
    return new RegExp(`\\b${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(hay);
  });
}

/**
 * The first sentence under a heading that survives every gate, or nothing.
 *
 * Walks the body BLOCK BY BLOCK and takes the first sentence of each, rather
 * than the first four sentences of one flattened blob — a label block is then
 * simply a block that fails the gates, and the paragraph after it still gets
 * its turn.
 */
function openerFrom(bodyHtml: string, heading: string): string | null {
  const candidates = blocks(bodyHtml)
    .slice(0, 6)
    .map(b => (b.split(/(?<=[.!?])\s+/)[0] || "").trim())
    .filter(Boolean);

  for (const raw of candidates) {
    /**
     * Peel a repeated heading, then any label, then any label the heading was
     * hiding. Twice is enough for every stacking seen in these chapters.
     *
     * THE REPEATED HEADING IS ONLY PEELED IF A NEW SENTENCE FOLLOWS IT — the
     * same rule stripInlineLabel() uses, and it is here for the same defect.
     * "Compass Swing" followed by "A compass swing is the systematic process"
     * is a title line and should go. "The Vertical Card Compass" followed by
     * "(B-type / E-type) is the standard direct reading compass" is the
     * sentence's own SUBJECT, and peeling it left a student reading
     * "(B-type / E-type) is the standard direct reading compass".
     */
    const headingRe = new RegExp(
      `^${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[\\s:\u2014\u2013-]+`,
      "i",
    );
    let s = raw.trim();
    for (let pass = 0; pass < 2; pass++) {
      const withoutHeading = s.replace(headingRe, "");
      if (withoutHeading !== s && /^[A-Z]/.test(withoutHeading)) s = withoutHeading;
      s = s.replace(LEAD_LABEL, "").trim();
    }
    if (s.length < 40 || s.length > 300) { drop("length"); continue; }
    if (!/^[A-Z(]/.test(s)) { drop("no capital start"); continue; }
    if (!/[.!?]$/.test(s)) { drop("not a whole sentence"); continue; }
    if (ANAPHORIC_START.test(s)) { drop("anaphoric start"); continue; }
    if (WORKED_EXAMPLE_START.test(s)) { drop("worked example, not a definition"); continue; }
    if (DANGLING.test(s)) { drop("dangling reference"); continue; }
    if (!DEFINING.test(s)) { drop("no linking verb"); continue; }
    if (MCQ_SCAFFOLD.test(s)) { drop("mcq scaffolding"); continue; }
    if (NEEDS_FIGURE.test(s)) { drop("needs a figure"); continue; }
    if (ATTRIBUTION.test(s)) { drop("attribution (Iron Rule 2)"); continue; }
    if (looksLikeTable(s)) { drop("table row, not prose"); continue; }
    if ((s.match(/=/g) || []).length > 1) { drop("formula or table dump"); continue; }
    if (/study notes prepared|for cpl ?\/ ?atpl students/i.test(s)) { drop("cover boilerplate"); continue; }
    if (!isAboutItsTopic(s, heading)) { drop("does not mention its own topic"); continue; }
    return s;
  }
  return null;
}

const topics: Topic[] = [];
let chaptersRead = 0;
let headingsSeen = 0;

/** Walk one document's headings and record what survives the gates. */
function harvest(html: string, into: Omit<Topic, "t" | "a" | "o">) {
  const re = /<h([2-4])[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[2-4][^>]*>|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    headingsSeen++;
    const heading = cleanHeading(text(m[2]));
    if (heading.length < 3 || heading.length > 70) { drop("heading length"); continue; }
    if (BOILERPLATE.test(heading)) { drop("boilerplate heading"); continue; }
    if (ATTRIBUTION.test(heading)) { drop("heading attribution"); continue; }
    if (!/[a-z]/i.test(heading)) { drop("heading has no letters"); continue; }
    // A heading that is a whole sentence is a statement, not a topic name.
    if (/[.!?]$/.test(heading) || heading.split(/\s+/).length > 9) {
      drop("heading is a sentence");
      continue;
    }

    const opener = openerFrom(m[3], heading);
    const aliases = aliasesFor(heading);

    topics.push({
      t: heading,
      ...(aliases.length ? { a: aliases } : {}),
      ...into,
      ...(opener ? { o: opener } : {}),
    });
  }
}

for (const subject of [...CPL_SUBJECTS, ...ATPL_SUBJECTS]) {
  for (const chapter of subject.chapters) {
    const inline = getInlineNotes(subject.id, chapter.id);
    if (!inline) continue;
    chaptersRead++;
    harvest(inline.html, { s: subject.id, c: chapter.id, n: chapter.number });
  }
}

/**
 * THE GUIDES, WHICH ANSWER THE QUESTIONS THE CHAPTERS DO NOT.
 *
 * "How do I get a computer number", "what does the training cost", "what is the
 * exam pattern" — none of that is aviation theory, so none of it is in a
 * chapter, and Gini could not find a word of it. It is published,
 * Captain-approved prose sitting at /guides, and it is exactly what a student
 * asks a receptionist.
 *
 * Read straight from the file rather than through getInlineNotes(), which is
 * for chapters; the guides are served as their own pages and are not
 * transformed on the way out.
 */
let guidesRead = 0;
for (const g of GUIDES) {
  const path = join("public", "content", "guides", `${g.slug}.html`);
  if (!existsSync(path)) { drop("guide file missing"); continue; }
  guidesRead++;
  harvest(readFileSync(path, "utf8"), { s: "guides", c: g.slug, n: 0, g: 1 });
}

/* ──────────────────────────────── output ──────────────────────────────── */

const withOpener = topics.filter(t => t.o).length;

const banner = `/**
 * GENERATED — do not edit by hand.
 *   npx tsx tools/gini/build-topics.mts
 *
 * Every heading in the Captain's ${chaptersRead} published chapters, with the
 * chapter it lives in, plus ONE VERBATIM opening sentence wherever one passed
 * every gate in the generator. Nothing here is composed, paraphrased or
 * summarised: these strings are already live on the site.
 *
 * ${topics.length} topics, ${withOpener} of them carrying a spoken opener.
 *
 * Loaded LAZILY (see lib/gini/topics.ts). It must never be imported statically
 * from the client path — Gini renders on every route and this file is large.
 */`;

/**
 * EMITTED AS A PARSED STRING, NOT AS AN ARRAY LITERAL.
 *
 * Thousands of object literals in one expression defeat the TypeScript
 * checker outright — `error TS2590: Expression produces a union type that is
 * too complex to represent` — even with the array explicitly annotated. A
 * single string literal costs the compiler nothing, and V8 parses JSON faster
 * than it parses an equivalent object literal, so the runtime is better too.
 *
 * The JSON is embedded with JSON.stringify twice: once to serialise the data,
 * once to make that a correctly escaped TypeScript string.
 */
const body = [
  banner,
  "",
  "export type Topic = {",
  "  /** The Captain's own heading. */",
  "  t: string;",
  "  /** Other names the same heading offers, e.g. an abbreviation and its expansion. */",
  "  a?: string[];",
  "  /** Subject id, or \"guides\". */",
  "  s: string;",
  "  /** Chapter id, or the guide slug. */",
  "  c: string;",
  "  /** Chapter number; 0 for a guide. */",
  "  n: number;",
  "  /** One verbatim sentence from under that heading. Quoted, never edited. */",
  "  o?: string;",
  "  /** Present on a guide, so the href resolves to /guides/<slug>. */",
  "  g?: 1;",
  "};",
  "",
  `export const TOPICS: Topic[] = JSON.parse(${JSON.stringify(JSON.stringify(topics))});`,
  "",
].join("\n");

writeFileSync("lib/gini/generated/topics.ts", body, "utf8");

console.log(`chapters read      ${chaptersRead}`);
console.log(`guides read        ${guidesRead}`);
console.log(`headings seen      ${headingsSeen}`);
console.log(`topics kept        ${topics.length}`);
console.log(`  with an opener   ${withOpener}`);
console.log(`  link only        ${topics.length - withOpener}`);
console.log("\nDROPPED, and why:");
for (const [why, n] of Object.entries(drops).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(n).padStart(6)}  ${why}`);
}

if (REVIEW) {
  const lines = topics
    .filter(t => t.o)
    .map(t => `${t.s}/${t.c}\t${t.t}\t${t.o}`)
    .join("\n");
  writeFileSync(
    "TOPIC_OPENERS_FOR_REVIEW.tsv",
    `subject/chapter\theading\tsentence Gini would quote\n${lines}\n`,
    "utf8",
  );
  console.log(`\nwrote TOPIC_OPENERS_FOR_REVIEW.tsv (${withOpener} rows) for the Captain to read`);
}
