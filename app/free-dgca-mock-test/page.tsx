import Link from "next/link";
import type { Metadata } from "next";
import { EXAM_PAPERS } from "@/lib/exam-papers-meta";
import { SITE_URL, ORG_ID } from "@/lib/site";
import { QB_LANDINGS, faqPageJsonLd, formatDuration, type Faq } from "@/lib/landing-pages";

const TITLE = "Free DGCA Mock Test Online: Timed CPL Papers, No Sign-up | Ghost Aviator";
const DESCRIPTION =
  "Free DGCA mock tests online. Sit a timed CPL paper with the real question count, duration and 70% pass mark, no sign-up needed. Answers and explanations appear after you submit.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/free-dgca-mock-test" },
  openGraph: { type: "website", title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/free-dgca-mock-test` },
};

const FAQS: Faq[] = [
  {
    q: "Is the DGCA mock test on Ghost Aviator free?",
    a: "Yes. The timed mock papers are free and you can sit one without signing up. Signing in only saves your attempt history and progress on your dashboard.",
  },
  {
    q: "Do the mock papers match the real DGCA exam?",
    a: "They follow the DGCA paper structure: the same number of questions, the same time allowed and the same 70% pass mark as the real paper. The Navigation paper pools Air Navigation, Radio Navigation and Instrumentation, as DGCA does. Each sitting draws its questions at random from the site's question bank.",
  },
  {
    q: "Is there negative marking in the DGCA mock test?",
    a: "No. There is no negative marking in DGCA papers, and the mock papers do not apply any, so you should answer every question before time runs out.",
  },
  {
    q: "When do I see the correct answers?",
    a: "Answers are not shown during the paper, as in a real computer-based exam. When you submit, or when the timer reaches zero and the paper auto-submits, you get your score and a full answer review with explanations where they have been written.",
  },
  {
    q: "Can I flag questions and move between them?",
    a: "Yes. You can jump to any question, change your answer and flag questions to come back to before you submit.",
  },
];

export default function FreeMockTestPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { ...faqPageJsonLd(FAQS), "@id": `${SITE_URL}/free-dgca-mock-test#faq` },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/free-dgca-mock-test`,
        url: `${SITE_URL}/free-dgca-mock-test`,
        name: "Free DGCA Mock Test Online",
        description: DESCRIPTION,
        inLanguage: "en-IN",
        isAccessibleForFree: true,
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "ItemList",
        name: "Free DGCA CPL mock test papers",
        itemListElement: EXAM_PAPERS.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.title,
          url: `${SITE_URL}/exam/${p.id}`,
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/free-dgca-mock-test#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Free DGCA Mock Test" },
        ],
      },
    ],
  };

  const card = { background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.06)" } as const;

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">Free DGCA Mock Test Online</h1>
        <p className="text-lg mb-3" style={{ color: "#94a3b8" }}>
          Sit a timed DGCA CPL paper with the real question count, the real time limit and the 70% pass mark. Free, no sign-up needed. Your score and a full answer review appear when you submit.
        </p>
        <p className="mb-10" style={{ color: "#94a3b8" }}>
          Pick a paper below. Each sitting draws its questions at random from the Ghost Aviator question bank, so you can retake a paper and get a different set.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-5">DGCA mock test papers</h2>
          <div className="overflow-x-auto rounded-2xl" style={card}>
            <table className="w-full text-left text-sm" style={{ color: "#94a3b8" }}>
              <thead>
                <tr style={{ color: "#f0913a" }}>
                  <th className="p-3">Paper</th>
                  <th className="p-3">Questions</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Pass mark</th>
                  <th className="p-3"><span className="sr-only">Start</span></th>
                </tr>
              </thead>
              <tbody>
                {EXAM_PAPERS.map(p => (
                  <tr key={p.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <td className="p-3 font-semibold text-white">{p.title}</td>
                    <td className="p-3">{p.questionCount}</td>
                    <td className="p-3">{formatDuration(p.durationMin)}</td>
                    <td className="p-3">{p.passMark}%</td>
                    <td className="p-3"><Link href={`/exam/${p.id}`} className="font-bold no-underline" style={{ color: "#f0913a" }}>Start</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm mt-3" style={{ color: "#64748b" }}>
            RTR(A) Part 2 is a practical voice/ATC test rather than a written paper. Practise it in the free <Link href="/rtr-simulator" style={{ color: "#ab794d" }}>Radio Simulator</Link>.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">How the mock test works</h2>
          <ul className="space-y-2 pl-5 list-disc" style={{ color: "#94a3b8" }}>
            <li>One correct answer per question, and no negative marking: answer every question.</li>
            <li>The timer starts when you begin and the paper auto-submits at zero.</li>
            <li>Move between questions freely and flag the ones you want to revisit.</li>
            <li>Answers are shown only after you submit, followed by a review with explanations where written.</li>
            <li>Sign in if you want your attempts and weak chapters tracked on the <Link href="/dashboard" style={{ color: "#ab794d" }}>dashboard</Link>.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-3">Quick subject practice tests</h2>
          <p className="mb-4" style={{ color: "#94a3b8" }}>
            For a shorter sitting on one subject, open a random practice paper drawn from that subject&apos;s question bank, or read the questions first.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-none p-0">
            {QB_LANDINGS.map(l => (
              <li key={l.subjectId} className="rounded-xl p-3 flex justify-between gap-3 text-sm" style={card}>
                <span className="font-semibold text-white">{l.label}</span>
                <span className="whitespace-nowrap">
                  <Link href={`/mock-test?subject=${l.subjectId}&type=sample`} className="no-underline" style={{ color: "#f0913a" }}>Practice test</Link>
                  {" Â· "}
                  <Link href={`/question-bank/${l.subjectId}`} className="no-underline" style={{ color: "#ab794d" }}>Questions</Link>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-5">Quick answers</h2>
          <div className="space-y-4">
            {FAQS.map(f => (
              <div key={f.q} className="rounded-2xl p-6" style={card}>
                <h3 className="text-lg font-bold text-white mb-2">{f.q}</h3>
                <p className="leading-relaxed" style={{ color: "#94a3b8" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3">Keep preparing</h2>
          <ul className="space-y-2 pl-5 list-disc" style={{ color: "#94a3b8" }}>
            <li><Link href="/guides/how-to-prepare-for-dgca-cpl-exam-2026" style={{ color: "#ab794d" }}>How to prepare for the DGCA CPL exam in 2026</Link></li>
            <li><Link href="/guides/dgca-cpl-exam-pattern" style={{ color: "#ab794d" }}>DGCA CPL exam pattern and syllabus</Link></li>
            <li><Link href="/guides/cpl-mock-tests" style={{ color: "#ab794d" }}>How to use mock tests well</Link></li>
            <li><Link href="/past-papers" style={{ color: "#ab794d" }}>Previous-year papers</Link></li>
            <li><Link href="/question-bank" style={{ color: "#ab794d" }}>Full question bank</Link> Â· <Link href="/atpl" style={{ color: "#ab794d" }}>ATPL preparation</Link> Â· <Link href="/exam" style={{ color: "#ab794d" }}>Exam mode</Link></li>
          </ul>
        </section>
      </div>
    </div>
  );
}