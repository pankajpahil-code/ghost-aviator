import Link from "next/link";
import { ChevronRight, ArrowRight, BookOpen, Sparkles, HelpCircle, ListChecks } from "lucide-react";
import type { Subject } from "@/lib/subjects";
import ChapterProgressBadge from "@/app/components/ChapterProgressBadge";
import SubjectProgressBar from "@/app/components/SubjectProgressBar";

// ─────────────────────────────────────────────────────────────────────────────
// The Radio Telephony section is Capt. Pankaj Pahil's "Complete RTR(A) Book".
// Instead of the generic chapter list we give it a cinematic, "enchanted
// grimoire" landing: a glowing book cover, drifting embers, and the 24 chapters
// laid out as illuminated cards grouped by the book's five modules.
//
// All motion is CSS-only (no client JS, no canvas) and lives inside a
// `prefers-reduced-motion: no-preference` guard, so it renders instantly on the
// server, adds no external requests, and goes calm & static for users who ask
// for reduced motion.
// ─────────────────────────────────────────────────────────────────────────────

const COVER = "/content/radio-telephony/_assets/images/book_cover_hero.jpg";

type Module = { key: string; label: string; part: string; hint: string; chapters: number[] };

const MODULES: Module[] = [
  { key: "0", label: "Orientation",              part: "The Threshold",   hint: "Enter the exam & the book",            chapters: [1] },
  { key: "A", label: "Rule-Makers & Regulations", part: "Syllabus Part I", hint: "Who governs the airwaves",             chapters: [2, 3, 4, 5, 6] },
  { key: "B", label: "Radio Principles & Practice", part: "Syllabus Part II", hint: "The physics beneath the voice",      chapters: [7, 8, 9, 10, 11, 12] },
  { key: "C", label: "Radiotelephony in Practice", part: "Syllabus Part III", hint: "The language of the air",           chapters: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22] },
  { key: "D", label: "The Exam Arsenal",          part: "Mastery",         hint: "Numbers, mock papers & the viva",      chapters: [23, 24] },
];

export default function RtrBookExperience({ subject }: { subject: Subject }) {
  const byNumber = new Map(subject.chapters.map((c) => [c.number, c]));
  const totalHrs = subject.chapters.reduce((s, c) => s + parseFloat(c.duration) || s, 0);

  return (
    <div style={{ background: "#06040e" }} className="min-h-screen rtrx-root">
      <style>{RTRX_CSS}</style>

      {/* ── Cinematic cover ─────────────────────────────────────────────── */}
      <header className="rtrx-cover">
        <div className="rtrx-cover-img" style={{ backgroundImage: `url(${COVER})` }} aria-hidden />
        <div className="rtrx-aurora" aria-hidden />
        <div className="rtrx-embers" aria-hidden>
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className={`rtrx-ember rtrx-ember-${i % 6}`} />
          ))}
        </div>

        <div className="rtrx-cover-inner">
          <nav className="rtrx-crumbs">
            <Link href="/" className="rtrx-crumb">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/cpl" className="rtrx-crumb">CPL</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: "#cbd5e1" }}>Radio Telephony</span>
          </nav>

          <div className="rtrx-badge">
            <Sparkles className="w-3.5 h-3.5" /> DGCA · Radio Telephony (Aeronautical)
          </div>

          <h1 className="rtrx-title">
            <span className="rtrx-title-shimmer">RTR(A)</span>
            <span className="rtrx-title-sub">MASTERY</span>
          </h1>

          <p className="rtrx-tagline">
            The Complete Guide to the DGCA Radio Telephone Operator (Restricted) Examination —
            written, practical &amp; oral.
          </p>

          <div className="rtrx-author">
            <div className="rtrx-author-name">Capt. Pankaj Pahil</div>
            <div className="rtrx-author-role">Pilot · Flight Instructor · Ground Instructor · 17 years in aviation</div>
          </div>

          <div className="rtrx-stats">
            <span className="rtrx-chip rtrx-chip-gold">24 Illuminated Chapters</span>
            <span className="rtrx-chip">5 Modules</span>
            <span className="rtrx-chip">~{Math.round(totalHrs)} hrs of study</span>
            <span className="rtrx-chip rtrx-chip-green">Free · in service of pilots</span>
          </div>

          <Link href={`/cpl/${subject.id}/rtf-1/notes`} className="rtrx-open">
            <BookOpen className="w-4 h-4" /> Open the Book <ArrowRight className="w-4 h-4 rtrx-open-arrow" />
          </Link>
        </div>

        <div className="rtrx-cover-fade" aria-hidden />
      </header>

      {/* ── Progress ────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <SubjectProgressBar
          track="cpl"
          subjectId={subject.id}
          chapterIds={subject.chapters.map((c) => c.id)}
          passMark={subject.passMark}
          color={subject.color}
        />
      </div>

      {/* ── Modules & chapters ──────────────────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-4">
        {MODULES.map((mod, mi) => (
          <section key={mod.key} className="rtrx-module">
            <div className="rtrx-module-head">
              <div className="rtrx-rune">{mod.key}</div>
              <div className="rtrx-module-meta">
                <div className="rtrx-module-part">{mod.part}</div>
                <h2 className="rtrx-module-title">Module {mod.key} — {mod.label}</h2>
                <div className="rtrx-module-hint">{mod.hint}</div>
              </div>
              <div className="rtrx-module-line" />
            </div>

            <div className="rtrx-grid">
              {mod.chapters.map((num, ci) => {
                const ch = byNumber.get(num);
                if (!ch) return null;
                const delay = `${(mi * 3 + ci) * 55}ms`;
                const hasQs = ch.questionCount > 0;
                return (
                  <div
                    key={ch.id}
                    className="rtrx-card"
                    style={{ animationDelay: delay }}
                  >
                    <div className="rtrx-card-sheen" aria-hidden />
                    <div className="rtrx-card-top">
                      <div className="rtrx-num">
                        <span className="rtrx-num-inner">{ch.number}</span>
                      </div>
                      <ChapterProgressBadge
                        track="cpl"
                        subjectId={subject.id}
                        chapterId={ch.id}
                        passMark={subject.passMark}
                      />
                    </div>
                    <Link href={`/cpl/${subject.id}/${ch.id}/notes`} className="rtrx-card-title-link">
                      <h3 className="rtrx-card-title">{ch.title}</h3>
                    </Link>
                    <p className="rtrx-card-desc">{ch.description}</p>

                    {hasQs && (
                      <div className="rtrx-card-actions">
                        <Link href={`/cpl/${subject.id}/${ch.id}/questions`} className="rtrx-pill rtrx-pill-green">
                          <HelpCircle className="w-3 h-3" /> {ch.questionCount} Practice Qs
                        </Link>
                        <Link href={`/cpl/${subject.id}/${ch.id}/chapter-quiz`} className="rtrx-pill rtrx-pill-orange">
                          <ListChecks className="w-3 h-3" /> Chapter Quiz
                        </Link>
                      </div>
                    )}

                    <div className="rtrx-card-foot">
                      <span className="rtrx-card-time">⏱ {ch.duration}</span>
                      <Link href={`/cpl/${subject.id}/${ch.id}/notes`} className="rtrx-card-read">
                        Read <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Closing note */}
        <div className="rtrx-closing">
          <Sparkles className="w-5 h-5" style={{ color: "#fbbf24" }} />
          <p>
            &ldquo;May your readback always be correct, and your skies always clear.&rdquo;
            <span>— Capt. Pankaj Pahil · Ghost Aviator</span>
          </p>
        </div>
      </main>
    </div>
  );
}

// ── Styles (scoped by the .rtrx- prefix; motion behind a reduced-motion guard) ─
const RTRX_CSS = `
.rtrx-root { position: relative; color: #e2e8f0; }

/* Cover ------------------------------------------------------------------- */
.rtrx-cover { position: relative; overflow: hidden; padding: 0; isolation: isolate; }
.rtrx-cover-img {
  position: absolute; inset: 0; background-size: cover; background-position: center;
  opacity: 0.32; filter: saturate(1.1) contrast(1.05);
  transform: scale(1.05);
}
.rtrx-cover::after {
  content: ""; position: absolute; inset: 0; z-index: 1;
  background:
    radial-gradient(ellipse 90% 60% at 50% -10%, rgba(124,58,237,0.28) 0%, transparent 60%),
    radial-gradient(ellipse 70% 50% at 80% 20%, rgba(239,68,68,0.16) 0%, transparent 60%),
    linear-gradient(180deg, rgba(6,4,14,0.35) 0%, rgba(6,4,14,0.82) 70%, #06040e 100%);
}
.rtrx-aurora {
  position: absolute; inset: -20% -10% auto -10%; height: 70%; z-index: 1; pointer-events: none;
  background:
    conic-gradient(from 180deg at 50% 50%, rgba(124,58,237,0.0), rgba(56,189,248,0.22), rgba(251,191,36,0.18), rgba(239,68,68,0.20), rgba(124,58,237,0.0));
  filter: blur(60px); opacity: 0.55; mix-blend-mode: screen;
}
.rtrx-cover-fade { position: absolute; left: 0; right: 0; bottom: 0; height: 120px; z-index: 1;
  background: linear-gradient(180deg, transparent, #06040e); }

.rtrx-cover-inner {
  position: relative; z-index: 2; max-width: 64rem; margin: 0 auto;
  padding: 40px 24px 96px; display: flex; flex-direction: column; align-items: flex-start;
}
.rtrx-crumbs { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b; margin-bottom: 34px; }
.rtrx-crumb { color: #64748b; text-decoration: none; transition: color .2s; }
.rtrx-crumb:hover { color: #fff; }

.rtrx-badge {
  display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase; color: #93c5fd;
  padding: 7px 14px; border-radius: 999px; margin-bottom: 22px;
  background: rgba(56,189,248,0.08); border: 1px solid rgba(56,189,248,0.28);
  box-shadow: 0 0 30px rgba(56,189,248,0.12);
}
.rtrx-title { margin: 0 0 18px; line-height: .92; display: flex; flex-direction: column; }
.rtrx-title-shimmer {
  font-size: clamp(3.2rem, 11vw, 6.5rem); font-weight: 900; letter-spacing: -2px;
  background: linear-gradient(100deg, #fde68a 0%, #fff 25%, #fbbf24 45%, #fff 65%, #fca5a5 100%);
  background-size: 250% auto; -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent; color: transparent;
  filter: drop-shadow(0 6px 30px rgba(251,191,36,0.28));
}
.rtrx-title-sub {
  font-size: clamp(1.4rem, 5vw, 2.8rem); font-weight: 900; letter-spacing: .35em;
  color: #e2e8f0; padding-left: 4px; margin-top: 2px;
}
.rtrx-tagline { max-width: 620px; font-size: clamp(1rem, 2.4vw, 1.28rem); font-weight: 300;
  color: #cbd5e1; line-height: 1.5; margin: 0 0 26px; }
.rtrx-author { border-left: 3px solid #fbbf24; padding-left: 16px; margin-bottom: 30px; }
.rtrx-author-name { font-size: 1.05rem; font-weight: 700; color: #fff; }
.rtrx-author-role { font-size: .82rem; color: #94a3b8; margin-top: 3px; }

.rtrx-stats { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 34px; }
.rtrx-chip { font-size: 12.5px; font-weight: 600; padding: 7px 14px; border-radius: 999px;
  color: #cbd5e1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); }
.rtrx-chip-gold { color: #fcd34d; background: rgba(251,191,36,0.10); border-color: rgba(251,191,36,0.35);
  box-shadow: 0 0 24px rgba(251,191,36,0.12); }
.rtrx-chip-green { color: #6ee7b7; background: rgba(16,185,129,0.10); border-color: rgba(16,185,129,0.3); }

.rtrx-open {
  display: inline-flex; align-items: center; gap: 10px; text-decoration: none;
  font-weight: 800; font-size: 1rem; color: #1a1200;
  padding: 14px 28px; border-radius: 14px;
  background: linear-gradient(100deg, #fbbf24, #f59e0b);
  box-shadow: 0 12px 34px rgba(251,191,36,0.30), inset 0 1px 0 rgba(255,255,255,0.5);
  transition: transform .25s cubic-bezier(.2,.8,.2,1), box-shadow .25s;
}
.rtrx-open:hover { transform: translateY(-2px); box-shadow: 0 18px 48px rgba(251,191,36,0.44), inset 0 1px 0 rgba(255,255,255,0.6); }
.rtrx-open-arrow { transition: transform .25s; }
.rtrx-open:hover .rtrx-open-arrow { transform: translateX(4px); }

/* Embers ------------------------------------------------------------------ */
.rtrx-embers { position: absolute; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
.rtrx-ember { position: absolute; bottom: -12px; width: 4px; height: 4px; border-radius: 50%;
  background: radial-gradient(circle, #fde68a, rgba(251,191,36,0)); opacity: 0; }
.rtrx-ember-0 { left: 8%;  } .rtrx-ember-1 { left: 22%; width: 3px; height: 3px; }
.rtrx-ember-2 { left: 37%; } .rtrx-ember-3 { left: 54%; width: 5px; height: 5px; }
.rtrx-ember-4 { left: 71%; } .rtrx-ember-5 { left: 88%; width: 3px; height: 3px; }

/* Modules ----------------------------------------------------------------- */
.rtrx-module { margin-top: 56px; }
.rtrx-module-head { display: flex; align-items: center; gap: 16px; margin-bottom: 26px; }
.rtrx-rune {
  flex-shrink: 0; width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center;
  font-size: 1.5rem; font-weight: 900; color: #fcd34d;
  background: radial-gradient(circle at 30% 20%, rgba(251,191,36,0.22), rgba(124,58,237,0.10));
  border: 1px solid rgba(251,191,36,0.35); box-shadow: 0 0 30px rgba(251,191,36,0.15);
}
.rtrx-module-part { font-size: 11px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: #a78bfa; }
.rtrx-module-title { font-size: clamp(1.15rem, 3vw, 1.5rem); font-weight: 900; color: #fff; margin: 2px 0; }
.rtrx-module-hint { font-size: .85rem; color: #64748b; font-style: italic; }
.rtrx-module-line { flex: 1; height: 1px; background: linear-gradient(90deg, rgba(251,191,36,0.4), transparent); }

.rtrx-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }

/* Chapter cards ----------------------------------------------------------- */
.rtrx-card {
  position: relative; overflow: hidden; text-decoration: none; display: flex; flex-direction: column;
  padding: 20px; border-radius: 18px; min-height: 190px;
  background: linear-gradient(160deg, rgba(23,16,42,0.96), rgba(12,8,24,0.96));
  border: 1px solid rgba(139,92,246,0.18);
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  transition: transform .3s cubic-bezier(.2,.8,.2,1), border-color .3s, box-shadow .3s;
}
.rtrx-card:hover {
  transform: translateY(-6px) rotateX(3deg);
  border-color: rgba(251,191,36,0.5);
  box-shadow: 0 22px 50px rgba(124,58,237,0.28), 0 0 40px rgba(251,191,36,0.12);
}
.rtrx-card-sheen {
  position: absolute; top: 0; left: -60%; width: 55%; height: 100%; z-index: 1; pointer-events: none;
  background: linear-gradient(100deg, transparent, rgba(255,255,255,0.10), transparent);
  transform: skewX(-18deg); transition: left .6s ease;
}
.rtrx-card:hover .rtrx-card-sheen { left: 130%; }
.rtrx-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; position: relative; z-index: 2; }
.rtrx-num {
  width: 46px; height: 46px; border-radius: 12px; display: grid; place-items: center;
  background: radial-gradient(circle at 30% 25%, rgba(251,191,36,0.28), rgba(239,68,68,0.14));
  border: 1px solid rgba(251,191,36,0.4);
}
.rtrx-num-inner { font-size: 1.15rem; font-weight: 900; color: #fde68a; }
.rtrx-card-title { position: relative; z-index: 2; font-size: 1.02rem; font-weight: 800; color: #fff; line-height: 1.25; margin: 0 0 8px; }
.rtrx-card-desc { position: relative; z-index: 2; font-size: .8rem; color: #94a3b8; line-height: 1.5; margin: 0 0 16px;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; flex: 1; }
.rtrx-card-foot { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
.rtrx-card-time { font-size: .72rem; color: #64748b; }
.rtrx-card-title-link { text-decoration: none; position: relative; z-index: 2; }
.rtrx-card-title-link:hover .rtrx-card-title { color: #fcd34d; }
.rtrx-card-actions { position: relative; z-index: 2; display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
.rtrx-pill {
  display: inline-flex; align-items: center; gap: 5px; text-decoration: none;
  font-size: .72rem; font-weight: 700; padding: 5px 10px; border-radius: 8px;
  transition: transform .2s, box-shadow .2s;
}
.rtrx-pill:hover { transform: translateY(-1px); }
.rtrx-pill-green { color: #6ee7b7; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.35); }
.rtrx-pill-green:hover { box-shadow: 0 4px 16px rgba(16,185,129,0.25); }
.rtrx-pill-orange { color: #fdba74; background: rgba(249,115,22,0.12); border: 1px solid rgba(249,115,22,0.35); }
.rtrx-pill-orange:hover { box-shadow: 0 4px 16px rgba(249,115,22,0.25); }
.rtrx-card-read { display: inline-flex; align-items: center; gap: 5px; font-size: .78rem; font-weight: 800; color: #fcd34d; text-decoration: none; }
.rtrx-card-read svg { transition: transform .25s; }
.rtrx-card-read:hover svg { transform: translateX(4px); }

/* Closing ----------------------------------------------------------------- */
.rtrx-closing { margin-top: 64px; padding: 30px; border-radius: 18px; text-align: center;
  background: radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12), transparent 70%);
  border: 1px solid rgba(251,191,36,0.16); display: flex; flex-direction: column; align-items: center; gap: 10px; }
.rtrx-closing p { font-size: 1.05rem; font-style: italic; color: #cbd5e1; margin: 0; line-height: 1.6; }
.rtrx-closing span { display: block; font-style: normal; font-size: .82rem; color: #64748b; margin-top: 8px; }

/* Motion — only for users who haven't asked for reduced motion -------------- */
@media (prefers-reduced-motion: no-preference) {
  .rtrx-cover-img { animation: rtrxDrift 26s ease-in-out infinite alternate; }
  .rtrx-aurora { animation: rtrxAurora 18s ease-in-out infinite alternate; }
  .rtrx-title-shimmer { animation: rtrxShimmer 6s linear infinite; }
  .rtrx-card { opacity: 0; transform: translateY(24px); animation: rtrxRise .7s cubic-bezier(.2,.8,.2,1) forwards; }
  .rtrx-ember { animation: rtrxEmber linear infinite; }
  .rtrx-ember-0 { animation-duration: 7s;  animation-delay: 0s;   }
  .rtrx-ember-1 { animation-duration: 9s;  animation-delay: 1.5s; }
  .rtrx-ember-2 { animation-duration: 6s;  animation-delay: 3s;   }
  .rtrx-ember-3 { animation-duration: 11s; animation-delay: .6s;  }
  .rtrx-ember-4 { animation-duration: 8s;  animation-delay: 2.2s; }
  .rtrx-ember-5 { animation-duration: 10s; animation-delay: 4s;   }
}

@keyframes rtrxShimmer { to { background-position: 250% center; } }
@keyframes rtrxAurora { from { transform: translateX(-4%) rotate(-1deg); opacity: .4; } to { transform: translateX(4%) rotate(1deg); opacity: .65; } }
@keyframes rtrxDrift { from { transform: scale(1.05) translateY(0); } to { transform: scale(1.12) translateY(-14px); } }
@keyframes rtrxRise { to { opacity: 1; transform: translateY(0); } }
@keyframes rtrxEmber {
  0%   { transform: translateY(0) translateX(0); opacity: 0; }
  10%  { opacity: .9; }
  90%  { opacity: .5; }
  100% { transform: translateY(-78vh) translateX(24px); opacity: 0; }
}
`;
