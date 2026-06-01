alter table public.profiles
  add column if not exists crypto_salt text;

create table public.vault_credentials (
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

create index vault_credentials_user_id_idx on public.vault_credentials (user_id);
create index vault_credentials_account_type_idx on public.vault_credentials (user_id, account_type);

alter table public.vault_credentials enable row level security;

create policy "Vault credentials viewable by owner"
  on public.vault_credentials for select
  using (auth.uid() = user_id);

create policy "Vault credentials insertable by owner"
  on public.vault_credentials for insert
  with check (auth.uid() = user_id);

create policy "Vault credentials updatable by owner"
  on public.vault_credentials for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Vault credentials deletable by owner"
  on public.vault_credentials for delete
  using (auth.uid() = user_id);
