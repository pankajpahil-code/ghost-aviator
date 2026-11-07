import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, ORG_ID, PERSON_ID } from "@/lib/site";
import { CHECKED_ON, EXAM_FEES, SOURCES, inr } from "@/lib/dgca-exam-info";
import { FactsByline, OfficialSources } from "@/app/components/OfficialSources";

const PATH = "/dgca-cpl-eligibility-and-fees";
const title = "DGCA CPL Eligibility & Exam Fees 2026 | Ghost Aviator";
const description =
  "Who can sit DGCA CPL exams (age 16+, 10+2 with Physics and Maths), the fee per paper (₹2,500 Regular, ₹5,000 OLODE), and what a CPL itself requires.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: PATH },
};

const regular = EXAM_FEES[0];
const olode = EXAM_FEES[1];
const rtr = EXAM_FEES[2];

const faqs = [
  {
    q: "What is the age limit for the DGCA CPL exams?",
    a: "You can register as a DGCA flight crew candidate from age 16, and there is no upper age limit. The licence itself is different: a Commercial Pilot's Licence is issued only to an applicant who is at least 18 on the date of application.",
  },
  {
    q: "What qualification do I need for the DGCA CPL exams?",
    a: "A pass in Class 10+2 with Physics and Mathematics from a recognised board or university, or an equivalent examination. Candidates who studied another stream can clear Physics and Mathematics separately through a recognised open school; DGCA asks for an equivalence certificate in some cases.",
  },
  {
    q: "How much is the DGCA CPL exam fee?",
    a: `${inr(regular.amount)} per paper in a Regular session and ${inr(olode.amount)} per paper in an OLODE (online on-demand) session, from the September 2026 Pariksha user manual. The RTR (Restricted) examination is ${inr(rtr.amount)} per paper. Fees are paid online through Bharatkosh and are not refunded or carried forward.`,
  },
  {
    q: "How many flying hours does a CPL need in India?",
    a: "At least 200 hours of flight time on aeroplanes within the five years before you apply, including 100 hours as pilot-in-command, 20 hours of cross-country as pilot-in-command, 10 hours of instrument time (no more than 5 on an approved simulator) and 5 hours at night.",
  },
];

export default function EligibilityAndFeesPage() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage", "@id": `${SITE_URL}${PATH}#webpage`, url: `${SITE_URL}${PATH}`, name: title, description,
        inLanguage: "en-IN", dateModified: CHECKED_ON, author: { "@id": PERSON_ID }, publisher: { "@id": ORG_ID },
      },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "DGCA CPL eligibility and exam fees", item: `${SITE_URL}${PATH}` },
      ] },
      { "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-slate-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <p className="text-sm font-semibold text-orange-300 mb-4">DGCA EXAMS · ELIGIBILITY &amp; FEES</p>
      <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">DGCA CPL eligibility and exam fees</h1>
      <FactsByline />

      <p className="text-lg leading-relaxed mb-10">
        Two different questions get mixed up here. <strong>Can I sit the DGCA papers?</strong> has a low bar: age 16 and
        10+2 with Physics and Mathematics. <strong>Can I be issued a CPL?</strong> needs much more: age 18, the medical,
        every paper passed, 200 hours of flying and the skill tests. That is why many students sit the papers before or
        during their flying training.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4">Who can register and sit the papers</h2>
      <ul className="list-disc pl-6 space-y-3 leading-relaxed mb-4">
        <li><strong>Age:</strong> minimum 16 years to register as a flight crew candidate. There is no maximum age.</li>
        <li><strong>Education:</strong> Class 10+2 with Physics and Mathematics from a recognised board or university, or its equivalent (needed for the CPL and ATPL categories; the PPL category is the exception).</li>
        <li><strong>Proof of age:</strong> your Class 10 certificate or mark sheet.</li>
        <li><strong>A DGCA computer number:</strong> one per candidate, valid for life, used for every flight crew exam you will ever sit. <Link className="text-orange-300 underline" href="/guides/computer-number">How to apply for it</Link>.</li>
        <li><strong>Board verification:</strong> marks fetched from DigiLocker need no separate Board Verification Certificate; otherwise the BVC is required. A board outside the Indian school boards needs an equivalence certificate from the Association of Indian Universities.</li>
      </ul>
      <p className="text-slate-400 leading-relaxed mb-10">From the Pariksha Flight Crew FAQ and the Flight Crew User Manual (September 2026).</p>

      <h2 className="text-2xl font-bold text-white mb-4">DGCA exam fees</h2>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-left border-collapse min-w-[480px]">
          <thead>
            <tr className="border-b border-slate-600 text-white">
              <th className="py-2 pr-4">Examination</th><th className="py-2 pr-4">Fee</th><th className="py-2">Charged</th>
            </tr>
          </thead>
          <tbody>
            {EXAM_FEES.map(f => (
              <tr key={f.label} className="border-b border-slate-800">
                <td className="py-2 pr-4">{f.label}</td>
                <td className="py-2 pr-4 font-semibold whitespace-nowrap">{inr(f.amount)}</td>
                <td className="py-2">{f.per}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-slate-400 leading-relaxed mb-4">Flight Crew User Manual, Issue IV, September 2026, Chapter 7.</p>
      <ul className="list-disc pl-6 space-y-2 leading-relaxed mb-6">
        <li>Fees are paid online through Bharatkosh. Your bank may add a small service charge.</li>
        <li>Fees cannot be refunded, adjusted or carried forward, even if your application is rejected or you miss the exam.</li>
        <li>You may apply only once in a session, and only for papers you are eligible for. An ineligible paper gets the application rejected.</li>
        <li>In one session you may initially sit only one aircraft-specific (Technical Specific) paper.</li>
      </ul>
      <p className="leading-relaxed mb-10">
        <strong>What the papers cost you in total:</strong> sitting all five CPL papers once costs {inr(regular.amount * 5)} in
        Regular sessions or {inr(olode.amount * 5)} in OLODE sessions, before any re-attempts. That is small next to the
        flying; the full picture is in <Link className="text-orange-300 underline" href="/guides/pilot-training-cost-india">what a CPL really costs in India</Link>.
        Session dates and closing dates are on <Link className="text-orange-300 underline" href="/dgca-exam-dates">DGCA exam dates 2026</Link>.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4">What the CPL itself requires</h2>
      <p className="leading-relaxed mb-4">
        Schedule II, Section J of the Aircraft Rules, 1937 sets the requirements for a Commercial Pilot&apos;s Licence
        (Aeroplanes). In plain terms:
      </p>
      <ul className="list-disc pl-6 space-y-3 leading-relaxed mb-6">
        <li><strong>Age:</strong> at least 18 on the date of application.</li>
        <li><strong>Education:</strong> 10+2 or equivalent with Physics and Mathematics.</li>
        <li><strong>Medical:</strong> a fitness certificate from a DGCA-approved medical board (the Class 1 medical). Do this first; it is the one requirement that can end the plan outright.</li>
        <li><strong>Knowledge:</strong> pass the written papers in Air Regulations, Air Navigation, Aviation Meteorology and Aircraft &amp; Engines, plus the signals practical. <Link className="text-orange-300 underline" href="/dgca-syllabus">The official syllabus for each paper</Link>.</li>
        <li>
          <strong>Experience:</strong> at least 200 hours of flight time as pilot of an aeroplane within the five years before you apply, including:
          <ul className="list-[circle] pl-6 mt-2 space-y-1">
            <li>100 hours as pilot-in-command, 15 of them in the six months before you apply;</li>
            <li>20 hours of cross-country as pilot-in-command, including one flight of at least 300 nautical miles with full-stop landings at two different aerodromes;</li>
            <li>10 hours of instrument time, of which no more than 5 may be on an approved simulator;</li>
            <li>5 hours at night, including 10 take-offs and 10 landings as pilot-in-command, within the six months before you apply.</li>
          </ul>
        </li>
        <li><strong>Training:</strong> flying training completed to the DGCA syllabus.</li>
        <li><strong>Radio:</strong> a current Flight Radio Telephone Operator&apos;s Licence. The RTR(A) examination comes first: <Link className="text-orange-300 underline" href="/guides/rtr-exam-guide">RTR(A) exam guide</Link>.</li>
        <li><strong>Skill tests</strong> on the aeroplane type, within the six months before you apply: a general flying test by day and by night, a day cross-country of at least 250 nautical miles with a full-stop landing away, and a night cross-country of at least 120 nautical miles.</li>
      </ul>
      <p className="leading-relaxed mb-10">
        Once issued, a CPL is valid for ten years (Aircraft Rules rule 39C, as amended by G.S.R. 733(E) of October 2023),
        subject to the renewal conditions and a current medical. The whole journey in order is in{" "}
        <Link className="text-orange-300 underline" href="/guides/how-to-become-a-pilot-in-india">how to become a pilot in India</Link>.
      </p>

      <h2 className="text-2xl font-bold text-white mb-5">Common questions</h2>
      {faqs.map(f => (
        <section key={f.q} className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">{f.q}</h3>
          <p className="leading-relaxed">{f.a}</p>
        </section>
      ))}

      <OfficialSources sources={[SOURCES.fcFaq, SOURCES.fcManual, SOURCES.aircraftRules]} />
    </article>
  );
}
