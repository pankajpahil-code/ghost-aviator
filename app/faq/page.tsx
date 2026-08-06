import type { Metadata } from "next";
import Link from "next/link";
import { HelpCircle, ArrowRight } from "lucide-react";
import { FAQS, TOPIC_LABEL, faqJsonLd, type FaqTopic } from "@/lib/faq";
import { SITE_URL, PERSON_ID, ORG_ID } from "@/lib/site";

const ACCENT = "#ab794d";
const CARD = "rgba(17,24,32,0.95)";
const HAIRLINE = "1px solid rgba(255,255,255,0.06)";

export const metadata: Metadata = {
  title: "DGCA Exam FAQ — Pass Marks, Negative Marking, Cost & RTR(A)",
  description:
    "Straight answers to the questions Indian student pilots ask most: negative marking, the 70% pass mark, how many questions in each DGCA CPL paper, what a CPL really costs, and who conducts the RTR(A) exam.",
  alternates: { canonical: "/faq" },
};

const ORDER: FaqTopic[] = ["exams", "licence", "cost", "rtr", "site"];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        ...faqJsonLd(FAQS),
        "@id": `${SITE_URL}/faq#faq`,
        url: `${SITE_URL}/faq`,
        inLanguage: "en-IN",
        author: { "@id": PERSON_ID },
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/faq#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "FAQ" },
        ],
      },
    ],
  };

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="relative overflow-hidden" style={{ borderBottom: `1px solid ${ACCENT}25` }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${ACCENT}18 0%, transparent 65%)` }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 text-center">
          <div
            className="inline-flex items-center justify-center p-3 rounded-full mb-6"
            style={{ background: `${ACCENT}15`, color: ACCENT }}
          >
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">DGCA exam questions, answered</h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#94a3b8" }}>
            The things students ask me most, answered straight. Every figure here is one I have
            confirmed myself or traced to the regulation.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {ORDER.map(topic => {
          const entries = FAQS.filter(f => f.topic === topic);
          if (!entries.length) return null;
          return (
            <section key={topic}>
              <h2 className="text-2xl font-bold text-white mb-5">{TOPIC_LABEL[topic]}</h2>
              <div className="space-y-4">
                {entries.map(f => (
                  <div key={f.q} className="rounded-2xl p-6" style={{ background: CARD, border: HAIRLINE }}>
                    {/* h3 carries the literal question a student types. Answer
                        immediately below, complete in its first sentence. */}
                    <h3 className="text-lg font-bold text-white mb-2">{f.q}</h3>
                    <p className="text-base leading-relaxed" style={{ color: "#94a3b8" }}>{f.a}</p>
                    {f.href && (
                      <Link
                        href={f.href}
                        className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold no-underline"
                        style={{ color: ACCENT }}
                      >
                        {f.hrefLabel ?? "Read more"} <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        <section className="rounded-2xl p-8 text-center" style={{ background: `${ACCENT}0f`, border: `1px solid ${ACCENT}30` }}>
          <h2 className="text-xl font-bold text-white mb-3">Not answered here?</h2>
          <p className="text-base leading-relaxed mb-6" style={{ color: "#94a3b8" }}>
            If something you need is missing, or something here does not match what you have been
            taught, tell me — that is how this list grows and how errors get caught.
          </p>
          <Link
            href="/how-answers-are-verified"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold no-underline"
            style={{ color: ACCENT, border: `1px solid ${ACCENT}55`, background: `${ACCENT}12` }}
          >
            How answers are verified <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
