import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ContentProtection from "./components/ContentProtection";
import ProgressSync from "./components/ProgressSync";
import { SITE_URL, CAPTAIN_PROFILES } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const TITLE = "Ghost Aviator — DGCA Pilot Course, CPL/ATPL Exam Prep & Live Ground Classes";
const DESCRIPTION =
  "India's most complete DGCA pilot training prep — free CPL/ATPL question bank, notes, mock tests and past papers, plus live online ground classes in Air Regulations, Meteorology and Air Navigation by Capt. Pankaj Pahil.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "DGCA", "CPL", "ATPL", "pilot exam", "aviation", "question bank", "mock test", "India",
    "DGCA pilot course", "pilot training India", "DGCA ground classes", "CPL coaching online",
    "DGCA exam preparation", "air navigation classes", "aviation meteorology classes",
    "air regulations classes", "how to become a pilot in India", "DGCA CPL syllabus",
  ],
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
  // Google Search Console verification
  verification: { google: "TghR6KcOYeEDo1WjLWAVuTiutX4yynj00qyVfO3UJe4" },
};

// Structured data so Google understands the site (rich results + sitelinks search box).
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOrganization",
      "@id": `${SITE_URL}/#org`,
      name: "Ghost Aviator",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: DESCRIPTION,
      founder: { "@type": "Person", name: "Capt. Pankaj Pahil" },
      areaServed: "IN",
      sameAs: CAPTAIN_PROFILES,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Ghost Aviator",
      publisher: { "@id": `${SITE_URL}/#org` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/question-bank?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`h-full ${inter.className}`}>
      <body className="min-h-full flex flex-col" style={{ background: "#0a0f14" }}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
        <ContentProtection />
        <ProgressSync />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
