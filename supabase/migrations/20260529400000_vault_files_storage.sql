delete from public.vault_files;

alter table public.vault_files
  drop column if exists encrypted_file;

alter table public.vault_files
  add column if not exists storage_path text;

alter table public.vault_files
  alter column storage_path set not null;

insert into storage.buckets (id, name, public, file_size_limit)
values ('vault-files', 'vault-files', false, 10485760)
on conflict (id) do update
  set public = false, file_size_limit = 10485760;

create policy "vault_files_storage_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'vault-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "vault_files_storage_select"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'vault-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "vault_files_storage_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'vault-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'vault-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "vault_files_storage_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'vault-files'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
