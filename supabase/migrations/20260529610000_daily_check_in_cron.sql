-- Schedule daily-check-in edge function at 09:00 UTC.
-- Superseded by 20260529620000_fix_daily_check_in_cron.sql (removed app.settings dependency).

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select cron.unschedule(jobid)
from cron.job
where jobname = 'daily-check-in';

select cron.schedule(
  'daily-check-in',
  '0 9 * * *',
  $$
  select net.http_post(
    url := 'https://lawpngfugfycovbjcanb.supabase.co/functions/v1/daily-check-in',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
