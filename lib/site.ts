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
//   @Capt.GhostAviator UCliKc6qVcGs5tnI03yNg6Lg  (the brand channel)
// 8 Oct 2026, the Captain's ruling: the site links ONLY the brand channel. His personal channel is not
// linked or named anywhere public (no name, no number in public output).
export const YOUTUBE_BRAND = "https://www.youtube.com/@Capt.GhostAviator";
export const TELEGRAM_GROUP = "https://t.me/+tgLMJithc1gzOWJl";
// "D.G.C.A Exams HelpLine" — the student help group. Added 2026-08-20; verified
// 200 before shipping, per the rule that a sameAs pointing at a 404 is a
// negative signal rather than a neutral one.
export const WHATSAPP_GROUP = "https://chat.whatsapp.com/J3F9zaMJRQn5IYEiaYzP6t";

// Verified live 2026-10-15 (HTTP 200 and the page is the real profile: Instagram bio links
// ghostaviator.com; t.me pages show the channel / group titles, not the "Contact @x" stub
// Telegram serves for a username that does not exist).
export const INSTAGRAM = "https://www.instagram.com/capt.ghostaviator/";
export const TELEGRAM_CHANNEL = "https://t.me/ghostaviator";

// Added 2026-10-15 on the Captain's instruction (public website pages may now name him; social posts may not).
// Both verified HTTP 200 and the real pages (titles match) on 2026-10-15.
export const YOUTUBE_PERSONAL = "https://www.youtube.com/@PankajPahil";
export const TELEGRAMRADAR = "https://www.telegramradar.com/en/explore/ghost-aviator-dgca-cpl-atpl-exam-prep-all-subjects-muzcct45";

// Added 2026-10-31 (brand-chain audit). Each one checked as a real Ghost Aviator /
// Capt. Pankaj Pahil profile on 31 Oct 2026. The Facebook Page is the one Buffer
// publishes to; other Facebook IDs seen in search are NOT confirmed and stay out.
export const TELEGRAM_COMMUNITY = "https://t.me/CaptGhostAviator"; // public URL of TELEGRAM_GROUP
export const FACEBOOK_PAGE = "https://www.facebook.com/1258974680628637";
export const THREADS = "https://www.threads.com/@capt.ghostaviator";
export const REDDIT = "https://www.reddit.com/user/GhostAviatorDGCA/";
export const QUORA = "https://www.quora.com/profile/Pankaj-Pahil";
export const BLUESKY = "https://bsky.app/profile/ghostaviator.bsky.social";
export const ABOUT_ME = "https://about.me/ghostaviator";
export const GRAVATAR = "https://gravatar.com/affable6a06dd6657";
export const PEERLIST = "https://peerlist.io/pankajpahil";
export const INDIEHACKERS = "https://www.indiehackers.com/product/ghost-aviator";
export const GITHUB = "https://github.com/pankajpahil-code";

/** The hub page that lists every official account. Link-in-bio target. */
export const OFFICIAL_PATH = "/official";

// schema.org sameAs, split by entity. sameAs says "this URL is the same entity",
// so it lists PROFILES only: no invite links (t.me/+..., chat.whatsapp.com), no
// directory listings (TelegramRadar). Those stay as ordinary UI links.
export const ORG_SAME_AS = [
  YOUTUBE_BRAND, INSTAGRAM, FACEBOOK_PAGE, THREADS, TELEGRAM_CHANNEL, TELEGRAM_COMMUNITY,
  BLUESKY, INDIEHACKERS,
];
export const PERSON_SAME_AS = [
  YOUTUBE_PERSONAL, QUORA, REDDIT, ABOUT_ME, GRAVATAR, PEERLIST, GITHUB,
];

/**
 * Every official account, for the /official hub, the footer row and llms.txt.
 * `footer` (a short label) = shown in the footer's "Follow Ghost Aviator" row.
 */
export const OFFICIAL_CHANNELS: { label: string; handle: string; href: string; note: string; footer?: string }[] = [
  { label: "YouTube (Ghost Aviator)", handle: "@Capt.GhostAviator", href: YOUTUBE_BRAND, note: "The brand channel: lectures, shorts and announcements.", footer: "YouTube" },
  { label: "YouTube (Capt. Pankaj Pahil)", handle: "@PankajPahil", href: YOUTUBE_PERSONAL, note: "The full DGCA CPL and ATPL lecture series." },
  { label: "Instagram", handle: "@capt.ghostaviator", href: INSTAGRAM, note: "Short lessons and updates.", footer: "Instagram" },
  { label: "Telegram community", handle: "@CaptGhostAviator", href: TELEGRAM_COMMUNITY, note: "The moderated student community.", footer: "Telegram" },
  { label: "Telegram channel", handle: "@ghostaviator", href: TELEGRAM_CHANNEL, note: "Announcements and new material." },
  { label: "Facebook", handle: "Ghost Aviator", href: FACEBOOK_PAGE, note: "The official Ghost Aviator Page.", footer: "Facebook" },
  { label: "Reddit", handle: "u/GhostAviatorDGCA", href: REDDIT, note: "Answers to DGCA exam questions.", footer: "Reddit" },
  { label: "Quora", handle: "Pankaj Pahil", href: QUORA, note: "Capt. Pankaj Pahil answers aviation questions.", footer: "Quora" },
  { label: "Threads", handle: "@capt.ghostaviator", href: THREADS, note: "Short posts and updates.", footer: "Threads" },
  { label: "Bluesky", handle: "@ghostaviator.bsky.social", href: BLUESKY, note: "Ghost Aviator on Bluesky." },
  { label: "about.me", handle: "ghostaviator", href: ABOUT_ME, note: "Profile page." },
  { label: "Gravatar", handle: "Capt. Pankaj Pahil", href: GRAVATAR, note: "Profile page." },
  { label: "Peerlist", handle: "pankajpahil", href: PEERLIST, note: "Capt. Pankaj Pahil's builder profile." },
  { label: "Indie Hackers", handle: "Ghost Aviator", href: INDIEHACKERS, note: "The Ghost Aviator product page." },
  { label: "GitHub", handle: "pankajpahil-code", href: GITHUB, note: "Capt. Pankaj Pahil's code profile." },
];

// The Captain's public per-subject study groups on Telegram (created 2026-09-24; the
// Ghost Aviator assistant answers /q doubts there from his notes). Keyed by subject id,
// CPL and ATPL tracks both, so a chapter page can point a reader at the right room.
// A subject with no group simply shows no card. Mirrors SUBJECT_GROUPS in the sales
// desk's brain.py - change both together.
const TG_MET = "https://t.me/ghostaviator_met";
const TG_REGS = "https://t.me/ghostaviator_airregs";
const TG_NAV = "https://t.me/ghostaviator_nav";
const TG_RTR = "https://t.me/ghostaviator_rtr";
export const SUBJECT_TELEGRAM_GROUPS: Record<string, string> = {
  "meteorology": TG_MET, "atpl-meteorology": TG_MET,
  "air-regulations": TG_REGS, "atpl-air-regulations": TG_REGS,
  "air-navigation": TG_NAV, "radio-navigation": TG_NAV, "instrumentation": TG_NAV,
  "atpl-navigation": TG_NAV, "atpl-radio-aids": TG_NAV,
  "radio-telephony": TG_RTR,
};

// Stable schema.org node ids. Search and answer engines consolidate an entity by
// matching @id across pages: every Course, Article and Organization node that
// names the Captain should POINT at this id rather than repeating a bare name
// string, so the graph describes one person 300 times instead of 300 people once.
export const PERSON_ID = `${SITE_URL}/#instructor`;
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
