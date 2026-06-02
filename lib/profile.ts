import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { sendWelcomeEmail } from "@/lib/email/send-welcome";

export async function getOrCreateProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<Profile | null> {
  console.log("[Profile] getOrCreateProfile called for user:", user.id, user.email);
  
  // 1. Look for an existing profile
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  let profile = existing;

  // 2. If it genuinely doesn't exist yet (no DB triggers active), create it
  if (!profile) {
    console.log("[Profile] Profile completely missing. Creating new profile row.");
    const { data: created, error } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        bio: "",
        welcome_email_sent: false, // Explicitly set default
      })
      .select()
      .single();

    if (error) {
      console.error("[Profile] Failed to create profile:", error);
      return null;
    }
    profile = created;
  } else {
    console.log("[Profile] Profile row already found in database.");
  }

  // 3. Check if the welcome email still needs to be sent
  if (profile && !profile.welcome_email_sent && user.email) {
    console.log("[Profile] Welcome email status is false. Preparing to send.");

    // Immediately flip the switch in the DB so rapid page reloads don't cause double-sending
    await supabase
      .from("profiles")
      .update({ welcome_email_sent: true })
      .eq("id", profile.id);

    // Trigger email asynchronously
    const displayName = profile.full_name || user.email.split("@")[0] || "there";
    
    sendWelcomeEmail(user.email, displayName)
      .then((result) => {
        if (!result.success) {
          console.error("[Profile] Welcome email failed:", result.error);
        } else {
          console.log("[Profile] Welcome email sent successfully to", user.email);
        }
      })
      .catch((err) => {
        console.error("[Profile] Error sending welcome email:", err);
      });
  }

  return profile as Profile;
}

// Helper function to keep your code DRY and clean
function triggerWelcomeEmail(user: User, profile: any) {
  if (!user.email) return;

  const displayName = profile.full_name || user.email.split("@")[0] || "there";
  console.log("[Profile] Sending welcome email to:", user.email);
  
  sendWelcomeEmail(user.email, displayName)
    .then((result) => {
      if (!result.success) {
        console.error("[Profile] Welcome email failed:", result.error);
      } else {
        console.log("[Profile] Welcome email sent successfully to", user.email);
      }
    })
    .catch((err) => {
      console.error("[Profile] Error sending welcome email:", err);
    });
}