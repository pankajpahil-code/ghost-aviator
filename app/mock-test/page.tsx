"use client";
import { useState, useEffect, useCallback } from "react";
import { Clock, CheckCircle, XCircle, AlertTriangle, ArrowRight, RotateCcw } from "lucide-react";

const SAMPLE_QUESTIONS = [
  {
    id: 1,
    subject: "Air Regulations",
    question: "The minimum age requirement for a Commercial Pilot Licence (CPL) in India as per DGCA regulations is:",
    options: ["17 years","18 years","19 years","21 years"],
    answer: 1,
    explanation: "As per DGCA CAR Section 7 Series C Part I, the minimum age to hold a CPL is 18 years.",
  },
  {
    id: 2,
    subject: "Meteorology",
    question: "A METAR report showing wind direction 270° means the wind is coming from the:",
    options: ["East","West","North","South"],
    answer: 1,
    explanation: "Wind direction in METAR is the direction FROM which the wind blows. 270° is due West.",
  },
  {
    id: 3,
    subject: "General Navigation",
    question: "If an aircraft is flying a true heading of 090° with a variation of 5°W, the magnetic heading is:",
    options: ["085°","090°","095°","080°"],
    answer: 2,
    explanation: "Magnetic heading = True heading + West variation = 090° + 5° = 095°. (TVMDC rule: East is least, West is best)",
  },
  {
    id: 4,
    subject: "Technical General",
    question: "In a four-stroke engine, the order of strokes is:",
    options: [
      "Intake, Power, Compression, Exhaust",
      "Intake, Compression, Power, Exhaust",
      "Compression, Intake, Power, Exhaust",
      "Power, Intake, Compression, Exhaust",
    ],
    answer: 1,
    explanation: "The four strokes in order are: Intake → Compression → Power (combustion) → Exhaust.",
  },
  {
    id: 5,
    subject: "Radio Aids & Instruments",
    question: "The VOR indicator shows a full-scale deflection of the CDI. This means the aircraft is at least how many degrees off course?",
    options: ["5°","10°","15°","20°"],
    answer: 1,
    explanation: "A standard VOR CDI has full-scale deflection at 10° from the selected radial.",
  },
  {
    id: 6,
    subject: "Performance",
    question: "V1 in aircraft performance refers to:",
    options: [
      "Stall speed in landing configuration",
      "Takeoff decision speed",
      "Best angle of climb speed",
      "Maximum gear extension speed",
    ],
    answer: 1,
    explanation: "V1 is the takeoff decision speed. Above V1, the pilot is committed to takeoff even if an engine fails.",
  },
  {
    id: 7,
    subject: "Air Regulations",
    question: "Under DGCA regulations, the validity of a Class 1 Medical Certificate for a pilot below 40 years of age is:",
    options: ["6 months","12 months","18 months","24 months"],
    answer: 1,
    explanation: "For pilots under 40 years, the Class 1 Medical Certificate is valid for 12 months.",
  },
  {
    id: 8,
    subject: "Meteorology",
    question: "What does QNH represent on an altimeter?",
    options: [
      "Height above sea level with standard pressure set",
      "Altitude above sea level with local QNH pressure set",
      "Height above aerodrome elevation",
      "Pressure altitude",
    ],
    answer: 1,
    explanation: "QNH is the altimeter setting that causes the instrument to read altitude above mean sea level when at the aerodrome.",
  },
  {
    id: 9,
    subject: "Technical General",
    question: "Bernoulli's theorem states that as the velocity of airflow increases, the pressure:",
    options: ["Increases","Decreases","Remains the same","First increases then decreases"],
    answer: 1,
    explanation: "Bernoulli's principle: in a streamline flow, as velocity increases, static pressure decreases. This is the basis of lift generation.",
  },
  {
    id: 10,
    subject: "General Navigation",
    question: "The great circle distance between two points is always:",
    options: [
      "Greater than the rhumb line distance",
      "Equal to the rhumb line distance",
      "Less than or equal to the rhumb line distance",
      "Always exactly half the rhumb line distance",
    ],
    answer: 2,
    explanation: "A great circle is the shortest path between two points on a sphere. It is always less than or equal to the rhumb line distance.",
  },
];

const EXAM_DURATION = 30 * 60; // 30 minutes

type Phase = "setup" | "exam" | "result";

export default function MockTestPage() {
  const [phase, setPhase]       = useState<Phase>("setup");
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState<(number | null)[]>(Array(SAMPLE_QUESTIONS.length).fill(null));
  const [revealed, setRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [flagged, setFlagged]   = useState<boolean[]>(Array(SAMPLE_QUESTIONS.length).fill(false));

  const submit = useCallback(() => setPhase("result"), []);

  useEffect(() => {
    if (phase !== "exam") return;
    if (timeLeft <= 0) { submit(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, submit]);

  const q = SAMPLE_QUESTIONS[current];
  const answered = answers.filter(a => a !== null).length;
  const score    = answers.filter((a, i) => a === SAMPLE_QUESTIONS[i].answer).length;
  const pct      = Math.round((score / SAMPLE_QUESTIONS.length) * 100);
  const passed   = pct >= 70;

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;

  function selectAnswer(idx: number) {
    if (answers[current] !== null) return;
    const next = [...answers];
    next[current] = idx;
    setAnswers(next);
    setRevealed(true);
  }

  function next() {
    setRevealed(false);
    if (current < SAMPLE_QUESTIONS.length - 1) setCurrent(c => c + 1);
    else submit();
  }

  function restart() {
    setPhase("setup"); setCurrent(0); setTimeLeft(EXAM_DURATION);
    setAnswers(Array(SAMPLE_QUESTIONS.length).fill(null));
    setRevealed(false);
    setFlagged(Array(SAMPLE_QUESTIONS.length).fill(false));
  }

  /* ── SETUP ── */
  if (phase === "setup") return (
    <div className="grid-bg min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-lg w-full text-center">
        <div className="text-5xl mb-4">✈️</div>
        <h1 className="text-3xl font-extrabold mb-2">DGCA Mock Test</h1>
        <p className="mb-8" style={{ color: "#94a3b8" }}>
          Simulates the actual DGCA written examination format. 70% required to pass.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[["Questions", `${SAMPLE_QUESTIONS.length}`], ["Duration", "30 min"], ["Pass Mark", "70%"]].map(([l, v]) => (
            <div key={l} className="glass-card p-3">
              <div className="text-xl font-bold" style={{ color: "#00d4ff" }}>{v}</div>
              <div className="text-xs" style={{ color: "#64748b" }}>{l}</div>
            </div>
          ))}
        </div>
        <ul className="text-left mb-8 flex flex-col gap-2">
          {["Each question has one correct answer","You cannot go back after answering","Unanswered questions count as wrong","Timer starts immediately"].map(item => (
            <li key={item} className="flex items-start gap-2 text-sm" style={{ color: "#94a3b8" }}>
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }} /> {item}
            </li>
          ))}
        </ul>
        <button onClick={() => setPhase("exam")}
                className="w-full py-4 rounded-xl font-bold text-lg"
                style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
          Start Mock Test
        </button>
      </div>
    </div>
  );

  /* ── RESULT ── */
  if (phase === "result") return (
    <div className="grid-bg min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-10 text-center mb-8">
          <div className="text-6xl mb-4">{passed ? "🎉" : "😔"}</div>
          <h2 className="text-3xl font-extrabold mb-2">{passed ? "Congratulations! You Passed!" : "Keep Practising!"}</h2>
          <p className="mb-8" style={{ color: "#94a3b8" }}>
            {passed ? "You cleared the 70% benchmark. Great work!" : "You need 70% to pass. Review the explanations below."}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[["Score", `${pct}%`, passed ? "#22c55e" : "#ef4444"],
              ["Correct", `${score}/${SAMPLE_QUESTIONS.length}`, "#00d4ff"],
              ["Status", passed ? "PASS" : "FAIL", passed ? "#22c55e" : "#ef4444"]].map(([l, v, c]) => (
              <div key={l} className="glass-card p-4">
                <div className="text-2xl font-bold" style={{ color: c }}>{v}</div>
                <div className="text-xs" style={{ color: "#64748b" }}>{l}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-center">
            <button onClick={restart}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
                    style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>

        {/* Review */}
        <h3 className="text-xl font-bold mb-4">Review Answers</h3>
        <div className="flex flex-col gap-4">
          {SAMPLE_QUESTIONS.map((q, i) => {
            const userAns = answers[i];
            const isRight = userAns === q.answer;
            return (
              <div key={q.id} className="glass-card p-6">
                <div className="flex items-start gap-3 mb-4">
                  {isRight
                    ? <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#22c55e" }} />
                    : <XCircle    className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#ef4444" }} />}
                  <div>
                    <div className="text-xs mb-1" style={{ color: "#475569" }}>Q{i + 1} · {q.subject}</div>
                    <p className="text-sm font-medium">{q.question}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="px-4 py-2 rounded-lg text-sm"
                         style={{
                           background: oi === q.answer ? "rgba(34,197,94,0.15)"
                                     : oi === userAns  ? "rgba(239,68,68,0.15)" : "rgba(13,13,26,0.5)",
                           border: oi === q.answer ? "1px solid #22c55e"
                                 : oi === userAns  ? "1px solid #ef4444" : "1px solid rgba(0,212,255,0.1)",
                           color: oi === q.answer ? "#22c55e" : oi === userAns ? "#ef4444" : "#94a3b8",
                         }}>
                      {String.fromCharCode(65 + oi)}. {opt}
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.15)", color: "#94a3b8" }}>
                  💡 {q.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  /* ── EXAM ── */
  const optClass = (oi: number) => {
    if (!revealed) return "option-btn";
    if (oi === q.answer) return "option-btn correct";
    if (oi === answers[current]) return "option-btn wrong";
    return "option-btn";
  };

  return (
    <div className="grid-bg min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header bar */}
        <div className="glass-card px-6 py-4 flex items-center justify-between mb-6">
          <div className="text-sm font-medium" style={{ color: "#94a3b8" }}>
            Question <span style={{ color: "#00d4ff" }}>{current + 1}</span> / {SAMPLE_QUESTIONS.length}
          </div>
          <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 300 ? "timer-urgent" : ""}`}
               style={{ color: timeLeft < 300 ? "#ef4444" : "#00d4ff" }}>
            <Clock className="w-5 h-5" /> {fmt(timeLeft)}
          </div>
          <div className="text-sm" style={{ color: "#94a3b8" }}>
            {answered} answered
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-1 rounded-full mb-6" style={{ background: "rgba(0,212,255,0.1)" }}>
          <div className="h-1 rounded-full transition-all duration-500"
               style={{ width: `${((current + 1) / SAMPLE_QUESTIONS.length) * 100}%`, background: "linear-gradient(90deg,#00d4ff,#7c3aed)" }} />
        </div>

        {/* Question card */}
        <div className="glass-card p-8 mb-4">
          <div className="text-xs mb-4 px-2 py-1 rounded-full inline-block"
               style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.2)" }}>
            {q.subject}
          </div>
          <p className="text-lg font-semibold mb-8 leading-relaxed">{q.question}</p>
          <div className="flex flex-col gap-3">
            {q.options.map((opt, oi) => (
              <button key={oi} className={optClass(oi)} onClick={() => selectAnswer(oi)} disabled={revealed}>
                <span className="font-bold mr-3" style={{ color: "#475569" }}>{String.fromCharCode(65 + oi)}.</span>
                {opt}
              </button>
            ))}
          </div>

          {/* Explanation */}
          {revealed && (
            <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", color: "#94a3b8" }}>
              <span className="font-semibold" style={{ color: "#00d4ff" }}>💡 Explanation: </span>
              {q.explanation}
            </div>
          )}
        </div>

        {/* Next button */}
        {revealed && (
          <button onClick={next}
                  className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#000" }}>
            {current < SAMPLE_QUESTIONS.length - 1 ? <><ArrowRight className="w-5 h-5" /> Next Question</> : "Submit & See Results"}
          </button>
        )}

        {/* Flag / Skip */}
        {!revealed && (
          <div className="flex gap-3 mt-4">
            <button onClick={() => { const f = [...flagged]; f[current] = !f[current]; setFlagged(f); }}
                    className="flex-1 py-3 rounded-xl text-sm font-medium"
                    style={{ border: `1px solid ${flagged[current] ? "#f59e0b" : "rgba(0,212,255,0.2)"}`, color: flagged[current] ? "#f59e0b" : "#64748b", background: "transparent" }}>
              {flagged[current] ? "🚩 Flagged" : "🏳️ Flag Question"}
            </button>
            <button onClick={next}
                    className="flex-1 py-3 rounded-xl text-sm font-medium"
                    style={{ border: "1px solid rgba(0,212,255,0.2)", color: "#64748b", background: "transparent" }}>
              Skip →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
