-- Production hardening applied after the Pricing Hub v2 cutover.
--
-- _hermes_test was a one-row scratch table left exposed in public. It carried
-- no production data and is removed rather than normalized into the app model.
-- The immutable-history trigger function also gets an explicit search_path so
-- a caller cannot influence name resolution through a mutable role setting.

drop table if exists public._hermes_test;

alter function public.pricing_block_history_mutation()
  set search_path = pg_catalog, public;
