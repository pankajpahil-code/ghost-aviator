"use client";

import Link from "next/link";
import NotesActions from "./NotesActions";
import { NOTES_FIT_CSS } from "@/lib/notes-layout";
import { useEffect, useRef, useState, type ReactNode, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { interactivesFor, type InteractiveId } from "@/lib/notes-interactives";
import ReadAloudControls from "@/app/components/ReadAloudControls";
import { ChevronRight, ChevronLeft, ListChecks } from "lucide-react";
import type { Subject, Chapter } from "@/lib/subjects";
import Watermark from "@/app/components/Watermark";
import { NotesEndCta } from "@/app/components/LiveCta";
import VideoLectureCard from "@/app/components/content/VideoLectureCard";
import type { ChapterVideo } from "@/lib/chapter-videos";
import { keyFactsFor, type ChapterKeyFacts } from "@/lib/chapter-key-facts";
import { SUBJECT_TELEGRAM_GROUPS } from "@/lib/site";

type Props = {
  track: "cpl" | "atpl";
  subject: Subject;
  chapter: Chapter;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
  /** The chapter rendered in-page: its own stylesheet, scoped to `.ga-notes`,
   *  plus the body markup. See lib/notes-inline.ts for why this replaced the
   *  iframe + sr-only pair. */
  notes: { css: string; html: string; stylesheets: string[] };
  /** The Captain's lecture(s) for this chapter — card renders above the notes when non-empty. */
  videos?: ChapterVideo[];
  /** Key facts computed on the server (lib/opener-key-facts.ts) for THIS chapter only, used when
   *  lib/chapter-key-facts.ts has no hand-written entry. Passed as a prop so the full set never
   *  enters a client bundle. */
  openerFacts?: ChapterKeyFacts;
  /** Server-rendered links to this chapter's indexable video / questions pages (ChapterStudyLinks). */
  related?: ReactNode;
};

// ─── The chapters' own buttons ──────────────────────────────────────────────
//
// 43 chapters ship "Show Answer", option-check, Reveal/Hide All and a few
// calculators whose functions lived in a <script> that lib/notes-inline.ts
// does not let across. It rewrites each known inline handler into a
// data-ga-act attribute, and THIS is where those actions happen: one
// delegated listener on the notes container, a fixed set of behaviours, no
// chapter script ever evaluated. Every case below is a line-for-line port of
// the function the chapter used to define; the names must match NOTE_ACTIONS
// in lib/notes-inline.ts (tools/audit/notes-inline-check.mts fails if one is
// missing here).
//
// The container, not <body>, is the "document" these ports act on, so the
// RTR(A) self-test class is toggled on it and lib/notes-inline.ts anchors the
// chapter's `.self-test-mode ...` rules to `.ga-notes.self-test-mode`.

const byId = (root: HTMLElement, id: string) => root.querySelector<HTMLElement>(`#${id}`);

function runClickAction(root: HTMLElement, el: HTMLElement, act: string, arg: string | undefined) {
  switch (act) {
    case "toggle-answer-id": {                       // Radio Navigation: toggleAnswer(7)
      if (!arg || !/^\d+$/.test(arg)) return;
      const ans = byId(root, `ans_${arg}`);
      const btn = byId(root, `btn_${arg}`);
      if (!ans) return;
      const shown = ans.style.display === "block";
      ans.style.display = shown ? "none" : "block";
      if (btn) btn.textContent = shown ? "Show Answer" : "Hide Answer";
      return;
    }
    case "toggle-answer-next": {                     // RTR(A): toggleAnswer(this)
      const block = el.nextElementSibling as HTMLElement | null;
      if (!block) return;
      const shown = block.style.display === "block";
      block.style.display = shown ? "none" : "block";
      el.textContent = shown ? "Show Answer" : "Hide Answer";
      return;
    }
    case "check-answer": {                           // RTR(A): checkAnswer(this, true|false)
      const list = el.parentElement;
      if (!list) return;
      for (const li of Array.from(list.getElementsByTagName("li"))) li.classList.remove("correct", "incorrect");
      el.classList.add(arg === "true" ? "correct" : "incorrect");
      return;
    }
    case "reveal-value":                             // RTR(A) self-test: revealValue(this)
      if (root.classList.contains("self-test-mode")) el.classList.toggle("revealed");
      return;
    case "self-test-mode": {                         // RTR(A) ch.23: toggleSelfTestMode()
      const on = root.classList.toggle("self-test-mode");
      const icon = document.createElement("i");
      icon.className = on ? "fas fa-eye" : "fas fa-eye-slash";
      el.replaceChildren(icon, document.createTextNode(on ? " Disable Blur / Reveal All" : " Enable Self-Test Mode (Blur Values)"));
      el.style.background = on ? "#ef4444" : "var(--secondary)";
      if (!on) root.querySelectorAll(".val-col-content").forEach(v => v.classList.remove("revealed"));
      return;
    }
    case "show-all":                                 // Radio Navigation ch.19: showAll()
    case "hide-all": {                               //                         hideAll()
      const show = act === "show-all";
      root.querySelectorAll<HTMLElement>(".answer").forEach(a => { a.style.display = show ? "block" : "none"; });
      root.querySelectorAll<HTMLElement>(".show-btn").forEach(b => { b.textContent = show ? "Hide Answer" : "Show Answer"; });
      return;
    }
    case "set-all-details":                          // Air Navigation: setAllAnswers(true|false)
      root.querySelectorAll<HTMLDetailsElement>("details.qa-details").forEach(d => { d.open = arg === "true"; });
      return;
    case "calc-chlong": {                            // Air Navigation ch.1: calcChLong()
      const v1 = parseFloat((byId(root, "lon1v") as HTMLInputElement | null)?.value ?? "");
      const v2 = parseFloat((byId(root, "lon2v") as HTMLInputElement | null)?.value ?? "");
      const d1 = (byId(root, "lon1d") as HTMLSelectElement | null)?.value;
      const d2 = (byId(root, "lon2d") as HTMLSelectElement | null)?.value;
      const out = byId(root, "chlong-out");
      if (!out) return;
      if (Number.isNaN(v1) || Number.isNaN(v2)) { out.textContent = ""; return; }
      let result: number;
      let note: string;
      if (d1 === d2) {
        result = Math.abs(v1 - v2);
        note = `(same side: |${v1}−${v2}|)`;
      } else {
        const sum = v1 + v2;
        if (sum > 180) { result = 360 - sum; note = `(cross-180°: 360−(${v1}+${v2})=${result})`; }
        else { result = sum; note = `(diff sides: ${v1}+${v2})`; }
      }
      out.textContent = `Ch Long = ${result}° ${note}`;
      out.style.color = result > 0 ? "#1a7a4a" : "#c0392b";
      return;
    }
    default:
      return;
  }
}

function runInputAction(root: HTMLElement, act: string, value: string) {
  switch (act) {
    case "calc-recip": {                             // Air Navigation ch.1: calcRecip(this.value)
      const out = byId(root, "brg-out");
      const val = parseInt(value, 10);
      if (!out || Number.isNaN(val)) return;
      const recip = (val + 180) % 360;
      const dir = (d: number) => {
        if (d === 0 || d === 360) return "North";
        if (d === 90) return "East";
        if (d === 180) return "South";
        if (d === 270) return "West";
        if (d > 0 && d < 90) return "NE quad";
        if (d > 90 && d < 180) return "SE quad";
        if (d > 180 && d < 270) return "SW quad";
        return "NW quad";
      };
      out.textContent = `Bearing: ${String(val).padStart(3, "0")}° → Reciprocal: ${String(recip).padStart(3, "0")}° (${dir(recip)})`;
      return;
    }
    case "show-lat": {                               // Air Navigation ch.1: showLat(this.value)
      const out = byId(root, "lat-out");
      const val = parseInt(value, 10);
      if (!out || Number.isNaN(val)) return;
      const places: Record<string, string> = {
        90: "North Pole", 66: "Arctic Circle", 28: "New Delhi, India", 23: "Tropic of Cancer",
        19: "Mumbai, India", 13: "Bangalore, India", 0: "Equator",
        "-13": "Darwin, Australia", "-23": "Tropic of Capricorn", "-66": "Antarctic Circle", "-90": "South Pole",
      };
      const closest = Object.keys(places).reduce((a, b) => (Math.abs(Number(b) - val) < Math.abs(Number(a) - val) ? b : a));
      const side = val > 0 ? `${val}°N` : val < 0 ? `${Math.abs(val)}°S` : "0° (Equator)";
      const near = Math.abs(Number(closest) - val) <= 3 ? ` — near ${places[closest]}` : "";
      out.textContent = `Latitude: ${side}${near}`;
      return;
    }
    default:
      return;
  }
}

// ─── Interactive figures ────────────────────────────────────────────────────
//
// Fetched with a plain import() only when a chapter has one, so no other notes
// page downloads them (next/dynamic was measured preloading the chunk on nav-16,
// which has none). lib/notes-interactives.ts says which figure each sits before.
const LOADERS: Record<InteractiveId, () => Promise<{ default: ComponentType }>> = {
  "one-in-sixty": () => import("@/app/components/interactives/OneInSixtyLab"),
};
type Mount = { id: InteractiveId; el: HTMLElement; Comp: ComponentType };

export default function HtmlNotesPage({ track, subject, chapter, prevChapter, nextChapter, notes, videos, openerFacts, related }: Props) {
  const notesRef = useRef<HTMLDivElement>(null);
  const keyFacts = keyFactsFor(subject.id, chapter.id) ?? openerFacts;
  const [mounts, setMounts] = useState<Mount[]>([]);

  // The mount points can only be made once the chapter's HTML is in the DOM,
  // which is after commit, so this is an effect by necessity. React never
  // rewrites the notes' innerHTML while notes.html is unchanged, so the nodes
  // stay put between renders. Each is marked so read-aloud skips the controls.
  useEffect(() => {
    const root = notesRef.current;
    const wanted = interactivesFor(subject.id, chapter.id);
    if (!root || wanted.length === 0) return;
    let live = true;
    const made: HTMLElement[] = [];
    Promise.all(wanted.map(async (it): Promise<Mount | null> => {
      const img = Array.from(root.querySelectorAll("img")).find(i => (i.getAttribute("src") ?? "").endsWith(`/${it.beforeFigure}`));
      if (!img) return null;
      // A chunk that fails to load leaves the static figure in place, alone.
      let Comp: Mount["Comp"];
      try { ({ default: Comp } = await LOADERS[it.id]()); }
      catch (e) { console.warn("interactive failed to load", it.id, e); return null; }
      if (!live) return null;
      const anchor = img.closest("figure") ?? img;
      const el = document.createElement("div");
      el.dataset.gaReadSkip = "";
      el.dataset.gaInteractive = it.id;
      anchor.parentNode?.insertBefore(el, anchor);
      made.push(el);
      return { id: it.id, el, Comp };
    })).then(list => { if (live) setMounts(list.filter((m): m is Mount => m !== null)); });
    return () => { live = false; made.forEach(el => el.remove()); setMounts([]); };
  }, [notes.html, subject.id, chapter.id]);

  // Nav-1's two sliders used to run calcRecip(60) / showLat(28) when the page
  // loaded; the markup carries a static fallback line, this makes it live.
  useEffect(() => {
    const root = notesRef.current;
    if (!root) return;
    const brg = byId(root, "brg-input") as HTMLInputElement | null;
    const lat = byId(root, "lat-slider") as HTMLInputElement | null;
    if (brg) runInputAction(root, "calc-recip", brg.value);
    if (lat) runInputAction(root, "show-lat", lat.value);
  }, [notes.html]);

  const actionTarget = (e: React.SyntheticEvent<HTMLDivElement>): HTMLElement | null => {
    const el = (e.target as Element | null)?.closest?.("[data-ga-act]") as HTMLElement | null;
    return el && e.currentTarget.contains(el) ? el : null;
  };
  const onNotesClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = actionTarget(e);
    if (el) runClickAction(e.currentTarget, el, el.dataset.gaAct ?? "", el.dataset.gaArg);
  };
  const onNotesInput = (e: React.FormEvent<HTMLDivElement>) => {
    const el = actionTarget(e);
    if (el) runInputAction(e.currentTarget, el.dataset.gaAct ?? "", (el as HTMLInputElement).value ?? "");
  };

  // Content protection, previously injected into the iframe document by
  // tools/_protect-snippet.mjs. The chapter renders in this page now, so the
  // same deterrents have to live here: no copy/cut, no
  // right-click, no drag-saving a figure, and nothing at all on print.
  // The Captain explicitly enabled highlighting for read aloud (2026-10-17).
  // Copy/cut, context-menu, drag-save and print protections remain active.
  const block = (e: React.SyntheticEvent) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen flex flex-col">
      <Watermark />

      {/* Header */}
      <div className="relative flex-shrink-0" style={{ borderBottom: `1px solid ${subject.color}25` }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${subject.color}12 0%, transparent 65%)` }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs mb-4 flex-wrap" style={{ color: "#475569" }}>
            <Link href="/" className="no-underline hover:text-white transition-colors" style={{ color: "#475569" }}>Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${track}`} className="no-underline hover:text-white transition-colors uppercase" style={{ color: "#475569" }}>{track}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${track}/${subject.id}`} className="no-underline hover:text-white transition-colors" style={{ color: "#475569" }}>{subject.shortName}</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: "#94a3b8" }}>Ch.{chapter.number} — Notes</span>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black flex-shrink-0"
                   style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}40`, color: subject.color }}>
                {chapter.number}
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest mb-0.5"
                     style={{ color: subject.color, letterSpacing: "0.18em" }}>
                  {subject.shortName.toUpperCase()} — CHAPTER {chapter.number} · NOTES
                </div>
                <h1 className="text-xl font-black text-white">{chapter.title}</h1>
                <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>by Ghost Aviator</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <ReadAloudControls key={`${subject.id}/${chapter.id}`} />
              {chapter.content.find(c => c.type === "chapter-quiz")?.available && (
                <Link href={`/${track}/${subject.id}/${chapter.id}/chapter-quiz`}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg no-underline"
                      style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316" }}>
                  <ListChecks className="w-3.5 h-3.5" /> Chapter Quiz
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes iframe */}
      <div className="flex-1 min-w-0 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
        <NotesActions subjectId={subject.id} chapterId={chapter.id} />
        {videos && videos.length > 0 && (
          <VideoLectureCard videos={videos} title={chapter.title} color={subject.color} />
        )}
        {/* The chapter itself — rendered in this page, visibly, once.
            It used to sit in an iframe with a duplicate hidden copy alongside
            it for crawlers; that gave the notes route no credit for its own
            content and served ~2,500 words no user could reach. See
            lib/notes-inline.ts. */}
        {/* Vendor sheets a chapter bundles (Font Awesome for the RTR(A) set) are
            linked, not inlined: copying 102 KB of icon CSS into each of 24
            pages is what lib/notes-inline.ts stopped doing. `precedence` is
            what makes React 19 hoist the link into <head>, emit it once however
            many pages share it, and hold first paint until it has loaded.
            Same-origin, so the style-src 'self' CSP allows it. */}
        {notes.stylesheets.map(href => (
          <link key={href} rel="stylesheet" href={href} precedence="default" />
        ))}
        <style dangerouslySetInnerHTML={{ __html: `
/* Container defaults FIRST, so a chapter's own body rules (which scope to
   .ga-notes) override them rather than the other way round. These must not be
   inline styles on the div: an inline style beats every stylesheet rule, which
   would silently discard each chapter's own background, padding and measure. */
.ga-notes { background: #f8f9fc; color: #111; padding: 1.5rem; }

${notes.css}
/* Protection + fit. Kept after the chapter's own rules so it always wins. */
.ga-notes, .ga-notes * {
  -webkit-user-select: text !important; -moz-user-select: text !important;
  -ms-user-select: text !important; user-select: text !important;
  -webkit-touch-callout: none !important;
}
.ga-notes img, .ga-notes svg { -webkit-user-drag: none !important; max-width: 100%; height: auto; }
/* The chapter is authored as a standalone page; keep it from forcing the
   layout wider than the viewport on a phone. */
${NOTES_FIT_CSS}
@media print { .ga-notes { display: none !important; } }
` }} />
        <div
          ref={notesRef}
          className="ga-notes rounded-2xl"
          style={{ border: `1px solid ${subject.color}20` }}
          onClick={onNotesClick}
          onInput={onNotesInput}
          onContextMenu={block}
          onCopy={block}
          onCut={block}
          onDragStart={block}
          dangerouslySetInnerHTML={{ __html: notes.html }}
        />
        {mounts.map(({ id, el, Comp }) => createPortal(<Comp />, el, id))}

        <NotesActions subjectId={subject.id} chapterId={chapter.id} />

        {/* Key facts — the only part of this chapter that is offered for
            quoting. Rendered VISIBLY and after the notes: a student who has
            just read the chapter gets a revision box, and the page finally has
            something extractable on it. Never hide this from users to feed a
            crawler — see lib/chapter-key-facts.ts. */}
        {keyFacts && (
          <section
            className="rounded-2xl p-6 sm:p-8"
            style={{ background: "rgba(17,24,32,0.95)", border: `1px solid ${subject.color}25` }}
          >
            <h2 className="text-xl font-bold text-white mb-1">
              Key facts — {chapter.title}
            </h2>
            <p className="text-sm mb-5" style={{ color: "#64748b" }}>
              The figures from this chapter worth carrying into the exam hall.
            </p>
            <dl className="space-y-4">
              {keyFacts.facts.map(f => (
                <div key={f.term}>
                  <dt className="text-sm font-bold mb-1" style={{ color: subject.color }}>{f.term}</dt>
                  <dd className="text-base leading-relaxed m-0" style={{ color: "#94a3b8" }}>{f.fact}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* The subject's free study group. Deliberately says nothing about files: the notes on this site
            stay protected (Iron Rule 3); the group is for doubts and batchmates. */}
        {SUBJECT_TELEGRAM_GROUPS[subject.id] && (
          <div className="p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
               style={{ background: "rgba(34,158,217,0.08)", border: "1px solid rgba(34,158,217,0.3)" }}>
            <div>
              <div className="text-sm font-bold text-white mb-1">Study {subject.shortName} with other student pilots</div>
              <div className="text-xs" style={{ color: "#94a3b8" }}>
                Join the free {subject.shortName} group on Telegram. Stuck on a doubt? Type /q and your question, and
                get an answer from Ghost Aviator&apos;s notes.
              </div>
            </div>
            <a href={SUBJECT_TELEGRAM_GROUPS[subject.id]} target="_blank" rel="noopener noreferrer"
               className="px-4 py-2 rounded-lg text-xs font-bold no-underline whitespace-nowrap text-center"
               style={{ background: "#229ED9", color: "#fff" }}>
              Join the {subject.shortName} group →
            </a>
          </div>
        )}

        <NotesEndCta subjectId={subject.id} subject={subject.shortName} chapter={chapter.title} accent={subject.color} />

        {related}

        {/* Chapter navigation */}
        <div className="flex items-center justify-between gap-4 mt-2 mb-6">
          {prevChapter ? (
            <Link href={`/${track}/${subject.id}/${prevChapter.id}/notes`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl no-underline min-w-0"
                  style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs" style={{ color: "#475569" }}>Previous</div>
                <div className="text-sm font-semibold truncate">Ch.{prevChapter.number}: {prevChapter.title}</div>
              </div>
            </Link>
          ) : <div />}

          <Link href={`/${track}/${subject.id}`}
                className="text-sm font-bold no-underline px-4 py-2 rounded-xl whitespace-nowrap flex-shrink-0"
                style={{ color: subject.color, border: `1px solid ${subject.color}30`, background: `${subject.color}10` }}>
            ↑ All Chapters
          </Link>

          {nextChapter ? (
            <Link href={`/${track}/${subject.id}/${nextChapter.id}/notes`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl no-underline min-w-0"
                  style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
              <div className="text-right min-w-0">
                <div className="text-xs" style={{ color: "#475569" }}>Next</div>
                <div className="text-sm font-semibold truncate">Ch.{nextChapter.number}: {nextChapter.title}</div>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          ) : <div />}
        </div>

        {track === "atpl" && <div className="mt-8 rounded-xl border border-slate-600 p-5 text-slate-300"><p>Shared Ghost Aviator reference notes. Read alongside the official ATPL syllabus and current approved aircraft documentation.</p><Link href="/cpl" className="text-sky-300 underline">Question practice is in CPL →</Link></div>}
        {/* Related Topics & Interlinking Hub */}
        {track !== "atpl" && <div className="mt-8 pt-8 border-t border-white/10 space-y-6 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Reinforce Chapter {chapter.number}: {chapter.title}</h3>
              <p className="text-xs text-slate-400">Test your knowledge and practice actual exam questions for {subject.name}.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/${track}/${subject.id}/${chapter.id}/chapter-quiz`}
                    className="px-3 py-2 rounded-lg text-xs font-bold no-underline bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all">
                Chapter Quiz
              </Link>
              <Link href={`/question-bank`}
                    className="px-3 py-2 rounded-lg text-xs font-bold no-underline bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                Question Bank
              </Link>
              <Link href={`/past-papers`}
                    className="px-3 py-2 rounded-lg text-xs font-bold no-underline bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-all">
                Past Papers
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white mb-1">Planning your Pilot Training in 2026?</div>
              <div className="text-xs text-slate-400">Calculate exact flying hours, DGCA exam fees, and living costs with our interactive calculator.</div>
            </div>
            <Link href="/cpl-cost-calculator" className="px-4 py-2 rounded-lg text-xs font-bold text-sky-400 border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 no-underline whitespace-nowrap transition-all">
              CPL Cost Calculator →
            </Link>
          </div>
        </div>}
      </div>

    </div>
  );
}
