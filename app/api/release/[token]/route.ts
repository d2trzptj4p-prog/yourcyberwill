import { getReleasedRecipientByToken } from "@/lib/release-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const recipient = await getReleasedRecipientByToken(token);

  if (!recipient) {
    return NextResponse.json(
      { error: "Invalid or inactive release link" },
      { status: 404 },
    );
  }

  const supabase = createAdminClient();
  const ownerId = recipient.user_id;

  const [profileResult, passwords, notes, files] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", ownerId)
      .single(),
    supabase.from("vault_passwords").select("*").eq("user_id", ownerId),
    supabase.from("vault_notes").select("*").eq("user_id", ownerId),
    supabase
      .from("vault_files")
      .select("*")
      .eq("user_id", ownerId)
      .order("created_at", { ascending: false }),
  ]);

  const ownerName =
    profileResult.data?.full_name?.trim() ||
    profileResult.data?.email?.trim() ||
    "Vault owner";

  return NextResponse.json({
    recipient_name: recipient.name,
    owner_name: ownerName,
    wrapped_vault_key: recipient.wrapped_vault_key,
    wrapped_vault_key_iv: recipient.wrapped_vault_key_iv,
    passwords: passwords.data ?? [],
    notes: notes.data ?? [],
    files: files.data ?? [],
  });
}
