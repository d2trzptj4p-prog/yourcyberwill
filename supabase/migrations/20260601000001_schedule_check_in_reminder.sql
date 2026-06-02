-- Schedule check-in-reminder edge function to run every hour
-- This will send reminder emails to users with less than 50% of their check-in time remaining

create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

-- Remove any existing job with the same name
select cron.unschedule(jobid)
from cron.job
where jobname = 'check-in-reminder';

-- Schedule to run every hour at :00 (e.g., 10:00, 11:00, 12:00, etc.)
select cron.schedule(
  'check-in-reminder',
  '0 * * * *',
  $$
  select net.http_post(
    url := 'https://lawpngfugfycovbjcanb.supabase.co/functions/v1/check-in-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
