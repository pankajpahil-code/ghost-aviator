import Link from "next/link";
import { Ghost, Send, Phone } from "lucide-react";
import EmailCapture from "./EmailCapture";
import { CPL_SUBJECTS } from "@/lib/subjects";

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <Ghost className="w-6 h-6" style={{ color: "#f0913a" }} />
              <span className="text-lg font-bold">Ghost <span style={{ color: "#f0913a" }}>Aviator</span></span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#64748b" }}>
              India&apos;s most comprehensive DGCA exam preparation platform. Built by pilots, for pilots.
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
                ["CPL & ATPL Notes",    "/notes"],
                ["DGCA Resources",      "/resources"],
                ["Study Guides",        "/guides"],
                ["DGCA Exam FAQ",       "/faq"],
                ["How Answers Are Verified", "/how-answers-are-verified"],
              ].map(([item, href]) => (
                <li key={item}>
                  <Link href={href} className="text-sm no-underline hover:text-white transition-colors" style={{ color: "#64748b" }}>{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CPL Subjects */}
          <div>
            <h4 className="text-sm font-semibold mb-4" style={{ color: "#f0913a" }}>CPL Subjects</h4>
            <ul className="flex flex-col gap-2">
              {CPL_SUBJECTS.map(s => [s.shortName, `/cpl/${s.id}`] as const).map(([item, href]) => (
                <li key={item}>
                  <Link href={href} className="text-sm no-underline" style={{ color: "#64748b" }}>{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
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
