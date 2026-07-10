import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle, BookOpen, ClipboardList, FileText, Video, Headphones, BarChart3, Zap } from "lucide-react";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import { ALL_QUESTIONS } from "@/lib/questions";
import HeroGhost from "./components/HeroGhost";

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
    <div style={{ background: "#06040e" }}>

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: "100vh" }}>

        {/* Full scene hero image as background */}
        <div className="absolute inset-0">
          <Image src="/ghost-hero.png" alt="" fill className="object-cover object-center" style={{ opacity: 0.35 }} priority/>
          {/* Dark overlay so text is readable */}
          <div className="absolute inset-0" style={{ background:"linear-gradient(to right, rgba(6,4,14,0.92) 50%, rgba(6,4,14,0.3) 100%)" }}/>
          <div className="absolute inset-0" style={{ background:"linear-gradient(to top, rgba(6,4,14,0.95) 0%, transparent 40%)" }}/>
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "linear-gradient(rgba(120,60,220,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(120,60,220,0.04) 1px,transparent 1px)",
          backgroundSize: "55px 55px"
        }}/>

        {/* HUD corners */}
        {[["top-6 left-6","t","l"],["top-6 right-6","t","r"],["bottom-6 left-6","b","l"],["bottom-6 right-6","b","r"]].map(([pos,v,h]) => (
          <div key={pos} className={`absolute ${pos} pointer-events-none`} style={{ width:44, height:44,
            borderTop:    v==="t" ? "2px solid rgba(180,100,255,0.55)" : undefined,
            borderBottom: v==="b" ? "2px solid rgba(180,100,255,0.55)" : undefined,
            borderLeft:   h==="l" ? "2px solid rgba(180,100,255,0.55)" : undefined,
            borderRight:  h==="r" ? "2px solid rgba(180,100,255,0.55)" : undefined }}/>
        ))}
        <div className="absolute top-8 left-14 text-xs font-mono" style={{ color:"rgba(180,120,255,0.45)" }}>ALT: FL350</div>
        <div className="absolute top-8 right-14 text-xs font-mono" style={{ color:"rgba(0,212,255,0.45)" }}>HDG: 360°</div>
        <div className="absolute bottom-8 left-14 text-xs font-mono" style={{ color:"rgba(180,120,255,0.45)" }}>GS: 480 KTS</div>
        <div className="absolute bottom-8 right-14 text-xs font-mono" style={{ color:"rgba(0,212,255,0.45)" }}>DGCA READY</div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-screen py-20">

            {/* Left */}
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold mb-5"
                   style={{ background:"rgba(180,100,255,0.12)", border:"1px solid rgba(180,100,255,0.4)", color:"#c080ff" }}>
                ✈️ CAPT. PANKAJ PAHIL
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-8 ml-3"
                   style={{ background:"rgba(255,50,50,0.12)", border:"1px solid rgba(255,50,50,0.35)", color:"#ff6060" }}>
                <Zap className="w-3 h-3" /> INDIA&apos;S #1 DGCA PREP
              </div>

              <div className="text-5xl sm:text-7xl font-black leading-none tracking-tight mb-1"
                   style={{ color:"#ffffff", textShadow:"0 0 40px rgba(180,100,255,0.4)" }}>GHOST</div>
              <div className="text-5xl sm:text-7xl font-black leading-none tracking-tight mb-4"
                   style={{ background:"linear-gradient(135deg,#ff6000,#ff2020,#ff0080,#c020ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", filter:"drop-shadow(0 0 25px rgba(255,60,0,0.7))" }}>
                AVIATOR
              </div>
              <p className="text-xs font-bold tracking-widest mb-8 uppercase" style={{ color:"rgba(180,120,255,0.65)", letterSpacing:"0.22em" }}>
                Legacy of the Skies · The Spirit Beyond the Clouds
              </p>
              <p className="text-base mb-10 max-w-lg leading-relaxed" style={{ color:"#94a3b8" }}>
                India&apos;s most complete DGCA exam prep — structured chapter by chapter, exactly like the actual exam.
                <strong style={{ color:"#00d4ff" }}> 100% free to start.</strong>
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link href="/cpl" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-black no-underline"
                      style={{ background:"linear-gradient(135deg,#9020ff,#ff2060)", color:"#fff", boxShadow:"0 0 30px rgba(150,30,255,0.45)" }}>
                  Start CPL Prep <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/atpl" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
                      style={{ border:"1px solid rgba(0,212,255,0.5)", color:"#00d4ff", background:"rgba(0,212,255,0.06)" }}>
                  Start ATPL Prep
                </Link>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[[TOTAL_Q,"Questions"],[`${SUBJECT_COUNT}`,"Subjects"],["70%","Pass Mark"],["FREE","Start"]].map(([v,l]) => (
                  <div key={l} className="text-center p-3 rounded-xl"
                       style={{ background:"rgba(20,10,40,0.9)", border:"1px solid rgba(180,100,255,0.2)" }}>
                    <div className="text-xl font-black" style={{ color:"#c080ff" }}>{v}</div>
                    <div className="text-xs" style={{ color:"#475569" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — the Ghost Aviator: levitating guardian-angel scene with
                3D mouse parallax, spectral wings, halo, soul embers & lightning */}
            <div className="order-1 lg:order-2">
              <HeroGhost />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ LIVE CLASSES BANNER ══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <Link href="/live-classes" className="group relative block rounded-3xl overflow-hidden no-underline"
              style={{ border:"1px solid rgba(255,60,60,0.45)", boxShadow:"0 0 40px rgba(255,40,40,0.15)" }}>
          {/* Animated sheen background */}
          <div className="absolute inset-0" style={{ background:"linear-gradient(120deg, rgba(255,30,30,0.14), rgba(150,0,255,0.14) 45%, rgba(0,180,255,0.1))" }}/>
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
               style={{ background:"linear-gradient(120deg, rgba(255,30,30,0.22), rgba(150,0,255,0.22) 45%, rgba(0,180,255,0.16))" }}/>

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
                Learn directly from <span style={{ background:"linear-gradient(135deg,#ff6000,#ff2060,#c020ff)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Capt. Pankaj Pahil</span> — live online batches
              </div>
              <div className="text-sm font-semibold" style={{ color:"#94a3b8" }}>
                🌤️ Meteorology · ⚖️ Air Regs · 🗺️ Gen Nav · 📡 Radio Nav · 🧭 Instruments &nbsp;—&nbsp;
                batch of 10 · <span className="line-through" style={{ color:"#64748b" }}>₹5,999</span> <strong style={{ color:"#22c55e" }}>₹2,999 founding price</strong>
              </div>
            </div>

            {/* CTA */}
            <div className="shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-black"
                 style={{ background:"linear-gradient(135deg,#ff3030,#c020ff)", color:"#fff", boxShadow:"0 0 25px rgba(255,40,40,0.4)" }}>
              Admissions Open — Join Now <ArrowRight className="w-4 h-4"/>
            </div>
          </div>
        </Link>
      </section>

      {/* ══════════════════ INSTRUCTOR TEASER ══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link href="/about" className="flex items-center justify-between gap-4 flex-wrap rounded-2xl px-6 py-4 no-underline"
              style={{ background:"rgba(15,8,30,0.95)", border:"1px solid rgba(180,100,255,0.22)" }}>
          <div className="flex items-center gap-3 text-sm" style={{ color:"#94a3b8" }}>
            <span className="text-xl">👨‍✈️</span>
            <span>
              Built and taught by <strong style={{ color:"#c080ff" }}>Capt. Pankaj Pahil</strong> — pilot,
              DGCA flight &amp; ground instructor, 20+ years in aviation, author of two aviation books.
            </span>
          </div>
          <span className="text-sm font-bold whitespace-nowrap" style={{ color:"#c080ff" }}>Meet the Captain →</span>
        </Link>
      </section>

      {/* ══════════════════ CHOOSE YOUR PATH ══════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-14">
          <div className="inline-block text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-5"
               style={{ color:"#c080ff", border:"1px solid rgba(180,100,255,0.35)", background:"rgba(180,100,255,0.08)", letterSpacing:"0.18em" }}>
            WHERE DO YOU WANT TO FLY?
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Choose Your <span style={{ background:"linear-gradient(135deg,#c080ff,#ff2060)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Licence Path</span></h2>
          <p style={{ color:"#64748b" }}>Select your exam goal — we&apos;ll guide you through every chapter.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* CPL Card */}
          <Link href="/cpl" className="group relative rounded-3xl overflow-hidden no-underline block"
                style={{ background:"linear-gradient(135deg,rgba(124,58,237,0.15),rgba(255,32,96,0.1))", border:"1px solid rgba(124,58,237,0.4)" }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ background:"linear-gradient(135deg,rgba(124,58,237,0.25),rgba(255,32,96,0.18))" }}/>
            <div className="relative z-10 p-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="text-xs font-bold tracking-widest mb-3" style={{ color:"rgba(180,100,255,0.7)", letterSpacing:"0.2em" }}>DGCA INDIA</div>
                  <h3 className="text-4xl font-black text-white mb-2">CPL</h3>
                  <p className="text-lg font-semibold" style={{ color:"#c080ff" }}>Commercial Pilot Licence</p>
                </div>
                <div className="text-6xl opacity-80">🛩️</div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[[`${CPL_SUBJECTS.length}`,"Subjects"],[`${CPL_CHAPTERS}`,"Chapters"],[CPL_Q,"Questions"]].map(([v,l]) => (
                  <div key={l} className="p-3 rounded-xl text-center" style={{ background:"rgba(124,58,237,0.15)", border:"1px solid rgba(124,58,237,0.25)" }}>
                    <div className="text-xl font-black text-white">{v}</div>
                    <div className="text-xs" style={{ color:"#7c3aed" }}>{l}</div>
                  </div>
                ))}
              </div>
              <ul className="flex flex-col gap-2 mb-8">
                {CPL_SUBJECTS.map(s => s.name).map(s => (
                  <li key={s} className="flex items-center gap-2 text-sm" style={{ color:"#94a3b8" }}>
                    <CheckCircle className="w-4 h-4" style={{ color:"#7c3aed" }}/> {s}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 font-black text-lg" style={{ color:"#c080ff" }}>
                Enter CPL Section <ArrowRight className="w-5 h-5"/>
              </div>
            </div>
          </Link>

          {/* ATPL Card */}
          <Link href="/atpl" className="group relative rounded-3xl overflow-hidden no-underline block"
                style={{ background:"linear-gradient(135deg,rgba(0,180,255,0.12),rgba(255,120,0,0.1))", border:"1px solid rgba(0,180,255,0.4)" }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                 style={{ background:"linear-gradient(135deg,rgba(0,180,255,0.2),rgba(255,120,0,0.15))" }}/>
            <div className="relative z-10 p-10">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="text-xs font-bold tracking-widest mb-3" style={{ color:"rgba(0,212,255,0.7)", letterSpacing:"0.2em" }}>DGCA INDIA</div>
                  <h3 className="text-4xl font-black text-white mb-2">ATPL</h3>
                  <p className="text-lg font-semibold" style={{ color:"#00d4ff" }}>Airline Transport Pilot Licence</p>
                </div>
                <div className="text-6xl opacity-80">✈️</div>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {[[`${ATPL_SUBJECTS.length}`,"Subjects"],[`${ATPL_CHAPTERS}`,"Chapters"],[ATPL_Q,"Questions"]].map(([v,l]) => (
                  <div key={l} className="p-3 rounded-xl text-center" style={{ background:"rgba(0,180,255,0.1)", border:"1px solid rgba(0,180,255,0.2)" }}>
                    <div className="text-xl font-black text-white">{v}</div>
                    <div className="text-xs" style={{ color:"#00d4ff" }}>{l}</div>
                  </div>
                ))}
              </div>
              <ul className="flex flex-col gap-2 mb-8">
                {ATPL_SUBJECTS.map(s => s.name).map(s => (
                  <li key={s} className="flex items-center gap-2 text-sm" style={{ color:"#94a3b8" }}>
                    <CheckCircle className="w-4 h-4" style={{ color:"#00d4ff" }}/> {s}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 font-black text-lg" style={{ color:"#00d4ff" }}>
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
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">Everything Per <span style={{ background:"linear-gradient(135deg,#ff4400,#ff0080)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Chapter</span></h2>
          <p style={{ color:"#64748b" }}>Not just a question bank. A complete structured learning system.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <div key={s.label} className="p-6 rounded-2xl relative overflow-hidden"
                 style={{ background:"rgba(15,8,30,0.95)", border:"1px solid rgba(180,100,255,0.12)" }}>
              <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%", background:`linear-gradient(to bottom, ${["#7c3aed","#ff4444","#00d4ff","#f59e0b","#10b981","#c080ff"][i]}, transparent)` }}/>
              <s.icon className="w-8 h-8 mb-4" style={{ color:["#7c3aed","#ff4444","#00d4ff","#f59e0b","#10b981","#c080ff"][i] }}/>
              <h3 className="font-bold text-white mb-1">{s.label}</h3>
              <p className="text-sm" style={{ color:"#64748b" }}>{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Progress path visual */}
        <div className="mt-16 p-8 rounded-3xl" style={{ background:"rgba(15,8,30,0.95)", border:"1px solid rgba(180,100,255,0.2)" }}>
          <h3 className="text-xl font-black text-white mb-6 text-center">Your Learning Journey</h3>
          <div className="flex flex-wrap justify-center items-center gap-2">
            {[
              { label:"Chapter Study",   icon:"📚", color:"#7c3aed" },
              { label:"→",              icon:"",   color:"#475569" },
              { label:"Chapter Quiz",   icon:"✅", color:"#f97316" },
              { label:"→",              icon:"",   color:"#475569" },
              { label:"Mid-Subject Test",icon:"🎯", color:"#f59e0b" },
              { label:"→",              icon:"",   color:"#475569" },
              { label:"Full Subject Test",icon:"🏆",color:"#10b981" },
              { label:"→",              icon:"",   color:"#475569" },
              { label:"Sample Papers",  icon:"📋", color:"#ef4444" },
              { label:"→",              icon:"",   color:"#475569" },
              { label:"DGCA EXAM",      icon:"✈️", color:"#c080ff" },
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
             style={{ background:"linear-gradient(135deg,rgba(255,30,30,0.07),rgba(150,0,255,0.07),rgba(0,180,255,0.05))", border:"1px solid rgba(180,100,255,0.25)" }}>
          <div className="text-5xl mb-4">🇮🇳</div>
          <h2 className="text-3xl font-black text-white mb-4">Free for Every Indian Student</h2>
          <p className="max-w-2xl mx-auto mb-8 leading-relaxed" style={{ color:"#94a3b8" }}>
            Ghost Aviator&apos;s self-study is <strong style={{ color:"#ff6060" }}>always free</strong> — for every student, everywhere in India.
            Coupon code: <span className="font-black px-2 py-0.5 rounded" style={{ background:"rgba(180,100,255,0.15)", color:"#c080ff", border:"1px solid rgba(180,100,255,0.3)" }}>FREEPILOT</span>
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
