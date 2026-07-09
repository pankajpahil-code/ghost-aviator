import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, BookOpen, Sparkles, Clock, HelpCircle, Layers, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Digital Books | Ghost Aviator — Interactive DGCA Study Library",
  description:
    "Interactive digital books for DGCA CPL & ATPL exam preparation. Animated, chapter-indexed study material by Capt. Pankaj Pahil.",
};

type Book = {
  slug: string;
  title: string;
  subtitle: string;
  edition: string;
  author: string;
  coverImage: string;
  accentFrom: string;
  accentTo: string;
  glowColor: string;
  chapters: number;
  questions: number;
  studyHours: number;
  description: string;
  href: string;
  status: "live" | "coming-soon";
  badge?: string;
};

const BOOKS: Book[] = [
  {
    slug: "rtra-mastery",
    title: "RTR(A) Mastery",
    subtitle: "The Complete Guide to the DGCA Radio Telephone Operator Examination",
    edition: "1st Edition · 2026",
    author: "Capt. Pankaj Pahil",
    coverImage: "/content/radio-telephony/_assets/images/book_cover_hero.jpg",
    accentFrom: "#fbbf24",
    accentTo: "#ef4444",
    glowColor: "rgba(251,191,36,0.35)",
    chapters: 24,
    questions: 779,
    studyHours: 52,
    description:
      "The only RTR(A) book you need — 24 illuminated chapters covering regulations, radio principles, and radiotelephony procedures. Every chapter includes embedded self-tests, interactive diagrams, and a 418-question mock exam bank with oral/viva preparation.",
    href: "/cpl/radio-telephony",
    status: "live",
    badge: "COMPLETE",
  },
  {
    slug: "air-regulations",
    title: "Air Regulations",
    subtitle: "DGCA CPL Air Regulations — All 26 Chapters",
    edition: "Coming 2026",
    author: "Capt. Pankaj Pahil",
    coverImage: "",
    accentFrom: "#818cf8",
    accentTo: "#6366f1",
    glowColor: "rgba(99,102,241,0.25)",
    chapters: 26,
    questions: 0,
    studyHours: 0,
    description:
      "Complete DGCA Air Regulations study guide — from ICAO conventions and aircraft registration through human performance and CRM. Interactive diagrams, exam-weighted MCQs, and chapter quizzes.",
    href: "/cpl/air-regulations",
    status: "coming-soon",
  },
  {
    slug: "meteorology",
    title: "Aviation Meteorology",
    subtitle: "DGCA CPL Meteorology — Weather for Pilots",
    edition: "Coming 2026",
    author: "Capt. Pankaj Pahil",
    coverImage: "",
    accentFrom: "#38bdf8",
    accentTo: "#0ea5e9",
    glowColor: "rgba(56,189,248,0.25)",
    chapters: 29,
    questions: 0,
    studyHours: 0,
    description:
      "From the atmosphere and pressure systems through METAR/TAF decoding, cloud physics, and tropical meteorology — the complete DGCA met syllabus brought to life with animated weather charts and satellite imagery.",
    href: "/cpl/meteorology",
    status: "coming-soon",
  },
  {
    slug: "air-navigation",
    title: "Air Navigation",
    subtitle: "DGCA CPL Navigation — Charts, Plotting & Flight Planning",
    edition: "Coming 2026",
    author: "Capt. Pankaj Pahil",
    coverImage: "",
    accentFrom: "#34d399",
    accentTo: "#10b981",
    glowColor: "rgba(52,211,153,0.25)",
    chapters: 20,
    questions: 0,
    studyHours: 0,
    description:
      "Great circles, rhumb lines, chart projections, dead reckoning, radio navigation, and RNAV/PBN — every navigation concept illustrated with interactive plotting exercises and worked examples.",
    href: "/cpl/air-navigation",
    status: "coming-soon",
  },
  {
    slug: "technical-general",
    title: "Technical General",
    subtitle: "DGCA CPL Aircraft & Engines — Systems, Aerodynamics & Performance",
    edition: "Coming 2026",
    author: "Capt. Pankaj Pahil",
    coverImage: "",
    accentFrom: "#f97316",
    accentTo: "#ea580c",
    glowColor: "rgba(249,115,22,0.25)",
    chapters: 36,
    questions: 0,
    studyHours: 0,
    description:
      "Airframe systems, piston and turbine engines, propellers, electrical systems, instruments, aerodynamics, and performance — the entire DGCA technical syllabus with cutaway diagrams and animated system flows.",
    href: "/cpl/technical-general",
    status: "coming-soon",
  },
];

export default function BooksPage() {
  const featured = BOOKS[0];
  const upcoming = BOOKS.slice(1);

  return (
    <div style={{ background: "#06040e" }} className="min-h-screen bk-root">
      <style>{BK_CSS}</style>

      {/* ── Breadcrumb ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <nav className="flex items-center gap-2 text-xs" style={{ color: "#475569" }}>
          <Link href="/" className="no-underline hover:text-white transition-colors" style={{ color: "#475569" }}>Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span style={{ color: "#94a3b8" }}>Books</span>
        </nav>
      </div>

      {/* ── Hero section ─────────────────────────────────────────── */}
      <header className="bk-hero">
        <div className="bk-hero-glow" aria-hidden />
        <div className="bk-particles" aria-hidden>
          {Array.from({ length: 24 }).map((_, i) => (
            <span key={i} className={`bk-particle bk-p-${i % 8}`} />
          ))}
        </div>

        <div className="bk-hero-inner">
          <div className="bk-hero-badge">
            <Sparkles className="w-3.5 h-3.5" /> The Ghost Aviator Library
          </div>
          <h1 className="bk-hero-title">
            Digital <span className="bk-hero-accent">Books</span>
          </h1>
          <p className="bk-hero-sub">
            Interactive, chapter-indexed digital study books — written by a pilot, for pilots.
            Each book compiles the full subject into one seamless reading experience with
            animated diagrams, embedded self-tests, and exam-weighted question banks.
          </p>
        </div>
      </header>

      {/* ── Featured book ────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bk-featured">
          <div className="bk-featured-glow" style={{ background: `radial-gradient(ellipse 60% 50% at 20% 50%, ${featured.glowColor}, transparent)` }} aria-hidden />

          <div className="bk-featured-inner">
            {/* Book cover with 3D tilt */}
            <div className="bk-cover-wrap">
              <div className="bk-cover">
                <div className="bk-spine" style={{ background: `linear-gradient(180deg, ${featured.accentFrom}, ${featured.accentTo})` }} />
                <div className="bk-cover-face">
                  <Image
                    src={featured.coverImage}
                    alt={featured.title}
                    fill
                    className="object-cover"
                    style={{ borderRadius: "0 8px 8px 0" }}
                    sizes="(max-width: 768px) 280px, 340px"
                  />
                  <div className="bk-cover-overlay" />
                  <div className="bk-cover-badge" style={{ background: `linear-gradient(135deg, ${featured.accentFrom}, ${featured.accentTo})` }}>
                    {featured.badge}
                  </div>
                </div>
                {/* Page edges */}
                <div className="bk-pages" />
              </div>
            </div>

            {/* Book details */}
            <div className="bk-featured-info">
              <div className="bk-featured-tag" style={{ color: featured.accentFrom, borderColor: `${featured.accentFrom}40`, background: `${featured.accentFrom}10` }}>
                <BookOpen className="w-3.5 h-3.5" /> Digital Book · {featured.edition}
              </div>

              <h2 className="bk-featured-title">{featured.title}</h2>
              <p className="bk-featured-subtitle">{featured.subtitle}</p>
              <p className="bk-featured-author">by <strong>{featured.author}</strong></p>
              <p className="bk-featured-desc">{featured.description}</p>

              <div className="bk-featured-stats">
                <div className="bk-stat">
                  <Layers className="w-4 h-4" />
                  <div>
                    <div className="bk-stat-num">{featured.chapters}</div>
                    <div className="bk-stat-label">Chapters</div>
                  </div>
                </div>
                <div className="bk-stat">
                  <HelpCircle className="w-4 h-4" />
                  <div>
                    <div className="bk-stat-num">{featured.questions.toLocaleString()}</div>
                    <div className="bk-stat-label">Questions</div>
                  </div>
                </div>
                <div className="bk-stat">
                  <Clock className="w-4 h-4" />
                  <div>
                    <div className="bk-stat-num">~{featured.studyHours}</div>
                    <div className="bk-stat-label">Study Hours</div>
                  </div>
                </div>
              </div>

              <div className="bk-featured-ctas">
                <Link href={featured.href} className="bk-btn-primary" style={{ background: `linear-gradient(135deg, ${featured.accentFrom}, ${featured.accentTo})` }}>
                  <BookOpen className="w-4 h-4" /> Open Book <ArrowRight className="w-4 h-4 bk-arrow" />
                </Link>
                <Link href={`${featured.href}/rtf-1/notes`} className="bk-btn-secondary" style={{ borderColor: `${featured.accentFrom}40`, color: featured.accentFrom }}>
                  Start Reading Ch.1
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Coming soon shelf ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bk-shelf-head">
          <h2 className="bk-shelf-title">Coming to the Library</h2>
          <p className="bk-shelf-sub">More digital books are being compiled — each one a complete, interactive study companion for a DGCA exam subject.</p>
        </div>

        <div className="bk-shelf">
          {upcoming.map((book) => (
            <Link key={book.slug} href={book.href} className="bk-book-card">
              <div className="bk-book-card-glow" style={{ background: `radial-gradient(circle at 50% 0%, ${book.glowColor}, transparent 70%)` }} aria-hidden />

              {/* Mini book spine */}
              <div className="bk-mini-cover">
                <div className="bk-mini-spine" style={{ background: `linear-gradient(180deg, ${book.accentFrom}, ${book.accentTo})` }} />
                <div className="bk-mini-face" style={{ borderColor: `${book.accentFrom}30` }}>
                  <div className="bk-mini-title" style={{ color: book.accentFrom }}>{book.title.split(" ").map((w, i) => <span key={i}>{w}</span>)}</div>
                </div>
                <div className="bk-mini-pages" />
              </div>

              <h3 className="bk-book-card-title">{book.title}</h3>
              <p className="bk-book-card-sub">{book.subtitle}</p>

              <div className="bk-book-card-meta">
                <span><Layers className="w-3 h-3" /> {book.chapters} chapters</span>
              </div>

              <div className="bk-book-card-status" style={{ color: book.accentFrom, borderColor: `${book.accentFrom}35`, background: `${book.accentFrom}0a` }}>
                Coming Soon
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────────── */}
      <section className="bk-bottom-cta">
        <Sparkles className="w-5 h-5" style={{ color: "#fbbf24" }} />
        <p className="bk-bottom-text">
          Every book is <strong>free</strong> — written in service of student pilots preparing for the DGCA exams.
        </p>
        <p className="bk-bottom-author">— Capt. Pankaj Pahil · Ghost Aviator</p>
      </section>
    </div>
  );
}

const BK_CSS = `
.bk-root { position: relative; color: #e2e8f0; }

/* ── Hero ────────────────────────────────────────────────────────────────── */
.bk-hero {
  position: relative; overflow: hidden; padding: 60px 24px 40px; text-align: center;
  isolation: isolate;
}
.bk-hero-glow {
  position: absolute; inset: -40% -20% auto -20%; height: 80%; z-index: 0; pointer-events: none;
  background: conic-gradient(from 200deg at 50% 60%, rgba(251,191,36,0.0), rgba(124,58,237,0.18), rgba(251,191,36,0.14), rgba(239,68,68,0.12), rgba(124,58,237,0.0));
  filter: blur(80px); opacity: 0.6; mix-blend-mode: screen;
}
.bk-hero-inner { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; }
.bk-hero-badge {
  display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700;
  letter-spacing: .16em; text-transform: uppercase; color: #fbbf24;
  padding: 7px 16px; border-radius: 999px; margin-bottom: 20px;
  background: rgba(251,191,36,0.08); border: 1px solid rgba(251,191,36,0.25);
}
.bk-hero-title {
  font-size: clamp(2.4rem, 7vw, 4rem); font-weight: 900; color: #fff;
  line-height: 1.05; margin: 0 0 18px;
}
.bk-hero-accent {
  background: linear-gradient(100deg, #fbbf24, #ef4444, #c084fc);
  -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent;
}
.bk-hero-sub {
  font-size: clamp(0.95rem, 2.2vw, 1.15rem); color: #94a3b8; line-height: 1.6;
  margin: 0; max-width: 560px; margin-inline: auto;
}

/* ── Floating particles ──────────────────────────────────────────────────── */
.bk-particles { position: absolute; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.bk-particle {
  position: absolute; width: 3px; height: 3px; border-radius: 50%;
  background: radial-gradient(circle, #fde68a, rgba(251,191,36,0)); opacity: 0;
}
.bk-p-0 { left: 5%; top: 20%; } .bk-p-1 { left: 15%; top: 60%; }
.bk-p-2 { left: 30%; top: 10%; } .bk-p-3 { left: 45%; top: 75%; }
.bk-p-4 { left: 60%; top: 25%; } .bk-p-5 { left: 75%; top: 55%; }
.bk-p-6 { left: 85%; top: 15%; } .bk-p-7 { left: 92%; top: 65%; }

/* ── Featured book ───────────────────────────────────────────────────────── */
.bk-featured {
  position: relative; overflow: hidden; border-radius: 24px;
  background: linear-gradient(160deg, rgba(23,16,42,0.96), rgba(12,8,24,0.96));
  border: 1px solid rgba(251,191,36,0.18);
  box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 80px rgba(251,191,36,0.06);
  padding: 40px;
}
.bk-featured-glow { position: absolute; inset: 0; pointer-events: none; z-index: 0; }
.bk-featured-inner {
  position: relative; z-index: 1;
  display: flex; gap: 48px; align-items: center;
}
@media (max-width: 768px) {
  .bk-featured { padding: 24px; }
  .bk-featured-inner { flex-direction: column; gap: 32px; align-items: center; text-align: center; }
}

/* ── 3D Book cover ───────────────────────────────────────────────────────── */
.bk-cover-wrap {
  flex-shrink: 0; perspective: 1200px;
}
.bk-cover {
  position: relative; width: 240px; height: 340px;
  transform-style: preserve-3d;
  transform: rotateY(-12deg) rotateX(2deg);
  transition: transform 0.6s cubic-bezier(0.23,1,0.32,1);
}
.bk-cover-wrap:hover .bk-cover {
  transform: rotateY(-4deg) rotateX(0deg) translateY(-8px);
}
.bk-spine {
  position: absolute; left: 0; top: 0; width: 28px; height: 100%;
  border-radius: 4px 0 0 4px;
  transform: rotateY(90deg) translateZ(-14px) translateX(-14px);
  box-shadow: inset -3px 0 8px rgba(0,0,0,0.4);
}
.bk-cover-face {
  position: absolute; left: 28px; top: 0; right: 0; bottom: 0;
  border-radius: 0 8px 8px 0; overflow: hidden;
  box-shadow: 6px 6px 20px rgba(0,0,0,0.5), 0 0 40px rgba(251,191,36,0.08);
}
.bk-cover-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.1), rgba(0,0,0,0.3));
  z-index: 1;
}
.bk-cover-badge {
  position: absolute; top: 14px; right: 14px; z-index: 2;
  font-size: 10px; font-weight: 800; letter-spacing: .12em; color: #1a1200;
  padding: 5px 12px; border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.bk-pages {
  position: absolute; right: -3px; top: 4px; bottom: 4px; width: 18px;
  background: repeating-linear-gradient(to right,
    #f5f0e6, #f5f0e6 1px, #ede8d8 1px, #ede8d8 2px);
  border-radius: 0 3px 3px 0;
  transform: translateZ(-2px);
  box-shadow: 2px 0 6px rgba(0,0,0,0.2);
}

/* ── Book info ───────────────────────────────────────────────────────────── */
.bk-featured-info { flex: 1; min-width: 0; }
.bk-featured-tag {
  display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px;
  border: 1px solid; margin-bottom: 16px;
}
.bk-featured-title {
  font-size: clamp(1.8rem, 4vw, 2.6rem); font-weight: 900; color: #fff;
  line-height: 1.1; margin: 0 0 8px;
}
.bk-featured-subtitle { font-size: 1rem; color: #94a3b8; margin: 0 0 6px; }
.bk-featured-author { font-size: 0.88rem; color: #64748b; margin: 0 0 16px; }
.bk-featured-author strong { color: #cbd5e1; }
.bk-featured-desc { font-size: 0.92rem; color: #94a3b8; line-height: 1.6; margin: 0 0 24px; }

.bk-featured-stats { display: flex; gap: 28px; margin-bottom: 28px; flex-wrap: wrap; }
.bk-stat { display: flex; align-items: center; gap: 10px; color: #fbbf24; }
.bk-stat-num { font-size: 1.4rem; font-weight: 900; color: #fff; line-height: 1; }
.bk-stat-label { font-size: 0.72rem; color: #64748b; text-transform: uppercase; letter-spacing: .08em; font-weight: 600; }

.bk-featured-ctas { display: flex; gap: 14px; flex-wrap: wrap; }
@media (max-width: 768px) { .bk-featured-ctas { justify-content: center; } }
.bk-btn-primary {
  display: inline-flex; align-items: center; gap: 10px; text-decoration: none;
  font-weight: 800; font-size: 0.95rem; color: #1a1200;
  padding: 14px 26px; border-radius: 14px;
  box-shadow: 0 10px 30px rgba(251,191,36,0.25);
  transition: transform 0.25s, box-shadow 0.25s;
}
.bk-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(251,191,36,0.4); }
.bk-arrow { transition: transform 0.25s; }
.bk-btn-primary:hover .bk-arrow { transform: translateX(4px); }

.bk-btn-secondary {
  display: inline-flex; align-items: center; gap: 8px; text-decoration: none;
  font-weight: 700; font-size: 0.9rem; padding: 13px 22px; border-radius: 14px;
  border: 1px solid; background: transparent;
  transition: background 0.25s;
}
.bk-btn-secondary:hover { background: rgba(251,191,36,0.08); }

/* ── Shelf ───────────────────────────────────────────────────────────────── */
.bk-shelf-head { text-align: center; margin-bottom: 36px; padding-top: 20px; }
.bk-shelf-title { font-size: 1.6rem; font-weight: 900; color: #fff; margin: 0 0 8px; }
.bk-shelf-sub { font-size: 0.92rem; color: #64748b; margin: 0; max-width: 480px; margin-inline: auto; }

.bk-shelf {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px;
}

/* ── Book card ───────────────────────────────────────────────────────────── */
.bk-book-card {
  position: relative; overflow: hidden; display: flex; flex-direction: column;
  align-items: center; text-align: center; text-decoration: none;
  padding: 28px 20px 22px; border-radius: 20px;
  background: linear-gradient(160deg, rgba(23,16,42,0.96), rgba(12,8,24,0.96));
  border: 1px solid rgba(255,255,255,0.08);
  transition: transform 0.35s cubic-bezier(0.2,0.8,0.2,1), border-color 0.35s, box-shadow 0.35s;
}
.bk-book-card:hover {
  transform: translateY(-8px);
  border-color: rgba(255,255,255,0.16);
  box-shadow: 0 20px 50px rgba(0,0,0,0.4);
}
.bk-book-card-glow {
  position: absolute; top: -40px; left: -20%; right: -20%; height: 120px;
  pointer-events: none; opacity: 0; transition: opacity 0.4s;
}
.bk-book-card:hover .bk-book-card-glow { opacity: 1; }

/* Mini book cover */
.bk-mini-cover {
  position: relative; width: 90px; height: 125px; perspective: 800px; margin-bottom: 18px;
}
.bk-mini-spine {
  position: absolute; left: 0; top: 0; width: 12px; height: 100%;
  border-radius: 3px 0 0 3px;
  box-shadow: inset -2px 0 6px rgba(0,0,0,0.4);
}
.bk-mini-face {
  position: absolute; left: 12px; top: 0; right: 0; bottom: 0;
  border-radius: 0 6px 6px 0; border: 1px solid; overflow: hidden;
  background: rgba(15,8,30,0.9);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 2px; padding: 8px 6px;
}
.bk-mini-title {
  font-size: 10px; font-weight: 800; line-height: 1.2; text-align: center;
  display: flex; flex-direction: column;
}
.bk-mini-pages {
  position: absolute; right: -2px; top: 3px; bottom: 3px; width: 8px;
  background: repeating-linear-gradient(to right, #f5f0e6, #f5f0e6 1px, #ede8d8 1px, #ede8d8 2px);
  border-radius: 0 2px 2px 0;
}

.bk-book-card-title { font-size: 1.05rem; font-weight: 800; color: #fff; margin: 0 0 6px; }
.bk-book-card-sub { font-size: 0.78rem; color: #64748b; margin: 0 0 12px; line-height: 1.4; flex: 1; }
.bk-book-card-meta {
  display: flex; gap: 12px; font-size: 0.72rem; color: #475569; margin-bottom: 14px;
}
.bk-book-card-meta span { display: flex; align-items: center; gap: 4px; }
.bk-book-card-status {
  font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
  padding: 5px 14px; border-radius: 999px; border: 1px solid;
}

/* ── Bottom CTA ──────────────────────────────────────────────────────────── */
.bk-bottom-cta {
  max-width: 600px; margin: 0 auto; padding: 30px 24px 60px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.bk-bottom-text { font-size: 1.05rem; font-style: italic; color: #cbd5e1; margin: 0; line-height: 1.6; }
.bk-bottom-text strong { color: #fbbf24; }
.bk-bottom-author { font-size: 0.82rem; color: #64748b; margin: 0; }

/* ── Motion ──────────────────────────────────────────────────────────────── */
@media (prefers-reduced-motion: no-preference) {
  .bk-particle { animation: bkFloat linear infinite; }
  .bk-p-0 { animation-duration: 12s; animation-delay: 0s;   }
  .bk-p-1 { animation-duration: 15s; animation-delay: 2s;   }
  .bk-p-2 { animation-duration: 10s; animation-delay: 4s;   }
  .bk-p-3 { animation-duration: 18s; animation-delay: 1s;   }
  .bk-p-4 { animation-duration: 13s; animation-delay: 3s;   }
  .bk-p-5 { animation-duration: 16s; animation-delay: 5s;   }
  .bk-p-6 { animation-duration: 11s; animation-delay: 6s;   }
  .bk-p-7 { animation-duration: 14s; animation-delay: 0.5s; }

  .bk-hero-accent {
    background-size: 250% auto;
    animation: bkShimmer 5s linear infinite;
  }

  .bk-cover {
    animation: bkBookHover 4s ease-in-out infinite alternate;
  }
  .bk-cover-wrap:hover .bk-cover { animation: none; }
}

@keyframes bkFloat {
  0%   { transform: translateY(0) translateX(0) scale(1); opacity: 0; }
  10%  { opacity: 0.7; }
  50%  { transform: translateY(-40vh) translateX(15px) scale(1.2); opacity: 0.4; }
  90%  { opacity: 0.2; }
  100% { transform: translateY(-80vh) translateX(-10px) scale(0.8); opacity: 0; }
}
@keyframes bkShimmer { to { background-position: 250% center; } }
@keyframes bkBookHover {
  from { transform: rotateY(-12deg) rotateX(2deg) translateY(0); }
  to   { transform: rotateY(-10deg) rotateX(1deg) translateY(-6px); }
}
`;
