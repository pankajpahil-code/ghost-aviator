// Dump the whole IC Joshi QB to JSON: chapters → questions → {opts, bookAns}.
// bookAns via the per-question "option font differs from question font" rule
// (a hint only; every answer is independently verified against CAE + physics).
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import fs from "node:fs";
const file = "C:/Users/Admin/Downloads/Telegram Desktop/Met QB ic Joshi.pdf";
const data = new Uint8Array(fs.readFileSync(file));
const pdf = await getDocument({ data, useSystemFonts: true }).promise;
let lines=[];
for (let p=1;p<=pdf.numPages;p++){
  const page=await pdf.getPage(p); const tc=await page.getTextContent();
  const rows={};
  for(const it of tc.items){ if(!it.str)continue; const y=Math.round(it.transform[5]); (rows[y]??=[]).push({x:it.transform[4],s:it.str,f:it.fontName}); }
  for(const y of Object.keys(rows).map(Number).sort((a,b)=>b-a)){
    const items=rows[y].sort((a,b)=>a.x-b.x);
    const text=items.map(i=>i.s).join(" ").replace(/\s+/g," ").trim(); if(!text)continue;
    const fc={}; for(const i of items)fc[i.f]=(fc[i.f]||0)+i.s.length;
    const font=Object.entries(fc).sort((a,b)=>b[1]-a[1])[0][0];
    lines.push({text,font});
  }
}
const chapters={}; let curCh=null,cur=null;
const flush=()=>{ if(cur&&curCh){ (chapters[curCh]??=[]).push(cur); cur=null; } };
for(const ln of lines){
  const ch=ln.text.match(/^(\d+)\.\s+([A-Z][A-Z ,()\/]+)$/);
  const qm=ln.text.match(/^0*(\d+)\)\s*(.*)$/);
  const om=ln.text.match(/^([a-dA-D])\)\s*(.*)$/);
  if(ch && ln.text===ch[0] && ch[2].length>3){ flush(); curCh=`${+ch[1]}. ${ch[2].trim()}`; }
  else if(qm){ flush(); cur={num:+qm[1],q:qm[2],qFont:ln.font,opts:[]}; }
  else if(om&&cur){ cur.opts.push({t:om[2],font:ln.font}); }
  else if(cur&&cur.opts.length===0){ cur.q+=" "+ln.text; }
}
flush();
for(const c of Object.keys(chapters)) for(const q of chapters[c]){
  const diff=q.opts.map((o,i)=>({i,d:o.font!==q.qFont})).filter(o=>o.d);
  q.bookAns = diff.length===1?diff[0].i:-1;
  q.opts=q.opts.map(o=>o.t); delete q.qFont;
}
fs.writeFileSync("tools/met-verify/icjoshi-qb.json", JSON.stringify(chapters,null,1));
console.log("chapters extracted:");
for(const[c,arr]of Object.entries(chapters)) console.log(`  ${c.padEnd(45)} ${arr.length} Q (${arr.filter(q=>q.bookAns>=0).length} auto-marked)`);
