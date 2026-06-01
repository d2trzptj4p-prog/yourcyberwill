-- pg_cron cannot read app.settings.service_role_key on hosted Supabase (permission denied).
-- The edge function uses SUPABASE_SERVICE_ROLE_KEY from its own env; the cron job only needs to invoke it.

select cron.unschedule(jobid)
from cron.job
where jobname = 'daily-check-in';

select cron.schedule(
  'daily-check-in',
  '0 9 * * *',
  $$
  select net.http_post(
    url := 'https://lawpngfugfycovbjcanb.supabase.co/functions/v1/daily-check-in',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
