import { requireAuthUser } from "@/lib/api/auth";
import {
  computeCheckInDueAt,
  getCheckInIntervalMs,
} from "@/lib/check-in-constants";
import { isCheckInLocked } from "@/lib/check-in-lock";
import type { CheckInState } from "@/lib/check-in-types";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const supabase = await createClient();
  const [profileResult, recipientsResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "check_in_active, check_in_due_at, recipients_notified_complete, recipient_email_template",
      )
      .eq("id", auth.user.id)
      .single(),
    supabase
      .from("recipients")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.user.id),
  ]);

  if (profileResult.error) {
    return NextResponse.json(
      { error: profileResult.error.message },
      { status: 500 },
    );
  }
  if (recipientsResult.error) {
    return NextResponse.json(
      { error: recipientsResult.error.message },
      { status: 500 },
    );
  }

  const state: CheckInState = {
    active: profileResult.data.check_in_active,
    due_at: profileResult.data.check_in_due_at,
    recipient_count: recipientsResult.count ?? 0,
    recipients_notified_complete:
      profileResult.data.recipients_notified_complete,
    recipient_email_template: profileResult.data.recipient_email_template,
    interval_ms: getCheckInIntervalMs(),
  };

  return NextResponse.json(state);
}

export async function POST() {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("recipients_notified_complete, crypto_salt")
    .eq("id", auth.user.id)
    .single();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  if (isCheckInLocked(profile)) {
    return NextResponse.json(
      { error: "All emails have already been sent to recipients" },
      { status: 403 },
    );
  }

  if (!profile?.crypto_salt) {
    return NextResponse.json(
      {
        error:
          "Create or unlock your vault before starting check-ins. You need a vault password to encrypt recipient access.",
      },
      { status: 400 },
    );
  }

  const { count, error: countError } = await supabase
    .from("recipients")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.id);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }
  if (!count) {
    return NextResponse.json(
      { error: "Add at least one recipient before starting check-ins" },
      { status: 400 },
    );
  }

  const dueAt = computeCheckInDueAt();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      check_in_active: true,
      check_in_due_at: dueAt,
      last_recipient_notification_at: null,
    })
    .eq("id", auth.user.id)
    .select(
      "check_in_active, check_in_due_at, recipients_notified_complete, recipient_email_template",
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const state: CheckInState = {
    active: data.check_in_active,
    due_at: data.check_in_due_at,
    recipient_count: count,
    recipients_notified_complete: data.recipients_notified_complete,
    recipient_email_template: data.recipient_email_template,
    interval_ms: getCheckInIntervalMs(),
  };

  return NextResponse.json(state);
}
