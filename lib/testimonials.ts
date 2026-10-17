// Real student testimonials ONLY. Never publish an invented or paraphrased
// quote — an empty section with a "share your result" CTA is better than a
// fake review. Add entries exactly as students gave them (with permission).
//
// PROVENANCE (added 2026-08-06). Every quote below is transcribed from a chat
// screenshot the Captain supplied, and he holds the originals. The words are the
// students' own. What was changed, exactly: SMS contractions expanded ("u" to
// "you", "ur" to "your", "abt" to "about") and sentence punctuation added, since
// the originals are unpunctuated chat messages. Wording was NOT smoothed —
// "your notes are goat" and "recall few things in exam" are left as written,
// because slightly awkward phrasing is what real testimonials look like and
// polishing them is how honest ones start reading like invented ones. Nothing
// was added, sharpened or invented. If you cannot point at a screenshot for an
// entry, it does not belong in this file.
//
// SELECTIVITY IS PART OF THE HONESTY. Several screenshots are simple
// "thank you sir" messages. They are genuine but say nothing a reader can use,
// and nine thin cards persuade less than five specific ones. Publish the quotes
// that name a subject, a paper or an outcome; leave the rest in the archive.
//
// ONE SCREENSHOT WAS PARTLY UNUSABLE: it showed the Captain's own reply listing
// his reference sources by name. The quoted context was excluded entirely — a
// testimonial must never smuggle a source name onto the site through a reply
// quote (Iron Rule 2). The student's own words in it carry none.
//
// ATTRIBUTION: On 2026-10-17 the Captain approved names and result screenshots
// for update.zip. Use only names visible in those screenshots. Cities have not
// been supplied. Older entries and the 86-mark student's chat handle remain
// anonymous. Never invent a name, city, percentage or student count.
//
// DELIBERATELY NOT MARKED UP AS schema.org Review / AggregateRating. Reviews an
// organisation collects about itself and hosts on its own site are not eligible
// for Google review rich results, and marking them up invites a structured-data
// manual action. These render as visible, honest social proof and nothing more.
export type Testimonial = {
  name: string;      // "Rahul S." — first name + initial is fine
  detail?: string;   // e.g. "CPL student, Jaipur" or "Cleared Met — 81%"
  subject?: string;  // site subject id if the quote is subject-specific
  context?: string; // Context for a short reply; never presented as student wording.
  followUpQuote?: string; // A second message from this same student, not a second person.
  featured?: boolean;
  result?: {
    score: string;
    subject: string;
    status: "Student-reported" | "Provisional";
  };
  resultImage?: { src: string; alt: string; width: number; height: number };
  quote: string;
};

// HOW MANY STUDENTS THESE REPRESENT — read before adding cards.
// The three screenshots are TWO conversations, not four. In the first, the
// student asks "is it necessary to join classes for RTR?" and the next
// screenshot opens with the Captain answering that same question — one student,
// who cleared Technical Specific and Meteorology. The third screenshot is a
// single thread from a second student about the RTR(A) book.
// Both quotes from that second student say much the same thing, so only the
// specific one is published; a generic "thank you so much" card beside it would
// pad the count and imply a third person.
// The card count is itself a claim. Keep it equal to what the screenshots show.
// UPDATE.ZIP 2026-10-17: five screenshots supplied for publication by the Captain.
// Cards below follow archive files 25124, 25105, 25131, 25127, 25106 respectively.
// Excerpts omit unrelated chat, third-party source names, contact details and images.
// 25131 joins two consecutive messages with a full stop. 25124/25106 omit trailing emoji.
// Scores are screenshot claims, not independently authenticated DGCA results.
// 25127 retains the question as editorial context; 53/100 is never called a pass.
// New cards do not establish that these students are distinct from earlier entries.
export const TESTIMONIALS: Testimonial[] = [
  {
    "name": "DGCA CPL student",
    "detail": "Reported Meteorology score: 86 marks",
    featured: true,
    result: { score: "86 marks", subject: "Meteorology", status: "Student-reported" },
    "subject": "meteorology",
    "quote": "Your QB was extremely helpful and made a huge difference. Thank you so much for providing such useful material, Sir!"
  },
  {
    "name": "Ravi Shah",
    "detail": "Cleared Air Regulations",
    "subject": "air-regulations",
    "quote": "The important points, mnemonics and precise explanations made self-study so much easier and more effective for me!!!!!"
  },
  {
    "name": "Jatin Verma",
    "detail": "Cleared Meteorology without coaching",
    "subject": "meteorology",
    "quote": "Bcoz of your notes i have cleared my met exam. Without Coaching"
  },
  {
    "name": "Monika",
    featured: true,
    result: { score: "90/100", subject: "Meteorology", status: "Provisional" },
    resultImage: { src: "/testimonials/monika-result.png", alt: "Student-supplied chat screenshot showing Monika's provisional CPL Session 03 of 2026 results: Air Navigation 53/100 and Aviation Meteorology 90/100, subject to final DGCA results.", width: 1065, height: 1944 },
    "detail": "Shared provisional scores: Meteorology 90/100; Air Navigation 53/100. CPL Regular Session 03 of 2026; subject to final result.",
    "subject": "meteorology",
    "context": "Asked whether any questions appeared from the questionnaire:",
    "quote": "There were multiple"
  },
  {
    "name": "Jaismeen Khan",
    featured: true,
    result: { score: "80/100", subject: "Air Regulations", status: "Provisional" },
    resultImage: { src: "/testimonials/jaismeen-result.png", alt: "Student-supplied chat screenshot showing Jaismeen Khan's provisional CPL Air Regulation score of 80/100 for Regular Session 03 of 2026, subject to the final DGCA result.", width: 1078, height: 1883 },
    "detail": "Air Regulations: provisional score 80/100. CPL Regular Session 03 of 2026; subject to final result.",
    "subject": "air-regulations",
    "quote": "Good afternoon sir\nI got the regs result Today\n80/100 I’m grateful for your guidance , your notes & ques helped me a lot\nThank youu"
  },
  {
    name: "DGCA CPL student",
    detail: "Cleared Technical Specific (PA-28) and Meteorology",
    subject: "technical-specific",
    quote: "I cleared tech spec PA-28 too. Thank you sir 🙏",
    followUpQuote: "Thanks sir, I cleared met by your notes.",
  },
  {
    name: "DGCA CPL student",
    detail: "On the RTR(A) book",
    subject: "radio-telephony",
    quote:
      "This is really impressive and easy to understand, the RTR. Thank you once again for it.",
  },
  {
    name: "DGCA CPL student",
    detail: "On the Air Navigation notes",
    subject: "air-navigation",
    quote:
      "Professor, your notes are goat — they helped me so much in learning convergency and departure last night. Before that I was so confused how to start.",
  },
  {
    name: "DGCA CPL student",
    detail: "Cleared Air Regulations",
    subject: "air-regulations",
    quote:
      "Sir, your videos really helped me for the regulation — that female AI voice and brainstorming were in my head, and I was able to recall few things in exam. I managed to clear it, and your online chapters quiz really helped me a lot.",
  },
];
