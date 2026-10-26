import type { Metadata } from "next";

// The page only works with a Supabase recovery session, so it has no search
// intent and must never be indexed. noindex, follow so the links out still pass.
export const metadata: Metadata = {
  title: "Set a New Password | Ghost Aviator",
  description: "Set a new password for your Ghost Aviator account.",
  alternates: { canonical: "/reset-password" },
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
