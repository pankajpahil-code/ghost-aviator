import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, ORG_ID, PERSON_ID } from "@/lib/site";
import { CHECKED_ON, SOURCES } from "@/lib/dgca-exam-info";
import { PAPER_META, coverage, paper } from "@/lib/dgca-syllabus";
import { FactsByline, OfficialSources } from "@/app/components/OfficialSources";

const PATH = "/dgca-syllabus";
const title = "DGCA CPL Syllabus 2026: Official Syllabus for Every Paper | Ghost Aviator";
const description =
  "The official DGCA CPL syllabus from CAR Section 7 Series B Part IV, paper by paper: Air Navigation, Meteorology, Air Regulations and Technical General, with free notes.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: PATH },
};

export default function SyllabusHubPage() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage", "@id": `${SITE_URL}${PATH}#webpage`, url: `${SITE_URL}${PATH}`, name: title, description,
        inLanguage: "en-IN", dateModified: CHECKED_ON, author: { "@id": PERSON_ID }, publisher: { "@id": ORG_ID },
      },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "DGCA CPL syllabus", item: `${SITE_URL}${PATH}` },
      ] },
    ],
  };

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-slate-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <p className="text-sm font-semibold text-orange-300 mb-4">DGCA CPL · OFFICIAL SYLLABUS</p>
      <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">DGCA CPL syllabus, paper by paper</h1>
      <FactsByline />

      <p className="text-lg leading-relaxed mb-5">
        The syllabus for the DGCA Commercial Pilot&apos;s Licence and Instrument Rating written papers is laid down in{" "}
        <strong>CAR Section 7, Series B, Part IV</strong> (Issue III, 16 June 2011). Its four appendices list every
        topic DGCA can examine. Each page below reproduces that appendix as published and links every topic to the
        free chapter on this site that teaches it.
      </p>
      <p className="leading-relaxed mb-10">
        Two things in the CAR catch students out. The Air Navigation paper also carries radio navigation, instruments,
        mass and balance, performance and flight planning. And Human Performance and Limitations, operational procedures
        and radio communications sit inside the Air Regulations syllabus.
      </p>

      <div className="grid sm:grid-cols-2 gap-5 mb-12">
        {PAPER_META.map(m => {
          const p = paper(m.slug)!;
          const cov = coverage(p);
          const heads = p.sections.filter(s => /^\d+\.\d+$/.test(s.num) || (/^\d+$/.test(s.num) && !p.sections.some(o => o.num.startsWith(s.num + "."))));
          return (
            <section key={m.slug} className="border border-slate-700 rounded-2xl p-6 bg-slate-900">
              <h2 className="text-xl font-bold mb-2">
                <Link className="text-orange-300 underline" href={`${PATH}/${m.slug}`}>{m.name} syllabus</Link>
              </h2>
              <p className="text-sm text-slate-400 mb-3">
                CAR Appendix {p.appendix} · {m.questions} questions · {m.duration} · {cov.covered} of {cov.total} topics with free notes
              </p>
              <p className="leading-relaxed mb-3">{m.blurb}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{heads.map(s => s.title).join(" · ")}</p>
            </section>
          );
        })}
      </div>

      <h2 className="text-2xl font-bold text-white mb-4">The other papers</h2>
      <ul className="list-disc pl-6 space-y-3 leading-relaxed mb-10">
        <li><strong>Technical Specific:</strong> the CAR describes it as the paper &ldquo;concern to particular aircraft and its related system&rdquo;, so its syllabus is the aircraft you train on. <Link className="text-orange-300 underline" href="/cpl/technical-specific">Technical Specific notes</Link>.</li>
        <li><strong>Technical Performance:</strong> applies only to aeroplanes heavier than 5,700 kg MTOW (or twin-engine helicopters), per the CAR.</li>
        <li><strong>Radio Telephony:</strong> the CAR lists RT procedures and phraseology, communication failure action, and a signals practical. The RTR(A) certificate has its own examination under CAR Section 7 Series G Part VI: <Link className="text-orange-300 underline" href="/guides/rtr-exam-guide">RTR(A) exam guide</Link>.</li>
      </ul>

      <p className="leading-relaxed mb-4">
        Next: <Link className="text-orange-300 underline" href="/dgca-exam-dates">DGCA exam dates 2026</Link> ·{" "}
        <Link className="text-orange-300 underline" href="/dgca-cpl-eligibility-and-fees">eligibility and exam fees</Link> ·{" "}
        <Link className="text-orange-300 underline" href="/guides/dgca-cpl-exam-pattern">exam pattern and pass mark</Link>
      </p>

      <OfficialSources sources={[SOURCES.car7b4]} />
    </article>
  );
}
