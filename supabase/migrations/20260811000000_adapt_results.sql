-- ADAPT results — a signed-in student's own sittings.
--
-- Capt. Pahil's decision, 2026-08-10: ask students to sign up free, save their
-- results, and use the data to improve the simulator. Rationale, the full data
-- inventory and the analysis queries live in SECURITY.md section 3e; this file
-- is the same statements in runnable form so they can be applied with the CLI
-- instead of pasted by hand.
--
-- The two files are kept byte-identical by lib/adapt/results-schema.test.mjs,
-- which also checks that every column the application writes exists here.
--
-- Apply with either:
--   supabase db push                        (after supabase login && supabase link)
--   or paste this file into the dashboard SQL editor
--
-- Safe to re-run: the table is created only if absent. The policies are not,
-- so they are dropped first — re-running must not fail on an existing policy.

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
drop policy if exists "own adapt results insert" on public.adapt_results;
create policy "own adapt results insert" on public.adapt_results
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "own adapt results select" on public.adapt_results;
create policy "own adapt results select" on public.adapt_results
  for select to authenticated using (auth.uid() = user_id);

create index if not exists adapt_results_user_module_idx
  on public.adapt_results (user_id, module_id, created_at desc);
