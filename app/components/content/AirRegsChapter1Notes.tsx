import Link from "next/link";
import { ChevronRight, ChevronLeft, ListChecks, Clock, BookOpen } from "lucide-react";
import type { Subject, Chapter } from "@/lib/subjects";
import type { ReactNode } from "react";

type Props = {
  track: "cpl" | "atpl";
  subject: Subject;
  chapter: Chapter;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
};

// ─── styling constants ────────────────────────────────────────────────────────

const BOX: Record<string, { border: string; bg: string; title: string }> = {
  red:    { border: "#f87171", bg: "rgba(220,38,38,0.07)",    title: "#f87171" },
  blue:   { border: "#60a5fa", bg: "rgba(59,130,246,0.07)",   title: "#60a5fa" },
  green:  { border: "#4ade80", bg: "rgba(34,197,94,0.07)",    title: "#4ade80" },
  yellow: { border: "#fbbf24", bg: "rgba(234,179,8,0.07)",    title: "#fbbf24" },
  purple: { border: "#c084fc", bg: "rgba(168,85,247,0.07)",   title: "#c084fc" },
  gray:   { border: "rgba(255,255,255,0.12)", bg: "rgba(255,255,255,0.03)", title: "#94a3b8" },
};

const BADGE: Record<string, { bg: string; border: string; color: string }> = {
  green: { bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.4)",  color: "#4ade80" },
  red:   { bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.4)",  color: "#f87171" },
  gold:  { bg: "rgba(234,179,8,0.12)",  border: "rgba(234,179,8,0.4)",  color: "#fbbf24" },
};

const HEAD: Record<string, { bg: string; color: string }> = {
  default: { bg: "rgba(26,111,168,0.70)",   color: "#fff" },
  dark:    { bg: "rgba(13,33,55,0.90)",     color: "#fff" },
  red:     { bg: "rgba(192,57,43,0.75)",    color: "#fff" },
  gold:    { bg: "rgba(180,120,20,0.80)",   color: "#fff" },
  green:   { bg: "rgba(36,100,60,0.75)",    color: "#fff" },
};

// ─── mini-components ──────────────────────────────────────────────────────────

function InfoBox({ type, title, children }: { type: string; title?: string; children: ReactNode }) {
  const s = BOX[type] ?? BOX.gray;
  return (
    <div style={{
      borderLeft: `4px solid ${s.border}`,
      background: s.bg,
      borderRadius: "0 8px 8px 0",
      padding: "12px 14px",
      margin: "12px 0",
    }}>
      {title && (
        <div style={{ color: s.title, fontWeight: 700, fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          {title}
        </div>
      )}
      <div style={{ color: "#d1d5db", fontSize: "0.875rem", lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function Bdg({ type, children }: { type: string; children: ReactNode }) {
  const s = BADGE[type] ?? BADGE.gold;
  return (
    <span style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, borderRadius: 4, padding: "1px 7px", fontSize: "0.7rem", fontWeight: 700, display: "inline-block", margin: "0 2px" }}>
      {children}
    </span>
  );
}

function SectionBlock({ num, title, children }: { num: string; title: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#1e0845", padding: "12px 20px", borderRadius: "8px 8px 0 0" }}>
        <span style={{ fontFamily: "monospace", fontSize: "0.75rem", fontWeight: 700, background: "#7c3aed", color: "#fff", padding: "2px 9px", borderRadius: 4 }}>
          SECTION {num}
        </span>
        <h2 style={{ color: "#fff", fontWeight: 800, fontSize: "1.05rem", margin: 0 }}>{title}</h2>
      </div>
      <div style={{ border: "1px solid rgba(124,58,237,0.3)", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "20px 22px", background: "rgba(15,8,30,0.97)" }}>
        {children}
      </div>
    </div>
  );
}

function Sub({ children }: { children: ReactNode }) {
  return (
    <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: "0.95rem", borderBottom: "1px solid rgba(96,165,250,0.3)", paddingBottom: 4, margin: "20px 0 12px" }}>
      {children}
    </div>
  );
}

function Sub2({ children }: { children: ReactNode }) {
  return (
    <div style={{ color: "#c4b5fd", fontWeight: 700, fontSize: "0.875rem", margin: "14px 0 7px" }}>{children}</div>
  );
}

function Hr() {
  return <hr style={{ borderColor: "rgba(255,255,255,0.07)", margin: "16px 0" }} />;
}

function ArtCard({
  num, title, variant, full, children,
}: { num: string; title: string; variant?: string; full?: boolean; children: ReactNode }) {
  const h = HEAD[variant ?? "default"];
  return (
    <div style={{
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 8,
      overflow: "hidden",
      gridColumn: full ? "1 / -1" : undefined,
    }}>
      <div style={{ background: h.bg, color: h.color, padding: "7px 12px", fontWeight: 700, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ background: "rgba(255,255,255,0.15)", padding: "1px 7px", borderRadius: 3, fontFamily: "monospace", fontSize: "0.72rem", fontWeight: 700 }}>{num}</span>
        {title}
      </div>
      <div style={{ padding: "10px 13px", fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.6, background: "rgba(255,255,255,0.015)" }}>
        {children}
      </div>
    </div>
  );
}

function ArtGrid({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "12px 0" }}>
      {children}
    </div>
  );
}

function DTable({ heads, rows }: { heads: string[]; rows: (string | ReactNode)[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "10px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
        <thead>
          <tr style={{ background: "rgba(124,58,237,0.18)", borderBottom: "1px solid rgba(124,58,237,0.3)" }}>
            {heads.map((h, i) => (
              <th key={i} style={{ padding: "6px 10px", color: "#c4b5fd", fontWeight: 700, textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", background: ri % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "6px 10px", color: "#94a3b8", verticalAlign: "top" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TdGreen({ children }: { children: ReactNode }) {
  return <span style={{ color: "#4ade80", fontWeight: 700 }}>{children}</span>;
}
function TdRed({ children }: { children: ReactNode }) {
  return <span style={{ color: "#f87171", fontWeight: 700 }}>{children}</span>;
}

// ─── main component ───────────────────────────────────────────────────────────

export default function AirRegsChapter1Notes({ track, subject, chapter, prevChapter, nextChapter }: Props) {
  return (
    <div style={{ background: "#06040e" }} className="min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="relative" style={{ borderBottom: `1px solid ${subject.color}25` }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${subject.color}12 0%, transparent 65%)` }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="flex items-center gap-1.5 text-xs mb-6 flex-wrap" style={{ color: "#475569" }}>
            <Link href="/" className="no-underline hover:text-white transition-colors" style={{ color: "#475569" }}>Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${track}`} className="no-underline hover:text-white transition-colors uppercase" style={{ color: "#475569" }}>{track}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${track}/${subject.id}`} className="no-underline hover:text-white transition-colors" style={{ color: "#475569" }}>{subject.shortName}</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: "#94a3b8" }}>Ch.{chapter.number} Notes</span>
          </div>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black flex-shrink-0"
              style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}40`, color: subject.color }}>
              {chapter.number}
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest mb-1" style={{ color: subject.color, letterSpacing: "0.18em" }}>
                {subject.shortName.toUpperCase()} — CHAPTER {chapter.number}
              </div>
              <h1 className="text-3xl font-black text-white mb-1">{chapter.title}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-xs px-3 py-1 rounded-full"
              style={{ background: `${subject.color}18`, border: `1px solid ${subject.color}35`, color: subject.color }}>📄 Notes</span>
            <span className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
              <Clock className="w-3 h-3" /> {chapter.duration}
            </span>
            <span className="text-xs px-3 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
              9 sections · 19 annexes · {chapter.questionCount} questions
            </span>
            <Link href={`/${track}/${subject.id}/${chapter.id}/chapter-quiz`}
              className="text-xs px-3 py-1 rounded-full no-underline flex items-center gap-1"
              style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316" }}>
              <ListChecks className="w-3 h-3" /> Chapter Quiz
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ══════════════════════════════════════════════════════════════
            SECTION 1 — PARIS CONVENTION, 1919
        ══════════════════════════════════════════════════════════════ */}
        <SectionBlock num="01" title="Paris Convention, 1919 — The First International Air Agreement">
          <InfoBox type="blue" title="Quick Identity Facts">
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li><strong style={{ color: "#e2e8f0" }}>Full Name:</strong> Convention Relating to the Regulation of Aerial Navigation</li>
              <li><strong style={{ color: "#e2e8f0" }}>Date Signed:</strong> <Bdg type="red">13 October 1919</Bdg></li>
              <li><strong style={{ color: "#e2e8f0" }}>Signed at:</strong> Peace Conference held in Paris under the auspices of the League of Nations</li>
              <li><strong style={{ color: "#e2e8f0" }}>Body Created:</strong> International Commission on Air Navigation (<strong>ICAN</strong>) — forerunner to ICAO</li>
              <li><strong style={{ color: "#e2e8f0" }}>Superseded by:</strong> Chicago Convention (7 December 1944)</li>
            </ul>
          </InfoBox>
          <InfoBox type="red" title="⚠️ Exam Trap — ICAN vs ICAO">
            <strong style={{ color: "#fca5a5" }}>ICAN</strong> (International Commission on Air Navigation) was created by the <strong style={{ color: "#fca5a5" }}>Paris Convention 1919</strong>.<br />
            <strong style={{ color: "#fca5a5" }}>ICAO</strong> (International Civil Aviation Organization) was created by the <strong style={{ color: "#fca5a5" }}>Chicago Convention 1944</strong>.<br />
            These are two <em>different bodies</em>. ICAN is the predecessor; ICAO replaced it.
          </InfoBox>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>
            The Paris Convention laid down <strong style={{ color: "#e2e8f0" }}>preliminary technical standards</strong> for international civil aviation. It was <strong style={{ color: "#e2e8f0" }}>later superseded</strong> by the Chicago Convention signed on 7 December 1944.
          </p>
        </SectionBlock>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 2 — CHICAGO CONVENTION, 1944
        ══════════════════════════════════════════════════════════════ */}
        <SectionBlock num="02" title="Chicago Convention, 1944 — The Bedrock of Modern Aviation">
          <InfoBox type="blue" title="Quick Identity Facts">
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li><strong style={{ color: "#e2e8f0" }}>Full Name:</strong> Convention on International Civil Aviation</li>
              <li><strong style={{ color: "#e2e8f0" }}>Date Signed:</strong> <Bdg type="red">7 December 1944</Bdg></li>
              <li><strong style={{ color: "#e2e8f0" }}>Number of Articles:</strong> <Bdg type="red">Exactly 96 Articles</Bdg></li>
              <li><strong style={{ color: "#e2e8f0" }}>India&apos;s Status:</strong> India has <Bdg type="green">RATIFIED</Bdg> this convention</li>
              <li><strong style={{ color: "#e2e8f0" }}>Superseded:</strong> The Paris Convention, 1919</li>
              <li><strong style={{ color: "#e2e8f0" }}>Created:</strong> ICAO (International Civil Aviation Organization)</li>
            </ul>
          </InfoBox>

          <Hr />
          <Sub>Part I: Air Navigation — Articles 1–16</Sub>
          <ArtGrid>
            <ArtCard num="ART. 1" title="Sovereignty" variant="dark">
              Every State has <strong>complete and exclusive sovereignty</strong> over the <strong>airspace above its territory</strong>. This is the foundational principle of international aviation law.
              <InfoBox type="red">
                <strong>Memory:</strong> &ldquo;Complete AND Exclusive&rdquo; — both words are examinable. Not &ldquo;partial&rdquo;, not &ldquo;shared&rdquo;.
              </InfoBox>
            </ArtCard>
            <ArtCard num="ART. 2" title="Territory" variant="dark">
              The <strong>territory</strong> of a State shall be deemed to be the <strong>land areas</strong> AND the <strong>territorial waters</strong> adjacent thereto, under the sovereignty, suzerainty, protection or mandate of such State.
            </ArtCard>
            <ArtCard num="ART. 3" title="Civil and State Aircraft" variant="dark" full>
              <strong>Applies TO (Civil Aircraft):</strong> All civilian aircraft used for private or commercial purposes.<br />
              <strong>Does NOT Apply TO (State Aircraft):</strong> Aircraft used in <strong>military</strong>, <strong>customs</strong>, or <strong>police</strong> services.
              <InfoBox type="red" title="⚠️ Critical Rule">
                No state aircraft of a contracting State shall fly over the territory of another State <strong>without authorization by special agreement</strong>.
              </InfoBox>
            </ArtCard>
            <ArtCard num="ART. 4" title="Misuse of Civil Aviation">
              Each contracting State agrees <strong>not to use civil aviation</strong> for any purpose <strong>inconsistent with the aims</strong> of this Convention.
            </ArtCard>
            <ArtCard num="ART. 5" title="Right of Non-Scheduled Flight">
              Aircraft engaged in <strong>non-scheduled flights</strong> enjoy the right to fly into or across the territory of another State and make stops for <strong>non-traffic purposes</strong> (1st &amp; 2nd Freedom). However, the State flown over can require the aircraft to <strong>land</strong> and follow prescribed routes.
            </ArtCard>
            <ArtCard num="ART. 6" title="Scheduled Air Services" variant="red">
              <strong>No scheduled international air service</strong> may be operated over or into the territory of a contracting State <strong>except with special permission</strong> or other authorization of that State.
              <InfoBox type="red">Permission = Mandatory for scheduled flights.</InfoBox>
            </ArtCard>
            <ArtCard num="ART. 7" title="Cabotage" variant="red">
              Each contracting State has the <strong>right to REFUSE permission</strong> to aircraft of other States to take on passengers, mail, and cargo carried for remuneration <strong>destined for another point within its own territory</strong>.
              <InfoBox type="red"><strong>Cabotage = DOMESTIC air services.</strong></InfoBox>
            </ArtCard>
            <ArtCard num="ART. 8" title="Pilotless Aircraft (Drones/UAVs)">
              No aircraft capable of being flown <strong>without a pilot</strong> shall fly over the territory of a contracting State <strong>without special authorization</strong> by that State. Such flights must be <strong>controlled</strong> to avoid danger to civil aircraft.
            </ArtCard>
            <ArtCard num="ART. 9" title="Prohibited Areas">
              Each contracting State may <strong>restrict or prohibit</strong> flying over certain areas of its territory for <strong>military necessity or public safety</strong>. Such areas must be applied <strong>uniformly</strong> to all aircraft.
            </ArtCard>
            <ArtCard num="ART. 10" title="Landing at Customs Airport">
              The State can require that landing be made at a <strong>designated customs airport</strong>. Similarly, departure from the territory can be required to be from a designated customs airport.
            </ArtCard>
            <ArtCard num="ART. 11" title="Applicability of Air Regulations">
              All aircraft are to be treated <strong>equally</strong> while operating from or in the territory of a nation, <strong>irrespective of their nationality</strong>.
            </ArtCard>
            <ArtCard num="ART. 12" title="Rules of the Air" variant="dark" full>
              Each contracting State undertakes to adopt measures ensuring every aircraft flying over or manoeuvring within its territory complies with the <strong>rules and regulations relating to flight and manoeuvre</strong> in force there.
              <InfoBox type="red" title="⚠️ High-Seas Rule (Art. 12)">
                <strong>Over the HIGH SEAS, the rules in force shall be those established under THIS Convention.</strong> (ICAO rules govern — not the rules of any individual state.)
              </InfoBox>
            </ArtCard>
            <ArtCard num="ART. 13" title="Entry & Clearance Regulations">
              Laws relating to <strong>entry, clearance, immigration, passports, customs, and quarantine</strong> shall be complied with by passengers, crew, and cargo upon entrance into or departure from the territory of that State.
            </ArtCard>
            <ArtCard num="ART. 14" title="Prevention of Spread of Disease">
              Each contracting State agrees to take effective measures to prevent the spread by air navigation of: <strong>cholera, typhus (epidemic), smallpox, yellow fever, plague</strong>, and such other communicable diseases.
            </ArtCard>
            <ArtCard num="ART. 15" title="Airport & Similar Charges">
              Airport and similar charges will <strong>not be more than</strong> those paid by its national aircraft. Non-discriminatory charges apply.
            </ArtCard>
            <ArtCard num="ART. 16" title="Search of Aircraft">
              Appropriate authorities have the right, <strong>without unreasonable delay</strong>, to search aircraft of other contracting States on landing or departure, and <strong>inspect certificates and documents</strong> prescribed by this Convention.
            </ArtCard>
          </ArtGrid>

          <Hr />
          <Sub>Part II: Nationality of Aircraft — Articles 17–21</Sub>
          <ArtGrid>
            <ArtCard num="ART. 17" title="Nationality of Aircraft" variant="green">
              Aircraft have the <strong>nationality of the State in which they are registered</strong>. (e.g., VT-AXY is Indian because registered in India.)
            </ArtCard>
            <ArtCard num="ART. 18" title="Dual Registration — INVALID" variant="red">
              An aircraft <strong>cannot be validly registered in more than one State at a time</strong>. However, its registration <strong>may be changed</strong> from one State to another.
              <InfoBox type="red">DUAL REGISTRATION = INVALID at any given moment.</InfoBox>
            </ArtCard>
            <ArtCard num="ART. 19" title="National Laws Governing Registration">
              Registration or transfer of registration in any contracting State shall be made <strong>in accordance with its law and regulations</strong>.
            </ArtCard>
            <ArtCard num="ART. 20" title="Display of Marks">
              Every aircraft engaged in <strong>international air navigation</strong> shall bear its appropriate <strong>nationality and registration marks</strong>.
            </ArtCard>
            <ArtCard num="ART. 21" title="Report of Registrations" variant="green" full>
              The registering State must report to ICAO data revealing the <strong>ownership and control</strong> of aircraft it registers. Information must be made available to other contracting States, or ICAO, <strong>on demand</strong>.
            </ArtCard>
          </ArtGrid>

          <Hr />
          <Sub>Part III: Measures to Facilitate Air Navigation — Articles 22–28</Sub>
          <ArtGrid>
            <ArtCard num="ART. 22" title="Facilitation of Formalities">
              Each State agrees to adopt all practicable measures to <strong>facilitate and expedite navigation</strong> — preventing unnecessary delays to aircraft, crews, passengers, and cargo.
            </ArtCard>
            <ArtCard num="ART. 23" title="Customs & Immigration Procedures">
              Each State undertakes to establish <strong>customs and immigration procedures</strong> affecting international air navigation in accordance with practices established under this Convention.
            </ArtCard>
            <ArtCard num="ART. 24" title="Customs Duty">
              Aircraft flying to, from, or across the territory shall be admitted <strong>temporarily free of duty</strong>. Also exempt: Fuel, Oil, Spare parts, Regular equipment &amp; aircraft stores retained on board.
            </ArtCard>
            <ArtCard num="ART. 25" title="Aircraft in Distress">
              Each contracting State undertakes to provide such measures of assistance to <strong>aircraft in distress</strong> in its territory as it may find practicable.
            </ArtCard>
            <ArtCard num="ART. 26" title="Investigation of Accidents" variant="dark" full>
              In the event of an accident involving <strong>death, serious injury, or indicating serious technical defect</strong>:
              <ul style={{ paddingLeft: 18, marginTop: 6 }}>
                <li>The <strong>State where the accident occurs</strong> will institute an inquiry.</li>
                <li>The <strong>State of registration</strong> shall be given the opportunity to appoint <strong>observers</strong> at the inquiry.</li>
                <li>The State holding the inquiry shall communicate the <strong>report and findings</strong> to the State of registration.</li>
              </ul>
            </ArtCard>
            <ArtCard num="ART. 27" title="Exemption from Seizure on Patent Claims">
              An aircraft <strong>on flight cannot be seized</strong> for violation of patent laws of a State.
            </ArtCard>
            <ArtCard num="ART. 28" title="Air Navigation Facilities & Standard Systems">
              Each State should provide <strong>airports, navigation facilities, met facilities, radio, charts, maps</strong> etc., to conform to the Convention specifications.
            </ArtCard>
          </ArtGrid>

          <Hr />
          <Sub>Part IV: Conditions to Be Fulfilled With Respect to Aircraft — Articles 29–36</Sub>
          <InfoBox type="red" title="⚠️ Article 29 — Essential Aircraft Documents (HIGH EXAM PRIORITY)">
            Every aircraft of a contracting State <strong>engaged in international navigation</strong> shall carry the following <strong>7 documents</strong>:
            <DTable
              heads={["#", "Document", "Notes"]}
              rows={[
                ["a)", <strong key="a">Certificate of Registration</strong>, "Proof of aircraft nationality"],
                ["b)", <strong key="b">Certificate of Airworthiness (CofA)</strong>, "Aircraft is airworthy"],
                ["c)", <strong key="c">Appropriate Crew Licenses</strong>, "For each member of the crew"],
                ["d)", <strong key="d">Journey Log Book</strong>, "Aircraft journey record"],
                ["e)", <strong key="e">Aircraft Radio Station License</strong>, "Only if equipped with radio apparatus"],
                ["f)", <strong key="f">Passenger List (Names, Embarkation & Destination)</strong>, "Only if it carries passengers"],
                ["g)", <strong key="g">Cargo Manifest & Declarations</strong>, "Only if it carries cargo"],
              ]}
            />
            <InfoBox type="yellow" title="Mnemonic (R-A-C-J-R-P-C)">
              <strong>&ldquo;Real Aircraft Carries Journals, Radio Permit, Cargo-list&rdquo;</strong><br />
              Registration · Airworthiness · Crew License · Journey Log · Radio License · Passenger List · Cargo Manifest
            </InfoBox>
          </InfoBox>
          <ArtGrid>
            <ArtCard num="ART. 30" title="Aircraft Radio Equipment">
              Radios must be <strong>licensed and used per the regulations of the State of registration</strong>. Radios may only be used by <strong>flight crew members suitably licensed</strong> by the State of registration.
            </ArtCard>
            <ArtCard num="ART. 31" title="Certificates of Airworthiness">
              Every aircraft engaged in international navigation shall be provided with a CofA <strong>issued or rendered valid by the State in which it is registered</strong>.
            </ArtCard>
            <ArtCard num="ART. 32" title="Licences of Personnel" variant="dark" full>
              <strong>(a)</strong> The pilot and operating crew of every aircraft engaged in international navigation shall be provided with <strong>certificates of competency and licenses issued or rendered valid by the State of registration</strong>.
              <InfoBox type="yellow" title="📝 Important Clause (b)">
                Each contracting State reserves the right to <strong>refuse to recognize</strong> certificates of competency and licenses granted to <strong>its own nationals</strong> by another contracting State.
              </InfoBox>
            </ArtCard>
            <ArtCard num="ART. 33" title="Recognition of Certificates & Licenses" variant="green">
              Certificates and licenses issued by the State of registration shall be <strong>recognized as valid</strong> by other contracting States, <strong>provided</strong> the requirements under which they were issued are <strong>equal to or above the minimum standards</strong> established under the Convention.
            </ArtCard>
            <ArtCard num="ART. 34" title="Journey Log Books">
              There shall be maintained in respect of every aircraft in international navigation a <strong>journey log book</strong> in which shall be entered particulars of the aircraft, its crew, and of each journey.
            </ArtCard>
            <ArtCard num="ART. 35" title="Cargo Restrictions">
              No <strong>munitions of war or any item prohibited</strong> to be carried by a State shall be carried.
            </ArtCard>
            <ArtCard num="ART. 36" title="Photographic Apparatus">
              Each contracting State may <strong>prohibit or regulate the use of photographic apparatus</strong> in aircraft over its territory.
            </ArtCard>
          </ArtGrid>

          <Hr />
          <Sub>Part V: International Standards &amp; Recommended Practices — Articles 37–42</Sub>
          <ArtGrid>
            <ArtCard num="ART. 37" title="Adoption of International Standards and Procedures" variant="dark" full>
              Each contracting State undertakes to <strong>collaborate in securing the highest practicable degree of uniformity</strong> in regulations, standards, procedures, and organization in relation to aircraft, personnel, airways, and auxiliary services. To this end, ICAO shall adopt and amend <strong>SARPs</strong> as necessary.
            </ArtCard>
            <ArtCard num="ART. 38" title="Departures from International Standards — THE 60-DAY RULE" variant="red" full>
              Any State which finds it <strong>impracticable to comply</strong> in all respects with any international standard, or which <strong>deems it necessary to adopt different regulations</strong>, shall give <strong>immediate notification</strong> to ICAO of differences between its own practice and that established by the international standard.
              <InfoBox type="red" title="⚠️ The Critical Number">
                In case of <strong>amendments</strong> to international standards, any State which does not make the appropriate amendments shall give notice to the Council within <strong>SIXTY (60) DAYS</strong> of the adoption of the amendment.
              </InfoBox>
            </ArtCard>
            <ArtCard num="ART. 39" title="Endorsement of Certificates & Licenses">
              Any aircraft <strong>not satisfying international airworthiness requirements</strong>, or any person not satisfying international licence requirements, shall get the certificate/licence <strong>endorsed giving full details</strong> of the shortfall.
            </ArtCard>
            <ArtCard num="ART. 40" title="Validity of Endorsed Certificates">
              No aircraft or personnel having <strong>endorsed</strong> certificates or licenses shall participate in international navigation <strong>except with the permission</strong> of the State or States whose territory is entered.
            </ArtCard>
            <ArtCard num="ART. 41" title="Recognition of Existing Standards — Airworthiness">
              These provisions shall not apply to aircraft whose <strong>prototype was submitted for certification prior to 3 years</strong> after the date of adoption of an international standard of airworthiness for such equipment.
            </ArtCard>
            <ArtCard num="ART. 42" title="Recognition of Existing Standards — Personnel">
              These provisions shall not apply to personnel whose licences are originally issued <strong>prior to 1 year</strong> after initial adoption of an international standard. However, they shall apply to all personnel whose licenses remain valid <strong>5 years after the date of adoption</strong> of such standard.
            </ArtCard>
          </ArtGrid>
        </SectionBlock>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 3 — ICAO
        ══════════════════════════════════════════════════════════════ */}
        <SectionBlock num="03" title="ICAO — International Civil Aviation Organization">
          <InfoBox type="blue" title="Key Identity Facts">
            <DTable
              heads={["Field", "Details"]}
              rows={[
                ["Full Name", "International Civil Aviation Organization"],
                ["Created By", "Chicago Convention, 1944"],
                ["UN Status", <span key="un">Became a <strong>Specialized Agency of the United Nations</strong> linked to Economic and Social Council in <Bdg type="red">1947</Bdg></span>],
                ["Headquarters", "Montreal, Canada"],
                ["Members", <span key="mem"><Bdg type="green">193 members</Bdg> of the United Nations (including a non-UN member: Cook Islands)</span>],
                ["Non-members", "Liechtenstein, Niue, Tuvalu, Vatican City, and states with limited recognition"],
                ["Structure", "Assembly + Council + such other bodies as may be necessary"],
              ]}
            />
          </InfoBox>

          <Sub>ICAO Objectives (from the Convention)</Sub>
          <InfoBox type="green" title="✅ ICAO's Aims — To develop principles and techniques of international air navigation so as to:">
            <ol style={{ paddingLeft: 20, margin: 0, display: "grid", gap: 4 }}>
              <li>Insure the <strong>safe and orderly growth</strong> of international civil aviation throughout the world</li>
              <li>Encourage the arts of <strong>aircraft design and operation for peaceful purposes</strong></li>
              <li>Encourage the development of <strong>airways, airports, and air navigation facilities</strong></li>
              <li>Meet the needs of the peoples of the world for <strong>safe, regular, efficient and economical air transport</strong></li>
              <li>Prevent <strong>economic waste</strong> caused by unreasonable competition</li>
              <li>Insure that the <strong>rights of contracting States are fully respected</strong> and that every contracting State has a <strong>fair opportunity to operate international airlines</strong></li>
              <li><strong>Avoid discrimination</strong> between contracting States</li>
              <li><strong>Promote safety of flight</strong> in international air navigation</li>
              <li>Promote generally the development of <strong>all aspects of international civil aeronautics</strong></li>
            </ol>
          </InfoBox>

          <Sub>ICAO Organisational Structure</Sub>
          <div style={{ background: "#f1f5f9", borderRadius: 10, padding: 8, overflowX: "auto", margin: "12px 0" }}>
            <svg viewBox="0 0 680 440" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: "100%", fontFamily: "sans-serif", display: "block" }}>
              <rect x="200" y="10" width="280" height="60" rx="8" fill="#0d2137" stroke="#c8922a" strokeWidth="2.5"/>
              <text x="340" y="35" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">ASSEMBLY</text>
              <text x="340" y="52" textAnchor="middle" fill="#c8922a" fontSize="10">Highest Body · Meets ≥ once every 3 years</text>
              <text x="340" y="65" textAnchor="middle" fill="#a0b8cc" fontSize="9.5">All Contracting States: One State = One Vote</text>
              <line x1="340" y1="70" x2="340" y2="115" stroke="#4a90d9" strokeWidth="2"/>
              <rect x="190" y="115" width="300" height="60" rx="8" fill="#1a6fa8" stroke="#4a90d9" strokeWidth="2"/>
              <text x="340" y="140" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">COUNCIL</text>
              <text x="340" y="158" textAnchor="middle" fill="#ddeeff" fontSize="10">Governing Body · 36 Elected Member States</text>
              <text x="340" y="172" textAnchor="middle" fill="#a0c8e8" fontSize="9.5">President of Council is elected by the Council</text>
              <line x1="250" y1="175" x2="190" y2="215" stroke="#4a90d9" strokeWidth="1.5"/>
              <line x1="430" y1="175" x2="490" y2="215" stroke="#4a90d9" strokeWidth="1.5"/>
              <rect x="40" y="215" width="230" height="210" rx="6" fill="#f0f4fa" stroke="#4a90d9" strokeWidth="1.5"/>
              <text x="155" y="237" textAnchor="middle" fill="#0d2137" fontSize="11" fontWeight="bold">COMMISSIONS &amp; COMMITTEES</text>
              <text x="155" y="252" textAnchor="middle" fill="#5a6a7a" fontSize="9">(Each: 9–15 members)</text>
              <text x="60" y="272" fill="#1a3a5c" fontSize="9.5" fontWeight="600">Air Navigation Commission (ANC)</text>
              <text x="60" y="287" fill="#5a6a7a" fontSize="9">→ 19 members appointed by Council</text>
              <text x="60" y="305" fill="#1a3a5c" fontSize="9.5" fontWeight="600">Air Transport Committee</text>
              <text x="60" y="320" fill="#5a6a7a" fontSize="9">→ Appointed by the Council</text>
              <text x="60" y="338" fill="#1a3a5c" fontSize="9.5" fontWeight="600">Legal Committee</text>
              <text x="60" y="356" fill="#1a3a5c" fontSize="9.5" fontWeight="600">Committee on Joint Support of ANS</text>
              <text x="60" y="371" fill="#5a6a7a" fontSize="9">→ Max 11 members, min 9, by Council</text>
              <text x="60" y="389" fill="#1a3a5c" fontSize="9.5" fontWeight="600">Finance Committee</text>
              <text x="60" y="404" fill="#5a6a7a" fontSize="9">→ Max 13, min 9 members, by Council</text>
              <text x="60" y="416" fill="#1a3a5c" fontSize="9.5" fontWeight="600">Committee on Unlawful Interference: 15</text>
              <rect x="410" y="215" width="230" height="180" rx="6" fill="#f0f4fa" stroke="#4a90d9" strokeWidth="1.5"/>
              <text x="525" y="237" textAnchor="middle" fill="#0d2137" fontSize="11" fontWeight="bold">THE SECRETARIAT</text>
              <text x="525" y="252" textAnchor="middle" fill="#5a6a7a" fontSize="9">(Secretary-General appointed by Council)</text>
              <text x="430" y="272" fill="#1a3a5c" fontSize="9.5" fontWeight="600">• Air Navigation Bureau</text>
              <text x="430" y="290" fill="#1a3a5c" fontSize="9.5" fontWeight="600">• Air Transport Bureau</text>
              <text x="430" y="308" fill="#1a3a5c" fontSize="9.5" fontWeight="600">• Technical Assistance Bureau</text>
              <text x="430" y="326" fill="#1a3a5c" fontSize="9.5" fontWeight="600">• Legal Bureau</text>
              <text x="430" y="344" fill="#1a3a5c" fontSize="9.5" fontWeight="600">• Bureau of Administration &amp; Services</text>
            </svg>
          </div>

          <Sub>ICAO Regional Offices (7 offices serving 9 regions)</Sub>
          <DTable
            heads={["#", "Region", "Office Location"]}
            rows={[
              ["1", "Asia and Pacific", "Bangkok, Thailand"],
              ["2", "Middle East", "Cairo, Egypt"],
              ["3", "Western and Central Africa", "Dakar, Senegal"],
              ["4", "South America", "Lima, Peru"],
              ["5", "North America, Central America and Caribbean", "Mexico City, Mexico"],
              ["6", "Eastern and Southern Africa", "Nairobi, Kenya"],
              ["7", "Europe and North Atlantic", "Paris, France"],
            ]}
          />
        </SectionBlock>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 4 — ICAO TECHNICAL PUBLICATIONS
        ══════════════════════════════════════════════════════════════ */}
        <SectionBlock num="04" title="ICAO Technical Publications — SARPs, PANS, SUPPS, Manuals">
          <div style={{ background: "#f1f5f9", borderRadius: 10, padding: 8, overflowX: "auto", margin: "0 0 14px" }}>
            <svg viewBox="0 0 640 330" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: "100%", fontFamily: "sans-serif", display: "block" }}>
              <rect width="640" height="330" fill="#f4f8fc" rx="8"/>
              <text x="320" y="28" textAnchor="middle" fill="#0d2137" fontSize="13" fontWeight="bold">ICAO Publication Hierarchy</text>
              <polygon points="240,50 400,50 420,110 220,110" fill="#0d2137" stroke="#c8922a" strokeWidth="2"/>
              <text x="320" y="80" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">SARPs</text>
              <text x="320" y="97" textAnchor="middle" fill="#c8922a" fontSize="9.5">Standards &amp; Recommended Practices (The 19 Annexes)</text>
              <polygon points="210,118 430,118 460,178 180,178" fill="#1a6fa8" stroke="#4a90d9" strokeWidth="1.5"/>
              <text x="320" y="146" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">PANS</text>
              <text x="320" y="163" textAnchor="middle" fill="#ddeeff" fontSize="9.5">Procedures for Air Navigation Services</text>
              <polygon points="175,186 465,186 495,246 145,246" fill="#4a90d9" stroke="#4a90d9" strokeWidth="1.5"/>
              <text x="320" y="214" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">SUPPs</text>
              <text x="320" y="231" textAnchor="middle" fill="#ddeeff" fontSize="9.5">Regional Supplementary Procedures</text>
              <rect x="80" y="254" width="480" height="55" rx="6" fill="#e8f0f8" stroke="#4a90d9" strokeWidth="1.5"/>
              <text x="320" y="278" textAnchor="middle" fill="#0d2137" fontSize="12" fontWeight="bold">Manuals &amp; Circulars</text>
              <text x="320" y="296" textAnchor="middle" fill="#5a6a7a" fontSize="9.5">Technical guidance, information and amplification of standards</text>
              <rect x="450" y="50" width="170" height="70" rx="6" fill="#fff0f0" stroke="#e05c5c" strokeWidth="2"/>
              <text x="535" y="70" textAnchor="middle" fill="#8b1a1a" fontSize="10" fontWeight="bold">Art. 38 – 60-Day Rule</text>
              <text x="535" y="87" textAnchor="middle" fill="#8b1a1a" fontSize="9">State unable to comply</text>
              <text x="535" y="101" textAnchor="middle" fill="#8b1a1a" fontSize="9">must notify ICAO Council</text>
              <text x="535" y="115" textAnchor="middle" fill="#8b1a1a" fontSize="9">within exactly 60 days</text>
            </svg>
          </div>

          <ArtGrid>
            <ArtCard num="SARPs" title="Standards & Recommended Practices" variant="dark">
              Adopted by the Council under Articles 54, 37, and 90. Designated as <strong>Annexes to the Convention</strong>.
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                <li><strong>International Standard:</strong> Uniform application necessary for <em>safety or regularity</em>. <Bdg type="red">MANDATORY</Bdg></li>
                <li><strong>Recommended Practice:</strong> Uniform application desirable in the <em>interest of safety, regularity or efficiency</em>. <Bdg type="gold">DESIRABLE</Bdg></li>
              </ul>
            </ArtCard>
            <ArtCard num="PANS" title="Procedures for Air Navigation Services">
              Approved by the Council for <strong>worldwide application</strong>. Contain operating procedures not yet having attained a sufficient degree of maturity for adoption as SARPs, or material too <strong>detailed for an Annex</strong>.
            </ArtCard>
            <ArtCard num="SUPPs" title="Regional Supplementary Procedures">
              Have a status <strong>similar to PANS</strong> in that they are approved by the Council, but only for application in <strong>specific geographic regions</strong>.
            </ArtCard>
            <ArtCard num="DOCS" title="Technical Manuals & Circulars">
              Provide <strong>guidance and information in amplification</strong> of the SARPs and PANS. ICAO Circulars make available <strong>specialized information of interest to Contracting States</strong>.
            </ArtCard>
          </ArtGrid>

          <Hr />
          <Sub>The 19 Annexes to the Chicago Convention</Sub>
          <InfoBox type="red" title="⚠️ Critical Exam Fact — Annexes with ONLY International Standards (No Recommended Practices)">
            <strong>Annexes 2, 5, 7 &amp; 8 contain ONLY International Standards — NO Recommended Practices.</strong><br />
            The remaining 15 Annexes contain both.
          </InfoBox>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 8, margin: "12px 0" }}>
            {[
              { n: "ANNEX 1",     t: "Personnel Licensing" },
              { n: "ANNEX 2 ⚑",  t: "Rules of the Air", std: true },
              { n: "ANNEX 3",     t: "Meteorological Service for International Air Navigation" },
              { n: "ANNEX 4",     t: "Aeronautical Charts" },
              { n: "ANNEX 5 ⚑",  t: "Units of Measurement", std: true },
              { n: "ANNEX 6",     t: "Operation of Aircraft (Parts I, II, III)" },
              { n: "ANNEX 7 ⚑",  t: "Aircraft Nationality & Registration Marks", std: true },
              { n: "ANNEX 8 ⚑",  t: "Airworthiness of Aircraft", std: true },
              { n: "ANNEX 9",     t: "Facilitation" },
              { n: "ANNEX 10",    t: "Aeronautical Telecommunication (5 Volumes)" },
              { n: "ANNEX 11",    t: "Air Traffic Services" },
              { n: "ANNEX 12",    t: "Search and Rescue" },
              { n: "ANNEX 13",    t: "Aircraft Accident Investigation" },
              { n: "ANNEX 14 ★", t: "Aerodromes (Vol I: Design & Ops; Vol II: Heliports)" },
              { n: "ANNEX 15",    t: "Aeronautical Information Service" },
              { n: "ANNEX 16",    t: "Environmental Protection (Vol I: Noise; Vol II: Emissions)" },
              { n: "ANNEX 17 ★", t: "Safeguarding International Civil Aviation against Acts of Unlawful Interference" },
              { n: "ANNEX 18 ★", t: "Safe Transport of Dangerous Goods by Air" },
              { n: "ANNEX 19",    t: "Safety Management" },
            ].map(({ n, t, std }) => (
              <div key={n} style={{
                border: `1px solid ${std ? "rgba(251,191,36,0.35)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 7,
                padding: "8px 10px",
                background: std ? "rgba(234,179,8,0.05)" : "rgba(255,255,255,0.02)",
              }}>
                <div style={{ fontFamily: "monospace", fontSize: "0.72rem", fontWeight: 700, color: std ? "#fbbf24" : "#7c3aed", marginBottom: 3 }}>{n}</div>
                <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{t}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.75rem", color: "#475569", marginTop: 4 }}>⚑ = Standards ONLY (no recommended practices). ★ = Frequently asked in exams.</p>
        </SectionBlock>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 5 — FREEDOMS OF THE AIR
        ══════════════════════════════════════════════════════════════ */}
        <SectionBlock num="05" title="Freedoms of the Air — Air Services Agreements">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <InfoBox type="blue" title="📖 IASTA 1944 — India HAS Ratified">
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                <li>Signed at Chicago on <strong>7 Dec 1944</strong></li>
                <li><Bdg type="green">India HAS Ratified ✓</Bdg></li>
                <li>Grants the <strong>Technical Freedoms</strong> (1st and 2nd)</li>
              </ul>
            </InfoBox>
            <InfoBox type="red" title="⚠️ IATA 1944 — India has NOT Ratified">
              <ul style={{ paddingLeft: 18, margin: 0 }}>
                <li>Signed at Chicago on <strong>7 Dec 1944</strong></li>
                <li><Bdg type="red">India has NOT Ratified ✗</Bdg></li>
                <li>Grants both Technical AND <strong>Commercial Freedoms</strong> (1st–5th)</li>
              </ul>
            </InfoBox>
          </div>

          <div style={{ background: "#f1f5f9", borderRadius: 10, padding: 8, overflowX: "auto", margin: "0 0 14px" }}>
            <svg viewBox="0 0 680 260" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: "100%", fontFamily: "sans-serif", display: "block" }}>
              <rect width="680" height="260" fill="#f4f8fc" rx="8"/>
              <text x="340" y="22" textAnchor="middle" fill="#0d2137" fontSize="12" fontWeight="bold">Freedoms of the Air — Visual Reference</text>
              <rect x="20" y="110" width="90" height="40" rx="5" fill="#0d2137"/>
              <text x="65" y="127" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">HOME</text>
              <text x="65" y="143" textAnchor="middle" fill="#c8922a" fontSize="9">STATE A</text>
              <rect x="290" y="110" width="90" height="40" rx="5" fill="#2e6da4"/>
              <text x="335" y="127" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">STATE B</text>
              <text x="335" y="143" textAnchor="middle" fill="#ddeeff" fontSize="9">Intermediate</text>
              <rect x="570" y="110" width="90" height="40" rx="5" fill="#2e7d52"/>
              <text x="615" y="127" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">STATE C</text>
              <text x="615" y="143" textAnchor="middle" fill="#ddffed" fontSize="9">Destination</text>
              <path d="M115,120 Q335,40 570,120" fill="none" stroke="#1a6fa8" strokeWidth="2" strokeDasharray="6,3"/>
              <text x="340" y="55" textAnchor="middle" fill="#1a6fa8" fontSize="9.5" fontWeight="bold">1st: Overfly B without landing</text>
              <path d="M115,130 Q200,145 285,130" fill="none" stroke="#0a3a6a" strokeWidth="2"/>
              <text x="200" y="172" textAnchor="middle" fill="#0a3a6a" fontSize="9">2nd: Land at B (non-traffic)</text>
              <path d="M113,145 Q200,185 285,155" fill="none" stroke="#2e7d52" strokeWidth="2"/>
              <text x="200" y="205" textAnchor="middle" fill="#2e7d52" fontSize="9">3rd: Drop pax/cargo at B from A</text>
              <path d="M385,155 Q470,190 567,145" fill="none" stroke="#2e7d52" strokeWidth="1.5" strokeDasharray="5,2"/>
              <text x="480" y="205" textAnchor="middle" fill="#2e7d52" fontSize="9">4th: Pick up pax at B for A</text>
              <path d="M385,140 Q480,85 567,125" fill="none" stroke="#c8922a" strokeWidth="2"/>
              <text x="480" y="75" textAnchor="middle" fill="#8a5000" fontSize="9">5th: Pick up at B, deliver to C</text>
            </svg>
          </div>

          <DTable
            heads={["#", "Type", "Description", "Agreement", "India Ratified?"]}
            rows={[
              ["1st", <Bdg key="1t" type="gold">TECHNICAL</Bdg>, "The privilege to fly across the territory of another State without landing.", "IASTA 1944", <TdGreen key="1r">YES ✓</TdGreen>],
              ["2nd", <Bdg key="2t" type="gold">TECHNICAL</Bdg>, "The privilege to land for non-traffic purposes (e.g., fuel stop, technical stop — no pax/cargo loaded or unloaded).", "IASTA 1944", <TdGreen key="2r">YES ✓</TdGreen>],
              ["3rd", <Bdg key="3t" type="red">COMMERCIAL</Bdg>, "The privilege to put down (drop off) passengers, mail, and cargo taken on in the territory of the State whose nationality the aircraft possesses.", "IATA 1944", <TdRed key="3r">NO ✗</TdRed>],
              ["4th", <Bdg key="4t" type="red">COMMERCIAL</Bdg>, "The privilege to take on (pick up) passengers, mail, and cargo destined for the territory of the State whose nationality the aircraft possesses.", "IATA 1944", <TdRed key="4r">NO ✗</TdRed>],
              ["5th", <Bdg key="5t" type="red">COMMERCIAL</Bdg>, "The privilege to take on passengers, mail, and cargo destined for any other Contracting State, AND the privilege to put down passengers, mail, and cargo coming from any such territory. (Between two foreign states.)", "IATA 1944", <TdRed key="5r">NO ✗</TdRed>],
            ]}
          />
        </SectionBlock>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 6 — SECURITY & UNLAWFUL ACTS CONVENTIONS
        ══════════════════════════════════════════════════════════════ */}
        <SectionBlock num="06" title="Security & Unlawful Acts Conventions">
          <InfoBox type="green" title="✅ All of these conventions have been ratified by India">
            Tokyo 1963, Hague 1970, Montreal 1971 &amp; 1991, and Montreal Protocol 1988 — all ratified by India.
          </InfoBox>

          <DTable
            heads={["Convention", "Year", "Core Focus", "Key Provision", "India"]}
            rows={[
              [<strong key="t">Tokyo Convention</strong>, "1963", <strong key="tf">Offences on board aircraft</strong>, "Grants Aircraft Commander powers to impose reasonable restraint on unruly persons", <TdGreen key="tr">Ratified ✓</TdGreen>],
              [<strong key="h">Hague Convention</strong>, "1970", <strong key="hf">Hijacking — Unlawful Seizure of aircraft in flight</strong>, "Defines act of unlawful seizure; requires extradition of offenders; severe punishment", <TdGreen key="hr">Ratified ✓</TdGreen>],
              [<strong key="m">Montreal Convention</strong>, "1971", <strong key="mf">Sabotage — Acts against safety of civil aviation</strong>, "Acts of violence on board; destroying an aircraft; damaging navigation facilities; transmitting false info", <TdGreen key="mr">Ratified ✓</TdGreen>],
              [<strong key="mp">Montreal Protocol</strong>, "1988", <strong key="mpf">Aerodromes — Extended Montreal 1971 to airports</strong>, "Covers violence at aerodromes serving international civil aviation; destruction of airport facilities", <TdGreen key="mpr">Ratified ✓</TdGreen>],
              [<strong key="m91">Montreal Convention</strong>, "1991", <strong key="m91f">Plastic Explosives — Marking for detection</strong>, "Convention on the marking of plastic explosives for the purpose of detection", <TdGreen key="m91r">Ratified ✓</TdGreen>],
            ]}
          />

          <Hr />
          <Sub>Tokyo Convention 1963 — Detailed Clauses</Sub>
          <InfoBox type="blue" title="Full Name & Scope">
            <em>Convention on Offences and Certain Other Acts Committed on Board Aircraft — Signed at Tokyo on 14 September 1963.</em>
            <ul style={{ paddingLeft: 18, marginTop: 8 }}>
              <li>Applies to: (a) offences against penal law; (b) acts which may <strong>jeopardize the safety of the aircraft, persons or property therein, or jeopardize good order and discipline on board</strong>.</li>
              <li>Applies to aircraft registered in a contracting State, while <strong>in flight or on the surface of the high seas or any other area outside the territory of any State</strong>.</li>
              <li>Aircraft is considered <strong>&ldquo;in flight&rdquo;</strong> from the moment when <strong>power is applied for the purpose of take-off until the moment when the landing run ends</strong>.</li>
              <li><strong>Does NOT apply</strong> to aircraft used in military, customs, or police services.</li>
            </ul>
          </InfoBox>

          <ArtGrid>
            <ArtCard num="Art. 2" title="No Political Offences" variant="dark">
              No provision of this Convention shall be interpreted as authorizing or requiring any action in respect of offences against penal laws of a <strong>political nature or based on racial or religious discrimination</strong>.
            </ArtCard>
            <ArtCard num="Art. 3" title="Jurisdiction" variant="dark">
              The <strong>State of registration</strong> of the aircraft is competent to exercise jurisdiction over offences and acts committed on board. This Convention does not exclude any criminal jurisdiction exercised in accordance with national law.
            </ArtCard>
            <ArtCard num="Art. 5 & 6" title="Powers of the Aircraft Commander ⭐ HIGH PRIORITY" variant="red" full>
              The aircraft commander may, when he has <strong>reasonable grounds to believe</strong> that a person has committed, or is about to commit, an offence on board, impose upon such person <strong>reasonable measures including restraint</strong> which are necessary:
              <ol style={{ paddingLeft: 20, marginTop: 8 }}>
                <li>To protect the <strong>safety of the aircraft</strong>, or of persons or property therein</li>
                <li>To maintain <strong>good order and discipline on board</strong></li>
                <li>To enable him to <strong>deliver such person to competent authorities</strong></li>
              </ol>
              <InfoBox type="yellow" title="📝 Additional Powers">
                <ul style={{ paddingLeft: 18, margin: 0 }}>
                  <li>Commander may <strong>require or authorize</strong> assistance of other crew members.</li>
                  <li>Commander may <strong>request but NOT require</strong> assistance of passengers.</li>
                  <li>Any crew member or passenger may take <strong>reasonable preventive measures WITHOUT authorization</strong> when immediately necessary.</li>
                </ul>
              </InfoBox>
              <InfoBox type="red" title="⚠️ Exam Golden Rule">
                <strong>If a question involves the Aircraft Commander&apos;s powers of restraint, the answer is ALWAYS the TOKYO CONVENTION.</strong>
              </InfoBox>
            </ArtCard>
            <ArtCard num="Art. 7" title="Duration of Restraint" full>
              Measures of restraint imposed <strong>shall not be continued beyond any point at which the aircraft lands</strong>, UNLESS:
              <ul style={{ paddingLeft: 18, marginTop: 6 }}>
                <li>Such point is in a <strong>non-Contracting State</strong> whose authorities refuse to permit disembarkation</li>
                <li>The aircraft makes a <strong>forced landing</strong> and the commander is unable to deliver that person to competent authorities</li>
                <li>That person <strong>agrees to onward carriage under restraint</strong></li>
              </ul>
            </ArtCard>
          </ArtGrid>

          <Hr />
          <Sub>Hague Convention 1970 — Hijacking</Sub>
          <InfoBox type="red" title="⚠️ Focus Area">
            Following Tokyo Convention and politically motivated terrorist hijackings, ICAO called a convention hosted by the Dutch government. The <em>Convention for the Suppression of Unlawful Seizure of Aircraft</em> defines the act of unlawful seizure and the measures to be taken by contracting states to enforce <strong>severe punishment</strong> upon perpetrators. This agreement specifies <strong>extradition of offenders</strong> and obliges contracting states to extradite offenders.
          </InfoBox>

          <Hr />
          <Sub>Montreal Convention 1971 — Sabotage</Sub>
          <InfoBox type="red" title="⚠️ Offences under Montreal 1971 (Suppression of Unlawful Acts Against the Safety of Civil Aviation)">
            Makes it an offence to:
            <ul style={{ paddingLeft: 18, marginTop: 6 }}>
              <li>Commit <strong>acts of violence on board aircraft</strong> that endanger people, property, and the safety of the aircraft</li>
              <li><strong>Destroy an aircraft in service</strong> or cause damage rendering it incapable of flight</li>
              <li><strong>Place a device on board</strong> an aircraft that is likely to destroy the aircraft or damage it</li>
              <li><strong>Destroy or damage any navigation facility</strong> or interfere with its correct operation</li>
              <li><strong>Interfere with aircraft communications</strong> or transmit false information that endangers an aeroplane in flight</li>
            </ul>
          </InfoBox>

          <Hr />
          <Sub>Montreal Protocol 1988 — Extension to Aerodromes</Sub>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Extended the Montreal Convention 1971 to include offences committed at <strong style={{ color: "#e2e8f0" }}>aerodromes serving international civil aviation</strong>, including the intentional use of any device, substance, or weapon likely to:</p>
          <ul style={{ color: "#94a3b8", fontSize: "0.875rem", paddingLeft: 20 }}>
            <li>Cause serious injury or death</li>
            <li>Destroy or seriously damage the <strong style={{ color: "#e2e8f0" }}>facilities of an airport</strong></li>
            <li>Destroy or damage <strong style={{ color: "#e2e8f0" }}>aircraft not in service</strong> at the airport</li>
            <li>Disrupt the <strong style={{ color: "#e2e8f0" }}>services at an airport</strong></li>
          </ul>
        </SectionBlock>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 7 — LIABILITY & OWNERSHIP CONVENTIONS
        ══════════════════════════════════════════════════════════════ */}
        <SectionBlock num="07" title="Liability & Ownership Conventions">
          <Sub>Warsaw Convention 1929 — Passenger Liability</Sub>
          <InfoBox type="blue" title="Full Name & Key Facts">
            <em>Convention for the Unification of Certain Rules Relating to International Carriage by Air — Signed at Warsaw on 12 October 1929</em>
            <ul style={{ paddingLeft: 18, marginTop: 8 }}>
              <li><Bdg type="green">India Ratified: Warsaw Convention + Hague Protocol</Bdg></li>
              <li>152 States are party — one of the most widely accepted unifications of private law.</li>
              <li>Applies to all international carriage of <strong>persons, luggage, or goods performed by aircraft for reward</strong>, and to gratuitous carriage by an air transport undertaking.</li>
              <li>Does <strong>NOT apply</strong> to carriage performed under terms of any <strong>international postal Convention</strong>.</li>
            </ul>
          </InfoBox>

          <Sub2>Amendments to Warsaw Convention</Sub2>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "10px 0" }}>
            {[
              { year: "1929", name: "Warsaw Convention",              desc: "Original treaty signed. India ratified." },
              { year: "1955", name: "Hague Protocol",                  desc: "India ratified. Increased liability limits." },
              { year: "1961", name: "Guadalajara Convention",          desc: "India did NOT ratify." },
              { year: "1971", name: "Guatemala City Protocol",         desc: "India did NOT ratify." },
              { year: "1975", name: "Additional Montreal Protocols 1–4", desc: "India did NOT ratify." },
              { year: "1999", name: "Montreal Convention",             desc: "Aimed at replacing Warsaw Convention system. India did NOT ratify. No financial limits on liability for passenger injury or death. For damages up to 113,100 SDRs, air carrier cannot contest claims." },
            ].map(({ year, name, desc }) => (
              <div key={year} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "8px 12px", borderRadius: 7, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#7c3aed", fontSize: "0.8rem", minWidth: 36, paddingTop: 1 }}>{year}</div>
                <div>
                  <div style={{ fontWeight: 700, color: "#e2e8f0", fontSize: "0.875rem" }}>{name}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>

          <Sub2>What does Warsaw Unify?</Sub2>
          <ul style={{ color: "#94a3b8", fontSize: "0.875rem", paddingLeft: 20 }}>
            <li>Documentation on the carriage of <strong style={{ color: "#e2e8f0" }}>passengers, baggage, and cargo</strong></li>
            <li>The <strong style={{ color: "#e2e8f0" }}>financial liability of airlines (operators)</strong></li>
            <li>The question of <strong style={{ color: "#e2e8f0" }}>jurisdiction</strong>, by defining the courts before which any action may be brought</li>
          </ul>

          <Sub2>Passenger Ticket Requirements (Warsaw)</Sub2>
          <InfoBox type="green" title="✅ A Passenger Ticket Shall Contain">
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li>The <strong>place and date of issue</strong></li>
              <li>An indication of the <strong>place of departure and destination</strong></li>
              <li>The <strong>agreed stopping places</strong></li>
              <li>The <strong>name and address of the carrier or carriers</strong></li>
              <li>A statement that the carriage is subject to the <strong>rules relating to the liability</strong> established by this convention</li>
            </ul>
          </InfoBox>
          <InfoBox type="red" title="⚠️ Absence/Irregularity of Ticket — Critical Rule">
            The absence, irregularity, or loss of the passenger ticket <strong>does NOT affect the validity of the contract of carriage</strong>. However, if a carrier accepts a passenger <strong>without a ticket</strong>, the carrier will <strong>NOT be able to fall back on the provisions of the convention that limit liability</strong>.
          </InfoBox>

          <Sub2>Liability of the Carrier (Warsaw)</Sub2>
          <InfoBox type="yellow" title="📝 Liability Limits">
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li>The Treaty imposed <strong>limitations on the liability of the operator</strong>. However, where <strong>gross negligence can be proved, the limit of liability is removed</strong>.</li>
              <li>Under <strong>Montreal Convention 1999</strong>: No financial limits on liability for passenger injury or death.</li>
              <li>For damages up to <Bdg type="red">113,100 SDRs</Bdg> — the air carrier <strong>cannot contest</strong> claims for compensation.</li>
              <li>Above 113,100 SDRs — the air carrier <strong>can defend itself</strong> against a claim by proving it was not negligent.</li>
            </ul>
          </InfoBox>

          <Sub2>Carriage by Air Act, 1972 (India)</Sub2>
          <InfoBox type="blue" title="📖 Indian Legislation">
            The rights and liabilities of air carriers are governed by the <strong>Carriage by Air Act, 1972</strong> [as amended in 2009]. <strong>The Act extends to the whole of India.</strong> Applicable to Indian citizens involved in domestic carriage by air and in international carriage by air, irrespective of the nationality of the aircraft performing the carriage.
          </InfoBox>

          <Hr />
          <Sub>Rome Convention 1952 — Surface Damage</Sub>
          <InfoBox type="yellow" title="📝 Key Facts">
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li>Full Name: <em>Convention on Damage Caused by Foreign Aircraft to Third Parties on the Surface</em></li>
              <li>Replaced Rome Convention 1933 and Brussels Protocol 1938</li>
              <li>The operator is liable, but liability is <strong>limited to a sum proportionate to the weight of the aircraft</strong></li>
              <li>Makes it <strong>compulsory to insure</strong> against this liability</li>
              <li><Bdg type="red">India has NOT ratified this convention</Bdg></li>
              <li><strong>Montreal Protocol 1978</strong> amended Rome Convention by including operators living in another contracting state.</li>
            </ul>
          </InfoBox>

          <Hr />
          <Sub>Geneva Convention 1948 — Finance Rights</Sub>
          <InfoBox type="blue" title="📖 Purpose">
            This convention protects the <strong>rights of seller for aircraft bought on Hire Purchase, Lease, or Mortgage</strong>. Secures rights in aircraft bought on hire purchase, lease, or mortgage.
          </InfoBox>

          <Hr />
          <Sub>Cape Town Convention &amp; Protocol, 2001 — Asset Security</Sub>
          <InfoBox type="blue" title="📖 Key Facts">
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li>Full Name: <em>Convention on International Interests in Mobile Equipment as applied to Aircraft Objects</em></li>
              <li>Signed at <strong>Cape Town on 16 November 2001</strong></li>
              <li>Aims at introducing a <strong>legally certain, effective, and prompt system of enforcement</strong> that can assure and encourage <strong>investments in Aircraft objects</strong></li>
              <li>Meets the particular requirements of <strong>aircraft finance</strong> and extends contracts of sale of aircraft equipment</li>
              <li><Bdg type="green">India ratified this convention and protocol in 2008 ✓</Bdg></li>
            </ul>
          </InfoBox>

          <Hr />
          <Sub>Summary — All Liability &amp; Ownership Conventions</Sub>
          <DTable
            heads={["Convention", "Year", "Protected Entity", "Core Function", "India"]}
            rows={[
              [<strong key="w">Warsaw Convention</strong>, "1929", "Passengers, Baggage, Cargo", "Defines financial liability for airlines, ticketing, carriage rules", <TdGreen key="wr">Ratified ✓</TdGreen>],
              [<strong key="r">Rome Convention</strong>, "1952", "Third parties on the surface", "Defines liability for damage caused on ground by foreign aircraft", <TdRed key="rr">NOT Ratified ✗</TdRed>],
              [<strong key="g">Geneva Convention</strong>, "1948", "Sellers & Financiers", "Secures rights in aircraft bought on hire purchase, lease, or mortgage", "—"],
              [<strong key="c">Cape Town Convention</strong>, "2001", "Mobile equipment investments", "Secures international interests in aircraft finance and object enforcement", <TdGreen key="cr">Ratified 2008 ✓</TdGreen>],
            ]}
          />
        </SectionBlock>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 8 — INDIAN AVIATION ORGANISATIONS
        ══════════════════════════════════════════════════════════════ */}
        <SectionBlock num="08" title="Indian Aviation Organisations — MoCA, DGCA & AAI">
          <Sub>Ministry of Civil Aviation (MoCA)</Sub>
          <InfoBox type="blue" title="📖 Identity">
            Located at <strong>Rajiv Gandhi Bhavan, Safdarjung Airport, New Delhi</strong>. Responsible for:
            <ul style={{ paddingLeft: 18, marginTop: 6 }}>
              <li>Formulation of national policies and programmes for the <strong>development and regulation of Civil Aviation</strong></li>
              <li>Administration of the <strong>Aircraft Act, 1934</strong>, Aircraft Rules, 1937 and various other legislations</li>
              <li>Administrative control over: <strong>DGCA, Bureau of Civil Aviation Security (BCAS), IGRUA, AAI, Air India, Pawan Hans Helicopters</strong></li>
              <li>Commission of Railway Safety (under this Ministry)</li>
            </ul>
          </InfoBox>

          <Hr />
          <Sub>Directorate General of Civil Aviation (DGCA)</Sub>
          <InfoBox type="blue" title="📖 Role">
            The <strong>primary regulatory body in the field of Civil Aviation, primarily dealing with safety issues</strong>. Responsible for regulation of air transport services to/from/within India, enforcement of civil air regulations, air safety, and airworthiness standards. Coordinates all regulatory functions with ICAO.
          </InfoBox>

          <Sub2>Functions of DGCA (12 Key Functions)</Sub2>
          <InfoBox type="green" title="✅ DGCA's Functions">
            <ol style={{ paddingLeft: 20, margin: 0, display: "grid", gap: 4 }}>
              <li><strong>Registration of civil aircraft</strong></li>
              <li>Formulation of standards of airworthiness for civil aircraft registered in India and grant of <strong>Certificates of Airworthiness</strong></li>
              <li><strong>Licensing of pilots, AMEs, and flight engineers</strong>; conducting examinations and checks</li>
              <li><strong>Licensing of air traffic controllers</strong></li>
              <li>Certification of <strong>aerodromes and CNS/ATM facilities</strong></li>
              <li>Granting of <strong>Air Operator&apos;s Certificates (AOCs)</strong> to Indian carriers; regulation of air transport services</li>
              <li>Conducting investigation into <strong>accidents/incidents</strong> and taking accident prevention measures; implementing Safety Aviation Management programmes</li>
              <li>Carrying out amendments to the <strong>Aircraft Act, the Aircraft Rules</strong> and Civil Aviation Requirements (CARs)</li>
              <li>Coordination at national level for <strong>flexi-use of airspace</strong> by civil and military air traffic agencies</li>
              <li>Keeping a check on <strong>aircraft noise and engine emissions</strong> in accordance with ICAO Annex 16</li>
              <li>Promoting <strong>indigenous design and manufacture</strong> of aircraft and aircraft components</li>
              <li>Approving training programmes for operators for carriage of <strong>dangerous goods</strong>; issuing authorizations for carriage of dangerous goods</li>
            </ol>
          </InfoBox>

          <Hr />
          <Sub>Airports Authority of India (AAI)</Sub>
          <InfoBox type="blue" title="📖 Formation">
            Formed on <Bdg type="red">1st April 1995</Bdg> by merging the <strong>International Airports Authority of India</strong> and the <strong>National Airports Authority</strong>. Purpose: To accelerate the integrated development, expansion, and modernization of airports in India conforming to international standards.
          </InfoBox>

          <Sub2>Functions of AAI (10 Main Functions)</Sub2>
          <ArtGrid>
            {[
              { n: "1", t: "Design & Maintenance",       d: "Design, Development, Operation, and Maintenance of international and domestic airports and civil enclaves." },
              { n: "2", t: "Airspace Management",         d: "Control and Management of the Indian airspace extending beyond the territorial limits of the country, as accepted by ICAO." },
              { n: "3", t: "Passenger Terminals",         d: "Construction, Modification, and Management of passenger terminals." },
              { n: "4", t: "Cargo Terminals",             d: "Development and Management of cargo terminals at international and domestic airports." },
              { n: "5", t: "Passenger Facilities",        d: "Provision of passenger facilities and information systems at passenger terminals." },
              { n: "6", t: "Runways, Aprons & Taxiways",  d: "Expansion and strengthening of operation areas viz. Runways, Aprons, Taxiways, etc." },
              { n: "7", t: "Visual Aids",                  d: "Provision of visual aids (approach lighting, runway lighting, etc.)." },
              { n: "8", t: "CNS — Communication & Nav",   d: "Provision of Communication and Navigation aids viz. ILS, DVOR, DME, Radar, etc." },
              { n: "9", t: "Air Traffic Services",         d: "Provision of Air Traffic Services at airports under its jurisdiction." },
              { n: "10", t: "Aeronautical Information",    d: "Provision of aeronautical information services: publication of AIP, NOTAMs, AIRRACs, PIBs, etc." },
            ].map(({ n, t, d }) => (
              <ArtCard key={n} num={n} title={t}>{d}</ArtCard>
            ))}
          </ArtGrid>
        </SectionBlock>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 9 — GOLDEN RULES (EXAM CHECKLIST)
        ══════════════════════════════════════════════════════════════ */}
        <SectionBlock num="09" title="Captain's Exam Checklist — Golden Rules to Memorize">
          <div style={{ border: "1px solid rgba(124,58,237,0.35)", borderRadius: 10, padding: 18, background: "rgba(124,58,237,0.05)" }}>
            <div style={{ color: "#c4b5fd", fontWeight: 800, fontSize: "1rem", marginBottom: 12 }}>⭐ Golden Rules — These Come Up Again &amp; Again in DGCA Exams</div>
            <ol style={{ color: "#d1d5db", fontSize: "0.875rem", lineHeight: 1.75, paddingLeft: 22, display: "grid", gap: 6 }}>
              <li><strong style={{ color: "#e2e8f0" }}>Paris Convention (1919)</strong> established <strong style={{ color: "#fbbf24" }}>ICAN</strong>. The Chicago Convention (1944) established <strong style={{ color: "#fbbf24" }}>ICAO</strong>. These are DIFFERENT bodies.</li>
              <li><strong style={{ color: "#e2e8f0" }}>Chicago Convention</strong> was signed on <strong style={{ color: "#fbbf24" }}>7 December 1944</strong> and consists of exactly <strong style={{ color: "#fbbf24" }}>96 Articles</strong>.</li>
              <li><strong style={{ color: "#e2e8f0" }}>Cabotage (Article 7)</strong> strictly refers to <strong style={{ color: "#fbbf24" }}>DOMESTIC air services</strong> — the right to refuse foreign airlines from carrying passengers/cargo between two points within the SAME territory for remuneration.</li>
              <li>For aircraft flying over the <strong style={{ color: "#e2e8f0" }}>HIGH SEAS</strong>, the rules established under the <strong style={{ color: "#fbbf24" }}>Convention (ICAO rules)</strong> apply — NOT the rules of any individual state.</li>
              <li>If a question involves the Aircraft Commander&apos;s powers of <strong style={{ color: "#e2e8f0" }}>restraint</strong>, the answer is <strong style={{ color: "#f87171" }}>ALWAYS the Tokyo Convention (1963)</strong>.</li>
              <li>States have exactly <strong style={{ color: "#fbbf24" }}>60 DAYS</strong> to notify ICAO Council if they cannot comply with an International Standard after an amendment (Article 38).</li>
              <li><strong style={{ color: "#fbbf24" }}>Annexes 2, 5, 7 &amp; 8</strong> contain <strong style={{ color: "#e2e8f0" }}>ONLY International Standards</strong> — NO Recommended Practices.</li>
              <li>India <strong style={{ color: "#4ade80" }}>HAS ratified</strong> IASTA 1944 (Technical Freedoms — 1st &amp; 2nd). India has <strong style={{ color: "#f87171" }}>NOT ratified</strong> the International Air Transport Agreement 1944 (Commercial Freedoms).</li>
              <li>The <strong style={{ color: "#e2e8f0" }}>Warsaw Convention</strong> defines liability for carriers for passengers, baggage, and cargo. <strong style={{ color: "#e2e8f0" }}>Rome Convention 1952</strong> covers damage to third parties on the surface.</li>
              <li>AAI was formed on <strong style={{ color: "#fbbf24" }}>1st April 1995</strong> by merging IAAI and NAA.</li>
              <li>Aircraft <strong style={{ color: "#e2e8f0" }}>&ldquo;in flight&rdquo;</strong> (Tokyo Convention definition): from the moment when <strong style={{ color: "#fbbf24" }}>power is applied for takeoff until the landing run ends</strong>.</li>
              <li>ICAO became a <strong style={{ color: "#e2e8f0" }}>specialized agency of the United Nations</strong> in <strong style={{ color: "#fbbf24" }}>1947</strong>.</li>
            </ol>
          </div>

          <Hr />
          <Sub>Quick Reference: India&apos;s Ratification Status</Sub>
          <DTable
            heads={["Convention", "Year", "Subject", "India"]}
            rows={[
              ["Paris Convention", "1919", "First international aviation agreement", "—"],
              [<strong key="cc">Chicago Convention</strong>, "1944", "Core aviation convention; established ICAO", <TdGreen key="ccr">Ratified ✓</TdGreen>],
              [<strong key="ia">IASTA (Technical Freedoms)</strong>, "1944", "1st & 2nd Freedoms (overflight, tech stop)", <TdGreen key="iar">Ratified ✓</TdGreen>],
              [<strong key="ita">IATA (Commercial Freedoms)</strong>, "1944", "1st–5th Freedoms (commercial traffic)", <TdRed key="itar">NOT Ratified ✗</TdRed>],
              [<strong key="wa">Warsaw Convention</strong>, "1929", "Passenger / cargo liability", <TdGreen key="war">Ratified ✓</TdGreen>],
              ["Hague Protocol", "1955", "Amendment to Warsaw", <TdGreen key="hpr">Ratified ✓</TdGreen>],
              ["Montreal Convention 1999", "1999", "Replace Warsaw system", <TdRed key="mc99r">NOT Ratified ✗</TdRed>],
              [<strong key="ro">Rome Convention</strong>, "1952", "Surface damage by foreign aircraft", <TdRed key="ror">NOT Ratified ✗</TdRed>],
              [<strong key="to">Tokyo Convention</strong>, "1963", "Onboard offences; Commander's powers", <TdGreen key="tor">Ratified ✓</TdGreen>],
              [<strong key="ha">Hague Convention</strong>, "1970", "Hijacking / unlawful seizure", <TdGreen key="har">Ratified ✓</TdGreen>],
              [<strong key="mo">Montreal Convention</strong>, "1971", "Sabotage / acts against civil aviation", <TdGreen key="mor">Ratified ✓</TdGreen>],
              ["Montreal Protocol", "1988", "Offences at aerodromes", <TdGreen key="mpr2">Ratified ✓</TdGreen>],
              ["Montreal Convention", "1991", "Marking of plastic explosives", <TdGreen key="m91r2">Ratified ✓</TdGreen>],
              [<strong key="ct">Cape Town Convention</strong>, "2001", "Aircraft finance / asset security", <TdGreen key="ctr">Ratified 2008 ✓</TdGreen>],
            ]}
          />
        </SectionBlock>

        {/* ── Quiz CTA ─────────────────────────────────────────────── */}
        <div className="rounded-2xl p-8 mt-8 mb-10 text-center"
          style={{ background: "rgba(15,8,30,0.95)", border: "1px solid rgba(124,58,237,0.25)" }}>
          <div className="text-4xl mb-3">✅</div>
          <h3 className="text-lg font-black text-white mb-2">Ready to Test Yourself?</h3>
          <p className="text-sm max-w-md mx-auto mb-6" style={{ color: "#64748b" }}>
            {chapter.questionCount} questions covering all 9 sections of Chapter 1 — International Agreements &amp; ICAO.
          </p>
          <Link href={`/${track}/${subject.id}/${chapter.id}/chapter-quiz`}
            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-sm font-black no-underline"
            style={{ background: "linear-gradient(135deg, #7c3aed, #c020ff)", color: "#fff" }}>
            <ListChecks className="w-4 h-4" /> Start Chapter Quiz →
          </Link>
        </div>

        {/* ── Prev / All / Next navigation ────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          {prevChapter ? (
            <Link href={`/${track}/${subject.id}/${prevChapter.id}/notes`}
              className="flex items-center gap-2 px-4 py-3 rounded-xl no-underline min-w-0"
              style={{ background: "rgba(15,8,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs truncate" style={{ color: "#475569" }}>Previous</div>
                <div className="text-sm font-semibold truncate">Ch.{prevChapter.number}: {prevChapter.title}</div>
              </div>
            </Link>
          ) : <div />}

          <Link href={`/${track}/${subject.id}`}
            className="text-sm font-bold no-underline px-4 py-2 rounded-xl whitespace-nowrap flex-shrink-0"
            style={{ color: subject.color, border: `1px solid ${subject.color}30`, background: `${subject.color}10` }}>
            ↑ All Chapters
          </Link>

          {nextChapter ? (
            <Link href={`/${track}/${subject.id}/${nextChapter.id}/notes`}
              className="flex items-center gap-2 px-4 py-3 rounded-xl no-underline min-w-0"
              style={{ background: "rgba(15,8,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
              <div className="text-right min-w-0">
                <div className="text-xs truncate" style={{ color: "#475569" }}>Next</div>
                <div className="text-sm font-semibold truncate">Ch.{nextChapter.number}: {nextChapter.title}</div>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          ) : <div />}
        </div>

      </div>
    </div>
  );
}
