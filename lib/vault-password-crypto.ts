import { decryptField, encryptField } from "@/lib/crypto/vault-crypto";
import type {
  DecryptedPassword,
  VaultPasswordPayload,
  VaultPasswordRow,
} from "@/lib/vault-types";

export type PasswordFormInput = {
  account_type: string;
  username: string;
  password: string;
};

export async function decryptPasswordRow(
  row: VaultPasswordRow,
  key: CryptoKey,
): Promise<DecryptedPassword> {
  const [username, password] = await Promise.all([
    decryptField(row.encrypted_username, row.iv_username, key),
    decryptField(row.encrypted_password, row.iv_password, key),
  ]);

  return {
    id: row.id,
    account_type: row.account_type,
    username,
    password,
  };
}

export async function buildEncryptedPasswordPayload(
  form: PasswordFormInput,
  key: CryptoKey,
): Promise<VaultPasswordPayload> {
  const usernameEncrypted = await encryptField(form.username, key);
  const passwordEncrypted = await encryptField(form.password, key);

  return {
    account_type: form.account_type.trim(),
    encrypted_username: usernameEncrypted.ciphertext,
    encrypted_password: passwordEncrypted.ciphertext,
    iv_username: usernameEncrypted.iv,
    iv_password: passwordEncrypted.iv,
  };
}
