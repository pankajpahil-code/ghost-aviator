import Link from "next/link";
import { CHECKED_ON, fmtDate, type Source } from "@/lib/dgca-exam-info";

/** The byline and "checked against" line every exam-facts page carries. */
export function FactsByline() {
  return (
    <p className="text-sm text-slate-400 mb-8">
      By <Link className="text-orange-300 underline" href="/about">Capt. Pankaj Pahil</Link>, DGCA ground instructor ·
      Checked against the official DGCA documents on <time dateTime={CHECKED_ON}>{fmtDate(CHECKED_ON)}</time>
    </p>
  );
}

/** Lists the documents a page's facts come from, linked where DGCA gives a stable link. */
export function OfficialSources({ sources }: { sources: Source[] }) {
  return (
    <section className="border-t border-slate-700 pt-6 mt-12">
      <h2 className="text-xl font-bold text-white mb-4">Official sources</h2>
      <ul className="list-disc pl-6 space-y-2 text-slate-300">
        {sources.map(s => (
          <li key={s.id}>
            {s.url
              ? <a className="text-orange-300 underline" href={s.url} rel="noopener">{s.title}</a>
              : s.title}
            {" "}<span className="text-slate-400">({s.issued})</span>
          </li>
        ))}
      </ul>
      <p className="text-slate-400 mt-4 leading-relaxed">
        DGCA changes dates and requirements by public notice. If anything here differs from the notice board on the{" "}
        <a className="text-orange-300 underline" href="https://pariksha.dgca.gov.in" rel="noopener">Pariksha portal</a>,
        the portal is right. Tell us through the <Link className="text-orange-300 underline" href="/contact">contact page</Link> and
        this page will be corrected.
      </p>
    </section>
  );
}
