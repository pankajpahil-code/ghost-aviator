/**
 * Deliberately a pass-through.
 *
 * This layout used to emit its own bare `Course` node — no @id, no author, a
 * second copy of the provider. Because the `[type]/page.tsx` beneath it emits a
 * full Course + BreadcrumbList graph for the same URL, every one of the ~290
 * chapter pages was publishing TWO competing descriptions of one course. That
 * splits the entity instead of consolidating it, and leaves the engine to guess
 * which node is authoritative — usually the poorer one, since it appears first.
 *
 * The chapter page owns the structured data. Found in the 2026-08-06 audit.
 */
export default function CPLChapterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
