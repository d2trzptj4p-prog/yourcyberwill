import type { VaultFileMetaPayload } from "@/lib/vault-types";
import { isVaultFileStoragePathForUser } from "@/lib/vault-storage";

export function parseFileMetaPayload(
  body: unknown,
  userId: string,
): VaultFileMetaPayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;
  const fields = ["id", "storage_path", "iv_file", "encrypted_meta", "iv_meta"] as const;

  for (const field of fields) {
    if (typeof record[field] !== "string" || !record[field].trim()) {
      return null;
    }
  }

  const id = record.id as string;
  const storage_path = record.storage_path as string;

  if (!isVaultFileStoragePathForUser(userId, storage_path, id)) {
    return null;
  }

  return {
    id,
    storage_path,
    iv_file: record.iv_file as string,
    encrypted_meta: record.encrypted_meta as string,
    iv_meta: record.iv_meta as string,
  };
}
