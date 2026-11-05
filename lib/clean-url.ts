// Shared by cloudflare/worker.ts and lib/clean-url.test.mjs. No imports, so
// node --test can load it directly.

/**
 * The clean URL for a trailing-slash or .html request, or null if the path is
 * already clean. Static Assets' html_handling ("auto-trailing-slash") answers
 * these with a 307 (temporary), which tells Google the old URL may come back.
 * wrangler.jsonc routes "/*\/" and "/*.html" to this Worker first so we can
 * answer with a 308 (permanent) instead.
 *   /cpl/           -> /cpl
 *   /about.html     -> /about
 *   /index.html     -> /
 *   /cpl/index.html -> /cpl
 */
export function cleanUrlPath(path: string): string | null {
  if (path.startsWith("/api/") || path.startsWith("/_gini/")) return null;
  let p = path;
  while (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  if (p.endsWith("/index.html")) p = p.slice(0, -"/index.html".length) || "/";
  else if (p.endsWith(".html")) p = p.slice(0, -".html".length) || "/";
  if (p === path) return null;
  // Never hand back a protocol-relative path: "//evil.example/" must not
  // become a redirect to another host.
  return p.replace(/^\/{2,}/, "/");
}
