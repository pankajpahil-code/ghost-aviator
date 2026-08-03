import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, CheckCircle, BookOpen, ClipboardList, FileText, Video, Headphones, BarChart3, Zap } from "lucide-react";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import { ALL_QUESTIONS } from "@/lib/questions";
import MascotHero from "./components/MascotHero";

export const metadata: Metadata = {
  alternates: { canonical: "/" }
};

const CPL_CHAPTERS  = CPL_SUBJECTS.reduce((n, s) => n + s.chapters.length, 0);
const ATPL_CHAPTERS = ATPL_SUBJECTS.reduce((n, s) => n + s.chapters.length, 0);

// Honest marketing counts, derived from the actual question bank (rounded down
// to the nearest 100 so the figure is always defensible).
const SUBJECT_COUNT = CPL_SUBJECTS.length + ATPL_SUBJECTS.length;
const cplIds  = new Set(CPL_SUBJECTS.map(s => s.id));
const atplIds = new Set(ATPL_SUBJECTS.map(s => s.id));
const fmt = (n: number) => `${(Math.floor(n / 100) * 100).toLocaleString("en-IN")}+`;
const TOTAL_Q = fmt(ALL_QUESTIONS.length);
const CPL_Q   = fmt(ALL_QUESTIONS.filter(q => q.subjectIds.some(id => cplIds.has(id))).length);
const ATPL_Q  = fmt(ALL_QUESTIONS.filter(q => q.subjectIds.some(id => atplIds.has(id))).length);

const services = [
  { icon: FileText,      label: "Notes",           desc: "Concise, exam-focused chapter notes" },
  { icon: BarChart3,     label: "Slides",          desc: "Visual slide decks for every chapter" },
  { icon: Video,         label: "Video Lectures",  desc: "Full-length video explanations" },
  { icon: Headphones,    label: "Audio Overview",  desc: "Quick listen before you fly" },
  { icon: BookOpen,      label: "Question Bank",   desc: `${TOTAL_Q} MCQs with explanations` },
  { icon: ClipboardList, label: "Mock Tests",      desc: "Chapter, mid-term & full-length tests" },
];

export default function Home() {
  return (
    <div style={{ background: "#0b1117" }}>

      {/* ══════════════════ HERO ══════════════════
          The mascot plate carries the whole frame now, so the old two-column
          layout (copy left, illustration right) is gone: the artwork IS the
          right-hand side. Copy sits low and left over the darkest part of the
          grade, where the figure and the trident are not competing with it. */}
      <MascotHero>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* Copy sits BELOW the footage now, not over it. Overlaid text fought
              the camera moves — the mascot walks through frame, so any fixed
              headline ends up on top of his face at some point in the loop. */}
          <div className="pb-16 pt-10 sm:pt-12">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold"
                      style={{ background:"rgba(240,145,58,0.12)", border:"1px solid rgba(240,145,58,0.45)", color:"var(--ember-soft)" }}>
                  ✈️ CAPT. PANKAJ PAHIL
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
                      style={{ background:"rgba(207,216,238,0.10)", border:"1px solid rgba(207,216,238,0.30)", color:"var(--bolt)" }}>
                  <Zap className="w-3 h-3" /> INDIA&apos;S #1 DGCA PREP
                </span>
              </div>

              <h1 className="sr-only">Ghost Aviator — DGCA CPL &amp; ATPL Pilot Exam Preparation</h1>
              <div aria-hidden="true">
                <div className="text-5xl sm:text-7xl font-black leading-none tracking-tight mb-1"
                     style={{ color:"#ffffff", textShadow:"0 2px 30px rgba(0,0,0,0.85), 0 0 60px rgba(240,145,58,0.25)" }}>GHOST</div>
                <div className="text-5xl sm:text-7xl font-black leading-none tracking-tight mb-4"
                     style={{ background:"linear-gradient(135deg,#f3c889,#f0913a,#ab794d)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", filter:"drop-shadow(0 2px 18px rgba(0,0,0,0.8))" }}>
                  AVIATOR
                </div>
              </div>
              <p className="text-xs font-bold tracking-widest mb-6 uppercase"
                 style={{ color:"rgba(243,200,137,0.75)", letterSpacing:"0.22em", textShadow:"0 1px 12px rgba(0,0,0,0.9)" }}>
                Legacy of the Skies · The Spirit Beyond the Clouds
              </p>
              <p className="text-base mb-9 max-w-lg leading-relaxed"
                 style={{ color:"#c8d2dc", textShadow:"0 1px 14px rgba(0,0,0,0.9)" }}>
                India&apos;s most complete DGCA exam prep — structured chapter by chapter, exactly like the actual exam.
                <strong style={{ color:"var(--ember-soft)" }}> 100% free to start.</strong>
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/cpl" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-black no-underline"
                      style={{ background:"linear-gradient(135deg,#f0913a,#c25a1e)", color:"#1a1206", boxShadow:"0 0 34px rgba(240,145,58,0.45)" }}>
                  Start CPL Prep <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/atpl" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
                      style={{ border:"1px solid rgba(243,200,137,0.55)", color:"var(--ember-soft)", background:"rgba(11,17,23,0.55)", backdropFilter:"blur(4px)" }}>
                  Start ATPL Prep
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-3 max-w-xl">
                {[[TOTAL_Q,"Questions"],[`${SUBJECT_COUNT}`,"Subjects"],["70%","Pass Mark"],["FREE","Start"]].map(([v,l]) => (
                  <div key={l} className="text-center p-3 rounded-xl"
                       style={{ background:"rgba(11,17,23,0.72)", border:"1px solid rgba(240,145,58,0.22)", backdropFilter:"blur(6px)" }}>
                    <div className="text-xl font-black" style={{ color:"var(--ember-soft)" }}>{v}</div>
                    <div className="text-xs" style={{ color:"#7c8a99" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MascotHero>

      {/* ══════════════════ LIVE CLASSES BANNER ══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <Link href="/live-classes" className="group relative block rounded-3xl overflow-hidden no-underline"
              style={{ border:"1px solid rgba(255,60,60,0.45)", boxShadow:"0 0 40px rgba(255,40,40,0.15)" }}>
          {/* Animated sheen background */}
          <div className="absolute inset-0" style={{ background:"linear-gradient(120deg, rgba(255,30,30,0.14), rgba(194,90,30,0.14) 45%, rgba(240,145,58,0.1))" }}/>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
               style={{ background:"linear-gradient(120deg, rgba(255,30,30,0.22), rgba(194,90,30,0.22) 45%, rgba(240,145,58,0.16))" }}/>

          <div className="relative z-10 px-6 sm:px-10 py-8 flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
            {/* LIVE badge */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background:"#ff3030" }}/>
                <span className="relative inline-flex rounded-full h-4 w-4" style={{ background:"#ff3030", boxShadow:"0 0 12px rgba(255,48,48,0.9)" }}/>
              </span>
              <span className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color:"#ff5a5a" }}>LIVE</span>
            </div>

            {/* Copy */}
            <div className="flex-1 text-center lg:text-left">
              <div className="text-xl sm:text-2xl font-black text-white leading-snug mb-1">
                Learn directly from <span style={{ background:"linear-gradient(135deg,#ff6000,#c25a1e,#f0913a)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Capt. Pankaj Pahil</span> — live online batches
              </div>
              <div className="text-sm font-semibold" style={{ color:"#94a3b8" }}>
                🌤️ Meteorology · ⚖️ Air Regs · 🗺️ Gen Nav · 📡 Radio Nav · 🧭 Instruments &nbsp;—&nbsp;
                batch of 10 · <span className="line-through" style={{ color:"#64748b" }}>₹5,999</span> <strong style={{ color:"#22c55e" }}>₹2,999 founding price</strong>
              </div>
            </div>

            {/* CTA */}
            <div className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-black"
                 style={{ background:"linear-gradient(135deg,#ff3030,#f0913a)", color:"#fff", boxShadow:"0 0 25px rgba(255,40,40,0.4)" }}>
              Admissions Open — Join Now <ArrowRight className="w-4 h-4"/>
            </div>
          </div>
        </Link>
      </section>

      {/* ══════════════════ INSTRUCTOR TEASER ══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link href="/about" className="flex items-center justify-between gap-4 flex-wrap rounded-2xl px-6 py-4 no-underline"
              style={{ background:"rgba(17,24,32,0.95)", border:"1px solid rgba(243,200,137,0.22)" }}>
          <div className="flex items-center gap-3 text-sm" style={{ color:"#94a3b8" }}>
            <span className="text-xl">👨‍✈️</span>
            <span>
              Built and taught by <strong style={{ color:"#f3c889" }}>Capt. Pankaj Pahil</strong> — pilot,
              DGCA flight &amp; ground instructor, 20+ years in aviation, author of two aviation books.
            </span>
          </div>
          <span className="text-sm font-bold whitespace-nowrap" style={{ color:"#f3c889" }}>Meet the Captain →</span>
        </Link>
      </section>

      {/* ══════════════════ CHOOSE YOUR PATH ══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <div className="inline-block text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-5"
               style={{ color:"#f3c889", border:"1px solid rgba(243,200,137,0.35)", background:"rgba(243,200,137,0.08)", letterSpacing:"0.18em" }}>
            WHERE DO YOU WANT TO FLY?
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Choose Your <span style={{ background:"linear-gradient(135deg,#f3c889,#c25a1e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Licence Path</span></h2>
          <p style={{ color:"#64748b" }}>Select your exam goal — we&apos;ll guide you through every chapter.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* CPL Card */}
          <Link href="/cpl" className="group relative rounded-3xl overflow-hidden no-underline block"
                style={{ background:"linear-gradient(135deg,rgba(171,121,77,0.15),rgba(255,32,96,0.1))", border:"1px solid rgba(171,121,77,0.4)" }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ background:"linear-gradient(135deg,rgba(171,121,77,0.25),rgba(255,32,96,0.18))" }}/>
            <div className="relative z-10 p-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="text-xs font-bold tracking-widest mb-3" style={{ color:"rgba(243,200,137,0.7)", letterSpacing:"0.2em" }}>DGCA INDIA</div>
                  <h3 className="text-4xl font-black text-white mb-2">CPL</h3>
                  <p className="text-lg font-semibold" style={{ color:"#f3c889" }}>Commercial Pilot Licence</p>
                </div>
                <div className="text-6xl opacity-80">🛩️</div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[[`${CPL_SUBJECTS.length}`,"Subjects"],[`${CPL_CHAPTERS}`,"Chapters"],[CPL_Q,"Questions"]].map(([v,l]) => (
                  <div key={l} className="p-3 rounded-xl text-center" style={{ background:"rgba(171,121,77,0.15)", border:"1px solid rgba(171,121,77,0.25)" }}>
                    <div className="text-xl font-black text-white">{v}</div>
                    <div className="text-xs" style={{ color:"#ab794d" }}>{l}</div>
                  </div>
                ))}
              </div>
              <ul className="flex flex-col gap-2 mb-8">
                {CPL_SUBJECTS.map(s => s.name).map(s => (
                  <li key={s} className="flex items-center gap-2 text-sm" style={{ color:"#94a3b8" }}>
                    <CheckCircle className="w-4 h-4" style={{ color:"#ab794d" }}/> {s}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 font-black text-lg" style={{ color:"#f3c889" }}>
                Enter CPL Section <ArrowRight className="w-5 h-5"/>
              </div>
            </div>
          </Link>

          {/* ATPL Card */}
          <Link href="/atpl" className="group relative rounded-3xl overflow-hidden no-underline block"
                style={{ background:"linear-gradient(135deg,rgba(240,145,58,0.12),rgba(255,120,0,0.1))", border:"1px solid rgba(240,145,58,0.4)" }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ background:"linear-gradient(135deg,rgba(240,145,58,0.2),rgba(255,120,0,0.15))" }}/>
            <div className="relative z-10 p-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="text-xs font-bold tracking-widest mb-3" style={{ color:"rgba(240,145,58,0.7)", letterSpacing:"0.2em" }}>DGCA INDIA</div>
                  <h3 className="text-4xl font-black text-white mb-2">ATPL</h3>
                  <p className="text-lg font-semibold" style={{ color:"#f0913a" }}>Airline Transport Pilot Licence</p>
                </div>
                <div className="text-6xl opacity-80">✈️</div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[[`${ATPL_SUBJECTS.length}`,"Subjects"],[`${ATPL_CHAPTERS}`,"Chapters"],[ATPL_Q,"Questions"]].map(([v,l]) => (
                  <div key={l} className="p-3 rounded-xl text-center" style={{ background:"rgba(240,145,58,0.1)", border:"1px solid rgba(240,145,58,0.2)" }}>
                    <div className="text-xl font-black text-white">{v}</div>
                    <div className="text-xs" style={{ color:"#f0913a" }}>{l}</div>
                  </div>
                ))}
              </div>
              <ul className="flex flex-col gap-2 mb-8">
                {ATPL_SUBJECTS.map(s => s.name).map(s => (
                  <li key={s} className="flex items-center gap-2 text-sm" style={{ color:"#94a3b8" }}>
                    <CheckCircle className="w-4 h-4" style={{ color:"#f0913a" }}/> {s}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 font-black text-lg" style={{ color:"#f0913a" }}>
                Enter ATPL Section <ArrowRight className="w-5 h-5"/>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ══════════════════ SERVICES ══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <div className="inline-block text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-5"
               style={{ color:"#ff6060", border:"1px solid rgba(255,60,60,0.3)", background:"rgba(255,60,60,0.08)", letterSpacing:"0.18em" }}>
            WHAT&apos;S INSIDE
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Everything Per <span style={{ background:"linear-gradient(135deg,#ff4400,#c25a1e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Chapter</span></h2>
          <p style={{ color:"#64748b" }}>Not just a question bank. A complete structured learning system.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <div key={s.label} className="p-6 rounded-2xl relative overflow-hidden"
                 style={{ background:"rgba(17,24,32,0.95)", border:"1px solid rgba(243,200,137,0.12)" }}>
              <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%", background:`linear-gradient(to bottom, ${["#ab794d","#ff4444","#f0913a","#f59e0b","#10b981","#f3c889"][i]}, transparent)` }}/>
              <s.icon className="w-8 h-8 mb-4" style={{ color:["#ab794d","#ff4444","#f0913a","#f59e0b","#10b981","#f3c889"][i] }}/>
              <h3 className="font-bold text-white mb-1">{s.label}</h3>
              <p className="text-sm" style={{ color:"#64748b" }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Progress path visual */}
        <div className="mt-16 p-8 rounded-3xl" style={{ background:"rgba(17,24,32,0.95)", border:"1px solid rgba(243,200,137,0.2)" }}>
          <h3 className="text-xl font-black text-white mb-6 text-center">Your Learning Journey</h3>
          <div className="flex flex-wrap justify-center items-center gap-2">
            {[
              { label:"Chapter Study",   icon:"📚", color:"#ab794d" },
              { label:"→",              icon:"",   color:"#475569" },
              { label:"Chapter Quiz",   icon:"✅", color:"#f97316" },
              { label:"→",              icon:"",   color:"#475569" },
              { label:"Mid-Subject Test",icon:"🎯", color:"#f59e0b" },
              { label:"→",              icon:"",   color:"#475569" },
              { label:"Full Subject Test",icon:"🏆",color:"#10b981" },
              { label:"→",              icon:"",   color:"#475569" },
              { label:"Sample Papers",  icon:"📋", color:"#ef4444" },
              { label:"→",              icon:"",   color:"#475569" },
              { label:"DGCA EXAM",      icon:"✈️", color:"#f3c889" },
            ].map((step, i) => (
              step.label === "→"
                ? <span key={i} className="text-2xl font-black" style={{ color:"#334155" }}>→</span>
                : <div key={i} className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl"
                       style={{ background:`${step.color}15`, border:`1px solid ${step.color}40` }}>
                    <span className="text-xl">{step.icon}</span>
                    <span className="text-xs font-bold" style={{ color: step.color }}>{step.label}</span>
                  </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ PROMISE ══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24">
        <div className="relative rounded-3xl overflow-hidden p-12 text-center"
             style={{ background:"linear-gradient(135deg,rgba(255,30,30,0.07),rgba(194,90,30,0.07),rgba(240,145,58,0.05))", border:"1px solid rgba(243,200,137,0.25)" }}>
          <div className="text-5xl mb-4">🇮🇳</div>
          <h2 className="text-3xl font-black text-white mb-4">Free for Every Indian Student</h2>
          <p className="max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color:"#94a3b8" }}>
            Ghost Aviator&apos;s self-study is <strong style={{ color:"#ff6060" }}>always free</strong> — for every student, everywhere in India.
            Coupon code: <span className="font-black px-2 py-0.5 rounded" style={{ background:"rgba(243,200,137,0.15)", color:"#f3c889", border:"1px solid rgba(243,200,137,0.3)" }}>FREEPILOT</span>
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {["Free for every student","No credit card needed","Free 1 year for all","Cancel anytime"].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm" style={{ color:"#94a3b8" }}>
                <CheckCircle className="w-4 h-4" style={{ color:"#22c55e" }}/> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
