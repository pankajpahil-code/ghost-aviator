import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, Dices, Gauge, ListChecks, Move, ShieldCheck, Timer } from "lucide-react";
import AdaptRunner from "./AdaptRunner";
import { MODULES, MODULE_IDS } from "@/lib/adapt/session.mjs";

// Derived, never hardcoded — adding a module to the registry updates this line,
// the runner and the briefing together, so they cannot drift apart.
const COUNT_WORD = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight"];
const moduleNames = MODULE_IDS.map((id) => MODULES[id].name);
const liveModules = `${COUNT_WORD[moduleNames.length] ?? moduleNames.length} modules live now — ${moduleNames
  .slice(0, -1)
  .join(", ")} and ${moduleNames[moduleNames.length - 1]}.`;

export const metadata: Metadata = {
  title: "ADAPT Test Practice — Free Airline Screening Aptitude Simulator | Ghost Aviator",
  // Keep this in step with the module registry. It named only maths and physics
  // for two releases after the spatial and tracking modules shipped — a search
  // snippet that undersells the page is a slow, invisible leak.
  description:
    "Free ADAPT-style airline screening practice: timed aviation maths, physics, spatial reasoning and a psychomotor control task, scored on the stanine 1–9 scale. No calculator.",
  alternates: { canonical: "/adapt-test" },
};

const cyan = "#f0913a";

// Product facts only — every answer restates something published on this page.
const FAQ_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is this ADAPT practice free?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every module is free, with no account required and no limit on how many times you can sit it. Ghost Aviator does not charge student pilots for exam preparation.",
      },
    },
    {
      "@type": "Question",
      name: "How is the ADAPT practice test scored?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Each module is scored on the stanine scale of 1 to 9, the standard used in airline screening, where 5 is the middle of the range. The raw score needed for each stanine is published on your result page, so you can check the grade yourself.",
      },
    },
    {
      "@type": "Question",
      name: "Are the practice questions the same every time?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Every question is generated fresh from a random seed, so no two sessions are alike. That trains the underlying skill rather than letting you memorise a fixed set of answers.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use a calculator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No, and you should not practise with one. Airline screening batteries prohibit calculators, so every question here is built to be solved by mental arithmetic inside the time limit.",
      },
    },
    {
      "@type": "Question",
      name: "Does every question show how the answer is worked out?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every question carries a full worked solution, and if you pick a wrong option the review explains the specific mistake that produces that particular answer.",
      },
    },
    {
      "@type": "Question",
      name: "What data does the ADAPT practice collect?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "An anonymous score line per module — which module you sat, the stanine, and one percentage. Your answers, your workings and everything from the attitudes questionnaire stay on your device and are never sent. No account is required, and you can switch the score line off on your result page.",
      },
    },
  ],
};

const FEATURES = [
  { icon: Timer, title: "Timed, module by module", body: "Each module runs against its own clock, back to back, the way a screening battery does. The clock keeps running if you switch tabs — because in the real assessment it does too." },
  { icon: Calculator, title: "No calculator, by design", body: "Screening batteries prohibit them. Every question is built to fall out of mental arithmetic inside the time available, so practising here builds the habit the real thing demands." },
  { icon: Dices, title: "Never the same paper twice", body: "Questions are generated from a random seed rather than drawn from a fixed bank. You cannot memorise your way through it, which is the whole point — you train the skill, not the answers." },
  { icon: Gauge, title: "Scored on the stanine scale", body: "The 1 to 9 scale airline screening uses, with 5 at the middle. The raw score needed for each stanine is printed on your result, so nothing about the grade is hidden from you." },
  { icon: ListChecks, title: "Every mistake explained", body: "Each wrong option corresponds to a specific error — forgetting to convert minutes to hours, using cosine where sine belongs. Pick one and the review names the mistake rather than just marking you down." },
  { icon: ShieldCheck, title: "Your answers stay on your device", body: "The whole test is generated and scored in your browser, and your answers, your workings and your attitudes questionnaire never leave it. We do record an anonymous score line per module — which module, the stanine, one percentage — so we can see how students are doing and eventually replace our provisional grade bands with real ones. No name, no account needed, and you can switch it off on your result page." },
  { icon: Move, title: "A real hand-eye test, not just questions", body: "The Control & Co-ordination module gives you a marker that drifts for a full minute while you hold it on the centre. Drag it, or plug in a joystick and it is used automatically. You are scored on how much of the drift you actually cancelled — and only ever against others using the same kind of input." },
];

// The four-week shape the research recommends: build the raw skills first,
// layer the motor and attention load on top, then rehearse whole and rest.
// Deliberately not a "revision timetable" — none of this is knowledge.
const PLAN = [
  {
    week: 1,
    title: "Build the arithmetic habit",
    body: "Mental maths and physics every day, no calculator, no exceptions. This is the week that decides your ceiling — everything later is layered on top of how fast the sums come. Short and daily beats long and occasional.",
    modules: "Aviation Maths · Physics & Mechanical Reasoning",
  },
  {
    week: 2,
    title: "Add orientation and the motor loop",
    body: "Keep the daily maths, and bring in headings, instruments and the tracking task. The see-decide-move loop improves with repetition faster than almost anything else here, but only if it is worked regularly.",
    modules: "Spatial & Pattern · Control & Co-ordination",
  },
  {
    week: 3,
    title: "Put it under load",
    body: "Now the divided-attention module, and full sittings under the clock. Expect your maths to get worse the moment something else is competing for you — that drop is the thing being measured, and it is what this week trains away.",
    modules: "Divided Attention · full sessions",
  },
  {
    week: 4,
    title: "Consolidate, then rest",
    body: "Light sittings, review your progress panel rather than chasing new ground, and read the attitudes module properly. Sleep matters more than one more practice run — arriving tired undoes a month of this.",
    modules: "Attitudes & Airmanship · English · light review",
  },
];

export default function AdaptTestPage() {
  return (
    <div className="grid-bg min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }} />

      <div className="relative overflow-hidden" style={{ borderBottom: "1px solid rgba(240,145,58,0.2)" }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(240,145,58,0.15) 0%, transparent 70%)" }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <div className="inline-block text-xs font-bold tracking-widest px-4 py-2 rounded-full mb-5"
               style={{ color: cyan, border: "1px solid rgba(240,145,58,0.35)", background: "rgba(240,145,58,0.08)", letterSpacing: "0.18em" }}>
            FREE AIRLINE SCREENING APTITUDE PRACTICE
          </div>
          <h1 className="text-5xl sm:text-6xl font-black text-white mb-4">
            ADAPT <span className="gradient-text">Test Practice</span>
          </h1>
          <p className="max-w-2xl mb-3" style={{ color: "#94a3b8" }}>
            Cadet programmes screen applicants on aptitude long before they look at your logbook —
            timed mental arithmetic, physics, spatial reasoning and multitasking, under a clock, with
            no calculator. Most candidates meet that pressure for the first time on the day. This is
            where you meet it beforehand, as many times as you want, free.
          </p>
          <p className="text-xs" style={{ color: "#64748b" }}>
            {liveModules} More modules are being built.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AdaptRunner />

        <section className="mt-14">
          <h2 className="text-2xl font-black text-white mb-2">
            How this practice <span className="gradient-text">actually works</span>
          </h2>
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            Six things worth knowing before you start.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
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

        <section className="mt-12">
          <h2 className="text-2xl font-black text-white mb-2">
            Where the <span className="gradient-text">theory</span> behind it lives
          </h2>
          <p className="text-sm mb-5" style={{ color: "#64748b" }}>
            An aptitude score improves when the underlying knowledge is solid. Both of these
            subjects are already written out in full on this site, free.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/cpl/air-navigation" className="glass-card p-4 no-underline block">
              <span className="text-xs font-bold" style={{ color: "#cbd5e1" }}>
                Air Navigation — speed, distance, time, fuel, headings and bearings
              </span>
            </Link>
            <Link href="/cpl/technical-general" className="glass-card p-4 no-underline block">
              <span className="text-xs font-bold" style={{ color: "#cbd5e1" }}>
                Technical General — forces, motion, energy and the principles of flight
              </span>
            </Link>
            <Link href="/cpl/instrumentation" className="glass-card p-4 no-underline block">
              <span className="text-xs font-bold" style={{ color: "#cbd5e1" }}>
                Instrumentation — the direction indicator and the rest of the panel
              </span>
            </Link>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black text-white mb-2">
            Four weeks out? <span className="gradient-text">Here is the plan</span>
          </h2>
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            Most candidates cram aptitude the way they cram a written paper, in the last week. It
            does not work, because none of this is knowledge — it is capacity, and capacity is
            built the way fitness is: little, often, and early enough to matter.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLAN.map(({ week, title, body, modules }) => (
              <div key={week} className="glass-card p-5">
                <div className="text-xs font-bold tracking-widest mb-1" style={{ color: cyan, letterSpacing: "0.15em" }}>
                  WEEK {week}
                </div>
                <div className="font-bold text-white mb-2">{title}</div>
                <p className="text-xs leading-relaxed mb-3" style={{ color: "#94a3b8" }}>{body}</p>
                <div className="text-xs" style={{ color: "#64748b" }}>{modules}</div>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: "#475569" }}>
            Twenty minutes a day beats three hours on a Sunday. The modules are free and unlimited,
            so there is no reason to ration them.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-xl font-black text-white mb-3">Honest notes on this practice</h2>
          <div className="glass-card p-5 text-xs leading-relaxed space-y-3" style={{ color: "#94a3b8" }}>
            <p>
              <strong className="text-white">Your stanine is measured against a published standard,
              not against other students.</strong> The raw score needed for each grade is printed on
              your result page and you can check it yourself. We will not print a score derived from
              a population we have not actually measured.
            </p>
            <p>
              <strong className="text-white">A good score here is not a prediction.</strong> It tells
              you your arithmetic is fast and accurate under a clock, which is worth knowing. It is
              not a forecast of any airline&apos;s decision, and nobody who tells you otherwise can
              back it up.
            </p>
            <p>
              <strong className="text-white">Question counts and time limits are provisional.</strong>{" "}
              They reflect the shape these batteries are commonly reported to take. As we confirm the
              real format, this practice is adjusted to match — and this note will say so.
            </p>
            <p style={{ color: "#64748b" }}>
              Independent practice material, written from scratch for Indian student pilots. Not
              affiliated with, endorsed by, or connected to the publisher of the ADAPT assessment or
              to any airline.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
