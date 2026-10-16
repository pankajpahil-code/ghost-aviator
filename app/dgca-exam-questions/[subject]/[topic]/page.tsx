import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CPL_SUBJECTS } from "@/lib/subjects";
import { SITE_URL, ORG_ID } from "@/lib/site";
import { PQ_BASE, getPQSubject, publishedPQSubjects, pqTopics, pqTopicQuestions } from "@/lib/previous-questions";
import PQShell from "@/app/components/pq/PQShell";
import PQCard from "@/app/components/pq/PQCard";
import { ArrowLeft } from "lucide-react";

type Params = { subject: string; topic: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return publishedPQSubjects().flatMap(s => pqTopics(s).map(t => ({ subject: s.slug, topic: t.slug })));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { subject, topic } = await params;
  const s = getPQSubject(subject);
  const found = s && pqTopicQuestions(s, topic);
  if (!s || !found) return {};
  const t = found.topic;
  return {
    title: `${t.name} — DGCA ${s.title} Exam Questions | Ghost Aviator`,
    description: `${t.count} ${t.name} questions recalled from DGCA ${s.title} sittings ${s.firstYear}–${s.lastYear}, each with the sittings it was asked in, the answer and an explanation.`,
    alternates: { canonical: `${PQ_BASE}/${s.slug}/${t.slug}` },
  };
}

export default async function PQTopicPage({ params }: { params: Promise<Params> }) {
  const { subject, topic } = await params;
  const s = getPQSubject(subject);
  const found = s && pqTopicQuestions(s, topic);
  if (!s || !found) notFound();
  const { topic: t, questions } = found;
  const accent = CPL_SUBJECTS.find(x => x.id === s.subjectId)?.color ?? "#f0913a";
  const years = [...new Set(questions.flatMap(q => q.years))].sort();
  const url = `${SITE_URL}${PQ_BASE}/${s.slug}/${t.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        name: `${t.name} — DGCA ${s.title} exam questions`,
        url,
        inLanguage: "en-IN",
        isPartOf: { "@id": `${SITE_URL}${PQ_BASE}/${s.slug}#webpage` },
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "DGCA exam questions", item: `${SITE_URL}${PQ_BASE}` },
          { "@type": "ListItem", position: 3, name: s.title, item: `${SITE_URL}${PQ_BASE}/${s.slug}` },
          { "@type": "ListItem", position: 4, name: t.name },
        ],
      },
    ],
  };

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <Link href={`${PQ_BASE}/${s.slug}`} className="inline-flex items-center gap-1 text-sm no-underline mb-6" style={{ color: "#94a3b8" }}>
          <ArrowLeft className="w-4 h-4" /> All {s.short} topics
        </Link>
        <div className="text-xs font-bold tracking-widest mb-2" style={{ color: accent, letterSpacing: "0.16em" }}>
          DGCA {s.title.toUpperCase()} · ASKED IN REAL EXAMS
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">{t.name}</h1>
        <p className="mb-8 text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
          {t.count} questions on this topic, recalled by candidates after DGCA sittings between {s.firstYear} and {s.lastYear}.
          Together they were asked {t.appearances} times; the most repeated come first. Pick a year to see only what was asked that year.
        </p>
        <PQShell years={years} accent={accent}>
          {questions.map((q, i) => <PQCard key={q.id} q={q} n={i + 1} accent={accent} />)}
        </PQShell>
        <p className="mt-10 text-xs leading-relaxed" style={{ color: "#64748b" }}>
          These are candidates&apos; recollections, not official DGCA papers: wording can differ from the paper as set.
          Every answer was checked against the DGCA CARs, AIP India, ICAO documents or worked calculation
          {s.checked ? ` (independent check completed ${s.checked})` : ""}. Spotted a mistake? Tell us and we will check it against the source.
        </p>
      </div>
    </div>
  );
}
