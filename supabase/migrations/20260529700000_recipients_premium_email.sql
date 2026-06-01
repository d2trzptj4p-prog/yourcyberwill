-- Prevent duplicate recipient emails per user (case-insensitive).
create unique index recipients_user_email_unique
  on public.recipients (user_id, lower(email));

alter table public.recipients
  add column notified_at timestamptz;

alter table public.profiles
  add column recipient_email_template text,
  add column recipients_notified_complete boolean not null default false,
  add column subscription_active boolean not null default false,
  add column polar_subscription_id text,
  add column polar_customer_id text;
