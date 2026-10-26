import Link from "next/link";

/** In normal document flow: never covers a question, figure or mobile control. */
export default function LiveClassInvitation() {
  return <aside aria-label="Learn with Ghost Aviator live classes" className="border-y border-amber-400/20 bg-amber-400/5 px-4 py-6 print:hidden">
    <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="m-0 text-lg font-bold text-white">Turn your study time into exam confidence.</p>
        <p className="mb-0 mt-1 max-w-2xl text-sm leading-relaxed text-slate-300">
          Join Ghost Aviator live classes for guided lessons, worked problems and doubt clearing with the Captain.
          Start with a free live demo. If you want to enroll afterwards, the Captain shares the payment details privately.
        </p>
      </div>
      <Link href="/live-classes" className="shrink-0 self-start rounded-lg bg-amber-300 px-5 py-3 text-center text-sm font-bold text-slate-950 no-underline sm:self-auto">
        See free demo options
      </Link>
    </div>
  </aside>;
}
