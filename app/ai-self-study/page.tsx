import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Bot,
  CheckCircle,
  ClipboardList,
  CreditCard,
  FileText,
  HelpCircle,
  Smartphone,
  Lock,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  VideoOff,
  XCircle,
} from "lucide-react";
import AskGiniButton from "@/app/components/AskGiniButton";
import {
  AI_SELF_STUDY_CHECKOUT_LIVE,
  AI_SELF_STUDY_PLANS,
  AI_SELF_STUDY_UPGRADE_NOTE,
  aiSelfStudyEnrollLink,
  hasAiSelfStudyPaymentLink,
} from "@/lib/ai-self-study";
import { LIVE_PRICE, LIVE_WHATSAPP } from "@/lib/live-classes";
import { ORG_ID, PERSON_ID, SITE_URL } from "@/lib/site";

const ACCENT = "#38bdf8";
const GOLD = "#f3c889";
const CARD = "rgba(17,24,32,0.95)";
const HAIRLINE = "1px solid rgba(56,189,248,0.2)";

const WHATSAPP_AI = `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
  "Hello Captain, I have a question about the AI Self-Study plan. Please help me choose.",
)}`;

export const metadata: Metadata = {
  title: "AI Self-Study for DGCA CPL & ATPL | Gini, Notes & Mocks",
  description:
    "Ghost Aviator AI Self-Study: the full DGCA CPL/ATPL library plus Gini, a study partner that answers from the Captain's notes and cites the chapter. No recordings. Monthly, six-month and annual plans.",
  keywords: [
    "DGCA CPL AI study",
    "DGCA ATPL AI tutor",
    "Gini Ghost Aviator",
    "AI pilot exam preparation India",
    "DGCA self study subscription",
    "DGCA question bank with AI",
  ],
  alternates: { canonical: "/ai-self-study" },
  openGraph: {
    title: "AI Self-Study with Gini | Ghost Aviator",
    description:
      "Your DGCA syllabus, explained 24/7 — with the Captain's notes behind every answer. The free library, Gini, a study plan, and no recordings.",
    url: `${SITE_URL}/ai-self-study`,
    type: "website",
  },
};

const GETS = [
  {
    icon: BookOpen,
    title: "The library, organised",
    body: "Chapter notes, the verified question bank, past papers, chapter quizzes and exam-mode mocks — the same material free students use. The paid plan adds the study system around it, not a lock on the library.",
  },
  {
    icon: Bot,
    title: "Gini, built into your week",
    body: "Ask a question and get an answer drawn from the Captain's published notes, with a link back to the chapter. Gini is free on every page; the plan gives you a weekly routine for using him.",
  },
  {
    icon: ClipboardList,
    title: "A plan you can follow",
    body: "Study-plan templates and weekly targets built around your exam date, your subjects and the hours you actually have. Gini helps you adjust when life moves the plan.",
  },
  {
    icon: Target,
    title: "Practice that finds the gaps",
    body: "Chapter quizzes and full mocks with answers and explanations. Review the misses, not just the score, and take the weak topics back into the notes.",
  },
  {
    icon: Smartphone,
    title: "Works on the phone you have",
    body: "No new app, no downloads, no recordings to store. Open the chapter or Gini in the browser you already use — on the phone, tablet or laptop you have.",
  },
  {
    icon: Users,
    title: "A human room, monthly",
    body: "On the six-month and annual plans, a monthly group Q&A with the Captain for the questions Gini could not settle. Written class summaries from live cohorts — never recordings.",
  },
] as const;

const DOES_NOT = [
  "No live classes. Those are the separate Live Cohort.",
  "No 1:1 mentorship. The live cohort is the direct human room.",
  "No recordings. Ever. Not of live classes, not of Gini.",
  "No guaranteed pass, licence, job or salary. Anyone who promises that is lying.",
] as const;

const HOW = [
  {
    n: "1",
    title: "Start with the free library",
    body: "Read a chapter, sit a mock, or ask Gini one question. You do not have to pay to find out whether the teaching fits you.",
  },
  {
    n: "2",
    title: "Choose a plan when you need the whole system",
    body: "The paid plan adds the structure: weekly targets, a mock-review routine, and the monthly group Q&A on the six-month and annual plans. The library and Gini stay free.",
  },
  {
    n: "3",
    title: "Bring the hard questions to the Captain",
    body: "If you need accountability, live explanation and a batch that keeps you honest, the Live Cohort is the next step. It stays premium because his time is finite.",
  },
] as const;

const FAQ = [
  {
    q: "What is Ghost Aviator AI Self-Study?",
    a: "It is a paid study system built on top of the free Ghost Aviator CPL/ATPL library. It adds weekly planning, a mock-review routine, Gini as a daily study partner, and on the six-month and annual plans, a monthly group Q&A with the Captain. Gini answers from the Captain's published notes and question explanations, links back to the chapter, and says when it does not have a verified answer. It does not include live classes or recordings.",
  },
  {
    q: "Is Gini just ChatGPT with a different name?",
    a: "No. Gini is deliberately bounded to Ghost Aviator's published material. It retrieves stored, Captain-reviewed answers rather than composing aviation facts from the open internet. When the material does not contain a verified answer, it refuses and sends the student to the Captain or the source.",
  },
  {
    q: "Do I get recordings of the live classes?",
    a: "No. Ghost Aviator does not sell recordings. A recording becomes a file that is forwarded and resold, and it detaches the teaching from the teacher. Live-cohort students receive written class notes and summaries after each session. Anyone offering Ghost Aviator recordings is not us.",
  },
  {
    q: "Can Gini replace the live class?",
    a: "No. Gini explains, quizzes and helps you plan. It cannot see whether you did the work, cannot judge whether you are ready for the exam, and cannot give you the Captain's judgment on strategy, subject order or a flight-school decision. That is what the live cohort is for.",
  },
  {
    q: "How accurate is Gini?",
    a: "Gini is in founding beta. It answers only from published Ghost Aviator material and refuses when it has no verified answer. We will publish corrections when we find them and will not make an accuracy claim we cannot support.",
  },
  {
    q: "Can I upgrade to the live cohort later?",
    a: "Yes. AI Self-Study and the Live Cohort are separate products. The subscription does not automatically include live classes, but the Captain will help you choose the right next step. Message him on WhatsApp before you pay for an upgrade.",
  },
  {
    q: "Is my data safe?",
    a: "Read the Privacy Policy for what is stored and how to ask us to delete it. Do not paste Aadhaar numbers, medical reports, passwords or other sensitive documents into any AI chat. Gini needs the aviation question, not your identity documents.",
  },
] as const;

export default function AiSelfStudyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/ai-self-study`,
        name: "AI Self-Study for DGCA CPL & ATPL",
        description: metadata.description,
        url: `${SITE_URL}/ai-self-study`,
        inLanguage: "en-IN",
        author: { "@id": PERSON_ID },
        publisher: { "@id": ORG_ID },
        about: { "@id": ORG_ID },
        dateModified: "2026-10-20",
      },
      {
        "@type": "Product",
        "@id": `${SITE_URL}/ai-self-study#product`,
        name: "Ghost Aviator AI Self-Study",
        description:
          "A DGCA CPL/ATPL study subscription combining the full Ghost Aviator library with Gini, an AI study partner bounded to the Captain's notes. No recordings.",
        brand: { "@id": ORG_ID },
        offers: AI_SELF_STUDY_PLANS.map(plan => ({
          "@type": "Offer",
          name: plan.name,
          price: plan.priceValue,
          priceCurrency: "INR",
          availability: AI_SELF_STUDY_CHECKOUT_LIVE
            ? "https://schema.org/InStock"
            : "https://schema.org/PreOrder",
          url: `${SITE_URL}/ai-self-study#plans`,
        })),
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/ai-self-study#gini`,
        name: "Gini",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web",
        url: `${SITE_URL}/ai-self-study`,
        description:
          "Ghost Aviator's AI study partner. It answers from the Captain's published notes, cites the chapter, and refuses when it has no verified source.",
        isAccessibleForFree: true,
        publisher: { "@id": ORG_ID },
        featureList: [
          "Chapter-cited answers",
          "Chapter quizzes",
          "Study-plan templates",
          "Works on phone, tablet and laptop",
          "Refuses when no verified answer exists",
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/ai-self-study#faq`,
        mainEntity: FAQ.map(f => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/ai-self-study#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "AI Self-Study" },
        ],
      },
    ],
  };

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ borderBottom: `1px solid ${ACCENT}22` }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 85% 55% at 50% 0%, ${ACCENT}20 0%, transparent 70%)` }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black mb-5"
            style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.35)", color: ACCENT }}
          >
            <Sparkles className="w-3.5 h-3.5" /> FOUNDING BETA · GINI IS LIVE
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-5">
            Your DGCA syllabus, explained 24/7 —{" "}
            <span style={{ color: GOLD }}>with the Captain&apos;s notes behind every answer.</span>
          </h1>
          <p className="text-lg max-w-3xl mx-auto leading-relaxed mb-8" style={{ color: "#94a3b8" }}>
            Full notes, CPL and ATPL question banks, mock tests, past papers, and Gini — your AI study partner.
            No recordings. No shortcuts. A clear plan and a teacher-verified library.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-5">
            <AskGiniButton
              query="Explain how to plan my DGCA CPL preparation around my exam date."
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-base font-black no-underline"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #2563eb)`, color: "#fff", boxShadow: "0 0 30px rgba(56,189,248,0.35)", border: 0, cursor: "pointer" }}
            >
              <Bot className="w-5 h-5" /> Ask Gini now
            </AskGiniButton>
            <a
              href="#plans"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl text-base font-bold no-underline"
              style={{ border: `1px solid ${ACCENT}55`, color: "#bae6fd", background: `${ACCENT}0d` }}
            >
              See the plans <ArrowRight className="w-5 h-5" />
            </a>
          </div>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Gini is live on every page. The AI plan adds the study system; the six-month and annual plans add
            the monthly group Q&amp;A. The library stays free. It does <strong className="text-slate-300">not</strong>{" "}
            include live classes.
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            [ShieldCheck, "Bounded to the Captain's notes"],
            [BookOpen, "Cites the chapter, not the open web"],
            [VideoOff, "No recordings. Ever."],
            [Lock, "No guaranteed pass or job"],
          ].map(([Icon, label]) => {
            const I = Icon as typeof ShieldCheck;
            return (
              <div
                key={label as string}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
                style={{ background: CARD, border: HAIRLINE, color: "#cbd5e1" }}
              >
                <I className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
                {label as string}
              </div>
            );
          })}
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mb-8">
          <div className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: ACCENT }}>
            What you get
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            A study system around the free library.
          </h2>
          <p style={{ color: "#94a3b8" }}>
            This is not a cheaper version of the live class. It is a different product for the student who needs
            a plan, a study partner at 2 a.m., and a monthly human checkpoint — not a scheduled room.
          </p>
          <p className="text-sm mt-3 rounded-xl px-4 py-3" style={{ color: "#94a3b8", background: "rgba(56,189,248,0.06)", border: "1px solid rgba(56,189,248,0.18)" }}>
            Gini is live today. The study-plan templates, mock-review routine and monthly Q&amp;A are being built
            with the first founding cohort. The founding list is a waitlist, not a payment.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GETS.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl p-6" style={{ background: CARD, border: HAIRLINE }}>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${ACCENT}14`, color: ACCENT }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* What you do not get */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="rounded-3xl p-6 sm:p-8"
          style={{ background: "rgba(255,40,40,0.05)", border: "1px solid rgba(255,60,60,0.25)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="w-6 h-6" style={{ color: "#f87171" }} />
            <h2 className="text-2xl font-black text-white">What this plan does not include</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOES_NOT.map(item => (
              <div key={item} className="flex items-start gap-2 text-sm" style={{ color: "#fca5a5" }}>
                <span className="mt-0.5">×</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
          <p className="text-sm mt-5 leading-relaxed" style={{ color: "#94a3b8" }}>
            {AI_SELF_STUDY_UPGRADE_NOTE}
          </p>
        </div>
      </section>

      {/* Gini explainer */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <div>
            <div className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: ACCENT }}>
              How Gini is different
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              It is not trying to be the smartest AI. It is trying to be the safest study partner.
            </h2>
            <p className="text-base leading-relaxed mb-4" style={{ color: "#94a3b8" }}>
              A general chatbot will answer a DGCA question with fluent confidence whether or not it has a source.
              Gini is built the other way round. The aviation text comes from the Captain&apos;s published chapters
              and question explanations. The model&apos;s job is to find the right stored answer, not to invent one.
            </p>
            <p className="text-base leading-relaxed mb-6" style={{ color: "#94a3b8" }}>
              When there is no verified answer, Gini says so. That refusal is the feature. A wrong answer taught to
              a student pilot is a safety problem, not a typo.
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Explain simply", query: "Explain the ISA and pressure altitude in simple language." },
                { label: "Exam answer", query: "How do I write a DGCA exam answer on altimetry?" },
                { label: "Solve step by step", query: "Solve a wind triangle problem step by step." },
                { label: "Quiz me", query: "Quiz me on Aviation Meteorology." },
                { label: "Find a chapter", query: "Which chapter covers pressure altitude?" },
              ].map(item => (
                <AskGiniButton
                  key={item.label}
                  query={item.query}
                  className="px-3 py-1.5 rounded-full text-xs font-bold"
                  style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}30`, color: "#bae6fd", cursor: "pointer" }}
                >
                  {item.label}
                </AskGiniButton>
              ))}
            </div>
          </div>
          <div className="rounded-3xl p-6" style={{ background: CARD, border: HAIRLINE }}>
            <div className="flex items-center gap-2 mb-4">
              <BadgeCheck className="w-5 h-5" style={{ color: "#22c55e" }} />
              <span className="text-sm font-black text-white">Gini&apos;s rules</span>
            </div>
            <ul className="space-y-3 text-sm" style={{ color: "#cbd5e1" }}>
              {[
                "Answer only from Ghost Aviator material and official DGCA sources.",
                "Cite the subject, chapter and question where possible.",
                "Say “I don't have a verified answer” instead of guessing.",
                "Never guarantee a pass, licence, job or salary.",
                "Never give medical or legal advice.",
                "Send unresolved questions to the Captain's monthly Q&A.",
              ].map(rule => (
                <li key={rule} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#22c55e" }} />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
            <div
              className="mt-5 rounded-xl px-3 py-2 text-xs leading-relaxed"
              style={{ background: "rgba(56,189,248,0.06)", color: "#94a3b8", border: `1px solid ${ACCENT}22` }}
            >
              Gini is in founding beta. Its answers are a study aid, not a substitute for the notes, the Captain or
              the DGCA&apos;s current published requirements.
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl p-6 sm:p-10" style={{ background: CARD, border: HAIRLINE }}>
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 text-center">How it works</h2>
          <p className="text-center mb-8 max-w-2xl mx-auto" style={{ color: "#94a3b8" }}>
            Start free. Pay only when the library and the study partner are worth more to you than the free tier.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {HOW.map(step => (
              <div key={step.n} className="text-center">
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-lg font-black"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, #2563eb)`, color: "#fff" }}
                >
                  {step.n}
                </div>
                <h3 className="font-black text-white mb-2">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: ACCENT }}>
            Founding prices
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Choose the runway that fits your exam date.
          </h2>
          <p style={{ color: "#94a3b8" }}>
            All plans include the study system and Gini. The library stays free. The six-month and annual plans
            add the monthly group Q&amp;A. No recordings. Cancel before the next renewal.
            {!AI_SELF_STUDY_CHECKOUT_LIVE && (
              <span className="block mt-2 text-sm" style={{ color: GOLD }}>
                Checkout is opening. The founding list is open on WhatsApp; no payment is taken on this page yet.
              </span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {AI_SELF_STUDY_PLANS.map(plan => {
            const checkout = hasAiSelfStudyPaymentLink(plan.id);
            return (
              <div
                key={plan.id}
                className="rounded-3xl p-6 flex flex-col relative overflow-hidden"
                style={{
                  background: plan.featured ? "linear-gradient(160deg, rgba(56,189,248,0.14), rgba(17,24,32,0.98))" : CARD,
                  border: plan.featured ? `1px solid ${ACCENT}70` : HAIRLINE,
                  boxShadow: plan.featured ? "0 0 40px rgba(56,189,248,0.12)" : "none",
                }}
              >
                {plan.badge && (
                  <div
                    className="absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-[11px] font-black uppercase tracking-wider"
                    style={{ background: plan.featured ? ACCENT : `${ACCENT}22`, color: plan.featured ? "#06121c" : "#bae6fd" }}
                  >
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                <p className="text-sm mb-5" style={{ color: "#94a3b8" }}>{plan.bestFor}</p>
                <div className="mb-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-sm ml-2" style={{ color: "#94a3b8" }}>{plan.cadence}</span>
                </div>
                <div className="text-xs font-bold mb-5" style={{ color: plan.featured ? "#7dd3fc" : GOLD }}>
                  {plan.equivalent}
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-start gap-2 text-sm" style={{ color: "#cbd5e1" }}>
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#22c55e" }} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={aiSelfStudyEnrollLink(plan)}
                  target={checkout ? undefined : "_blank"}
                  rel={checkout ? undefined : "noopener noreferrer"}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-black no-underline"
                  style={{
                    background: plan.featured ? `linear-gradient(135deg, ${ACCENT}, #2563eb)` : "rgba(56,189,248,0.1)",
                    color: plan.featured ? "#fff" : "#bae6fd",
                    border: plan.featured ? "none" : `1px solid ${ACCENT}40`,
                  }}
                >
                  {checkout ? <CreditCard className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                  {checkout ? "Subscribe securely" : "Join the founding list"}
                </a>
                <div className="text-[11px] text-center mt-3" style={{ color: "#64748b" }}>
                  {checkout ? "Payment page on ghostaviator.com" : "No payment taken here. The Captain replies personally."}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-center max-w-2xl mx-auto mt-6" style={{ color: "#64748b" }}>
          Founding prices. Nothing is charged until the payment page is live and you complete checkout. The free
          self-study library remains free.
        </p>
      </section>

      {/* Live cross-sell */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between"
          style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(17,24,32,0.96))", border: "1px solid rgba(34,197,94,0.3)" }}
        >
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-black tracking-widest uppercase mb-2" style={{ color: "#22c55e" }}>
              <Users className="w-4 h-4" /> When you need a human
            </div>
            <h2 className="text-2xl font-black text-white mb-2">The live cohort is still the premium room.</h2>
            <p className="text-sm leading-relaxed max-w-2xl" style={{ color: "#94a3b8" }}>
              Ten seats, taught live by the Captain. No recordings. Study with Gini before class, then bring the
              questions that need a human. Free demo first. {LIVE_PRICE} per subject, fee by UPI after the demo.
            </p>
          </div>
          <Link
            href="/live-classes"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black no-underline shrink-0"
            style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff" }}
          >
            See live classes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-6">
          <HelpCircle className="w-6 h-6" style={{ color: ACCENT }} />
          <h2 className="text-3xl font-black text-white">Questions before you subscribe</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FAQ.map(item => (
            <div key={item.q} className="rounded-2xl p-5" style={{ background: CARD, border: HAIRLINE }}>
              <h3 className="font-black text-white mb-2">{item.q}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className="rounded-3xl p-8 sm:p-10 text-center"
          style={{ background: `linear-gradient(135deg, ${ACCENT}16, rgba(17,24,32,0.98))`, border: `1px solid ${ACCENT}40` }}
        >
          <Sparkles className="w-8 h-8 mx-auto mb-3" style={{ color: ACCENT }} />
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Ask Gini one question before you decide.
          </h2>
          <p className="max-w-2xl mx-auto mb-6 text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
            Start with the free library. If the answers are useful, the paid plan gives you the full system.
            If you need the Captain in the room, the live cohort is one click away.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <AskGiniButton
              query="What is the best order to prepare the DGCA CPL papers?"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black no-underline"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #2563eb)`, color: "#fff", border: 0, cursor: "pointer" }}
            >
              <Bot className="w-4 h-4" /> Ask about the exam order
            </AskGiniButton>
            <a
              href={WHATSAPP_AI}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold no-underline"
              style={{ border: "1px solid rgba(34,197,94,0.4)", color: "#86efac", background: "rgba(34,197,94,0.06)" }}
            >
              <MessageCircle className="w-4 h-4" /> Ask the Captain
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs" style={{ color: "#64748b" }}>
            <span className="inline-flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Notes, mocks & past papers</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Verified answers</span>
            <span className="inline-flex items-center gap-1.5"><VideoOff className="w-3.5 h-3.5" /> No recordings</span>
          </div>
        </div>
      </section>
    </div>
  );
}
