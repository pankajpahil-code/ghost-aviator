import type { Metadata } from "next";

// A utility form with no search intent. noindex, but follow so the links back
// to the study content still pass through.
export const metadata: Metadata = {
  title: "Reset Your Password | Ghost Aviator",
  description: "Request a password reset link for your Ghost Aviator account.",
  alternates: { canonical: "/forgot-password" },
  robots: { index: false, follow: true },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
