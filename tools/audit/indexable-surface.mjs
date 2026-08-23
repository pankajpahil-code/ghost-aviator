#!/usr/bin/env node
/**
 * What does a crawler actually receive from this site?
 *
 * Fetches the sitemap, then follows internal links one hop out from every
 * submitted URL, and reports the crawlable surface: how many URLs exist, how
 * many ask to be indexed, how much unique text each carries, and which are thin.
 *
 *   node tools/audit/indexable-surface.mjs                     # production
 *   node tools/audit/indexable-surface.mjs http://localhost:3000
 *   node tools/audit/indexable-surface.mjs --json out.json     # keep the raw data
 *
 * WHY IT EXISTS. On 2026-08-14 Search Console reported 35 pages indexed out of
 * 971 known, with 633 "Discovered - currently not indexed" — found and not even
 * crawled. Every check that looks at one page at a time passed: 604/604 URLs
 * returned 200 with a unique title, a unique description, a self-canonical and
 * one h1. The defect was only visible in aggregate — roughly half of every URL a
 * crawler could reach carried under 150 words, because the drill routes were
 * removed from the sitemap but left linked from every chapter page.
 *
 * Run this after ANY change that adds a route type, changes a sitemap
 * condition, or changes what a page links to. The number that matters is
 * "indexable and thin": it should be zero, or close to it.
 */

import fs from "node:fs";

const args = process.argv.slice(2);
const jsonAt = args.indexOf("--json");
const jsonOut = jsonAt >= 0 ? args[jsonAt + 1] : null;
const BASE = (args.find(a => a.startsWith("http")) || "https://ghostaviator.com").replace(/\/$/, "");

const UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const CONCURRENCY = 6;
/** Below this many words of <main> text, a page cannot realistically rank. */
const THIN_WORDS = 150;

/**
 * PACING — why this tool is deliberately slow against production.
 *
 * On 2026-08-20 a Vercel firewall rule went live: "Scraper burst limit",
 * 300 requests / 60s keyed on IP, action 429. This tool used to fire 6
 * concurrent requests with no delay; at the ~0.4s that a chapter page takes
 * that is roughly 900 req/min, i.e. three times the limit. It tripped the rule
 * about twenty seconds in and every URL after that came back 429.
 *
 * The damaging part was not the 429s, it was that the run still PRINTED. It
 * reported a tidy "45 indexable and thin" while 473 of 770 URLs had never
 * actually been read — a plausible number from a measurement that did not
 * happen. So: stay under the limit, and if we hit it anyway, say so loudly
 * instead of summarising nothing (see the RUN INVALID guard at the end).
 *
 * Localhost has no firewall in front of it, so it runs unthrottled.
 */
const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])/.test(BASE);
const rateAt = args.indexOf("--rate");
const RATE_PER_MIN = rateAt >= 0 ? Number(args[rateAt + 1]) : (isLocal ? 0 : 240);
/** Minimum gap between the START of two requests. 0 disables throttling. */
const MIN_GAP_MS = RATE_PER_MIN > 0 ? Math.ceil(60_000 / RATE_PER_MIN) : 0;

const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Serialises request start times so the whole pool obeys one global rate. */
let nextSlot = 0;
async function takeSlot() {
  if (!MIN_GAP_MS) return;
  const now = Date.now();
  const at = Math.max(now, nextSlot);
  nextSlot = at + MIN_GAP_MS;
  if (at > now) await sleep(at - now);
}

/** Counts 429s that survived every retry — the signal that a run is worthless. */
let rateLimited = 0;

const strip = html => html
  .replace(/<(script|style|svg|noscript)[\s\S]*?<\/\1>/gi, " ")
  .replace(/<!--[\s\S]*?-->/g, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;|&[a-z]+;/gi, " ")
  .replace(/\s+/g, " ")
  .trim();

const attr = (html, re) => { const m = html.match(re); return m ? m[1].trim() : null; };

async function fetchPage(url, attempt = 0) {
  try {
    await takeSlot();
    const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" }, redirect: "manual" });
    // A 429 means we already overshot the fixed window; the only useful move is
    // to wait the window out rather than to keep asking. Three tries, then give
    // up and let the guard at the end invalidate the run.
    if (res.status === 429) {
      if (attempt < 2) {
        const wait = Number(res.headers.get("retry-after")) * 1000 || (attempt + 1) * 30_000;
        await sleep(wait);
        return fetchPage(url, attempt + 1);
      }
      rateLimited++;
      return { url, status: 429 };
    }
    if (res.status >= 300 && res.status < 400) {
      return { url, status: res.status, redirect: res.headers.get("location") };
    }
    const html = await res.text();
    const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
    const text = strip(main);
    const robots = attr(html, /<meta[^>]+name="robots"[^>]+content="([^"]*)"/i);
    return {
      url,
      status: res.status,
      title: attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
      description: attr(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i),
      canonical: attr(html, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i),
      robots,
      noindex: /noindex/i.test(robots ?? "") || /noindex/i.test(res.headers.get("x-robots-tag") ?? ""),
      h1Count: (html.match(/<h1[^>]*>/gi) || []).length,
      words: text ? text.split(/\s+/).length : 0,
      links: [...new Set(
        [...html.matchAll(/<a[^>]+href="(\/[^"#?]*)"/gi)].map(m => m[1].replace(/\/$/, "") || "/"),
      )],
    };
  } catch (err) {
    return { url, status: 0, error: String(err).slice(0, 200) };
  }
}

async function fetchAll(urls) {
  const out = new Array(urls.length);
  let i = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (i < urls.length) {
      const idx = i++;
      out[idx] = await fetchPage(urls[idx]);
      if (idx % 50 === 0) process.stderr.write(`  ${idx}/${urls.length}\r`);
    }
  }));
  process.stderr.write("\n");
  return out;
}

const routeShape = url => {
  const seg = url.replace(BASE, "").split("/").filter(Boolean);
  if (!seg.length) return "/";
  if ((seg[0] === "cpl" || seg[0] === "atpl") && seg.length === 4) return `${seg[0]}/${seg[3]}`;
  if ((seg[0] === "cpl" || seg[0] === "atpl") && seg.length === 2) return `${seg[0]}/<subject>`;
  return `/${seg[0]}`;
};

const median = xs => { const s = [...xs].sort((a, b) => a - b); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const pad = (s, n) => String(s).padStart(n);

// ── 1. the submitted set ────────────────────────────────────────────────────
console.log(`\nAuditing ${BASE}\n`);
const sitemapXml = await (await fetch(`${BASE}/sitemap.xml`, { headers: { "User-Agent": UA } })).text();
const submitted = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
console.log(`Sitemap: ${submitted.length} URLs. Fetching…`);
const subPages = await fetchAll(submitted);

// ── 2. one hop out ──────────────────────────────────────────────────────────
const submittedPaths = new Set(submitted.map(u => u.replace(BASE, "").replace(/\/$/, "") || "/"));
const linked = new Set();
for (const p of subPages) for (const l of p.links ?? []) if (!submittedPaths.has(l)) linked.add(l);
console.log(`Linked but not submitted: ${linked.size} URLs. Fetching…`);
const linkedPages = await fetchAll([...linked].map(p => BASE + p));

const all = [...subPages, ...linkedPages].filter(Boolean);
const ok = all.filter(p => p.status === 200);

// ── 3. the report ───────────────────────────────────────────────────────────
const indexable = ok.filter(p => !p.noindex);
const thin = indexable.filter(p => p.words < THIN_WORDS);

console.log("\n" + "─".repeat(72));
console.log(`Crawlable URLs          ${pad(all.length, 6)}`);
console.log(`  submitted             ${pad(subPages.length, 6)}`);
console.log(`  linked only           ${pad(linkedPages.length, 6)}`);
console.log(`Non-200                 ${pad(all.length - ok.length, 6)}`);
console.log(`Asking to be indexed    ${pad(indexable.length, 6)}`);
console.log(`  ...and thin (<${THIN_WORDS}w) ${pad(thin.length, 6)}   <- this is the number that matters`);
console.log("─".repeat(72));

const groups = new Map();
for (const p of ok) {
  const k = routeShape(p.url);
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(p);
}
console.log("\nroute                        n   indexable   medWords");
for (const [shape, pages] of [...groups].sort((a, b) => b[1].length - a[1].length)) {
  const idx = pages.filter(p => !p.noindex).length;
  console.log(`${shape.padEnd(26)}${pad(pages.length, 4)}${pad(idx, 12)}${pad(median(pages.map(p => p.words)), 11)}`);
}

// Defects that a per-page check would catch but nobody runs per-page.
const problems = [
  ["non-200 in sitemap", subPages.filter(p => p.status !== 200).map(p => `${p.status} ${p.url}`)],
  ["submitted but noindex", subPages.filter(p => p.status === 200 && p.noindex).map(p => p.url)],
  ["missing canonical", ok.filter(p => !p.canonical).map(p => p.url)],
  ["missing title", ok.filter(p => !p.title).map(p => p.url)],
  ["missing description", ok.filter(p => !p.description).map(p => p.url)],
  ["h1 count != 1", ok.filter(p => p.h1Count !== 1).map(p => `h1x${p.h1Count} ${p.url}`)],
  ["duplicate title", dupes(ok, "title")],
  ["duplicate description", dupes(ok, "description")],
  ["indexable and thin", thin.map(p => `${p.words}w ${p.url}`)],
];

function dupes(pages, field) {
  const byValue = new Map();
  for (const p of pages) {
    if (p.noindex) continue;                       // a noindex page cannot duplicate anything
    const v = p[field];
    if (!v) continue;
    if (!byValue.has(v)) byValue.set(v, []);
    byValue.get(v).push(p.url);
  }
  return [...byValue.values()].filter(v => v.length > 1).flatMap(v => v.slice(1));
}

/**
 * THE RUN INVALID GUARD.
 *
 * Everything below reports only on pages we managed to read. If the firewall
 * shut us out partway through, the pages we never read are silently absent
 * from every count -- and absence reads exactly like health. Refuse to be
 * quoted rather than publish a number built on a partial crawl.
 */
if (rateLimited > 0) {
  const bang = "!".repeat(74);
  const pct = Math.round((rateLimited / all.length) * 100);
  console.log([
    "",
    bang,
    `RUN INVALID -- ${rateLimited} of ${all.length} URLs (${pct}%) returned 429 after`,
    "retries and were never read. Every figure above under-counts by an unknown",
    "amount and none of it is evidence of anything.",
    "",
    "This site sits behind a Vercel firewall rule of 300 requests / 60s per IP.",
    `Re-run slower:  node tools/audit/indexable-surface.mjs ${BASE} --rate 120`,
    `(this run used ${RATE_PER_MIN}/min). If it still trips, the rule has been`,
    "tightened or something else is using your IP -- check Vercel > Firewall.",
    bang,
    "",
  ].join("\n"));
}

console.log("\nDEFECTS");
let clean = rateLimited === 0;
for (const [label, list] of problems) {
  if (!list.length) { console.log(`  ok    ${label}`); continue; }
  clean = false;
  console.log(`  ${pad(list.length, 5)} ${label}`);
  for (const item of list.slice(0, 12)) console.log(`          ${item}`);
  if (list.length > 12) console.log(`          … and ${list.length - 12} more`);
}
console.log(clean ? "\nNo defects.\n" : "");
if (rateLimited > 0) process.exitCode = 2;

if (jsonOut) {
  fs.writeFileSync(jsonOut, JSON.stringify(all, null, 1));
  console.log(`Raw data written to ${jsonOut}\n`);
}
