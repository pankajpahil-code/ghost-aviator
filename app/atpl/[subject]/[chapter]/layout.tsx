import { ATPL_SUBJECTS } from "@/lib/subjects";
import { SITE_URL, PERSON_ID, ORG_ID } from "@/lib/site";

/**
 * Unlike the CPL side, the ATPL `[type]/page.tsx` emits no structured data of
 * its own, so this layout is the only place an ATPL chapter is described — it
 * keeps its Course node rather than becoming a pass-through, and gains the
 * author, breadcrumb and @id references the CPL chapter pages already have.
 */
export default async function ATPLChapterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subject: string; chapter: string }>;
}) {
  const { subject: subjectId, chapter: chapterId } = await params;
  
  const subject = ATPL_SUBJECTS.find(s => s.id === subjectId);
  const chapter = subject?.chapters.find(c => c.id === chapterId);

  if (!subject || !chapter) {
    return <>{children}</>;
  }

  const base = `${SITE_URL}/atpl/${subject.id}/${chapter.id}`;
  // This layout has no page.tsx of its own: `base` itself is a 404. A layout is
  // not given the [type] segment, so the Course node cannot name the exact
  // route it sits on (the CPL page does). It names the chapter's notes route
  // instead: every ATPL chapter has one, it is the chapter's primary page, and
  // it is the canonical the notes page declares for itself. The same @id on the
  // sibling routes then reads as one course described on several of its pages.
  const home = `${base}/notes`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Course",
        "@id": `${home}#course`,
        "name": `Chapter ${chapter.number}: ${chapter.title} - ${subject.shortName} ATPL`,
        "description": chapter.description || `${subject.shortName} Chapter ${chapter.number} study material for DGCA ATPL exams.`,
        "url": home,
        "inLanguage": "en",
        "isAccessibleForFree": true,
        "teaches": chapter.title,
        "author": { "@id": PERSON_ID },
        "provider": { "@id": ORG_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${base}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "ATPL", item: `${SITE_URL}/atpl` },
          { "@type": "ListItem", position: 3, name: subject.name, item: `${SITE_URL}/atpl/${subject.id}` },
          { "@type": "ListItem", position: 4, name: `Ch.${chapter.number} ${chapter.title}` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
