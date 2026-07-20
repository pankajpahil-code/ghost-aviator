// Ghost Tower VoiceBank — client-side ATC voice.
// Loads pre-rendered neural Indian-English fragments (already band-limited to
// the VHF band) and stitches them into any transmission the DialogueDirector
// produces. Carrier hiss and squelch run LIVE underneath the whole utterance,
// so fragment seams sit inside one continuous radio carrier — which is exactly
// how real concatenated ATIS/VOLMET sounds.
//
// Falls back to browser speechSynthesis if the bank can't load or a fragment
// is missing, so the simulator is never left mute.

import { segmentLine, fragmentId } from "./segment.mjs";

const BASE = "/rtr-voice";

type Manifest = { voice: string; count: number; fragments: Record<string, number> };

export class VoiceBank {
  private manifest: Manifest | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private loading: Promise<boolean> | null = null;
  private playing: AudioBufferSourceNode[] = [];
  private failed = false;

  /** True once the manifest is loaded and the bank is usable. */
  get ready() { return !!this.manifest && !this.failed; }
  get voice() { return this.manifest?.voice ?? ""; }

  /** Fetch the manifest once. Safe to call repeatedly. */
  load(): Promise<boolean> {
    if (this.manifest) return Promise.resolve(true);
    if (this.failed) return Promise.resolve(false);
    if (this.loading) return this.loading;
    this.loading = fetch(`${BASE}/manifest.json`)
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((m: Manifest) => {
        if (!m?.fragments || !Object.keys(m.fragments).length) throw new Error("empty manifest");
        this.manifest = m;
        return true;
      })
      .catch(() => { this.failed = true; return false; });
    return this.loading;
  }

  /** Every fragment this line needs must exist, or we defer to the fallback. */
  canSpeak(text: string): boolean {
    if (!this.manifest) return false;
    const segs = segmentLine(text);
    if (!segs.length) return false;
    return segs.every(s => this.manifest!.fragments[fragmentId(s)] !== undefined);
  }

  private async fetchBuffer(ctx: AudioContext, id: string): Promise<AudioBuffer | null> {
    const hit = this.buffers.get(id);
    if (hit) return hit;
    try {
      const res = await fetch(`${BASE}/${id}.mp3`);
      if (!res.ok) return null;
      const buf = await ctx.decodeAudioData(await res.arrayBuffer());
      this.buffers.set(id, buf);
      return buf;
    } catch {
      return null;
    }
  }

  /**
   * Speak one transmission. Resolves when playback finishes (or immediately
   * false if the bank can't cover it — caller should then use its fallback).
   * `onCarrier` lets the caller run squelch/hiss for the transmission's life.
   */
  async speak(
    ctx: AudioContext,
    text: string,
    onCarrier?: { open(): void; close(): void },
  ): Promise<boolean> {
    if (!this.manifest) return false;
    const segs = segmentLine(text);
    const ids = segs.map(fragmentId);
    if (!segs.length || !ids.every(id => this.manifest!.fragments[id] !== undefined)) return false;

    // Prefetch every fragment BEFORE playing — a mid-line network stall would
    // otherwise chop the transmission in half.
    const bufs = await Promise.all(ids.map(id => this.fetchBuffer(ctx, id)));
    if (bufs.some(b => !b)) return false;

    this.stop();
    await ctx.resume().catch(() => {});

    const gain = ctx.createGain();
    gain.gain.value = 1;
    gain.connect(ctx.destination);

    // Natural radio cadence: tight between spelled/counted atoms, a beat more
    // around phrases.
    const LEAD = 0.06;
    let cursor = ctx.currentTime + LEAD;
    onCarrier?.open();

    for (let i = 0; i < bufs.length; i++) {
      const buf = bufs[i]!;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(gain);
      src.start(cursor);
      this.playing.push(src);
      const nextIsAtom = segs[i + 1]?.type === "atom";
      const bothAtoms = segs[i].type === "atom" && nextIsAtom;
      cursor += buf.duration + (bothAtoms ? 0.012 : 0.075);
    }

    const endsAt = cursor;
    const waitMs = Math.max(0, (endsAt - ctx.currentTime) * 1000);
    await new Promise<void>(res => setTimeout(res, waitMs));
    onCarrier?.close();
    this.playing = [];
    return true;
  }

  stop() {
    for (const s of this.playing) { try { s.stop(); } catch { /* already ended */ } }
    this.playing = [];
  }
}

export const voiceBank = new VoiceBank();
