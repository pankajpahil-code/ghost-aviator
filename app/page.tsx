import Link from "next/link";
import { BookOpen, ClipboardList, FileText, Video, Trophy, Users, Star, ArrowRight, CheckCircle } from "lucide-react";

const subjects = [
  { name: "Air Regulations",   slug: "air-regulations",   icon: "⚖️",  questions: 1200, color: "#7c3aed" },
  { name: "Meteorology",       slug: "meteorology",        icon: "🌤️", questions: 1800, color: "#0ea5e9" },
  { name: "General Navigation",slug: "general-navigation", icon: "🗺️", questions: 2500, color: "#10b981" },
  { name: "Technical General", slug: "technical-general",  icon: "⚙️", questions: 1500, color: "#f59e0b" },
  { name: "Radio Aids & Instruments", slug: "radio-aids", icon: "📡", questions: 1300, color: "#ef4444" },
  { name: "Performance",       slug: "performance",        icon: "📈", questions: 900,  color: "#8b5cf6" },
  { name: "Mass & Balance",    slug: "mass-balance",       icon: "⚖️", questions: 600,  color: "#06b6d4" },
  { name: "Air Laws",          slug: "air-laws",           icon: "📋", questions: 800,  color: "#f97316" },
];

const features = [
  { icon: BookOpen,      title: "10,000+ Questions",   desc: "Comprehensive MCQ bank covering all DGCA CPL & ATPL subjects with detailed explanations." },
  { icon: ClipboardList, title: "DGCA Mock Tests",     desc: "Timed exams that replicate the actual DGCA exam format, scoring, and passing criteria." },
  { icon: FileText,      title: "Detailed Notes",      desc: "Subject-wise concise notes written by experienced CPL holders. Perfect for quick revision." },
  { icon: Video,         title: "Video Lectures",      desc: "Visual explanations of complex topics — instruments, navigation, meteorology and more." },
  { icon: Trophy,        title: "Progress Tracking",   desc: "Know your weak areas. Track scores, improvement, and exam readiness at a glance." },
  { icon: Users,         title: "Telegram Community",  desc: "Join thousands of aviation students discussing questions, sharing tips and helping each other." },
];

const stats = [
  { value: "10,000+", label: "Questions" },
  { value: "8",       label: "Subjects" },
  { value: "100%",    label: "Free to Start" },
  { value: "DGCA",    label: "Standard Format" },
];

export default function Home() {
  return (
    <div className="grid-bg">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(0,212,255,0.15), transparent)" }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center relative z-10">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8"
               style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff" }}>
            <Star className="w-4 h-4" /> India&apos;s #1 DGCA Exam Preparation Platform
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            Clear Your <span className="gradient-text">DGCA Exam</span><br />
            On the First Attempt
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10" style={{ color: "#94a3b8", lineHeight: 1.7 }}>
            10,000+ questions, DGCA-format mock tests, concise notes and video lectures —
            everything you need to ace your CPL or ATPL written exams. <strong style={{ color: "#00d4ff" }}>100% free to start.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/subjects"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-bold no-underline"
                  style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
              Start Studying Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/mock-test"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold no-underline"
                  style={{ border: "1px solid rgba(0,212,255,0.4)", color: "#00d4ff" }}>
              Take a Mock Test
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map(s => (
              <div key={s.label} className="glass-card p-4">
                <div className="text-2xl font-extrabold mb-1" style={{ color: "#00d4ff" }}>{s.value}</div>
                <div className="text-sm" style={{ color: "#64748b" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">All DGCA Subjects</h2>
          <p style={{ color: "#94a3b8" }}>Choose a subject to start practising</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map(s => (
            <Link key={s.slug} href={`/subjects/${s.slug}`}
                  className="glass-card p-6 no-underline group block">
              <div className="text-3xl mb-3">{s.icon}</div>
              <h3 className="text-base font-semibold mb-1" style={{ color: "#fff" }}>{s.name}</h3>
              <p className="text-sm mb-4" style={{ color: "#64748b" }}>{s.questions.toLocaleString()} questions</p>
              <div className="flex items-center gap-1 text-xs font-medium"
                   style={{ color: s.color }}>
                Start Practising <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need to Pass</h2>
          <p style={{ color: "#94a3b8" }}>One platform, all resources</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="glass-card p-6">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                   style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}>
                <f.icon className="w-6 h-6" style={{ color: "#00d4ff" }} />
              </div>
              <h3 className="text-base font-semibold mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Free promise */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass-card p-10 text-center"
             style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.05), rgba(124,58,237,0.05))", border: "1px solid rgba(0,212,255,0.2)" }}>
          <div className="text-4xl mb-4">🇮🇳</div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Promise to India</h2>
          <p className="max-w-2xl mx-auto mb-8" style={{ color: "#94a3b8", lineHeight: 1.8 }}>
            Aviation dreams should not be limited by money. Ghost Aviator will <strong style={{ color: "#00d4ff" }}>always remain free</strong> for
            students from villages and underprivileged backgrounds. Use coupon code <strong style={{ color: "#00d4ff" }}>FREEPILOT</strong> during signup.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["Free for rural students","Free for 1 year for everyone","No credit card required","Cancel anytime"].map(item => (
              <div key={item} className="flex items-center gap-2 text-sm" style={{ color: "#94a3b8" }}>
                <CheckCircle className="w-4 h-4" style={{ color: "#22c55e" }} /> {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Clear Your DGCA?</h2>
        <p className="mb-8" style={{ color: "#94a3b8" }}>Start with any subject. No sign-up required for the first 100 questions.</p>
        <Link href="/subjects"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-lg font-bold no-underline"
              style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
          Browse All Subjects <ArrowRight className="w-5 h-5" />
        </Link>
      </section>
    </div>
  );
}
