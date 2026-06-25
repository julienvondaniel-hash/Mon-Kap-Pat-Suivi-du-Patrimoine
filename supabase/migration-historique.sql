-- ============================================================================
--  MIGRATION — Historique de patrimoine (courbe de progression)
--  À exécuter si la base existe déjà (sinon le schéma complet suffit).
--  Supabase : SQL Editor > New query > coller > Run.
-- ============================================================================

-- 1. Table des relevés datés de la valeur nette (un par jour et par utilisateur)
create table if not exists net_worth_snapshots (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references profiles(id) on delete cascade,
  captured_at date not null default current_date,
  net_worth   numeric(14,2) not null default 0,
  gross       numeric(14,2) not null default 0,
  total_debt  numeric(14,2) not null default 0,
  created_at  timestamptz not null default now(),
  unique (owner_id, captured_at)
);

create index if not exists idx_snapshots_owner on net_worth_snapshots(owner_id);

-- 2. Cloisonnement RLS : le client gère ses relevés, son conseiller les lit.
alter table net_worth_snapshots enable row level security;

-- (Si une erreur "policy already exists" apparaît, c'est sans gravité.)
create policy snapshots_owner_all on net_worth_snapshots
  for all using (
    owner_id = auth.uid()
    or is_advisor_of(owner_id)
  ) with check (
    owner_id = auth.uid()
  );
