import { requireAuthUser } from "@/lib/api/auth";
import { enforceCheckInEditAllowed } from "@/lib/api/enforce-check-in-edit";
import { isCheckInLocked } from "@/lib/check-in-lock";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const MAX_TEMPLATE_LENGTH = 4000;

export async function PUT(request: Request) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = (await request.json()) as { template?: unknown };
  if (typeof body.template !== "string") {
    return NextResponse.json({ error: "Invalid template" }, { status: 400 });
  }

  const template = body.template.trim();
  if (template.length > MAX_TEMPLATE_LENGTH) {
    return NextResponse.json({ error: "Template too long" }, { status: 400 });
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
      { error: "Cannot edit email template after notifications were sent" },
      { status: 403 },
    );
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      recipient_email_template: template.length > 0 ? template : null,
    })
    .eq("id", auth.user.id)
    .select("recipient_email_template")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    recipient_email_template: data.recipient_email_template,
  });
}
