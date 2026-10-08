import { ATPL_SUBJECTS } from "@/lib/subjects";
import { SITE_URL, PERSON_ID, ORG_ID } from "@/lib/site";
import { isIndexableChapterRoute } from "@/lib/indexability";

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
  // This layout has no page.tsx of its own: `base` itself is a 404, and a layout is
  // not given the [type] segment, so the Course node cannot name the exact route it
  // sits on (the CPL page does). It names the chapter's first page that really has
  // content: the notes where they exist, otherwise the questions, otherwise the
  // lecture. Forty ATPL chapters have no notes, so naming /notes for all of them
  // would point at a "being prepared" page that is not in the index.
  const first = (['notes', 'questions', 'video'] as const).find(
    type => isIndexableChapterRoute(subject.id, chapter.id, type),
  ) ?? 'notes';
  const home = `${base}/${first}`;

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
