"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Trophy } from "lucide-react";
import { readProgress, isChapterCleared, clearSubjectProgress, type Track, useProgressVersion } from "@/lib/progress";

type Props = {
  track: Track;
  subjectId: string;
  chapterIds: string[];
  passMark: number;
  color: string;
};

export default function SubjectProgressBar({ track, subjectId, chapterIds, passMark, color }: Props) {
  const version = useProgressVersion();
  const [mounted, setMounted] = useState(false);
  const [cleared, setCleared] = useState(0);

  useEffect(() => {
    // localStorage is client-only — see ChapterProgressBadge for the full note.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const map = readProgress();
    const n = chapterIds.filter(id => isChapterCleared(map[`${track}/${subjectId}/${id}`], passMark)).length;
    setCleared(n);
  }, [track, subjectId, chapterIds, passMark, version]);

  const total = chapterIds.length;
  // Before mount, render a neutral 0-state so SSR and first client paint match.
  const pct = mounted && total > 0 ? Math.round((cleared / total) * 100) : 0;

  return (
    <div className="rounded-2xl p-5 mb-6"
         style={{ background: "rgba(17,24,32,0.95)", border: `1px solid ${color}30` }}>
      <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4" style={{ color }} />
          <span className="text-sm font-bold text-white">Your Progress</span>
          <span className="text-xs" style={{ color: "#64748b" }}>
            {mounted ? `${cleared} of ${total} chapters cleared` : `${total} chapters`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-black" style={{ color }}>{pct}%</span>
          {mounted && cleared > 0 && (
            <button
              onClick={() => { if (confirm("Reset your progress for this subject?")) clearSubjectProgress(track, subjectId); }}
              className="inline-flex items-center gap-1 text-xs font-medium"
              style={{ color: "#64748b" }}>
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>
      <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
        <div className="h-2 rounded-full transition-all duration-500"
             style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, #f3c889)` }} />
      </div>
      <p className="text-xs mt-2" style={{ color: "#475569" }}>
        Pass a chapter quiz or test ({passMark}%+) to mark it cleared. Progress is saved on this device.
      </p>
    </div>
  );
}
