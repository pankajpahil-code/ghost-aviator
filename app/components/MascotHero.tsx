"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export default function MascotHero({ children }: { children?: React.ReactNode }) {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (!motion.matches && !connection?.saveData) void el.play().catch(() => {});
    const respectMotion = () => { if (motion.matches) el.pause(); };
    motion.addEventListener("change", respectMotion);
    return () => motion.removeEventListener("change", respectMotion);
  }, []);

  function toggle() {
    const el = video.current;
    if (!el) return;
    if (el.paused) void el.play().catch(() => {});
    else el.pause();
  }

  return (
    <section className="flex flex-col overflow-hidden" style={{ background: "var(--storm-deep)" }}>
      <div className="relative order-2 sm:order-1 w-full aspect-video">
        <picture className="absolute inset-0">
          <source media="(max-width: 639px)" srcSet="/mascot-hero-m-poster.webp" />
          <img src="/mascot-hero-poster.webp" alt="" className="w-full h-full object-cover" />
        </picture>
        <video ref={video} muted loop playsInline preload="none"
               onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
               className="absolute inset-0 h-full w-full object-cover" aria-label="Ghost Aviator mascot on the storm peak">
          <source media="(max-width: 639px)" src="/mascot-hero-m.webm" type="video/webm" />
          <source media="(max-width: 639px)" src="/mascot-hero-m.mp4" type="video/mp4" />
          <source src="/mascot-hero.webm" type="video/webm" />
          <source src="/mascot-hero.mp4" type="video/mp4" />
        </video>
        <button onClick={toggle} aria-label={playing ? "Pause background video" : "Play background video"}
                className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-black/70 text-white">
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>
      <div className="relative order-1 sm:order-2">{children}</div>
    </section>
  );
}
