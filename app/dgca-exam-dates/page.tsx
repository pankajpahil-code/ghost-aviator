import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, ORG_ID, PERSON_ID } from "@/lib/site";
import {
  CALENDAR_2026, CALENDAR_NOTE, CHECKED_ON, EXAM_FEES, NOTICE_SESSIONS, OLODE_CENTRES,
  PARIKSHA_URL, REGULAR_CENTRES, SOURCES, fmtDate, inr, statusOn,
} from "@/lib/dgca-exam-info";
import { FactsByline, OfficialSources } from "@/app/components/OfficialSources";

const PATH = "/dgca-exam-dates";
const title = "DGCA Exam Dates 2026: CPL Exam Schedule & Deadlines | Ghost Aviator";
const description =
  "Every DGCA flight crew exam session in 2026 from the official calendar, the session now open for applications, its closing date, centres and fees.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: PATH },
};

const STATUS_LABEL = { done: "Held", now: "In progress", coming: "Coming", "": "" } as const;

const faqs = [
  {
    q: "When are the DGCA CPL exams in 2026?",
    a: "DGCA's 2026 calendar has four Regular sessions (10–14 March, 16–20 June, 22–26 September and 15–19 December) and eight online on-demand (OLOD) sessions spread through the year. The calendar says the dates are tentative, so confirm each session in its public notice on the Pariksha portal.",
  },
  {
    q: "What is the difference between a Regular session and an OLODE session?",
    a: "Both are DGCA flight crew written examinations. An OLODE (online on-demand) session lets you choose your own date and time slot from those available, seats are limited and given first come, first served, and it costs ₹5,000 a paper. A Regular session costs ₹2,500 a paper, and the current notice lists more centres for it (17 against 11). The same notice says the Technical Performance paper is not opened in its OLODE sessions.",
  },
  {
    q: "How do I apply for a DGCA exam session?",
    a: "Log in to pariksha.dgca.gov.in with your computer number while the portal is open for that session, select only the papers you are eligible for, and pay online through Bharatkosh before 22:00 on the closing date. You may apply only once per session, and fees are not refunded.",
  },
];

export default function DgcaExamDatesPage() {
  const rows = [...CALENDAR_2026].sort((a, b) => (a.start ?? "9999").localeCompare(b.start ?? "9999"));
  const openNow = NOTICE_SESSIONS.filter(s => s.portalOpens <= CHECKED_ON && s.portalCloses >= CHECKED_ON);
  const nextExam = NOTICE_SESSIONS.find(s => s.examStart > CHECKED_ON);
  const regular = EXAM_FEES[0];
  const olode = EXAM_FEES[1];

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage", "@id": `${SITE_URL}${PATH}#webpage`, url: `${SITE_URL}${PATH}`, name: title, description,
        inLanguage: "en-IN", dateModified: CHECKED_ON, author: { "@id": PERSON_ID }, publisher: { "@id": ORG_ID },
      },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "DGCA exam dates 2026", item: `${SITE_URL}${PATH}` },
      ] },
      { "@type": "FAQPage", mainEntity: faqs.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-slate-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <p className="text-sm font-semibold text-orange-300 mb-4">DGCA EXAMS · 2026</p>
      <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">DGCA exam dates 2026</h1>
      <FactsByline />

      <p className="text-lg leading-relaxed mb-6">
        DGCA runs its flight crew written examinations in two kinds of session: four <strong>Regular</strong> sessions a
        year and eight <strong>OLODE</strong> (online on-demand) sessions. Each session opens for applications on the{" "}
        <a className="text-orange-300 underline" href={PARIKSHA_URL} rel="noopener">Pariksha portal</a> only for the
        window its public notice gives. Miss the window and you wait for the next session.
      </p>

      {(openNow.length > 0 || nextExam) && (
        <section className="border border-orange-400/60 rounded-2xl p-6 bg-slate-900 mb-10">
          <h2 className="text-xl font-bold text-white mb-3">As of {fmtDate(CHECKED_ON)}</h2>
          <ul className="space-y-2 leading-relaxed">
            {openNow.map(s => (
              <li key={s.name}>
                <strong>{s.name}</strong>: applications open until <strong>{fmtDate(s.portalCloses)}, 22:00</strong>.
                Exams {fmtDate(s.examStart)} – {fmtDate(s.examEnd)}{s.tentative ? " (tentative)" : ""}.
              </li>
            ))}
            {nextExam && !openNow.includes(nextExam) && (
              <li>
                Next exams: <strong>{nextExam.name}</strong>, {fmtDate(nextExam.examStart)} – {fmtDate(nextExam.examEnd)}
                {" "}(applications closed {fmtDate(nextExam.portalCloses)}).
              </li>
            )}
          </ul>
        </section>
      )}

      <h2 className="text-2xl font-bold text-white mb-4">The sessions in the latest public notice</h2>
      <p className="leading-relaxed mb-4">
        From DGCA&apos;s public notice of {SOURCES.notice20260922.issued}. Dates are for Flight Crew and RTR candidates.
      </p>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-left border-collapse min-w-[560px]">
          <thead>
            <tr className="border-b border-slate-600 text-white">
              <th className="py-2 pr-4">Session</th><th className="py-2 pr-4">Applications open</th>
              <th className="py-2 pr-4">Applications close</th><th className="py-2">Exam dates</th>
            </tr>
          </thead>
          <tbody>
            {NOTICE_SESSIONS.map(s => (
              <tr key={s.name} className="border-b border-slate-800">
                <td className="py-2 pr-4 font-semibold">{s.name}</td>
                <td className="py-2 pr-4">{fmtDate(s.portalOpens)}</td>
                <td className="py-2 pr-4">{fmtDate(s.portalCloses)}, 22:00</td>
                <td className="py-2">{fmtDate(s.examStart)} – {fmtDate(s.examEnd)}{s.tentative ? " (tentative)" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="list-disc pl-6 space-y-2 leading-relaxed mb-10">
        <li><strong>OLODE centres:</strong> {OLODE_CENTRES.join(", ")}.</li>
        <li><strong>Regular centres:</strong> {REGULAR_CENTRES.join(", ")}.</li>
        <li>In an OLODE session you pick your own date and time slot. Seats are limited and given first come, first served.</li>
        <li>The notice says the Technical Performance paper (and ATPL oral 2nd and 3rd attempts) will not be opened in these OLODE sessions.</li>
        <li>Pay online through Bharatkosh by 23:00 on the closing date. The manual warns that a payment confirmed after 23:59 is treated as invalid.</li>
      </ul>

      <h2 className="text-2xl font-bold text-white mb-4">The full DGCA exam calendar for 2026</h2>
      <p className="leading-relaxed mb-4">
        DGCA&apos;s Programme of Examinations 2026, in date order. CPL candidates sit the <strong>Regular</strong> and{" "}
        <strong>OLOD</strong> sessions. FIR/AFIR sessions are the flight instructor rating orals, and FATA examinations are for
        Foreign Aircrew Temporary Authorisation candidates. Status is as on {fmtDate(CHECKED_ON)}.
      </p>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-left border-collapse min-w-[520px]">
          <thead>
            <tr className="border-b border-slate-600 text-white">
              <th className="py-2 pr-4">Session</th><th className="py-2 pr-4">Dates</th><th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const st = statusOn(r.start, r.end);
              const forCpl = r.kind === "Regular" || r.kind === "OLOD";
              return (
                <tr key={r.sno} className={`border-b border-slate-800 ${forCpl ? "" : "text-slate-400"}`}>
                  <td className={`py-2 pr-4 ${forCpl ? "font-semibold" : ""}`}>{r.name}</td>
                  <td className="py-2 pr-4">{r.dates}</td>
                  <td className="py-2">{STATUS_LABEL[st]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <blockquote className="border-l-4 border-slate-600 pl-4 text-slate-400 italic mb-10">
        &ldquo;{CALENDAR_NOTE}&rdquo; — DGCA, Exam Calendar 2026
      </blockquote>

      <h2 className="text-2xl font-bold text-white mb-4">What a session costs</h2>
      <p className="leading-relaxed mb-10">
        {inr(regular.amount)} {regular.per} in a Regular session and {inr(olode.amount)} {olode.per} in an OLODE session,
        paid online and not refundable. Every fee, and who may apply, is on the{" "}
        <Link className="text-orange-300 underline" href="/dgca-cpl-eligibility-and-fees">DGCA CPL eligibility and exam fees</Link> page.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4">Before you apply</h2>
      <ul className="list-disc pl-6 space-y-2 leading-relaxed mb-10">
        <li>You need a DGCA computer number first. <Link className="text-orange-300 underline" href="/guides/computer-number">How to get one</Link>.</li>
        <li>Know what each paper covers: <Link className="text-orange-300 underline" href="/dgca-syllabus">the official DGCA CPL syllabus, paper by paper</Link>.</li>
        <li>Know the pattern, the 70% pass mark and why there is no negative marking: <Link className="text-orange-300 underline" href="/guides/dgca-cpl-exam-pattern">DGCA CPL exam pattern</Link>.</li>
        <li>Sit a timed paper before the real one: <Link className="text-orange-300 underline" href="/free-dgca-mock-test">free DGCA mock tests</Link> and <Link className="text-orange-300 underline" href="/dgca-exam-questions">previous-year questions</Link>.</li>
      </ul>

      <h2 className="text-2xl font-bold text-white mb-5">Common questions</h2>
      {faqs.map(f => (
        <section key={f.q} className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-2">{f.q}</h3>
          <p className="leading-relaxed">{f.a}</p>
        </section>
      ))}

      <OfficialSources sources={[SOURCES.calendar2026, SOURCES.notice20260922, SOURCES.fcManual]} />
    </article>
  );
}
