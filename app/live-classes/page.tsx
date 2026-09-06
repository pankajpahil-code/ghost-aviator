import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle, MessageCircle, Mail, Radio, Users, Award, BookOpen, Target, ShieldCheck, Layers, CreditCard } from "lucide-react";
import { SITE_URL } from "@/lib/site";

import {
  LIVE_EMAIL as EMAIL,
  LIVE_PRICE as PRICE,
  LIVE_LIST_PRICE as LIST_PRICE,
  LIVE_COMBO_PRICE as COMBO_PRICE,
  LIVE_COMBO_LIST_PRICE as COMBO_LIST_PRICE,
  LIVE_PRICE_VALUE,
  liveWaLink as waLink,
  hasLivePaymentLink,
  hasLiveComboPaymentLink,
  liveEnrollLink,
  liveComboEnrollLink,
} from "@/lib/live-classes";

export const metadata: Metadata = {
  title: "Live DGCA Ground Classes Online — Meteorology, Air Regulations & Navigation | Ghost Aviator",
  description:
    `Live online DGCA CPL ground classes taught personally by Capt. Pankaj Pahil — pilot, flight & ground instructor and author. Meteorology, Air Regulations, Gen Navigation, Radio Navigation & Instrumentation. ${PRICE} per subject (list ${LIST_PRICE}), or ${COMBO_PRICE} for the full Navigation combo. Only 10 seats each.`,
  keywords: [
    "DGCA ground classes online", "DGCA pilot course", "CPL coaching online", "DGCA Air Regulations classes",
    "DGCA Meteorology classes", "DGCA Navigation classes", "DGCA Radio Navigation classes",
    "DGCA Instrumentation classes", "pilot training India", "CPL exam coaching", "aviation ground school India",
  ],
  alternates: { canonical: "/live-classes" },
  openGraph: {
    title: "Live DGCA Ground Classes with Capt. Pankaj Pahil",
    description: `5 subjects, live online, batches of 10. ${PRICE} per subject, down from ${LIST_PRICE}. Learn from the captain himself.`,
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
    a: "Every class is taught live by Capt. Pankaj Pahil himself — pilot, DGCA flight & ground instructor with 20+ years in aviation, and author of two aviation books. No junior tutors, no recordings sold as classes.",
  },
  {
    q: "How are the classes conducted?",
    a: "Live online (Google Meet), in small batches of maximum 10 students so every doubt gets answered. Sessions run 4–6 weeks per subject with practice questions after every topic.",
  },
  {
    q: "What is the founding-batch price?",
    a: `${PRICE} per subject, down from ${LIST_PRICE} — far below typical institute fees, and taught by the Captain himself rather than a hired faculty member. The Navigation combo (Gen Nav + Radio Nav + Instrumentation) is ${COMBO_PRICE} instead of ${COMBO_LIST_PRICE} for all three. Ten seats per batch, so every question gets answered.`,
  },
  {
    q: "Is there a Navigation combo?",
    a: `Yes — General Navigation + Radio Navigation + Instrumentation together cover the composite DGCA Navigation paper. The combo is ${COMBO_PRICE} for all three.`,
  },
  {
    q: "Who can join?",
    a: "CPL/ATPL aspirants preparing for DGCA written exams, students at flying schools, and anyone retaking a subject. The free study material on this site remains free for everyone, always.",
  },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    ...SUBJECTS.map(s => ({
      "@type": "Course",
      name: `DGCA CPL ${s.name} — Live Online Ground Classes`,
      description: `Live online DGCA ${s.name} classes taught by Capt. Pankaj Pahil. Small batch of 10, 4–6 weeks.`,
      provider: { "@id": `${SITE_URL}/#org` },
      offers: { "@type": "Offer", price: LIVE_PRICE_VALUE, priceCurrency: "INR", availability: "https://schema.org/InStock" },
      hasCourseInstance: {
        "@type": "CourseInstance",
        courseMode: "Online",
        courseWorkload: "PT6H",
        instructor: { "@type": "Person", name: "Capt. Pankaj Pahil" },
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
            <Radio className="w-4 h-4 animate-pulse" /> LIVE ONLINE BATCHES · ADMISSIONS OPEN
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-4">
            Learn From <span style={{ background:"linear-gradient(135deg,#ff6000,#c25a1e,#f0913a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>The Captain</span> Himself
          </h1>
          <p className="text-lg max-w-3xl mx-auto mb-3 leading-relaxed" style={{ color:"#94a3b8" }}>
            Live DGCA CPL ground classes in <strong className="text-white">five subjects</strong> —
            taught personally by <strong style={{ color:"#f3c889" }}>Capt. Pankaj Pahil</strong>, the instructor and author behind Ghost Aviator.
          </p>
          <p className="text-sm font-bold tracking-widest uppercase mb-4" style={{ color:"rgba(243,200,137,0.6)", letterSpacing:"0.18em" }}>
            Small batch of 10 · Live doubt-clearing · 4–6 weeks per subject
          </p>
          <p className="text-base font-black mb-10">
            <span className="line-through mr-2" style={{ color:"#64748b" }}>{LIST_PRICE}</span>
            <span style={{ color:"#22c55e" }}>{PRICE} per subject</span>
            <span className="ml-2 px-2 py-0.5 rounded text-xs" style={{ background:"rgba(34,197,94,0.15)", color:"#22c55e", border:"1px solid rgba(34,197,94,0.35)" }}>NAVIGATION COMBO {COMBO_LIST_PRICE} → {COMBO_PRICE}</span>
          </p>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
            <a href={liveEnrollLink("general", "DGCA Ground Classes", PRICE)} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
               style={{ background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"#fff", boxShadow:"0 0 30px rgba(34,197,94,0.4)" }}>
              {hasLivePaymentLink("general") ? <CreditCard className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
              {hasLivePaymentLink("general") ? "Enroll & Pay Online" : "Enquire on WhatsApp"}
            </a>
            {hasLivePaymentLink("general") ? (
              <a href={waLink("DGCA ground classes", PRICE)} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
                 style={{ border:"1px solid rgba(34,197,94,0.5)", color:"#22c55e", background:"rgba(34,197,94,0.08)" }}>
                <MessageCircle className="w-5 h-5" /> Message on WhatsApp
              </a>
            ) : null}
            <a href={`mailto:${EMAIL}?subject=${encodeURIComponent("Live DGCA Classes — Seat Enquiry")}`}
               className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
               style={{ border:"1px solid rgba(240,145,58,0.5)", color:"#f0913a", background:"rgba(240,145,58,0.06)" }}>
              <Mail className="w-5 h-5" /> Email Instead
            </a>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap justify-center lg:justify-start gap-6">
            {[
              [Award, "20+ years in aviation"],
              [BookOpen, "Author of 2 aviation books"],
              [Users, "Flight & ground instructor"],
              [ShieldCheck, "Creator of Ghost Aviator"],
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
            <Image src="/captain-teaching.webp" alt="Capt. Pahil teaching navigation at a constellation chalkboard" fill priority sizes="460px"
                   className="object-cover"
                   style={{
                     maskImage: "radial-gradient(ellipse 66% 60% at 51% 50%, black 40%, transparent 83%)",
                     WebkitMaskImage: "radial-gradient(ellipse 66% 60% at 51% 50%, black 40%, transparent 83%)",
                   }} />
          </div>
         </div>
        </div>
      </section>

      {/* ══════════ SUBJECT BATCHES ══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Choose Your <span style={{ background:"linear-gradient(135deg,#f3c889,#c25a1e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Battle</span></h2>
          <p style={{ color:"#64748b" }}>Five subjects. Five live batches. One instructor who has taught them for two decades.</p>
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
                <a href={liveEnrollLink(s.key, s.name, PRICE)} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black no-underline transition-transform hover:-translate-y-0.5"
                   style={{ background:`linear-gradient(135deg, ${s.color}, ${s.color}dd)`, color:"#fff", boxShadow:`0 4px 16px ${s.color}35` }}>
                  {hasLivePaymentLink(s.key) ? <CreditCard className="w-4 h-4"/> : <MessageCircle className="w-4 h-4"/>}
                  {hasLivePaymentLink(s.key) ? `Enroll & Pay Online (${PRICE})` : `Enquire on WhatsApp (${PRICE})`}
                </a>
                {hasLivePaymentLink(s.key) ? (
                  <a href={waLink(s.name, PRICE)} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold no-underline"
                     style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${s.color}40`, color:"#94a3b8" }}>
                    <MessageCircle className="w-3.5 h-3.5" style={{ color:"#22c55e" }}/> Chat on WhatsApp
                  </a>
                ) : null}
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
                `Save ${"₹1,000"} vs joining the three founding batches separately`,
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
              <a href={liveComboEnrollLink()} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black no-underline transition-transform hover:-translate-y-0.5"
                 style={{ background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"#fff", boxShadow:"0 0 25px rgba(34,197,94,0.4)" }}>
                {hasLiveComboPaymentLink() ? <CreditCard className="w-4 h-4"/> : <MessageCircle className="w-4 h-4"/>}
                {hasLiveComboPaymentLink() ? `Enroll in Combo Online (${COMBO_PRICE})` : `Enquire on WhatsApp (${COMBO_PRICE})`}
              </a>
              {hasLiveComboPaymentLink() ? (
                <a href={waLink("Navigation Combo (Gen Nav + Radio Nav + Instrumentation)", COMBO_PRICE)} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold no-underline"
                   style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(34,197,94,0.4)", color:"#94a3b8" }}>
                  <MessageCircle className="w-3.5 h-3.5" style={{ color:"#22c55e" }}/> WhatsApp Inquiry
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl p-10" style={{ background:"rgba(17,24,32,0.95)", border:"1px solid rgba(243,200,137,0.2)" }}>
          <h2 className="text-2xl font-black text-white mb-8 text-center">How Joining Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              ["1", "Message on WhatsApp", "Tell Capt. Pahil which subject you want — he replies personally."],
              ["2", "Reserve your seat", "Confirm your slot in the founding batch of 10. Pay by UPI only after you're sure."],
              ["3", "Fly the syllabus live", "Join on Google Meet, ask anything, practise real exam questions together."],
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
          <p className="mb-8 max-w-xl mx-auto" style={{ color:"#94a3b8" }}>
            Ten students per batch — so every question gets answered. {PRICE} per subject (list {LIST_PRICE}),
            or {COMBO_PRICE} for the full Navigation combo. Message now and Capt. Pahil will personally tell you when your
            subject&apos;s batch begins.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={liveEnrollLink("general", "DGCA Ground Classes", PRICE)} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-black no-underline transition-transform hover:-translate-y-0.5"
               style={{ background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"#fff", boxShadow:"0 0 30px rgba(34,197,94,0.4)" }}>
              {hasLivePaymentLink("general") ? <CreditCard className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
              {hasLivePaymentLink("general") ? `Enroll & Pay Online (${PRICE})` : `Enquire on WhatsApp (${PRICE})`}
            </a>
            {hasLivePaymentLink("general") ? (
              <a href={waLink("DGCA ground classes", PRICE)} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
                 style={{ border:"1px solid rgba(34,197,94,0.5)", color:"#22c55e", background:"rgba(34,197,94,0.08)" }}>
                <MessageCircle className="w-5 h-5" /> WhatsApp: +91 99902 26607
              </a>
            ) : null}
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
