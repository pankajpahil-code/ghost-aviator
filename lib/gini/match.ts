/**
 * GINI'S MATCHER — how he decides that a typed sentence means a stored one.
 *
 * ────────────────────────────────────────────────────────────────────────────
 * This file makes Gini smarter WITHOUT making him inventive. Every improvement
 * here is about picking the RIGHT stored sentence more often. None of it can
 * ever produce a sentence that is not already written down somewhere.
 *
 * The failure mode being engineered against is not silence — it is a confident
 * answer to a question the student did not ask. The old matcher counted raw
 * shared words and accepted a score of 2, so "how many questions are in the
 * Meteorology bank" and "how many questions are in each DGCA paper" scored
 * identically on "many questions". Two defences:
 *
 *   1. RARE WORDS COUNT MORE (idf). "meteorology" is worth far more than
 *      "questions", because "questions" appears in most of the corpus.
 *   2. COVERAGE, NOT TOTAL. The score is the fraction of the QUERY's meaning
 *      that the stored entry accounts for, so a long entry cannot win by
 *      sheer length.
 *
 * Below the confidence floor he refuses. That is the correct outcome and it is
 * not a bug to be tuned away.
 * ────────────────────────────────────────────────────────────────────────────
 */

/** Words that carry no intent. Kept short — over-stripping loses meaning. */
const STOP = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "am", "do", "does",
  "did", "i", "im", "you", "your", "my", "me", "we", "us", "to", "of", "in", "on",
  "for", "at", "by", "with", "from", "as", "it", "its", "this", "that", "these",
  "those", "and", "or", "but", "if", "then", "than", "so", "there", "here", "any",
  "some", "much", "many", "get", "got", "have", "has", "had", "will", "would",
  "could", "should", "shall", "may", "might", "must", "about", "please",
  "tell", "know", "want", "need", "give", "sir", "plz", "pls", "also", "just",
  /**
   * INTERROGATIVES, AND THEY EARNED THEIR PLACE HERE THE HARD WAY.
   *
   * These were live terms until the self-test caught what that costs:
   *   - "where is the 1 in 60 rule" failed to find its own chapter, because
   *     "where" appears in no chapter title, so it counted as an unmatched
   *     rare term and dragged the coverage score below the floor. The one word
   *     that carried no meaning was outweighing the two that did.
   *   - "what does an altimeter measure" matched "What does the sensor of an
   *     INS/IRS measure?" on the two shared concepts "what" and "measure" —
   *     clearing the two-distinct-concepts guard on a question about a
   *     different instrument entirely. That is the exact failure mode this
   *     whole file exists to prevent: a confident, verified, irrelevant answer.
   *
   * The router still reads the raw query for question shape ("where", "how
   * many"), so nothing is lost by removing them from the MATCHING vocabulary.
   */
  "what", "which", "how", "why", "who", "whom", "whose", "when", "where",
]);

/**
 * Two- and three-letter tokens that are real aviation vocabulary and must
 * survive the length filter. Without this list a student typing "what is QNH"
 * or "explain RTR" loses the only word that mattered.
 */
const SHORT_TERMS = new Set([
  "rt", "rtr", "atc", "atis", "qnh", "qfe", "qne", "ils", "vor", "dme", "ndb",
  "adf", "gps", "rvr", "tas", "ias", "cas", "eas", "msl", "agl", "amsl",
  "fl", "ifr", "vfr", "vmc", "imc", "utc", "ist", "eta", "etd", "atd", "ata",
  "cpl", "atpl", "ppl", "spl", "fi", "fri", "iri", "sep", "mep", "dgca",
  "icao", "wpc", "aip", "car", "cfi", "moc", "poh", "afm", "cg", "far",
  "ssr", "mls", "gnss", "rnav", "rnp", "tcas", "gpws", "elt", "hf", "vhf", "uhf",
  "am", "fm", "sid", "star", "nm", "km", "kt", "kts", "isa", "sat", "oat",
]);

/**
 * Query-side vocabulary. Each canonical term is emitted whenever any of its
 * variants appears, so "how much does it cost", "what are the fees" and
 * "kitna" all reach the same stored answer. Variants may be phrases.
 *
 * ADDING TO THIS LIST IS SAFE. It changes which stored sentence is retrieved,
 * never what any sentence says. What is NOT safe is adding a variant that
 * belongs to two different intents — that is how a matcher starts answering
 * confidently and wrongly.
 */
const VOCAB: { canon: string; variants: string[] }[] = [
  { canon: "cost", variants: ["cost", "costs", "price", "prices", "pricing", "fee", "fees", "expensive", "cheap", "afford", "affordable", "budget", "charge", "charges", "rupees", "lakh", "lakhs", "paisa", "kitna", "money", "payment"] },
  { canon: "free", variants: ["free", "freely", "gratis", "no charge", "without paying", "muft"] },
  { canon: "negative", variants: ["negative", "minus", "deduct", "deduction", "penalty", "penalise", "penalize"] },
  { canon: "pass", variants: ["pass", "passing", "passmark", "pass mark", "cutoff", "cut off", "qualify", "qualifying", "clear", "cleared", "clearing", "percentage", "percent"] },
  { canon: "exam", variants: ["exam", "exams", "examination", "paper", "papers", "test", "tests", "attempt", "attempts", "sitting", "sittings"] },
  { canon: "computernumber", variants: ["computer number", "computer no", "computernumber"] },
  { canon: "rtr", variants: ["rtr", "rt", "radio telephony", "radiotelephony", "radio telephone", "rtra", "rtr a"] },
  { canon: "simulator", variants: ["simulator", "simulation", "sim", "practice calls", "practise calls", "transmission", "phraseology", "atc practice", "tower"] },
  { canon: "meteorology", variants: ["meteorology", "met", "weather", "metrology"] },
  { canon: "navigation", variants: ["navigation", "nav", "gen nav", "general navigation"] },
  { canon: "radionavigation", variants: ["radio navigation", "radionav", "rnav", "radio nav"] },
  { canon: "regulations", variants: ["regulations", "regulation", "regs", "air law", "law", "rules", "air regulations"] },
  { canon: "technicalgeneral", variants: ["technical general", "tech gen", "techgen", "technical", "general technical"] },
  { canon: "technicalspecific", variants: ["technical specific", "tech spec", "specific"] },
  { canon: "instrumentation", variants: ["instrumentation", "instruments", "instrument", "inst"] },
  { canon: "licence", variants: ["licence", "license", "cpl", "commercial pilot", "atpl", "airline transport", "ppl", "private pilot"] },
  { canon: "notes", variants: ["notes", "note", "chapter", "chapters", "study material", "material", "reading"] },
  { canon: "questions", variants: ["questions", "question", "mcq", "mcqs", "bank", "question bank", "practice", "practise", "quiz", "drill"] },
  { canon: "mocktest", variants: ["mock", "mock test", "mocks", "full test", "full paper", "timed test"] },
  { canon: "video", variants: ["video", "videos", "lecture", "lectures", "youtube", "channel", "watch"] },
  { canon: "book", variants: ["book", "books", "ebook", "pdf", "download"] },
  { canon: "classes", variants: ["class", "classes", "batch", "batches", "coaching", "tuition", "live", "online class", "admission", "enrol", "enroll", "teacher"] },
  { canon: "whatsapp", variants: ["whatsapp", "wa", "helpline", "help line", "group"] },
  { canon: "telegram", variants: ["telegram", "tg"] },
  { canon: "captain", variants: ["captain", "pahil", "pankaj", "instructor", "founder", "owner"] },
  { canon: "verify", variants: ["verified", "verify", "verification", "accurate", "accuracy", "trust", "trustworthy", "reliable", "source", "sources"] },
  { canon: "study", variants: ["study", "studying", "prepare", "preparation", "revise", "revision", "strategy", "plan", "schedule", "timetable", "routine", "tips", "advice", "approach", "method"] },
  { canon: "fail", variants: ["fail", "failed", "failing", "flunk", "reattempt", "re attempt", "retake"] },
  { canon: "fear", variants: ["scared", "afraid", "fear", "nervous", "anxiety", "anxious", "stress", "stressed", "panic", "worried", "demotivated"] },
  { canon: "duration", variants: ["duration", "hours", "minutes", "how long"] },
  { canon: "start", variants: ["start", "begin", "beginner", "getting started"] },
];

/** variant phrase -> canonical. Phrases are matched before tokenisation. */
const PHRASES: [string, string][] = [];
const WORD_CANON = new Map<string, string>();
for (const { canon, variants } of VOCAB) {
  for (const v of variants) {
    if (v.includes(" ")) PHRASES.push([v, canon]);
    else WORD_CANON.set(v, canon);
  }
}
// Longest phrases first, so "radio navigation" is not eaten by "navigation".
PHRASES.sort((a, b) => b[0].length - a[0].length);

export const normalise = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

/**
 * Turn a sentence into the set of concepts it is about. Phrases collapse to a
 * canonical term first; then single words are canonicalised; then anything
 * left that is long enough (or is known aviation shorthand) survives.
 */
export function terms(text: string): string[] {
  let s = normalise(text);
  const out: string[] = [];
  for (const [phrase, canon] of PHRASES) {
    if (s.includes(phrase)) {
      out.push(canon);
      s = s.split(phrase).join(" ");
    }
  }
  for (const w of s.split(" ")) {
    if (!w || STOP.has(w)) continue;
    const canon = WORD_CANON.get(w);
    if (canon) { out.push(canon); continue; }
    if (w.length > 2 || SHORT_TERMS.has(w)) out.push(w);
  }
  return out;
}

export const termSet = (text: string) => new Set(terms(text));

/* ─────────────────────────────── the index ─────────────────────────────── */

export type Doc<T> = {
  item: T;
  /** The text that says what this entry is ABOUT. Weighted heavily. */
  title: string;
  /** Supporting text. Matching here counts, but for less. */
  body?: string;
};

export type Hit<T> = {
  item: T;
  score: number;
  matched: string[];
  /**
   * How many query concepts landed in the TITLE rather than the body. A hit
   * with none of these is a hit on an entry that merely mentions the subject in
   * passing — "how should I study for the exam" matched an entry about why the
   * Navigation paper is large, purely through its answer text. Callers that
   * cannot afford that require at least one.
   */
  inTitle: number;
};

const BODY_WEIGHT = 0.35;

/**
 * A tiny in-memory ranked index. Built once per corpus — at module scope for
 * the small corpora, lazily for the question bank.
 */
export class Index<T> {
  private docs: { item: T; title: Set<string>; body: Set<string> }[] = [];
  private idf = new Map<string, number>();
  /** What an unknown word costs. See weight() for why it is the mean. */
  private meanIdf = 0;

  constructor(docs: Doc<T>[]) {
    const df = new Map<string, number>();
    for (const d of docs) {
      const title = termSet(d.title);
      const body = termSet(d.body ?? "");
      this.docs.push({ item: d.item, title, body });
      for (const t of new Set([...title, ...body])) df.set(t, (df.get(t) ?? 0) + 1);
    }
    const N = Math.max(1, this.docs.length);
    for (const [t, n] of df) this.idf.set(t, Math.log(1 + N / n));
    const idfs = [...this.idf.values()];
    this.meanIdf = idfs.length ? idfs.reduce((a, b) => a + b, 0) / idfs.length : 1;
  }

  /**
   * A WORD THIS CORPUS HAS NEVER SEEN IS WORTH AN AVERAGE WORD. Both obvious
   * alternatives are wrong, and each was tried and measured:
   *
   *   - Treating it as maximally rare (the original) lets one meaningless word
   *     veto a good match. "How does a VOR work" scored the VOR chapter below
   *     the floor and refused, because "work" is in no chapter title and its
   *     imagined weight outweighed the word that mattered.
   *   - Dropping it entirely over-matches on the small corpora. With unknown
   *     words free, "how many questions are in meteorology" scored the free
   *     question-bank pitch at a perfect 1.0 on the single word "questions",
   *     since a twelve-entry corpus has never heard of Meteorology.
   *
   * Charging it the mean keeps both honest: an unknown word counts against a
   * document, because it is evidence the corpus may not be about that — but it
   * cannot single-handedly overrule the words that did match.
   */
  private weight(t: string) {
    return this.idf.get(t) ?? this.meanIdf;
  }

  /**
   * Rank by how much of the QUERY each document accounts for, so a long entry
   * cannot win on length alone. Returns nothing below `floor`.
   */
  search(query: string, floor = 0.45, limit = 3): Hit<T>[] {
    const q = [...new Set(terms(query))];
    if (!q.length) return [];
    const total = q.reduce((n, t) => n + this.weight(t), 0);
    if (total <= 0) return [];

    const hits: Hit<T>[] = [];
    for (const d of this.docs) {
      let got = 0;
      let inTitle = 0;
      const matched: string[] = [];
      for (const t of q) {
        const w = this.weight(t);
        if (d.title.has(t)) { got += w; matched.push(t); inTitle++; }
        else if (d.body.has(t)) { got += w * BODY_WEIGHT; matched.push(t); }
      }
      const score = got / total;
      if (score >= floor) hits.push({ item: d.item, score, matched, inTitle });
    }
    return hits.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  /** The single best hit, or null. */
  best(query: string, floor = 0.45): Hit<T> | null {
    return this.search(query, floor, 1)[0] ?? null;
  }

  /**
   * The best hit that actually matched in the TITLE, not merely somewhere in
   * the answer text. Use this wherever answering the wrong question is worse
   * than answering none.
   */
  bestByTitle(query: string, floor = 0.45): Hit<T> | null {
    return this.search(query, floor, 5).find(h => h.inTitle > 0) ?? null;
  }
}

/**
 * Did the student's sentence mention this concept at all? Used by intent
 * detectors that need a hard gate rather than a ranking.
 */
export const mentions = (query: string, ...canon: string[]) => {
  const t = termSet(query);
  return canon.some(c => t.has(c));
};
