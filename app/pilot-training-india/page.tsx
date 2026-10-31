import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, ORG_ID } from "@/lib/site";

const title = "Pilot Training in India: Aviation Studies & DGCA Exam Prep | Ghost Aviator";
const description = "Start your pilot studies in India: understand ground school and flight training, prepare for DGCA CPL and ATPL exams, and find free notes, questions and mock tests.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/pilot-training-india" },
};

const paths = [
  { title: "New to pilot training?", href: "/guides/how-to-become-a-pilot-in-india", text: "Understand the route to a Commercial Pilot Licence, the documents to prepare and the stages to plan before committing to a flying school." },
  { title: "Preparing for DGCA CPL exams", href: "/cpl", text: "Study by subject, read chapter notes, practise questions and use timed tests to find topics that need more work." },
  { title: "Continuing to ATPL theory", href: "/guides/dgca-atpl-study-guide", text: "Find the ATPL study material and understand how the theory stage fits into progression after CPL." },
  { title: "Planning the training budget", href: "/guides/pilot-training-cost-india", text: "Work through the main cost categories before comparing quotations. Use the cost calculator to explore your own assumptions." },
];

const questions = [
  { q: "What does Ghost Aviator offer for pilot training?", a: "Ghost Aviator provides aviation theory study material and DGCA CPL and ATPL exam preparation for student pilots in India. Self-study notes, practice questions and mock tests are free. Optional live online ground classes are taught by Capt. Pankaj Pahil. Practical flying hours and licence issue are separate from using this website." },
  { q: "What is the difference between ground school and flight training?", a: "Ground school develops the theory behind flying: navigation, weather, air regulations, aircraft systems and related subjects. Flight training develops practical skills in an aircraft with an instructor. Preparing for a written exam does not replace practical instruction or the regulator's licensing requirements." },
  { q: "Where should I start studying for DGCA exams?", a: "Start with the CPL subject hub and the exam-pattern guide. Read a chapter, answer its practice questions, review the explanations, then attempt a timed mock test. Keep a list of weak topics and return to the notes before your next attempt." },
  { q: "Can I use the study material while enrolled at a flying school?", a: "Yes. Student pilots can use the chapter notes, question banks and mock tests alongside their ground-school lessons and practical training. Follow your instructor and current official publications whenever they differ from a study aid." },
];

export default function PilotTrainingIndia() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "CollectionPage", "@id": `${SITE_URL}/pilot-training-india#webpage`, url: `${SITE_URL}/pilot-training-india`, name: title, description, inLanguage: "en-IN", publisher: { "@id": ORG_ID } },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Pilot training in India", item: `${SITE_URL}/pilot-training-india` },
      ] },
    ],
  };
  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-slate-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <p className="text-sm font-semibold text-orange-300 mb-4">AVIATION STUDIES · INDIA</p>
      <h1 className="text-3xl sm:text-5xl font-black text-white mb-6">Pilot training in India: start with a clear study plan</h1>
      <p className="text-lg leading-relaxed mb-5">Ghost Aviator helps student pilots study aviation theory and prepare for DGCA CPL and ATPL exams. Read free chapter notes, practise with question banks and mock tests, or join optional live online ground classes with Capt. Pankaj Pahil.</p>
      <p className="leading-relaxed text-slate-400 mb-10">A pilot-training plan includes both theory and practical flying. This site supports the study and written-exam stage. Aircraft training, medical assessment and licensing must be arranged through the appropriate providers and authorities.</p>
      <h2 className="text-2xl font-bold text-white mb-5">Choose your next step</h2>
      <div className="grid sm:grid-cols-2 gap-5 mb-12">
        {paths.map(p => <section key={p.href} className="border border-slate-700 rounded-2xl p-6 bg-slate-900"><h3 className="text-xl font-bold mb-3"><Link className="text-orange-300 underline" href={p.href}>{p.title}</Link></h3><p className="leading-relaxed">{p.text}</p></section>)}
      </div>
      <h2 className="text-2xl font-bold text-white mb-5">Build your aviation knowledge</h2>
      <p className="leading-relaxed mb-5">Begin with <Link className="text-orange-300 underline" href="/cpl/air-regulations">Air Regulations</Link>, <Link className="text-orange-300 underline" href="/cpl/meteorology">Aviation Meteorology</Link> and <Link className="text-orange-300 underline" href="/cpl/air-navigation">Air Navigation</Link>. Use the subject pages to reach the chapter material rather than trying to memorise an entire question bank at once.</p>
      <ul className="list-disc pl-6 space-y-3 mb-12">
        <li><Link className="text-orange-300 underline" href="/notes">Free CPL and ATPL study notes</Link> for structured chapter study.</li>
        <li><Link className="text-orange-300 underline" href="/question-bank">DGCA question banks</Link> for practice and explanation review.</li>
        <li><Link className="text-orange-300 underline" href="/free-dgca-mock-test">Timed DGCA mock tests</Link> to assess preparation.</li>
        <li><Link className="text-orange-300 underline" href="/live-classes">Live online ground classes</Link> for guided lessons and doubt clearing.</li>
        <li><Link className="text-orange-300 underline" href="/cpl-cost-calculator">Pilot-training cost calculator</Link> to organise your budget.</li>
      </ul>
      <h2 className="text-2xl font-bold text-white mb-5">Common questions about pilot studies</h2>
      {questions.map(({q,a}) => <section key={q} className="mb-7"><h3 className="text-xl font-semibold text-white mb-2">{q}</h3><p className="leading-relaxed">{a}</p></section>)}
      <p className="border-t border-slate-700 pt-6 mt-10 text-slate-400 leading-relaxed">Read about <Link className="text-orange-300 underline" href="/about">the instructor</Link> and <Link className="text-orange-300 underline" href="/how-answers-are-verified">how answers are verified</Link>. For current licensing and examination requirements, consult <a className="text-orange-300 underline" href="https://www.dgca.gov.in/">DGCA</a> and the <a className="text-orange-300 underline" href="https://pariksha.dgca.gov.in/">Pariksha examination portal</a>. These study resources supplement official requirements.</p>
    </article>
  );
}
