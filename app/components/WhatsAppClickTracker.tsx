"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import type { StudyEvent } from "@/lib/study-events";

export default function WhatsAppClickTracker({ cloudflare }: { cloudflare: boolean }) {
  const path = usePathname();
  const lastPage = useRef<string | null>(null);
  useEffect(() => {
    const area = path === "/" ? "home" : path === "/live-classes" ? "classes" :
      /^\/(cpl|atpl|exam)(?:\/|$)/.exec(path)?.[1] || "other";
    function send(event: StudyEvent) {
      try {
        if (cloudflare) navigator.sendBeacon("/api/study-events/" + event + "/" + area);
        else track(event, { area });
      } catch { /* Reporting must never interrupt study or an enquiry. */ }
    }
    if (lastPage.current !== path && /^\/(cpl|atpl)\/[^/]+\/[^/]+\/notes$/.test(path)) send("lesson_open");
    lastPage.current = path;
    function click(e: MouseEvent) {
      const link = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (link && /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(link.href)) send("whatsapp_click");
    }
    const study = (e: Event) => send((e as CustomEvent<StudyEvent>).detail);
    document.addEventListener("click", click, true);
    window.addEventListener("ghost-study-event", study);
    return () => {
      document.removeEventListener("click", click, true);
      window.removeEventListener("ghost-study-event", study);
    };
  }, [cloudflare, path]);
  return null;
}
