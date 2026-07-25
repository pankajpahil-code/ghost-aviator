import { ATPL_SUBJECTS } from "@/lib/subjects";

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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": `Chapter ${chapter.number}: ${chapter.title} - ${subject.shortName} ATPL`,
    "description": chapter.description || `${subject.shortName} Chapter ${chapter.number} study material for DGCA ATPL exams.`,
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
