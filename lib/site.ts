// Canonical site origin. Override per-environment with NEXT_PUBLIC_SITE_URL
// (e.g. set it in Vercel project settings to your real domain).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ghostaviator.com";
