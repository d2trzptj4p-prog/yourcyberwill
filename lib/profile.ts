import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";

export async function getOrCreateProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<Profile | null> {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return existing as Profile;
  }

  const { data: created, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      email: user.email,
      full_name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      bio: "",
    })
    .select()
    .single();

  if (error) {
    return null;
  }

  return created as Profile;
}
