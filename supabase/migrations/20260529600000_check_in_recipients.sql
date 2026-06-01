-- Recipients notified when a user misses their check-in deadline.
create table public.recipients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index recipients_user_id_idx on public.recipients (user_id);

alter table public.recipients enable row level security;

create policy "Recipients select" on public.recipients for select using (auth.uid() = user_id);
create policy "Recipients insert" on public.recipients for insert with check (auth.uid() = user_id);
create policy "Recipients update" on public.recipients for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Recipients delete" on public.recipients for delete using (auth.uid() = user_id);

-- Check-in state on profiles (one row per user).
alter table public.profiles
  add column check_in_active boolean not null default false,
  add column check_in_due_at timestamptz,
  add column last_recipient_notification_at timestamptz;
