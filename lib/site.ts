// Canonical site origin. Override per-environment with NEXT_PUBLIC_SITE_URL
// (e.g. set it in Vercel project settings to your real domain).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://ghostaviator.com";

// The Captain's public profiles, in one place so the Organization node
// (app/layout.tsx) and the Person node (app/about/page.tsx) can never drift
// apart — a schema.org graph where the same entity is described two different
// ways is worth less than one that agrees with itself.
//
// Handles can be renamed; the channel IDs below cannot. If a handle URL ever
// 404s, repair it from these:
//   @PankajPahil       UCKTxHMHDfh2jBb7rrdTCMkg  (Radio Navigation lectures)
//   @Capt.GhostAviator UCliKc6qVcGs5tnI03yNg6Lg  (Air Regulations, Meteorology)
export const YOUTUBE_PERSONAL = "https://www.youtube.com/@PankajPahil";
export const YOUTUBE_BRAND = "https://www.youtube.com/@Capt.GhostAviator";
export const TELEGRAM_GROUP = "https://t.me/+tgLMJithc1gzOWJl";

export const CAPTAIN_PROFILES = [TELEGRAM_GROUP, YOUTUBE_PERSONAL, YOUTUBE_BRAND];
