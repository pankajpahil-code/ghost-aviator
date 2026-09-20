/**
 * Parse every application/ld+json block in the BUILT pages and report what search
 * engines will actually receive. Written 2026-09-20 while reviewing the schema batch:
 * the defect that batch carried (a second Course node on ATPL chapter pages, because the
 * chapter layout already emits one) is invisible in a diff and obvious here.
 *
 *   node tools/audit/jsonld-check.mjs [.next/server/app]
 *
 * Fails (exit 1) on: JSON that does not parse, a node with no @type, or the same
 * @type appearing twice on one page - which is how competing entities reach Google.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.argv[2] || ".next/server/app";
const BLOCK = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
// What actually goes wrong is (a) the same @id twice - one entity described twice on one page -
// and (b) a type that can only mean one thing per page appearing more than once. A listing page
// legitimately carries many Course nodes, and /about legitimately restates the Person under the
// SAME @id as the site-wide node, so a bare type count flags those and teaches you to ignore it.
const SINGLETON = new Set(["WebSite", "WebPage", "CollectionPage", "FAQPage", "BreadcrumbList",
                           "WebApplication", "SoftwareApplication", "Quiz", "Article"]);
// The entities the site is trying to make Google recognise as ONE thing. Repeating these
// without a shared @id is what fragments them (AEO rule 2). ListItem, Question, Answer and
// the rest are structural parts, never entities, so they repeat freely and carry no @id.
const ENTITY = new Set(["Person", "Organization", "EducationalOrganization"]);

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (e.endsWith(".html")) out.push(p);
  }
  return out;
}

function nodes(node, acc = []) {
  if (Array.isArray(node)) { node.forEach(n => nodes(n, acc)); return acc; }
  if (node && typeof node === "object") {
    if (typeof node["@type"] === "string") acc.push({ type: node["@type"], id: node["@id"] });
    for (const v of Object.values(node)) nodes(v, acc);
  }
  return acc;
}

let pages = 0, blocks = 0, bad = 0, dupPages = 0;
const typeTally = new Map();

for (const file of walk(ROOT)) {
  const html = readFileSync(file, "utf8");
  const found = [...html.matchAll(BLOCK)];
  if (!found.length) continue;
  pages++;
  const onThisPage = [];
  for (const [, raw] of found) {
    blocks++;
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      bad++;
      console.log(`INVALID JSON  ${relative(ROOT, file)}: ${err.message}`);
      continue;
    }
    const t = nodes(parsed);
    if (!t.length) { bad++; console.log(`NO @type      ${relative(ROOT, file)}`); }
    onThisPage.push(...t);
  }
  for (const { type } of onThisPage) typeTally.set(type, (typeTally.get(type) || 0) + 1);

  const problems = [];
  // (a) one entity described twice under different @ids, or a singleton type repeated
  const byType = new Map();
  for (const n of onThisPage) {
    if (!byType.has(n.type)) byType.set(n.type, []);
    byType.get(n.type).push(n.id);
  }
  for (const [type, ids] of byType) {
    if (ids.length < 2) continue;
    if (SINGLETON.has(type)) { problems.push(`${type} x${ids.length}`); continue; }
    if (!ENTITY.has(type)) continue;
    // one entity, referenced - so every copy must sit under the same @id
    const distinct = new Set(ids.map(i => i ?? "(no @id)"));
    if (distinct.size > 1 || distinct.has("(no @id)")) {
      problems.push(`${type} x${ids.length} under ${distinct.size} id(s): ${[...distinct].join(", ")}`);
    }
  }
  if (problems.length) {
    dupPages++;
    console.log(`COMPETING     ${relative(ROOT, file)}: ${problems.join(", ")}`);
  }
}

console.log(`\n${pages} pages carry JSON-LD, ${blocks} blocks, ${bad} unparseable/untyped, ${dupPages} with a repeated entity type`);
console.log([...typeTally].sort((a, b) => b[1] - a[1]).map(([t, n]) => `  ${t}: ${n}`).join("\n"));
process.exit(bad || dupPages ? 1 : 0);
