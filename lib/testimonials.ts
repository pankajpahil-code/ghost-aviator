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
// NO NAMES. Some screenshots show chat handles ("Raptor", "Brat", "R"), not
// real names, and no student has given permission to be quoted by handle — so
// none is used. Never invent a name, a city, or a percentage to make an entry
// look stronger; that turns a real testimonial into a fabricated one. If the
// Captain gets a student's consent, a real first name and initial is stronger
// than "DGCA CPL student" and should replace it.
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
