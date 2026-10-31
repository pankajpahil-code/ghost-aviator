"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import type { ChapterVideo } from "@/lib/chapter-videos";

type Props = {
  videos: ChapterVideo[];
  title: string;
  color: string;
};

/**
 * Video-lecture card for the top of a notes page.
 *
 * Click-to-load: until the student taps, only a thumbnail is on the page. A
 * live iframe on load would pull megabytes of YouTube player before a single
 * line of the chapter has been read — unacceptable on the budget phones most
 * of these students use. One tap swaps in the real player (youtube-nocookie,
 * so no tracking cookie is set for students who never press play).
 *
 * Multi-part series (e.g. Air Regs Ch.25 runs to five parts) get part buttons.
 */
export default function VideoLectureCard({ videos, title, color }: Props) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  if (videos.length === 0) return null;

  const current = videos[Math.min(index, videos.length - 1)];
  const partLabel = videos.length > 1 ? current.label ?? `Part ${index + 1}` : null;

  const select = (i: number) => {
    setIndex(i);
    setPlaying(true);   // switching part implies watching it
  };

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ border: `1px solid ${color}30`, background: "rgba(0,0,0,0.5)" }}>
      <div className="relative w-full" style={{ aspectRatio: "16/9", background: "#000" }}>
        {playing ? (
          <iframe
            key={current.id}
            src={`https://www.youtube-nocookie.com/embed/${current.id}?rel=0&modestbranding=1&autoplay=1`}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={`${title} — Video Lecture${partLabel ? ` (${partLabel})` : ""}`}
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            aria-label={`Play the video lecture for ${title}`}
            className="absolute inset-0 w-full h-full cursor-pointer border-0 p-0 group"
            style={{ background: "#000" }}
          >
            {/* hqdefault exists for every video; maxres does not. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail; next/image buys nothing for one fixed-size frame */}
            <img
              src={`https://i.ytimg.com/vi/${current.id}/hqdefault.jpg`}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-opacity"
              /* Eager, not lazy: this card is the first thing above the fold on
                 a notes page, and a lazy hero paints late. It is one ~15 KB
                 480x360 JPEG — the real bandwidth saving is the player iframe,
                 which still loads only on tap. */
              loading="eager"
            />
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
              <span className="w-16 h-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ background: color, boxShadow: `0 0 40px ${color}80` }}>
                <Play className="w-7 h-7 ml-1" style={{ color: "#000", fill: "#000" }} />
              </span>
              <span className="text-sm font-black text-white px-4 py-1.5 rounded-full"
                    style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)" }}>
                Watch the lecture — Capt. Pankaj Pahil
                {videos.length > 1 && ` · ${videos.length} parts`}
              </span>
            </span>
          </button>
        )}
      </div>

      {videos.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3"
             style={{ borderTop: `1px solid ${color}20` }}>
          <span className="text-[11px] font-bold tracking-widest" style={{ color: "#64748b" }}>
            LECTURE PARTS
          </span>
          {videos.map((v, i) => (
            <button key={v.id} onClick={() => select(i)}
                    className="text-xs font-bold px-3 rounded-lg cursor-pointer"
                    /* minHeight 44px: these are thumb targets on a phone, and
                       at py-1.5 they measured 30px — under the 44px touch
                       minimum, which makes part-switching fiddly mid-study. */
                    style={{
                      minHeight: 44,
                      touchAction: "manipulation",
                      ...(i === index
                        ? { background: `${color}1f`, border: `1px solid ${color}`, color }
                        : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#94a3b8" }),
                    }}>
              {v.label ?? `Part ${i + 1}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
