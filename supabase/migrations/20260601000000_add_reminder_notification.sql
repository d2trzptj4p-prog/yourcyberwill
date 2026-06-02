-- Add column to track when reminder notifications were sent
alter table public.profiles
  add column last_reminder_notification_at timestamptz,
  add column reminder_notification_sent boolean not null default false;

-- Create index for efficient querying of active check-ins needing reminder
create index idx_profiles_check_in_reminder on public.profiles (check_in_active, check_in_due_at, reminder_notification_sent)
  where check_in_active = true and reminder_notification_sent = false;
