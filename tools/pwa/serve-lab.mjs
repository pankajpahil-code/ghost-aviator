// Tiny static server for tools/pwa/icon-lab.html while rendering the PWA icons.
// Local only (127.0.0.1), no dependencies, no caching. Not for production.
//   node tools/pwa/serve-lab.mjs   → http://127.0.0.1:4173/
//
// Two roots:
//   /           → tools/pwa/  (the lab itself)
//   /gini/...   → public/gini/ (the site's own Gini sprite stills, so the lab
//                 composites them same-origin and the canvas stays untainted)
import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join, normalize } from "path";
import { fileURLToPath } from "url";

const root = fileURLToPath(new URL("./", import.meta.url));
const giniRoot = fileURLToPath(new URL("../../public/gini/", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mjs": "text/javascript",
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    let path = normalize(decodeURIComponent(url.pathname));
    if (path === "/" || path === "\\") path = "/icon-lab.html";
    let base = root;
    // path.normalize() returns backslashes on Windows — match either separator.
    if (/^[\\/]gini[\\/]/.test(path)) {
      base = giniRoot;
      path = path.replace(/^[\\/]gini/, "");
    }
    const file = join(base, path);
    if (!file.startsWith(base)) {
      res.writeHead(403);
      res.end("forbidden");
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": types[extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
}).listen(4173, "127.0.0.1", () => console.log("icon lab on http://127.0.0.1:4173/"));
