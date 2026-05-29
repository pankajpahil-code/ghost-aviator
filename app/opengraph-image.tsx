import { ImageResponse } from "next/og";
import { CPL_SUBJECTS, ATPL_SUBJECTS } from "@/lib/subjects";

export const alt = "Ghost Aviator — DGCA CPL/ATPL Exam Preparation";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CPL_CH  = CPL_SUBJECTS.reduce((n, s) => n + s.chapters.length, 0);
const ATPL_CH = ATPL_SUBJECTS.reduce((n, s) => n + s.chapters.length, 0);

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(ellipse 90% 70% at 50% 0%, #2a0f4d 0%, #06040e 60%), #06040e",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        {/* Kicker */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "0.18em",
            color: "#c080ff",
            marginBottom: 24,
          }}
        >
          ✈️ &nbsp; CAPT. PANKAJ PAHIL · DGCA EXAM PREP
        </div>

        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "baseline", fontSize: 130, fontWeight: 900, lineHeight: 1 }}>
          <span style={{ color: "#ffffff" }}>GHOST</span>
          <span style={{ color: "#ff4d6d", marginLeft: 28 }}>AVIATOR</span>
        </div>

        {/* Tagline */}
        <div style={{ display: "flex", fontSize: 34, color: "#94a3b8", marginTop: 30, maxWidth: 980 }}>
          India&apos;s most complete CPL &amp; ATPL prep — notes, mock tests &amp; a growing question bank. 100% free to start.
        </div>

        {/* Stat pills */}
        <div style={{ display: "flex", gap: 20, marginTop: 48 }}>
          {[
            `${CPL_SUBJECTS.length} CPL Subjects`,
            `${CPL_CH} CPL Chapters`,
            `${ATPL_SUBJECTS.length} ATPL Subjects`,
            `${ATPL_CH} ATPL Chapters`,
          ].map(label => (
            <div
              key={label}
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                color: "#e2e8f0",
                padding: "14px 26px",
                borderRadius: 999,
                background: "rgba(180,100,255,0.12)",
                border: "2px solid rgba(180,100,255,0.4)",
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
