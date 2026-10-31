import Link from "next/link";
import { Ghost, Send, Phone } from "lucide-react";
import EmailCapture from "./EmailCapture";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";
import { atplStudyLabel } from "@/lib/atpl-syllabus";
import { OFFICIAL_CHANNELS } from "@/lib/site";

// The footer's "Follow Ghost Aviator" row: the channels flagged `footer` in
// lib/site.ts, in that order, plus the /official hub that lists every account.
const FOOTER_SOCIALS = OFFICIAL_CHANNELS.filter(c => c.footer);

export default function Footer() {
  return (
    <footer style={{ background: "#0d0d1a", borderTop: "1px solid rgba(240,145,58,0.15)" }} className="mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newsletter / lead capture */}
        <div className="mb-10 pb-10" style={{ borderBottom: "1px solid rgba(240,145,58,0.1)" }}>
          <EmailCapture
            heading="Get new chapters & DGCA exam updates"
            sub="Join our mailing list — we'll email you when new notes, questions and mock tests go live."
            source="footer"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Ghost className="w-6 h-6" style={{ color: "#f0913a" }} />
              <span className="text-lg font-bold">Ghost <span style={{ color: "#f0913a" }}>Aviator</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#64748b" }}>
              DGCA CPL and ATPL exam preparation, with chapter notes, practice questions and mock tests.
              Free self-study for every student pilot in India.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="https://t.me/+tgLMJithc1gzOWJl" target="_blank" rel="noreferrer"
                 className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium no-underline"
                 style={{ background: "rgba(240,145,58,0.1)", color: "#f0913a", border: "1px solid rgba(240,145,58,0.2)" }}>
                <Send className="w-4 h-4" /> Join Telegram Community
              </a>
              <a href="tel:+919990226607"
                 className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium no-underline"
                 style={{ background: "rgba(240,145,58,0.05)", color: "#94a3b8", border: "1px solid rgba(240,145,58,0.15)" }}>
                <Phone className="w-4 h-4" /> +91 99902 26607
              </a>
            </div>
          </div>

          {/* Study Tools & Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "#f0913a" }}>Study Tools</h4>
            <ul className="flex flex-col gap-2">
              {[
                ["Video Lectures (CBT)", "/video-lectures"],
                ["Question Bank",       "/question-bank"],
                ["CPL Cost Calculator", "/cpl-cost-calculator"],
                ["RTR Radio Simulator", "/rtr-simulator"],
                ["ADAPT Test Practice", "/adapt-test"],
                ["DGCA Past Papers",    "/past-papers"],
                ["Exam Mode",           "/exam"],
                ["Free DGCA Mock Test", "/free-dgca-mock-test"],
                ["CPL & ATPL Notes",    "/notes"],
                ["DGCA Resources",      "/resources"],
                ["Study Guides",        "/guides"],
                ["Pilot Training in India", "/pilot-training-india"],
                ["DGCA Exam FAQ",       "/faq"],
                ["How Answers Are Verified", "/how-answers-are-verified"],
                ["Official Channels",   "/official"],
                ["Contact",             "/contact"],
                ["Terms",               "/terms"],
                ["Privacy",             "/privacy"],
              ].map(([item, href]) => (
                <li key={item}>
                  <Link href={href} className="text-sm no-underline hover:text-white transition-colors" style={{ color: "#64748b" }}>{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {([
            ["cpl", CPL_SUBJECTS],
            ["atpl", ATPL_SUBJECTS],
          ] as const).map(([track, subjects]) => (
            <nav key={track} aria-label={`${track.toUpperCase()} subjects`}>
              <h4 className="text-sm font-semibold mb-4" style={{ color: "#f0913a" }}>{track === "atpl" ? "ATPL Study & References" : "CPL Subjects"}</h4>
              <ul className="flex flex-col gap-2">
                {subjects.map(subject => (
                  <li key={subject.id}>
                    <Link href={`/${track}/${subject.id}`} className="text-sm no-underline hover:text-white transition-colors" style={{ color: "#64748b" }}>{track === "atpl" ? atplStudyLabel(subject.id, subject.shortName) : subject.shortName}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Follow Ghost Aviator — official social accounts */}
        <nav aria-label="Follow Ghost Aviator" className="mt-10 pt-6" style={{ borderTop: "1px solid rgba(240,145,58,0.1)" }}>
          <h4 className="text-sm font-semibold mb-3" style={{ color: "#f0913a" }}>Follow Ghost Aviator</h4>
          <ul className="flex flex-wrap gap-2 list-none p-0 m-0">
            {FOOTER_SOCIALS.map(c => (
              <li key={c.href}>
                <a href={c.href} target="_blank" rel="me noopener noreferrer"
                   aria-label={`Ghost Aviator on ${c.footer}`}
                   className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm no-underline hover:text-white transition-colors"
                   style={{ background: "rgba(240,145,58,0.06)", color: "#94a3b8", border: "1px solid rgba(240,145,58,0.15)" }}>
                  {c.footer}
                </a>
              </li>
            ))}
            <li>
              <Link href="/official"
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium no-underline"
                    style={{ background: "rgba(240,145,58,0.1)", color: "#f0913a", border: "1px solid rgba(240,145,58,0.2)" }}>
                All official channels →
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-6 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
             style={{ borderTop: "1px solid rgba(240,145,58,0.1)" }}>
          <p className="text-xs" style={{ color: "#475569" }}>
            © {new Date().getFullYear()} Ghost Aviator. Made with ❤️ for Indian aviation students.
          </p>
          <p className="text-xs" style={{ color: "#475569" }}>
            Free access for every student pilot — always.
          </p>
        </div>
      </div>
    </footer>
  );
}
