import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { XMLValidator } from 'fast-xml-parser';

const root=process.cwd();
const native=JSON.parse(fs.readFileSync('tools/diagrams/inline-manifest.json','utf8'));
const flows=JSON.parse(fs.readFileSync('tools/diagrams/manifest.json','utf8'));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file,'utf8').replaceAll('\r\n','\n')).digest('hex');
const escape=text=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#x27;');
const notes=new Map();
for(const item of [...native,...flows]){
 assert.ok(item.labels.length>0&&item.labels.every(label=>label.trim()),'Review empty diagram transcript: '+item.image);
 const image=path.join('public',item.image);
 const svg=fs.readFileSync(image,'utf8');
 assert.equal(XMLValidator.validate(svg),true,'Invalid SVG: '+item.image);
 assert.doesNotMatch(svg,/<(?:foreignObject|script|iframe)\b|\bon\w+\s*=/i,'Diagram must contain static SVG only: '+item.image);
 assert.doesNotMatch(svg,/(?:href|src)=["'](?:https?:|\/\/)|url\(\s*["']?https?:/i,'External diagram dependency: '+item.image);
 assert.equal(hash(image),item.svgSha256,'Re-render and review changed diagram: '+item.image);
 assert.equal(Number(/<svg\b[^>]*\bwidth=["']([\d.]+)["']/i.exec(svg)?.[1]),item.width,'SVG width differs from reserved space: '+item.image);
 assert.equal(Number(/<svg\b[^>]*\bheight=["']([\d.]+)["']/i.exec(svg)?.[1]),item.height,'SVG height differs from reserved space: '+item.image);
 if(item.stylesheet){
  assert.equal(hash(item.source),item.sourceSha256,'Review changed native source: '+item.source);
  assert.equal(hash(item.stylesheet),item.stylesheetSha256,'Review changed diagram stylesheet: '+item.stylesheet);
 }
 const file=item.notes||path.join('public',path.dirname(path.dirname(item.image)),'notes.html');
 if(!notes.has(file))notes.set(file,fs.readFileSync(file,'utf8'));
 const html=notes.get(file);
 const figures=[...html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/g)];
 const pairs=figures.filter(m=>m[0].includes(`src="/${item.image}"`));
 assert.equal(pairs.length,1,'Missing or duplicate diagram reference: '+item.image);
 const pair=pairs[0][0];
 const img=[...pair.matchAll(/<img\b[^>]*>/g)].find(m=>m[0].includes(`src="/${item.image}"`))?.[0]||'';
 assert.equal((img.match(/\bdecoding=/g)||[]).length,1,'Use one decoding attribute: '+item.image);
 assert.ok(pair.includes(`width="${item.width}"`)&&pair.includes(`height="${item.height}"`),'Reserve diagram dimensions: '+item.image);
 assert.ok(pair.includes(`href="/${item.image}"`),'Missing full-size view: '+item.image);
 assert.ok(pair.includes('Scroll sideways if needed'),'Missing wide-diagram affordance: '+item.image);
 assert.ok(pair.includes('<summary>Read diagram labels</summary>'),'Missing readable labels: '+item.image);
 for(const label of item.labels)assert.ok(pair.includes(escape(label)),'Diagram transcript differs: '+item.image+' / '+label);
}
// An unregistered inline diagram inherits the page's typography and shares IDs
// with other drawings. Decorative cover SVGs stay in their original locations.
function inventory(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())inventory(file);else if(e.name==='notes.html'&&!notes.has(file))notes.set(file,fs.readFileSync(file,'utf8'));}}
inventory('public/content');
for(const file of notes.keys()){
 const raw=notes.get(file);
 const body=/<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(raw)?.[1]||'';
 const clean=body.replace(/<(?:style|script)\b[^>]*>[\s\S]*?<\/(?:style|script)>/gi,'').replace(/<!--[\s\S]*?-->/g,'');
 for(const svg of clean.matchAll(/<svg\b[^>]*>/gi))assert.match(svg[0],/class=["'][^"']*\bcover-icon-svg\b/,'Unisolated teaching SVG in '+file);
}
const met=fs.readFileSync('public/content/meteorology/met-1/notes.html','utf8');
const bank=fs.readFileSync('lib/generated/icjoshi-notes-met.ts','utf8');
const oldGuarantee=/maximum height clouds can reach|All weather, turbulence, cloud formations are below it|plan for weather-free cruising altitudes/;
assert.doesNotMatch(met,oldGuarantee,'Restore the source-backed tropopause correction in notes.');
assert.doesNotMatch(bank,oldGuarantee,'Restore the source-backed tropopause correction in quiz explanations.');
assert.doesNotMatch(met,/src=["'][^"']*fig-9340e03143eccec7\.jpg/,'Restore the reviewed dry-air composition diagram.');
assert.match(met,/0\.042%/,'Retain the source-backed composition clarification.');
assert.match(bank,/historical rounded value of 0\.03%/,'Keep the legacy quiz option distinct from a modern measurement.');
console.log(`Checked ${native.length} isolated native diagrams and ${flows.length} pure-text flowcharts, dimensions, transcripts and the linked weather clarification.`);
