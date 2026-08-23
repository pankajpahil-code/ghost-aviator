import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Performance Dashboard | Ghost Aviator",
  description: "Your Exam Mode attempt history — score trend per paper and your weakest chapters.",
  alternates: { canonical: "/dashboard" },
  // A canonical even on a noindex page. Without one, every query-string variant
  // (?next=…, ?ref=…, a shared link with utm tags) is a separate URL Google can
  // discover and hold, and a bare noindex URL kept in the index is harder to
  // remove than one that was never split. Cheap, and the only three pages on
  // the site that lacked it.
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
