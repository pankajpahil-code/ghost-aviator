import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ATPL_SUBJECTS } from "@/lib/subjects";
import { getChapterVideos } from "@/lib/chapter-videos";
import { servesRealNotes, isIndexableSubject, NOINDEX } from "@/lib/indexability";
import { ATPL_AREAS, ATPL_SYLLABUS_URL } from "@/lib/atpl-syllabus";
import styles from "../Atpl.module.css";
export function generateStaticParams() { return ATPL_SUBJECTS.map(s => ({ subject:s.id })); }
export async function generateMetadata({params}:{params:Promise<{subject:string}>}):Promise<Metadata> {
  const {subject:id}=await params; const subject=ATPL_SUBJECTS.find(s=>s.id===id);
  return subject ? {title:`${subject.name} | DGCA ATPL Study References`,description:subject.description,...(isIndexableSubject(subject) ? {} : NOINDEX),alternates:{canonical:`/atpl/${id}`}} : {};
}
export default async function ATPLSubjectPage({params}:{params:Promise<{subject:string}>}) {
  const {subject:id}=await params; const subject=ATPL_SUBJECTS.find(s=>s.id===id); const area=ATPL_AREAS.find(a=>a.id===id);
  if(!subject || !area) notFound();
  const chapters=subject.chapters.filter(ch=>servesRealNotes(id,ch.id));
  const lectures=subject.chapters.filter(ch=>getChapterVideos(id,ch.id).length>0);
  return <div className={styles.page}><div className={styles.wrap}><Link href="/atpl">← ATPL study library</Link>
    <header className={styles.hero}><div className={styles.eyebrow}>ATPL Aeroplanes · {area.reference}</div><h1>{subject.name}</h1><p>{subject.description}</p><a href={ATPL_SYLLABUS_URL} target="_blank" rel="noopener noreferrer">Read the official syllabus</a></header>
    <section className={styles.section}><h2>Reference notes</h2><p>Published Ghost Aviator chapters shared with the CPL library. Use these as supporting references alongside the ATPL syllabus. This list shows available chapters, not a completed ATPL course.</p>
    {id==="atpl-technical-specific" && <div className={styles.note}><p>The current notes cover DA-42 NG. They do not cover an airline aircraft type. Use the approved documentation for your aircraft.</p></div>}
    {chapters.length ? <ol className={styles.list}>{chapters.map((ch,i)=><li className={styles.row} key={`${ch.notesSource?.subjectId}/${ch.id}`}><div className={styles.rowTitle}><span className={styles.number}>{String(i+1).padStart(2,"0")}</span><div><Link href={`/atpl/${id}/${ch.id}/notes`}>{ch.title}</Link><small>{ch.notesSource?.subjectId==="instrumentation" ? "Instruments reference" : "Shared study reference"}</small></div></div><span aria-hidden="true">→</span></li>)}</ol> : <div className={styles.note}><p>No chapter notes are published for this area yet. Consult the official syllabus and the relevant approved aircraft documentation.</p></div>}
    </section>{lectures.length > 0 && <section className={styles.section}><h2>Lecture references</h2><p>Existing Ghost Aviator lectures relevant to this study area.</p><ul className={styles.list}>{lectures.map(ch=><li className={styles.row} key={ch.id}><Link href={`/atpl/${id}/${ch.id}/video`}>{ch.title} →</Link></li>)}</ul></section>}<nav className={styles.nav} aria-label="Related study"><Link href="/cpl">Question practice in CPL</Link><Link href="/books">Free book downloads</Link><Link href="/atpl">All ATPL areas</Link></nav>
  </div></div>;
}
