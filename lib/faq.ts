/**
 * The answer layer.
 *
 * These are the questions Indian student pilots actually type, answered
 * directly. They exist for two audiences at once: a student who wants the fact
 * without reading a whole guide, and an answer engine that will only ever quote
 * something short, self-contained and unambiguous.
 *
 * IRON RULE 1 APPLIES HERE WITH FULL FORCE. Every answer below is a fact the
 * Captain has confirmed himself, or one traced to a primary source and cited in
 * `source`. This file is student-facing content, not marketing copy — do not add
 * an entry because it would rank well. If you cannot say where a figure comes
 * from, it does not go in.
 *
 * ANSWER SHAPE — this matters for whether we ever get cited:
 *   - The first sentence must answer the question completely on its own.
 *   - No "it depends" openings, no throat-clearing, no cross-references.
 *   - 2–4 sentences. Anything longer belongs in a guide, and should link to one.
 *   - Self-contained: it must still be true and intelligible quoted in isolation,
 *     because that is exactly how it will be quoted.
 */

export type FaqTopic = "exams" | "cost" | "rtr" | "licence" | "site";

export type FaqEntry = {
  q: string;
  a: string;
  topic: FaqTopic;
  /** Where the fact comes from. Internal provenance — not rendered. */
  source: string;
  /** Optional internal link shown under the answer. */
  href?: string;
  hrefLabel?: string;
  /** Guide slugs this question belongs on, for per-guide FAQ blocks. */
  guides?: string[];
};

export const TOPIC_LABEL: Record<FaqTopic, string> = {
  exams: "The DGCA written exams",
  licence: "Getting the licence",
  cost: "What it costs",
  rtr: "RTR(A)",
  site: "Using Ghost Aviator",
};

export const FAQS: FaqEntry[] = [
  // ---------------- exams ----------------
  {
    q: "Is there negative marking in the DGCA exams?",
    a: "No. There is no negative marking in any DGCA examination paper. A blank answer is a guaranteed zero while a guess costs you nothing, so you should fill in every question before you leave the hall — never leave a box empty.",
    topic: "exams",
    source: "The Captain, confirmed 2026-07-27",
    href: "/guides/dgca-cpl-exam-pattern",
    hrefLabel: "Full exam pattern",
    guides: ["dgca-cpl-exam-pattern", "cpl-mock-tests"],
  },
  {
    q: "What is the pass mark for DGCA CPL exams?",
    a: "The pass mark is 70% in each paper. It is assessed paper by paper — there is no aggregate across subjects, so a strong score in one paper cannot carry a weak score in another. Each paper is cleared, and stays cleared, on its own.",
    topic: "exams",
    source: "The Captain, confirmed 2026-07-27",
    href: "/guides/dgca-cpl-exam-pattern",
    hrefLabel: "Full exam pattern",
    guides: ["dgca-cpl-exam-pattern"],
  },
  {
    q: "How many questions are in each DGCA CPL paper?",
    a: "Navigation is 100 questions in 3 hours, Technical General is 100 questions in 3 hours, and Meteorology, Air Regulations and Technical Specific are each 50 questions in 2 hours. RTR(A) Part 1 is 50 questions in 1 hour. Every paper is passed at 70%.",
    topic: "exams",
    source: "The Captain, instructor citation 2026-07-12",
    href: "/guides/dgca-cpl-exam-pattern",
    hrefLabel: "Full exam pattern",
    guides: ["dgca-cpl-exam-pattern"],
  },
  {
    q: "Why is the DGCA Navigation paper so large?",
    a: "Because it is three subjects in one paper. The Navigation paper pools General Navigation, Radio Navigation and Instrumentation into a single 100-question, 3-hour examination. Students who prepare only General Navigation are usually the ones caught out by it.",
    topic: "exams",
    source: "The Captain, instructor citation 2026-07-12",
    href: "/cpl/air-navigation",
    hrefLabel: "Navigation chapters",
    guides: ["dgca-cpl-exam-pattern"],
  },

  // ---------------- licence ----------------
  {
    q: "How many flying hours do you need for a CPL in India?",
    a: "A Commercial Pilot Licence in India requires 200 hours of flight time in total. That figure is the headline requirement; the breakdown of what those hours must contain is set by the DGCA and by your flying school's approved syllabus.",
    topic: "licence",
    source: "Published in the site's own guide, 2026-07-27, corroborated independently",
    href: "/guides/how-to-become-a-pilot-in-india",
    hrefLabel: "The full path to a CPL",
    guides: ["how-to-become-a-pilot-in-india"],
  },

  // ---------------- cost ----------------
  {
    q: "How much does a CPL cost in India in 2026?",
    a: "Around ₹60 lakh all in. The flying itself is roughly 84% of that bill, at hourly rates between ₹8,000 and ₹25,000 depending on the school and the aircraft. Budget separately for a type rating afterwards, which is a further ₹15–25 lakh and is not included in any CPL quote.",
    topic: "cost",
    source: "The Captain, confirmed 2026-07-27",
    href: "/cpl-cost-calculator",
    hrefLabel: "Work out your own number",
    guides: ["pilot-training-cost-india", "how-to-become-a-pilot-in-india"],
  },
  {
    q: "Is a type rating included in the cost of a CPL?",
    a: "No. A type rating is a separate cost that comes after the licence, and it runs to a further ₹15–25 lakh. School quotes for a CPL do not include it, which is the single most common reason a training budget turns out short.",
    topic: "cost",
    source: "The Captain, confirmed 2026-07-27",
    href: "/guides/pilot-training-cost-india",
    hrefLabel: "Full cost breakdown",
    guides: ["pilot-training-cost-india"],
  },

  // ---------------- RTR ----------------
  {
    q: "Who conducts the RTR(A) exam — the DGCA or the WPC?",
    a: "The DGCA. It took the RTR(A) examination over from the WPC wing in November 2025, under the Radio Telephone Operator (Restricted) Certificate and Licence Rules, 2025. The WPC remains India's radio spectrum and apparatus regulator, including the aircraft radio station licence — but the exam itself is now a DGCA examination.",
    topic: "rtr",
    source: "The Captain, correction 2026-07-27; CAR Section 7 Series G Part VI",
    href: "/guides/rtr-exam-guide",
    hrefLabel: "RTR(A) exam guide",
    guides: ["rtr-exam-guide", "rtr-after-dgca-takeover"],
  },
  {
    q: "What are the two parts of the RTR(A) exam?",
    a: "Part 1 is a written paper of 50 questions in 1 hour. Part 2 is practical — a live radio telephony session with an examiner, covering transmission scenarios and a viva. Sittings are far more frequent since the DGCA took the exam over, and the written paper runs in Delhi, Mumbai, Hyderabad, Kolkata and Chennai.",
    topic: "rtr",
    source: "The Captain, 2026-07-27; instructor citation 2026-07-12",
    href: "/rtr-simulator",
    hrefLabel: "Practise Part 2 free",
    guides: ["rtr-exam-guide"],
  },

  // ---------------- site ----------------
  {
    q: "Is Ghost Aviator free?",
    a: "Yes. All the self-study material — notes, question banks, past papers, mock tests and the RTR(A) radio simulator — is free for every student pilot, and stays free. Live online ground classes with the Captain are the only paid part of the site.",
    topic: "site",
    source: "Site policy",
    href: "/cpl",
    hrefLabel: "Start studying",
    guides: ["free-vs-paid-dgca-question-banks"],
  },
  {
    q: "Should I pay for a DGCA question bank or use a free one?",
    a: "Pay only if you need something free self-study cannot give you — usually a live instructor for a weak subject. Notes, question banks, past papers, mock exams and the RTR(A) simulator on Ghost Aviator are free permanently; live online classes with the Captain are the optional paid part.",
    topic: "site",
    source: "Site policy; the Captain's framing 2026-10-07",
    href: "/guides/free-vs-paid-dgca-question-banks",
    hrefLabel: "Free vs paid guide",
    guides: ["free-vs-paid-dgca-question-banks"],
  },
  {
    q: "Do I need 1,500 hours before sitting ATPL theory exams?",
    a: "No. The 1,500-hour figure is about issue of the ATPL licence, not about sitting the theory papers. DGCA ATPL theory eligibility is built around holding an Indian CPL (with a documented alternate path for eligible defence personnel). Confirm the current CAR Section 7 Series B Part I wording on PARIKSHA before you apply.",
    topic: "exams",
    source: "CAR Section 7 Series B Part I eligibility (ATPL); Schedule II for licence issue — guide 2026-10-07",
    href: "/guides/atpl-theory-before-1500-hours",
    hrefLabel: "ATPL theory timing",
    guides: ["atpl-theory-before-1500-hours"],
  },
  {
    q: "When should I attempt DGCA ATPL theory after getting my CPL?",
    a: "Usually while CPL knowledge is still warm — often within the first years after CPL — unless a type rating or selection spike leaves you no study time. Theory passes have limited validity, so plan attempts against your hour-building timeline rather than waiting for 1,500 hours.",
    topic: "exams",
    source: "The Captain's instructor guidance 2026-10-07; validity per current DGCA rules",
    href: "/atpl",
    hrefLabel: "ATPL prep",
    guides: ["atpl-theory-before-1500-hours"],
  },
  {
    q: "What changed for RTR(A) when DGCA took over from the WPC?",
    a: "Since November 2025 the DGCA conducts the RTR(A) examination under the Radio Telephone Operator (Restricted) Certificate and Licence Rules, 2025 and CAR Section 7 Series G Part VI. Sittings are more frequent, the written paper runs in major cities, and you need a DGCA computer number. The WPC still regulates radio spectrum and apparatus.",
    topic: "rtr",
    source: "Existing FAQ + rtr-after-dgca-takeover guide 2026-10-07; CAR Sec 7 Series G Part VI",
    href: "/guides/rtr-after-dgca-takeover",
    hrefLabel: "RTR after DGCA takeover",
    guides: ["rtr-after-dgca-takeover", "rtr-exam-guide"],
  },
  {
    q: "How do you know the answers on this site are correct?",
    a: "Every answer is checked against an authoritative reference — a standard ATPL textbook, an ICAO Annex, or the relevant DGCA regulation — before it is published, and anything that cannot be verified is flagged or removed rather than guessed. The verification status of each subject is published openly, including the subjects that have not yet been audited.",
    topic: "site",
    source: "Editorial standard, /how-answers-are-verified",
    href: "/how-answers-are-verified",
    hrefLabel: "How answers are verified",
  },
];

export const faqsForGuide = (slug: string): FaqEntry[] =>
  FAQS.filter(f => f.guides?.includes(slug));

/** schema.org FAQPage mainEntity, built from whichever entries a page shows. */
export const faqJsonLd = (entries: FaqEntry[]) => ({
  "@type": "FAQPage",
  mainEntity: entries.map(f => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
});
