-- Hourly trigger for /api/cron/reminders, replacing the GitHub Actions scheduled workflow
-- (GitHub's schedules are best-effort and were firing only every 5-8 hours, so most
-- users' 9pm reminder hour was skipped).
--
-- The bearer token is read from Vault at run time, so it never lives in the repo or in
-- cron.job. Before this does anything, create the secret once (Dashboard -> Project
-- Settings -> Vault, or SQL), using the same value as the Vercel CRON_SECRET env var:
--   select vault.create_secret('<value>', 'cron_secret');
-- Until then the route answers 401 and nothing is sent.
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Re-running this migration replaces the job instead of erroring on a duplicate name.
select cron.unschedule('reminders-hourly')
where exists (select 1 from cron.job where jobname = 'reminders-hourly');

select cron.schedule(
  'reminders-hourly',
  '0 * * * *',
  $$
  select net.http_get(
    url := 'https://rhythmrecovery.app/api/cron/reminders',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    timeout_milliseconds := 60000
  );
  $$
);
