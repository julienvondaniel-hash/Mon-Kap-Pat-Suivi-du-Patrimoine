-- ============================================================================
--  CORRECTIF — "Database error saving new user"
--  À exécuter dans Supabase : SQL Editor > New query > coller > Run.
--  Corrige le trigger qui crée le profil à l'inscription (search_path + policy).
-- ============================================================================

-- 1. Redéfinir la fonction avec le bon search_path (cause fréquente de l'échec)
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, prenom, nom, civilite, telephone, date_naissance, residence_fiscale)
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

-- 2. Autoriser l'insertion du profil par l'utilisateur concerné.
--    (Si une erreur "policy already exists" apparaît, c'est sans gravité :
--     la policy est déjà en place, le reste s'applique quand même.)
create policy profiles_insert_self on profiles
  for insert with check (id = auth.uid());

-- 3. Recréer proprement le déclencheur
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
