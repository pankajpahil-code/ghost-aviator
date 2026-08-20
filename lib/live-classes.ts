// Single source of truth for Capt. Pahil's live classes — pricing, contact,
// and which site subjects have a live batch. Used by /live-classes, the
// LiveClassUpsell card on chapter pages, the homepage, /about, and Gini.
// Update prices HERE only.
//
// 2026-08-20 — prices set by the Captain. Two tiers, and BOTH are shown: the
// list price struck through beside the price actually charged.
//
//   per subject : ₹12,999 struck  ->  ₹7,999
//   Navigation  : ₹23,999 struck  ->  ₹14,999   (Gen Nav + Radio Nav + Instr.)
//
// Anything rendering a price must show the pair, never the list price alone —
// and schema.org offers must carry the price actually charged, because
// advertising a struck-through figure as the offer is a false price claim.

export const LIVE_WHATSAPP = "919990226607";
export const LIVE_EMAIL = "pankaj.pahil@gmail.com";

/** One subject, live, batch of 10. */
export const LIVE_LIST_PRICE = "₹12,999";
export const LIVE_PRICE = "₹7,999";

/** Gen Nav + Radio Nav + Instrumentation — the composite DGCA Navigation paper. */
export const LIVE_COMBO_LIST_PRICE = "₹23,999";
export const LIVE_COMBO_PRICE = "₹14,999";

/** Bare numbers for schema.org offers, which must not carry a currency symbol. */
export const LIVE_PRICE_VALUE = "7999";
export const LIVE_COMBO_PRICE_VALUE = "14999";

export const liveWaLink = (subject: string, price: string) =>
  `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
    `Hello Capt. Pahil, I want to join the ${subject} batch (${price}). Please share the details.`
  )}`;

// Site subject id → live-class display name. A subject appears in upsell
// cards only when it has an entry here.
export const LIVE_CLASS_SUBJECTS: Record<string, string> = {
  "meteorology": "Aviation Meteorology",
  "air-regulations": "Air Regulations",
  "air-navigation": "General Navigation",
  "radio-navigation": "Radio Navigation",
  "instrumentation": "Navigation — Instrumentation",
  "radio-telephony": "Radio Telephony (RTR-A)",
};

/** The three subjects the Navigation combo covers, by site subject id. */
export const LIVE_COMBO_SUBJECTS = ["air-navigation", "radio-navigation", "instrumentation"];
