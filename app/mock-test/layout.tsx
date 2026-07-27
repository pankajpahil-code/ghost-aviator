import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DGCA Mock Tests — CPL & ATPL Practice Exams | Ghost Aviator",
  description: "Take full-length and subject-wise DGCA mock tests for CPL and ATPL. Simulate the real exam environment with our extensive question bank and instant results.",
  // Bare /mock-test 404s by design (the generic test was removed 2026-07-26);
  // only ?subject= variants render. An indexable page whose canonical target
  // returns 404 is an SEO defect, so this tool page is noindex — students
  // reach it from the subject pages, never from search.
  robots: { index: false, follow: true },
};

export default function MockTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
