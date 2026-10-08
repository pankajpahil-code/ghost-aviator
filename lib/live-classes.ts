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

/**
 * CLASS ENQUIRIES — the ONE route for the whole site. 8 Oct 2026, the Captain's ruling: no personal phone
 * number (and no personal name) anywhere public. Every "enquire / join / paid? / order" button opens the
 * Ghost Aviator assistant on Telegram; it records the enquiry and alerts the instructor privately, and he
 * answers in the same chat. The sales desk reads this constant too (sync_knowledge.py -> enquiry_route).
 * TEMPORARY (8 Oct 2026): points at Neki (@NayKi10_bot), the desk running in LIVE mode, because the
 * main desk (@GhostAviator2_Bot, Chhotu) is in draft mode and holds every public reply until the Captain
 * approves it. Switch back to GhostAviator2_Bot when Chhotu goes live.
 * Never put a phone number or a wa.me link here.
 */
export const LIVE_ENQUIRY_URL = "https://t.me/NayKi10_bot?start=enquiry";

/** The enquiry route, tagged so the assistant knows where the student came from (Telegram start
 *  parameter: A-Z a-z 0-9 _ - only, at most 64 characters). */
export const enquiryLink = (tag = "enquiry"): string => {
  const safe = tag.replace(/[^A-Za-z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 64) || "enquiry";
  return LIVE_ENQUIRY_URL.replace(/([?&]start=)[^&]*/, `$1${safe}`);
};

/** One subject, live, batch of 10. */
export const LIVE_LIST_PRICE = "₹12,999";
export const LIVE_PRICE = "₹7,999";

/** Gen Nav + Radio Nav + Instrumentation — the composite DGCA Navigation paper. */
export const LIVE_COMBO_LIST_PRICE = "₹23,999";
export const LIVE_COMBO_PRICE = "₹14,999";

/** Bare numbers for schema.org offers, which must not carry a currency symbol. */
export const LIVE_PRICE_VALUE = "7999";
export const LIVE_COMBO_PRICE_VALUE = "14999";

/** "Enquire" for one batch. (Was a WhatsApp link to a personal number until 8 Oct 2026.) */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const liveEnquiryLink = (subject: string, _price?: string): string =>
  enquiryLink("join_" + subject.toLowerCase());

/**
 * Direct payment links (Instamojo / Razorpay payment pages) for automated enrollment.
 * When a URL is configured here, students can pay directly online without waiting for manual WhatsApp replies.
 * If empty/undefined, liveEnrollLink falls back to the enquiry route (LIVE_ENQUIRY_URL).
 */
export const LIVE_PAYMENT_LINKS: Record<string, string> = {
  "general": "",
  "meteorology": "",
  "air-regulations": "",
  "air-navigation": "",
  "radio-navigation": "",
  "instrumentation": "",
  "radio-telephony": "",
};

/**
 * UPI — added 2026-09-21 on the Captain's instruction. Lets a student pay at
 * 2 AM without anyone awake. Fields DECODED from his PhonePe QR, not retyped:
 *   upi://pay?pa=9643961464@axl&pn=PRISHA%20&mc=0000&mode=02&purpose=00
 * mc=0000 is a personal (P2P) account: scanning the QR is the reliable path;
 * the upi:// link is a best-effort shortcut some apps refuse for P2P amounts.
 *
 * The QR images in public/pay/ are generated from these by
 * tools/pay/build-upi-qr.py, which decodes each image back and fails unless it
 * pays exactly this address. Change the VPA here AND re-run that script.
 */
export const LIVE_UPI_VPA = "9643961464@axl";
export const LIVE_UPI_PAYEE = "PRISHA";
export const LIVE_UPI_QR = { single: "/pay/upi-7999.png", combo: "/pay/upi-14999.png" };

export const liveUpiLink = (amountValue: string, note: string): string =>
  `upi://pay?pa=${LIVE_UPI_VPA}&pn=${encodeURIComponent(LIVE_UPI_PAYEE)}&mc=0000&mode=02&purpose=00` +
  `&am=${amountValue}.00&cu=INR&tn=${encodeURIComponent(note)}`;

/** After paying by UPI there is no automatic receipt — the student sends the screenshot. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const livePaidLink = (what: string, _price?: string): string =>
  enquiryLink("paid_" + what.toLowerCase());

/** Direct payment link for the full 3-subject Navigation Combo. */
export const LIVE_COMBO_PAYMENT_LINK: string = "";

export const hasLivePaymentLink = (subjectKey: string): boolean =>
  Boolean(LIVE_PAYMENT_LINKS[subjectKey]?.trim());

export const hasLiveComboPaymentLink = (): boolean =>
  Boolean(LIVE_COMBO_PAYMENT_LINK.trim());

/**
 * Returns the direct payment/enrollment URL if configured; otherwise the enquiry route.
 */
export const liveEnrollLink = (subjectKey: string, subjectDisplayName: string, price: string): string => {
  const directUrl = LIVE_PAYMENT_LINKS[subjectKey];
  if (hasLivePaymentLink(subjectKey)) {
    return directUrl;
  }
  void subjectDisplayName; void price;
  return enquiryLink("enrol_" + subjectKey);
};

/**
 * Returns the direct combo payment URL if configured; otherwise the enquiry route.
 */
export const liveComboEnrollLink = (): string => {
  const directComboUrl: string = LIVE_COMBO_PAYMENT_LINK;
  if (hasLiveComboPaymentLink()) {
    return directComboUrl;
  }
  return enquiryLink("enrol_nav_combo");
};

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

/**
 * The Ghost Aviator assistant on Telegram (username, no "@"). ONE switch for every "ask the
 * assistant" button on the site: EMPTY = all of them stay hidden. Set it once the Captain has chosen
 * the branded bot username in @BotFather (the current token's username is not branded).
 * The start tag tells the bot where the student came from, and opens the right flow:
 * a tag containing "career" opens the Career Navigator, "quiz" the readiness check.
 * TEMPORARY (8 Oct 2026): Neki (live) for the same reason as LIVE_ENQUIRY_URL above; was "GhostAviator2_Bot".
 */
export const LIVE_TELEGRAM_BOT: string = "NayKi10_bot";

export const botLink = (tag: string): string =>
  LIVE_TELEGRAM_BOT ? `https://t.me/${LIVE_TELEGRAM_BOT}?start=${encodeURIComponent(tag)}` : "";

/** The three subjects the Navigation combo covers, by site subject id. */
export const LIVE_COMBO_SUBJECTS = ["air-navigation", "radio-navigation", "instrumentation"];
