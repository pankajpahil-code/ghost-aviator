import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";

const out = path.resolve("out");
const origin = "https://ghostaviator.com";
const xml = fs.readFileSync(path.join(out, "sitemap.xml"), "utf8");
const entries = new XMLParser().parse(xml).urlset.url;
const urls = entries.map(entry => String(entry.loc));
assert(urls.length > 0 && new Set(urls).size === urls.length, "Empty or duplicate sitemap URLs");
function html(pathname) {
  const rel = pathname === "/" ? "index" : pathname.slice(1);
  return fs.readFileSync(path.join(out, rel + ".html"), "utf8");
}
for (const address of urls) {
  const url = new URL(address);
  assert.equal(url.origin, origin, address);
  const page = html(decodeURIComponent(url.pathname));
  const canonical = page.match(/<link\b[^>]*\brel="canonical"[^>]*\bhref="([^"]+)"/i)?.[1];
  assert.equal(new URL(canonical).href, url.href, "Canonical mismatch on " + address);
  assert.equal((page.match(/<h1[\s>]/gi) || []).length, 1, "Heading count on " + address);
  assert.doesNotMatch(page, /<meta\b[^>]*name="robots"[^>]*content="[^"]*noindex/i, address);
}
const home = html("/");
const heading = home.match(/<h1\b([^>]*)>([\s\S]*?)<\/h1>/i);
assert.ok(heading && /DGCA/i.test(heading[2]) && !/sr-only/.test(heading[1]), "Missing visible DGCA heading");
assert.match(home, /href="\/cpl\/meteorology\/met-1\/notes"/);
assert.match(home, /href="\/free-dgca-mock-test"/);
const lesson = html("/cpl/air-navigation/nav-16/notes");
const quiz = html("/cpl/air-navigation/nav-16/chapter-quiz");
if (quiz.includes("SUBJECT REVISION QUIZ")) {
  assert.match(lesson, /Subject Revision/);
  assert.match(lesson, /does not count toward chapter progress/);
}
assert.match(home, /href="\/study-notebook.html"/);
assert.match(fs.readFileSync(path.join(out, "study-notebook.html"), "utf8"), /My seven-session study notebook/);
assert.match(fs.readFileSync(path.join(out, "robots.txt"), "utf8"), /Sitemap: https:\/\/ghostaviator\.com\/sitemap\.xml/i);
assert.ok(fs.existsSync(path.join(out, "404.html")));
console.log(`Release check passed for ${urls.length} sitemap pages and the study entry points.`);
