/**
 * GET /embed/question - the "DGCA Question of the Day" widget, for OTHER sites to iframe.
 *
 * A Route Handler, not a page, so the root layout (navbar, Gini, analytics) is not wrapped
 * around it: this is a bare, self-contained card that loads fast inside someone else's page.
 *
 * Framing is allowed ONLY on /embed/* (next.config.ts carves it out of the site-wide
 * frame-ancestors 'self'). The card carries one public question - the same text the question
 * bank already publishes - so opening it to framing exposes nothing the site does not already
 * give away. The notes stay un-frameable.
 *
 * noindex: the card is a fragment, not a page; it must not compete with /question-bank.
 * The answer is behind <details>: no JavaScript, so the widget's CSP can forbid scripts entirely.
 */
import { questionOfTheDay } from "@/lib/embed-question";

export const dynamic = "force-dynamic";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const L = "ABCD";

export async function GET() {
  const q = questionOfTheDay();
  const chapter = q.chapterId ? `https://ghostaviator.com/cpl/meteorology/${q.chapterId}/notes` : "https://ghostaviator.com/question-bank";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>DGCA Question of the Day</title>
<style>
:root{--bg:#0f172a;--card:#111c33;--ink:#e2e8f0;--muted:#94a3b8;--accent:#38bdf8;--ok:#22c55e}
@media (prefers-color-scheme: light){:root{--bg:#f8fafc;--card:#ffffff;--ink:#0f172a;--muted:#475569;--accent:#0369a1;--ok:#15803d}}
*{box-sizing:border-box}body{margin:0;font:15px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;background:var(--bg);color:var(--ink)}
.c{margin:10px;padding:16px 18px;border-radius:14px;background:var(--card);border:1px solid rgba(148,163,184,.25)}
.k{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);font-weight:700}
.q{font-weight:650;margin:8px 0 10px}ol{margin:0 0 10px;padding-left:0;list-style:none}li{margin:4px 0}
summary{cursor:pointer;color:var(--accent);font-weight:650}details p{margin:8px 0 0}.a{color:var(--ok);font-weight:700}
.f{margin-top:12px;font-size:12px;color:var(--muted)}a{color:var(--accent)}
</style></head><body><div class="c">
<div class="k">DGCA Question of the Day · Meteorology</div>
<div class="q">${esc(q.q)}</div>
<ol>${q.opts.map((o, i) => `<li><b>${L[i]})</b> ${esc(o)}</li>`).join("")}</ol>
<details><summary>Show the answer</summary><p><span class="a">${L[q.ans]}) ${esc(q.opts[q.ans])}</span> — ${esc(q.exp)}</p></details>
<div class="f">From Capt. Pankaj Pahil's verified question bank · <a href="${chapter}" target="_blank" rel="noopener">read the chapter</a> · <a href="https://ghostaviator.com/question-bank" target="_blank" rel="noopener">free practice</a></div>
</div></body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "X-Robots-Tag": "noindex",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
