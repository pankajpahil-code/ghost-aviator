import Link from "next/link";
import { notFound } from "next/navigation";
import { fitTitle, fitSnippet } from "@/lib/chapter-meta";
import type { Metadata } from "next";
import { CPL_SUBJECTS } from "@/lib/subjects";
import { getSubjectQuestionPool, getChapterSpecificQuestions } from "@/lib/questions";
import { isIndexableChapterRoute } from "@/lib/indexability";
import { isRealExplanation } from "@/lib/explanation";
import { getExamPaper } from "@/lib/exam-papers-meta";
import { SITE_URL, ORG_ID } from "@/lib/site";
import { QB_LANDINGS, qbLandingFor, faqPageJsonLd, formatDuration, type Faq } from "@/lib/landing-pages";
import { DEFAULT_OG_IMAGES } from "@/lib/og";
import { ScoreCta } from "@/app/components/LiveCta";

export function generateStaticParams() {
  return QB_LANDINGS.map(l => ({ subject: l.subjectId }));
}
export const dynamicParams = false;

function load(subjectId: string) {
  const landing = qbLandingFor(subjectId);
  const subject = CPL_SUBJECTS.find(s => s.id === subjectId);
  if (!landing || !subject) return null;
  const pool = getSubjectQuestionPool(subjectId);
  const chapters = subject.chapters
    .filter(ch => isIndexableChapterRoute(subjectId, ch.id, "questions"))
    .map(ch => ({ id: ch.id, number: ch.number, title: ch.title, count: getChapterSpecificQuestions(subjectId, ch.id).length }))
    .filter(ch => ch.count > 0);
  // Deterministic, evenly spaced sample of questions that carry a real explanation.
  const explained = pool.filter(q => isRealExplanation(q.exp));
  const step = Math.max(1, Math.floor(explained.length / 5));
  const samples = Array.from({ length: Math.min(5, explained.length) }, (_, i) => explained[i * step]);
  return { landing, subject, pool, chapters, samples };
}

export async function generateMetadata({ params }: { params: Promise<{ subject: string }> }): Promise<Metadata> {
  const { subject: id } = await params;
  const d = load(id);
  if (!d) return { title: "Not Found" };
  const n = d.pool.length.toLocaleString("en-IN");
  const title = fitTitle(`DGCA ${d.landing.label} Question Bank`, [`${n} Free Questions | Ghost Aviator`, `${n} Free Questions`, "Ghost Aviator"]);
  const description = fitSnippet(`${n} free DGCA CPL ${d.landing.label} practice questions with answers marked and explanations where written, across ${d.chapters.length} chapter pages. No sign-up needed.`);
  return {
    title,
    description,
    alternates: { canonical: `/question-bank/${id}` },
    openGraph: { type: "website", title, description, url: `${SITE_URL}/question-bank/${id}`, images: DEFAULT_OG_IMAGES },
  };
}

export default async function SubjectQuestionBankPage({ params }: { params: Promise<{ subject: string }> }) {
  const { subject: id } = await params;
  const d = load(id);
  if (!d) notFound();
  const { landing, subject, pool, chapters, samples } = d;
  const n = pool.length.toLocaleString("en-IN");
  const paper = getExamPaper(landing.paperId);

  const faqs: Faq[] = [
    {
      q: `How many ${landing.label} questions are in the Ghost Aviator question bank?`,
      a: `The ${landing.label} bank currently holds ${n} questions. Each has one marked correct answer, and an explanation where one has been written. They are split across ${chapters.length} chapter question pages so you can practise one topic at a time.`,
    },
    {
      q: `Is the ${landing.label} question bank free?`,
      a: `Yes. The questions, answers and explanations are free to read and practise, and you do not need to sign up. Signing in only adds saved progress and attempt history on your dashboard.`,
    },
  ];
  if (paper) {
    faqs.push({
      q: `What is the DGCA ${paper.shortTitle} paper format?`,
      a: `The DGCA ${paper.shortTitle} paper is ${paper.questionCount} questions in ${formatDuration(paper.durationMin)}, passed at ${paper.passMark}%, with no negative marking. ${landing.formatNote ?? ""}`.trim(),
    });
  }
  faqs.push({
    q: "How do you know the answers are correct?",
    a: "Every answer is checked against an authoritative reference, such as a standard ATPL textbook, an ICAO Annex or the relevant DGCA regulation, before it is published. Anything that cannot be verified is flagged or removed rather than guessed.",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { ...faqPageJsonLd(faqs), "@id": `${SITE_URL}/question-bank/${id}#faq` },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/question-bank/${id}`,
        url: `${SITE_URL}/question-bank/${id}`,
        name: `DGCA ${landing.label} Question Bank`,
        description: landing.intro,
        inLanguage: "en-IN",
        isAccessibleForFree: true,
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/question-bank/${id}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Question Bank", item: `${SITE_URL}/question-bank` },
          { "@type": "ListItem", position: 3, name: `${landing.label} Question Bank` },
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
          <Link href="/" className="no-underline" style={{ color: "#94a3b8" }}>Home</Link> / <Link href="/question-bank" className="no-underline" style={{ color: "#94a3b8" }}>Question Bank</Link> / {landing.label}
        </nav>

        <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
          DGCA {landing.label} Question Bank: {n} Free Questions
        </h1>
        <p className="text-lg mb-4" style={{ color: "#94a3b8" }}>
          {n} DGCA CPL {landing.label} practice questions with the correct answer marked and an explanation where one has been written. Free, no sign-up needed. {landing.intro}
        </p>
        <div className="flex flex-wrap gap-3 mb-10">
          <Link href={`/cpl/${subject.id}`} className="px-5 py-3 rounded-xl font-bold text-white no-underline" style={{ background: "#ab794d" }}>
            Study {landing.label} chapters
          </Link>
          {paper && (
            <Link href={`/exam/${paper.id}`} className="px-5 py-3 rounded-xl font-bold no-underline" style={{ color: "#f0913a", border: "1px solid rgba(240,145,58,0.35)" }}>
              Timed {paper.shortTitle} mock paper
            </Link>
          )}
        </div>

        {paper && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-3">The real DGCA {paper.shortTitle} paper</h2>
            <p className="mb-2" style={{ color: "#94a3b8" }}>
              {paper.questionCount} questions in {formatDuration(paper.durationMin)}. Pass mark {paper.passMark}%, assessed per paper, with no negative marking. {landing.formatNote ?? ""}
            </p>
            <p style={{ color: "#94a3b8" }}>
              Rehearse it under the clock in the <Link href="/free-dgca-mock-test" style={{ color: "#ab794d" }}>free DGCA mock test</Link>, or read the <Link href="/guides/dgca-cpl-exam-pattern" style={{ color: "#ab794d" }}>full exam pattern guide</Link>.
            </p>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-2">{landing.label} questions by chapter</h2>
          <p className="mb-5" style={{ color: "#94a3b8" }}>
            Each link opens that chapter&apos;s own question set, with the number of questions in it.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0">
            {chapters.map(ch => (
              <li key={ch.id}>
                <Link href={`/cpl/${subject.id}/${ch.id}/questions`} className="flex justify-between gap-3 p-3 rounded-xl no-underline" style={card}>
                  <span className="text-sm font-semibold text-white">{ch.title}</span>
                  <span className="text-xs whitespace-nowrap" style={{ color: "#f0913a" }}>{ch.count} Qs</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-sm mt-4" style={{ color: "#64748b" }}>
            Want the theory first? Every chapter also has notes on the <Link href={`/cpl/${subject.id}`} style={{ color: "#ab794d" }}>{landing.label} subject page</Link>, and you can search all {" "}
            <Link href="/question-bank" style={{ color: "#ab794d" }}>questions in the full question bank</Link>.
          </p>
        </section>

        {id === "meteorology" && (
          <p className="mb-12" style={{ color: "#94a3b8" }}>
            Working on weather reports? Go straight to the <Link href="/metar-taf-practice" style={{ color: "#ab794d" }}>METAR and TAF practice questions</Link>.
          </p>
        )}

        {samples.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">Sample {landing.label} questions</h2>
            <p className="mb-5" style={{ color: "#94a3b8" }}>A few questions from the bank, with the answer and explanation under each.</p>
            <div className="space-y-4">
              {samples.map((q, i) => (
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
        )}

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
          <p className="text-sm mt-4"><Link href="/how-answers-are-verified" style={{ color: "#ab794d" }}>How answers are verified</Link> · <Link href="/faq" style={{ color: "#ab794d" }}>All DGCA exam questions</Link></p>
        </section>

        <div className="mb-12"><ScoreCta subject={subject.shortName} placement="questions_end" accent={subject.color} /></div>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Other subject question banks</h2>
          <div className="flex flex-wrap gap-2">
            {QB_LANDINGS.filter(l => l.subjectId !== id).map(l => (
              <Link key={l.subjectId} href={`/question-bank/${l.subjectId}`} className="text-sm px-3 py-1.5 rounded-full no-underline" style={{ color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)" }}>
                {l.label}
              </Link>
            ))}
            <Link href="/guides/how-to-prepare-for-dgca-cpl-exam-2026" className="text-sm px-3 py-1.5 rounded-full no-underline" style={{ color: "#f0913a", border: "1px solid rgba(240,145,58,0.35)" }}>
              How to prepare for the DGCA CPL exam
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}