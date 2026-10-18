"use client";

import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import {
  subscribe, getSnapshot, getServerSnapshot, connectReader, captureReadingSelection,
  clearReadingSelection, notesText, readingSections, speakText, stopReading,
  pauseReading, setReadingPreferences, chosenVoice,
} from "@/lib/read-aloud";

export default function ReadAloudControls() {
  const reader = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [expanded, setExpanded] = useState(false);
  const [section, setSection] = useState("");
  const id = useId();
  useEffect(() => connectReader(), []);
  const sections = useMemo(() => expanded ? readingSections() : [], [expanded]);
  const selected = reader.selection;
  const activeVoice = reader.voices.length ? chosenVoice() : null;
  const button = "px-3 py-2 min-h-10 rounded-lg text-xs font-semibold border border-white/20 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
  const preserve = (e: React.MouseEvent) => { captureReadingSelection(); e.preventDefault(); };

  return (
    <div data-ga-reader className="w-full min-w-0 text-slate-200">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={button} onClick={() => setExpanded(v => !v)} aria-expanded={expanded} aria-controls={id}>Read aloud</button>
        {reader.state === "playing" || reader.state === "paused" ? <>
          <button type="button" className={button} onClick={pauseReading}>{reader.state === "paused" ? "Resume reading" : "Pause reading"}</button>
          <button type="button" className={button} onClick={stopReading}>Stop reading</button>
        </> : null}
        {selected && <button type="button" className={button} onMouseDown={preserve} onClick={() => { speakText(selected, "Selected text"); setExpanded(true); }}>Read selected text</button>}
      </div>
      {expanded && (
        <div id={id} className="mt-3 p-4 rounded-xl border border-white/15 bg-[#101a24] space-y-3 text-sm">
          <p className="text-xs text-slate-300">Read the notes, choose a section, or highlight a passage to listen to just that text.</p>
          {reader.state === "unsupported" ? <p role="status">Read aloud is not available in this browser.</p> : <>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={button} disabled={!sections.length} onClick={() => speakText(notesText(), "Chapter notes")}>Read notes only</button>
              <button type="button" className={button} disabled={!selected} onMouseDown={preserve} onClick={() => speakText(selected, "Selected text")}>Read selected text only</button>
              {selected && <button type="button" className={button} onClick={clearReadingSelection}>Clear selection</button>}
            </div>
            {selected && <p className="text-xs text-emerald-200">Selected passage ready: {selected.split(/\s+/).length} words.</p>}
            {sections.length > 0 && <div className="flex flex-wrap gap-2 items-end">
              <label className="flex-1 min-w-0 text-xs">Notes section
                <select className="block w-full max-w-full mt-1 p-2 rounded-lg bg-[#172532] text-white border border-white/20" value={section} onChange={e => setSection(e.target.value)}>
                  <option value="">Choose a section</option>
                  {sections.map(s => <option key={s.index} value={String(s.index)}>{s.title}</option>)}
                </select>
              </label>
              <button type="button" className={button} disabled={section === "" || !sections[Number(section)]} onClick={() => {
                const s = sections[Number(section)];
                if (s) speakText(`${s.title}. ${s.text}`, s.title);
              }}>Read section</button>
            </div>}
            <label className="block text-xs">Reading voice
              <select className="block w-full max-w-full mt-1 p-2 rounded-lg bg-[#172532] text-white border border-white/20" value={reader.voiceURI} onChange={e => setReadingPreferences({ voiceURI: e.target.value })}>
                <option value="">Automatic — prefer a natural female voice</option>
                {reader.voices.map(v => <option key={v.voiceURI} value={v.voiceURI}>{v.name} ({v.lang})</option>)}
              </select>
            </label>
            <p className="text-xs text-slate-300">{activeVoice ? `Using ${activeVoice.name}. ` : "Using your device’s available voice. "}Preview and choose the voice you find most comfortable.</p>
            <div className="flex flex-wrap items-end gap-2">
              <button type="button" className={button} onClick={() => speakText("Hello. Let's take this one step at a time. Choose a passage, and we'll work through it together.", "Voice preview")}>Preview voice</button>
              <label className="text-xs">Reading speed
                <select className="block mt-1 p-2 rounded-lg bg-[#172532] text-white border border-white/20" value={reader.rate} onChange={e => setReadingPreferences({ rate: Number(e.target.value) })}>
                  <option value={0.8}>Slower · 0.8×</option><option value={0.95}>Gentle · 0.95×</option><option value={1}>Normal · 1×</option><option value={1.15}>Faster · 1.15×</option>
                </select>
              </label>
            </div>
          </>}
          <p role="status" aria-live="polite" className="text-xs text-emerald-200 min-h-4">{reader.message || (reader.state === "playing" || reader.state === "paused" ? `${reader.state === "paused" ? "Paused" : "Reading"}: ${reader.label} · ${reader.progress} of ${reader.total}` : "Audio starts only when you ask.")}</p>
        </div>
      )}
    </div>
  );
}
