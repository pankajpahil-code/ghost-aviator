import fs from "node:fs";
import path from "node:path";

/**
 * Reads a notes.html file and extracts its semantic content for SEO.
 * Strips out scripts, styles, SVGs, and interactive wrappers to provide
 * a clean HTML string that search engines can index safely.
 */
export function getSeoHtmlForNotes(subjectId: string, chapterId: string): string | null {
  try {
    const notesPath = path.join(process.cwd(), "public", "content", subjectId, chapterId, "notes.html");
    if (!fs.existsSync(notesPath)) return null;

    const html = fs.readFileSync(notesPath, "utf-8");

    // Extract body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (!bodyMatch) return null;
    let body = bodyMatch[1];

    // Strip out scripts and styles
    body = body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    body = body.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
    
    // Strip out SVGs (often huge inline Mermaid or diagrams we don't want indexed as text)
    body = body.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "");

    // Strip out the cover page (h1, subtitle, author) as it duplicates the wrapper page titles
    body = body.replace(/<div class="cover"[\s\S]*?<\/div>/gi, "");

    // Strip out the TOC (Table of Contents) since it just duplicates headings
    body = body.replace(/<div class="toc"[\s\S]*?<\/div>/gi, "");

    return body.trim();
  } catch (error) {
    console.error(`Failed to parse SEO HTML for ${subjectId}/${chapterId}:`, error);
    return null;
  }
}
