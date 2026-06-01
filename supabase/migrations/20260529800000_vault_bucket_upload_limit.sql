-- Allow premium per-file uploads (app enforces tier limits; bucket cap = premium max).
update storage.buckets
set file_size_limit = 262144000
where id = 'vault-files';
