import { requireAuthUser } from "@/lib/api/auth";
import { enforceCheckInEditAllowed } from "@/lib/api/enforce-check-in-edit";
import { enforceCountLimit, getUserIsPremium } from "@/lib/api/tier-enforce";
import { parseNotePayload } from "@/lib/api/vault-note-validation";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vault_notes")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const payload = parseNotePayload(await request.json());
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();

  const checkInBlock = await enforceCheckInEditAllowed(supabase, auth.user.id);
  if (checkInBlock) {
    return checkInBlock;
  }

  const isPremium = await getUserIsPremium(supabase, auth.user.id);
  const countLimit = await enforceCountLimit(
    supabase,
    auth.user.id,
    isPremium,
    "notes",
  );
  if (countLimit) {
    return countLimit;
  }

  const { data, error } = await supabase
    .from("vault_notes")
    .insert({ user_id: auth.user.id, ...payload })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
