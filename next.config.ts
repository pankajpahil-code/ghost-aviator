import type { NextConfig } from "next";

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
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://va.vercel-scripts.com https://cdn.jsdelivr.net",
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
    ];
  },
};

export default nextConfig;
