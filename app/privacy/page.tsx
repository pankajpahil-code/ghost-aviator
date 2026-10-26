import type { Metadata } from "next";
import Link from "next/link";
import { enquiryLink } from "@/lib/live-classes";

// Every sentence on this page is a claim about what the code does. Checked
// against the code on 26 October 2026: accounts are live through Supabase;
// signed-in progress, exam attempts and ADAPT results are mirrored to the
// student's own rows; the updates list is opt-in; ADAPT telemetry is anonymous
// and can be switched off; Gini's route keeps the IP only in an in-memory rate
// limiter. Change the code, change this page.
const UPDATED = "26 October 2026";

export const metadata: Metadata = {
  title: "Privacy Policy — Ghost Aviator",
  description:
    "What Ghost Aviator stores, why, and how to delete it: optional accounts, synced study progress, the email updates list, anonymous ADAPT practice counts, and no selling of your data.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: true },
};

const ACCENT = "#ab794d";
const CARD = "rgba(17,24,32,0.95)";
const HAIRLINE = "1px solid rgba(255,255,255,0.06)";

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="rounded-2xl p-6 mb-5" style={{ background: CARD, border: HAIRLINE }}>
      <h2 className="text-lg font-semibold mb-3" style={{ color: "#f1f5f9" }}>{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed" style={{ color: "#cbd5e1" }}>{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  const tg = enquiryLink("privacy");   // no personal phone number or personal email in public
  return (
    <div style={{ background: "#0b1117" }} className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-4 pt-24">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: ACCENT }}>Ghost Aviator</p>
        <h1 className="text-3xl font-bold mb-3" style={{ color: "#f8fafc" }}>Privacy Policy</h1>
        <p className="mb-8 text-sm" style={{ color: "#94a3b8" }}>
          Last updated {UPDATED}. Questions about this page:{" "}
          <a href={tg} style={{ color: ACCENT }}>message Ghost Aviator on Telegram</a>.
        </p>

        <Section title="Who we are">
          <p>This website (ghostaviator.com) and its assistants on Telegram, Instagram, Facebook, WhatsApp and YouTube are
            run by <strong>Ghost Aviator</strong>. Ghost Aviator decides what is stored about you and why, and is the one to ask
            about anything on this page.</p>
          <p><strong>Contact:</strong> <a href={tg} style={{ color: ACCENT }}>message Ghost Aviator on Telegram</a>.
            We reply in the same chat.</p>
        </Section>

        <Section title="The short version">
          <p>You can use every chapter, question, mock test and tool on this website without an account and without telling us who you are.</p>
          <p>If you create a free account, we store your name, email and password hash so you can log in, and we sync your
            progress, mock-exam history and ADAPT results to that account. You can use the site without doing this.</p>
          <p>We add you to the email updates list only if you submit the updates form or tick the optional box when creating an account.
            We never sell your data. You can ask us to delete it.</p>
        </Section>

        <Section title="What we do not collect">
          <p>The website does not ask for your address, date of birth, Aadhaar number, bank or card details, UPI PIN, location,
            contacts, camera or microphone. Live-class fees are paid by UPI after your free demo; we never see your UPI PIN.</p>
        </Section>

        <Section title="Accounts and sign-in">
          <p><strong>What we store:</strong> your email address, the name you give us, a password hash handled by Supabase
            (we never see your password), your account ID, whether your email is confirmed, and the session token your browser
            keeps so you stay signed in.</p>
          <p><strong>Why:</strong> to create and run your account, sign you in, send confirmation and password-reset emails,
            and sync your study data across devices.</p>
          <p><strong>Who processes it:</strong> Supabase hosts our authentication and database and processes this data on our
            instructions. We do not run our own password store.</p>
          <p><strong>Service emails:</strong> Supabase sends the confirmation and password-reset emails. These are not marketing.
            Treat a reset link like a password: anyone who has it can set a new password for that account.</p>
          <p><strong>Deleting your account:</strong> message us on Telegram and ask us to delete your account. We delete the
            account and its linked progress, mock-exam and ADAPT rows within 30 days. If you also joined the updates list, ask
            us to remove that separately.</p>
        </Section>

        <Section title="Study data on your device">
          <p>Signed out, the study tools keep their data in your own browser on your own device. It does not reach us. Clearing
            your browser data removes it.</p>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li><strong>Progress</strong> — the best quiz and chapter-test score you have reached for each chapter.</li>
            <li><strong>Mock-exam history</strong> — the paper, your score, the time taken and the chapter breakdown for each attempt.</li>
            <li><strong>Mistakes Bank</strong> — the mock-test questions you answered wrong or skipped, the answer you chose, the
              correct answer and explanation, and when you last missed them. It stays on this device and is not mirrored.</li>
            <li><strong>Flagged questions</strong> — the questions you marked for later.</li>
            <li><strong>ADAPT history</strong> — a summary of each practice session on this device.</li>
            <li><strong>ADAPT telemetry choice</strong> - a random device ID and your on/off choice for the anonymous score line described below.</li>
            <li><strong>Read-aloud preference</strong> - the voice and speed you chose for spoken answers.</li>
            <li><strong>Gini</strong> - a visit count, a per-tab greeting/offer state and the last subject you asked about.
              Gini does not keep your chat transcript.</li>
          </ul>
        </Section>

        <Section title="Study data in your account">
          <p>When you are signed in, some of that data is mirrored to Supabase so it follows you to another device. The browser
            is restricted by row-level security to your own rows. Ghost Aviator (the Captain) and Supabase, as host, can access
            the database to run and support the service.</p>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li><strong>Progress</strong> — the chapter key, best quiz score, best test score and the time it was last updated.</li>
            <li><strong>Exam attempts</strong> — the paper, CPL/ATPL track, score, correct and total counts, time taken, chapter
              breakdown and date. It does not store which answer you chose.</li>
            <li><strong>ADAPT results</strong> — the module, stanine/sten/band, headline percentage, the score breakdown, the
              input device for tracking, duration, a random session seed, and the date. It does not store questions, answer
              choices, tracking samples, per-event reaction times, or anything from the attitudes questionnaire beyond whether
              it was completed. The score breakdown does include aggregate figures such as per-family counts and median response
              times for the divided-attention task.</li>
          </ul>
          <p>Flagged questions, the Mistakes Bank and ADAPT history stay on the device; they are not mirrored. Gini&rsquo;s state
            stays in your browser or tab.</p>
          <p>Your email is also used in a faint watermark over study pages while you are signed in, so a leaked screenshot can
            be traced to the account. It is rendered from your session and is not a separate stored field.</p>
          <p>We use ADAPT score patterns to improve the practice tests. We do not sell or publish your individual results.</p>
        </Section>

        <Section title="The email updates list">
          <p>We add you to the updates list only if you submit the &ldquo;Notify Me&rdquo; form or tick the optional
            &ldquo;Email me new chapters and DGCA exam updates&rdquo; box when creating an account. We store your name, email
            address and which form you used in our <strong>leads</strong> table. We use it to send occasional updates about new
            notes, questions, mock tests and exam dates. We do not add account holders automatically.</p>
          <p>Reply to any update or message us on Telegram to be removed. We delete the row when you ask. We do not sell or rent
            the list.</p>
        </Section>

        <Section title="ADAPT anonymous practice counts">
          <p>When you finish an ADAPT module, the site sends one anonymous score line for that module unless you turn this off.
            It contains a random device ID stored in your browser, a session seed, the module, its stanine, one headline
            percentage, the input device for tracking, and whether the module was completed.</p>
          <p>It does not contain your account ID, email, questions, answers, tracking samples, per-event reaction times, or
            anything from the attitudes questionnaire. We use these rows to see how many students use ADAPT and how the modules
            score, so provisional grade bands can be replaced with real ones.</p>
          <p>The switch is on the ADAPT results screen. &ldquo;Turn it off&rdquo; stops new rows. Turning it off does not delete
            rows already sent. Because the device ID is random and is not linked to your account, we cannot usually identify a
            row as yours; if you can send us the random device ID from your browser, we can delete the rows for that ID.</p>
        </Section>

        <Section title="Gini, the on-site assistant">
          <p>What you type to Gini is sent to our server and may be sent to Google&rsquo;s Gemini service to choose the best
            stored answer. Our application does not write the conversation to a database. Google processes the question under
            its own terms. Your internet address is held briefly in memory only to stop one person flooding the service; it is
            not written to a database.</p>
          <p>Gini keeps only a visit count, a per-tab greeting/offer state and the last subject you asked about. Please do not
            type personal details to Gini.</p>
        </Section>

        <Section title="Visit statistics">
          <p>We count page visits with Vercel Web Analytics, which uses no advertising cookies and does not identify you by
            account. We see aggregate totals such as &ldquo;how many people opened this chapter&rdquo;, not who they were.
            Vercel processes this data on our behalf.</p>
        </Section>

        <Section title="When you message or comment (Telegram, Instagram, Facebook, WhatsApp, YouTube)">
          <p>If you message Ghost Aviator first, or comment on one of our YouTube videos or Instagram posts, we keep: your ID on
            that app, the name the app shows us, the messages or comments you send and our replies, and anything you choose to
            tell us, such as your exam, subjects or exam month.</p>
          <p><strong>Why:</strong> to answer you, to remember where your conversation left off, and to follow up about the
            classes you asked about. The Captain sees these conversations so he can reply personally.</p>
          <p><strong>Where:</strong> on Ghost Aviator&rsquo;s own computer. It is not sold, rented or shared with anyone else.
            The messaging app you used (Telegram or Meta) also keeps its own copy under its own policy.</p>
          <p><strong>Your choices:</strong> send <strong>stop</strong> and we stop follow-up messages. The daily practice
            question is sent only if you ask for it, and <strong>stop daily</strong> ends it.</p>
          <p>In a group, the assistant answers exam questions asked to the group. It does not keep a record of group members
            who only ask a question there.</p>
        </Section>

        <Section title="Payments">
          <p>Live-class fees are paid by UPI after your free demo. We never see your bank, card or UPI PIN details.
            If you send us a payment screenshot, the Captain uses it only to confirm your seat.</p>
          <p>Payments and refunds are governed by our <Link href="/terms" style={{ color: ACCENT }}>Terms</Link> and{" "}
            <Link href="/refund-policy" style={{ color: ACCENT }}>Refund &amp; Cancellation Policy</Link>.</p>
        </Section>

        <Section title="Cookies and local storage">
          <p>We do not use advertising or cross-site tracking cookies. Supabase keeps your session in browser storage so you
            stay signed in. The study tools use localStorage for the on-device data listed above. Vercel Web Analytics does not
            set advertising cookies.</p>
          <p>Clearing your browser data signs you out and deletes local-only data such as flags, the Mistakes Bank and ADAPT
            history. It does not delete rows already synced to your account; ask us to delete those.</p>
        </Section>

        <Section id="delete-your-data" title="Your choices and deleting your data">
          <p>You can use the site without an account, turn off ADAPT anonymous counts, unsubscribe from updates, and ask us to
            access, correct or delete your data. Message us on <a href={tg} style={{ color: ACCENT }}>Telegram</a> and we will
            reply in the same chat.</p>
          <p>To delete your account, send <strong>delete my data</strong> to our assistant in the same chat you used, or ask us
            on Telegram. We delete the account and its linked progress, exam-attempt and ADAPT rows within 30 days. If you also
            joined the updates list, ask us to remove that separately.</p>
          <p>If you are not satisfied with our answer, you can complain to the appropriate Indian data-protection authority.</p>
        </Section>

        <Section title="Students under 18">
          <p>If you are under 18, please involve a parent or guardian before you create an account, join the updates list or
            join a paid class.</p>
        </Section>

        <p className="text-sm mt-8" style={{ color: "#64748b" }}>
          If this page changes, the date at the top changes with it. <Link href="/" style={{ color: ACCENT }}>Back to Ghost Aviator</Link>
        </p>
      </div>
    </div>
  );
}
