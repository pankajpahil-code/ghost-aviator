import type { Metadata } from "next";

// The offline card the service worker falls back to when a student opens
// something that is not cached. Deliberately tiny and self-explanatory.
export const metadata: Metadata = {
  title: "Offline — Ghost Aviator",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" width={96} height={96} className="mb-6 rounded-2xl" />
      <h1 className="text-xl font-bold text-white">No connection right now</h1>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">
        Chapters you have already opened are saved on this device for a month and stay readable
        offline. Everything else will load as soon as you are back online.
      </p>
      {/* Hard navigation on purpose, not next/link: the worker answers
          navigations (live page if online, offline card if not), while a
          client-side route change would fire an RSC fetch its fetch handler
          never sees — offline that fails with no feedback at all. */}
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a
        href="/"
        className="mt-8 rounded-lg bg-amber-300 px-6 py-3 text-sm font-bold text-slate-950 no-underline"
      >
        Try again
      </a>
      <p className="mt-6 text-xs text-slate-500">
        Tip: open a chapter once while online and it stays available for revision — even without
        data.
      </p>
    </div>
  );
}
