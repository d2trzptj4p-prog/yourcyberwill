import type { VaultPasswordPayload } from "@/lib/vault-types";

export function parsePasswordPayload(body: unknown): VaultPasswordPayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;
  const fields = [
    "account_type",
    "encrypted_username",
    "encrypted_password",
    "iv_username",
    "iv_password",
  ] as const;

  for (const field of fields) {
    if (typeof record[field] !== "string" || !record[field].trim()) {
      return null;
    }
  }

  return {
    account_type: (record.account_type as string).trim(),
    encrypted_username: record.encrypted_username as string,
    encrypted_password: record.encrypted_password as string,
    iv_username: record.iv_username as string,
    iv_password: record.iv_password as string,
  };
}
