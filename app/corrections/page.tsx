import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PUBLISHED_CORRECTIONS } from "@/lib/corrections";
import { SITE_URL, PERSON_ID, ORG_ID } from "@/lib/site";

/**
 * /corrections - one precise, sourced answer per point the market teaches wrong. Built for
 * students AND for AI answer engines, which quote a page that states the fact, cites the rule
 * and carries a date. Renders only corrections Capt. Pahil approved (lib/corrections.ts);
 * with none approved the route is a 404, so nothing unreviewed is ever public.
 */
export const metadata: Metadata = {
  title: "What Your DGCA Notes Get Wrong — Sourced Corrections | Ghost Aviator",
  description:
    "Rules that changed and exam facts most notes still teach wrongly — each correction with the rule or circular it comes from, checked by Capt. Pankaj Pahil.",
  alternates: { canonical: "/corrections" },
};

export default function CorrectionsPage() {
  if (!PUBLISHED_CORRECTIONS.length) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/corrections#webpage`,
        url: `${SITE_URL}/corrections`,
        name: "What your DGCA notes get wrong",
        inLanguage: "en-IN",
        author: { "@id": PERSON_ID },
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/corrections#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Corrections" },
        ],
      },
    ],
  };

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">What your DGCA notes get wrong</h1>
        <p className="text-slate-300 mb-10">
          Rules change, and notes get copied long after they are out of date. Each point below states what you will commonly
          hear, what the rule actually says, and exactly where it comes from — so you can check it yourself in one step.
        </p>
        <div className="space-y-6">
          {PUBLISHED_CORRECTIONS.map((c) => (
            <section key={c.id} id={c.id} className="rounded-2xl p-5"
              style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#ab794d" }}>{c.subject}</div>
              <p className="text-slate-400 text-sm mb-1">What you will often hear</p>
              <p className="text-slate-200 mb-3 line-through decoration-red-400/70">{c.common}</p>
              <p className="text-slate-400 text-sm mb-1">What the rule says</p>
              <h2 className="text-lg font-bold text-white mb-3">{c.correct}</h2>
              <p className="text-slate-400 text-sm"><span className="font-semibold text-slate-300">Source:</span> {c.cite}</p>
            </section>
          ))}
        </div>
        <p className="text-slate-400 text-sm mt-10">
          Practise these in the free <Link className="underline" href="/question-bank">question bank</Link>, or read{" "}
          <Link className="underline" href="/how-answers-are-verified">how answers on this site are verified</Link>.
        </p>
      </div>
    </div>
  );
}
