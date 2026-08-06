export type Guide = {
  slug: string;
  title: string;
  description: string;
  author: string;
  /**
   * The date this guide actually became public, verified against
   * `git log --diff-filter=A` on its HTML file. NOT the date of the rule it
   * describes, and never a plausible-looking guess.
   *
   * Audited 2026-08-06: all six dates here were wrong. Two claimed May 2024 for
   * files created 2026-07-25 — a fabricated publication history, which is both
   * untrue to students and a structured-data quality violation, since this feeds
   * `datePublished` on the Article schema.
   */
  date: string;
  /**
   * Last substantive content change (`git log -1` on the HTML). Bump this when
   * you change what a guide SAYS — not when a stylesheet or theme touches it.
   * Freshness is a claim like any other.
   */
  updated: string;
};

export const GUIDES: Guide[] = [
  {
    slug: "computer-number",
    title: "How to Apply for a DGCA Computer Number",
    description: "A step-by-step guide to generating your eGCA computer number for DGCA CPL exams, including required documents, board verification, and common rejection reasons.",
    author: "Capt. Pankaj Pahil",
    date: "2026-07-25",
    updated: "2026-07-25"
  },
  {
    slug: "cpl-mock-tests",
    title: "The Ultimate Guide to DGCA CPL Mock Tests",
    description: "Everything you need to know about preparing for DGCA pilot exams. Learn how to use our free chapter-wise quizzes and full-length mock tests effectively.",
    author: "Capt. Pankaj Pahil",
    date: "2026-07-25",
    updated: "2026-07-25"
  },
  {
    slug: "rtr-exam-guide",
    title: "RTR(A) Exam Pattern & Syllabus Explained",
    description: "DGCA CAR Section 7 Series G Part VI breakdown of the RTR(A) examination syllabus, 48-hour curriculum, Transmission (Part 1) and Viva (Part 2) — updated for the DGCA takeover of the exam from the WPC in November 2025.",
    author: "Capt. Pankaj Pahil",
    date: "2026-07-25",
    updated: "2026-07-30"
  },
  {
    slug: "how-to-become-a-pilot-in-india",
    title: "How to Become a Pilot in India",
    description: "The complete path to a Commercial Pilot Licence in India, in the order it actually happens: eligibility, the Class 1 and Class 2 medicals, your DGCA computer number, the written papers, RTR(A), 200 hours of flying, and what comes after the CPL.",
    author: "Capt. Pankaj Pahil",
    date: "2026-08-02",
    updated: "2026-08-02"
  },
  {
    slug: "dgca-cpl-exam-pattern",
    title: "DGCA CPL Exam Pattern & Syllabus",
    description: "The real DGCA CPL exam pattern — every paper with its question count, duration and 70% pass mark, why the Navigation paper is actually three subjects, why there is no negative marking, and how to plan the year around the papers.",
    author: "Capt. Pankaj Pahil",
    date: "2026-08-02",
    updated: "2026-08-02"
  },
  {
    slug: "pilot-training-cost-india",
    title: "Pilot Training Cost in India (2026)",
    description: "What a CPL really costs in India in 2026 — around ₹60 lakh, broken down line by line, plus the ₹15–25 lakh type rating nobody mentions, where the money actually moves, and the costs that are not in any brochure.",
    author: "Capt. Pankaj Pahil",
    date: "2026-08-02",
    updated: "2026-08-02"
  }
];
