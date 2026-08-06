import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { GUIDES } from "@/lib/guides";
import { ChevronLeft, Calendar, User, Clock } from "lucide-react";
import { SITE_URL, PERSON_ID, ORG_ID } from "@/lib/site";
import { faqsForGuide, faqJsonLd } from "@/lib/faq";

import LiveClassUpsell from "@/app/components/LiveClassUpsell";

export function generateStaticParams() {
  return GUIDES.map(g => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = GUIDES.find(g => g.slug === slug);
  if (!guide) return { title: "Not Found" };
  
  return {
    title: `${guide.title} | Ghost Aviator Guides`,
    description: guide.description,
    alternates: { canonical: `/guides/${guide.slug}` },
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/guides/${guide.slug}`,
      publishedTime: guide.date,
      modifiedTime: guide.updated,
      authors: [`${SITE_URL}/about`],
    },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = GUIDES.find(g => g.slug === slug);
  
  if (!guide) notFound();

  // Load content
  const filePath = path.join(process.cwd(), "public", "content", "guides", `${slug}.html`);
  let contentHtml = "";
  try {
    contentHtml = fs.readFileSync(filePath, "utf-8");
  } catch {
    // If not written yet, show a placeholder
    contentHtml = `<p>This guide is currently being written by Capt. Pahil and will be available soon.</p>`;
  }

  // Calculate estimated read time (roughly 200 words per minute)
  const wordCount = contentHtml.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  // The author is a REFERENCE to the Person entity defined on /about, not a
  // loose name string. A bare {"@type":"Person","name":"..."} on each guide
  // creates six unconnected people; an @id reference credits all six articles
  // to the one instructor whose licence, books and channels are described once.
  // The same verified answers the /faq hub serves, filtered to this guide. A
  // guide that already answers a question is where an engine is most likely to
  // look for it, so the answer is marked up here too — one fact, one source,
  // rendered in both places rather than restated differently in each.
  const faqs = faqsForGuide(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      ...(faqs.length
        ? [{ ...faqJsonLd(faqs), "@id": `${SITE_URL}/guides/${guide.slug}#faq` }]
        : []),
      {
        "@type": "Article",
        "@id": `${SITE_URL}/guides/${guide.slug}#article`,
        "headline": guide.title,
        "description": guide.description,
        "author": { "@id": PERSON_ID },
        "datePublished": guide.date,
        "dateModified": guide.updated,
        "inLanguage": "en-IN",
        "isAccessibleForFree": true,
        "publisher": { "@id": ORG_ID },
        "mainEntityOfPage": { "@id": `${SITE_URL}/guides/${guide.slug}` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/guides/${guide.slug}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` },
          { "@type": "ListItem", position: 3, name: guide.title },
        ],
      },
    ],
  };

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/guides" className="inline-flex items-center gap-1 text-sm font-semibold mb-8 hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
          <ChevronLeft className="w-4 h-4" /> Back to Guides
        </Link>
        
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">{guide.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "#64748b" }}>
            {/* The byline links to the instructor's page. A student — and an
                answer engine — can follow it to the credentials behind the guide. */}
            <Link href="/about" className="flex items-center gap-1.5 no-underline hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
              <User className="w-4 h-4" /> {guide.author}
            </Link>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {guide.updated !== guide.date ? "Updated " : ""}
              {new Date(guide.updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {readTime} min read
            </div>
          </div>
        </header>

        {/* The Guide Content */}
        <div 
          className="prose prose-invert prose-purple max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        {/* Quick answers — the questions this guide gets asked, answered in a
            form short enough to be quoted and complete enough to stand alone. */}
        {faqs.length > 0 && (
          <section className="mt-14 mb-12">
            <h2 className="text-2xl font-bold text-white mb-5">Quick answers</h2>
            <div className="space-y-4">
              {faqs.map(f => (
                <div
                  key={f.q}
                  className="rounded-2xl p-6"
                  style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <h3 className="text-lg font-bold text-white mb-2">{f.q}</h3>
                  <p className="text-base leading-relaxed" style={{ color: "#94a3b8" }}>{f.a}</p>
                </div>
              ))}
            </div>
            <Link
              href="/faq"
              className="inline-block mt-5 text-sm font-bold no-underline"
              style={{ color: "#ab794d" }}
            >
              All DGCA exam questions →
            </Link>
          </section>
        )}

        {/* Live Classes Banner */}
        <div className="my-10">
          <LiveClassUpsell 
            subjectId={slug === "rtr-exam-guide" ? "radio-telephony" : "air-navigation"} 
            subjectColor={slug === "rtr-exam-guide" ? "#f0913a" : "#10b981"} 
          />
        </div>
        
        {/* Call to Action & Interlinking */}
        <div className="mt-16 p-8 rounded-2xl text-center" style={{ background: "rgba(171, 121, 77, 0.1)", border: "1px solid rgba(171, 121, 77, 0.2)" }}>
          <h3 className="text-xl font-bold text-white mb-2">Ready to clear your DGCA exams?</h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "#94a3b8" }}>
            Ghost Aviator provides free, high-quality, and interactive study material for DGCA CPL exams. Stop paying for outdated question banks.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/cpl" className="px-6 py-3 rounded-xl font-bold text-white transition-colors no-underline" style={{ background: "#ab794d" }}>
              Explore CPL Subjects
            </Link>
            <Link href="/cpl-cost-calculator" className="px-6 py-3 rounded-xl font-bold text-sky-400 border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 transition-colors no-underline">
              CPL Cost Calculator
            </Link>
          </div>
        </div>

        {/* Recommended Links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Recommended Pilot Study Tools</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/question-bank" className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-all no-underline">
              <div className="text-sm font-bold text-emerald-400 mb-1">DGCA Question Bank</div>
              <div className="text-xs text-slate-400">Practice questions across Air Navigation, Meteorology, Air Regs & Tech.</div>
            </Link>
            <Link href="/rtr-simulator" className="p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] transition-all no-underline">
              <div className="text-sm font-bold text-cyan-400 mb-1">RTR(A) Radio Simulator</div>
              <div className="text-xs text-slate-400">Interactive radio telephony simulator for Part 1 & Part 2 exams.</div>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
