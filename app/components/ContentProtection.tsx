"use client";
import { useEffect } from "react";

// Site-wide content protection: blocks right-click, copy/cut, drag-save and the
// common save/devtools keyboard shortcuts. Form fields (search, answers) are
// left fully usable. This is strong deterrence against casual copying — it is
// not, and cannot be, absolute (browsers must render content to display it).
export default function ContentProtection() {
  useEffect(() => {
    const inField = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    };
    const block = (e: Event) => { if (!inField(e.target)) { e.preventDefault(); } };
    const onKey = (e: KeyboardEvent) => {
      if (inField(e.target)) return;
      const k = (e.key || "").toLowerCase();
      if (e.key === "F12") { e.preventDefault(); return; }
      if (e.ctrlKey || e.metaKey) {
        if (["s", "u", "p", "c", "x", "a"].includes(k)) { e.preventDefault(); return; }
        if (e.shiftKey && ["i", "j", "c"].includes(k)) { e.preventDefault(); return; }
      }
    };
    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    document.addEventListener("cut", block);
    document.addEventListener("dragstart", block);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
      document.removeEventListener("cut", block);
      document.removeEventListener("dragstart", block);
      document.removeEventListener("keydown", onKey);
    };
  }, []);
  return null;
}
