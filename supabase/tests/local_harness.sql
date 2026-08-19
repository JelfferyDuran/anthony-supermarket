-- Minimal Supabase-shaped scaffolding so the repo's pricing migrations can be
-- executed and verified against a throwaway local PostgreSQL instance.
--
-- This is NOT a model of Supabase. It creates only the roles, schemas, and
-- objects the pricing migrations actually reference, so that running them
-- locally proves their SQL is valid and their guarantees hold.
create extension if not exists pgcrypto;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  -- service_role bypasses RLS in Supabase; mirroring that here keeps the
  -- deny-by-default assertions meaningful.
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin bypassrls; end if;
end $$;

create schema if not exists auth;
create schema if not exists storage;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text
);

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
