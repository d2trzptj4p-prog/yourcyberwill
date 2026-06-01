alter table public.vault_credentials
  add column if not exists encrypted_notes text,
  add column if not exists iv_notes text,
  add column if not exists encrypted_attachment text,
  add column if not exists iv_attachment text,
  add column if not exists encrypted_attachment_meta text,
  add column if not exists iv_attachment_meta text;
