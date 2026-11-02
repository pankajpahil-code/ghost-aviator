/** Tutor requests contain plain text and small context objects. Bound the actual
 * stream as well as Content-Length, which is optional for chunked requests. */
const MAX_BYTES = 64 * 1024;

export async function tutorBody(req: Request): Promise<Record<string, unknown> | Response> {
  const tooLarge = () => Response.json({ ok: false, why: "too-large" }, { status: 413 });
  const invalid = () => Response.json({ ok: false, why: "bad-body" }, { status: 400 });
  if (Number(req.headers.get("content-length")) > MAX_BYTES) return tooLarge();
  if (!req.body) return invalid();
  const reader = req.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BYTES) {
        await reader.cancel();
        return tooLarge();
      }
      text += decoder.decode(value, { stream: true });
    }
    const body = JSON.parse(text + decoder.decode());
    return body && typeof body === "object" && !Array.isArray(body) ? body : invalid();
  } catch {
    return invalid();
  } finally {
    reader.releaseLock();
  }
}
