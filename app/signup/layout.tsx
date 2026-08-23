import type { Metadata } from "next";

// Same reasoning as /login: a form page with no search intent. noindex, but
// follow so the links out of it still pass through to the content.
export const metadata: Metadata = {
  title: "Create a Free Account | Ghost Aviator",
  description: "Create a free Ghost Aviator account to save your progress and unlock the full radio simulator.",
  alternates: { canonical: "/signup" },
  // A canonical even on a noindex page. Without one, every query-string variant
  // (?next=…, ?ref=…, a shared link with utm tags) is a separate URL Google can
  // discover and hold, and a bare noindex URL kept in the index is harder to
  // remove than one that was never split. Cheap, and the only three pages on
  // the site that lacked it.
  robots: { index: false, follow: true },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
