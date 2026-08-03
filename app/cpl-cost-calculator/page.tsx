import type { Metadata } from "next";
import { Calculator as CalcIcon } from "lucide-react";
import Calculator from "@/app/components/Calculator";

export const metadata: Metadata = {
  title: "Pilot Training Cost in India 2026 — CPL Cost Calculator | Ghost Aviator",
  description: "How much does pilot training cost in India? Calculate the real cost of a Commercial Pilot Licence (CPL) — flying hours, DGCA exams, medicals, ground classes and living expenses.",
  alternates: { canonical: "/cpl-cost-calculator" },
};

export default function CostCalculatorPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CPL Cost Calculator India",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "description": "An interactive tool to calculate the total cost of Commercial Pilot License (CPL) training in India, including flying hours, DGCA exams, and living expenses."
  };

  return (
    <main className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: "#0b1117" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-[120px] opacity-20 pointer-events-none"
           style={{ background: "radial-gradient(circle, rgba(240,145,58,0.8) 0%, rgba(243,200,137,0.5) 50%, transparent 70%)" }} />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 rounded-2xl mb-6 shadow-2xl"
               style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
            <CalcIcon size={48} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-white">
            How much does a CPL really cost?
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto">
            Flight schools often hide the true costs. Use our interactive calculator to estimate your exact 
            budget for flying, DGCA exams, medicals, and living expenses in 2026.
          </p>
        </div>

        <Calculator />
      </div>
    </main>
  );
}
