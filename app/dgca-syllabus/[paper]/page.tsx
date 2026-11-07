import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL, ORG_ID, PERSON_ID } from "@/lib/site";
import { CHECKED_ON, SOURCES } from "@/lib/dgca-exam-info";
import { PAPER_META, chapterLinks, coverage, isLeafHeading, paper, paperMeta } from "@/lib/dgca-syllabus";
import type { SyllabusItem, SyllabusPaper } from "@/lib/generated/dgca-syllabus";
import { FactsByline, OfficialSources } from "@/app/components/OfficialSources";

export const dynamicParams = false;

export function generateStaticParams() {
  return PAPER_META.map(m => ({ paper: m.slug }));
}

const pathFor = (slug: string) => `/dgca-syllabus/${slug}`;

export async function generateMetadata({ params }: { params: Promise<{ paper: string }> }): Promise<Metadata> {
  const { paper: slug } = await params;
  const m = paperMeta(slug);
  if (!m) return {};
  return {
    title: `DGCA ${m.slug === "technical-general" ? "Technical General" : m.name} Syllabus for CPL: Every Topic | Ghost Aviator`,
    description: `The official DGCA CPL ${m.name} syllabus (CAR Section 7 Series B Part IV), topic by topic, with a link to the free chapter that teaches each one.`,
    alternates: { canonical: pathFor(slug) },
  };
}

function Items({ items }: { items: SyllabusItem[] }) {
  if (!items.length) return null;
  return (
    <ul className="list-disc pl-6 space-y-1 text-slate-300 mb-3">
      {items.map((i, n) => (
        <li key={n}>
          {i.text}
          {i.children.length > 0 && (
            <ul className="list-[circle] pl-6 mt-1 space-y-0.5 text-slate-400">
              {i.children.map((c, k) => <li key={k}>{c}</li>)}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function StudyHere({ refs }: { refs: string[] }) {
  const links = chapterLinks(refs);
  if (!links.length) {
    return <p className="text-sm text-slate-500 mb-5">Not yet covered in the free chapter notes.</p>;
  }
  return (
    <p className="text-sm mb-5">
      <span className="text-slate-400">Study it here: </span>
      {links.map((l, n) => (
        <span key={l.href}>
          {n > 0 && " · "}
          <Link className="text-orange-300 underline" href={l.href}>{l.subject} {l.label}</Link>
        </span>
      ))}
    </p>
  );
}

function Syllabus({ p }: { p: SyllabusPaper }) {
  return (
    <>
      {p.sections.map(s => {
        const depth = s.num.split(".").length;
        const H = depth === 1 ? "h2" : "h3";
        const leaf = isLeafHeading(p, s);
        return (
          <section key={s.key} className={depth === 1 ? "mt-10" : "mt-6"}>
            <H className={depth === 1 ? "text-2xl font-bold text-white mb-3" : "text-xl font-semibold text-white mb-3"}>
              {s.num} {s.title}
            </H>
            <Items items={s.items} />
            {(s.items.length > 0 || leaf) && <StudyHere refs={s.chapters} />}
            {s.topics.map(t => (
              <div key={t.letter} className="pl-2 sm:pl-4 border-l border-slate-800 mb-2">
                <h4 className="text-lg font-semibold text-slate-100 mb-2">{t.letter}) {t.title}</h4>
                <Items items={t.items} />
                <StudyHere refs={t.chapters} />
              </div>
            ))}
          </section>
        );
      })}
    </>
  );
}

export default async function SyllabusPaperPage({ params }: { params: Promise<{ paper: string }> }) {
  const { paper: slug } = await params;
  const m = paperMeta(slug);
  const p = paper(slug);
  if (!m || !p) notFound();
  const cov = coverage(p);
  const path = pathFor(slug);
  const title = `DGCA ${m.name} Syllabus for CPL`;

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage", "@id": `${SITE_URL}${path}#webpage`, url: `${SITE_URL}${path}`, name: title,
        inLanguage: "en-IN", dateModified: CHECKED_ON, author: { "@id": PERSON_ID }, publisher: { "@id": ORG_ID },
      },
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "DGCA CPL syllabus", item: `${SITE_URL}/dgca-syllabus` },
        { "@type": "ListItem", position: 3, name: `${m.name} syllabus`, item: `${SITE_URL}${path}` },
      ] },
    ],
  };

  const others = PAPER_META.filter(o => o.slug !== slug);

  return (
    <article className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-slate-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} />
      <p className="text-sm font-semibold text-orange-300 mb-4">
        <Link className="underline" href="/dgca-syllabus">DGCA CPL SYLLABUS</Link> · APPENDIX {p.appendix}
      </p>
      <h1 className="text-3xl sm:text-5xl font-black text-white mb-4">DGCA {m.name} syllabus</h1>
      <FactsByline />

      <p className="text-lg leading-relaxed mb-4">{m.blurb}</p>
      <ul className="list-disc pl-6 space-y-1 leading-relaxed mb-6">
        <li>The paper: {m.questions} questions in {m.duration}, 70% to pass, no negative marking (<Link className="text-orange-300 underline" href="/guides/dgca-cpl-exam-pattern">exam pattern</Link>).</li>
        <li>{cov.covered} of the {cov.total} syllabus topics below link to a free chapter on this site. The rest are marked.</li>
        <li>Practise this paper: <Link className="text-orange-300 underline" href="/free-dgca-mock-test">free mock tests</Link> · <Link className="text-orange-300 underline" href="/dgca-exam-questions">previous-year questions</Link></li>
      </ul>
      <p className="text-slate-400 leading-relaxed mb-2">
        Below is Appendix {p.appendix} of CAR Section 7, Series B, Part IV exactly as DGCA published it (numbering,
        wording and any printing slips included), with the matching chapter under each topic.
      </p>

      <Syllabus p={p} />

      <p className="leading-relaxed mt-12">
        Other papers: {others.map((o, n) => (
          <span key={o.slug}>{n > 0 && " · "}<Link className="text-orange-300 underline" href={pathFor(o.slug)}>{o.name}</Link></span>
        ))} · <Link className="text-orange-300 underline" href="/dgca-exam-dates">DGCA exam dates 2026</Link>
      </p>

      <OfficialSources sources={[SOURCES.car7b4]} />
    </article>
  );
}
