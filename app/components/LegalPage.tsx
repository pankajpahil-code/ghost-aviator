import Link from "next/link";
import type { ReactNode } from "react";

export const LEGAL_ACCENT = "#ab794d";
const CARD = "rgba(17,24,32,0.95)";
const HAIRLINE = "1px solid rgba(255,255,255,0.06)";

export function LegalSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="rounded-2xl p-6 mb-5" style={{ background: CARD, border: HAIRLINE }}>
      <h2 className="text-lg font-semibold mb-3" style={{ color: "#f1f5f9" }}>{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed" style={{ color: "#cbd5e1" }}>
        {children}
      </div>
    </section>
  );
}

export function LegalPageShell({
  title,
  updated,
  intro,
  jsonLd,
  children,
}: {
  title: string;
  updated: string;
  intro: ReactNode;
  jsonLd?: Record<string, unknown>;
  children: ReactNode;
}) {
  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen pb-20">
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}

      <div className="max-w-3xl mx-auto px-4 pt-24">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: LEGAL_ACCENT }}>
          Ghost Aviator
        </p>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "#f8fafc" }}>{title}</h1>
        <p className="mb-8 text-sm leading-relaxed" style={{ color: "#94a3b8" }}>
          Last updated {updated}. {intro}
        </p>

        {children}

        <nav aria-label="Trust and policy pages" className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm">
          {[
            ["Terms", "/terms"],
            ["Privacy", "/privacy"],
            ["Contact", "/contact"],
            ["Official channels", "/official"],
          ].map(([label, href]) => (
            <Link key={href} href={href} style={{ color: LEGAL_ACCENT }}>
              {label}
            </Link>
          ))}
        </nav>

        <p className="text-sm mt-4" style={{ color: "#64748b" }}>
          <Link href="/" style={{ color: LEGAL_ACCENT }}>Back to Ghost Aviator</Link>
        </p>
      </div>
    </div>
  );
}
