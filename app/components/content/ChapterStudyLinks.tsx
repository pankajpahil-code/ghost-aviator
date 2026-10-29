import Link from "next/link";
import type { Chapter } from "@/lib/subjects";
import type { ChapterStudyLinkData } from "@/lib/chapter-links";

/**
 * "More on this chapter": plain, server-rendered links from one chapter route to
 * its indexable siblings (notes ↔ video ↔ questions), plus Previous/Next on the
 * questions route. The data comes from lib/chapter-links.ts, computed in the
 * route (server) and handed to the client page components as a ready element.
 */
export default function ChapterStudyLinks({
  chapter, color, data,
}: {
  chapter: Chapter;
  color: string;
  data: ChapterStudyLinkData;
}) {
  const { links, prev, next, examQuestions } = data;
  if (links.length === 0 && !prev && !next && examQuestions.length === 0) return null;
  return (
    <nav aria-label={`More on Chapter ${chapter.number}`}
         className="rounded-2xl p-5 my-6"
         style={{ background: "rgba(17,24,32,0.7)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <h2 className="text-sm font-black mb-3" style={{ color, letterSpacing: "0.06em" }}>
        MORE ON CHAPTER {chapter.number}: {chapter.title.toUpperCase()}
      </h2>
      {links.length > 0 && (
        <ul className="list-none p-0 m-0 flex flex-wrap gap-2">
          {links.map(l => (
            <li key={l.type}>
              <Link href={l.href}
                    className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-bold no-underline"
                    style={{ background: `${color}12`, border: `1px solid ${color}30`, color }}>
                {l.label} →
              </Link>
            </li>
          ))}
        </ul>
      )}
      {examQuestions.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-black mb-2" style={{ color: "#94a3b8", letterSpacing: "0.06em" }}>
            REAL DGCA EXAM QUESTIONS
          </h3>
          <ul className="list-none p-0 m-0 flex flex-wrap gap-2">
            {examQuestions.map(l => (
              <li key={l.href}>
                <Link href={l.href}
                      className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-bold no-underline"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0" }}>
                  {l.label} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      {(prev || next) && (
        <div className="flex flex-wrap justify-between gap-3 mt-4 text-sm">
          {prev ? (
            <Link href={prev.href} className="no-underline hover:underline" style={{ color: "#94a3b8" }}>
              ← Previous questions: Ch.{prev.chapter.number} {prev.chapter.title}
            </Link>
          ) : <span />}
          {next ? (
            <Link href={next.href} className="no-underline hover:underline text-right" style={{ color: "#94a3b8" }}>
              Next questions: Ch.{next.chapter.number} {next.chapter.title} →
            </Link>
          ) : <span />}
        </div>
      )}
    </nav>
  );
}
