import downloads from "@/lib/notes-downloads.json";

export default function NotesDownloadLink({ subjectId, chapterId }: { subjectId: string; chapterId: string }) {
  const href = (downloads as Record<string, string>)[`${subjectId}/${chapterId}`];
  if (!href) return null;
  return <a href={href} download={`Ghost-Aviator-${subjectId}-${chapterId}.pdf`} className="inline-flex items-center rounded-lg border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-200 no-underline">
    Download PDF
  </a>;
}
