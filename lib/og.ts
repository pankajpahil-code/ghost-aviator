/**
 * The site-wide share image (app/opengraph-image.jpg), for pages that define
 * their own `openGraph`.
 *
 * Why this exists (ticket #10, 2026-10-25): Next merges metadata shallowly, so
 * a page that sets `openGraph` replaces the root object whole — including the
 * image that the root opengraph-image.jpg file convention supplies. /guides/*,
 * /question-bank/*, /about, /live-classes, /free-dgca-mock-test and
 * /metar-taf-practice were all shipping og:title and og:url with no og:image,
 * so a share showed a bare link. This reuses the existing image; no new art.
 */
export const OG_IMAGE_ALT =
  "Ghost Aviator - the guardian captain at the controls over night-lit India. Free DGCA CPL/ATPL exam preparation.";

export const DEFAULT_OG_IMAGES = [
  { url: "/opengraph-image.jpg", width: 1200, height: 630, alt: OG_IMAGE_ALT, type: "image/jpeg" },
];
