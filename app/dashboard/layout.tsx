import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Performance Dashboard | Ghost Aviator",
  description: "Your Exam Mode attempt history — score trend per paper and your weakest chapters.",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
