import type { Metadata } from "next";
import Link from "next/link";
import { Radio, Mic, BookOpen, Award, Dices, Play, Volume2, Repeat, ClipboardCheck } from "lucide-react";
import GhostTower, { LockedScenarios } from "./GhostTower";

export const metadata: Metadata = {
  title: "Radio Simulator — RTR(A) R/T Practice | Ghost Aviator",
  description:
    "India's first RTR(A) radio simulator. Talk to ATC, read back clearances, handle emergencies, get graded like the real WPC exam — free for every student pilot.",
};

const cyan = "#00d4ff";

// The theory backbone: the phraseology chapters of the RTR(A) book that this
// simulator drills. Keep in step with lib/subjects.ts radio-telephony chapters.
const THEORY_CHAPTERS = [
  { ch: "rtf-13", label: "Ch 13 · Phonetics, numbers & standard words" },
  { ch: "rtf-14", label: "Ch 14 · Call signs & read-back rules" },
  { ch: "rtf-15", label: "Ch 15 · Aerodrome control — taxi to take-off" },
  { ch: "rtf-17", label: "Ch 17 · Approach control & radar" },
  { ch: "rtf-18", label: "Ch 18 · Area control & position reports" },
  { ch: "rtf-20", label: "Ch 20 · Distress, urgency & radio failure" },
];

const HOW_TO = [
  {
    icon: Play,
    title: "1 · Pick a scenario and a mode",
    body: "Start with Scenario 1 in LEARN mode — phrase chips build your calls for you and the radio tunes itself. When the words start coming on their own, switch to PRACTICE: no chips, you speak or type every call from memory, and you work the radio yourself.",
  },
  {
    icon: BookOpen,
    title: "2 · Read the briefing like a preflight",
    body: "Every flight rolls fresh: your callsign, the airport, the runway, the ATIS letter, the QNH, the wind. The briefing card holds all of it — the examiner expects you to arrive knowing your own details, and so does the simulator.",
  },
  {
    icon: Mic,
    title: "3 · Transmit",
    body: "When it's your turn, the cue line (✦) tells you what the situation demands. HOLD the round mic button while you speak, release to send — or tap the chips in order (Learn) / type your call (Practice) and press TRANSMIT. End every read-back with your callsign.",
  },
  {
    icon: Volume2,
    title: "4 · Missed a call? SAY AGAIN",
    body: "The amber SAY AGAIN button replays the last ATC transmission — exactly the phrase a real pilot uses. Use it freely; listening is half of radiotelephony.",
  },
  {
    icon: Radio,
    title: "5 · Work the radio head and transponder",
    body: "On a handoff (“contact Tower one one eight decimal one”), dial the STANDBY frequency with the M−/M+/k−/k+ knobs and press ⇄ to make it active — in Practice mode, calling on the wrong frequency gets you nothing but static. When ATC assigns a squawk, tap the SQK digits to set it; IDENT flashes your radar return when a controller asks for it.",
  },
  {
    icon: Repeat,
    title: "6 · The examiner probes — answer",
    body: "Miss a mandatory item and ATC probes you, exactly like the WPC practical: “confirm QNH?”. Get it wrong and you're corrected and asked to read back again. Each probe costs one point — the flight continues either way.",
  },
  {
    icon: ClipboardCheck,
    title: "7 · Debrief on the gradesheet",
    body: "Every transmission is graded item by item — read-backs, callsign discipline, non-standard words, even your speech rate and filler words on voice calls. 50% is the pass mark, the same as RTR(A) Part 2. Fly the SAME flight again to beat your score, or roll a NEW one — no two are alike.",
  },
];

export default function RtrSimulatorPage() {
  return (
    <div className="grid-bg min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(0,212,255,0.2)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,212,255,0.15) 0%, transparent 70%)" }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <div className="inline-block text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-5"
               style={{ color: cyan, border: "1px solid rgba(0,212,255,0.35)", background: "rgba(0,212,255,0.08)", letterSpacing: "0.18em" }}>
            INDIA&apos;S FIRST R/T PRACTICE SIMULATOR
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4">
            Radio <span className="gradient-text">Simulator</span>
          </h1>
          <p className="max-w-2xl mb-3" style={{ color: "#94a3b8" }}>
            The RTR(A) written paper tests what you know. Part 2 tests how you <em>sound</em> —
            live, on frequency, with an examiner playing ATC. The Radio Simulator puts you on
            that frequency today: real ICAO phraseology, mandatory read-backs, examiner probes,
            emergencies, and a gradesheet at the end.
          </p>
          <div className="flex flex-wrap gap-4 text-xs" style={{ color: "#64748b" }}>
            <span className="flex items-center gap-1.5"><Mic className="w-4 h-4" /> Speak or tap your calls</span>
            <span className="flex items-center gap-1.5"><Radio className="w-4 h-4" /> ATC voice with real radio feel</span>
            <span className="flex items-center gap-1.5"><Award className="w-4 h-4" /> Graded to the 50% Part-2 pass mark</span>
            <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Every rule cross-linked to the RTR(A) book</span>
            <span className="flex items-center gap-1.5"><Dices className="w-4 h-4" /> No two flights the same — airport, weather, callsign &amp; traffic roll fresh</span>
          </div>
        </div>
      </div>

      {/* Simulator */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <GhostTower />
        <LockedScenarios />

        {/* How to use it — students meet a cockpit here, give them the walkaround */}
        <section id="how-to-use" className="mt-14">
          <h2 className="text-2xl font-black text-white mb-2">
            New to the simulator? <span className="gradient-text">Here&apos;s your walkaround</span>
          </h2>
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            Seven things and you&apos;re ready to key the mic. Nothing here bites — mistakes
            cost points, never progress, and every flight can be flown again.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HOW_TO.map(({ icon: Icon, title, body }) => (
              <div key={title} className="glass-card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 shrink-0" style={{ color: cyan }} />
                  <span className="font-bold text-white text-sm">{title}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Theory backbone — the Captain's book chapters behind every call */}
        <section className="mt-12">
          <h2 className="text-2xl font-black text-white mb-2">
            The theory behind every call — <span className="gradient-text">read it in the book</span>
          </h2>
          <p className="text-sm mb-5" style={{ color: "#64748b" }}>
            Every phrase this simulator grades is taught in the complete RTR(A) book, free on
            this site — written for the DGCA/WPC syllabus and aligned with the ICAO Manual of
            Radiotelephony. Fly a scenario, then read the chapter it drilled — that loop is
            how the phraseology becomes yours.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {THEORY_CHAPTERS.map(({ ch, label }) => (
              <Link key={ch} href={`/cpl/radio-telephony/${ch}/notes`}
                    className="glass-card p-4 no-underline block group">
                <span className="text-xs font-bold flex items-center gap-2" style={{ color: "#cbd5e1" }}>
                  <BookOpen className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" style={{ color: cyan }} />
                  {label}
                </span>
              </Link>
            ))}
          </div>
          <p className="text-sm mt-6" style={{ color: "#475569" }}>
            Or start at the beginning: the complete{" "}
            <Link href="/cpl/radio-telephony" className="underline font-bold" style={{ color: cyan }}>
              RTR(A) book — all 24 chapters
            </Link>{" "}
            covers regulations, radio theory and the full exam arsenal behind this simulator.
          </p>
        </section>
      </div>
    </div>
  );
}
