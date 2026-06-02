import {
  CHECK_IN_COMPLETE_MESSAGE,
  CHECK_IN_FIRST_MESSAGE,
  isCheckInEditBlocked,
} from "@/lib/check-in-edit-block";
import { getCheckInIntervalMs } from "@/lib/check-in-constants";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function enforceCheckInEditAllowed(
  supabase: SupabaseClient,
  userId: string,
): Promise<NextResponse | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "check_in_active, check_in_due_at, recipients_notified_complete, check_in_interval_days",
    )
    .eq("id", userId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (
    isCheckInEditBlocked(
      {
        active: profile.check_in_active,
        due_at: profile.check_in_due_at,
        recipients_notified_complete: profile.recipients_notified_complete,
        interval_ms: getCheckInIntervalMs(profile.check_in_interval_days),
      },
      profile.check_in_due_at
        ? new Date(profile.check_in_due_at).getTime() - Date.now()
        : null,
    )
  ) {
    const message = profile.recipients_notified_complete
      ? CHECK_IN_COMPLETE_MESSAGE
      : CHECK_IN_FIRST_MESSAGE;
    const code = profile.recipients_notified_complete
      ? "check_in_complete"
      : "check_in_required";

    return NextResponse.json({ error: message, code }, { status: 403 });
  }

  return null;
}
