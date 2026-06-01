-- Bearer-token access to owner's vault after check-in release email.
alter table public.recipients
  add column release_token text unique,
  add column wrapped_vault_key text,
  add column wrapped_vault_key_iv text;

create index recipients_release_token_idx on public.recipients (release_token)
  where release_token is not null;
