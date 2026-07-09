import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, MessageCircle, Mail, Radio, Users, Award, BookOpen, Target, ShieldCheck } from "lucide-react";
import { SITE_URL } from "@/lib/site";

const WHATSAPP = "919990226607";
const EMAIL = "pankaj.pahil@gmail.com";
const FEE = "₹2,499";

const waLink = (subject: string) =>
  `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(
    `Hello Capt. Pahil, I want to join the live ${subject} batch (${FEE}). Please share the details.`
  )}`;

export const metadata: Metadata = {
  title: "Live DGCA Ground Classes Online — Air Regulations, Meteorology & Air Navigation | Ghost Aviator",
  description:
    "Join live online DGCA CPL ground classes taught personally by Capt. Pankaj Pahil — pilot, flight & ground instructor and author. Small batches of 10, Air Regulations, Aviation Meteorology and Air Navigation, ₹2,499 per subject. Admissions open.",
  keywords: [
    "DGCA ground classes online", "DGCA pilot course", "CPL coaching online", "DGCA Air Regulations classes",
    "DGCA Meteorology classes", "DGCA Air Navigation classes", "pilot training India", "CPL exam coaching",
    "DGCA online classes", "aviation ground school India",
  ],
  alternates: { canonical: "/live-classes" },
  openGraph: {
    title: "Live DGCA Ground Classes with Capt. Pankaj Pahil",
    description: "Air Regulations · Meteorology · Air Navigation — live online, small batch of 10, ₹2,499 per subject. Learn from the captain himself.",
    url: `${SITE_URL}/live-classes`,
    type: "website",
  },
};

const SUBJECTS = [
  {
    name: "Air Regulations",
    icon: "⚖️",
    color: "#7c3aed",
    tagline: "The rule book, decoded by someone who has lived it",
    points: [
      "ICAO Annexes & Chicago Convention made simple",
      "Indian CARs, Aircraft Act & Rules — exam-focused",
      "Licensing, airspace, ATC procedures & SAR",
      "Solved past papers & most-repeated questions",
    ],
  },
  {
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
    name: "Air Navigation",
    icon: "🗺️",
    color: "#10b981",
    tagline: "The subject students fear most — conquered",
    points: [
      "Charts, compasses & the 1-in-60 rule mastered",
      "Numericals solved live, method by method",
      "Instruments, GNSS & radio navigation aids",
      "Speed math tricks for the actual exam",
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
    q: "What is the fee?",
    a: `${FEE} per subject batch — a fraction of typical institute fees. Pay only after you speak with Capt. Pahil on WhatsApp and confirm your seat.`,
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
      offers: { "@type": "Offer", price: "2499", priceCurrency: "INR", availability: "https://schema.org/InStock" },
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

export default function LiveClassesPage() {
  return (
    <div style={{ background: "#06040e" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(120,60,220,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(120,60,220,0.05) 1px,transparent 1px)",
          backgroundSize: "55px 55px",
        }}/>
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% -20%, rgba(255,40,40,0.14), transparent 60%)",
        }}/>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-black mb-6"
               style={{ background:"rgba(255,40,40,0.12)", border:"1px solid rgba(255,60,60,0.45)", color:"#ff5a5a" }}>
            <Radio className="w-4 h-4 animate-pulse" /> LIVE ONLINE BATCHES · ADMISSIONS OPEN
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight mb-4">
            Learn From <span style={{ background:"linear-gradient(135deg,#ff6000,#ff2060,#c020ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>The Captain</span> Himself
          </h1>
          <p className="text-lg max-w-2xl mx-auto mb-3 leading-relaxed" style={{ color:"#94a3b8" }}>
            Live DGCA CPL ground classes — <strong className="text-white">Air Regulations, Aviation Meteorology &amp; Air Navigation</strong> —
            taught personally by <strong style={{ color:"#c080ff" }}>Capt. Pankaj Pahil</strong>, the instructor and author behind Ghost Aviator.
          </p>
          <p className="text-sm font-bold tracking-widest uppercase mb-10" style={{ color:"rgba(180,120,255,0.6)", letterSpacing:"0.18em" }}>
            Small batch of 10 · Live doubt-clearing · {FEE} per subject
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <a href={waLink("DGCA ground classes")} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-black no-underline"
               style={{ background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"#fff", boxShadow:"0 0 30px rgba(34,197,94,0.4)" }}>
              <MessageCircle className="w-5 h-5" /> Message Capt. Pahil on WhatsApp
            </a>
            <a href={`mailto:${EMAIL}?subject=${encodeURIComponent("Live DGCA Classes — Seat Enquiry")}`}
               className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
               style={{ border:"1px solid rgba(0,212,255,0.5)", color:"#00d4ff", background:"rgba(0,212,255,0.06)" }}>
              <Mail className="w-5 h-5" /> Email Instead
            </a>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap justify-center gap-6">
            {[
              [Award, "20+ years in aviation"],
              [BookOpen, "Author of 2 aviation books"],
              [Users, "Flight & ground instructor"],
              [ShieldCheck, "Creator of Ghost Aviator"],
            ].map(([Icon, label]) => {
              const I = Icon as typeof Award;
              return (
                <div key={label as string} className="flex items-center gap-2 text-sm" style={{ color:"#94a3b8" }}>
                  <I className="w-4 h-4" style={{ color:"#c080ff" }}/> {label as string}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ SUBJECT BATCHES ══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">Choose Your <span style={{ background:"linear-gradient(135deg,#c080ff,#ff2060)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Battle</span></h2>
          <p style={{ color:"#64748b" }}>Three subjects. Three live batches. One instructor who has taught them for two decades.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SUBJECTS.map(s => (
            <div key={s.name} className="relative rounded-3xl overflow-hidden p-8 flex flex-col"
                 style={{ background:"rgba(15,8,30,0.95)", border:`1px solid ${s.color}45` }}>
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
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-2xl font-black text-white">{FEE}</div>
                  <div className="text-xs" style={{ color:"#475569" }}>per batch · 4–6 weeks</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black" style={{ color: s.color }}>Batch of 10</div>
                  <div className="text-xs" style={{ color:"#475569" }}>live · online</div>
                </div>
              </div>
              <a href={waLink(s.name)} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black no-underline"
                 style={{ background:`${s.color}20`, border:`1px solid ${s.color}60`, color:"#fff" }}>
                <MessageCircle className="w-4 h-4" style={{ color:"#22c55e" }}/> Reserve My Seat
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl p-10" style={{ background:"rgba(15,8,30,0.95)", border:"1px solid rgba(180,100,255,0.2)" }}>
          <h2 className="text-2xl font-black text-white mb-8 text-center">Joining Takes Two Minutes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              ["1", "Message on WhatsApp", "Tell Capt. Pahil which subject you want — he replies personally."],
              ["2", "Reserve your seat", "Confirm your slot in the next batch of 10. Pay by UPI only after you're sure."],
              ["3", "Fly the syllabus live", "Join on Google Meet, ask anything, practise real exam questions together."],
            ].map(([n, title, desc]) => (
              <div key={n}>
                <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-lg font-black"
                     style={{ background:"linear-gradient(135deg,#9020ff,#ff2060)", color:"#fff" }}>{n}</div>
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
          <h2 className="text-3xl font-black text-white mb-3">Why Learn <span style={{ color:"#c080ff" }}>Live</span> With The Author?</h2>
          <p className="max-w-2xl mx-auto leading-relaxed" style={{ color:"#94a3b8" }}>
            This entire website — the notes, the verified question bank, the books — was built by one instructor.
            The live classes are where he teaches you personally: exam strategy, doubt-clearing, the tricks that
            never fit inside notes. Free material gets you started. The Captain gets you through.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
          {FAQ.map(f => (
            <div key={f.q} className="p-6 rounded-2xl" style={{ background:"rgba(15,8,30,0.95)", border:"1px solid rgba(180,100,255,0.15)" }}>
              <div className="flex items-start gap-2 font-bold text-white mb-2">
                <Target className="w-4 h-4 mt-1 shrink-0" style={{ color:"#ff2060" }}/> {f.q}
              </div>
              <p className="text-sm leading-relaxed" style={{ color:"#94a3b8" }}>{f.a}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="rounded-3xl p-12 text-center relative overflow-hidden"
             style={{ background:"linear-gradient(135deg,rgba(255,30,30,0.08),rgba(150,0,255,0.08))", border:"1px solid rgba(255,60,60,0.3)" }}>
          <div className="text-4xl mb-3">🛫</div>
          <h2 className="text-3xl font-black text-white mb-3">Seats Are Limited. Doubts Are Not.</h2>
          <p className="mb-8 max-w-xl mx-auto" style={{ color:"#94a3b8" }}>
            Ten students per batch — so every question gets answered. Message now, and Capt. Pahil will
            personally tell you when your subject&apos;s next batch begins.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={waLink("DGCA ground classes")} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-black no-underline"
               style={{ background:"linear-gradient(135deg,#16a34a,#22c55e)", color:"#fff", boxShadow:"0 0 30px rgba(34,197,94,0.4)" }}>
              <MessageCircle className="w-5 h-5" /> WhatsApp: +91 99902 26607
            </a>
            <Link href="/cpl" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
                  style={{ border:"1px solid rgba(180,100,255,0.4)", color:"#c080ff", background:"rgba(180,100,255,0.06)" }}>
              Explore Free Material First <ArrowRight className="w-5 h-5"/>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
