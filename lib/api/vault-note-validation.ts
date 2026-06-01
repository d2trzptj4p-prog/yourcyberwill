import type { VaultNotePayload } from "@/lib/vault-types";

export function parseNotePayload(body: unknown): VaultNotePayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }

  const record = body as Record<string, unknown>;
  const fields = [
    "encrypted_title",
    "iv_title",
    "encrypted_body",
    "iv_body",
  ] as const;

  for (const field of fields) {
    if (typeof record[field] !== "string" || !record[field].trim()) {
      return null;
    }
  }

  return {
    encrypted_title: record.encrypted_title as string,
    iv_title: record.iv_title as string,
    encrypted_body: record.encrypted_body as string,
    iv_body: record.iv_body as string,
  };
}
