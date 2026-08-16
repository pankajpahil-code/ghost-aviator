"use client";

// The debrief — what you retained of clearances issued while you were busy.
//
// Shown once, after the multitasking clock stops and before the result. The
// questions and their marking live in lib/adapt/divided-attention.mjs; this
// component only asks them and collects what was picked.
//
// Three rules it exists to enforce, all of them about not accidentally turning
// a memory test into a reading test:
//
//   1. Nothing from the run is re-shown. No transcript, no strip history, no
//      "recap" button. The clearances went past and they are gone.
//   2. There is no clock. The real analogue does not time its debrief either,
//      and adding one would measure decision speed on top of retention — two
//      things in one number.
//   3. It cannot be skipped or gone back over. One pass, forwards, like the
//      run itself. A student who could revisit question one after seeing
//      question four would be answering a different test.

import { useState } from "react";
import { Radio } from "lucide-react";
import type { RecallQuestion } from "@/lib/adapt/divided-attention.mjs";

const cyan = "#f0913a";

type Props = {
  items: RecallQuestion[];
  onComplete: (answers: { id: string; chosen: number | null }[]) => void;
};

export default function RecallDebrief({ items, onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<{ id: string; chosen: number | null }[]>([]);

  const item = items[index];
  // Defensive rather than expected: a run too short to issue clearances asks
  // nothing, and the parent skips straight past. Rendering nothing is still the
  // right thing to do if that check is ever moved or missed.
  if (!item) return null;

  const answer = (chosen: number | null) => {
    const next = [...answers, { id: item.id, chosen }];
    setAnswers(next);
    if (index + 1 < items.length) setIndex(index + 1);
    else onComplete(next);
  };

  return (
    <div className="glass-card p-5 sm:p-7 select-none" onContextMenu={(e) => e.preventDefault()}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold tracking-widest" style={{ color: cyan, letterSpacing: "0.15em" }}>
          DEBRIEF
        </span>
        <span className="text-xs font-bold tabular-nums" style={{ color: "#94a3b8" }}>
          {index + 1} of {items.length}
        </span>
      </div>

      <p className="text-xs mb-5" style={{ color: "#94a3b8" }}>
        ATC gave you these while you were flying. Nothing is shown again — answer from memory.
        There is no time limit and no negative marking, so never leave one blank.
      </p>

      <div className="flex items-start gap-2 mb-5">
        <Radio className="w-5 h-5 mt-1 shrink-0" style={{ color: "#38bdf8" }} />
        <h3 className="font-black text-white text-lg sm:text-xl">{item.stem}</h3>
      </div>

      <div className="grid gap-2">
        {item.options.map((option, i) => (
          <button
            key={i}
            onClick={() => answer(i)}
            className="text-left px-4 py-3 rounded-lg font-bold text-sm sm:text-base"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "#e2e8f0",
            }}
          >
            {option}
          </button>
        ))}
      </div>

      {/* Offered rather than hidden. A student who genuinely cannot remember
          should be able to say so and move on — but the copy above has already
          told them a guess costs nothing, which is the lesson that matters in
          a real DGCA paper too. */}
      <button
        onClick={() => answer(null)}
        className="mt-4 text-xs underline"
        style={{ color: "#64748b" }}
      >
        I do not remember — skip
      </button>
    </div>
  );
}
