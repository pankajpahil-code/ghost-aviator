// Single source of truth for the AI Self-Study product.
//
// POSITIONING
//   This is NOT a cheaper live class. The live cohort is the Captain's time,
//   accountability and judgment. AI Self-Study is the study system around the
//   free library, with Gini as the 24/7 study partner. The library stays free;
//   the paid product is the plan, the review routine and the human checkpoint.
//   Keeping the free library and the paid system separate is the whole point.
//
// PRICES ARE FOUNDING PROPOSALS, NOT A CAPTAIN-APPROVED PRICE LIST YET.
//   monthly ₹999 · six months ₹4,999 · annual ₹8,999
//   Change them here only, and only after the Captain confirms them. Every
//   page, schema offer and Gini pitch imports from this file so a public price
//   cannot drift from the product page.
//
// CHECKOUT
//   Paste the Razorpay/Cashfree payment-page URLs into AI_SELF_STUDY_PAYMENT_LINKS
//   when they exist. Until then every CTA falls back to a pre-filled WhatsApp
//   message and the page says the founding list is open rather than pretending
//   a checkout exists.

import { LIVE_WHATSAPP } from "@/lib/live-classes";

export type AiSelfStudyPlanId = "monthly" | "six-months" | "annual";

export type AiSelfStudyPlan = {
  id: AiSelfStudyPlanId;
  name: string;
  price: string;
  priceValue: string;
  cadence: string;
  equivalent: string;
  bestFor: string;
  badge?: string;
  featured?: boolean;
  features: readonly string[];
};

export const AI_SELF_STUDY_PLANS: readonly AiSelfStudyPlan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: "₹999",
    priceValue: "999",
    cadence: "per month",
    equivalent: "Cancel anytime",
    bestFor: "Testing the system before a long exam cycle",
    features: [
      "Study system for the full library",
      "Gini: chapter-cited answers, 24/7 (beta)",
      "Study-plan templates and weekly targets",
      "Mock tests with answers and explanations",
      "Works on phone, tablet and laptop",
      "Cancel anytime",
    ],
  },
  {
    id: "six-months",
    name: "Six months",
    price: "₹4,999",
    priceValue: "4999",
    cadence: "for 6 months",
    equivalent: "₹833/month equivalent · save ₹995",
    bestFor: "One full CPL or ATPL exam cycle",
    badge: "Most students",
    featured: true,
    features: [
      "Everything in Monthly",
      "Monthly group Q&A with the Captain",
      "Written class summaries from live cohorts",
      "Mock review: weak topics and next actions",
      "Priority questions for the next live Q&A",
      "No recordings — ever",
    ],
  },
  {
    id: "annual",
    name: "Annual",
    price: "₹8,999",
    priceValue: "8999",
    cadence: "for 12 months",
    equivalent: "₹750/month equivalent · save ₹2,989",
    bestFor: "Serious long-term preparation, CPL through ATPL",
    badge: "Best value",
    features: [
      "Everything in Six months",
      "12 months of access",
      "Exam-cycle planning across papers",
      "First access to new question banks and guides",
      "Written summaries from every live cohort",
      "No recordings — ever",
    ],
  },
];

/**
 * Razorpay/Cashfree payment-page URLs, keyed by plan id.
 * Empty = checkout not live yet; the UI must not pretend otherwise.
 */
export const AI_SELF_STUDY_PAYMENT_LINKS: Record<AiSelfStudyPlanId, string> = {
  monthly: "",
  "six-months": "",
  annual: "",
};

export const AI_SELF_STUDY_CHECKOUT_LIVE = Object.values(
  AI_SELF_STUDY_PAYMENT_LINKS,
).some(url => url.trim().length > 0);

export const hasAiSelfStudyPaymentLink = (planId: AiSelfStudyPlanId): boolean =>
  Boolean(AI_SELF_STUDY_PAYMENT_LINKS[planId]?.trim());

/**
 * Direct checkout when a payment page exists; otherwise a pre-filled WhatsApp
 * message to the Captain. Never invent a payment URL.
 */
export const aiSelfStudyEnrollLink = (
  plan: Pick<AiSelfStudyPlan, "id" | "name" | "price">,
): string => {
  const direct = AI_SELF_STUDY_PAYMENT_LINKS[plan.id];
  if (hasAiSelfStudyPaymentLink(plan.id)) return direct;

  return `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
    `Hello Captain, I want to join the AI Self-Study founding list — ${plan.name} (${plan.price}). Please tell me when checkout opens.`,
  )}`;
};

/** The upgrade path: the live cohort remains the premium product. */
export const AI_SELF_STUDY_UPGRADE_NOTE =
  "AI Self-Study is a separate product. It does not include live classes or recordings. The live cohort remains the premium way to work with the Captain.";
