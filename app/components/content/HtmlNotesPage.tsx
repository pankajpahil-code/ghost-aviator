"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronRight, ChevronLeft, ListChecks, Volume2, Pause, Square } from "lucide-react";
import type { Subject, Chapter } from "@/lib/subjects";
import Watermark from "@/app/components/Watermark";
import LiveClassUpsell from "@/app/components/LiveClassUpsell";
import VideoLectureCard from "@/app/components/content/VideoLectureCard";
import type { ChapterVideo } from "@/lib/chapter-videos";

type Props = {
  track: "cpl" | "atpl";
  subject: Subject;
  chapter: Chapter;
  prevChapter: Chapter | null;
  nextChapter: Chapter | null;
  src: string;
  /** The Captain's lecture(s) for this chapter — card renders above the notes when non-empty. */
  videos?: ChapterVideo[];
};

type SpeechState = "idle" | "playing" | "paused" | "unsupported";

// Voice quality is entirely the OS/browser's — this only picks the BEST of
// whatever is actually installed. Cloud-backed "Online"/"Natural"/"Neural"
// voices (Edge, and Android Chrome's Google voices) sound genuinely human;
// offline SAPI-style voices (the Windows/Chrome default) sound robotic no
// matter how this is tuned. localService === false is the closest signal
// the Web Speech API exposes for "this is cloud-backed, not the flat local one".
function scoreVoice(v: SpeechSynthesisVoice): number {
  let score = 0;
  if (v.lang === "en-IN") score += 100;
  else if (v.lang?.startsWith("en-IN")) score += 70;
  else if (v.lang?.startsWith("en")) score += 20;
  if (/online|natural|neural/i.test(v.name)) score += 50;
  if (/google/i.test(v.name)) score += 25;
  if (v.localService === false) score += 20;
  return score;
}

function rankedVoices(): SpeechSynthesisVoice[] {
  return [...window.speechSynthesis.getVoices()]
    .filter(v => v.lang?.startsWith("en"))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

// Splits into sentence-sized chunks and speaks them as a queue rather than
// one giant utterance — most engines keep pitch/pacing more natural across
// shorter utterances than they do droning through one huge block.
function splitIntoChunks(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

// Reads the notes aloud with browser speechSynthesis. The notes live in a
// same-origin iframe, so the text is read straight from its contentDocument
// and spoken — never rendered as a visible transcript or otherwise exposed,
// so this adds no new copy/export surface.
function useReadAloud(iframeRef: React.RefObject<HTMLIFrameElement | null>) {
  const [state, setState] = useState<SpeechState>("idle");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState<string>("");
  const queueRef = useRef<string[]>([]);
  const queueIndexRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      // speechSynthesis support is a browser fact unknowable during SSR, so it
      // can only be detected after mount — computing it during render would
      // desync the server HTML from the client's first render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState("unsupported");
      return;
    }
    const refresh = () => {
      const ranked = rankedVoices();
      setVoices(ranked);
      setVoiceURI(v => v || ranked[0]?.voiceURI || "");
    };
    refresh();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", refresh);
      window.speechSynthesis.cancel();
    };
  }, []);

  function extractText(): string {
    try {
      const doc = iframeRef.current?.contentDocument;
      const body = doc?.body?.cloneNode(true) as HTMLElement | undefined;
      if (!body) return "";
      body.querySelectorAll("script, style").forEach(el => el.remove());
      return body.innerText.replace(/\s+/g, " ").trim();
    } catch {
      return ""; // not yet loaded
    }
  }

  function speakNext() {
    const synth = window.speechSynthesis;
    const i = queueIndexRef.current;
    if (i >= queueRef.current.length) { setState("idle"); return; }
    const utter = new SpeechSynthesisUtterance(queueRef.current[i]);
    const voice = voices.find(v => v.voiceURI === voiceURI) ?? voices[0];
    if (voice) { utter.voice = voice; utter.lang = voice.lang; } else { utter.lang = "en-IN"; }
    utter.rate = 0.93;
    utter.pitch = 1.0;
    utter.onend = () => { queueIndexRef.current += 1; speakNext(); };
    utter.onerror = () => setState("idle");
    synth.speak(utter);
  }

  function toggle() {
    if (state === "unsupported") return;
    const synth = window.speechSynthesis;
    if (state === "playing") { synth.pause(); setState("paused"); return; }
    if (state === "paused") { synth.resume(); setState("playing"); return; }
    const text = extractText();
    if (!text) return;
    synth.cancel();
    queueRef.current = splitIntoChunks(text);
    queueIndexRef.current = 0;
    setState("playing");
    speakNext();
  }

  function stop() {
    window.speechSynthesis?.cancel();
    queueRef.current = [];
    setState("idle");
  }

  return { state, toggle, stop, voices, voiceURI, setVoiceURI };
}

export default function HtmlNotesPage({ track, subject, chapter, prevChapter, nextChapter, src, videos }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { state: speechState, toggle: toggleListen, stop: stopListen, voices, voiceURI, setVoiceURI } = useReadAloud(iframeRef);

  return (
    <div style={{ background: "#06040e" }} className="min-h-screen flex flex-col">
      <Watermark />

      {/* Header */}
      <div className="relative flex-shrink-0" style={{ borderBottom: `1px solid ${subject.color}25` }}>
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${subject.color}12 0%, transparent 65%)` }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">

          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs mb-4 flex-wrap" style={{ color: "#475569" }}>
            <Link href="/" className="no-underline hover:text-white transition-colors" style={{ color: "#475569" }}>Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${track}`} className="no-underline hover:text-white transition-colors uppercase" style={{ color: "#475569" }}>{track}</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/${track}/${subject.id}`} className="no-underline hover:text-white transition-colors" style={{ color: "#475569" }}>{subject.shortName}</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: "#94a3b8" }}>Ch.{chapter.number} — Notes</span>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black flex-shrink-0"
                   style={{ background: `${subject.color}20`, border: `1px solid ${subject.color}40`, color: subject.color }}>
                {chapter.number}
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest mb-0.5"
                     style={{ color: subject.color, letterSpacing: "0.18em" }}>
                  {subject.shortName.toUpperCase()} — CHAPTER {chapter.number} · NOTES
                </div>
                <h1 className="text-xl font-black text-white">{chapter.title}</h1>
                <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>by Capt. Pankaj Pahil</p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {speechState !== "unsupported" && (
                <>
                  <button onClick={toggleListen}
                          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer border-0"
                          style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff" }}>
                    {speechState === "playing"
                      ? <><Pause className="w-3.5 h-3.5" /> Pause</>
                      : speechState === "paused"
                        ? <><Volume2 className="w-3.5 h-3.5" /> Resume</>
                        : <><Volume2 className="w-3.5 h-3.5" /> Listen</>}
                  </button>
                  {speechState !== "idle" && (
                    <button onClick={stopListen}
                            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg cursor-pointer border-0"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8" }}>
                      <Square className="w-3.5 h-3.5" /> Stop
                    </button>
                  )}
                  {voices.length > 1 && (
                    <select value={voiceURI} onChange={e => setVoiceURI(e.target.value)}
                            title="Voice quality depends on what's installed on your device — pick the best-sounding one"
                            className="text-xs font-medium px-2 py-2 rounded-lg cursor-pointer"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#64748b", maxWidth: "9rem" }}>
                      {voices.map(v => (
                        <option key={v.voiceURI} value={v.voiceURI} style={{ background: "#0f081e", color: "#fff" }}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  )}
                </>
              )}
              {chapter.content.find(c => c.type === "chapter-quiz")?.available && (
                <Link href={`/${track}/${subject.id}/${chapter.id}/chapter-quiz`}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg no-underline"
                      style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.3)", color: "#f97316" }}>
                  <ListChecks className="w-3.5 h-3.5" /> Chapter Quiz
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notes iframe */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4">
        {videos && videos.length > 0 && (
          <VideoLectureCard videos={videos} title={chapter.title} color={subject.color} />
        )}
        <div className="rounded-2xl overflow-hidden"
             style={{ border: `1px solid ${subject.color}20`, minHeight: "80vh" }}>
          <iframe
            ref={iframeRef}
            src={src}
            className="w-full"
            style={{ minHeight: "80vh", height: "80vh", border: "none", background: "#f8f9fc" }}
            title={`${chapter.title} — Notes`}
          />
        </div>

        <LiveClassUpsell subjectId={subject.id} subjectColor={subject.color} />

        {/* Chapter navigation */}
        <div className="flex items-center justify-between gap-4 mt-2 mb-6">
          {prevChapter ? (
            <Link href={`/${track}/${subject.id}/${prevChapter.id}/notes`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl no-underline min-w-0"
                  style={{ background: "rgba(15,8,30,0.95)", border: "1px solid rgba(255,255,255,0.08)", color: "#94a3b8" }}>
              <ChevronLeft className="w-4 h-4 flex-shrink-0" />
              <div className="text-left min-w-0">
                <div className="text-xs" style={{ color: "#475569" }}>Previous</div>
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
                <div className="text-xs" style={{ color: "#475569" }}>Next</div>
                <div className="text-sm font-semibold truncate">Ch.{nextChapter.number}: {nextChapter.title}</div>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" />
            </Link>
          ) : <div />}
        </div>

        {/* Related Topics & Interlinking Hub */}
        <div className="mt-8 pt-8 border-t border-white/10 space-y-6 mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Reinforce Chapter {chapter.number}: {chapter.title}</h3>
              <p className="text-xs text-slate-400">Test your knowledge and practice actual exam questions for {subject.name}.</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link href={`/${track}/${subject.id}/${chapter.id}/chapter-quiz`}
                    className="px-3 py-2 rounded-lg text-xs font-bold no-underline bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all">
                Chapter Quiz
              </Link>
              <Link href={`/question-bank`}
                    className="px-3 py-2 rounded-lg text-xs font-bold no-underline bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all">
                Question Bank
              </Link>
              <Link href={`/past-papers`}
                    className="px-3 py-2 rounded-lg text-xs font-bold no-underline bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 transition-all">
                Past Papers
              </Link>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-white mb-1">Planning your Pilot Training in 2026?</div>
              <div className="text-xs text-slate-400">Calculate exact flying hours, DGCA exam fees, and living costs with our interactive calculator.</div>
            </div>
            <Link href="/cpl-cost-calculator" className="px-4 py-2 rounded-lg text-xs font-bold text-sky-400 border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 no-underline whitespace-nowrap transition-all">
              CPL Cost Calculator →
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
