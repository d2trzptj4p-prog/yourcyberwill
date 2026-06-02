-- Schedule daily cleanup of old recipient records
-- Runs at 02:00 UTC daily (deletes recipients notified > 15 days ago)
select cron.schedule(
  'cleanup-old-recipients',
  '0 2 * * *',
  $$
  select net.http_post(
    url:='https://' || current_setting('app.settings.supabase_url') || '/functions/v1/cleanup-old-recipients',
    headers:='{"Content-Type":"application/json","Authorization":"Bearer ' || current_setting('app.settings.supabase_service_role_key') || '"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
