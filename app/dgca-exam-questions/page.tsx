import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CPL_SUBJECTS } from "@/lib/subjects";
import { SITE_URL, ORG_ID } from "@/lib/site";
import { PQ_BASE, publishedPQSubjects, pqTopics, pqTotals } from "@/lib/previous-questions";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "DGCA CPL Previous Year Questions by Subject and Year | Ghost Aviator",
  description:
    "Questions candidates recalled from real DGCA CPL sittings, by subject and topic, each with the sittings it was asked in, the answer and an explanation. Free.",
  alternates: { canonical: PQ_BASE },
};

export default function PQIndexPage() {
  const subjects = publishedPQSubjects();
  if (!subjects.length) notFound();
  const url = `${SITE_URL}${PQ_BASE}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": `${url}#webpage`, name: "DGCA CPL previous year questions", url, inLanguage: "en-IN", publisher: { "@id": ORG_ID } },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "DGCA exam questions" },
        ],
      },
    ],
  };

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#f3c889", letterSpacing: "0.16em" }}>
          WHAT DGCA ACTUALLY ASKS
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">DGCA CPL previous year questions</h1>
        <p className="max-w-3xl mb-10 leading-relaxed" style={{ color: "#94a3b8" }}>
          After every DGCA sitting, candidates write down the questions they remember. We collected those recollections,
          merged the repeats, and recorded every sitting each question came up in. So you can see which questions DGCA keeps
          reusing, which topics carry the paper, and what was asked in any given year, with the answer and an explanation for
          every question.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subjects.map(s => {
            const tot = pqTotals(s);
            const accent = CPL_SUBJECTS.find(x => x.id === s.subjectId)?.color ?? "#f0913a";
            const top = pqTopics(s)[0];
            return (
              <Link key={s.slug} href={`${PQ_BASE}/${s.slug}`}
                    className="group rounded-2xl p-6 no-underline block"
                    style={{ background: "rgba(22,30,38,0.6)", border: `1px solid ${accent}40` }}>
                <h2 className="text-xl font-black text-white mb-2">{s.title}</h2>
                <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>
                  {tot.questions} questions · {tot.sittings} sittings · {s.firstYear}–{s.lastYear}
                </p>
                {top && <p className="text-xs mb-4" style={{ color: "#64748b" }}>Most asked topic: {top.name}</p>}
                <span className="inline-flex items-center gap-1 text-sm font-black" style={{ color: accent }}>
                  See the questions <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            );
          })}
        </div>
        <p className="mt-10 text-xs leading-relaxed max-w-3xl" style={{ color: "#64748b" }}>
          Recollections are not official papers, and a topic that is asked but rarely remembered is under-counted.
          Full timed papers are on <Link href="/past-papers" style={{ color: "#94a3b8" }}>Past Papers</Link>.
        </p>
      </div>
    </div>
  );
}
