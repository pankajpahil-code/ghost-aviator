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
// "D.G.C.A Exams HelpLine" — the student help group. Added 2026-08-20; verified
// 200 before shipping, per the rule that a sameAs pointing at a 404 is a
// negative signal rather than a neutral one.
export const WHATSAPP_GROUP = "https://chat.whatsapp.com/J3F9zaMJRQn5IYEiaYzP6t";

export const CAPTAIN_PROFILES = [TELEGRAM_GROUP, WHATSAPP_GROUP, YOUTUBE_PERSONAL, YOUTUBE_BRAND];

// Stable schema.org node ids. Search and answer engines consolidate an entity by
// matching @id across pages: every Course, Article and Organization node that
// names the Captain should POINT at this id rather than repeating a bare name
// string, so the graph describes one person 300 times instead of 300 people once.
export const PERSON_ID = `${SITE_URL}/about#person`;
export const ORG_ID = `${SITE_URL}/#org`;

// What the Captain is demonstrably qualified to teach. Used for schema.org
// knowsAbout — keep this to subjects he actually holds credentials and
// publications in; it is an expertise claim, not a keyword list.
export const CAPTAIN_KNOWS_ABOUT = [
  "DGCA CPL examinations",
  "Aviation Meteorology",
  "Air Navigation",
  "Air Regulations",
  "Radio Telephony RTR(A)",
  "Aircraft Technical General",
  "Flight instruction",
];
