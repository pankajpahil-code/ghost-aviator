"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { getChapterStat, isChapterCleared, bestScore, type ChapterStat, type Track, useProgressVersion } from "@/lib/progress";

type Props = {
  track: Track;
  subjectId: string;
  chapterId: string;
  passMark: number;
};

export default function ChapterProgressBadge({ track, subjectId, chapterId, passMark }: Props) {
  const version = useProgressVersion();
  const [stat, setStat] = useState<ChapterStat | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setStat(getChapterStat(track, subjectId, chapterId));
  }, [track, subjectId, chapterId, version]);

  // Render nothing on the server / first paint (avoids hydration mismatch) and
  // when the chapter hasn't been attempted yet.
  if (!mounted || !stat) return null;

  const cleared = isChapterCleared(stat, passMark);
  const best = bestScore(stat);

  if (cleared) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", color: "#22c55e" }}>
        <CheckCircle className="w-3 h-3" /> Cleared {best}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.35)", color: "#f97316" }}>
      Best {best}%
    </span>
  );
}
