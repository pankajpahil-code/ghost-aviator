"use client";
// Counts WhatsApp clicks as Vercel Web Analytics custom events:
//   track("whatsapp_click", { page, placement, subject })
// One delegated listener for the whole site, so the CTA components stay plain
// server markup. Any wa.me link counts; links without data-wa-placement are
// reported as placement "other" (existing buttons on /live-classes etc.).
import { useEffect } from "react";
import { track } from "@vercel/analytics";

export default function WhatsAppClickTracker() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!el || !/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(el.href)) return;
      const props: Record<string, string> = {
        page: window.location.pathname,
        placement: el.dataset.waPlacement || "other",
      };
      if (el.dataset.waSubject) props.subject = el.dataset.waSubject;
      try { track("whatsapp_click", props); } catch { /* analytics must never block the link */ }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
