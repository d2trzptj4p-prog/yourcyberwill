import { requireAuthUser } from "@/lib/api/auth";
import {
  computeCheckInDueAt,
  getCheckInIntervalMs,
} from "@/lib/check-in-constants";
import { isCheckInLocked } from "@/lib/check-in-lock";
import type { CheckInState } from "@/lib/check-in-types";
import { isValidCheckInPeriod } from "@/lib/check-in-periods";
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
        "check_in_active, check_in_due_at, recipients_notified_complete, recipient_email_template, check_in_interval_days",
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
    interval_ms: getCheckInIntervalMs(profileResult.data.check_in_interval_days),
    check_in_interval_days: profileResult.data.check_in_interval_days ?? 30,
  };

  return NextResponse.json(state);
}

export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  let body: { check_in_interval_days?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    // Body is optional
  }

  const { check_in_interval_days: requestedDays } = body;

  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("recipients_notified_complete, crypto_salt, check_in_interval_days")
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

  // Determine interval days: use requested days if provided (first check-in with period selection),
  // otherwise keep existing period from database (re-check-in), otherwise default to 30
  let intervalDays = profile.check_in_interval_days ?? 30;
  if (requestedDays !== undefined) {
    if (!isValidCheckInPeriod(requestedDays)) {
      return NextResponse.json(
        { error: "Invalid check-in period. Must be 1, 14, 30, 90, 180, or 365 days." },
        { status: 400 },
      );
    }
    intervalDays = requestedDays;
  }

  const dueAt = computeCheckInDueAt(new Date(), intervalDays);
  const { data, error } = await supabase
    .from("profiles")
    .update({
      check_in_active: true,
      check_in_due_at: dueAt,
      check_in_interval_days: intervalDays,
      last_recipient_notification_at: null,
      reminder_notification_sent: false,
    })
    .eq("id", auth.user.id)
    .select(
      "check_in_active, check_in_due_at, recipients_notified_complete, recipient_email_template, check_in_interval_days",
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
    interval_ms: getCheckInIntervalMs(data.check_in_interval_days),
    check_in_interval_days: data.check_in_interval_days ?? 30,
  };

  return NextResponse.json(state);
}
