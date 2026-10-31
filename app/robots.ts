import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Static so it can be written into the Cloudflare static export (output: "export").
export const dynamic = "force-static";

/**
 * Crawler policy, set deliberately on 2026-08-06.
 *
 * Before this, robots.txt said `Allow: /` to every user agent while the chapter
 * notes at /content/ sent `X-Robots-Tag: noindex`. That combination was the
 * worst of both worlds: search engines were told not to index the Captain's
 * teaching material, so it could never rank or be cited — while GPTBot,
 * ClaudeBot, PerplexityBot, CCBot and the rest were free to ingest all 290
 * chapters, because those crawlers gate on robots.txt, not on a noindex header.
 * The content was being taken and not credited.
 *
 * The rule now: the notes themselves are closed to everyone; everything built to
 * be quoted — guides, chapter pages, the question bank, the simulator — stays
 * open to everyone, AI assistants included. Being recommended by an assistant to
 * a student who cannot afford coaching is the mission, not a threat to it. What
 * we decline is handing over the whole book for free.
 *
 * NOT disallowed on purpose: /login, /signup and /dashboard. They are noindex,
 * and a crawler must be allowed to fetch a page in order to SEE that it is
 * noindex. Disallowing a noindex page is self-defeating — it can leave the bare
 * URL indexed with no way to remove it.
 *
 * AMENDED 2026-08-08. The chapter now renders in the notes page itself instead
 * of in an iframe, and its figures were extracted out of base64 into real files
 * under /content/<subject>/<chapter>/img/. Those images are now part of a page
 * we want indexed, so they must be crawlable: blocking a resource our own pages
 * render is how a site ends up assessed on a broken rendering of itself, and it
 * would keep 239 of the Captain's diagrams out of Google Images — a discovery
 * channel that matters for queries like "VOR radial diagram". The raw
 * notes.html documents stay closed; only the figures open up.
 */
export default function robots(): MetadataRoute.Robots {
  // Shared policy: public pages are open (including AI assistants); raw notes
  // under /content/ stay closed. Explicit AI user-agents restate the same rule
  // so a future edit to "*" cannot silently leave GPTBot / ClaudeBot / etc.
  // freer than Googlebot when the intent is the opposite.
  // Every folder an indexed notes page draws a figure or a stylesheet from must be
  // fetchable, or the page is judged on a broken rendering of itself. Chapters
  // keep figures in img/, figs/, a subject-level _assets/ folder, or (two DA42
  // plates) beside the chapter file.
  const publicAllow = [
    "/",
    "/content/*/*/img/",
    "/content/*/*/figs/",
    "/content/*/_assets/",
    "/content/*/*/*.png",
  ] as const;
  const contentClosed = "/content/";
  // SEO-tool / bulk scrapers that send no traffic to students but crawl all ~674 sitemap URLs
  // (ISR Reads are metered on Hobby). Googlebot, Bingbot and the AI agents above are NOT listed.
  const bulkScrapers = ["AhrefsBot", "SemrushBot", "MJ12bot", "DotBot", "PetalBot", "DataForSeoBot", "BLEXBot", "serpstatbot"];
  // 2026-10-31: Anthropic documents three crawlers. ClaudeBot (training),
  // Claude-SearchBot (Claude's search index) and Claude-User (fetches a page
  // when a student asks Claude about it). The last two decide whether Claude
  // can cite us at all. Anthropic-AI is the retired name, kept as harmless.
  const aiAgents = [
    "GPTBot",
    "ChatGPT-User",
    "OAI-SearchBot",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "Anthropic-AI",
    "Perplexity-User",
    "DuckAssistBot",
    "MistralAI-User",
    "Google-Extended",
    "PerplexityBot",
    "Applebot-Extended",
    "CCBot",
    "Bytespider",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        // Longest match wins, so the img rule beats the /content/ block.
        allow: [...publicAllow],
        // The raw standalone chapter documents. The chapter page renders the same
        // material and is the URL that should rank; these are unlinked duplicates.
        disallow: contentClosed,
      },
      {
        userAgent: aiAgents,
        allow: [...publicAllow],
        disallow: contentClosed,
      },
      { userAgent: bulkScrapers, disallow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
