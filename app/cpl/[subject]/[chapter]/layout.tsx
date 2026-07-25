import { CPL_SUBJECTS } from "@/lib/subjects";

export default async function CPLChapterLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ subject: string; chapter: string }>;
}) {
  const { subject: subjectId, chapter: chapterId } = await params;
  
  const subject = CPL_SUBJECTS.find(s => s.id === subjectId);
  const chapter = subject?.chapters.find(c => c.id === chapterId);

  if (!subject || !chapter) {
    return <>{children}</>;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `Chapter ${chapter.number}: ${chapter.title} - ${subject.shortName} CPL`,
    "description": chapter.description || `${subject.shortName} Chapter ${chapter.number} study material for DGCA CPL exams.`,
    "provider": {
      "@type": "Organization",
      "name": "Ghost Aviator",
      "sameAs": "https://ghostaviator.com"
    }
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
