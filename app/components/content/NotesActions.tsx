import { SITE_URL, INSTAGRAM, YOUTUBE_BRAND, TELEGRAM_GROUP, SUBJECT_TELEGRAM_GROUPS } from "@/lib/site";
import downloads from "@/lib/notes-downloads.json";

export default function NotesActions({ subjectId, chapterId }: { subjectId: string; chapterId: string }) {
  const pdf = (downloads as Record<string, string>)[`${subjectId}/${chapterId}`];
  const links = [
    ...(pdf ? [{ label: "Download notes (PDF)", href: pdf, download: true }] : []),
    { label: "Website", href: SITE_URL },
    { label: "Telegram study group", href: SUBJECT_TELEGRAM_GROUPS[subjectId] ?? TELEGRAM_GROUP },
    { label: "Instagram", href: INSTAGRAM },
    { label: "YouTube", href: YOUTUBE_BRAND },
    { label: "Live classes", href: "/live-classes" },
  ];
  return <nav aria-label="Notes downloads and Ghost Aviator channels" className="flex flex-wrap gap-2 py-3">
    {links.map(link => <a key={link.label} href={link.href}
      download={"download" in link ? `Ghost-Aviator-${subjectId}-${chapterId}.pdf` : undefined}
      target={link.href.startsWith("https:") ? "_blank" : undefined} rel="noopener noreferrer"
      className="inline-flex items-center rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold no-underline"
      style={{ color: "#e2e8f0", background: "#16212c" }}>{link.label}</a>)}
  </nav>;
}
