import type { Metadata } from "next";

// The sign-in form carries no search intent and nothing worth ranking. Keeping
// it out of the index concentrates crawl budget on the study content, and stops
// a near-duplicate of /signup competing with it.
export const metadata: Metadata = {
  title: "Sign In | Ghost Aviator",
  description: "Sign in to sync your Ghost Aviator progress across devices.",
  alternates: { canonical: "/login" },
  // A canonical even on a noindex page. Without one, every query-string variant
  // (?next=…, ?ref=…, a shared link with utm tags) is a separate URL Google can
  // discover and hold, and a bare noindex URL kept in the index is harder to
  // remove than one that was never split. Cheap, and the only three pages on
  // the site that lacked it.
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
