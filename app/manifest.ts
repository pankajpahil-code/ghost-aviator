import type { MetadataRoute } from "next";

// The web app manifest — what Android (and any Chromium browser) reads to
// install Ghost Aviator as an app: home-screen name, standalone window, theme
// colour matching the site's dark shell (#0a0f14), and the icons.
//
// The icons under /icons/ are Gini — the site's own character — composited
// (artwork untouched) on the brand dark by tools/pwa/icon-lab.html; the source
// still is public/gini/sprites/happy.webp. Captain's call, 17 Oct 2026: the
// ghost mark (app/icon.svg) stays the favicon; the app icon is Gini.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Ghost Aviator — DGCA CPL & ATPL Prep",
    short_name: "Ghost Aviator",
    description:
      "Free DGCA CPL and ATPL chapter notes, question bank, mock tests and tools for student pilots in India.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0f14",
    theme_color: "#0a0f14",
    lang: "en-IN",
    categories: ["education"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    // Shortcuts are the long-press menu on the home-screen icon. Three doors
    // into the free core: notes, questions, mocks.
    shortcuts: [
      { name: "Free chapter notes", url: "/notes" },
      { name: "Question bank", url: "/question-bank" },
      { name: "Mock test", url: "/mock-test" },
    ],
  };
}
