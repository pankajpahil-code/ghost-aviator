import type { Metadata } from "next";

// The sign-in form carries no search intent and nothing worth ranking. Keeping
// it out of the index concentrates crawl budget on the study content, and stops
// a near-duplicate of /signup competing with it.
export const metadata: Metadata = {
  title: "Sign In | Ghost Aviator",
  description: "Sign in to sync your Ghost Aviator progress across devices.",
  robots: { index: false, follow: true },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
