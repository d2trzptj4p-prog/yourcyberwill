create table public.vault_passwords (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_type text not null,
  encrypted_username text not null,
  encrypted_password text not null,
  iv_username text not null,
  iv_password text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vault_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  encrypted_title text not null,
  iv_title text not null,
  encrypted_body text not null,
  iv_body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vault_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  encrypted_file text not null,
  iv_file text not null,
  encrypted_meta text not null,
  iv_meta text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.vault_passwords enable row level security;
alter table public.vault_notes enable row level security;
alter table public.vault_files enable row level security;

create policy "Vault passwords select" on public.vault_passwords for select using (auth.uid() = user_id);
create policy "Vault passwords insert" on public.vault_passwords for insert with check (auth.uid() = user_id);
create policy "Vault passwords update" on public.vault_passwords for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Vault passwords delete" on public.vault_passwords for delete using (auth.uid() = user_id);

create policy "Vault notes select" on public.vault_notes for select using (auth.uid() = user_id);
create policy "Vault notes insert" on public.vault_notes for insert with check (auth.uid() = user_id);
create policy "Vault notes update" on public.vault_notes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Vault notes delete" on public.vault_notes for delete using (auth.uid() = user_id);

create policy "Vault files select" on public.vault_files for select using (auth.uid() = user_id);
create policy "Vault files insert" on public.vault_files for insert with check (auth.uid() = user_id);
create policy "Vault files update" on public.vault_files for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Vault files delete" on public.vault_files for delete using (auth.uid() = user_id);
