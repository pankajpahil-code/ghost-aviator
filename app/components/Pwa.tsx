"use client";

import { useEffect, useRef, useState } from "react";

// The client half of the PWA layer:
//   • registers the service worker (public/sw.js) in production only,
//   • offers "Install Ghost Aviator" once the browser says the app is
//     installable (Android/Chromium; iOS never fires this — students there use
//     Share → Add to Home Screen), and
//   • tells the student when a saved-page update or an offline moment matters.
//
// Deliberately quiet: nothing appears in the first seconds of a visit, the
// install offer can be dismissed and stays dismissed for 60 days, and the
// update offer waits for a tap so a lesson page never reloads mid-read.

const DISMISS_KEY = "ga:pwa-install-dismissed-at";
const DISMISS_DAYS = 60;
const SHOW_INSTALL_AFTER_MS = 15000;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // iOS Safari's non-standard flag; safe to read as unknown shape.
  return Boolean((navigator as unknown as { standalone?: boolean }).standalone);
}

function installDismissedRecently(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    return Number.isFinite(at) && Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function Pwa() {
  const [offer, setOffer] = useState<null | "install" | "update">(null);
  const [offline, setOffline] = useState(false);
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const reloadingRef = useRef(false);

  // Offline awareness — a quiet pill instead of a broken-feeling page.
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  // Service worker registration + update flow. Production only: a dev-mode SW
  // fights `next dev`'s hot reload and would cache development assets.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloadingRef.current) return;
      reloadingRef.current = true;
      window.location.reload();
    });

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        registrationRef.current = reg;
        const noteWaiting = () => {
          if (reg.waiting && navigator.serviceWorker.controller) setOffer("update");
        };
        noteWaiting();
        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          installing?.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              setOffer("update");
            }
          });
        });
      })
      .catch(() => {
        // No service worker (old browser, blocked storage): the site simply
        // keeps working without the offline layer.
      });
  }, []);

  // Install offer: only when the browser confirms installability, only on a
  // real visit (not the first seconds), never after a recent dismissal, never
  // inside an already-installed app.
  useEffect(() => {
    if (isStandalone()) return;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      deferredRef.current = event as BeforeInstallPromptEvent;
      if (installDismissedRecently()) return;
      window.setTimeout(() => {
        if (deferredRef.current) setOffer((current) => current ?? "install");
      }, SHOW_INSTALL_AFTER_MS);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismissInstall = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Storage unavailable — dismiss for this session only.
    }
    setOffer(null);
  };

  const acceptInstall = async () => {
    const deferred = deferredRef.current;
    setOffer(null);
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      // The browser withdrew the prompt — nothing to do.
    }
    deferredRef.current = null;
  };

  const applyUpdate = () => {
    setOffer(null);
    registrationRef.current?.waiting?.postMessage({ type: "SKIP_WAITING" });
  };

  if (offline) {
    return (
      <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 print:hidden" style={{ pointerEvents: "none" }}>
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-auto flex items-center gap-2 rounded-xl border border-slate-600/60 bg-[#0b1117] px-4 py-2 text-xs text-slate-300 shadow-lg shadow-black/40"
        >
          <span aria-hidden="true">✈</span>
          Offline — saved chapters are still readable.
        </div>
      </div>
    );
  }

  if (!offer) return null;

  return (
    <div className="fixed inset-x-0 bottom-3 z-40 flex justify-center px-3 print:hidden" style={{ pointerEvents: "none" }}>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl border border-amber-400/25 bg-[#0b1117] px-4 py-3 text-sm text-slate-200 shadow-lg shadow-black/40"
      >
        {offer === "install" ? (
          <>
            <span className="min-w-0">
              Install Ghost Aviator — notes stay readable without data.
            </span>
            <button
              type="button"
              onClick={acceptInstall}
              className="shrink-0 rounded-lg bg-amber-300 px-4 py-2 text-xs font-bold text-slate-950"
            >
              Install
            </button>
            <button
              type="button"
              onClick={dismissInstall}
              aria-label="Dismiss install offer"
              className="shrink-0 rounded p-1 text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </>
        ) : (
          <>
            <span className="min-w-0">A newer version is ready.</span>
            <button
              type="button"
              onClick={applyUpdate}
              className="shrink-0 rounded-lg bg-amber-300 px-4 py-2 text-xs font-bold text-slate-950"
            >
              Refresh
            </button>
          </>
        )}
      </div>
    </div>
  );
}
