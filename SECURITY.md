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

### 3d. `adapt_attempts` table — anonymous ADAPT score lines (added 2026-08-09)

Capt. Pahil's decision: collect ADAPT results so we can see how many students use
it, how often, and how they actually score. **Anonymous by construction** — the
row carries a random per-device id, never a `user_id`, never an email, and never
a question, an answer, a tracking sample or anything at all from the attitudes
questionnaire beyond the bare fact that it was completed. See the header of
`lib/adapt/telemetry-core.mjs`; the guarantee is enforced by tests, not by care.

This is also how the **provisional criterion grade bands eventually get replaced
with measured ones** — `lib/adapt/stanine.mjs` already accepts either, and needs
about 500 attempts per module before an observed norm is honest.

```sql
create table if not exists public.adapt_attempts (
  id            uuid primary key default gen_random_uuid(),
  device_id     uuid not null,            -- random per browser; NOT a person
  session_seed  bigint not null,          -- lets a disputed paper be rebuilt exactly
  module_id     text not null,            -- e.g. 'aviation-maths', 'control-coordination'
  module_kind   text not null,            -- knowledge | psychomotor | divided-attention | behavioural
  stanine       smallint,                 -- null for the questionnaire, which has no grade
  headline_pct  smallint,                 -- % correct, % cancelled, or the divided composite
  input_class   text,                     -- tracking only; norms must never pool devices
  completed     boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table public.adapt_attempts enable row level security;

-- Insert-only from the browser, and NO select policy: nothing in the client
-- may ever read another device's rows back. Query it from the dashboard.
create policy "anon adapt insert" on public.adapt_attempts
  for insert to anon, authenticated with check (true);

create index if not exists adapt_attempts_module_created_idx
  on public.adapt_attempts (module_id, created_at desc);
```

**STATUS, 2026-08-11: this one may never have been created.** The project shows "No
migrations", and nothing on record confirms this SQL was ever run — which would mean the
anonymous telemetry has been failing silently since it shipped on 2026-08-10, and no norms
have been accumulating. The statements above are idempotent apart from the policy, so the
repair script adds `drop policy if exists` before it. **Verify before assuming it exists.**

Until this table exists the insert simply fails and is swallowed — students see
no difference. Students can also switch it off from their result page, and the
feature page says plainly what is recorded.

**Useful queries once it fills up:**

```sql
-- how many students, how many sittings
select count(distinct device_id) as students, count(*) as module_sittings
from public.adapt_attempts;

-- how they do, per module — this is what replaces the provisional bands
select module_id, count(*) n, round(avg(stanine),2) mean_stanine, round(stddev(stanine),2) sd
from public.adapt_attempts where stanine is not null
group by module_id order by n desc;
```

### 3e. `adapt_results` table — ADAPT results saved to a student's account (added 2026-08-10)

Capt. Pahil's decision, 2026-08-10: **ask students to sign up free, and record their
results so the data can be used to improve the simulator.** His words: *"we are not
gonna share data with anyone but we will improve our version from data."*

This is a DIFFERENT table from `adapt_attempts` (§3d) and both stay. `adapt_attempts`
is the anonymous device-level count and keeps working for students who never sign in;
`adapt_results` is the signed-in student's own history, which they can see on their
dashboard and which survives losing a phone.

**Signing up is asked for, never required.** The whole simulator works signed-out. What
an account adds is a saved history, a learning curve across sittings, and results that
follow the student between devices.

**What is stored, and what is still refused.** The row carries the score and the
BREAKDOWN of the score — per-difficulty-tier accuracy, per-family accuracy, the
per-phase composites from the multitasking run, the per-minute shape of the tracking
run. That is what makes the data useful for fixing the simulator: it shows which
question families are too hard, whether the difficulty ramp is real, and where students
actually run out of capacity.

It does **not** carry the questions, the individual answers, or **anything whatsoever
from the attitudes questionnaire beyond the bare fact that it was completed** — no
attitude, no tally, no profile, signed in or not. That was binding before accounts
existed and it stays binding now. `telemetry-core.test.mjs` and
`results-core.test.mjs` both fail if a row ever contains one.

```sql
create table if not exists public.adapt_results (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  session_seed   bigint not null,          -- lets a disputed paper be rebuilt exactly
  module_id      text not null,
  module_kind    text not null,            -- knowledge | psychomotor | divided-attention | behavioural
  stanine        smallint,                 -- null for the questionnaire, which has no grade
  sten           smallint,                 -- the 1-10 scale the real report uses
  band           text,                     -- colour band key
  headline_pct   smallint,
  detail         jsonb not null default '{}'::jsonb,  -- tiers, families, phases, segments
  input_class    text,                     -- tracking only; norms must never pool devices
  duration_sec   integer,
  completed      boolean not null default true,
  created_at     timestamptz not null default now()
);

alter table public.adapt_results enable row level security;

-- A student may write and read ONLY their own rows. There is no policy under
-- which one account can see another's results, and none should ever be added.
create policy "own adapt results insert" on public.adapt_results
  for insert to authenticated with check (auth.uid() = user_id);
create policy "own adapt results select" on public.adapt_results
  for select to authenticated using (auth.uid() = user_id);

create index if not exists adapt_results_user_module_idx
  on public.adapt_results (user_id, module_id, created_at desc);
```

Until this table exists the insert fails and is swallowed — a student's practice must
never break because saving did. The result page says whether the result was saved.

**Useful queries once it fills up:**

```sql
-- which question families are actually too hard — the item-quality signal
select module_id,
       f.key            as family,
       sum((f.value->>'correct')::int) as correct,
       sum((f.value->>'total')::int)   as total,
       round(100.0 * sum((f.value->>'correct')::int) / nullif(sum((f.value->>'total')::int),0), 1) as pct
from public.adapt_results, jsonb_each(detail->'families') f
where module_kind = 'knowledge'
group by module_id, f.key order by pct;

-- is the difficulty ramp real? accuracy should fall from tier 1 to tier 3
select module_id, t.key as tier,
       round(100.0 * sum((t.value->>'correct')::int) / nullif(sum((t.value->>'total')::int),0), 1) as pct
from public.adapt_results, jsonb_each(detail->'tiers') t
group by module_id, t.key order by module_id, tier;

-- where students run out of capacity in the multitasking run
select detail->'phases' from public.adapt_results where module_kind = 'divided-attention';

-- distribution per module — this is what replaces the provisional grade bands
select module_id, count(*) n, round(avg(stanine),2) mean_stanine, round(stddev(stanine),2) sd
from public.adapt_results where stanine is not null group by module_id order by n desc;
```

**DPDP Act, 2023 — unchanged and still open.** Moving from an anonymous device id to a
named account raises the stakes of the questions already listed in
`ADAPT_DATA_REVIEW.md`, it does not answer them. A meaningful share of these students
are 17 or 18. The lawyer's questions in that document still need a lawyer.

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
