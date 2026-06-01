import { requireAuthUser } from "@/lib/api/auth";
import { enforceCheckInEditAllowed } from "@/lib/api/enforce-check-in-edit";
import { parsePasswordPayload } from "@/lib/api/vault-password-validation";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const payload = parsePasswordPayload(await request.json());
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { id } = await context.params;
  const supabase = await createClient();

  const checkInBlock = await enforceCheckInEditAllowed(supabase, auth.user.id);
  if (checkInBlock) {
    return checkInBlock;
  }

  const { data, error } = await supabase
    .from("vault_passwords")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
}

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

  const { error, count } = await supabase
    .from("vault_passwords")
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
