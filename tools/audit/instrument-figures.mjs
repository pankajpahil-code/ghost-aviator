import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { XMLValidator } from "fast-xml-parser";

// These checks preserve the exact artwork/caption pairs that were visually
// reviewed. A checksum is an integrity check, not proof of factual correctness.
const root = process.cwd();
const review = JSON.parse(fs.readFileSync(path.join(root, "tools/audit/instrument-figures.json"), "utf8"));
const withheld = JSON.parse(fs.readFileSync(path.join(root, "lib/notes-withheld-figures.json"), "utf8")).withheld;
const seen = new Set();
const escapeHtml = text => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

for (const figure of review.figures) {
  assert.ok(!seen.has(figure.image), "Duplicate reviewed image: " + figure.image);
  seen.add(figure.image);
  const data = fs.readFileSync(path.join(root, "public", figure.image));
  const svg = data.toString("utf8");
  if (figure.image.endsWith(".svg")) {
    assert.equal(XMLValidator.validate(svg), true, "Invalid SVG: " + figure.image);
    assert.ok(svg.includes(`width="${figure.width}" height="${figure.height}"`), "Changed image dimensions: " + figure.image);
    assert.doesNotMatch(svg, /<(?:script|foreignObject)\b|(?:href|src)=["'](?:https?:|data:)/i, "SVG must be self-contained: " + figure.image);
  } else {
    assert.ok(figure.image.endsWith(".webp"), "Unsupported reviewed image format");
    assert.equal(data.toString("ascii", 0, 4), "RIFF");
    assert.equal(data.toString("ascii", 8, 12), "WEBP");
    assert.ok(figure.sourceCredit && figure.publicationRights && figure.cropPoints,
      "Record source, permission and crop boundaries for " + figure.image);
  }
  assert.equal(crypto.createHash("sha256").update(data).digest("hex"), figure.sha256, "Re-review changed artwork: " + figure.image);
  const html = fs.readFileSync(path.join(root, figure.notes), "utf8");
  const imageSrc = "figs/" + path.basename(figure.image);
  const pair = [...html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi)]
    .filter(match => match[0].includes(`src="${imageSrc}"`));
  assert.equal(pair.length, 1, "Missing or duplicate reviewed figure: " + figure.figure);
  assert.ok(pair[0][0].includes(escapeHtml(figure.caption)), "Re-review changed caption: " + figure.figure);
  assert.ok(pair[0][0].includes(`href="${imageSrc}"`), "Missing full-size link: " + figure.figure);
  assert.ok(pair[0][0].includes("<summary>Read figure labels</summary>"), "Missing readable labels: " + figure.figure);
  for (const label of figure.labels) {
    assert.ok(pair[0][0].includes(escapeHtml(label)), "Missing accessible figure label: " + figure.figure);
  }
  assert.ok(!withheld["/" + figure.image], "Reviewed image is still withheld: " + figure.image);
  if (figure.replaces) {
    assert.ok(!html.includes(path.basename(figure.replaces)), "Stale missing-image reference: " + figure.replaces);
  }
}
assert.equal(review.figures.length, 80, "Update the review record when adding or removing reviewed figures.");
for (const diagram of review.staticDiagramTitles) {
  const html = fs.readFileSync(path.join(root, diagram.notes), "utf8");
  const pair = [...html.matchAll(/<figure\b[^>]*>[\s\S]*?<\/figure>/gi)]
    .find(match => match[0].includes(`src="/${diagram.image}"`));
  assert.ok(pair, "Missing labelled flowchart: " + diagram.image);
  assert.ok(pair[0].includes(`alt="${escapeHtml(diagram.title)}"`), "Incorrect flowchart alternative text: " + diagram.image);
  assert.ok(pair[0].includes(`>${escapeHtml(diagram.title)} · `), "Incorrect flowchart caption: " + diagram.image);
}
console.log(`Checked ${review.figures.length} reviewed artwork/caption pairs, readable labels and full-size links.`);
