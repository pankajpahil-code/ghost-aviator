import type { NextConfig } from "next";
import { headerRules, redirectRules } from "./lib/site-routing";

// The CSP, security headers, cache rules and redirects live in
// lib/site-routing.ts so the Cloudflare Worker can apply the identical rules.

// CF_STATIC_EXPORT=1 (set by tools/cloudflare/build.mjs) builds a fully static
// export for Cloudflare Workers Static Assets. Next cannot apply headers() or
// redirects() to an export, so they are left out of that build and applied by
// cloudflare/worker.ts + the generated _headers file instead.
const STATIC_EXPORT = process.env.CF_STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  // Server code reads only HTML and CSS out of public/ (chapter notes, guides,
  // linked stylesheets). lib/notes-inline.ts resolves a stylesheet path at run
  // time, and the tracer, unable to tell which file that is, packs ALL of
  // public/ into the route: 687 MB against Vercel's 250 MB limit, which failed
  // the production deploy of 2026-10-09. Nothing on the server opens an image,
  // font, PDF or media file, so none of them belongs in a function.
  // `node tools/audit/function-size.mjs` after a build proves it stays that way.
  outputFileTracingExcludes: {
    "/*": ["./public/**/*.{png,jpg,jpeg,webp,avif,gif,svg,ico,mp4,webm,m4a,mp3,wav,pdf,woff,woff2,ttf,otf,eot,zip}"],
  },
  turbopack: {
    root: __dirname,
  },
  // Hide "X-Powered-By: Next.js" so we don't advertise the exact stack to attackers.
  poweredByHeader: false,
  ...(STATIC_EXPORT
    ? {
        output: "export" as const,
        // No image optimisation server on a static host: images are served as
        // the files in public/ (already WebP/PNG at sensible sizes).
        images: { unoptimized: true },
      }
    : {
        headers: headerRules,
        redirects: redirectRules,
      }),
};

export default nextConfig;
