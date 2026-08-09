"use client";

// Attitudes & Airmanship — the personality questionnaire.
//
// Forced choice: for each situation the student marks which response is MOST
// like them and which is LEAST. Forced choice matters — a Likert scale lets
// everyone agree with every good-sounding statement, which measures nothing.
//
// Untimed, exactly as the real questionnaire is. Nothing here is transmitted:
// the answers live in this component and the profile is computed on the device.

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import type { Scenario, PersonalityResponse } from "@/lib/adapt/personality.mjs";

const cyan = "#f0913a";

type Props = { scenarios: Scenario[]; onComplete: (responses: PersonalityResponse[]) => void };

export default function AttitudesTask({ scenarios, onComplete }: Props) {
  const [picks, setPicks] = useState<Record<string, { most?: string; least?: string }>>({});

  const set = (id: string, field: "most" | "least", key: string) => {
    setPicks((prev) => {
      const cur = { ...(prev[id] ?? {}) };
      // Most and least cannot be the same response — choosing one clears the
      // other rather than silently producing an answer that scores as nothing.
      if (field === "most" && cur.least === key) delete cur.least;
      if (field === "least" && cur.most === key) delete cur.most;
      cur[field] = key;
      return { ...prev, [id]: cur };
    });
  };

  const done = scenarios.filter((s) => picks[s.id]?.most && picks[s.id]?.least).length;

  return (
    <div className="glass-card p-5 sm:p-7 select-none" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold tracking-widest" style={{ color: cyan, letterSpacing: "0.15em" }}>
          ATTITUDES &amp; AIRMANSHIP
        </span>
        <span className="text-xs" style={{ color: "#64748b" }}>{done} of {scenarios.length} · no time limit</span>
      </div>
      <p className="text-sm mb-4" style={{ color: "#94a3b8" }}>
        For each situation, mark the response that is <strong className="text-white">most</strong> like
        you and the one that is <strong className="text-white">least</strong>. There is no right
        answer and nothing is graded — answer as yourself, not as the pilot you think we want.
      </p>
      <div className="rounded-lg p-3 mb-6 text-xs" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.25)", color: "#cbd5e1" }}>
        <ShieldCheck className="w-3.5 h-3.5 inline mr-1.5" style={{ color: "#22c55e" }} />
        Your answers stay on this device. They are not sent anywhere, not stored on our servers,
        and no score from this module goes into your aptitude result.
      </div>

      <div className="space-y-6">
        {scenarios.map((s, n) => (
          <div key={s.id} className="p-4 rounded-lg" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-sm text-white mb-1"><span style={{ color: cyan }}>{n + 1}.</span> {s.situation}</p>
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 gap-y-1 items-center mt-3">
              <span />
              <span className="text-[10px] font-bold text-center" style={{ color: "#64748b" }}>MOST</span>
              <span className="text-[10px] font-bold text-center" style={{ color: "#64748b" }}>LEAST</span>
              {Object.entries(s.options).map(([key, text]) => (
                <ScenarioRow
                  key={key}
                  text={text}
                  most={picks[s.id]?.most === key}
                  least={picks[s.id]?.least === key}
                  onMost={() => set(s.id, "most", key)}
                  onLeast={() => set(s.id, "least", key)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onComplete(scenarios.map((s) => ({ id: s.id, most: picks[s.id]?.most ?? null, least: picks[s.id]?.least ?? null })))}
        className="btn-primary px-6 py-3 font-bold rounded-lg mt-6"
      >
        {done === scenarios.length ? "Finish and see my profile" : `Finish (${done} of ${scenarios.length} answered)`}
      </button>
    </div>
  );
}

function ScenarioRow({ text, most, least, onMost, onLeast }: {
  text: string; most: boolean; least: boolean; onMost: () => void; onLeast: () => void;
}) {
  const dot = (on: boolean, colour: string) => ({
    width: 22, height: 22, borderRadius: 999,
    border: `2px solid ${on ? colour : "rgba(255,255,255,0.22)"}`,
    background: on ? colour : "transparent",
  });
  return (
    <>
      <span className="text-xs leading-relaxed py-1.5" style={{ color: most ? "#fff" : least ? "#64748b" : "#cbd5e1" }}>{text}</span>
      <button aria-label="Most like me" onClick={onMost} className="justify-self-center" style={dot(most, "#22c55e")} />
      <button aria-label="Least like me" onClick={onLeast} className="justify-self-center" style={dot(least, "#ef4444")} />
    </>
  );
}
