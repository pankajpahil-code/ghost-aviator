-- Ghost Aviator — final ADAPT database check and repair.
--
-- Why this file exists: `adapt_attempts` (SECURITY.md §3d) shipped on
-- 2026-08-10, but the project reports "No migrations" and nothing on record
-- confirms its SQL was ever run. If it was not, the anonymous telemetry has
-- been failing silently ever since and no norms have been accumulating — which
-- is the data that is eventually meant to replace the provisional grade bands.
--
-- Safe to run any number of times. Creates nothing that already exists, drops
-- no data, and touches no existing rows. The policy is dropped first because
-- Postgres has no `create policy if not exists`.
--
-- Paste into the Supabase SQL editor and run. The final SELECT reports the
-- state of BOTH ADAPT tables so nothing has to be assumed.

create table if not exists public.adapt_attempts (
  id            uuid primary key default gen_random_uuid(),
  device_id     uuid not null,
  session_seed  bigint not null,
  module_id     text not null,
  module_kind   text not null,
  stanine       smallint,
  headline_pct  smallint,
  input_class   text,
  completed     boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table public.adapt_attempts enable row level security;

drop policy if exists "anon adapt insert" on public.adapt_attempts;
create policy "anon adapt insert" on public.adapt_attempts
  for insert to anon, authenticated with check (true);

create index if not exists adapt_attempts_module_created_idx
  on public.adapt_attempts (module_id, created_at desc);

-- Report the state of both tables.
select
  t.tablename,
  (select count(*) from information_schema.columns c
     where c.table_schema='public' and c.table_name=t.tablename)          as cols,
  (select relrowsecurity from pg_class where oid = ('public.'||t.tablename)::regclass) as rls_on,
  (select count(*) from pg_policies p
     where p.schemaname='public' and p.tablename=t.tablename)             as policies,
  (select count(*) from pg_policies p
     where p.schemaname='public' and p.tablename=t.tablename
       and 'anon' = any(p.roles))                                         as anon_policies,
  (select count(*) from pg_policies p
     where p.schemaname='public' and p.tablename=t.tablename
       and p.cmd='SELECT')                                                as select_policies,
  (select n_live_tup from pg_stat_user_tables s
     where s.schemaname='public' and s.relname=t.tablename)               as rows_so_far
from (values ('adapt_attempts'),('adapt_results')) as t(tablename);
