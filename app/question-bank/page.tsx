"use client";
import { useState } from "react";
import { Search, BookOpen, CheckCircle, XCircle, ChevronDown } from "lucide-react";

const QUESTIONS = [
  { id:1, subject:"Air Regulations",   q:"The minimum age for a CPL in India is?",                                         opts:["17","18","19","21"],                                                                             ans:1, exp:"DGCA CAR Section 7: minimum age for CPL is 18 years." },
  { id:2, subject:"Meteorology",        q:"Wind direction 270° in a METAR means wind is coming from the:",                  opts:["East","West","North","South"],                                                                    ans:1, exp:"METAR wind direction is FROM where wind blows. 270° = West." },
  { id:3, subject:"General Navigation", q:"True heading 090°, variation 5°W. Magnetic heading is:",                        opts:["085°","095°","090°","080°"],                                                                      ans:1, exp:"MH = TH + West variation = 090+5 = 095°." },
  { id:4, subject:"Technical General",  q:"Four-stroke engine order is:",                                                   opts:["Intake-Power-Comp-Exhaust","Intake-Comp-Power-Exhaust","Comp-Intake-Power-Exhaust","Power-Intake-Comp-Exhaust"], ans:1, exp:"Intake → Compression → Power → Exhaust." },
  { id:5, subject:"Radio Aids",         q:"Full-scale CDI deflection on a VOR means aircraft is at least how many degrees off?", opts:["5°","10°","15°","20°"],                                                                 ans:1, exp:"Standard VOR CDI: full scale at 10° from selected radial." },
  { id:6, subject:"Performance",        q:"V1 is the:",                                                                    opts:["Stall speed","Takeoff decision speed","Best climb speed","Max gear speed"],                         ans:1, exp:"V1 = Takeoff decision speed. Above V1, commit to takeoff." },
  { id:7, subject:"Air Regulations",   q:"Class 1 Medical validity for pilot under 40 years:",                             opts:["6 months","12 months","18 months","24 months"],                                                  ans:1, exp:"Under 40: Class 1 Medical is valid for 12 months." },
  { id:8, subject:"Meteorology",        q:"QNH altimeter setting gives altitude above:",                                    opts:["Aerodrome","Sea level (standard)","Sea level (local)","Flight level"],                            ans:2, exp:"QNH gives altitude above mean sea level using local pressure." },
];

const SUBJECTS = ["All Subjects","Air Regulations","Meteorology","General Navigation","Technical General","Radio Aids","Performance"];

export default function QuestionBankPage() {
  const [search, setSearch]   = useState("");
  const [subject, setSubject] = useState("All Subjects");
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const filtered = QUESTIONS.filter(q =>
    (subject === "All Subjects" || q.subject === subject) &&
    (search === "" || q.q.toLowerCase().includes(search.toLowerCase()))
  );

  function toggle(id: number) {
    setRevealed(p => ({ ...p, [id]: !p[id] }));
  }

  return (
    <div className="grid-bg min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
               style={{ background:"rgba(0,212,255,0.1)", border:"1px solid rgba(0,212,255,0.3)", color:"#00d4ff" }}>
            <BookOpen className="w-4 h-4" /> Question Bank
          </div>
          <h1 className="text-4xl font-extrabold mb-4">DGCA <span className="gradient-text">Question Bank</span></h1>
          <p style={{ color:"#94a3b8" }}>10,000+ questions with answers and explanations</p>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 mb-8 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:"#475569" }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
                   placeholder="Search questions..."
                   className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
                   style={{ background:"rgba(5,5,16,0.8)", border:"1px solid rgba(0,212,255,0.2)", color:"#fff" }} />
          </div>
          <div className="relative">
            <select value={subject} onChange={e => setSubject(e.target.value)}
                    className="appearance-none pl-4 pr-8 py-2 rounded-lg text-sm outline-none"
                    style={{ background:"rgba(5,5,16,0.8)", border:"1px solid rgba(0,212,255,0.2)", color:"#fff", cursor:"pointer" }}>
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color:"#475569" }} />
          </div>
        </div>

        {/* Question list */}
        <div className="flex flex-col gap-4">
          {filtered.length === 0 && (
            <div className="text-center py-16" style={{ color:"#475569" }}>No questions found.</div>
          )}
          {filtered.map((q, i) => {
            const open = revealed[q.id];
            return (
              <div key={q.id} className="glass-card overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background:"rgba(0,212,255,0.15)", color:"#00d4ff" }}>
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <div className="text-xs mb-2 px-2 py-0.5 rounded-full inline-block"
                           style={{ background:"rgba(0,212,255,0.08)", color:"#00d4ff", border:"1px solid rgba(0,212,255,0.15)" }}>
                        {q.subject}
                      </div>
                      <p className="text-base font-medium mb-4 leading-relaxed">{q.q}</p>

                      {/* Options */}
                      <div className="flex flex-col gap-2">
                        {q.opts.map((opt, oi) => (
                          <div key={oi} className="px-4 py-2.5 rounded-lg text-sm flex items-center gap-3"
                               style={{
                                 background: open && oi === q.ans ? "rgba(34,197,94,0.12)" : "rgba(5,5,16,0.6)",
                                 border: open && oi === q.ans ? "1px solid #22c55e" : "1px solid rgba(0,212,255,0.1)",
                                 color: open && oi === q.ans ? "#22c55e" : "#94a3b8",
                               }}>
                            {open && oi === q.ans && <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color:"#22c55e" }} />}
                            <span className="font-semibold mr-1" style={{ color: open && oi === q.ans ? "#22c55e" : "#475569" }}>
                              {String.fromCharCode(65+oi)}.
                            </span>
                            {opt}
                          </div>
                        ))}
                      </div>

                      {/* Explanation */}
                      {open && (
                        <div className="mt-4 p-4 rounded-xl text-sm"
                             style={{ background:"rgba(0,212,255,0.05)", border:"1px solid rgba(0,212,255,0.15)", color:"#94a3b8" }}>
                          💡 <strong style={{ color:"#00d4ff" }}>Explanation:</strong> {q.exp}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button onClick={() => toggle(q.id)}
                        className="w-full py-3 text-sm font-medium flex items-center justify-center gap-2"
                        style={{ borderTop:"1px solid rgba(0,212,255,0.1)", background:"rgba(0,212,255,0.03)", color: open ? "#ef4444" : "#00d4ff", cursor:"pointer" }}>
                  {open ? <><XCircle className="w-4 h-4" /> Hide Answer</> : <><CheckCircle className="w-4 h-4" /> Show Answer</>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
