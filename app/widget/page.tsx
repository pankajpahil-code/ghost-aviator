import type { Metadata } from "next";
import Link from "next/link";

/**
 * /widget - instructions for flight schools, flying clubs and aviation sites that want to show
 * the free "DGCA Question of the Day" (app/embed/question/route.ts) on their own pages.
 *
 * The snippet puts the credit link in the HOST page's own HTML, below the frame. A link inside an
 * iframe belongs to our domain and gives no backlink; the plain link under it is what an embed
 * contributes. It is a brand link, visible, optional to keep - nothing hidden or keyword-stuffed.
 *
 * noindex, follow: a thin utility page; it is linked for the schools we write to, not for search.
 */
export const metadata: Metadata = {
  title: "Free DGCA Question of the Day for your website | Ghost Aviator",
  description: "Add a free, daily DGCA Meteorology practice question to your flight school or aviation club website. One line of code, no sign-up.",
  alternates: { canonical: "/widget" },
  robots: { index: false, follow: true },
};

const SNIPPET = `<iframe src="https://ghostaviator.com/embed/question" title="DGCA Question of the Day"
  width="100%" height="380" style="border:0;max-width:560px" loading="lazy"></iframe>
<p style="font-size:12px;margin:4px 0 0">DGCA Question of the Day from
  <a href="https://ghostaviator.com/question-bank">Ghost Aviator's free DGCA question bank</a></p>`;

export default function WidgetPage() {
  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-16">
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-3">A free DGCA question, every day, on your site</h1>
        <p className="text-slate-300 mb-8">
          For flight schools, flying clubs and aviation communities: paste the code below and your students get one verified
          DGCA Meteorology practice question a day, with the answer and explanation one tap away. It changes by itself every
          day. No sign-up, no cost, no tracking of your visitors.
        </p>

        <h2 className="text-xl font-bold text-white mb-3">Today&apos;s question, live</h2>
        <iframe src="/embed/question" title="DGCA Question of the Day - live preview" width="100%" height="380"
          style={{ border: 0, maxWidth: 560 }} loading="lazy" />

        <h2 className="text-xl font-bold text-white mt-10 mb-3">The code</h2>
        <pre className="text-xs sm:text-sm whitespace-pre-wrap break-all rounded-xl p-4"
          style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#e2e8f0" }}>
          {SNIPPET}
        </pre>

        <h2 className="text-xl font-bold text-white mt-10 mb-3">What your students see</h2>
        <ul className="text-slate-300 list-disc pl-5 space-y-2">
          <li>Questions come only from the Meteorology bank that has been checked answer-by-answer in two independent passes
            (<Link className="underline" href="/how-answers-are-verified">how answers are verified</Link>).</li>
          <li>The answer is hidden until they tap it, so they try first.</li>
          <li>It follows their device&apos;s light or dark setting and fits any width.</li>
        </ul>
        <p className="text-slate-400 text-sm mt-8">
          Questions or a different subject for your school? Write to Capt. Pankaj Pahil via the{" "}
          <Link className="underline" href="/about">about page</Link>.
        </p>
      </div>
    </div>
  );
}
