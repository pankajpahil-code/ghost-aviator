// Real student testimonials ONLY. Never publish an invented or paraphrased
// quote — an empty section with a "share your result" CTA is better than a
// fake review. Add entries exactly as students gave them (with permission).
//
// PROVENANCE (added 2026-08-06). Every quote below is transcribed from a
// WhatsApp screenshot the Captain supplied, and he holds the originals. The
// words are the students' own. Only SMS contractions were expanded — "u" to
// "you", "ur" to "your", "abt" to "about" — because a testimonial should be
// readable; nothing was added, sharpened or invented. If you cannot point at a
// screenshot for an entry, it does not belong in this file.
//
// NO NAMES. None of the screenshots showed a name, so none is claimed here.
// Never invent a name, a city, or a percentage to make an entry look stronger —
// that turns a real testimonial into a fabricated one.
//
// DELIBERATELY NOT MARKED UP AS schema.org Review / AggregateRating. Reviews an
// organisation collects about itself and hosts on its own site are not eligible
// for Google review rich results, and marking them up invites a structured-data
// manual action. These render as visible, honest social proof and nothing more.
export type Testimonial = {
  name: string;      // "Rahul S." — first name + initial is fine
  detail?: string;   // e.g. "CPL student, Jaipur" or "Cleared Met — 81%"
  subject?: string;  // site subject id if the quote is subject-specific
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
export const TESTIMONIALS: Testimonial[] = [
  {
    name: "DGCA CPL student",
    detail: "Cleared Technical Specific (PA-28)",
    subject: "technical-specific",
    quote: "I cleared tech spec PA-28 too. Thank you sir 🙏",
  },
  {
    name: "The same student, on Meteorology",
    detail: "Cleared Meteorology",
    subject: "meteorology",
    quote: "Thanks sir, I cleared met by your notes.",
  },
  {
    name: "DGCA CPL student",
    detail: "On the RTR(A) book",
    subject: "radio-telephony",
    quote:
      "This is really impressive and easy to understand, the RTR. Thank you once again for it.",
  },
];
