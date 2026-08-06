import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Search, XCircle, AlertTriangle, MessageCircle, Mail } from "lucide-react";
import { CPL_SUBJECTS } from "@/lib/subjects";
import { ALL_QUESTIONS } from "@/lib/questions";
import { VERIFICATION, LEVEL_LABEL, LEVEL_COLOR } from "@/lib/verification-status";
import { LIVE_WHATSAPP } from "@/lib/live-classes";
import { SITE_URL, PERSON_ID, ORG_ID } from "@/lib/site";

const ACCENT = "#ab794d";
const CARD = "rgba(17,24,32,0.95)";
const HAIRLINE = "1px solid rgba(255,255,255,0.06)";

export const metadata: Metadata = {
  title: "How Answers Are Verified — Ghost Aviator's Editorial Standard",
  description:
    "Every answer published on Ghost Aviator is checked against an authoritative reference before it goes live, and anything that cannot be verified is flagged or removed rather than guessed. Here is the standard, and exactly where each subject stands.",
  alternates: { canonical: "/how-answers-are-verified" },
};

const WA_ERROR = `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
  "Hello Capt. Pahil, I think I have found a mistake in a question on Ghost Aviator. Here are the details:"
)}`;

const questionsFor = (subjectId: string) =>
  ALL_QUESTIONS.filter(q => q.subjectIds?.includes(subjectId)).length;

const subjectName = (subjectId: string) =>
  CPL_SUBJECTS.find(s => s.id === subjectId)?.name ?? subjectId;

export default function HowAnswersAreVerifiedPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/how-answers-are-verified`,
        name: "How Answers Are Verified",
        description: metadata.description,
        url: `${SITE_URL}/how-answers-are-verified`,
        inLanguage: "en-IN",
        author: { "@id": PERSON_ID },
        publisher: { "@id": ORG_ID },
        about: { "@id": ORG_ID },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/how-answers-are-verified#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "How Answers Are Verified" },
        ],
      },
    ],
  };

  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <div className="relative overflow-hidden" style={{ borderBottom: `1px solid ${ACCENT}25` }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${ACCENT}18 0%, transparent 65%)` }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 text-center">
          <div
            className="inline-flex items-center justify-center p-3 rounded-full mb-6"
            style={{ background: `${ACCENT}15`, color: ACCENT }}
          >
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">How answers are verified</h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#94a3b8" }}>
            A wrong answer taught to a student pilot is not a typo. It is a safety problem that
            follows him into a cockpit. So this page tells you exactly how the material here is
            checked — and where it is not finished yet.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* The standard */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">The rule I work to</h2>
          <div className="space-y-4 text-base leading-relaxed" style={{ color: "#94a3b8" }}>
            <p>
              Every question and every answer published here is checked against an authoritative
              reference before it goes live — a standard ATPL textbook, an ICAO Annex, or the
              relevant DGCA regulation. Where the question is numerical, the answer is recomputed
              from first principles rather than taken on trust.
            </p>
            <p>
              A marked answer in any question bank is treated as a hint, not as fact. In one
              measured sample of fifty questions drawn at random from the Air Regulations bank,
              about three quarters were confirmed correct — and the remaining quarter split between
              answers that were simply wrong, questions damaged in printing, and questions that
              could not be settled without an Indian regulatory source. That is not a criticism of
              anyone. It is what happens to material copied from book to book for years without
              anyone going back to the source.
            </p>
          </div>
        </section>

        {/* What happens when it can't be verified */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">When something cannot be verified</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [Search, "It gets checked", "Against a reference, and recomputed if there are numbers in it."],
              [AlertTriangle, "Or it gets flagged", "If two reputable sources genuinely disagree, the best-supported answer is used and the disagreement is recorded."],
              [XCircle, "Or it gets removed", "If it cannot be answered at all — a question about a chart or a coded report you were never shown — it comes out of the bank."],
            ].map(([Icon, title, body]) => {
              const I = Icon as typeof Search;
              return (
                <div key={title as string} className="rounded-2xl p-5" style={{ background: CARD, border: HAIRLINE }}>
                  <I className="w-5 h-5 mb-3" style={{ color: ACCENT }} />
                  <div className="font-bold text-white mb-1.5">{title as string}</div>
                  <div className="text-sm" style={{ color: "#64748b" }}>{body as string}</div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-base leading-relaxed" style={{ color: "#94a3b8" }}>
            What never happens is the fourth option: publishing a plausible guess because a question
            looked lonely without an answer. An empty space teaches a student nothing. A confident
            wrong answer teaches him something false, and he will carry it into the exam hall and
            possibly further.
          </p>
        </section>

        {/* Status table */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-2">Where each subject stands</h2>
          <p className="mb-6 text-base" style={{ color: "#64748b" }}>
            This site is the work of one instructor, and verification takes time. Rather than claim
            everything is finished, here is the honest position, subject by subject.
          </p>

          <div className="space-y-4">
            {VERIFICATION.map(v => (
              <div key={v.subjectId} className="rounded-2xl p-5" style={{ background: CARD, border: HAIRLINE }}>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-lg font-bold text-white">{subjectName(v.subjectId)}</h3>
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: `${LEVEL_COLOR[v.level]}18`, color: LEVEL_COLOR[v.level] }}
                  >
                    {LEVEL_LABEL[v.level]}
                  </span>
                  {v.when && (
                    <span className="text-xs" style={{ color: "#475569" }}>{v.when}</span>
                  )}
                  {/* Some subjects are notes-only. Printing "0 questions"
                      against an audited subject reads as a broken page. */}
                  <span className="text-xs ml-auto" style={{ color: "#475569" }}>
                    {questionsFor(v.subjectId) > 0
                      ? `${questionsFor(v.subjectId).toLocaleString("en-IN")} questions`
                      : "chapter notes"}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#94a3b8" }}>{v.note}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 text-sm leading-relaxed" style={{ color: "#64748b" }}>
            Subjects not listed above have not yet been through a formal audit. Their notes and
            questions are still written and reviewed to the same standard, but they have not had the
            second, adversarial pass described here. As each one is completed it will appear on this
            page with the date.
          </p>
        </section>

        {/* Report an error */}
        <section className="rounded-2xl p-8" style={{ background: `${ACCENT}0f`, border: `1px solid ${ACCENT}30` }}>
          <h2 className="text-2xl font-bold text-white mb-3">Found a mistake? Tell me.</h2>
          <p className="text-base leading-relaxed mb-6" style={{ color: "#94a3b8" }}>
            Two students once wrote to say a Meteorology answer looked wrong. They were right, and
            that single message started the audit that went through the entire bank. If something
            here contradicts what you have been taught, send it to me with the chapter and the
            question — you are not troubling me, you are doing the job of a good crew member.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={WA_ERROR}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-colors no-underline"
              style={{ background: "#25D366" }}
            >
              <MessageCircle className="w-4 h-4" /> Report it on WhatsApp
            </a>
            <a
              href="mailto:pankaj.pahil@gmail.com?subject=Possible%20error%20on%20Ghost%20Aviator"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-colors no-underline"
              style={{ color: ACCENT, border: `1px solid ${ACCENT}55`, background: `${ACCENT}12` }}
            >
              <Mail className="w-4 h-4" /> Email me
            </a>
          </div>
        </section>

        {/* Who */}
        <section className="text-center pt-4">
          <p className="text-base" style={{ color: "#94a3b8" }}>
            The checking is done by{" "}
            <Link href="/about" className="font-bold no-underline" style={{ color: ACCENT }}>
              Capt. Pankaj Pahil
            </Link>
            {" "}— a pilot, a DGCA flight and ground instructor, and the author of two aviation books.
          </p>
        </section>
      </div>
    </div>
  );
}
