import Link from "next/link";
import type { Metadata } from "next";
// No brand icons in this lucide version — MonitorPlay stands in for the channel CTA.
import { Video, PlayCircle, ArrowRight, MonitorPlay } from "lucide-react";
import { videoIndex, videoIndexTotals } from "@/lib/video-index";
import { SITE_URL, PERSON_ID, ORG_ID } from "@/lib/site";

const { cpl, atpl } = videoIndex();
const totals = videoIndexTotals();

export const metadata: Metadata = {
  title: `DGCA Video Lectures (CBT) — ${totals.distinctLectures} Free Classes by Capt. Pankaj Pahil | Ghost Aviator`,
  description:
    `Every DGCA CPL and ATPL video lecture in one place — ${totals.distinctLectures} free classes across ` +
    `${totals.subjects} subjects and ${totals.chapters} chapters. Meteorology, Air Regulations, ` +
    `Radio Navigation, Instruments and more. Free to watch, no sign-up.`,
  alternates: { canonical: "/video-lectures" },
};

/* One ItemList naming the subjects, rather than 273 VideoObject nodes.
   Each lecture already has its VideoObject on the chapter's own /video page,
   which is its watch page; repeating them here would give search two competing
   claims about where the same lecture lives. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ItemList",
      "@id": `${SITE_URL}/video-lectures#list`,
      name: "DGCA CPL & ATPL Video Lectures",
      description: `Free DGCA ground-school video lectures organised by subject and chapter.`,
      numberOfItems: [...cpl, ...atpl].length,
      itemListElement: [...cpl, ...atpl].map((s, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${s.name} — ${s.lectureCount} lectures`,
        url: `${SITE_URL}${s.subjectUrl}`,
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/video-lectures#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Video Lectures" },
      ],
    },
    {
      "@type": "Course",
      "@id": `${SITE_URL}/video-lectures#course`,
      name: "DGCA CPL & ATPL Ground School — Video Lectures",
      description:
        "A complete free video ground-school course for the DGCA CPL and ATPL examinations, " +
        "taught chapter by chapter.",
      url: `${SITE_URL}/video-lectures`,
      inLanguage: "en",
      isAccessibleForFree: true,
      author: { "@id": PERSON_ID },
      provider: { "@id": ORG_ID },
    },
  ],
};

function SubjectBlock({ subject }: { subject: (typeof cpl)[number] }) {
  return (
    <section id={subject.id} className="mb-10 scroll-mt-24">
      {/* Subject header */}
      <div className="flex flex-wrap items-center gap-3 mb-4 pb-3"
           style={{ borderBottom: `1px solid ${subject.color}30` }}>
        <span className="text-2xl">{subject.icon}</span>
        <h2 className="text-xl font-black text-white">{subject.name}</h2>
        <span className="text-xs px-2.5 py-1 rounded-full font-bold"
              style={{ background: `${subject.color}15`, border: `1px solid ${subject.color}35`, color: subject.color }}>
          {subject.lectureCount} lecture{subject.lectureCount === 1 ? "" : "s"} · {subject.chapters.length} chapter{subject.chapters.length === 1 ? "" : "s"}
        </span>
        <Link href={subject.subjectUrl}
              className="ml-auto text-xs font-bold no-underline flex items-center gap-1"
              style={{ color: subject.color }}>
          All chapters <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Chapters */}
      <div className="flex flex-col gap-3">
        {subject.chapters.map(ch => (
          <div key={ch.id} className="rounded-xl p-4"
               style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex flex-wrap items-baseline gap-2 mb-3">
              <span className="text-xs font-black px-2 py-0.5 rounded"
                    style={{ background: `${subject.color}18`, color: subject.color }}>
                Ch.{ch.number}
              </span>
              <Link href={ch.chapterUrl}
                    className="text-sm font-bold text-white no-underline hover:underline">
                {ch.title}
              </Link>
              <Link href={ch.chapterUrl}
                    className="ml-auto text-xs no-underline whitespace-nowrap"
                    style={{ color: "#64748b" }}>
                Notes &amp; questions →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ch.lectures.map(l => (
                <a key={`${ch.id}-${l.id}`} href={l.watchUrl}
                   target="_blank" rel="noopener noreferrer"
                   className="flex items-center gap-2.5 p-2 rounded-lg no-underline group"
                   style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- YouTube thumbnail on a remote host; next/image would need a loader config for i.ytimg.com and buys nothing for a 96px still. */}
                  <img src={l.thumbnail} alt="" width={64} height={36} loading="lazy"
                       className="rounded flex-shrink-0 object-cover"
                       style={{ width: 64, height: 36, background: "#0b1117" }} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-semibold leading-snug line-clamp-2"
                          style={{ color: "#cbd5e1" }}>
                      {l.title}
                    </span>
                    {l.duration && (
                      <span className="block text-[11px] mt-0.5" style={{ color: "#475569" }}>
                        {l.duration}
                      </span>
                    )}
                  </span>
                  <PlayCircle className="w-4 h-4 flex-shrink-0" style={{ color: subject.color }} />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function VideoLecturesPage() {
  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen">
      <script type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(239,68,68,0.2)" }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(239,68,68,0.12) 0%, transparent 65%)" }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5"
               style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }}>
            <Video className="w-4 h-4" /> Video Lectures · CBT
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
            DGCA Video Lectures
          </h1>
          <p className="text-base max-w-2xl mx-auto mb-6" style={{ color: "#64748b" }}>
            Every lecture Capt. Pankaj Pahil has recorded, organised the way you study —
            subject, then chapter. Free to watch, no sign-up, no paywall.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              [`${totals.distinctLectures}`, "lectures"],
              [`${totals.subjects}`, "subjects"],
              [`${totals.chapters}`, "chapters covered"],
            ].map(([n, label]) => (
              <span key={label} className="text-xs px-3 py-1.5 rounded-full font-bold"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "#94a3b8" }}>
                <span className="text-white">{n}</span> {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Jump links. Split by track rather than one flat row: four subject
            short-names exist in BOTH tracks ("Air Regs", "Meteorology",
            "Navigation"), so a single row showed the same label twice with no
            way to tell which paper it belonged to. */}
        <nav aria-label="Jump to subject" className="flex flex-col gap-2 mb-10">
          {([["CPL", cpl], ["ATPL", atpl]] as const).map(([track, list]) =>
            list.length === 0 ? null : (
              <div key={track} className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-black tracking-wider w-11 flex-shrink-0"
                      style={{ color: track === "CPL" ? "#f3c889" : "#f0913a" }}>
                  {track}
                </span>
                {list.map(s => (
                  <a key={s.id} href={`#${s.id}`}
                     className="text-xs px-2.5 py-1.5 rounded-lg no-underline font-semibold"
                     style={{ background: `${s.color}12`, border: `1px solid ${s.color}25`, color: s.color }}>
                    {s.icon} {s.shortName} <span style={{ opacity: 0.6 }}>{s.lectureCount}</span>
                  </a>
                ))}
              </div>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">🛩️</span>
          <h2 className="text-2xl font-black text-white">CPL</h2>
        </div>
        {cpl.map(s => <SubjectBlock key={s.id} subject={s} />)}

        {atpl.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-5 mt-12">
              <span className="text-2xl">✈️</span>
              <h2 className="text-2xl font-black text-white">ATPL</h2>
            </div>
            {atpl.map(s => <SubjectBlock key={s.id} subject={s} />)}
          </>
        )}

        {/* Channel links — a student who wants the whole series in order is
            better served by the playlist than by this index. */}
        <div className="mt-12 rounded-2xl p-6 text-center"
             style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(239,68,68,0.25)" }}>
          <MonitorPlay className="w-7 h-7 mx-auto mb-3" style={{ color: "#f87171" }} />
          <h2 className="text-lg font-black text-white mb-2">New lectures go up continuously</h2>
          <p className="text-sm mb-5 max-w-lg mx-auto" style={{ color: "#64748b" }}>
            Subscribe and you will not have to come looking — every new chapter appears
            on the channel first, then here.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="https://www.youtube.com/@PankajPahil" target="_blank" rel="noopener noreferrer"
               className="px-4 py-2.5 rounded-xl text-sm font-bold no-underline"
               style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }}>
              ▶ @PankajPahil
            </a>
            <a href="https://www.youtube.com/@Capt.GhostAviator" target="_blank" rel="noopener noreferrer"
               className="px-4 py-2.5 rounded-xl text-sm font-bold no-underline"
               style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }}>
              ▶ @Capt.GhostAviator
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
