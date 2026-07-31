import fs from "node:fs";
const src = fs.readFileSync("lib/rk-bali-regulations-questions.ts", "utf8");
const items = [];
const re = /\{\s*subjectIds:\s*\[([^\]]*)\],\s*chapterId:\s*"([^"]*)",\s*q:\s*`([\s\S]*?)`,\s*opts:\s*\[([\s\S]*?)\],\s*ans:\s*(\d+),\s*exp:\s*`([\s\S]*?)`,?\s*\}/g;
let m;
while ((m = re.exec(src))) {
  const opts = [...m[4].matchAll(/`([\s\S]*?)`/g)].map(x => x[1]);
  items.push({ chapterId: m[2], q: m[3].trim(), opts, ans: Number(m[5]) });
}

const numPrefix = items.filter(i => /^Q\s*\.?\s*\d+\s*[.)]/i.test(i.q));
const placeholderOpt = items.filter(i => i.opts.some(o => /^\(no option|^n\/?a$|^-+$/i.test(o.trim())));
// An option that ends mid-sentence, or a stem that ends with a colon inside an option,
// is the signature of the parser splitting one sentence across stem and options.
const truncatedOpt = items.filter(i => i.opts.some(o => /[,;]$|\b(the|of|and|or|is|are|receive|with|to|for|in|a|an)$/i.test(o.trim())));
const stemInOption = items.filter(i => i.opts.some(o => /\bIt is:\s*$|\?\s*$|:\s*$/.test(o.trim())));
const shortStem = items.filter(i => i.q.trim().length < 25);

const pct = n => `${n} (${(n / items.length * 100).toFixed(1)}%)`;
console.log(`total: ${items.length}`);
console.log(`question-number prefix leaked into stem ("Q45."):   ${pct(numPrefix.length)}`);
console.log(`placeholder option text ("(no option d)"):          ${pct(placeholderOpt.length)}`);
console.log(`option ends mid-sentence (parser split signature):  ${pct(truncatedOpt.length)}`);
console.log(`option ends in ':' or 'It is:' (stem bled in):      ${pct(stemInOption.length)}`);
console.log(`suspiciously short stem (<25 chars):                ${pct(shortStem.length)}`);

console.log(`\n-- examples of placeholder options --`);
placeholderOpt.slice(0, 5).forEach(i => console.log(`   ${i.chapterId}: ${i.q.slice(0, 60)} | opts: ${JSON.stringify(i.opts)}`));
console.log(`\n-- examples of stem bleeding into an option --`);
stemInOption.slice(0, 5).forEach(i => console.log(`   ${i.chapterId}: ${i.q.slice(0, 70)} || A="${i.opts[0]}"`));
