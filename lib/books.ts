import { LIVE_WHATSAPP } from "./live-classes";

export type AuthoredBook = {
  slug: string;
  title: string;
  subtitle: string;
  author: string;
  edition: string;
  coverImage: string;
  isReadyForSale: boolean;
  revisionNote?: string;
  pdfPrice: string;
  pdfListPrice: string;
  pdfPriceValue: string;
  paperbackListPrice?: string;
  paperbackPrice?: string;
  pdfPaymentUrl: string; // Instamojo / Razorpay digital payment link (auto-delivers PDF)
  amazonUrl: string; // Amazon KDP Paperback URL
  kindleUrl?: string;
  tagline: string;
  features: string[];
};

/**
 * Single source of truth for Capt. Pankaj Pahil's authored books.
 * The free web notes on ghostaviator.com remain 100% free and open for every student (Boon 5).
 * Purchase controls render only when the Captain explicitly marks an edition ready for sale.
 * All authored offline editions are currently unavailable; their free web chapters remain open.
 */
export const AUTHORED_BOOKS: Record<string, AuthoredBook> = {
  "rtra-mastery": {
    slug: "rtra-mastery",
    title: "Complete RTR(A) Examination Book",
    subtitle: "Illuminated Guide to the DGCA Radio Telephone Operator Examination",
    author: "Capt. Pankaj Pahil",
    edition: "2026 Master Edition",
    coverImage: "/content/radio-telephony/_assets/images/pdf_front_cover.jpg",
    isReadyForSale: false,
    revisionNote: "Not currently for sale. The complete online edition remains free on Ghost Aviator.",
    pdfPrice: "₹999",
    pdfListPrice: "₹1,999",
    pdfPriceValue: "999",
    paperbackListPrice: "₹2,499",
    paperbackPrice: "₹1,799",
    pdfPaymentUrl: "", // Paste your Instamojo / Razorpay digital product link here
    amazonUrl: "", // Paste your Amazon KDP listing URL here
    tagline: "The definitive guide written by a DGCA flight & ground instructor",
    features: [
      "Complete 24-chapter illustrated offline study PDF",
      "Full 418-question exam bank with answer keys",
      "Part 1 written exam formula sheets & light-signal cards",
      "Part 2 oral/viva master guide with standard ICAO radiotelephony scripts",
    ],
  },
  "technical-general": {
    slug: "technical-general",
    title: "Technical General for Aviators",
    subtitle: "Aircraft Systems, Engines, Aerodynamics & Performance",
    author: "Capt. Pankaj Pahil",
    edition: "Revision in Progress",
    coverImage: "",
    isReadyForSale: false,
    revisionNote: "Undergoing comprehensive editorial rewrite, cinematic diagram additions, and deep topic research to match the RTR(A) gold standard. Currently not for sale.",
    pdfPrice: "₹1,499",
    pdfListPrice: "₹2,999",
    pdfPriceValue: "1499",
    paperbackListPrice: "₹3,499",
    paperbackPrice: "₹2,499",
    pdfPaymentUrl: "",
    amazonUrl: "",
    tagline: "First-principles engineering decoded for commercial pilots",
    features: [
      "Comprehensive 36-chapter technical manual currently in active development",
      "Piston, turbine & jet engines with cutaway diagrams",
      "Airframe systems, hydraulics, electrics & flight controls",
      "Performance, weight & balance and high-speed aerodynamics",
    ],
  },
};

/**
 * Generates an automated WhatsApp link for ordering a book directly.
 */
export const bookWaOrderLink = (bookTitle: string, editionType: "PDF" | "Paperback", price: string): string => {
  return `https://wa.me/${LIVE_WHATSAPP}?text=${encodeURIComponent(
    `Hello Capt. Pahil, I would like to order the ${editionType} edition of '${bookTitle}' (${price}). Please share the payment & delivery details.`
  )}`;
};

/**
 * Returns the direct payment URL for the PDF edition, falling back to smart WhatsApp ordering.
 */
export const getBookPdfCheckoutUrl = (slug: string): string => {
  const book = AUTHORED_BOOKS[slug];
  if (!book) return `https://wa.me/${LIVE_WHATSAPP}`;

  if (book.pdfPaymentUrl && book.pdfPaymentUrl.trim().length > 0) {
    return book.pdfPaymentUrl;
  }
  return bookWaOrderLink(book.title, "PDF", book.pdfPrice);
};

/**
 * Returns the Amazon URL for the paperback edition, falling back to WhatsApp physical order inquiry.
 */
export const getBookPaperbackUrl = (slug: string): string => {
  const book = AUTHORED_BOOKS[slug];
  if (!book) return `https://wa.me/${LIVE_WHATSAPP}`;

  if (book.amazonUrl && book.amazonUrl.trim().length > 0) {
    return book.amazonUrl;
  }
  return bookWaOrderLink(book.title, "Paperback", book.paperbackPrice ?? "Paperback");
};
