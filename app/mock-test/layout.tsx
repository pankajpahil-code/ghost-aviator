import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DGCA Mock Tests — CPL & ATPL Practice Exams | Ghost Aviator",
  description: "Take full-length and subject-wise DGCA mock tests for CPL and ATPL. Simulate the real exam environment with our extensive question bank and instant results.",
  // Tool page: subject is selected via ?subject=&type=. Those query variants
  // must not compete in search with /exam or chapter /questions pages, so the
  // route stays noindex and every variant canonicalises to the bare path.
  alternates: { canonical: "/mock-test" },
  robots: { index: false, follow: true },
};

export default function MockTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
