-- ============================================================================
--  SEINE GESTION PRIVÉE — Schéma de base de données
--  PostgreSQL / Supabase · pensé RGPD
-- ----------------------------------------------------------------------------
--  À exécuter dans Supabase : SQL Editor > New query > coller > Run.
--  Ordre : extensions, types, tables, index, RLS, triggers, vues.
--
--  Principes :
--   - Cloisonnement strict par Row Level Security (RLS) : un client ne voit
--     QUE ses données ; un conseiller voit les clients de SON cabinet.
--   - Registre de consentement horodaté et versionné (obligation RGPD).
--   - Journal d'accès immuable (qui a vu/modifié quoi, quand).
--   - Aucune donnée bancaire d'identifiants ici : l'agrégation passe par un
--     prestataire agréé (Powens/Bridge) qui ne stocke PAS les identifiants
--     chez nous. On ne conserve que des références de connexion (tokens
--     gérés côté prestataire).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;   -- pour le chiffrement applicatif éventuel

-- ----------------------------------------------------------------------------
-- 1. Types énumérés
-- ----------------------------------------------------------------------------
do $$ begin
  create type user_role     as enum ('client', 'advisor', 'admin');
  create type asset_kind    as enum ('mobilier', 'immobilier');
  create type consent_type  as enum ('cgu', 'data_processing', 'marketing');
  create type access_action as enum ('read', 'create', 'update', 'delete', 'export', 'login');
exception when duplicate_object then null; end $$;

-- ----------------------------------------------------------------------------
-- 2. Cabinets (multi-tenant : un cabinet = un espace cloisonné)
-- ----------------------------------------------------------------------------
create table if not exists firms (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  orias       text,                       -- n° ORIAS du cabinet
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. Profils (étend auth.users géré par Supabase Auth)
--    auth.users contient e-mail + mot de passe haché (jamais ici).
--    profiles contient les données métier non-secrètes.
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  firm_id           uuid references firms(id) on delete set null,
  role              user_role not null default 'client',
  -- conseiller référent du client (null pour les conseillers eux-mêmes)
  advisor_id        uuid references profiles(id) on delete set null,
  civilite          text,
  prenom            text,
  nom               text,
  telephone         text,
  date_naissance    date,
  residence_fiscale text default 'France',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. Actifs patrimoniaux
-- ----------------------------------------------------------------------------
create table if not exists assets (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references profiles(id) on delete cascade,
  kind        asset_kind not null,
  category    text not null,             -- 'Actions', 'Locatif', 'SCPI'...
  label       text,
  value       numeric(14,2) not null default 0,
  debt        numeric(14,2) not null default 0,    -- crédit restant (immobilier)
  currency    text not null default 'EUR',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Historique de valorisation (pour les graphiques d'évolution)
create table if not exists asset_valuations (
  id          uuid primary key default uuid_generate_v4(),
  asset_id    uuid not null references assets(id) on delete cascade,
  valued_at   date not null default current_date,
  value       numeric(14,2) not null,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. Simulations SCI à l'IS (sauvegarde des études TRI)
-- ----------------------------------------------------------------------------
create table if not exists sci_simulations (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references profiles(id) on delete cascade,
  label       text,
  params      jsonb not null,            -- prix, apport, taux, horizon...
  result_tri  numeric(6,4),              -- TRI calculé, stocké pour relecture
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. Registre de consentement (RGPD) — horodaté, versionné, immuable
--    On INSÈRE un nouvel enregistrement à chaque évolution ; on ne met
--    jamais à jour ni ne supprime (traçabilité de la preuve).
-- ----------------------------------------------------------------------------
create table if not exists consents (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references profiles(id) on delete cascade,
  type          consent_type not null,
  granted       boolean not null,         -- true = accordé, false = retiré
  policy_version text not null,           -- version de la politique acceptée
  ip_address    inet,                     -- preuve technique du consentement
  user_agent    text,
  created_at    timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 7. Journal d'accès (RGPD) — qui a fait quoi, quand
-- ----------------------------------------------------------------------------
create table if not exists access_logs (
  id           uuid primary key default uuid_generate_v4(),
  actor_id     uuid references profiles(id) on delete set null,
  action       access_action not null,
  target_table text,
  target_id    uuid,
  ip_address   inet,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 8. Index utiles
-- ----------------------------------------------------------------------------
create index if not exists idx_assets_owner       on assets(owner_id);
create index if not exists idx_valuations_asset   on asset_valuations(asset_id);
create index if not exists idx_consents_user      on consents(user_id);
create index if not exists idx_logs_actor         on access_logs(actor_id);
create index if not exists idx_profiles_advisor   on profiles(advisor_id);
create index if not exists idx_profiles_firm      on profiles(firm_id);

-- ============================================================================
--  9. ROW LEVEL SECURITY — le cœur du cloisonnement
--     Sans ces règles, n'importe quel utilisateur authentifié pourrait
--     lire toute la base. RLS applique la règle au niveau du moteur, donc
--     même une faille dans le code applicatif ne contourne pas le cloison.
-- ============================================================================

-- Fonction d'aide : rôle de l'utilisateur courant
create or replace function current_role_is(target user_role)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = target
  );
$$;

-- Fonction d'aide : l'utilisateur courant est-il le conseiller du propriétaire ?
create or replace function is_advisor_of(owner uuid)
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from profiles p
    where p.id = owner and p.advisor_id = auth.uid()
  );
$$;

-- Activer RLS sur toutes les tables sensibles
alter table profiles          enable row level security;
alter table assets            enable row level security;
alter table asset_valuations  enable row level security;
alter table sci_simulations   enable row level security;
alter table consents          enable row level security;
alter table access_logs       enable row level security;

-- ---- PROFILES ----
-- Un utilisateur lit/modifie son propre profil ; un conseiller lit les profils
-- de ses clients ; un admin voit tout son cabinet.
create policy profiles_self_select on profiles
  for select using (
    id = auth.uid()
    or advisor_id = auth.uid()
    or (current_role_is('admin') and firm_id = (select firm_id from profiles where id = auth.uid()))
  );
create policy profiles_self_update on profiles
  for update using (id = auth.uid());

-- ---- ASSETS ----
create policy assets_owner_all on assets
  for all using (
    owner_id = auth.uid()              -- le client gère ses actifs
    or is_advisor_of(owner_id)         -- le conseiller lit ceux de ses clients
  ) with check (
    owner_id = auth.uid()              -- mais seul le client peut écrire les siens
  );

-- ---- ASSET_VALUATIONS ----
create policy valuations_access on asset_valuations
  for select using (
    exists (select 1 from assets a where a.id = asset_id
            and (a.owner_id = auth.uid() or is_advisor_of(a.owner_id)))
  );

-- ---- SCI_SIMULATIONS ----
create policy sci_owner_all on sci_simulations
  for all using (owner_id = auth.uid() or is_advisor_of(owner_id))
  with check (owner_id = auth.uid());

-- ---- CONSENTS ----
-- L'utilisateur lit ses propres consentements et peut en insérer ;
-- personne ne peut les modifier ou supprimer (immuabilité = preuve).
create policy consents_self_select on consents
  for select using (user_id = auth.uid() or is_advisor_of(user_id));
create policy consents_self_insert on consents
  for insert with check (user_id = auth.uid());

-- ---- ACCESS_LOGS ----
-- En lecture pour les conseillers/admins du cabinet ; insertion par le service.
create policy logs_advisor_select on access_logs
  for select using (current_role_is('advisor') or current_role_is('admin'));

-- ============================================================================
-- 10. Triggers
-- ============================================================================

-- 10.a Mise à jour automatique de updated_at
create or replace function touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_profiles_touch before update on profiles
  for each row execute function touch_updated_at();
create trigger trg_assets_touch before update on assets
  for each row execute function touch_updated_at();

-- 10.b Création automatique d'un profil à l'inscription Supabase Auth.
--      Les métadonnées (prénom, nom...) sont passées à l'inscription via
--      options.data côté client, puis recopiées ici.
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, role, prenom, nom, civilite, telephone, date_naissance, residence_fiscale)
  values (
    new.id,
    'client',
    new.raw_user_meta_data->>'prenom',
    new.raw_user_meta_data->>'nom',
    new.raw_user_meta_data->>'civilite',
    new.raw_user_meta_data->>'telephone',
    (new.raw_user_meta_data->>'date_naissance')::date,
    coalesce(new.raw_user_meta_data->>'residence_fiscale', 'France')
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- 11. Vue back-office : patrimoine consolidé par client (pour le conseiller)
--     La vue hérite des RLS des tables sous-jacentes : un conseiller n'y voit
--     que ses propres clients.
-- ============================================================================
create or replace view client_net_worth as
select
  p.id              as client_id,
  p.prenom,
  p.nom,
  p.advisor_id,
  coalesce(sum(a.value), 0)            as gross,
  coalesce(sum(a.debt), 0)             as total_debt,
  coalesce(sum(a.value - a.debt), 0)   as net_worth,
  count(a.id)                          as asset_count
from profiles p
left join assets a on a.owner_id = p.id
where p.role = 'client'
group by p.id, p.prenom, p.nom, p.advisor_id;

-- ============================================================================
--  FIN DU SCHÉMA
--  Rappels d'exploitation :
--   - Activer la 2FA (MFA) dans Supabase Auth > Settings.
--   - Choisir une région UE au moment de créer le projet (ex. Frankfurt).
--   - Sauvegardes automatiques : vérifier la rétention dans Database > Backups.
--   - Ne JAMAIS exposer la clé service_role côté navigateur.
-- ============================================================================
