import { requireAuthUser } from "@/lib/api/auth";
import { enforceCheckInEditAllowed } from "@/lib/api/enforce-check-in-edit";
import { createClient } from "@/lib/supabase/server";
import { VAULT_FILES_BUCKET } from "@/lib/vault-storage";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { id } = await context.params;
  const supabase = await createClient();

  const checkInBlock = await enforceCheckInEditAllowed(supabase, auth.user.id);
  if (checkInBlock) {
    return checkInBlock;
  }

  const { data: row } = await supabase
    .from("vault_files")
    .select("storage_path")
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await supabase.storage.from(VAULT_FILES_BUCKET).remove([row.storage_path]);

  const { error, count } = await supabase
    .from("vault_files")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!count) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
