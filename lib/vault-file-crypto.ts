import {
  decryptBytesRaw,
  decryptField,
  encryptBytes,
  encryptField,
} from "@/lib/crypto/vault-crypto";
import { vaultFileStoragePath } from "@/lib/vault-storage";
import type {
  DecryptedFile,
  EncryptedFilePackage,
  VaultFileMetaPayload,
  VaultFileRow,
} from "@/lib/vault-types";

type FileMeta = {
  name: string;
  mimeType: string;
};

export async function decryptFileRow(
  row: VaultFileRow,
  encryptedBytes: Uint8Array,
  key: CryptoKey,
): Promise<DecryptedFile> {
  const metaJson = await decryptField(row.encrypted_meta, row.iv_meta, key);
  const meta = JSON.parse(metaJson) as FileMeta;
  const dataBuffer = await decryptBytesRaw(
    encryptedBytes,
    row.iv_file,
    key,
  );

  return {
    id: row.id,
    name: meta.name,
    mimeType: meta.mimeType,
    data: new Uint8Array(dataBuffer),
  };
}

export async function buildEncryptedFilePackage(
  file: File,
  key: CryptoKey,
  userId: string,
  maxPlaintextBytes: number,
): Promise<EncryptedFilePackage> {
  if (file.size > maxPlaintextBytes) {
    throw new Error(
      `File must be ${Math.round(maxPlaintextBytes / (1024 * 1024))} MB or smaller for your plan.`,
    );
  }

  const fileId = crypto.randomUUID();
  const fileBuffer = await file.arrayBuffer();
  const fileEncrypted = await encryptBytes(fileBuffer, key);
  const metaEncrypted = await encryptField(
    JSON.stringify({
      name: file.name,
      mimeType: file.type || "application/octet-stream",
    } satisfies FileMeta),
    key,
  );

  return {
    fileId,
    storagePath: vaultFileStoragePath(userId, fileId),
    encryptedBytes: fileEncrypted.ciphertextBytes,
    meta: {
      iv_file: fileEncrypted.iv,
      encrypted_meta: metaEncrypted.ciphertext,
      iv_meta: metaEncrypted.iv,
    },
  };
}

export function toFileMetaPayload(
  pkg: EncryptedFilePackage,
): VaultFileMetaPayload {
  return {
    id: pkg.fileId,
    storage_path: pkg.storagePath,
    ...pkg.meta,
  };
}
