import { decryptField, encryptField } from "@/lib/crypto/vault-crypto";
import type {
  DecryptedNote,
  VaultNotePayload,
  VaultNoteRow,
} from "@/lib/vault-types";

export type NoteFormInput = {
  title: string;
  body: string;
};

export async function decryptNoteRow(
  row: VaultNoteRow,
  key: CryptoKey,
): Promise<DecryptedNote> {
  const [title, body] = await Promise.all([
    decryptField(row.encrypted_title, row.iv_title, key),
    decryptField(row.encrypted_body, row.iv_body, key),
  ]);

  return { id: row.id, title, body };
}

export async function buildEncryptedNotePayload(
  form: NoteFormInput,
  key: CryptoKey,
): Promise<VaultNotePayload> {
  const titleEncrypted = await encryptField(form.title.trim(), key);
  const bodyEncrypted = await encryptField(form.body, key);

  return {
    encrypted_title: titleEncrypted.ciphertext,
    iv_title: titleEncrypted.iv,
    encrypted_body: bodyEncrypted.ciphertext,
    iv_body: bodyEncrypted.iv,
  };
}
