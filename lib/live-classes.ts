// Single source of truth for Capt. Pahil's live classes — pricing, contact,
// and which site subjects have a live batch. Used by /live-classes and the
// LiveClassUpsell card on chapter pages. Update prices HERE only.

export const LIVE_WHATSAPP = "919990226607";
export const LIVE_EMAIL = "pankaj.pahil@gmail.com";
export const LIVE_REGULAR = "₹5,999";
export const LIVE_FOUNDING = "₹2,999";
export const LIVE_COMBO_REGULAR = "₹14,999";
export const LIVE_COMBO_FOUNDING = "₹7,999";

export const liveWaLink = (subject: string, price: string) =>
  `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
    `Hello Capt. Pahil, I want to join the founding batch of ${subject} (${price}). Please share the details.`
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
