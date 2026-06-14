-- À exécuter si la base existe déjà (sinon le schéma complet suffit).
alter table profiles add column if not exists theme text default 'dark';
