import { requireAuthUser } from "@/lib/api/auth";
import { enforceCheckInEditAllowed } from "@/lib/api/enforce-check-in-edit";
import { isCheckInLocked } from "@/lib/check-in-lock";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type WrapPayload = {
  recipient_id: string;
  release_token: string;
  wrapped_vault_key: string;
  wrapped_vault_key_iv: string;
};

function parseWraps(body: unknown): WrapPayload[] | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const wraps = (body as { wraps?: unknown }).wraps;
  if (!Array.isArray(wraps)) {
    return null;
  }

  const parsed: WrapPayload[] = [];
  for (const item of wraps) {
    if (!item || typeof item !== "object") {
      return null;
    }
    const row = item as Record<string, unknown>;
    if (
      typeof row.recipient_id !== "string" ||
      typeof row.release_token !== "string" ||
      typeof row.wrapped_vault_key !== "string" ||
      typeof row.wrapped_vault_key_iv !== "string" ||
      !row.release_token.trim() ||
      !row.wrapped_vault_key.trim() ||
      !row.wrapped_vault_key_iv.trim()
    ) {
      return null;
    }
    parsed.push({
      recipient_id: row.recipient_id,
      release_token: row.release_token.trim(),
      wrapped_vault_key: row.wrapped_vault_key,
      wrapped_vault_key_iv: row.wrapped_vault_key_iv,
    });
  }
  return parsed;
}

export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const wraps = parseWraps(await request.json());
  if (!wraps?.length) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();

  const checkInBlock = await enforceCheckInEditAllowed(supabase, auth.user.id);
  if (checkInBlock) {
    return checkInBlock;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("recipients_notified_complete")
    .eq("id", auth.user.id)
    .single();

  if (profile && isCheckInLocked(profile)) {
    return NextResponse.json(
      { error: "Cannot update release access after notifications were sent" },
      { status: 403 },
    );
  }

  let updated = 0;
  for (const wrap of wraps) {
    const { data, error } = await supabase
      .from("recipients")
      .update({
        release_token: wrap.release_token,
        wrapped_vault_key: wrap.wrapped_vault_key,
        wrapped_vault_key_iv: wrap.wrapped_vault_key_iv,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wrap.recipient_id)
      .eq("user_id", auth.user.id)
      .select("id");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (data?.length) {
      updated++;
    }
  }

  return NextResponse.json({ updated });
}
