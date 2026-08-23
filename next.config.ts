import type { NextConfig } from "next";
// lib/subjects.ts has no imports of its own — pure data — so it is safe to read
// from here. Reading it beats hardcoding the ATPL subject list a second time:
// a duplicated list is the drift Iron Rule 5 exists to stop, and this file
// would be the worst place for it, because a subject added to subjects.ts and
// missed here would silently reopen the hole closed below.
import { ATPL_SUBJECTS } from "./lib/subjects";

// ── Content Security Policy ────────────────────────────────────────────────
// Pragmatic policy tuned to this app's real dependencies:
//   • inline styles  → the codebase uses style={{ }} everywhere (needs 'unsafe-inline' for style-src)
//   • inline script  → JSON-LD <script> + Next's bootstrap (needs 'unsafe-inline' for script-src)
//   • YouTube        → lecture videos embedded via iframe
//   • Supabase       → auth + lead capture (XHR/fetch)
//   • Vercel         → analytics / web vitals
//   • frame-ancestors 'self' → nobody can embed Ghost Aviator content in THEIR site (anti-theft + anti-clickjacking)
// NOTE: nonce-based CSP is intentionally NOT used — this Next version has a known
// CSP-nonce XSS advisory, so a static allow-list is the safer choice here.
//
// DEV NEEDS eval; PRODUCTION MUST NOT HAVE IT.
// React's development build and Turbopack's HMR client both evaluate code at
// runtime, so with the production policy applied to `next dev` the page never
// hydrates: nothing is interactive, and any hydration warning React would have
// printed in full is never reached. That has cost this project real debugging
// time (see the note in .claude/launch.json) and it is why a site-wide
// hydration mismatch stayed unexplained. `'unsafe-eval'` is therefore added
// ONLY outside a production build — `next build` output is unchanged.
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com https://cdn.jsdelivr.net`,
  "style-src 'self' 'unsafe-inline'",
  "worker-src 'self' blob:",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "media-src 'self'",
  "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // Belt-and-braces clickjacking protection for older browsers that ignore frame-ancestors.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stop browsers from MIME-sniffing a response away from its declared type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs (which chapter/subject a user is on) to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Lock down powerful browser features the site never uses.
  // microphone=(self): the Radio Simulator's push-to-talk needs the mic on our
  // OWN origin. A bare microphone=() blocks the page even after the user grants
  // permission in Chrome — that silently broke PTT until 2026-07-20. Everything
  // else stays fully disabled.
  { key: "Permissions-Policy", value: "camera=(), microphone=(self), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  // Force HTTPS for two years incl. subdomains (Vercel is always HTTPS).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  // Hide "X-Powered-By: Next.js" so we don't advertise the exact stack to attackers.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // The raw chapter files. These are the standalone documents the notes
      // route used to iframe; since 2026-08-08 the chapter renders in the page
      // itself, so these are unlinked duplicates of a page we DO want indexed —
      // exactly the kind of thing that should never compete in search.
      //
      // NOTE (2026-08-23): these three paths are now 308-redirected in
      // redirects() below, which fires BEFORE the filesystem, so in practice
      // the file is never served and these headers never reach a client. They
      // are kept deliberately as a second line of defence: if the redirects are
      // ever removed, a noindex still stands. Do not "tidy" one without the
      // other. And note that a noindex was never enough on its own here — it
      // stops indexing, not downloading, and robots.txt disallows the path so
      // Google cannot fetch it to read the tag in the first place.
      //
      // Scoped to the actual documents rather than `/content/:path*`, because
      // that catch-all also covered the chapter figures. Those are now real
      // <img> files rendered on the public notes pages: a noindex on them would
      // keep 239 of the Captain's diagrams out of Google Images and tell Google
      // that resources our own pages depend on are not to be looked at.
      {
        source: "/content/:subject/:chapter/notes.html",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // Slides and Audio Overview were retired 2026-08-13. The route is gone but
      // the files can linger in the deployment, so keep them out of the index.
      {
        source: "/content/:subject/:chapter/slides.pdf",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/content/:subject/:chapter/audio.m4a",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      // Let a client reuse a chapter page for five minutes.
      //
      // Next's default for a prerendered page is `max-age=0, must-revalidate`,
      // which forbids ANY downstream reuse: every hit, from anyone, comes back
      // to Vercel and reads the ISR cache. On this site that metric IS the
      // request count — 751K reads against 7,331 human pageviews in 30 days.
      //
      // The measured pattern behind that: a recursive scraper re-fetches every
      // navbar destination once per page it crawls (one IP hit /notes, /exam,
      // /past-papers and /dashboard 41-43 times each inside an hour). Any client
      // that honours HTTP caching collapses those repeats into one fetch.
      // Students get the same benefit on back-navigation.
      //
      // Five minutes is deliberately short: Iron Rule 1 means a corrected answer
      // must reach students quickly, and this is the longest window worth having
      // where that is still true. The CDN is unaffected, so Googlebot still sees
      // fresh HTML on every crawl.
      {
        source: "/:track(cpl|atpl)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=300" }],
      },
    ];
  },
  async redirects() {
    return [
      // General Navigation was briefly a standalone subject before being
      // merged into Air Navigation (its chapters became nav-13..nav-20).
      {
        source: "/cpl/general-navigation/:path*",
        destination: "/cpl/air-navigation",
        permanent: true,
      },
      // Slides / Audio Overview retired 2026-08-13. Send the old URLs to the
      // chapter's notes rather than 404'ing them: a student who bookmarked
      // "slides" still gets that chapter's teaching, and any link equity those
      // URLs hold transfers instead of evaporating.
      {
        source: "/:track(cpl|atpl)/:subject/:chapter/:type(slides|audio)",
        destination: "/:track/:subject/:chapter/notes",
        permanent: true,
      },

      // ── The raw chapter files stop being downloadable ────────────────────
      //
      // IRON RULE 3. `public/content/<subject>/<chapter>/notes.html` was served
      // to anyone who asked. Measured 2026-08-23:
      //
      //     curl .../content/meteorology/met-1/notes.html
      //     -> HTTP 200, 77 KB, 6,925 words of the Captain's teaching
      //
      // 234 of those, at a URL pattern you can guess from one example. The
      // protection layer tools/protect-notes.mjs injects (user-select:none,
      // a contextmenu handler) IS in the file and is entirely beside the point
      // here: it stops a person right-clicking and does nothing whatsoever to
      // curl. Firewall telemetry from 2026-08-20 says ~97% of traffic to this
      // domain is already automated, including recursive site rippers.
      //
      // Nothing needs these files over HTTP. getInlineNotes() reads them from
      // the FILESYSTEM (fs.readFileSync under process.cwd()), the iframe that
      // used to fetch them was removed on 2026-08-08, and the read-aloud
      // feature now reads innerText from the rendered container. Verified by
      // grepping app/ and lib/ for any HTTP fetch of the path: none.
      //
      // A 308 rather than a 404 or a 410, for three reasons: a bookmark still
      // lands on that chapter's teaching; a scraper gets the React page with
      // the protection layer attached instead of a clean document; and the
      // three of these URLs that Google has indexed URL-only (rnav-1, ar-4,
      // inst-4 — 15 impressions this quarter) get the strongest available
      // signal to fold into the real page. That last one only takes effect if
      // the `Disallow: /content/` line in robots.ts is ever lifted, since
      // Google cannot fetch a disallowed URL to see where it points — the
      // redirect is worth having either way, but do not expect it to
      // de-duplicate anything on its own.
      //
      // NOT touched: /content/*/*/img/. Those 239 figures are rendered BY the
      // indexed notes pages and are deliberately crawlable (robots.ts allows
      // them explicitly). Redirecting them would get every chapter assessed on
      // a broken rendering of itself.
      // The three raw artefacts, in one matcher. notes.html is the whole
      // chapter; slides.pdf and audio.m4a are leftovers from the Slides and
      // Audio Overview features retired on 2026-08-13 (be0ce97) whose FILES
      // were never taken out of the served directory. Measured today:
      //
      //     /content/air-regulations/ar-1/slides.pdf  -> 200, 1.99 MB
      //     /content/air-regulations/ar-1/audio.m4a   -> 200, 47.2 MB
      //
      // Ten of each. A finished PDF is the most stealable artefact a teaching
      // site can leak — complete, portable, printable, and precisely what Iron
      // Rule 3 forbids offering. The audio is 417 MB of the Captain's own voice
      // in a public bucket, which is a bandwidth exposure as well as a theft
      // one on a Hobby plan already serving ~97% automated traffic.
      //
      // Nothing in app/ or lib/ references any of the three (grepped).
      {
        source: `/content/:subject(${ATPL_SUBJECTS.map(s => s.id).join("|")})/:chapter/:file(notes.html|slides.pdf|audio.m4a)`,
        destination: "/atpl/:subject/:chapter/notes",
        permanent: true,
      },
      {
        // Everything else is CPL. Ordering matters: the ATPL rule above must
        // come first, or an ATPL chapter would be sent to a /cpl/ URL that 404s
        // — which is exactly the bug tools/seo-fix-notes.mjs was repairing in
        // the canonicals of these same 28 files. Verified that no subject id
        // appears in both tracks, so the two rules cannot both match.
        source: "/content/:subject/:chapter/:file(notes.html|slides.pdf|audio.m4a)",
        destination: "/cpl/:subject/:chapter/notes",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
