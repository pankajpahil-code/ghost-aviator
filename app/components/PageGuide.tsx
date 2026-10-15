// Server-rendered long-form guide shown under a tool page. Plain data in, plain
// HTML out: no client JS, so the whole article is in the HTML a crawler fetches.
export type GuideSection = { h: string; p: string[]; list?: string[] };

export default function PageGuide({ id, title, intro, sections, note }: {
  id: string;
  title: string;
  intro: string;
  sections: GuideSection[];
  note?: string;
}) {
  return (
    <article id={id} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <h2 className="text-3xl font-black text-white mb-4">{title}</h2>
      <p className="mb-8 leading-relaxed" style={{ color: "#94a3b8" }}>{intro}</p>
      {sections.map(s => (
        <section key={s.h} className="mb-8">
          <h3 className="text-xl font-bold text-white mb-3">{s.h}</h3>
          {s.p.map((t, i) => (
            <p key={i} className="mb-3 leading-relaxed" style={{ color: "#94a3b8" }}>{t}</p>
          ))}
          {s.list && (
            <ul className="list-disc pl-6 space-y-1.5" style={{ color: "#94a3b8" }}>
              {s.list.map(li => <li key={li}>{li}</li>)}
            </ul>
          )}
        </section>
      ))}
      {note && <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{note}</p>}
    </article>
  );
}