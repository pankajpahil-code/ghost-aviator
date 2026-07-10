// Real student testimonials ONLY. Never publish an invented or paraphrased
// quote — an empty section with a "share your result" CTA is better than a
// fake review. Add entries exactly as students gave them (with permission).
export type Testimonial = {
  name: string;      // "Rahul S." — first name + initial is fine
  detail?: string;   // e.g. "CPL student, Jaipur" or "Cleared Met — 81%"
  subject?: string;  // site subject id if the quote is subject-specific
  quote: string;
};

export const TESTIMONIALS: Testimonial[] = [
  // e.g. { name: "…", detail: "Cleared Air Regs — 78%", quote: "…" },
];
