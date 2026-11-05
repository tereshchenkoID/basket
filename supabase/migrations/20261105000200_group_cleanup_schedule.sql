begin;

-- Supabase Postgres provides pg_cron. Fail the migration if it cannot be enabled;
-- never silently deploy an unscheduled retention policy.
create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('basket-purge-deleted-groups', '*/10 * * * *',
  'select private.purge_deleted_groups();');

commit;
