import Link from "next/link";
import type { Metadata } from "next";
import { ClipboardList, IdCard, HeartPulse, Scale, ExternalLink, ChevronRight, Calendar, BadgeCheck, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "DGCA Resources & Official Links — Ghost Aviator",
  description:
    "Official DGCA links for Indian pilot students: PARIKSHA exam portal, exam schedule & results, eGCA licensing, Class 1/2 medical, CARs and regulations.",
  alternates: { canonical: "/resources" },
};

type ResourceLink = { label: string; href: string; desc: string };
type Group = { title: string; icon: React.ElementType; color: string; links: ResourceLink[] };

const GROUPS: Group[] = [
  {
    title: "Exams & Registration",
    icon: ClipboardList,
    color: "#f0913a",
    links: [
      { label: "PARIKSHA — DGCA Exam Portal", href: "https://pariksha.dgca.gov.in/", desc: "Register and book your CPL/ATPL computer-based exams (replaces VIMAN/UDAAN)." },
      { label: "Exam Schedule / Notice Board", href: "https://pariksha.dgca.gov.in/Form/Notice_Board_General_PLT", desc: "Regular sessions in Mar, Jun, Sep & Dec plus monthly on-demand (OLODE) windows." },
      { label: "DGCA Examination Results", href: "https://www.dgca.gov.in/digigov-portal/?page=4231%2F4203%2Fsericename", desc: "Check your flight-crew written exam results." },
      { label: "PARIKSHA — Pilot FAQs", href: "https://pariksha.dgca.gov.in/Form/PLT_FAQs", desc: "Official answers on registration, eligibility and exam process." },
    ],
  },
  {
    title: "Licensing (eGCA)",
    icon: IdCard,
    color: "#f3c889",
    links: [
      { label: "eGCA Portal", href: "https://www.egca.gov.in/", desc: "Create your eGCA ID and apply for licences/ratings (EPL). Every Indian pilot needs one." },
      { label: "DGCA — Flight Crew Licensing", href: "https://www.dgca.gov.in/digigov-portal/", desc: "FCL circulars, CPL/ATPL requirements and procedures." },
    ],
  },
  {
    title: "Medical",
    icon: HeartPulse,
    color: "#ef4444",
    links: [
      { label: "Class 1 Medical Examiner List", href: "https://www.dgca.gov.in/digigov-portal/?page=jsp/dgca/InventoryList/personal/medical/class1/Class1.pdf", desc: "DGCA-approved Class 1 medical centres (initial Class 1 at an IAF centre)." },
      { label: "Class 2 Medical Examiner List", href: "https://www.dgca.gov.in/digigov-portal/?page=jsp%2Fdgca%2FInventoryList%2Fpersonal%2Fmedical%2Fclass2%2FClass2.pdf", desc: "DGCA-empanelled examiners for the Class 2 assessment." },
      { label: "Book Medical via eGCA", href: "https://www.egca.gov.in/", desc: "Apply for the medical NOC and book appointments through eGCA." },
    ],
  },
  {
    title: "Regulations & Reference",
    icon: Scale,
    color: "#10b981",
    links: [
      { label: "Civil Aviation Requirements (CAR)", href: "https://www.dgca.gov.in/digigov-portal/?dynamicPage=CivilAviationReqContent%2F6%2F256%2FviewDynamicRuleContLvl2%2Fhtml&maincivilAviationRequirements%2F6%2F0%2FviewDynamicRulesReq=", desc: "All CAR sections — Section 7 (Flight Crew Standards) is core for CPL/ATPL." },
      { label: "DGCA — Official Website", href: "https://www.dgca.gov.in/", desc: "Aircraft Act 1934, Aircraft Rules 1937, circulars and notices." },
      { label: "Airports Authority of India (AAI)", href: "https://www.aai.aero/", desc: "AIP India, NOTAMs, charts and aerodrome information." },
    ],
  },
];

const QUICK_FACTS: { icon: React.ElementType; label: string; value: string }[] = [
  { icon: BadgeCheck, label: "Pass Mark",        value: "70% / paper" },
  { icon: Award,      label: "Negative Marking", value: "None" },
  { icon: Calendar,   label: "Main Sessions",    value: "Mar · Jun · Sep · Dec" },
  { icon: ClipboardList, label: "Exam Fee",      value: "₹2,500 / paper" },
];

export default function ResourcesPage() {
  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen">

      {/* Header */}
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(240,145,58,0.2)" }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(240,145,58,0.15) 0%, transparent 65%)" }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold mb-5"
               style={{ background: "rgba(240,145,58,0.1)", border: "1px solid rgba(240,145,58,0.3)", color: "#f0913a" }}>
            <ExternalLink className="w-4 h-4" /> Official Links
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">DGCA Resources</h1>
          <p className="text-base max-w-2xl mx-auto" style={{ color: "#64748b" }}>
            Every official DGCA link an Indian CPL/ATPL student needs — exams, licensing, medical and regulations — in one place.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Quick facts */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-12">
          {QUICK_FACTS.map(f => (
            <div key={f.label} className="rounded-2xl p-4 text-center"
                 style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <f.icon className="w-5 h-5 mx-auto mb-2" style={{ color: "#f0913a" }} />
              <div className="text-base font-black text-white">{f.value}</div>
              <div className="text-xs" style={{ color: "#475569" }}>{f.label}</div>
            </div>
          ))}
        </div>

        {/* Resource groups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {GROUPS.map(group => (
            <div key={group.title} className="rounded-2xl p-6"
                 style={{ background: "rgba(17,24,32,0.95)", border: `1px solid ${group.color}25` }}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ background: `${group.color}18`, border: `1px solid ${group.color}40` }}>
                  <group.icon className="w-5 h-5" style={{ color: group.color }} />
                </div>
                <h2 className="text-lg font-black text-white">{group.title}</h2>
              </div>

              <div className="flex flex-col gap-2.5">
                {group.links.map(link => (
                  <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer"
                     className="block rounded-xl p-3.5 no-underline group"
                     style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-bold text-white">{link.label}</span>
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" style={{ color: group.color }} />
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{link.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Study CTA */}
        <div className="rounded-2xl p-6 mt-10 flex items-center gap-5 flex-wrap"
             style={{ background: "linear-gradient(135deg, rgba(171,121,77,0.15), rgba(255,32,96,0.08))", border: "1px solid rgba(171,121,77,0.35)" }}>
          <div className="text-3xl">🎯</div>
          <div className="flex-1 min-w-[200px]">
            <h3 className="font-black text-white mb-1">Booked your exam? Start preparing.</h3>
            <p className="text-sm" style={{ color: "#64748b" }}>Free chapter notes, quizzes and full DGCA-format mock tests.</p>
          </div>
          <Link href="/cpl" className="inline-flex items-center gap-1 text-sm font-bold px-4 py-2 rounded-xl no-underline"
                style={{ background: "rgba(171,121,77,0.25)", border: "1px solid rgba(171,121,77,0.45)", color: "#f3c889" }}>
            Start CPL Prep <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-center mt-8 max-w-2xl mx-auto" style={{ color: "#475569" }}>
          These links point to official Government of India / DGCA websites. Always confirm the latest exam dates, fees and
          procedures on the <a href="https://pariksha.dgca.gov.in/" target="_blank" rel="noopener noreferrer" className="no-underline" style={{ color: "#f0913a" }}>PARIKSHA portal</a> —
          DGCA notices take precedence over anything shown here.
        </p>

      </div>
    </div>
  );
}
