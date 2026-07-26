import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DGCA Mock Tests — CPL & ATPL Practice Exams | Ghost Aviator",
  description: "Take full-length and subject-wise DGCA mock tests for CPL and ATPL. Simulate the real exam environment with our extensive question bank and instant results.",
  alternates: { canonical: "/mock-test" },
};

export default function MockTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
