/**
 * The Cloudflare Worker in front of the static export (see tools/cloudflare/build.mts).
 *
 * Static assets are matched FIRST by Cloudflare, so this code only runs for
 * requests no file answers:
 *   1. redirects    — the same list Next applied on Vercel (lib/site-routing.ts)
 *   2. dynamic routes — the four API handlers and the embed widget, imported
 *      straight from app/ so there is one copy of each. They read their
 *      secrets from process.env (Worker secrets, `wrangler secret put`) and
 *      already degrade gracefully when a secret is missing.
 *   3. files over the 25 MiB asset limit, stitched back together from parts
 *   4. anything else  — the static 404 page, with a real 404 status.
 * Headers from lib/site-routing.ts are applied to every response made here;
 * files served straight from assets get the same headers from out/_headers.
 */
import { match, compile } from "path-to-regexp";
import { headerRules, redirectRules, type HeaderRule } from "../lib/site-routing";
import bigFiles from "./generated/big-files.json";


// Workers runtime globals (kept local so the repo needs no extra type package;
// this folder is excluded from the Next build's type check).
declare class FixedLengthStream extends TransformStream<Uint8Array, Uint8Array> { constructor(length: number); }
interface ExecutionContext { waitUntil(p: Promise<unknown>): void }

interface Env {
  ASSETS: { fetch(req: Request | string | URL, init?: RequestInit): Promise<Response> };
}
type Handler = (req: Request) => Response | Promise<Response>;
type RouteModule = Partial<Record<"GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD", Handler>>;

// Imported lazily: the Gini route pulls in the question banks, which do real
// work at module load and would blow the Worker's startup CPU budget if they
// ran for every cold start (including requests that never touch Gini).
const ROUTES: Record<string, () => Promise<RouteModule>> = {
  "/api/gini": () => import("../app/api/gini/route") as Promise<RouteModule>,
  "/api/gini/sign": () => import("../app/api/gini/sign/route") as Promise<RouteModule>,
  "/api/gini/tts": () => import("../app/api/gini/tts/route") as Promise<RouteModule>,
  "/api/telegram": () => import("../app/api/telegram/route") as Promise<RouteModule>,
  "/embed/question": () => import("../app/embed/question/route") as Promise<RouteModule>,
};

// Rules are data; compile them once per isolate.
type CompiledRedirect = { test: ReturnType<typeof match>; to: ReturnType<typeof compile>; status: number };
let redirectsP: Promise<CompiledRedirect[]> | null = null;
let headersP: Promise<{ test: ReturnType<typeof match>; rule: HeaderRule }[]> | null = null;
const redirects = () => (redirectsP ??= redirectRules().then(rs => rs.map(r => ({
  test: match(r.source, { decode: decodeURIComponent }),
  to: compile(r.destination, { encode: encodeURIComponent }),
  status: r.permanent ? 308 : 307,
}))));
const headerList = () => (headersP ??= headerRules().then(rs => rs.map(rule => ({ test: match(rule.source), rule }))));

async function withHeaders(path: string, res: Response): Promise<Response> {
  const out = new Response(res.body, res);
  // Later rules override earlier ones, exactly as next.config headers() does.
  for (const { test, rule } of await headerList()) {
    if (test(path)) for (const h of rule.headers) out.headers.set(h.key, h.value);
  }
  return out;
}

type Big = { path: string; size: number; parts: string[]; contentType: string };
const BIG = new Map<string, Big>((bigFiles.files as Big[]).map(f => [f.path, f]));
const PART = bigFiles.partSize as number;

/** One file served from its <25 MiB parts, with single-range support (PDF viewers use it). */
function serveBig(req: Request, env: Env, f: Big, ctx: ExecutionContext): Response {
  let start = 0, end = f.size - 1, status = 200;
  const range = req.headers.get("range");
  if (range) {
    const m = range.match(/^bytes=(\d*)-(\d*)$/);
    if (!m || (m[1] === "" && m[2] === "")) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${f.size}` } });
    }
    if (m[1] === "") { start = Math.max(0, f.size - Number(m[2])); }
    else { start = Number(m[1]); if (m[2] !== "") end = Math.min(Number(m[2]), f.size - 1); }
    if (start > end || start >= f.size) {
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${f.size}` } });
    }
    status = 206;
  }
  const headers = new Headers({
    "Content-Type": f.contentType,
    "Content-Length": String(end - start + 1),
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=86400",
  });
  if (status === 206) headers.set("Content-Range", `bytes ${start}-${end}/${f.size}`);
  if (req.method === "HEAD") return new Response(null, { status, headers });

  const { readable, writable } = new FixedLengthStream(end - start + 1);
  ctx.waitUntil((async () => {
    let writer = writable.getWriter();
    try {
      for (let i = Math.floor(start / PART); i <= Math.floor(end / PART); i++) {
        const partStart = i * PART;
        const from = Math.max(start, partStart) - partStart;
        const to = Math.min(end, partStart + PART - 1) - partStart;
        // Static assets ignore Range, so read the whole part and keep only
        // the bytes [from, to]; skipped bytes cost no CPU beyond the copy.
        const res = await env.ASSETS.fetch(new URL(f.parts[i], req.url));
        if (res.status !== 200 || !res.body) {
          // Never splice a wrong body into a book; abort the download instead.
          throw new Error(`part ${f.parts[i]} answered ${res.status}`);
        }
        const partLen = Math.min(PART, f.size - partStart);
        if (from === 0 && to === partLen - 1) {
          // Whole part: native pipe, no per-chunk JS (keeps CPU time tiny).
          writer.releaseLock();
          await res.body.pipeTo(writable, { preventClose: true });
          writer = writable.getWriter();
          continue;
        }
        const reader = res.body.getReader();
        let pos = 0;
        while (pos <= to) {
          const { done, value } = await reader.read();
          if (done) throw new Error(`part ${f.parts[i]} ended at ${pos}, wanted ${to + 1}`);
          const a = Math.max(from - pos, 0), b = Math.min(to + 1 - pos, value.byteLength);
          if (b > a) await writer.write(value.subarray(a, b));
          pos += value.byteLength;
        }
        await reader.cancel().catch(() => {});
      }
      await writer.close();
    } catch (e) {
      console.error(e);
      await writer.abort(e).catch(() => {});
    }
  })());
  return new Response(readable, { status, headers });
}

const worker = {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;

    // 1. Redirects (before anything else, as in Next).
    for (const r of await redirects()) {
      const m = r.test(path);
      if (!m) continue;
      const dest = new URL(r.to(m.params as object), url);
      dest.search = url.search;
      return Response.redirect(dest.toString(), r.status);
    }

    // 2. Dynamic routes.
    const load = ROUTES[path.length > 1 ? path.replace(/\/$/, "") : path];
    if (load) {
      const mod = await load();
      const method = req.method.toUpperCase() as keyof RouteModule;
      const handler = mod[method] ?? (method === "HEAD" ? mod.GET : undefined);
      let res: Response;
      if (!handler) {
        res = new Response(null, { status: 405, headers: { Allow: Object.keys(mod).filter(k => /^[A-Z]+$/.test(k)).join(", ") } });
      } else {
        try { res = await handler(req); }
        catch (e) { console.error(path, e); res = Response.json({ error: "Internal error" }, { status: 500 }); }
      }
      return withHeaders(path, res);
    }

    // 3. Files too big for a single static asset.
    const big = BIG.get(decodeURIComponent(path));
    if (big && (req.method === "GET" || req.method === "HEAD")) return withHeaders(path, serveBig(req, env, big, ctx));

    // 4. Not a file, not a route: the site's own 404 page.
    const notFound = await env.ASSETS.fetch(new URL("/404", url));
    return withHeaders(path, new Response(req.method === "HEAD" ? null : notFound.body, { status: 404, headers: notFound.headers }));
  },
};

export default worker;
