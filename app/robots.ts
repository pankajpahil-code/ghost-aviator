import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

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
  return {
    rules: {
      userAgent: "*",
      // Longest match wins, so the img rule beats the /content/ block.
      allow: ["/", "/content/*/*/img/"],
      // The raw standalone chapter documents. The chapter page renders the same
      // material and is the URL that should rank; these are unlinked duplicates.
      disallow: "/content/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
