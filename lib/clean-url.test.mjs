import assert from "node:assert/strict";
import { test } from "node:test";
import { cleanUrlPath } from "./clean-url.ts";

test("trailing slash and .html map to the clean URL", () => {
  assert.equal(cleanUrlPath("/cpl/"), "/cpl");
  assert.equal(cleanUrlPath("/cpl/air-regulations/ar-1/notes/"), "/cpl/air-regulations/ar-1/notes");
  assert.equal(cleanUrlPath("/cpl//"), "/cpl");
  assert.equal(cleanUrlPath("/about.html"), "/about");
  assert.equal(cleanUrlPath("/study-notebook.html"), "/study-notebook");
  assert.equal(cleanUrlPath("/index.html"), "/");
  assert.equal(cleanUrlPath("/cpl/index.html"), "/cpl");
  assert.equal(cleanUrlPath("/about.html/"), "/about");
});

test("a protocol-relative path never redirects off-site", () => {
  assert.equal(cleanUrlPath("//evil.example/"), "/evil.example");
  assert.equal(cleanUrlPath("///evil.example.html"), "/evil.example");
  assert.equal(new URL(cleanUrlPath("//evil.example/"), "https://ghostaviator.com/").host, "ghostaviator.com");
});

test("clean paths, the root and API paths are left alone", () => {
  for (const p of ["/", "/cpl", "/cpl/__next.cpl.__PAGE__.txt", "/sitemap.xml", "/api/gini/", "/_gini/x/"]) {
    assert.equal(cleanUrlPath(p), null, p);
  }
});
