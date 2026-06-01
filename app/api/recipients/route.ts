import { requireAuthUser } from "@/lib/api/auth";
import { recipientEmailExists } from "@/lib/api/recipient-duplicate";
import { parseRecipientPayload } from "@/lib/api/recipient-validation";
import { enforceCheckInEditAllowed } from "@/lib/api/enforce-check-in-edit";
import { isCheckInLocked } from "@/lib/check-in-lock";
import { enforceCountLimit, getUserIsPremium } from "@/lib/api/tier-enforce";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipients")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: true });

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

  const payload = parseRecipientPayload(await request.json());
  if (!payload) {
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
      { error: "Cannot add recipients after notifications were sent" },
      { status: 403 },
    );
  }

  const isPremium = await getUserIsPremium(supabase, auth.user.id);
  const countLimit = await enforceCountLimit(
    supabase,
    auth.user.id,
    isPremium,
    "recipients",
  );
  if (countLimit) {
    return countLimit;
  }

  try {
    if (await recipientEmailExists(supabase, auth.user.id, payload.email)) {
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
    .insert({ user_id: auth.user.id, ...payload })
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

  return NextResponse.json(data, { status: 201 });
}
