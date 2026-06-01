import { createAdminClient } from "@/lib/supabase/admin";

export type ReleaseRecipient = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  release_token: string;
  wrapped_vault_key: string;
  wrapped_vault_key_iv: string;
  notified_at: string | null;
};

export async function getReleasedRecipientByToken(
  token: string,
): Promise<ReleaseRecipient | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("recipients")
    .select(
      "id, user_id, name, email, release_token, wrapped_vault_key, wrapped_vault_key_iv, notified_at",
    )
    .eq("release_token", token)
    .not("notified_at", "is", null)
    .not("wrapped_vault_key", "is", null)
    .not("wrapped_vault_key_iv", "is", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as ReleaseRecipient;
}

export function getReleaseVaultUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${base}/release/${encodeURIComponent(token)}`;
}
