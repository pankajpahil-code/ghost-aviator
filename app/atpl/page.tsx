import Link from "next/link";
import type { Metadata } from "next";
import { ATPL_SUBJECTS } from "@/lib/subjects";
import { servesRealNotes, publishedNoteCount } from "@/lib/indexability";
import { ATPL_AREAS, ATPL_SYLLABUS_URL, ATPL_MANUAL_URL } from "@/lib/atpl-syllabus";
import styles from "./Atpl.module.css";
export const metadata: Metadata = {
  title: "DGCA ATPL (Aeroplanes) | Syllabus & Pilot Study Library",
  description: "DGCA ATPL Aeroplanes syllabus, organised reference notes and official examination resources for professional pilots. Browse by syllabus area.",
  alternates: { canonical: "/atpl" },
};
export default function ATPLPage() {
  const notesCount = publishedNoteCount(ATPL_SUBJECTS);
  return <div className={styles.page}><div className={styles.wrap}>
    <Link href="/">Home</Link>
    <header className={styles.hero}><div className={styles.eyebrow}>Professional pilot study library · Aeroplanes</div>
      <h1>ATPL knowledge.<br />Organised for the flight deck.</h1>
      <p>Return to a subject, find a reference, or plan your next study session. A focused library for pilots preparing for DGCA ATPL examinations and revisiting the underlying theory.</p>
      <nav className={styles.nav} aria-label="ATPL study navigation"><a href="#syllabus">Browse syllabus areas</a><a href="#study">Plan your study</a><Link href="/cpl">Question practice in CPL</Link></nav>
    </header>
    <section className={styles.section} id="syllabus"><div className={styles.eyebrow}>DGCA CAR · Section 7 · Series B · Part VI</div><h2>The ATPL (Aeroplanes) syllabus</h2>
      <p>{ATPL_AREAS.length} syllabus areas, using DGCA’s subject names. These describe the scope of the CAR; they do not mean every applicant sits eight separate examinations. Confirm your applicable papers, credits and aircraft requirements with DGCA.</p>
      <div className={styles.grid}>{ATPL_SUBJECTS.map(subject => {
        const area = ATPL_AREAS.find(a => a.id === subject.id)!;
        const available = subject.chapters.filter(ch => servesRealNotes(subject.id,ch.id)).length;
        return <article className={styles.card} key={subject.id}><span className={styles.tag}>{area.reference}</span><h3>{subject.name}</h3><p>{subject.description}</p><span className={styles.tag}>{available ? `${available} study chapters · grouped by topic` : "Notes being prepared"}</span><Link className={styles.link} href={`/atpl/${subject.id}`}>Open study area →</Link></article>;
      })}</div>
      <div className={styles.note}><p><strong>{notesCount} shared CPL / ATPL study chapters.</strong> These notes were prepared with both CPL and ATPL study in mind. Read the same material here, organised by the matching ATPL subject and topic. Aircraft-specific examples are labelled. Question banks and quizzes remain in CPL.</p></div>
    </section>
    <section className={styles.section} id="study"><h2>A practical study sequence</h2><ol className={styles.list}>
      <li className={styles.row}><div className={styles.rowTitle}><span className={styles.number}>01</span><div><strong>Set your examination scope</strong><small>Use the CAR and your PARIKSHA profile to identify the papers and oral examinations relevant to your application.</small></div></div></li>
      <li className={styles.row}><div className={styles.rowTitle}><span className={styles.number}>02</span><div><strong>Choose your topic and read</strong><small>Open a subject, jump to the matching topic, and study the shared CPL / ATPL notes. Use the official appendix to plan the rest of your study.</small></div></div></li>
      <li className={styles.row}><div className={styles.rowTitle}><span className={styles.number}>03</span><div><strong>Practise and explain your reasoning</strong><small>Existing question practice is in CPL. A practice score does not establish ATPL readiness. Check aircraft limitations and procedures against your current approved documentation.</small></div></div></li>
    </ol></section>
    <section className={styles.section}><h2>References within reach</h2><nav className={styles.nav} aria-label="Pilot references"><Link href="/cpl/human-performance">Human Performance</Link><Link href="/books">Free Ghost Aviator books</Link><Link href="/guides/dgca-atpl-study-guide">ATPL study guide</Link></nav></section>
    <footer className={styles.sources}><strong>Official source documents</strong><p><a href={ATPL_SYLLABUS_URL} target="_blank" rel="noopener noreferrer">ATPL Aeroplanes syllabus — CAR Section 7, Series B, Part VI</a> (Issue III, 16 June 2011, §2.1 and Appendices A–E).<br /><a href={ATPL_MANUAL_URL} target="_blank" rel="noopener noreferrer">Flight Crew User Manual — Issue IV, Revision 0, September 2026</a> (Chapter 7: examinations). Sources checked 19 October 2026. For session notices and subsequent changes, use <a href="https://pariksha.dgca.gov.in/home" target="_blank" rel="noopener noreferrer">DGCA PARIKSHA</a>.</p></footer>
  </div></div>;
}
