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
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://cdn.jsdelivr.net",
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
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
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
    ];
  },
};

export default nextConfig;
