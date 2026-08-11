"use client";

// ADAPT — the free-account invitation.
//
// Capt. Pahil's instruction, 2026-08-10: "ask student for free signup, record
// their result so that we have data".
//
// ── It ASKS. It does not gate. ────────────────────────────────────────────
//
// Every module runs signed-out, exactly as before, and nothing is withheld from
// a student who never makes an account. That is a deliberate reading of "ask",
// and it is also the only version consistent with the rest of this site: a
// student who cannot afford coaching is the person this was built for, and a
// wall between them and free practice would be the one thing the site exists
// not to do.
//
// What an account genuinely adds is stated plainly and is all true:
//   * the result is saved, so it survives losing a phone;
//   * sittings accumulate into a learning curve, which is a real measure the
//     screening batteries themselves use;
//   * progress follows the student between devices.
//
// ── What it must never do ────────────────────────────────────────────────
//
// Overstate what is stored, or imply an account is needed to practise. The copy
// here and the copy on the feature page and FAQ have to agree, because they are
// all describing the same promise.

import Link from "next/link";
import { CloudUpload, LineChart, Smartphone, UserPlus } from "lucide-react";

const cyan = "#f0913a";

const BENEFITS = [
  { icon: CloudUpload, text: "Your results are saved, so a lost phone does not lose your history." },
  { icon: LineChart, text: "Sittings build into a learning curve — how fast you improve is itself something screening measures." },
  { icon: Smartphone, text: "Practise on a laptop, check your progress on your phone." },
];

/**
 * `where` changes the framing but never the offer.
 *  - "brief"  before a session: an invitation, easy to walk past.
 *  - "result" after one: the moment it is concrete, because there is now a real
 *    result on screen that would have been saved.
 */
export default function SignupPrompt({ where }: { where: "brief" | "result" }) {
  const heading = where === "result" ? "This result was not saved" : "Save your results — free account";

  return (
    <div
      className="rounded-xl p-5 mb-6"
      style={{ background: "rgba(240,145,58,0.07)", border: "1px solid rgba(240,145,58,0.3)" }}
    >
      <div className="flex items-start gap-3 mb-3">
        <UserPlus className="w-5 h-5 mt-0.5 shrink-0" style={{ color: cyan }} aria-hidden />
        <div>
          <div className="font-bold text-white">{heading}</div>
          <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
            {where === "result"
              ? "You are not signed in, so this sitting lives only in this browser. A free account keeps it."
              : "Everything here works without an account. Signing in is what makes it stick."}
          </p>
        </div>
      </div>

      <ul className="space-y-2 mb-4">
        {BENEFITS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2 text-xs" style={{ color: "#cbd5e1" }}>
            <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: cyan }} aria-hidden />
            <span>{text}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/signup"
          className="px-5 py-2 rounded-lg text-sm font-black no-underline"
          style={{ background: "linear-gradient(135deg,#c25a1e,#c25a1e)", color: "#fff" }}
        >
          Create a free account
        </Link>
        <Link href="/login" className="text-xs font-bold no-underline" style={{ color: cyan }}>
          Already have one? Log in
        </Link>
      </div>

      <p className="text-[11px] mt-3 leading-relaxed" style={{ color: "#64748b" }}>
        Free, and free for good — Ghost Aviator does not charge student pilots. Signed in, we save
        your score and the breakdown behind it so we can find the questions that are too hard and
        fix them. We never save your answers, and nothing at all from the attitudes questionnaire
        beyond the fact that you finished it. Your results are yours; they are not shared or sold.
      </p>
    </div>
  );
}
