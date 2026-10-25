import Link from "next/link";
import { fitSnippet } from "@/lib/chapter-meta";
import type { Metadata } from "next";
import { getChapterSpecificQuestions } from "@/lib/questions";
import { getExamPaper } from "@/lib/exam-papers-meta";
import { SITE_URL, ORG_ID } from "@/lib/site";
import { faqPageJsonLd, formatDuration, type Faq } from "@/lib/landing-pages";
import { DEFAULT_OG_IMAGES } from "@/lib/og";

const SUBJECT = "meteorology";
const CHAPTERS = [
  { id: "met-25", title: "Aerodrome Met Reports: METAR, SPECI & TREND", blurb: "Decoding and encoding METAR, SPECI and TREND: groups for wind, visibility, RVR, weather, cloud, temperature, QNH and significant changes." },
  { id: "met-26", title: "Aviation Weather Forecasts: TAF, ARFOR & ROFOR", blurb: "Decoding TAF, area forecasts (ARFOR) and route forecasts (ROFOR), validity periods, change groups and probability groups." },
];

function load() {
  const chapters = CHAPTERS.map(c => ({ ...c, qs: getChapterSpecificQuestions(SUBJECT, c.id) }));
  const total = chapters.reduce((n, c) => n + c.qs.length, 0);
  return { chapters, total };
}

export function generateMetadata(): Metadata {
  const { total } = load();
  const title = `METAR & TAF Practice Questions (DGCA) | Ghost Aviator`;
  const description = fitSnippet(`${total} free DGCA CPL METAR, SPECI, TREND and TAF practice questions with answers and explanations, plus notes and lectures. No sign-up needed.`);
  return {
    title,
    description,
    alternates: { canonical: "/metar-taf-practice" },
    openGraph: { type: "website", title, description, url: `${SITE_URL}/metar-taf-practice`, images: DEFAULT_OG_IMAGES },
  };
}

export default function MetarTafPracticePage() {
  const { chapters, total } = load();
  const paper = getExamPaper("meteorology");

  const faqs: Faq[] = [
    {
      q: "Are the METAR and TAF practice questions free?",
      a: "Yes. The questions, answers and explanations are free to read and practise, and you do not need to sign up. Signing in only adds saved progress and attempt history on your dashboard.",
    },
    {
      q: "How many METAR and TAF questions are there?",
      a: `This page currently collects ${total} questions from the two Meteorology chapters on aerodrome reports and forecasts: ${chapters.map(c => `${c.qs.length} from ${c.title}`).join(" and ")}. The count is read from the live question bank.`,
    },
  ];
  if (paper) {
    faqs.push({
      q: "Where do METAR and TAF come up in the DGCA exam?",
      a: `They are part of the DGCA Meteorology paper, which is ${paper.questionCount} questions in ${formatDuration(paper.durationMin)}, passed at ${paper.passMark}%, with no negative marking.`,
    });
  }
  faqs.push({
    q: "Where can I learn to decode a METAR or TAF before practising?",
    a: "Each chapter has full notes and a video lecture. Open the chapter links on this page: the METAR, SPECI and TREND chapter covers the report groups, and the TAF, ARFOR and ROFOR chapter covers validity periods, change groups and probability groups.",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { ...faqPageJsonLd(faqs), "@id": `${SITE_URL}/metar-taf-practice#faq` },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/metar-taf-practice`,
        url: `${SITE_URL}/metar-taf-practice`,
        name: "METAR and TAF Practice Questions",
        description: `Free DGCA METAR, SPECI, TREND and TAF practice questions with answers and explanations.`,
        inLanguage: "en-IN",
        isAccessibleForFree: true,
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/metar-taf-practice#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Question Bank", item: `${SITE_URL}/question-bank` },
          { "@type": "ListItem", position: 3, name: "METAR and TAF Practice" },
        ],
      },
    ],
  };

  const card = { background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.06)" } as const;

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav aria-label="Breadcrumb" className="text-sm mb-6" style={{ color: "#64748b" }}>
          <Link href="/" className="no-underline" style={{ color: "#94a3b8" }}>Home</Link> / <Link href="/question-bank" className="no-underline" style={{ color: "#94a3b8" }}>Question Bank</Link> / METAR and TAF
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">METAR and TAF Practice Questions</h1>
        <p className="text-lg mb-4" style={{ color: "#94a3b8" }}>
          {total} DGCA CPL Meteorology questions on METAR, SPECI, TREND and TAF, each with the correct answer and an explanation. Free, no sign-up needed. Open the answer under a question after you have committed to your own.
        </p>
        <div className="flex flex-wrap gap-3 mb-10">
          <Link href="/cpl/meteorology/met-25/notes" className="px-5 py-3 rounded-xl font-bold text-white no-underline" style={{ background: "#ab794d" }}>
            METAR notes
          </Link>
          <Link href="/cpl/meteorology/met-26/notes" className="px-5 py-3 rounded-xl font-bold no-underline" style={{ color: "#f0913a", border: "1px solid rgba(240,145,58,0.35)" }}>
            TAF notes
          </Link>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">Learn the chapters first</h2>
          <ul className="space-y-3 list-none p-0">
            {chapters.map(c => (
              <li key={c.id} className="rounded-2xl p-5" style={card}>
                <p className="font-bold text-white mb-1">{c.title}</p>
                <p className="text-sm mb-2" style={{ color: "#94a3b8" }}>{c.blurb}</p>
                <p className="text-sm">
                  <Link href={`/cpl/${SUBJECT}/${c.id}/notes`} className="no-underline" style={{ color: "#ab794d" }}>Notes</Link>
                  {" · "}
                  <Link href={`/cpl/${SUBJECT}/${c.id}/video`} className="no-underline" style={{ color: "#ab794d" }}>Video lecture</Link>
                  {" · "}
                  <Link href={`/cpl/${SUBJECT}/${c.id}/questions`} className="no-underline" style={{ color: "#f0913a" }}>All {c.qs.length} questions</Link>
                </p>
              </li>
            ))}
          </ul>
        </section>

        {chapters.map(c => (
          <section key={c.id} className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">{c.title}: practice questions</h2>
            <p className="mb-5" style={{ color: "#94a3b8" }}>{c.qs.length} questions from this chapter.</p>
            <div className="space-y-4">
              {c.qs.map((q, i) => (
                <div key={i} className="rounded-2xl p-6" style={card}>
                  <p className="font-semibold text-white mb-3">{i + 1}. {q.q}</p>
                  <ol type="A" className="pl-6 mb-3 space-y-1" style={{ color: "#94a3b8" }}>
                    {q.opts.map((o, oi) => <li key={oi}>{o}</li>)}
                  </ol>
                  <details>
                    <summary className="cursor-pointer text-sm font-bold" style={{ color: "#f0913a" }}>Show answer</summary>
                    <p className="mt-2 text-sm" style={{ color: "#94a3b8" }}>
                      <strong style={{ color: "#4ade80" }}>Correct answer: {String.fromCharCode(65 + q.ans)}. {q.opts[q.ans]}</strong>
                    </p>
                    <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>{q.exp}</p>
                  </details>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-5">Quick answers</h2>
          <div className="space-y-4">
            {faqs.map(f => (
              <div key={f.q} className="rounded-2xl p-6" style={card}>
                <h3 className="text-lg font-bold text-white mb-2">{f.q}</h3>
                <p className="leading-relaxed" style={{ color: "#94a3b8" }}>{f.a}</p>
              </div>
            ))}
          </div>
          <p className="text-sm mt-4"><Link href="/how-answers-are-verified" style={{ color: "#ab794d" }}>How answers are verified</Link></p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Keep practising</h2>
          <ul className="space-y-2 pl-5 list-disc" style={{ color: "#94a3b8" }}>
            <li><Link href="/question-bank/meteorology" style={{ color: "#ab794d" }}>Full Meteorology question bank</Link></li>
            <li><Link href="/exam/meteorology" style={{ color: "#ab794d" }}>Timed Meteorology mock paper</Link></li>
            <li><Link href="/free-dgca-mock-test" style={{ color: "#ab794d" }}>Free DGCA mock tests</Link></li>
            <li><Link href="/past-papers" style={{ color: "#ab794d" }}>Previous-year papers</Link></li>
          </ul>
        </section>
      </div>
    </div>
  );
}