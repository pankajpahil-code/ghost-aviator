"use client";

import { useState } from "react";
import { Calculator as CalcIcon, Plane, FileCheck, Stethoscope, Home, GraduationCap, Info } from "lucide-react";
import Link from "next/link";

export default function Calculator() {
  // Flight Training
  const [hours, setHours] = useState(200);
  // ₹25,000/hr default set 2026-07-27 on Capt. Pahil's correction: the previous
  // ₹15,000 default produced a ~₹38 lakh total, when the real 2026 all-in figure
  // is around ₹60 lakh. Under-quoting the biggest cheque a student's family will
  // ever write is worse than over-quoting, so the default now sits at the top of
  // the market band (₹8,000–₹25,000/hr) and students at a cheaper school dial it
  // DOWN with the slider. Keep this in step with tools/guide-drafts/
  // pilot-training-cost-india.html, which quotes the same figures.
  const [hourlyRate, setHourlyRate] = useState(25000);
  
  // DGCA
  const [exams, setExams] = useState(6); // Nav, Met, Regs, Tech Gen, Tech Spec, RTR(A)
  const [groundSchool, setGroundSchool] = useState(50000);
  
  // Living
  const [months, setMonths] = useState(18);
  const [monthlyLiving, setMonthlyLiving] = useState(20000);

  // Fixed costs
  const class2 = 5000;
  const class1 = 10000;
  const rtrFee = 1000;
  const computerNumber = 0;

  // Computations
  const flightCost = hours * hourlyRate;
  const examCost = exams * 2500;
  const medicalCost = class2 + class1;
  const livingCost = months * monthlyLiving;
  const dgcaCost = examCost + medicalCost + rtrFee + computerNumber;
  
  const subTotal = flightCost + dgcaCost + groundSchool + livingCost;
  const contingency = Math.round(subTotal * 0.10); // 10% safety buffer
  const totalCost = subTotal + contingency;

  // Format currency
  const fmt = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      
      {/* Total Display */}
      <div className="relative overflow-hidden rounded-2xl p-8 shadow-2xl text-center"
           style={{ background: "linear-gradient(135deg, rgba(6,4,14,0.9), rgba(15,8,30,0.95))", border: "1px solid rgba(180,100,255,0.2)" }}>
        <div className="absolute top-0 right-0 p-4 opacity-10"><CalcIcon size={120} /></div>
        <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-2">Estimated Total Cost</h2>
        <div className="text-5xl md:text-7xl font-black mb-4"
             style={{ background: "linear-gradient(135deg, #00d4ff, #c080ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
          {fmt(totalCost)}
        </div>
        <p className="text-slate-300 max-w-2xl mx-auto text-sm">
          Includes flight training, DGCA exams, medicals, ground school, living expenses, and a 10% contingency buffer. Adjust the sliders below for your specific scenario.
        </p>
        <p className="text-amber-300/90 max-w-2xl mx-auto text-xs mt-3 px-4 py-2 rounded-lg"
           style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.28)" }}>
          <strong>This is the CPL only.</strong> A type rating on the aircraft you will actually fly is
          a further ₹15–25 lakh, and it comes after the licence — not included above. Budget for the
          landing, not just the flight.
        </p>

        {/* Visual Bar Chart */}
        <div className="mt-8 h-4 flex rounded-full overflow-hidden bg-slate-800 w-full">
          <div style={{ width: `${(flightCost / totalCost) * 100}%`, background: "#0ea5e9" }} title={`Flight: ${fmt(flightCost)}`} />
          <div style={{ width: `${(livingCost / totalCost) * 100}%`, background: "#f59e0b" }} title={`Living: ${fmt(livingCost)}`} />
          <div style={{ width: `${(groundSchool / totalCost) * 100}%`, background: "#7c3aed" }} title={`Ground School: ${fmt(groundSchool)}`} />
          <div style={{ width: `${(dgcaCost / totalCost) * 100}%`, background: "#10b981" }} title={`DGCA: ${fmt(dgcaCost)}`} />
          <div style={{ width: `${(contingency / totalCost) * 100}%`, background: "#ef4444" }} title={`Contingency: ${fmt(contingency)}`} />
        </div>
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs font-bold text-slate-400">
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#0ea5e9]"></div> Flying</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div> Living</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#7c3aed]"></div> Ground</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#10b981]"></div> DGCA/Med</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-[#ef4444]"></div> Buffer (10%)</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Flight Training */}
        <div className="rounded-xl p-6 shadow-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400"><Plane size={24}/></div>
            <h3 className="text-xl font-bold text-white">Flight Training</h3>
            <div className="ml-auto text-lg font-black text-sky-400">{fmt(flightCost)}</div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-slate-300">Flying Hours required</label>
                <span className="text-sm font-bold text-white">{hours} hrs</span>
              </div>
              <input type="range" min="200" max="250" step="1" value={hours} onChange={e => setHours(Number(e.target.value))} className="w-full accent-sky-400" />
              <p className="text-xs text-slate-500 mt-1">200 hours is the DGCA minimum for CPL.</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-slate-300">Hourly Rate (₹/hr)</label>
                <span className="text-sm font-bold text-white">{fmt(hourlyRate)}/hr</span>
              </div>
              <input type="range" min="8000" max="30000" step="500" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} className="w-full accent-sky-400" />
              <p className="text-xs text-slate-500 mt-1">
                Indian schools currently quote roughly ₹8,000–₹25,000 per hour. Ask what the rate
                <em> includes</em> — fuel, instructor, landing fees — before you compare two schools.
              </p>
            </div>
          </div>
        </div>

        {/* Living Expenses */}
        <div className="rounded-xl p-6 shadow-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400"><Home size={24}/></div>
            <h3 className="text-xl font-bold text-white">Living Expenses</h3>
            <div className="ml-auto text-lg font-black text-amber-400">{fmt(livingCost)}</div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-slate-300">Training Duration (Months)</label>
                <span className="text-sm font-bold text-white">{months} mo</span>
              </div>
              <input type="range" min="12" max="36" step="1" value={months} onChange={e => setMonths(Number(e.target.value))} className="w-full accent-amber-400" />
              <p className="text-xs text-slate-500 mt-1">Average time to complete CPL is 18-24 months.</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-slate-300">Monthly Cost (Food + Stay)</label>
                <span className="text-sm font-bold text-white">{fmt(monthlyLiving)}/mo</span>
              </div>
              <input type="range" min="5000" max="50000" step="1000" value={monthlyLiving} onChange={e => setMonthlyLiving(Number(e.target.value))} className="w-full accent-amber-400" />
            </div>
          </div>
        </div>

        {/* Ground School & Studies */}
        <div className="rounded-xl p-6 shadow-lg relative overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(124,58,237,0.1), rgba(255,255,255,0.03))", border: "1px solid rgba(124,58,237,0.3)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400"><GraduationCap size={24}/></div>
            <h3 className="text-xl font-bold text-white">Ground Classes</h3>
            <div className="ml-auto text-lg font-black text-purple-400">{fmt(groundSchool)}</div>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-slate-300">Tuition Fees</label>
                <span className="text-sm font-bold text-white">{fmt(groundSchool)}</span>
              </div>
              <input type="range" min="0" max="150000" step="5000" value={groundSchool} onChange={e => setGroundSchool(Number(e.target.value))} className="w-full accent-purple-400" />
              
              <div className="mt-4 p-4 rounded-lg bg-purple-900/30 border border-purple-500/30 text-sm text-purple-200">
                <div className="font-bold flex items-center gap-1 mb-1"><Info size={16}/> Pro Tip for Savings</div>
                Self-study using the <Link href="/cpl" className="text-purple-400 underline font-bold">Ghost Aviator Free Question Bank</Link>, or join Capt. Pankaj Pahil&apos;s <Link href="/live-classes" className="text-purple-400 underline font-bold">Live Classes</Link> for a fraction of the cost of traditional academies.
              </div>
            </div>
          </div>
        </div>

        {/* DGCA Exams & Medicals */}
        <div className="rounded-xl p-6 shadow-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400"><FileCheck size={24}/></div>
            <h3 className="text-xl font-bold text-white">DGCA & Medicals</h3>
            <div className="ml-auto text-lg font-black text-emerald-400">{fmt(dgcaCost)}</div>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold text-slate-300">Exams ({exams} × ₹2,500)</label>
                <span className="text-sm font-bold text-white">{fmt(examCost)}</span>
              </div>
              <input type="range" min="0" max="10" step="1" value={exams} onChange={e => setExams(Number(e.target.value))} className="w-full accent-emerald-400" />
              <p className="text-xs text-slate-500 mt-1">Assumes first-attempt pass. Extra attempts cost ₹2,500 each.</p>
            </div>
            
            <div className="pt-4 border-t border-white/5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400"><Stethoscope size={14} className="inline mr-1" /> Class 2 Medical (approx)</span>
                <span className="text-white">{fmt(class2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400"><Stethoscope size={14} className="inline mr-1" /> Class 1 Medical (approx)</span>
                <span className="text-white">{fmt(class1)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400"><FileCheck size={14} className="inline mr-1" /> RTR(A) Exam Fee</span>
                <span className="text-white">{fmt(rtrFee)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400"><FileCheck size={14} className="inline mr-1" /> Computer Number</span>
                <span className="text-white">Free</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
