import type { SupabaseClient } from "@supabase/supabase-js";

export async function recipientEmailExists(
  supabase: SupabaseClient,
  userId: string,
  email: string,
  excludeId?: string,
): Promise<boolean> {
  let query = supabase
    .from("recipients")
    .select("id")
    .eq("user_id", userId)
    .eq("email", email.toLowerCase());

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query.limit(1);
  if (error) {
    throw error;
  }
  return (data?.length ?? 0) > 0;
}
