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
const s=lines.findIndex(l=>/^1\.\s*ATMOSPHERE/i.test(l.text));
const e=lines.findIndex((l,i)=>i>s&&/^2\.\s*ATMOSPHERIC PRESSURE/i.test(l.text));
const L="abcdefgh"; let qs=[],cur=null;
for(const ln of lines.slice(s,e)){
  const qm=ln.text.match(/^0*(\d+)\)\s*(.*)$/); const om=ln.text.match(/^([a-dA-D])\)\s*(.*)$/);
  if(qm){if(cur)qs.push(cur);cur={num:+qm[1],q:qm[2],qFont:ln.font,opts:[]};}
  else if(om&&cur){cur.opts.push({t:om[2],font:ln.font});}
  else if(cur&&cur.opts.length===0){cur.q+=" "+ln.text;}
}
if(cur)qs.push(cur);
let amb=0;
for(const q of qs){
  const diff=q.opts.map((o,i)=>({i,d:o.font!==q.qFont})).filter(o=>o.d);
  q.ansIdx = diff.length===1?diff[0].i:-2; if(q.ansIdx<0)amb++;
}
console.log(`${qs.length} questions, ${amb} ambiguous`);
for(const q of qs){
  console.log(`Q${q.num}|${q.ansIdx>=0?L[q.ansIdx].toUpperCase():"??"}|${q.opts.map((o,i)=>`${L[i]}) ${o.t}`).join("  ")}`);
}
