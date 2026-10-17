import Image from "next/image";
import type { Testimonial } from "@/lib/testimonials";

export default function TestimonialCard({ testimonial: t }: { testimonial: Testimonial }) {
  return (
    <article className="p-6 rounded-2xl flex flex-col" style={{ background: "rgba(17,24,32,0.95)", border: "1px solid rgba(34,197,94,0.2)" }}>
      {t.result && (
        <div className="mb-5 pb-4 border-b border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#cbd5e1" }}>{t.result.subject}</p>
          <p className="text-3xl font-black text-white mt-1">{t.result.score}</p>
          <p className="text-xs mt-1" style={{ color: "#86efac" }}>{t.result.status} result</p>
        </div>
      )}
      {t.context && <p className="text-xs mb-2" style={{ color: "#94a3b8" }}>{t.context}</p>}
      <blockquote className="text-sm leading-relaxed flex-1 mb-4" style={{ color: "#cbd5e1" }}>
        <p>&ldquo;{t.quote}&rdquo;</p>
        {t.followUpQuote && <p className="mt-3">&ldquo;{t.followUpQuote}&rdquo;</p>}
      </blockquote>
      <div>
        <p className="font-bold text-white text-sm">{t.name}</p>
        {t.detail && <p className="text-xs mt-1 leading-relaxed" style={{ color: "#86efac" }}>{t.detail}</p>}
      </div>
      {t.resultImage && (
        <details className="mt-4 border-t border-white/10 pt-3">
          <summary className="cursor-pointer text-sm font-semibold rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green-300" style={{ color: "#bbf7d0" }}>View student-supplied result screenshot</summary>
          <p className="text-xs mt-3 mb-2" style={{ color: "#94a3b8" }}>Provisional score message, shared with permission. Subject to the final DGCA result.</p>
          <Image src={t.resultImage.src} alt={t.resultImage.alt} width={t.resultImage.width} height={t.resultImage.height} sizes="(max-width: 639px) 85vw, (max-width: 1023px) 40vw, 350px" className="rounded-xl w-full h-auto" />
          <a href={t.resultImage.src} target="_blank" rel="noopener noreferrer" className="inline-block text-xs font-semibold underline underline-offset-4 mt-3" style={{ color: "#bbf7d0" }}>Open original screenshot <span className="sr-only">for {t.name} (new tab)</span></a>
        </details>
      )}
    </article>
  );
}
