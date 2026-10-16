"use client";

// Where does a stored chapterId's notes page live? One resolver for both
// review surfaces (the dashboard's weak-chapter bars and the per-attempt
// review page).
//
// The fast path is bank-free (lib/subjects only): most stored ids ARE site
// chapter ids, and each track's chapter list gives the route directly —
// /cpl/<subject>/<chapter>/notes or /atpl/<subject>/<chapter>/notes.
//
// Air Regulations is special, and getting it right matters: a question's
// stored chapterId is the OLD RK Bali bank id (ar-N / sar), not the site id,
// and the bank→site relation is many-to-one (bank ar-7 serves site ar-9 AND
// ar-11). That inversion lives in lib/air-regs-chapter-label.ts, which
// imports the question bank — so it is loaded ON DEMAND here, exactly as the
// dashboard already did for labels, and this module stays light enough for
// the dashboard bundle. Where several site chapters draw on one bank chapter
// the FIRST in syllabus order is linked (the label shows all of them, so the
// click is never a surprise); this is a study shortcut, not a data mapping.
import { useCallback, useEffect, useState } from "react";
import { CPL_SUBJECTS, ATPL_SUBJECTS, type Subject } from "./subjects";

export type Track = "cpl" | "atpl";

// Kept as a literal, bank-free copy of lib/air-regs-chapter-label.ts
// looksLikeAirRegsBankId — that module carries the question bank and must not
// be imported statically from here. If the bank-id shape ever changes, both
// change together (the same phrasing the dashboard used before this file).
export const looksLikeAirRegsBankId = (id: string) =>
  /^ar-\d+$/.test(id) || id === "sar";

const buildMaps = (subjects: Subject[], base: Track) => {
  const href: Record<string, string> = {};
  const label: Record<string, string> = {};
  for (const s of subjects) {
    for (const c of s.chapters) {
      if (!(c.id in href)) href[c.id] = `/${base}/${s.id}/${c.id}/notes`;
      if (!(c.id in label)) label[c.id] = `${s.shortName} · Ch.${c.number} ${c.title}`;
    }
  }
  return { href, label };
};

const CPL_MAPS = buildMaps(CPL_SUBJECTS, "cpl");
const ATPL_MAPS = buildMaps(ATPL_SUBJECTS, "atpl");

/** Notes route for a stored SITE chapter id, in the given track. */
export function directChapterHref(storedChapterId: string, track: Track): string | undefined {
  return (track === "atpl" ? ATPL_MAPS : CPL_MAPS).href[storedChapterId];
}

/** Display label ("Met · Ch.1 Atmosphere") for a stored SITE chapter id. */
export function directChapterLabel(storedChapterId: string, track: Track): string | undefined {
  return (track === "atpl" ? ATPL_MAPS : CPL_MAPS).label[storedChapterId];
}

type BankModule = typeof import("./air-regs-chapter-label");

export interface StoredChapterResolution {
  /** Notes route for a stored chapterId (bank ids translated), or undefined. */
  hrefFor: (storedChapterId: string, track: Track) => string | undefined;
  /**
   * Display labels for a stored chapterId. undefined = the bank module is
   * still loading (render nothing yet); [] = nothing maps (show a fallback).
   */
  labelsFor: (storedChapterId: string, track: Track) => string[] | undefined;
}

/**
 * Resolve stored chapter ids to notes routes + labels. `needsBank` is the
 * caller's cheap pre-check (any air-regs-looking id in the data it will
 * render); the bank-coupled module is only fetched when true.
 */
export function useStoredChapterResolution(needsBank: boolean): StoredChapterResolution {
  const [bank, setBank] = useState<BankModule | null>(null);

  useEffect(() => {
    if (!needsBank) return;
    let live = true;
    import("./air-regs-chapter-label")
      .then(m => { if (live) setBank(m); })
      .catch(() => { /* bank module unavailable: bars keep their fallback labels */ });
    return () => { live = false; };
  }, [needsBank]);

  const hrefFor = useCallback(
    (storedChapterId: string, track: Track): string | undefined => {
      if (!looksLikeAirRegsBankId(storedChapterId)) return directChapterHref(storedChapterId, track);
      if (!bank) return undefined;
      for (const site of bank.siteChaptersServedByBankId(storedChapterId, track)) {
        const href = directChapterHref(site, track);
        if (href) return href;
      }
      return undefined;
    },
    [bank],
  );

  const labelsFor = useCallback(
    (storedChapterId: string, track: Track): string[] | undefined => {
      if (!looksLikeAirRegsBankId(storedChapterId)) {
        const one = directChapterLabel(storedChapterId, track);
        return one ? [one] : [];
      }
      if (!bank) return undefined;
      return bank
        .siteChaptersServedByBankId(storedChapterId, track)
        .map(site => directChapterLabel(site, track))
        .filter((l): l is string => !!l);
    },
    [bank],
  );

  return { hrefFor, labelsFor };
}
