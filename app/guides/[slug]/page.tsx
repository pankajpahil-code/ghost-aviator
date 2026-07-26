import { notFound } from "next/navigation";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { GUIDES } from "@/lib/guides";
import { ChevronLeft, Calendar, User, Clock } from "lucide-react";
import { SITE_URL } from "@/lib/site";

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
  } catch (e) {
    // If not written yet, show a placeholder
    contentHtml = `<p>This guide is currently being written by Capt. Pahil and will be available soon.</p>`;
  }

  // Calculate estimated read time (roughly 200 words per minute)
  const wordCount = contentHtml.replace(/<[^>]*>?/gm, '').split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": guide.title,
    "description": guide.description,
    "author": {
      "@type": "Person",
      "name": guide.author,
    },
    "datePublished": guide.date,
    "publisher": {
      "@type": "Organization",
      "name": "Ghost Aviator",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/guides/${guide.slug}`
    }
  };

  return (
    <div style={{ background: "#06040e" }} className="min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/guides" className="inline-flex items-center gap-1 text-sm font-semibold mb-8 hover:text-white transition-colors" style={{ color: "#94a3b8" }}>
          <ChevronLeft className="w-4 h-4" /> Back to Guides
        </Link>
        
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">{guide.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "#64748b" }}>
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" /> {guide.author}
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> {new Date(guide.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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

        {/* Live Classes Banner */}
        <div className="my-10">
          <LiveClassUpsell 
            subjectId={slug === "rtr-exam-guide" ? "radio-telephony" : "air-navigation"} 
            subjectColor={slug === "rtr-exam-guide" ? "#00d4ff" : "#10b981"} 
          />
        </div>
        
        {/* Call to Action & Interlinking */}
        <div className="mt-16 p-8 rounded-2xl text-center" style={{ background: "rgba(124, 58, 237, 0.1)", border: "1px solid rgba(124, 58, 237, 0.2)" }}>
          <h3 className="text-xl font-bold text-white mb-2">Ready to clear your DGCA exams?</h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "#94a3b8" }}>
            Ghost Aviator provides free, high-quality, and interactive study material for DGCA CPL exams. Stop paying for outdated question banks.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/cpl" className="px-6 py-3 rounded-xl font-bold text-white transition-colors no-underline" style={{ background: "#7c3aed" }}>
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
