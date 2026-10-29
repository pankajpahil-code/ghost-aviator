import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ATPL_SUBJECTS } from "@/lib/subjects";
import { getChapterVideos } from "@/lib/chapter-videos";
import { servesRealNotes, isIndexableSubject, NOINDEX } from "@/lib/indexability";
import { ATPL_AREAS, ATPL_SYLLABUS_URL, ATPL_RULES_URL, ATPL_REGULATIONS_EXEMPTION } from "@/lib/atpl-syllabus";
import { ATPL_STUDY_TOPICS } from "@/lib/atpl-study-topics";
import styles from "../Atpl.module.css";
import { SITE_URL } from "@/lib/site";
import { fitTitle, padSnippet, subjectLabel } from "@/lib/chapter-meta";
export function generateStaticParams() { return ATPL_SUBJECTS.map(s => ({ subject:s.id })); }
export async function generateMetadata({params}:{params:Promise<{subject:string}>}):Promise<Metadata> {
  const {subject:id}=await params; const subject=ATPL_SUBJECTS.find(s=>s.id===id);
  if (!subject) return {};
  // Ticket #9: keyword-first title within 60 characters, description 120–160.
  const name = subjectLabel(subject);
  const published = subject.chapters.filter(ch => servesRealNotes(id, ch.id)).length;
  const base = id === "atpl-air-regulations" ? "Air Regulation reference notes. Current Indian CPL holders are exempt from the ATPL Air Regulations examination; check requirements for other applications." : subject.description;
  return {
    title: fitTitle(name, ["DGCA ATPL Study Notes | Ghost Aviator", "DGCA ATPL Notes | Ghost Aviator", "DGCA ATPL Study Notes", "DGCA ATPL Notes"]),
    description: padSnippet(base, [
      ...(published > 0 ? [`DGCA ATPL ${name} study notes: ${published} chapters grouped by topic.`] : []),
      "Free on Ghost Aviator, no sign-up.",
    ]),
    ...(isIndexableSubject(subject) ? {} : NOINDEX),
    alternates: { canonical: `/atpl/${id}` },
  };
}
export default async function ATPLSubjectPage({params}:{params:Promise<{subject:string}>}) {
  const {subject:id}=await params; const subject=ATPL_SUBJECTS.find(s=>s.id===id); const area=ATPL_AREAS.find(a=>a.id===id);
  if(!subject || !area) notFound();
  const chapters=subject.chapters.filter(ch=>servesRealNotes(id,ch.id));
  const topics=(ATPL_STUDY_TOPICS[id] ?? []).map(topic => ({...topic,
    chapters: chapters.filter(ch => topic.sources.some(ref => ref.subjectId === ch.notesSource?.subjectId && ref.chapterIds.includes(ch.notesSource.chapterId))),
  })).filter(topic => topic.chapters.length > 0);
  const lectures=subject.chapters.filter(ch=>getChapterVideos(id,ch.id).length>0);
  // Link the CPL chapter the notes come from, not the /atpl/.../notes copy
  // (2026-10-29). The ATPL copy is 95-97% the same text and declares the CPL
  // URL canonical, so linking the copy sent crawlers to a duplicate first. The
  // ATPL route is not removed or noindexed; it is still reachable by URL and by
  // the chapter's own Previous/Next. If the source is not a CPL chapter that
  // serves notes, the ATPL route is kept.
  const notesHref = (ch: (typeof chapters)[number]) => {
    const src = ch.notesSource;
    return src && !src.subjectId.startsWith("atpl-") && servesRealNotes(src.subjectId, src.chapterId)
      ? `/cpl/${src.subjectId}/${src.chapterId}/notes`
      : `/atpl/${id}/${ch.id}/notes`;
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${SITE_URL}/atpl/${id}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "ATPL", item: `${SITE_URL}/atpl` },
      { "@type": "ListItem", position: 3, name: subject.name, item: `${SITE_URL}/atpl/${id}` },
    ],
  };
  return <div className={styles.page}><div className={styles.wrap}><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} /><Link href="/atpl">← ATPL study library</Link>
    <header className={styles.hero}><div className={styles.eyebrow}>{id === "atpl-air-regulations" ? "Regulatory reference" : "ATPL Aeroplanes"} · {area.reference}</div><h1>{subject.name} – DGCA ATPL {id === "atpl-air-regulations" ? "Reference Notes" : "Study Notes"}</h1><p>{subject.description}</p><a href={ATPL_SYLLABUS_URL} target="_blank" rel="noopener noreferrer">Read the official syllabus</a>
      {id === "atpl-air-regulations" && <div className={styles.note}><p><strong>Current Indian CPL holders: no separate ATPL Air Regulations paper.</strong> {ATPL_REGULATIONS_EXEMPTION} <a href={ATPL_RULES_URL} target="_blank" rel="noopener noreferrer">Read the exemption in Schedule II, Section M, 1(d)</a>.</p></div>}
    </header>
    <section className={styles.section}><h2>Study notes by topic</h2><p>Ghost Aviator notes prepared for CPL and ATPL study. Choose a topic below and read the same chapters here in ATPL.</p>
    {id==="atpl-technical-specific" && <div className={styles.note}><p>The current notes cover DA-42 NG. They do not cover an airline aircraft type. Use the approved documentation for your aircraft.</p></div>}
    {id==="atpl-performance" && <div className={styles.note}><p>Start with the shared mass-and-balance and aeroplane-performance notes below. For aircraft-specific performance calculations, limitations and operating data, use your current approved aircraft documentation.</p></div>}
    {topics.length ? <>
      <nav className={styles.topicNav} aria-label="Jump to a study topic">{topics.map(topic => <a href={`#${topic.id}`} key={topic.id}>{topic.title}<span>{topic.chapters.length}</span></a>)}</nav>
      {topics.map((topic, topicIndex) => <section className={styles.topic} id={topic.id} key={topic.id} aria-labelledby={`${topic.id}-heading`}>
        <div className={styles.eyebrow}>Topic {String(topicIndex+1).padStart(2,"0")}</div>
        <h3 id={`${topic.id}-heading`}>{topic.title}</h3>
        <ol className={styles.list}>{topic.chapters.map((ch,i)=><li className={styles.row} key={`${ch.notesSource?.subjectId}/${ch.id}`}><div className={styles.rowTitle}><span className={styles.number}>{String(i+1).padStart(2,"0")}</span><div><Link prefetch={false} href={notesHref(ch)}>{ch.title}</Link><small>{ch.description}</small></div></div><span aria-hidden="true">→</span></li>)}</ol>
      </section>)}
    </> : <div className={styles.note}><p>No chapter notes are published for this area yet. Consult the official syllabus and the relevant approved aircraft documentation.</p></div>}
    </section>{lectures.length > 0 && <section className={styles.section}><h2>Lecture references</h2><p>Existing Ghost Aviator lectures relevant to this study area.</p><ul className={styles.list}>{lectures.map(ch=><li className={styles.row} key={ch.id}><Link href={`/atpl/${id}/${ch.id}/video`}>{ch.title} →</Link></li>)}</ul></section>}<nav className={styles.nav} aria-label="Related study"><Link href="/cpl">Question practice in CPL</Link><Link href="/books">Free book downloads</Link><Link href="/atpl">All ATPL areas</Link></nav>
  </div></div>;
}
