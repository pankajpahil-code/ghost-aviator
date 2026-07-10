import Link from "next/link";
import { MessageCircle, Radio, ArrowRight } from "lucide-react";
import { LIVE_CLASS_SUBJECTS, LIVE_REGULAR, LIVE_FOUNDING, liveWaLink } from "@/lib/live-classes";

type Props = {
  subjectId: string;
  subjectColor: string;
};

// Compact banner shown at the end of chapter notes and on quiz/test result
// screens for subjects that have a live batch. Renders nothing otherwise.
export default function LiveClassUpsell({ subjectId, subjectColor }: Props) {
  const liveName = LIVE_CLASS_SUBJECTS[subjectId];
  if (!liveName) return null;

  return (
    <div className="rounded-2xl p-6 relative overflow-hidden"
         style={{ background: "rgba(15,8,30,0.95)", border: `1px solid ${subjectColor}35` }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: `linear-gradient(to right, ${subjectColor}, transparent)` }} />
      <div className="flex items-center justify-between gap-6 flex-wrap">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black mb-2"
               style={{ background: "rgba(255,40,40,0.12)", border: "1px solid rgba(255,60,60,0.4)", color: "#ff5a5a" }}>
            <Radio className="w-3 h-3 animate-pulse" /> LIVE BATCH
          </div>
          <div className="text-lg font-black text-white leading-snug">
            Study {liveName} <span style={{ color: subjectColor }}>live</span> with Capt. Pahil
          </div>
          <div className="text-xs mt-1" style={{ color: "#64748b" }}>
            Small batch of 10 · live doubt-clearing · 4–6 weeks ·{" "}
            <span className="line-through">{LIVE_REGULAR}</span>{" "}
            <strong style={{ color: "#22c55e" }}>{LIVE_FOUNDING} founding price</strong>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <a href={liveWaLink(liveName, LIVE_FOUNDING)} target="_blank" rel="noopener noreferrer"
             className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-black no-underline"
             style={{ background: "linear-gradient(135deg,#16a34a,#22c55e)", color: "#fff" }}>
            <MessageCircle className="w-4 h-4" /> Reserve a Seat
          </a>
          <Link href="/live-classes"
                className="inline-flex items-center gap-1.5 text-sm font-bold no-underline px-4 py-3 rounded-xl"
                style={{ color: subjectColor, border: `1px solid ${subjectColor}30`, background: `${subjectColor}10` }}>
            Details <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
