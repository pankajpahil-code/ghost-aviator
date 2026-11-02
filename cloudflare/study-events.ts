const eventPath = /^\/api\/study-events\/(lesson_open|chapter_quiz_start|chapter_quiz_complete|subject_revision_start|subject_revision_complete|exam_start|exam_complete|whatsapp_click)\/(home|cpl|atpl|classes|exam|other)$/;

export function studyEvent(req: Request, url: URL): Response {
  const match = eventPath.exec(url.pathname);
  if (!match || url.search) return new Response(null, { status: 404 });
  if (req.method !== "POST") return new Response(null, { status: 405, headers: { Allow: "POST" } });
  if (req.headers.get("origin") !== url.origin) return new Response(null, { status: 403 });
  console.log(JSON.stringify({ type: "study_event", event: match[1], area: match[2] }));
  return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
