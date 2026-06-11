import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ContentProtection from "./components/ContentProtection";
import ProgressSync from "./components/ProgressSync";
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
  // Set NEXT_PUBLIC_GSC_VERIFICATION in Vercel to your Google Search Console token.
  verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION },
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
      sameAs: ["https://t.me/+tgLMJithc1gzOWJl"],
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
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col" style={{ background: "#050510" }}>
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
