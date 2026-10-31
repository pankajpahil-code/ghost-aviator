"use client";
import { useUser } from "@/lib/supabase";

// Faint, tiled, un-selectable overlay across content. When a user is logged in
// it stamps their email everywhere, so any screenshot that leaks is traceable
// back to the account. Falls back to brand text for signed-out visitors.
export default function Watermark() {
  const { user } = useUser();
  const label = (user?.email || (user?.user_metadata?.name as string) || "Ghost Aviator · Capt. Pankaj Pahil").slice(0, 48);
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='200'>` +
    `<text x='10' y='110' transform='rotate(-28 180 100)' fill='rgba(140,140,160,0.10)' ` +
    `font-size='15' font-family='Arial, sans-serif'>${label.replace(/[<>&]/g, "")}</text></svg>`;
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 45,
        pointerEvents: "none",
        backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
        backgroundRepeat: "repeat",
        userSelect: "none",
      }}
    />
  );
}
