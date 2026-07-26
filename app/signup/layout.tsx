import type { Metadata } from "next";

// Same reasoning as /login: a form page with no search intent. noindex, but
// follow so the links out of it still pass through to the content.
export const metadata: Metadata = {
  title: "Create a Free Account | Ghost Aviator",
  description: "Create a free Ghost Aviator account to save your progress and unlock the full radio simulator.",
  robots: { index: false, follow: true },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
