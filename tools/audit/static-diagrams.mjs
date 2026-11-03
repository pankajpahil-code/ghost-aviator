import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import assert from "node:assert/strict";

const root = process.cwd();
const publicRoot = path.join(root, "public");
const withheld = new Set(Object.keys(JSON.parse(fs.readFileSync(path.join(root, "lib/notes-withheld-figures.json"), "utf8")).withheld));
const manifest = JSON.parse(fs.readFileSync(path.join(root, "tools/diagrams/manifest.json"), "utf8"));
const hash = file => {
  const data = fs.readFileSync(file, "utf8").replaceAll("\r\n", "\n");
  return crypto.createHash("sha256").update(data).digest("hex");
};
for (const diagram of manifest) {
  const source = path.join(root, diagram.source);
  const image = path.join(publicRoot, diagram.image);
  assert.equal(hash(source), diagram.sha256, "Diagram source changed. Render and review " + diagram.source);
  assert.equal(hash(image), diagram.svgSha256, "Rendered diagram changed. Review " + diagram.image);
}
let notes = 0;
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(file);
    else if (entry.name === "notes.html") {
      notes++;
      const html = fs.readFileSync(file, "utf8");
      assert.doesNotMatch(html, /<(?:pre|div)\b[^>]*class=["'](?:[\w-]+\s+)*mermaid(?:\s+[\w-]+)*["']/i, "Unrendered diagram in " + file);
      for (const tag of html.matchAll(/<img\b[^>]*>/gi)) {
        const src = /\bsrc=["']([^"']+)["']/i.exec(tag[0])?.[1];
        if (!src || /^(?:https?:|data:|\/\/)/i.test(src)) continue;
        const url = new URL(src, "https://ghostaviator.com/content/" + path.relative(path.join(publicRoot, "content"), file).replaceAll("\\", "/"));
        const image = path.join(publicRoot, decodeURIComponent(url.pathname).slice(1));
        if (withheld.has(decodeURIComponent(url.pathname))) continue;
        assert.ok(fs.existsSync(image), "Missing image " + src + " in " + file);
      }
    }
  }
}
scan(path.join(publicRoot, "content"));
console.log(`Checked ${manifest.length} rendered diagrams and local image references in ${notes} notes pages.`);
