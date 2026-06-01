export type VaultPasswordRow = {
  id: string;
  user_id: string;
  account_type: string;
  encrypted_username: string;
  encrypted_password: string;
  iv_username: string;
  iv_password: string;
  created_at: string;
  updated_at: string;
};

export type VaultPasswordPayload = {
  account_type: string;
  encrypted_username: string;
  encrypted_password: string;
  iv_username: string;
  iv_password: string;
};

export type DecryptedPassword = {
  id: string;
  account_type: string;
  username: string;
  password: string;
};

export type VaultNoteRow = {
  id: string;
  user_id: string;
  encrypted_title: string;
  iv_title: string;
  encrypted_body: string;
  iv_body: string;
  created_at: string;
  updated_at: string;
};

export type VaultNotePayload = {
  encrypted_title: string;
  iv_title: string;
  encrypted_body: string;
  iv_body: string;
};

export type DecryptedNote = {
  id: string;
  title: string;
  body: string;
};

export type VaultFileRow = {
  id: string;
  user_id: string;
  storage_path: string;
  iv_file: string;
  encrypted_meta: string;
  iv_meta: string;
  created_at: string;
  updated_at: string;
};

export type VaultFileMetaPayload = {
  id: string;
  storage_path: string;
  iv_file: string;
  encrypted_meta: string;
  iv_meta: string;
};

export type EncryptedFilePackage = {
  fileId: string;
  storagePath: string;
  encryptedBytes: Uint8Array;
  meta: {
    iv_file: string;
    encrypted_meta: string;
    iv_meta: string;
  };
};

export type DecryptedFile = {
  id: string;
  name: string;
  mimeType: string;
  data: Uint8Array;
};

export type PasswordVerifierResponse = {
  ciphertext: string;
  iv: string;
} | null;

export type VaultBootstrapResponse = {
  crypto_salt: string | null;
  password_verifier: PasswordVerifierResponse;
};
