import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CPL_SUBJECTS } from "@/lib/subjects";
import { SITE_URL, ORG_ID } from "@/lib/site";
import { PQ_BASE, getPQSubject, publishedPQSubjects, pqTopics, pqMostRepeated, pqTotals } from "@/lib/previous-questions";
import PQShell from "@/app/components/pq/PQShell";
import PQCard from "@/app/components/pq/PQCard";
import { ArrowLeft, ArrowRight } from "lucide-react";

type Params = { subject: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return publishedPQSubjects().map(s => ({ subject: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { subject } = await params;
  const s = getPQSubject(subject);
  if (!s) return {};
  const tot = pqTotals(s);
  return {
    title: `DGCA ${s.title} Previous Year Questions ${s.firstYear}–${s.lastYear} | Ghost Aviator`,
    description: `${tot.questions} questions recalled from ${tot.sittings} DGCA ${s.title} sittings, ${s.firstYear}–${s.lastYear}, by topic, with the sittings each was asked in, answers and explanations.`,
    alternates: { canonical: `${PQ_BASE}/${s.slug}` },
  };
}

export default async function PQSubjectPage({ params }: { params: Promise<Params> }) {
  const { subject } = await params;
  const s = getPQSubject(subject);
  if (!s) notFound();
  const accent = CPL_SUBJECTS.find(x => x.id === s.subjectId)?.color ?? "#f0913a";
  const topics = pqTopics(s);
  const top = pqMostRepeated(s, 15);
  const tot = pqTotals(s);
  const years = [...new Set(top.flatMap(q => q.years))].sort();
  const url = `${SITE_URL}${PQ_BASE}/${s.slug}`;
  const top3 = topics.slice(0, 3);
  const top3Share = Math.round(top3.reduce((n, t) => n + t.share, 0) * 100);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        name: `DGCA ${s.title} previous year questions`,
        url,
        inLanguage: "en-IN",
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "DGCA exam questions", item: `${SITE_URL}${PQ_BASE}` },
          { "@type": "ListItem", position: 3, name: s.title },
        ],
      },
    ],
  };

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <Link href={PQ_BASE} className="inline-flex items-center gap-1 text-sm no-underline mb-6" style={{ color: "#94a3b8" }}>
          <ArrowLeft className="w-4 h-4" /> All subjects
        </Link>
        <div className="text-xs font-bold tracking-widest mb-2" style={{ color: accent, letterSpacing: "0.16em" }}>
          DGCA PREVIOUS YEAR QUESTIONS
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">{s.title}: questions asked {s.firstYear}–{s.lastYear}</h1>
        <p className="max-w-3xl mb-8 leading-relaxed" style={{ color: "#94a3b8" }}>
          {tot.questions} questions recalled by candidates from {tot.sittings} DGCA sittings, with every sitting each one was asked in.
          {tot.repeated > 0 && <> {tot.repeated} of them came up in three or more sittings: those are the ones DGCA keeps reusing.</>}
          {top3.length === 3 && <> The three most-asked topics, {top3.map(t => t.name).join(", ")}, carry {top3Share}% of everything asked.</>}
        </p>

        <h2 className="text-xl font-black text-white mb-4">Topics, most asked first</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-12">
          {topics.map(t => (
            <Link key={t.slug} href={`${PQ_BASE}/${s.slug}/${t.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-xl px-4 py-3 no-underline"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div>
                <div className="font-bold text-white text-sm">{t.name}</div>
                <div className="text-xs" style={{ color: "#64748b" }}>
                  {t.count} questions · asked {t.appearances} times · {Math.round(t.share * 1000) / 10}% of the paper
                </div>
              </div>
              <ArrowRight className="w-4 h-4 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" style={{ color: accent }} />
            </Link>
          ))}
        </div>

        {top.length > 0 && (
          <>
            <h2 className="text-xl font-black text-white mb-2">The {top.length} most repeated questions</h2>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>Asked in the most sittings. Every topic page has the full list.</p>
            <PQShell years={years} accent={accent}>
              {top.map((q, i) => <PQCard key={q.id} q={q} n={i + 1} accent={accent} />)}
            </PQShell>
          </>
        )}

        <p className="mt-10 text-xs leading-relaxed" style={{ color: "#64748b" }}>
          These are candidates&apos; recollections, not official DGCA papers: wording can differ from the paper as set.
          Every answer was checked against the DGCA CARs, AIP India, ICAO documents or worked calculation
          {s.checked ? ` (independent check completed ${s.checked})` : ""}.{" "}
          <Link href="/how-answers-are-verified" style={{ color: "#94a3b8" }}>How answers are verified</Link>.
          For chapter notes and practice, see <Link href={`/cpl/${s.subjectId}`} style={{ color: "#94a3b8" }}>{s.short}</Link>.
        </p>
      </div>
    </div>
  );
}
