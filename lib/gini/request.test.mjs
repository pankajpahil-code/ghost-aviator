import assert from "node:assert/strict";
import { test } from "node:test";
import { tutorBody } from "./request.ts";

const request = body => new Request("https://example.test", { method: "POST", body });
test("accepts a multilingual tutor request and rejects non-object JSON", async () => {
  assert.deepEqual(await tutorBody(request('{"q":"हवा"}')), { q: "हवा" });
  for (const value of ["null", "[]", "invalid"]) {
    assert.equal((await tutorBody(request(value))).status, 400);
  }
});
test("rejects a body exceeding the byte limit without a content length header", async () => {
  const req = request(JSON.stringify({ q: "ह".repeat(24000) }));
  assert.equal(req.headers.get("content-length"), null);
  assert.equal((await tutorBody(req)).status, 413);
});
