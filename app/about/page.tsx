import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Award, BookOpen, Users, ShieldCheck, MessageCircle, ArrowRight, Radio, GraduationCap, Heart } from "lucide-react";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import { ALL_QUESTIONS } from "@/lib/questions";
import { TESTIMONIALS } from "@/lib/testimonials";
import { LIVE_WHATSAPP, LIVE_PRICE } from "@/lib/live-classes";
import { SITE_URL, CAPTAIN_PROFILES, TELEGRAM_GROUP, PERSON_ID, ORG_ID, CAPTAIN_KNOWS_ABOUT } from "@/lib/site";

// Real photographs of the Captain, prepared by tools/prepare-captain-photo.mjs
// and committed alongside this file.
//
// These were briefly resolved with fs.existsSync so a missing file could not
// ship a broken image. That check cost two failed deployments: touching the
// filesystem pulls this page out of static generation into a server function,
// and Next then traces public/ — the whole notes tree — into the bundle, which
// came to 662 MB against Vercel's 250 MB limit. The page is static again, and
// these are plain constants. If either file is ever removed, the build fails
// loudly at next/image instead, which is the better failure anyway.
const BANNER = "/captain-banner.webp";
const PORTRAIT = "/captain-real.webp";

const SUBJECT_COUNT = CPL_SUBJECTS.length + ATPL_SUBJECTS.length;
const CHAPTER_COUNT = [...CPL_SUBJECTS, ...ATPL_SUBJECTS].reduce((n, s) => n + s.chapters.length, 0);
const QUESTION_COUNT = `${Math.floor(ALL_QUESTIONS.length / 100) * 100}+`;

const TELEGRAM = TELEGRAM_GROUP;
const WA_SHARE = `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
  "Hello Capt. Pahil, I cleared my DGCA exam using Ghost Aviator! Here is my result and testimonial:"
)}`;
const WA_CLASSES = `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
  "Hello Capt. Pahil, I want to know more about your live DGCA classes."
)}`;

export const metadata: Metadata = {
  title: "Meet Capt. Pankaj Pahil — Pilot, Instructor & Creator of Ghost Aviator",
  description:
    "Capt. Pankaj Pahil is a pilot, DGCA flight & ground instructor with 20+ years in aviation, author of two aviation books, and the creator of Ghost Aviator — free DGCA exam preparation for every student pilot in India.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Meet Capt. Pankaj Pahil — The Captain Behind Ghost Aviator",
    description: "Pilot, DGCA flight & ground instructor, author of two aviation books. Free DGCA prep for every student pilot.",
    url: `${SITE_URL}/about`,
    type: "profile",
  },
};

// This is the canonical description of the Captain for the whole site. Every
// other page references it by @id (see lib/site.ts) instead of restating his
// name, so the entity consolidates rather than fragmenting.
const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: "Capt. Pankaj Pahil",
  url: `${SITE_URL}/about`,
  image: `${SITE_URL}${PORTRAIT}`,
  jobTitle: "Pilot, DGCA Flight & Ground Instructor",
  description:
    "Pilot and DGCA flight & ground instructor with 20+ years in aviation. Author of 'Technical General for Aviators' and 'Complete RTR(A) Examination Book'. Creator of Ghost Aviator, a free DGCA exam preparation platform.",
  sameAs: CAPTAIN_PROFILES,
  knowsAbout: CAPTAIN_KNOWS_ABOUT,
  worksFor: { "@id": ORG_ID },
};

const CREDENTIALS: [typeof Award, string, string][] = [
  [Award,        "20+ years in aviation",          "Pilot with two decades of flying and instructing"],
  [GraduationCap,"DGCA flight & ground instructor","Teaching the syllabus he has flown and examined"],
  [BookOpen,     "Author of 2 aviation books",     "Technical General for Aviators · Complete RTR(A) Examination Book"],
  [ShieldCheck,  "Creator of Ghost Aviator",       "Every note and verified question on this site"],
];

export default function AboutPage() {
  return (
    <div style={{ background: "#0b1117" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />

      {/* ══ BANNER ══
          A band ABOVE the hero, not behind it. Behind was tried first and was
          wrong twice over: the heading and the portrait circle both landed on
          top of his face, and the crop sliced his chin. As its own band nothing
          overlaps him, the whole apron scene reads, and only the bottom edge
          fades into the page. objectPosition 50% 66% is measured, not guessed —
          it is the window that holds the aircraft AND his full head. */}
      <div className="relative w-full h-[320px] sm:h-[440px] lg:h-[600px]">
        <Image src={BANNER} alt="Capt. Pankaj Pahil on the apron" fill priority sizes="100vw"
               className="object-cover" style={{ objectPosition: "50% 66%" }} />
        <div className="absolute inset-0" style={{
          background:
            "linear-gradient(to bottom, rgba(11,17,23,0.10) 0%, rgba(11,17,23,0.20) 60%, rgba(11,17,23,0.80) 88%, #0b1117 100%)",
        }} />
      </div>

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% -20%, rgba(194,90,30,0.13), transparent 60%)",
        }}/>
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 pt-10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative w-44 h-44 rounded-full overflow-hidden flex-shrink-0"
                 style={{ border: "2px solid rgba(240,145,58,0.4)", boxShadow: "0 0 40px rgba(240,145,58,0.22)" }}>
              <Image src={PORTRAIT} alt="Capt. Pankaj Pahil" fill priority sizes="176px"
                     className="object-cover" style={{ objectPosition: "50% 50%" }} />
            </div>
            <div className="text-center md:text-left">
              <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "#f3c889", letterSpacing: "0.2em" }}>
                The Captain Behind Ghost Aviator
              </div>
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Capt. Pankaj Pahil</h1>
              <p className="text-lg leading-relaxed max-w-xl" style={{ color: "#94a3b8" }}>
                Pilot. DGCA flight &amp; ground instructor. Author.
                For over two decades he has flown the theory that students struggle with —
                and now he teaches it, free, to every student pilot in India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CREDENTIALS ══ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CREDENTIALS.map(([Icon, title, desc]) => (
            <div key={title} className="p-6 rounded-2xl"
                 style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(243,200,137,0.18)" }}>
              <Icon className="w-6 h-6 mb-3" style={{ color: "#f3c889" }} />
              <div className="font-bold text-white text-sm mb-1">{title}</div>
              <div className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ THE MISSION ══ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="rounded-3xl p-10" style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(240,145,58,0.2)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5" style={{ color: "#c25a1e" }} />
            <h2 className="text-2xl font-black text-white">Why Ghost Aviator Exists</h2>
          </div>
          <div className="flex flex-col gap-4 text-[15px] leading-relaxed" style={{ color: "#94a3b8" }}>
            <p>
              Quality DGCA ground training in India can cost lakhs of rupees — and a wrong answer
              memorised from an unverified question bank can cost a student an attempt. Capt. Pahil
              built Ghost Aviator to fix both: <strong className="text-white">exam-grade study material,
              verified against authoritative references, free for every student pilot.</strong>
            </p>
            <p>
              Every chapter of notes, every diagram and every question on this site was prepared and
              checked under one instructor&apos;s supervision — the same standard he would demand
              before sending a student into the exam hall. The self-study material is his service to
              Indian aviation and will stay free, always. Students who want to go deeper can join his{" "}
              <Link href="/live-classes" className="font-bold" style={{ color: "#ff5a5a" }}>live classes</Link>,
              where he teaches personally.
            </p>
          </div>

          {/* Site stats — derived from data */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              [`${SUBJECT_COUNT}`, "Subjects"],
              [`${CHAPTER_COUNT}`, "Chapters"],
              [QUESTION_COUNT, "Practice Questions"],
            ].map(([v, l]) => (
              <div key={l} className="p-4 rounded-xl text-center"
                   style={{ background: "rgba(240,145,58,0.06)", border: "1px solid rgba(240,145,58,0.15)" }}>
                <div className="text-2xl font-black" style={{ color: "#f0913a" }}>{v}</div>
                <div className="text-xs" style={{ color: "#475569" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BOOKS ══ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <h2 className="text-2xl font-black text-white mb-6 text-center">Books by the Captain</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ["📘", "Technical General for Aviators", "The complete DGCA Technical General syllabus in one book — now published chapter-by-chapter on this site."],
            ["📡", "Complete RTR(A) Examination Book", "24 chapters covering the full RTR(A) syllabus — radio telephony from rule-makers to exam arsenal."],
          ].map(([icon, title, desc]) => (
            <Link key={title} href="/books" className="p-6 rounded-2xl no-underline flex gap-4 items-start"
                  style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(251,191,36,0.25)" }}>
              <span className="text-3xl">{icon}</span>
              <div>
                <div className="font-bold text-white mb-1">{title}</div>
                <div className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{desc}</div>
                <div className="text-xs font-bold mt-2 inline-flex items-center gap-1" style={{ color: "#fbbf24" }}>
                  Read free on Ghost Aviator <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <h2 className="text-2xl font-black text-white mb-6 text-center">What Students Say</h2>
        {TESTIMONIALS.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TESTIMONIALS.map(t => (
              <div key={`${t.name}-${t.quote.slice(0, 20)}`} className="p-6 rounded-2xl flex flex-col"
                   style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: "#94a3b8" }}>&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="font-bold text-white text-sm">{t.name}</div>
                  {t.detail && <div className="text-xs" style={{ color: "#22c55e" }}>{t.detail}</div>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl p-10 text-center"
               style={{ background: "rgba(17,24,32,0.95)", border: "1px dashed rgba(34,197,94,0.35)" }}>
            <div className="text-4xl mb-3">🏆</div>
            <div className="text-lg font-black text-white mb-2">Cleared your exam with Ghost Aviator?</div>
            <p className="text-sm max-w-md mx-auto mb-6" style={{ color: "#64748b" }}>
              Your result can guide the next student pilot. Share your score and a few words —
              become one of our founding testimonials.
            </p>
            <a href={WA_SHARE} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black no-underline"
               style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff" }}>
              <MessageCircle className="w-4 h-4" /> Share Your Result
            </a>
          </div>
        )}
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl p-12 text-center"
             style={{ background: "linear-gradient(135deg,rgba(255,30,30,0.08),rgba(194,90,30,0.08))", border: "1px solid rgba(255,60,60,0.3)" }}>
          <h2 className="text-3xl font-black text-white mb-3">Learn Directly From the Captain</h2>
          <p className="mb-8 max-w-xl mx-auto" style={{ color: "#94a3b8" }}>
            Live online batches of 10 — five DGCA subjects, {LIVE_PRICE} per subject.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/live-classes"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-black no-underline"
                  style={{ background: "linear-gradient(135deg,#c25a1e,#c25a1e)", color: "#fff" }}>
              <Radio className="w-5 h-5" /> See Live Classes
            </Link>
            <a href={WA_CLASSES} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
               style={{ border: "1px solid rgba(34,197,94,0.5)", color: "#22c55e", background: "rgba(34,197,94,0.06)" }}>
              <MessageCircle className="w-5 h-5" /> WhatsApp the Captain
            </a>
            <a href={TELEGRAM} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
               style={{ border: "1px solid rgba(240,145,58,0.5)", color: "#f0913a", background: "rgba(240,145,58,0.06)" }}>
              <Users className="w-5 h-5" /> Join the Community
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
