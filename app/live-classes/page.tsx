import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, MessageCircle, Radio, Users, Award, BookOpen, Target, ShieldCheck, Layers, QrCode, VideoOff, FileText, Sparkles, Lock } from "lucide-react";
import { SITE_URL, PERSON_ID, ORG_ID } from "@/lib/site";

import {
  LIVE_PRICE as PRICE,
  LIVE_LIST_PRICE as LIST_PRICE,
  LIVE_COMBO_PRICE as COMBO_PRICE,
  LIVE_COMBO_LIST_PRICE as COMBO_LIST_PRICE,
  LIVE_PRICE_VALUE,
  LIVE_COMBO_PRICE_VALUE,
  LIVE_UPI_VPA,
  LIVE_UPI_PAYEE,
  LIVE_UPI_QR,
  liveUpiLink,
  livePaidLink,
  liveDemoLink,
  liveComboDemoLink,
  botLink,
  LIVE_BATCH_META,
} from "@/lib/live-classes";

export const metadata: Metadata = {
  title: "DGCA CPL Online Ground Classes India — Free Demo, Met, Air Regs & Nav",
  description:
    `Free live demo first. Then live online DGCA CPL ground classes taught personally by the Captain — pilot, flight & ground instructor and author. Meteorology, Air Regulations, Gen Navigation, Radio Navigation & Instrumentation. ${PRICE} per subject (list ${LIST_PRICE}), or ${COMBO_PRICE} for the full Navigation combo. Only 10 seats each. No recordings — written class notes and summaries instead. Fee by UPI after the demo, only if you enroll.`,
  keywords: [
    "DGCA ground classes online", "DGCA free demo class", "DGCA pilot course", "CPL coaching online", "DGCA Air Regulations classes",
    "DGCA Meteorology classes", "DGCA Navigation classes", "DGCA Radio Navigation classes",
    "DGCA Instrumentation classes", "pilot training India", "CPL exam coaching", "aviation ground school India",
  ],
  alternates: { canonical: "/live-classes" },
  openGraph: {
    title: "Live DGCA Ground Classes with the Captain — Free Demo First",
    description: `Free live demo first. 5 subjects, live online, batches of 10. ${PRICE} per subject, down from ${LIST_PRICE}. Fee by UPI after the demo, only if you enroll. No recordings.`,
    url: `${SITE_URL}/live-classes`,
    type: "website",
  },
};

const SUBJECTS = [
  {
    key: "meteorology",
    name: "Aviation Meteorology",
    icon: "🌤️",
    color: "#0ea5e9",
    tagline: "Weather theory that finally makes sense",
    points: [
      "Atmosphere, winds, clouds & stability — concept first",
      "METAR / TAF / SIGMET decoding, step by step",
      "Indian monsoon, jet streams & tropical systems",
      "Backed by a 650+ question verified bank",
    ],
  },
  {
    key: "air-regulations",
    name: "Air Regulations",
    icon: "⚖️",
    color: "#ab794d",
    tagline: "The rule book, decoded by someone who has lived it",
    points: [
      "ICAO Annexes & Chicago Convention made simple",
      "Indian CARs, Aircraft Act & Rules — exam-focused",
      "Licensing, airspace, ATC procedures & SAR",
      "Solved past papers & most-repeated questions",
    ],
  },
  {
    key: "air-navigation",
    name: "General Navigation",
    icon: "🗺️",
    color: "#10b981",
    tagline: "The subject students fear most — conquered",
    points: [
      "Charts, compasses & the 1-in-60 rule mastered",
      "Numericals solved live, method by method",
      "Great circles, rhumb lines & convergency clarity",
      "Speed math tricks for the actual exam",
    ],
  },
  {
    key: "radio-navigation",
    name: "Radio Navigation",
    icon: "📡",
    color: "#06b6d4",
    tagline: "From radio waves to RNAV — signal by signal",
    points: [
      "VOR, ILS, DME, ADF/NDB — principles & failures",
      "Radar, SSR & GNSS the way DGCA asks them",
      "Propagation & frequencies without the confusion",
      "Question-bank drills after every topic",
    ],
  },
  {
    key: "instrumentation",
    name: "Navigation — Instrumentation",
    icon: "🧭",
    color: "#f59e0b",
    tagline: "Glass cockpit to gyros — instruments demystified",
    points: [
      "Pitot-static, gyros & magnetic compass errors",
      "EFIS, FMS & autopilot logic made visual",
      "Air data computers & modern flight decks",
      "Exam-pattern numericals solved together",
    ],
  },
];

const FAQ = [
  {
    q: "Who teaches the classes?",
    a: "Every class is taught live by the Captain himself — pilot, DGCA flight & ground instructor with 17+ years in aviation, and author of two aviation books. No junior tutors, and no recordings at all.",
  },
  {
    q: "How are the classes conducted?",
    a: "Live online (Google Meet), in small batches of maximum 10 students so every doubt gets answered. Sessions run 4–6 weeks per subject with practice questions after every topic.",
  },
  {
    q: "What is the founding-batch price?",
    a: `${PRICE} per subject, down from ${LIST_PRICE} — far below typical institute fees, and taught by the Captain himself rather than a hired faculty member. The Navigation combo (Gen Nav + Radio Nav + Instrumentation) is ${COMBO_PRICE} instead of ${COMBO_LIST_PRICE} for all three. Ten seats per batch, so every question gets answered. The free demo comes first; you pay only if you want to enroll after it.`,
  },
  {
    q: "Is there a free demo?",
    a: "Yes. Message the Captain on WhatsApp to book a free live demo. There is no fee, no recording and no obligation. You can see how he teaches and ask questions before you decide whether to enroll.",
  },
  {
    q: "Is there a Navigation combo?",
    a: `Yes — General Navigation + Radio Navigation + Instrumentation together cover the composite DGCA Navigation paper. The combo is ${COMBO_PRICE} for all three. You can book a free combo demo first.`,
  },
  {
    q: "Who can join?",
    a: "CPL/ATPL aspirants preparing for DGCA written exams, students at flying schools, and anyone retaking a subject. The free study material on this site remains free for everyone, always.",
  },
  {
    q: "Do I get recordings of the classes?",
    a: "No. Ghost Aviator does not sell recordings. A recording becomes a file that is forwarded and resold, and it detaches the teaching from the teacher. You get written class notes and summaries after each session. If anyone offers you a Ghost Aviator recording, it is not official.",
  },
  {
    q: "How do I pay?",
    a: `Book a free demo first. After the demo, if you want to enroll, pay the fee by UPI: ${PRICE} per subject or ${COMBO_PRICE} for the Navigation combo. Your seat is confirmed when the payment reaches the official UPI account shown on this page.`,
  },
  {
    q: "What if I miss a live class?",
    a: "Attend live — there is no recording to fall back on. If you miss a session, you receive the written summary and can bring the questions to the next doubt-clearing slot. Missed classes are not refundable, so check the schedule before you pay.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    ...SUBJECTS.map(s => ({
      "@type": "Course",
      name: `DGCA CPL ${s.name} — Live Online Ground Classes`,
      description: `Free live demo first. Live online DGCA ${s.name} classes taught by the Captain. Small batch of 10, 4–6 weeks. Fee by UPI after the demo only if you enroll. No recordings — written class notes and summaries after each session.`,
      provider: { "@id": ORG_ID },
      offers: { "@type": "Offer", price: LIVE_PRICE_VALUE, priceCurrency: "INR", availability: "https://schema.org/InStock" },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "Online",
        courseWorkload: "PT6H",
        maximumAttendeeCapacity: 10,
        instructor: { "@id": PERSON_ID },
      },
    })),
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}/live-classes#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Live Ground Classes" },
      ],
    },
  ],
};

function PriceTag({ color }: { color: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-sm line-through" style={{ color:"#475569" }}>{LIST_PRICE}</span>
        <span className="text-2xl font-black text-white">{PRICE}</span>
      </div>
      <div className="text-xs font-bold" style={{ color }}>Live batch · 10 seats</div>
    </div>
  );
}

export default function LiveClassesPage() {
  return (
    <div style={{ background: "#0b1117" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(171,121,77,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(171,121,77,0.05) 1px,transparent 1px)",
          backgroundSize: "55px 55px",
        }}/>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% -20%, rgba(255,40,40,0.14), transparent 60%)",
        }}/>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
         <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-black mb-6"
               style={{ background:"rgba(255,40,40,0.12)", border:"1px solid rgba(255,60,60,0.45)", color:"#ff5a5a" }}>
            <Radio className="w-4 h-4 animate-pulse" /> LIVE ONLINE BATCHES · FREE DEMO OPEN
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-4">
            Learn From <span style={{ background:"linear-gradient(135deg,#ff6000,#c25a1e,#f0913a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>The Captain</span> Himself
          </h1>
          <p className="text-lg max-w-3xl mx-auto lg:mx-0 mb-3 leading-relaxed" style={{ color:"#94a3b8" }}>
            Live DGCA CPL ground classes — taught by <strong style={{ color:"#f3c889" }}>the Captain</strong>.
          </p>
          <p className="text-base font-black mb-2">
            From <span style={{ color:"#22c55e" }}>{PRICE}</span> / subject{" "}
            <span className="font-semibold" style={{ color:"#94a3b8" }}>(list <span className="line-through">{LIST_PRICE}</span>)</span>
            {" "}· Navigation combo <span style={{ color:"#22c55e" }}>{COMBO_PRICE}</span>
            {" "}· <span style={{ color:"#f3c889" }}>Only 10 seats</span>
          </p>
          <p className="text-sm font-semibold mb-6" style={{ color:"#94a3b8" }}>
            Free demo first · Fee by UPI after demo · No recordings
          </p>

          {/* Next published cohort — sourced from LIVE_BATCH_META */}
          <div className="mb-10 mx-auto lg:mx-0 max-w-xl rounded-2xl px-5 py-4 text-left"
               style={{ background:"rgba(255,40,40,0.08)", border:"1px solid rgba(255,60,60,0.35)" }}>
            <div className="text-xs font-black tracking-widest uppercase mb-1" style={{ color:"#ff5a5a" }}>
              Founding batch
            </div>
            <div className="text-lg font-black text-white leading-snug">
              {LIVE_BATCH_META.subjectTitle}
            </div>
            <div className="text-sm font-semibold mt-1" style={{ color:"#94a3b8" }}>
              {LIVE_BATCH_META.statusLabel} · {LIVE_BATCH_META.mode} · max {LIVE_BATCH_META.maxSeats} seats · {LIVE_BATCH_META.durationLabel}
            </div>
            <div className="text-xs font-bold mt-2" style={{ color:"#f3c889" }}>
              Free demo first · {LIVE_BATCH_META.startLabel} · {LIVE_BATCH_META.maxSeats} seats — founding price shown above
            </div>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
            <a href={liveDemoLink("DGCA Ground Classes")} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
               style={{ background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"#fff", boxShadow:"0 0 30px rgba(34,197,94,0.4)" }}>
              <MessageCircle className="w-5 h-5" /> Book a free demo
            </a>
            {/* Instant answers from the assistant: hidden until LIVE_TELEGRAM_BOT is set (lib/live-classes.ts). */}
            {botLink("web") && (
              <a href={botLink("web_live")} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
                 style={{ border: "1px solid rgba(56,189,248,0.5)", color: "#38bdf8", background: "rgba(56,189,248,0.08)" }}>
                Instant answers on Telegram
              </a>
            )}
            <a href="#pay"
               className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
               style={{ border:"1px solid rgba(34,197,94,0.5)", color:"#22c55e", background:"rgba(34,197,94,0.08)" }}>
              <QrCode className="w-5 h-5" /> See UPI details
            </a>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-6">
            {[
              [Award, "17+ years in aviation"],
              [BookOpen, "Author of 2 aviation books"],
              [Users, "Flight & ground instructor"],
              [ShieldCheck, "Creator of Ghost Aviator"],
              [VideoOff, "No recordings — ever"],
            ].map(([Icon, label]) => {
              const I = Icon as typeof Award;
              return (
                <div key={label as string} className="flex items-center gap-2 text-sm" style={{ color:"#94a3b8" }}>
                  <I className="w-4 h-4" style={{ color:"#f3c889" }}/> {label as string}
                </div>
              );
            })}
          </div>
          </div>

          {/* The Captain at the constellation chalkboard — edges dissolved into the night */}
          <div className="relative flex-shrink-0"
               style={{ width: "min(460px, 90vw)", aspectRatio: "785 / 718",
                        maskImage: "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
                        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)" }}>
            <Image src="/captain-teaching.webp" alt="The Captain teaching navigation at a constellation chalkboard" fill priority sizes="460px"
                   className="object-cover"
                   style={{
                     maskImage: "radial-gradient(ellipse 66% 60% at 51% 50%, black 40%, transparent 83%)",
                     WebkitMaskImage: "radial-gradient(ellipse 66% 60% at 51% 50%, black 40%, transparent 83%)",
                   }} />
          </div>
         </div>
        </div>
      </section>

      {/* ══════════ FREE DEMO ══════════ */}
      <section id="demo" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 scroll-mt-24">
        <div className="rounded-3xl p-6 sm:p-8"
             style={{ background:"linear-gradient(135deg, rgba(34,197,94,0.12), rgba(17,24,32,0.97))", border:"1px solid rgba(34,197,94,0.35)" }}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase mb-3" style={{ color:"#22c55e" }}>
                <MessageCircle className="w-4 h-4" /> Free live demo
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                See the teaching before you pay.
              </h2>
              <p className="text-base leading-relaxed mb-4 max-w-3xl" style={{ color:"#94a3b8" }}>
                Book a free live demo with the Captain. See how he teaches and ask your questions.
                If you want to enroll afterwards, pay the fee by UPI.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm" style={{ color:"#cbd5e1" }}>
                {["No fee for the demo", "Live, not recorded", "Pay after the demo"].map(item => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" style={{ color:"#22c55e" }} /> {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <a href={liveDemoLink("DGCA Ground Classes")} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-black no-underline"
                 style={{ background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"#fff", boxShadow:"0 0 25px rgba(34,197,94,0.35)" }}>
                <MessageCircle className="w-5 h-5" /> Book a free demo
              </a>
              <a href="#pay"
                 className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-bold no-underline"
                 style={{ border:"1px solid rgba(34,197,94,0.4)", color:"#22c55e", background:"rgba(34,197,94,0.08)" }}>
                See UPI details <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ NO RECORDINGS ══════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl p-6 sm:p-8" style={{ background:"linear-gradient(135deg, rgba(240,145,58,0.1), rgba(17,24,32,0.97))", border:"1px solid rgba(240,145,58,0.28)" }}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-start">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase mb-3" style={{ color:"#f0913a" }}>
                <VideoOff className="w-4 h-4" /> No recordings. Ever.
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                A recording is a file. A live room is a commitment.
              </h2>
              <p className="text-base leading-relaxed mb-5 max-w-3xl" style={{ color:"#94a3b8" }}>
                A recording gets forwarded, resold and detached from the teaching. It also lets a student pay for a
                room and never enter it. This batch is deliberately different: you show up, you ask, and the Captain
                sees whether you understood. After every session you get the written notes and summary — the essence,
                not a video to share.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  [Radio, "Live only", "Google Meet, maximum 10 students, taught by the Captain."],
                  [FileText, "Written notes", "Class notes and summaries after every session."],
                  [Lock, "No downloads", "No recording, no download, no resale. Sharing ends access."],
                ].map(([Icon, title, body]) => {
                  const I = Icon as typeof Radio;
                  return (
                    <div key={title as string} className="rounded-xl px-4 py-3" style={{ background:"rgba(11,17,23,0.7)", border:"1px solid rgba(240,145,58,0.16)" }}>
                      <I className="w-4 h-4 mb-2" style={{ color:"#f3c889" }} />
                      <div className="text-sm font-black text-white">{title as string}</div>
                      <div className="text-xs mt-1 leading-relaxed" style={{ color:"#64748b" }}>{body as string}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-2xl p-5 max-w-xs" style={{ background:"rgba(11,17,23,0.8)", border:"1px solid rgba(240,145,58,0.22)" }}>
              <div className="text-xs font-black uppercase tracking-wider mb-2" style={{ color:"#f3c889" }}>Why this matters</div>
              <p className="text-sm leading-relaxed" style={{ color:"#94a3b8" }}>
                Scammers impersonate instructors and sell fake recordings. Ghost Aviator removes the product they
                would fake. If someone offers you a Ghost Aviator recording, it is not from us.
              </p>
              <Link href="/official" className="inline-flex items-center gap-1.5 text-sm font-bold no-underline mt-4" style={{ color:"#f0913a" }}>
                Verify official channels <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ SUBJECT BATCHES ══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Choose Your <span style={{ background:"linear-gradient(135deg,#f3c889,#c25a1e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Battle</span></h2>
          <p style={{ color:"#64748b" }}>Five subjects. Five live batches. One instructor, Capt. Pankaj Pahil, who teaches every batch himself.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUBJECTS.map(s => (
            <div key={s.name} className="relative rounded-3xl overflow-hidden p-8 flex flex-col"
                 style={{ background:"rgba(17,24,32,0.95)", border:`1px solid ${s.color}45` }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(to right, ${s.color}, transparent)` }}/>
              <div className="text-5xl mb-4">{s.icon}</div>
              <h3 className="text-2xl font-black text-white mb-1">{s.name}</h3>
              <p className="text-sm font-semibold mb-6" style={{ color: s.color }}>{s.tagline}</p>
              <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                {s.points.map(p => (
                  <li key={p} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color:"#94a3b8" }}>
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: s.color }}/> {p}
                  </li>
                ))}
              </ul>
              <div className="mb-5">
                <PriceTag color={s.color} />
              </div>
              <div className="flex flex-col gap-2 mt-auto">
                <a href={liveDemoLink(s.name)} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black no-underline transition-transform hover:-translate-y-0.5"
                   style={{ background:`linear-gradient(135deg, ${s.color}, ${s.color}dd)`, color:"#fff", boxShadow:`0 4px 16px ${s.color}35` }}>
                  <MessageCircle className="w-4 h-4"/> Book a free demo
                </a>
                <p className="text-[11px] text-center m-0" style={{ color:"#64748b" }}>
                  Free demo first · fee by UPI after demo
                </p>
              </div>
            </div>
          ))}

          {/* ══ NAVIGATION COMBO — featured card ══ */}
          <div className="relative rounded-3xl overflow-hidden p-8 flex flex-col"
               style={{ background:"linear-gradient(160deg, rgba(16,185,129,0.12), rgba(6,182,212,0.10), rgba(245,158,11,0.10))", border:"1px solid rgba(34,197,94,0.5)", boxShadow:"0 0 35px rgba(16,185,129,0.15)" }}>
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-black"
                 style={{ background:"rgba(34,197,94,0.18)", border:"1px solid rgba(34,197,94,0.5)", color:"#22c55e" }}>
              BEST VALUE
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-10 h-10" style={{ color:"#22c55e" }}/>
              <span className="text-3xl">🗺️📡🧭</span>
            </div>
            <h3 className="text-2xl font-black text-white mb-1">The Navigation Combo</h3>
            <p className="text-sm font-semibold mb-6" style={{ color:"#22c55e" }}>All three navigation subjects — the complete composite paper</p>
            <ul className="flex flex-col gap-2.5 mb-8 flex-1">
              {[
                "General Navigation + Radio Navigation + Instrumentation",
                "Covers the full composite DGCA Navigation paper",
                "One integrated plan — concepts connect across subjects",
                `Save ₹${(Number(LIVE_PRICE_VALUE) * 3 - Number(LIVE_COMBO_PRICE_VALUE)).toLocaleString("en-IN")} vs joining the three founding batches separately`,
              ].map(p => (
                <li key={p} className="flex items-start gap-2 text-sm leading-relaxed" style={{ color:"#94a3b8" }}>
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color:"#22c55e" }}/> {p}
                </li>
              ))}
            </ul>
            <div className="mb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-sm line-through" style={{ color:"#475569" }}>{COMBO_LIST_PRICE}</span>
                <span className="text-2xl font-black text-white">{COMBO_PRICE}</span>
              </div>
              <div className="text-xs font-bold" style={{ color:"#22c55e" }}>Navigation combo · 3 subjects · 10 seats</div>
            </div>
            <div className="flex flex-col gap-2 mt-auto">
              <a href={liveComboDemoLink()} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black no-underline transition-transform hover:-translate-y-0.5"
                 style={{ background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"#fff", boxShadow:"0 0 25px rgba(34,197,94,0.4)" }}>
                <MessageCircle className="w-4 h-4"/> Book a free combo demo
              </a>
              <p className="text-[11px] text-center m-0" style={{ color:"#64748b" }}>
                Free demo first · {COMBO_PRICE} by UPI after demo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ PAY BY UPI ══════════
          Added 2026-09-21. A student can pay at any hour without anyone awake.
          The QR is the reliable path (personal UPI account); the "open UPI app"
          link is a best-effort shortcut some apps refuse for P2P amounts. */}
      <section id="pay" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24">
        <div className="rounded-3xl p-6 sm:p-10" style={{ background:"rgba(17,24,32,0.95)", border:"1px solid rgba(34,197,94,0.35)" }}>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 text-center">Pay by UPI — after your free demo</h2>
          <p className="text-center text-sm mb-4 max-w-2xl mx-auto" style={{ color:"#94a3b8" }}>
            Attend a free live demo first. If you want to enroll afterwards, pay the fee by UPI.
            Then send the payment screenshot on WhatsApp and your seat is confirmed.
          </p>
          <p className="text-center text-xs font-bold mb-8 max-w-2xl mx-auto" style={{ color:"#f3c889" }}>
            Pay after the demo, once you have decided to enroll.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: "One subject", price: PRICE, value: LIVE_PRICE_VALUE, qr: LIVE_UPI_QR.single, what: "live batch (one subject)" },
              { label: "Navigation combo — Gen Nav + Radio Nav + Instruments", price: COMBO_PRICE, value: LIVE_COMBO_PRICE_VALUE, qr: LIVE_UPI_QR.combo, what: "Navigation Combo live batch" },
            ].map(p => (
              <div key={p.value} className="rounded-2xl p-6 text-center" style={{ background:"rgba(11,17,23,0.9)", border:"1px solid rgba(243,200,137,0.2)" }}>
                <div className="text-sm font-bold mb-1" style={{ color:"#f3c889" }}>{p.label}</div>
                <div className="text-3xl font-black text-white mb-4">{p.price}</div>
                <div className="mx-auto mb-4 rounded-xl bg-white p-2" style={{ width: 216, height: 216 }}>
                  <Image src={p.qr} alt={`UPI QR code to pay ${p.price} to ${LIVE_UPI_VPA}`} width={200} height={200} unoptimized />
                </div>
                <a href={liveUpiLink(p.value, `DGCA ${p.what}`)}
                   className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold no-underline mb-3"
                   style={{ background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"#fff" }}>
                  <QrCode className="w-4 h-4" /> Open UPI app ({p.price})
                </a>
                <a href={livePaidLink(p.what, p.price)} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-bold no-underline"
                   style={{ border:"1px solid rgba(34,197,94,0.5)", color:"#22c55e", background:"rgba(34,197,94,0.08)" }}>
                  <MessageCircle className="w-4 h-4" /> Paid? Send screenshot on WhatsApp
                </a>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center text-sm" style={{ color:"#94a3b8" }}>
            <div>UPI ID: <strong className="text-white">{LIVE_UPI_VPA}</strong></div>
            <div className="mt-1">Your UPI app will show the account name <strong className="text-white">{LIVE_UPI_PAYEE}</strong> — that is the payment account shown on this page.</div>
            <div className="mt-1">Not sure which batch fits? Book the free demo first — pay only once you&apos;re sure.</div>
            <div className="mt-3 text-xs" style={{ color:"#64748b" }}>
              This is the only UPI route we publish. We never send a different UPI ID in a DM.{" "}
              <Link href="/official" style={{ color:"#f0913a" }}>Verify official channels</Link>.
            </div>
            <div className="mt-2 text-xs" style={{ color:"#64748b" }}>
              By paying, you agree to our <Link href="/terms" style={{ color:"#f0913a" }}>Terms</Link> and{" "}
              <Link href="/refund-policy" style={{ color:"#f0913a" }}>Refund &amp; Cancellation Policy</Link>.
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl p-10" style={{ background:"rgba(17,24,32,0.95)", border:"1px solid rgba(243,200,137,0.2)" }}>
          <h2 className="text-2xl font-black text-white mb-8 text-center">How Joining Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            {[
              ["1", "Book a free demo", "Message the Captain on WhatsApp with your subject and exam month."],
              ["2", "Attend the demo live", "See how he teaches. No fee, no recording, no obligation."],
              ["3", "Pay the fee", "If you want to enroll, pay by UPI after the demo."],
              ["4", "Join the batch live", "Your seat is confirmed when payment is received. Join on Google Meet."],
            ].map(([n, title, desc]) => (
              <div key={n}>
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-lg font-black"
                     style={{ background:"linear-gradient(135deg,#c25a1e,#c25a1e)", color:"#fff" }}>{n}</div>
                <div className="font-bold text-white mb-1">{title}</div>
                <div className="text-sm leading-relaxed" style={{ color:"#64748b" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ AI SELF-STUDY CROSS-SELL ══════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between"
             style={{ background:"linear-gradient(135deg, rgba(56,189,248,0.1), rgba(17,24,32,0.97))", border:"1px solid rgba(56,189,248,0.3)" }}>
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase mb-2" style={{ color:"#38bdf8" }}>
              <Sparkles className="w-4 h-4" /> Not ready for a live batch?
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Start with Gini, the AI study partner.</h2>
            <p className="text-sm leading-relaxed max-w-2xl" style={{ color:"#94a3b8" }}>
              A study system around the free library, with a partner who answers from the Captain&apos;s notes and
              cites the chapter. No live classes, no recordings. For the student who needs a plan at 2 a.m.
            </p>
          </div>
          <Link href="/ai-self-study"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black no-underline shrink-0"
                style={{ background:"linear-gradient(135deg,#0ea5e9,#2563eb)", color:"#fff" }}>
            Explore AI Self-Study <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ══════════ WHY LIVE / FAQ ══════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-white mb-3">Why Learn <span style={{ color:"#f3c889" }}>Live</span> With The Author?</h2>
          <p className="max-w-2xl mx-auto leading-relaxed" style={{ color:"#94a3b8" }}>
            This entire website — the notes, the verified question bank, the books — was built by one instructor.
            The live classes are where he teaches you personally: exam strategy, doubt-clearing, the tricks that
            never fit inside notes. Free material gets you started. The Captain gets you through.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {FAQ.map(f => (
            <div key={f.q} className="p-6 rounded-2xl" style={{ background:"rgba(17,24,32,0.95)", border:"1px solid rgba(243,200,137,0.15)" }}>
              <div className="flex items-start gap-2 font-bold text-white mb-2">
                <Target className="w-4 h-4 mt-1 shrink-0" style={{ color:"#c25a1e" }}/> {f.q}
              </div>
              <p className="text-sm leading-relaxed" style={{ color:"#94a3b8" }}>{f.a}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="rounded-3xl p-12 text-center relative overflow-hidden"
             style={{ background:"linear-gradient(135deg,rgba(255,30,30,0.08),rgba(194,90,30,0.08))", border:"1px solid rgba(255,60,60,0.3)" }}>
          <div className="text-4xl mb-3">🛫</div>
          <h2 className="text-3xl font-black text-white mb-3">Seats Are Limited. Doubts Are Not.</h2>
          <p className="mb-3 max-w-xl mx-auto font-bold" style={{ color:"#f3c889" }}>
            Founding batch of 10 — free demo first. When it fills, the next batch is announced on WhatsApp/Telegram.
          </p>
          <p className="mb-8 max-w-xl mx-auto" style={{ color:"#94a3b8" }}>
            {PRICE} per subject (list {LIST_PRICE}), or {COMBO_PRICE} for the full Navigation combo.
            Book a free demo with the Captain. If you want to enroll afterwards, pay the fee by UPI.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={liveDemoLink("DGCA Ground Classes")} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-black no-underline transition-transform hover:-translate-y-0.5"
               style={{ background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"#fff", boxShadow:"0 0 30px rgba(34,197,94,0.4)" }}>
              <MessageCircle className="w-5 h-5" /> Book a free demo
            </a>
            <a href="#pay"
               className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
               style={{ border:"1px solid rgba(34,197,94,0.5)", color:"#22c55e", background:"rgba(34,197,94,0.08)" }}>
              <QrCode className="w-5 h-5" /> See UPI details
            </a>
            <Link href="/cpl" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
                  style={{ border:"1px solid rgba(243,200,137,0.4)", color:"#f3c889", background:"rgba(243,200,137,0.06)" }}>
              Explore Free Material First <ArrowRight className="w-5 h-5"/>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
