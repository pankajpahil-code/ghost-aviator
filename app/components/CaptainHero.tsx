import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, BookOpen, ClipboardList, FileText, GraduationCap } from "lucide-react";

type CaptainHeroProps = {
  questionsLabel: string;
  chaptersLabel: string;
};

function stats(questionsLabel: string, chaptersLabel: string) {
  return [
    { value: questionsLabel, label: "Explained questions", icon: ClipboardList },
    { value: chaptersLabel, label: "Free chapters", icon: BookOpen },
    { value: "7", label: "Free PDF books", icon: FileText },
    { value: "₹0", label: "Self-study price", icon: GraduationCap },
  ];
}

/**
 * Homepage hero.
 *
 * The old hero was a fantasy mascot video with the real H1 hidden from sight.
 * This one puts the Captain and the actual free product first: a visible H1,
 * honest counts, real photographs, and a no-sign-up primary CTA.
 */
export default function CaptainHero({ questionsLabel, chaptersLabel }: CaptainHeroProps) {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "linear-gradient(180deg,#0b1117 0%,#0d1620 55%,#0b1117 100%)" }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 15% 10%, rgba(240,145,58,0.16), transparent 60%), radial-gradient(ellipse 60% 50% at 90% 20%, rgba(56,189,248,0.08), transparent 60%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(243,200,137,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(243,200,137,0.12) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(to bottom, black, transparent 80%)",
          WebkitMaskImage: "linear-gradient(to bottom, black, transparent 80%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-wider"
                style={{ background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.35)", color: "#86efac" }}
              >
                <BadgeCheck className="w-3.5 h-3.5" /> FREE DGCA SELF-STUDY
              </span>
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
                style={{ background: "rgba(243,200,137,0.08)", border: "1px solid rgba(243,200,137,0.25)", color: "#f3c889" }}
              >
                CPL &amp; ATPL · No sign-up
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight text-white mb-5">
              Free DGCA{" "}
              <span
                style={{
                  background: "linear-gradient(135deg,#f3c889,#f0913a,#c25a1e)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                CPL &amp; ATPL
              </span>{" "}
              exam prep, built by a Captain.
            </h1>

            <p className="text-base sm:text-lg leading-relaxed mb-7 max-w-2xl" style={{ color: "#aebccb" }}>
              Chapter notes, {questionsLabel} explained questions, mock tests and past papers — all free.
              No paywall. No trial. Live classes are optional, and the free material stays free either way.
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-7">
              <Link
                href="/cpl"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm sm:text-base font-black no-underline"
                style={{
                  background: "linear-gradient(135deg,#f0913a,#c25a1e)",
                  color: "#1a1206",
                  boxShadow: "0 0 28px rgba(240,145,58,0.35)",
                }}
              >
                Start CPL Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/atpl"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm sm:text-base font-bold no-underline"
                style={{
                  border: "1px solid rgba(243,200,137,0.45)",
                  color: "#f3c889",
                  background: "rgba(11,17,23,0.55)",
                }}
              >
                Start ATPL Free
              </Link>
              <Link
                href="/live-classes"
                className="inline-flex items-center gap-2 px-3 py-3.5 rounded-xl text-sm font-bold no-underline"
                style={{ color: "#94a3b8" }}
              >
                Or book a free live demo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-sm mb-8" style={{ color: "#7c8a99" }}>
              Built and taught by <strong style={{ color: "#f3c889" }}>Capt. Pankaj Pahil</strong> — pilot,
              DGCA flight &amp; ground instructor, and author of two aviation books.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              {stats(questionsLabel, chaptersLabel).map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl px-4 py-3"
                  style={{ background: "rgba(17,24,32,0.78)", border: "1px solid rgba(243,200,137,0.16)" }}
                >
                  <Icon className="w-4 h-4 mb-2" style={{ color: "#f0913a" }} />
                  <div className="text-xl font-black text-white leading-none">{value}</div>
                  <div className="text-[11px] mt-1" style={{ color: "#7c8a99" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div
              className="relative overflow-hidden rounded-[2rem] aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/5]"
              style={{ border: "1px solid rgba(243,200,137,0.25)", boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}
            >
              <Image
                src="/captain-banner.webp"
                alt="Capt. Pankaj Pahil in pilot uniform standing on the apron in front of an aircraft"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 46vw"
                className="object-cover"
                style={{ objectPosition: "34% 45%" }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(to top, rgba(11,17,23,0.96) 0%, rgba(11,17,23,0.12) 55%, rgba(11,17,23,0.02) 100%)",
                }}
              />
              <div
                className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black"
                style={{
                  background: "rgba(11,17,23,0.72)",
                  border: "1px solid rgba(243,200,137,0.28)",
                  color: "#f3c889",
                  backdropFilter: "blur(6px)",
                }}
              >
                <BadgeCheck className="w-3.5 h-3.5" /> Real instructor. Real aviation.
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <div
                  className="flex items-center gap-3 rounded-2xl p-3"
                  style={{
                    background: "rgba(11,17,23,0.78)",
                    border: "1px solid rgba(243,200,137,0.2)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div
                    className="relative w-14 h-14 rounded-full overflow-hidden shrink-0"
                    style={{ border: "1px solid rgba(243,200,137,0.35)" }}
                  >
                    <Image src="/captain-real.webp" alt="Capt. Pankaj Pahil" fill sizes="56px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-black text-white">Capt. Pankaj Pahil</div>
                    <div className="text-[11px] leading-snug" style={{ color: "#94a3b8" }}>
                      Pilot · DGCA ground instructor · Author
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="hidden sm:flex items-center gap-2 absolute -bottom-4 -left-4 rounded-xl px-4 py-2.5 text-xs font-bold"
              style={{
                background: "#111820",
                border: "1px solid rgba(34,197,94,0.3)",
                color: "#86efac",
                boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              }}
            >
              <BadgeCheck className="w-4 h-4" /> 17+ years in aviation
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
