"use client";

import { useEffect, useRef, useState } from "react";

// Renders a slide PDF to <canvas> pages with PDF.js. Unlike <iframe src=pdf>,
// this works on mobile browsers (where embedded PDFs show blank). Pages render
// lazily as they scroll into view and are evicted when far away, so memory
// stays bounded even for large decks on low-end phones.
export default function PdfSlides({ src, color }: { src: string; color: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let cleanup = () => {};
    const host = hostRef.current;
    if (!host) return;
    host.innerHTML = "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let pdf: any = null;
    const rendering = new Set<number>();
    const rendered = new Set<number>();

    const renderPage = async (slot: HTMLElement, n: number) => {
      if (!pdf || rendering.has(n) || rendered.has(n) || cancelled) return;
      rendering.add(n);
      try {
        const page = await pdf.getPage(n);
        if (cancelled) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const unit = page.getViewport({ scale: 1 });
        const cssW = Math.min(slot.clientWidth || 900, 1100);
        const viewport = page.getViewport({ scale: (cssW / unit.width) * dpr });
        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        canvas.style.display = "block";
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        if (cancelled) return;
        slot.innerHTML = "";
        slot.appendChild(canvas);
        rendered.add(n);
      } catch (err) {
        console.error("[PdfSlides] page", n, "render failed:", err);
      } finally {
        rendering.delete(n);
      }
    };

    const evictPage = (slot: HTMLElement, n: number) => {
      if (!rendered.has(n) || rendering.has(n)) return;
      slot.innerHTML = "";
      rendered.delete(n);
    };

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        pdf = await pdfjs.getDocument({ url: src }).promise;
        if (cancelled) return;
        setTotal(pdf.numPages);

        // One aspect-ratio'd placeholder per page (gives correct scroll height up front).
        const slots: HTMLElement[] = [];
        for (let n = 1; n <= pdf.numPages; n++) {
          const page = await pdf.getPage(n);
          if (cancelled) return;
          const v = page.getViewport({ scale: 1 });
          const slot = document.createElement("div");
          slot.dataset.page = String(n);
          slot.style.aspectRatio = `${v.width} / ${v.height}`;
          slot.style.width = "100%";
          slot.style.marginBottom = "14px";
          slot.style.borderRadius = "6px";
          slot.style.background = "#fff";
          host.appendChild(slot);
          slots.push(slot);
        }
        setStatus("ready");
        console.log("[PdfSlides] ready: slots", slots.length, "cancelled?", cancelled, "pdf?", !!pdf);

        // Guarantee the opening slides paint immediately (don't wait on the observer).
        for (let i = 0; i < Math.min(3, slots.length); i++) renderPage(slots[i], i + 1);

        // Render pages near the viewport; evict ones that scroll far away.
        const io = new IntersectionObserver(
          (entries) => {
            for (const e of entries) {
              const n = Number((e.target as HTMLElement).dataset.page);
              if (e.isIntersecting) renderPage(e.target as HTMLElement, n);
              else evictPage(e.target as HTMLElement, n);
            }
          },
          { root: null, rootMargin: "1000px 0px", threshold: 0.01 },
        );
        slots.forEach((s) => io.observe(s));
        cleanup = () => io.disconnect();
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => { cancelled = true; cleanup(); if (host) host.innerHTML = ""; };
  }, [src]);

  return (
    <div className="relative" style={{ minHeight: status === "loading" ? "55vh" : undefined }}>
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10" style={{ color: "#94a3b8" }}>
          <div className="w-8 h-8 rounded-full animate-spin"
               style={{ border: `3px solid ${color}30`, borderTopColor: color }} />
          <div className="text-sm">Loading slides…</div>
        </div>
      )}
      {status === "error" && (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-center" style={{ color: "#94a3b8" }}>
          <div className="text-sm font-semibold">Couldn&apos;t load the slides.</div>
          <div className="text-xs" style={{ color: "#475569" }}>Please refresh the page or try again in a moment.</div>
        </div>
      )}
      <div ref={hostRef} />
      {status === "ready" && total > 0 && (
        <div className="text-center text-xs pt-2" style={{ color: "#475569" }}>{total} slides</div>
      )}
    </div>
  );
}
