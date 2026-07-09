#!/usr/bin/env node
/**
 * Strip Mermaid CDN references from radio-navigation notes and convert
 * mermaid diagrams to static HTML.
 */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const BASE = join(import.meta.dirname, "..", "public", "content", "radio-navigation");

const MERMAID_REPLACEMENTS = {
  "rnav-1": [
    {
      // Frequency spectrum flowchart
      replacement: `<div class="diagram-box" style="overflow-x:auto;">
<table class="data-table" style="width:100%;text-align:center;">
<tr>
<td style="background:#e3f2fd;padding:10px;font-weight:700;">3 kHz<br><small>VLF</small></td>
<td style="font-size:1.3em;">→</td>
<td style="background:#e8f5e9;padding:10px;font-weight:700;">30 kHz<br><small>LF</small></td>
<td style="font-size:1.3em;">→</td>
<td style="background:#fff9c4;padding:10px;font-weight:700;">300 kHz<br><small>MF</small></td>
<td style="font-size:1.3em;">→</td>
<td style="background:#fce4ec;padding:10px;font-weight:700;">3 MHz<br><small>HF</small></td>
<td style="font-size:1.3em;">→</td>
<td style="background:#f3e5f5;padding:10px;font-weight:700;">30 MHz<br><small>VHF</small></td>
<td style="font-size:1.3em;">→</td>
<td style="background:#e0f7fa;padding:10px;font-weight:700;">300 MHz<br><small>UHF</small></td>
<td style="font-size:1.3em;">→</td>
<td style="background:#fbe9e7;padding:10px;font-weight:700;">3 GHz<br><small>SHF</small></td>
<td style="font-size:1.3em;">→</td>
<td style="padding:10px;font-weight:700;">30 GHz<br><small>EHF</small></td>
<td style="font-size:1.3em;">→</td>
<td style="padding:10px;font-weight:700;">300 GHz</td>
</tr>
</table>
</div>`,
    },
  ],
  "rnav-2": [
    {
      // Propagation types flowchart
      replacement: `<div class="diagram-box">
<div style="text-align:center;font-weight:900;font-size:1.1em;margin-bottom:12px;">PROPAGATION</div>
<div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap;">
<div style="flex:1;min-width:200px;border:2px solid #1976d2;border-radius:10px;padding:14px;">
<div style="font-weight:800;color:#1976d2;margin-bottom:8px;text-align:center;">NON-IONOSPHERIC</div>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
<div style="flex:1;background:#e3f2fd;padding:10px;border-radius:8px;min-width:140px;"><strong>Surface Wave</strong><br>20 kHz – 50 MHz<br><small>(Used: 20 kHz – 2 MHz)</small></div>
<div style="flex:1;background:#e8f5e9;padding:10px;border-radius:8px;min-width:140px;"><strong>Space Wave</strong><br>&gt; 50 MHz (VHF+)</div>
</div>
</div>
<div style="flex:1;min-width:200px;border:2px solid #e65100;border-radius:10px;padding:14px;">
<div style="font-weight:800;color:#e65100;margin-bottom:8px;text-align:center;">IONOSPHERIC</div>
<div style="display:flex;gap:10px;flex-wrap:wrap;">
<div style="flex:1;background:#fff3e0;padding:10px;border-radius:8px;min-width:140px;"><strong>Sky Wave</strong><br>20 kHz – 50 MHz<br><small>(Used: 2 – 30 MHz / HF)</small></div>
<div style="flex:1;background:#f3e5f5;padding:10px;border-radius:8px;min-width:140px;"><strong>SatComm / Direct Wave</strong><br><small>(UHF, SHF)</small></div>
</div>
</div>
</div>
</div>`,
    },
    {
      // Refraction types flowchart
      replacement: `<div class="diagram-box">
<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;text-align:center;">
<div style="flex:1;min-width:160px;padding:14px;border-radius:10px;border:2px solid #999;">
<strong>Normal Refraction</strong><br><small>(Standard LOS Range)</small>
</div>
<div style="flex:1;min-width:160px;background:#e8f5e9;padding:14px;border-radius:10px;border:2px solid #4caf50;">
<strong>Super-refraction</strong><br>Range +40%<br><small>High pressure · Warm/dry over cool/moist · Duct possible</small>
</div>
<div style="flex:1;min-width:160px;background:#fdecea;padding:14px;border-radius:10px;border:2px solid #e53935;">
<strong>Sub-refraction</strong><br>Range −20%<br><small>Low pressure · Cold over warm · High lapse rate</small>
</div>
</div>
</div>`,
    },
  ],
  "rnav-5": [
    {
      // Doppler beams flowchart
      replacement: `<div class="diagram-box">
<div style="text-align:center;font-weight:900;font-size:1.1em;margin-bottom:12px;">4 Janus Beams (Ground reflections)</div>
<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;text-align:center;">
<div style="flex:1;min-width:160px;background:#e3f2fd;padding:14px;border-radius:10px;">
<strong>Forward Beams</strong><br><small>f received &gt; f transmitted<br>(+ve Doppler)</small>
</div>
<div style="flex:1;min-width:160px;background:#fff3e0;padding:14px;border-radius:10px;">
<strong>Aft Beams</strong><br><small>f received &lt; f transmitted<br>(−ve Doppler)</small>
</div>
<div style="flex:1;min-width:160px;background:#f3e5f5;padding:14px;border-radius:10px;">
<strong>Port/Stbd Difference</strong>
</div>
</div>
<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;text-align:center;margin-top:12px;">
<div style="background:#e8f5e9;padding:12px 20px;border-radius:8px;"><strong>Ground Speed</strong><br><small>∝ magnitude of shift</small></div>
<div style="background:#fce4ec;padding:12px 20px;border-radius:8px;"><strong>Drift</strong><br><small>∝ port vs starboard difference</small></div>
</div>
<div style="text-align:center;margin-top:10px;font-weight:700;">↓ Navigation Computer: Position = f(GS, Drift, Heading)</div>
</div>`,
    },
  ],
  "rnav-6": [
    {
      // VDF Q-codes flowchart
      replacement: `<div class="diagram-box">
<div style="text-align:center;margin-bottom:14px;font-weight:900;font-size:1.05em;">VDF Q-Codes — Aircraft ↔ Station</div>
<div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;text-align:center;">
<div style="flex:1;min-width:180px;background:#e3f2fd;padding:14px;border-radius:10px;">
<strong>QDM</strong><br><small>Mag heading <strong>TO</strong> station</small><br>Aircraft → Station
</div>
<div style="flex:1;min-width:180px;background:#fff3e0;padding:14px;border-radius:10px;">
<strong>QDR</strong><br><small>Mag bearing <strong>FROM</strong> station</small><br>Station → Aircraft<br><small>(reciprocal of QDM)</small>
</div>
<div style="flex:1;min-width:180px;background:#e8f5e9;padding:14px;border-radius:10px;">
<strong>QTE</strong><br><small>True bearing <strong>FROM</strong> station</small><br>Station → Aircraft
</div>
<div style="flex:1;min-width:180px;background:#f3e5f5;padding:14px;border-radius:10px;">
<strong>QUJ</strong><br><small>True track <strong>TO</strong> station</small><br>Aircraft → Station<br><small>(reciprocal of QTE)</small>
</div>
</div>
</div>`,
    },
  ],
};

let totalFixed = 0;

for (const dir of readdirSync(BASE)) {
  if (!dir.startsWith("rnav-")) continue;
  const fpath = join(BASE, dir, "notes.html");
  let html;
  try { html = readFileSync(fpath, "utf8"); } catch { continue; }
  const origLen = html.length;

  // 1. Strip mermaid CDN script tags (import + initialize)
  html = html.replace(/<script[^>]*type\s*=\s*["']module["'][^>]*>[\s\S]*?import\s+mermaid\s+from\s+['"]https:\/\/cdn[^'"]*['"][\s\S]*?<\/script>/gi, "");

  // 2. Strip any remaining mermaid script references
  html = html.replace(/<script[^>]*src\s*=\s*["'][^"']*mermaid[^"']*["'][^>]*><\/script>/gi, "");

  // 3. Remove mermaid CSS rules (pre.mermaid { ... })
  html = html.replace(/pre\.mermaid\s*\{[^}]*\}/g, "");

  // 4. Replace mermaid diagrams with static HTML
  const replacements = MERMAID_REPLACEMENTS[dir];
  if (replacements) {
    let idx = 0;
    html = html.replace(/<pre\s+class="mermaid"[^>]*>[\s\S]*?<\/pre>/g, () => {
      const r = replacements[idx];
      idx++;
      return r ? r.replacement : "<!-- mermaid diagram removed -->";
    });
  }

  if (html.length !== origLen) {
    writeFileSync(fpath, html);
    totalFixed++;
    console.log(`✓ ${dir}: fixed (${origLen} → ${html.length})`);
  }
}

console.log(`\nDone. Fixed ${totalFixed} files.`);
