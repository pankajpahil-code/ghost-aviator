import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ContentProtection from "./components/ContentProtection";
import { SITE_URL } from "@/lib/site";

const TITLE = "Ghost Aviator — DGCA Exam Preparation";
const DESCRIPTION =
  "India's most comprehensive DGCA CPL/ATPL question bank, mock tests, notes, and video lectures for aviation students — free to start.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["DGCA", "CPL", "ATPL", "pilot exam", "aviation", "question bank", "mock test", "India"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Ghost Aviator",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    // og image supplied by app/opengraph-image.tsx (file convention)
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    // twitter image supplied by app/twitter-image.tsx (file convention)
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" style={{ background: "#050510" }}>
        <ContentProtection />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
