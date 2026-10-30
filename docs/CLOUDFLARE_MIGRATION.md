# Moving ghostaviator.com to Cloudflare (free plan)

Vercel paused the project (`402 DEPLOYMENT_DISABLED`). This branch makes the site
run on **Cloudflare Workers (free)** without changing how it works on Vercel: the
normal `npm run build` is untouched, and the Cloudflare build is opt-in
(`CF_STATIC_EXPORT=1`, set by `npm run cf:build`).

## How it is built

| Piece | What it does |
|---|---|
| `npm run cf:build` (`tools/cloudflare/build.mts`) | Parks `app/api` and `app/embed/question/route.ts`, runs `next build` with `output: "export"`, restores them. Writes `out/_headers` (security + cache headers from `lib/site-routing.ts`) and `out/.assetsignore`. Splits files over 25 MiB into 20 MiB parts. Prints a limits report. |
| `out/` | ~14,100 static files (1,743 pages + `public/`), served as Workers Static Assets. No Worker CPU for these. |
| `cloudflare/worker.ts` | Runs only when no static file matches: the 29 Next redirects (same `path-to-regexp` matching), `/api/gini`, `/api/gini/sign`, `/api/gini/tts`, `/api/telegram`, `/embed/question`, the three split books (with `Range` support), and the site's 404 page. |
| `lib/site-routing.ts` | The headers/redirects that used to live inline in `next.config.ts`, shared by Vercel and Cloudflare so they cannot drift. |

Why not OpenNext: `@opennextjs/cloudflare` needs Next ≥ 16.4.1 (we are on 16.3.4),
and even after upgrading, its Worker measured **5.9 MB gzipped**, over the free
plan's 3 MB limit. The site is 99% static, so the static export + a small Worker
(**835 KiB gzipped**) fits easily.

### Free-plan limits checked

| Limit | Ghost Aviator |
|---|---|
| Worker size 3 MB gzipped | 835 KiB |
| 20,000 asset files | ~14,075 (wrangler's "Read 16990 files" log also counts 2,649 folders) |
| 25 MiB per asset | 13 files were over. 10 are retired `content/**/audio.m4a` that already 308-redirect, so they are not uploaded. The 3 books (54.8, 62.7, 56.6 MB) are stored as 20 MiB parts and stitched back by the Worker (byte-identical, checked with sha256). |
| 100k requests/day, 10 ms CPU/request | Static files do not count against Worker CPU. Gemini calls are mostly network wait, but a heavy `/api/gini` request may occasionally exceed 10 ms CPU on the free plan; watch the Worker logs. |

## Secrets

The site works without them; until set, the API routes answer
`{"ok":false,"why":"not-configured"}` (Gini) or `401` (Telegram).

```sh
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GINI_TTS_SECRET
npx wrangler secret put BHASHINI_USER_ID
npx wrangler secret put BHASHINI_ULCA_API_KEY
npx wrangler secret put BHASHINI_PIPELINE_ID
npx wrangler secret put BHASHINI_INFERENCE_KEY
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET
# optional: GEMINI_MODEL, GEMINI_TTS_MODELS, GEMINI_TTS_VOICE, BHASHINI_INFERENCE_URL
```

The public Supabase values (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_SITE_URL`) are baked in at build time, so they must be in
`.env.production.local` (gitignored) or the shell when running `npm run cf:build`.

## Deploy

Needs Node 22+ (wrangler 4).

```sh
npx wrangler login          # one-time browser approval, or export CLOUDFLARE_API_TOKEN
npm run cf:deploy           # build + upload
```

The site is then live at `https://ghost-aviator.<account-subdomain>.workers.dev`
straight away, before any DNS change.

## DNS cutover (ghostaviator.com)

Today: registrar **Hostinger**, nameservers **ns1/ns2.vercel-dns.com**. Records
below are from `/workspace/hostinger/dns_backup_20261030.json` (live public DNS,
30 Oct 2026 ~15:45 IST).

1. **Cloudflare → Add a domain → `ghostaviator.com` → Free plan.** Let it scan, then
   make the zone match this table exactly (delete anything else it imported):

   | Type | Name | Content | Proxy | TTL |
   |---|---|---|---|---|
   | MX | `@` | `mx1.improvmx.com` priority 10 | – | Auto |
   | MX | `@` | `mx2.improvmx.com` priority 20 | – | Auto |
   | TXT | `@` | `v=spf1 include:spf.improvmx.com ~all` | – | Auto |
   | TXT | `@` | `google-site-verification=gBI06UlhpArQe6SsjPee7LvHkUKmsh2iWVm0chchSkE` | – | Auto |
   | TXT | `google._domainkey` | the full `v=DKIM1;k=rsa;p=MIIBIjANBgkq…IDAQAB` value from the backup, unchanged | – | Auto |
   | CAA | `@` | `0 issue "sectigo.com"` | – | Auto |
   | CAA | `@` | `0 issue "letsencrypt.org"` | – | Auto |
   | CAA | `@` | `0 issue "pki.goog"` | – | Auto |

   Do **not** recreate the Vercel web records (`@` A 64.29.17.1 / 216.198.79.1,
   `www` A 216.198.79.65 / 64.29.17.65) or the `_dmarc`, `send`, `mail`, `api`,
   `app`, `admin`, `_vercel` A records: those are only Vercel's wildcard
   `*.ghostaviator.com` answering, not real records. There is no DMARC TXT today.
   The three CAA records already allow Cloudflare's certificate authorities
   (Let's Encrypt, Google Trust Services, Sectigo), so they stay unchanged; if
   Cloudflare adds its own CAA entries (e.g. ssl.com) for Universal SSL, leave them.

2. **Attach the site:** in `wrangler.jsonc` uncomment the `routes` block
   (`ghostaviator.com` and `www.ghostaviator.com` as custom domains) and run
   `npm run cf:deploy`. Cloudflare creates the web records and certificates itself.
   Optional: a free Redirect Rule `www.ghostaviator.com/*` → `https://ghostaviator.com/$1` (301).

3. **Hostinger → Domains → ghostaviator.com → DNS / Nameservers → Change
   nameservers** from `ns1.vercel-dns.com` / `ns2.vercel-dns.com` to the two
   `*.ns.cloudflare.com` names Cloudflare shows on the zone overview page. Turn
   **DNSSEC off** at Hostinger first if it is on.

4. Wait for Cloudflare to mark the zone **Active** (minutes to a few hours; the
   old NS TTL is 6 h). Check: `dig NS ghostaviator.com +short`,
   `curl -I https://ghostaviator.com`, send a test email to an @ghostaviator.com
   address (ImprovMX forwarding).

5. Telegram: if the bot's webhook pointed at `https://ghostaviator.com/api/telegram`,
   it keeps working once the two Telegram secrets are set.

### Rollback

Switch the nameservers at Hostinger back to `ns1.vercel-dns.com` /
`ns2.vercel-dns.com`. Nothing on Vercel was changed.

## www and the Google verification file (2026-10-30, after go-live)

Two defects found by checking the live site after the move:

- **www served a second full copy of the site.** It was a Custom Domain on the main
  Worker, and Static Assets answer before the Worker, so no redirect could run. Now
  `www.ghostaviator.com` belongs to `cloudflare/www/worker.ts` (Worker
  `ghost-aviator-www`), which 301s every request to the apex, keeping the path and
  query. Deploy it with `npm run cf:deploy-www`. Deploy the main Worker FIRST
  (it no longer lists www), so the domain is free when the www Worker claims it.
- **`/google03c67855fee92810.html` answered 307 to `/google03c67855fee92810`**, because
  `html_handling` strips `.html`. That file is the Search Console ownership token and
  must answer 200 at its exact URL. `assets.run_worker_first` sends that one path to
  the Worker, which serves the same bytes from public/ with a 200 (`VERBATIM_HTML`).
  If another ownership file is ever added, add it to both places.

`npm run cf:build` uses POSIX env syntax, so on Windows run it from Git Bash:
`NODE_ENV=production npx tsx tools/cloudflare/build.mts`.
