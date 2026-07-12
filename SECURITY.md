# Ghost Aviator — Security

Security is a first-class concern for this project (content-theft protection + user-data
protection). This document records the hardening in place and the actions **you** must take
outside the codebase (Vercel / Supabase dashboards).

---

## 1. HTTP security headers  ✅ in code

Set in [`next.config.ts`](next.config.ts) and applied to every route:

| Header | What it stops |
|---|---|
| `Content-Security-Policy` | XSS, injected scripts, and loading content/scripts from domains we don't trust |
| `frame-ancestors 'self'` (in CSP) + `X-Frame-Options: SAMEORIGIN` | **Anyone embedding/iframing your content into their own site**, and clickjacking |
| `X-Content-Type-Options: nosniff` | MIME-sniffing attacks |
| `Referrer-Policy` | Leaking the exact page a user is on to third parties |
| `Permissions-Policy` | Pages abusing camera/mic/geolocation |
| `Strict-Transport-Security` | Downgrade-to-HTTP / SSL-strip attacks |
| `poweredByHeader: false` | Advertising the exact framework version to attackers |

If you add a new third-party (e.g. a new analytics/video host), update the matching
`*-src` directive in the CSP or the resource will be blocked.

---

## 2. Dependencies  ✅ kept patched

- Pinned to **Next 16.2.7** (patched the high-severity DoS + middleware/cache advisories).
- Re-run `npm audit` after any dependency change. The only known remaining items are a
  `postcss` transitive dep bundled *inside* Next (build-time only, not runtime-exposed) —
  do **not** "fix" it by downgrading Next.

---

## 3. Supabase — ⚠️ ACTION REQUIRED before you enable accounts / lead capture

Your `NEXT_PUBLIC_SUPABASE_ANON_KEY` is **public** (it ships in the browser bundle — that is
by design). That means anyone can use it to query your database. **Row-Level Security (RLS)
is the only thing protecting your data.** Without it, a stranger can run
`select * from leads` and download every subscriber's name + email.

Run this in the Supabase SQL editor **before** setting the env vars in Vercel:

```sql
-- Create the leads table first if it doesn't exist yet (matches captureLead()).
create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text not null,
  source     text default 'site',
  created_at timestamptz default now()
);

-- LEADS: allow anonymous INSERT (the email-capture form) but NOBODY can read the list.
alter table public.leads enable row level security;

create policy "anyone can join the list"
  on public.leads for insert
  to anon, authenticated
  with check (true);

-- No SELECT/UPDATE/DELETE policy = those are denied for anon/authenticated.
-- You read the list from the Supabase dashboard (service role), never from the site.

-- Optional: stop duplicate/spam rows piling up
create unique index if not exists leads_email_key on public.leads (lower(email));
```

If you later add per-user tables (e.g. saved progress), every one of them must have RLS
with a policy like `using (auth.uid() = user_id)` so users can only see their **own** rows.

### 3b. `progress` table — cross-device progress sync (added 2026-06)

The site mirrors each signed-in student's best quiz/test scores to this table
(lib/progress-sync.ts). Run this in the Supabase SQL editor:

```sql
create table if not exists public.progress (
  user_id     uuid not null references auth.users (id) on delete cascade,
  chapter_key text not null,            -- e.g. 'cpl/meteorology/met-1'
  quiz_best   smallint,
  test_best   smallint,
  updated_at  timestamptz not null default now(),
  primary key (user_id, chapter_key)
);

alter table public.progress enable row level security;

-- Users can only ever touch their OWN rows. Anonymous visitors get nothing.
create policy "own progress select" on public.progress
  for select to authenticated using (auth.uid() = user_id);
create policy "own progress insert" on public.progress
  for insert to authenticated with check (auth.uid() = user_id);
create policy "own progress update" on public.progress
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress delete" on public.progress
  for delete to authenticated using (auth.uid() = user_id);
```

The client fails soft if this table doesn't exist yet — progress simply stays
on-device until the SQL is run.

### 3c. `exam_attempts` table — Exam Mode + performance dashboard (added 2026-07-12)

Every full-paper mock exam attempt (Exam Mode) is logged here so the performance
dashboard can show score trends and weak chapters over time — `progress` above only
ever kept the *best* score per chapter, not a history. Run this in the Supabase SQL editor:

```sql
create table if not exists public.exam_attempts (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  paper_id           text not null,          -- e.g. 'navigation', 'meteorology', 'rtr-part1'
  track              text not null,          -- 'cpl' | 'atpl'
  score_pct          smallint not null,
  correct_count      smallint not null,
  total_count        smallint not null,
  duration_taken_sec integer,
  chapter_breakdown  jsonb,                  -- { [chapterId]: { correct, total } } — powers weak-chapter detection
  created_at         timestamptz not null default now()
);

alter table public.exam_attempts enable row level security;

-- Attempts are an immutable log — insert + select only, no update/delete policy.
create policy "own attempts select" on public.exam_attempts
  for select to authenticated using (auth.uid() = user_id);
create policy "own attempts insert" on public.exam_attempts
  for insert to authenticated with check (auth.uid() = user_id);

create index if not exists exam_attempts_user_created_idx
  on public.exam_attempts (user_id, created_at desc);
```

Same fail-soft behaviour as `progress`: signed-out students keep a local-only attempt
history (capped, on-device); signed-in students get it mirrored here for cross-device access.

**Also in Supabase dashboard:**
- Auth → enable **email confirmation** (already expected by the signup flow).
- Auth → turn on **rate limiting / CAPTCHA** to stop signup/login brute-force + spam.
- Never put the **service_role** key in any `NEXT_PUBLIC_*` var or client code.

---

## 4. Content-theft protection — in place (deterrence)

- `ContentProtection.tsx` + `globals.css`: block right-click, copy/cut, drag-save, print, and
  devtools shortcuts site-wide.
- `tools/protect-notes.mjs`: injects the same protection into every `public/content/**/notes.html`
  (served in an iframe). **Re-run `node tools/protect-notes.mjs` after any notes rebuild.**
- `Watermark.tsx`: tiles the logged-in user's email across content, so a leaked screenshot is
  traceable to the account.

⚠️ **Reality check:** client-side protection is *deterrence against casual copying only*. Any
file in `public/` can be fetched directly (e.g. `curl /content/.../notes.html`, `slides.pdf`).
The robust fix for genuinely sensitive material is **auth-gating** it behind a Supabase login
and serving it from a protected route — not relying on the browser. Keep the highest-value
content behind accounts once auth is live.

---

## 5. Reporting

Found a vulnerability? Email **pankaj.pahil10@gmail.com**. Please don't open a public issue.
