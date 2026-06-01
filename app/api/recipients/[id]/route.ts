import { requireAuthUser } from "@/lib/api/auth";
import { recipientEmailExists } from "@/lib/api/recipient-duplicate";
import { parseRecipientPayload } from "@/lib/api/recipient-validation";
import { enforceCheckInEditAllowed } from "@/lib/api/enforce-check-in-edit";
import { isCheckInLocked } from "@/lib/check-in-lock";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const payload = parseRecipientPayload(await request.json());
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { id } = await context.params;
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
      { error: "Cannot edit recipients after notifications were sent" },
      { status: 403 },
    );
  }

  try {
    if (
      await recipientEmailExists(supabase, auth.user.id, payload.email, id)
    ) {
      return NextResponse.json(
        { error: "This email is already in your recipients list" },
        { status: 409 },
      );
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("recipients")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.user.id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "This email is already in your recipients list" },
        { status: 409 },
      );
    }
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("recipients_notified_complete")
    .eq("id", auth.user.id)
    .single();

  if (profile && isCheckInLocked(profile)) {
    return NextResponse.json(
      { error: "Cannot remove recipients after notifications were sent" },
      { status: 403 },
    );
  }

  const { count: recipientCount, error: countError } = await supabase
    .from("recipients")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  if ((recipientCount ?? 0) <= 1) {
    return NextResponse.json(
      { error: "At least one recipient must remain." },
      { status: 403 },
    );
  }

  const { error, count } = await supabase
    .from("recipients")
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
