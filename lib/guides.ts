export type Guide = {
  slug: string;
  title: string;
  description: string;
  author: string;
  date: string;
};

export const GUIDES: Guide[] = [
  {
    slug: "computer-number",
    title: "How to Apply for a DGCA Computer Number",
    description: "A step-by-step guide to generating your eGCA computer number for DGCA CPL exams, including required documents, board verification, and common rejection reasons.",
    author: "Capt. Pankaj Pahil",
    date: "2024-05-15"
  },
  {
    slug: "cpl-mock-tests",
    title: "The Ultimate Guide to DGCA CPL Mock Tests",
    description: "Everything you need to know about preparing for DGCA pilot exams. Learn how to use our free chapter-wise quizzes and full-length mock tests effectively.",
    author: "Capt. Pankaj Pahil",
    date: "2024-05-20"
  },
  {
    slug: "rtr-exam-guide",
    title: "RTR(A) Exam Pattern & Syllabus Explained",
    description: "DGCA CAR Section 7 Series G Part VI breakdown of the RTR(A) examination syllabus, 48-hour curriculum, Transmission (Part 1) and Viva (Part 2) — updated for the DGCA takeover of the exam from the WPC in November 2025.",
    author: "Capt. Pankaj Pahil",
    date: "2025-11-27"
  }
];
