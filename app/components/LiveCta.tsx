// Live-class CTA. Plain server-renderable markup: no hooks, no state, no
// popups, fixed small footprint, so it adds no layout shift and almost no
// HTML. Click counting is done by WhatsAppClickTracker (mounted once in the
// root layout) reading the data-wa-* attributes on the link.
import { MessageCircle } from "lucide-react";
import { LIVE_CLASS_SUBJECTS } from "@/lib/live-classes";
import {
  CTA_COPY, waEnquiryLink, studyingMessage, pageMessage, freeClassMessage, liveSubjectId,
  type CtaPlacement,
} from "@/lib/live-cta";

type LinkProps = { href: string; placement: CtaPlacement; subject?: string; label: string; big?: boolean };

/** The WhatsApp button itself. Exported for /live-classes' hero. */
export function WhatsAppCtaLink({ href, placement, subject, label, big }: LinkProps) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
       data-wa-placement={placement} data-wa-subject={subject || undefined}
       className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold no-underline whitespace-nowrap ${big ? "px-8 py-4 text-base" : "px-4 py-2.5 text-sm"}`}
       style={{ background: "#16a34a", color: "#fff" }}>
      <MessageCircle className={big ? "w-5 h-5" : "w-4 h-4"} aria-hidden="true" /> {label}
    </a>
  );
}

const box = (accent: string) => ({
  background: "rgba(17,24,32,0.95)",
  border: `1px solid ${accent}40`,
});

/** a. End of notes. `subject` is the display name, `chapter` the chapter title. */
export function NotesEndCta({ subjectId, subject, chapter, accent = "#22c55e" }:
  { subjectId: string; subject: string; chapter?: string; accent?: string }) {
  const live = Boolean(LIVE_CLASS_SUBJECTS[liveSubjectId(subjectId)]);
  const topic = chapter || subject;
  const text = live ? CTA_COPY.notesLive(topic) : CTA_COPY.notesGeneral(topic);
  const msg = studyingMessage(chapter ? `${subject} (${chapter})` : subject);
  return (
    <aside aria-label="Live classes" className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden"
           style={box(accent)}>
      <p className="m-0 text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>{text}</p>
      <WhatsAppCtaLink href={waEnquiryLink(msg)} placement="notes_end" subject={subject} label={CTA_COPY.action} />
    </aside>
  );
}

/** b. After a score screen, or at the end of a question page. */
export function ScoreCta({ subject, placement = "score", accent = "#f0913a" }:
  { subject?: string; placement?: "score" | "questions_end"; accent?: string }) {
  const msg = subject ? studyingMessage(subject) : pageMessage("mock test");
  return (
    <aside aria-label="Live classes" className="rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden"
           style={box(accent)}>
      <p className="m-0 text-sm leading-relaxed" style={{ color: "#cbd5e1" }}>{CTA_COPY.score}</p>
      <WhatsAppCtaLink href={waEnquiryLink(msg)} placement={placement} subject={subject} label={CTA_COPY.action} />
    </aside>
  );
}

/** c. Slim inline (not sticky) banner near the top of hub pages. `where` names the page in the prefill. */
export function HubBannerCta({ where, placement = "hub_banner", className = "" }:
  { where: string; placement?: "hub_banner" | "home_banner"; className?: string }) {
  return (
    <aside aria-label="Free live doubt classes"
           className={`rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 print:hidden ${className}`}
           style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}>
      <p className="m-0 text-sm" style={{ color: "#cbd5e1" }}>{CTA_COPY.hubBanner}</p>
      <a href={waEnquiryLink(freeClassMessage(where))} target="_blank" rel="noopener noreferrer"
         data-wa-placement={placement}
         className="inline-flex items-center gap-1.5 text-sm font-bold no-underline whitespace-nowrap"
         style={{ color: "#22c55e" }}>
        <MessageCircle className="w-4 h-4" aria-hidden="true" /> {CTA_COPY.actionFreeLink}
      </a>
    </aside>
  );
}
