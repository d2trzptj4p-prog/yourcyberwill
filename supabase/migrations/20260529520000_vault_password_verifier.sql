alter table public.profiles
  add column if not exists password_verifier_ciphertext text,
  add column if not exists password_verifier_iv text;
