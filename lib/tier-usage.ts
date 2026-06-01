import type { SupabaseClient } from "@supabase/supabase-js";
import { VAULT_FILES_BUCKET } from "@/lib/vault-storage";
import type { TierUsage } from "@/lib/tier-types";

function fileObjectSize(metadata: Record<string, unknown> | undefined): number {
  if (!metadata) {
    return 0;
  }
  const size = metadata.size;
  if (typeof size === "number" && size >= 0) {
    return size;
  }
  return 0;
}

/** Sum encrypted object sizes in the user's vault-files folder. */
export async function sumVaultStorageBytes(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { data: objects, error } = await supabase.storage
    .from(VAULT_FILES_BUCKET)
    .list(userId, { limit: 1000, sortBy: { column: "name", order: "asc" } });

  if (error) {
    throw new Error(`Storage usage lookup failed: ${error.message}`);
  }

  let total = 0;
  for (const obj of objects ?? []) {
    if (!obj.name || obj.id === null) {
      continue;
    }
    total += fileObjectSize(obj.metadata as Record<string, unknown> | undefined);
  }
  return total;
}

export async function getTierUsage(
  supabase: SupabaseClient,
  userId: string,
): Promise<TierUsage> {
  const [storageBytes, passwords, notes, recipients] = await Promise.all([
    sumVaultStorageBytes(supabase, userId),
    supabase
      .from("vault_passwords")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("vault_notes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("recipients")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  if (passwords.error) {
    throw new Error(passwords.error.message);
  }
  if (notes.error) {
    throw new Error(notes.error.message);
  }
  if (recipients.error) {
    throw new Error(recipients.error.message);
  }

  return {
    storageBytes,
    passwords: passwords.count ?? 0,
    notes: notes.count ?? 0,
    recipients: recipients.count ?? 0,
  };
}
