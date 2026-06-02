import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL =
  Deno.env.get("RESEND_FROM_EMAIL") ?? "emailer@contracted.pw";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const APP_URL = (
  Deno.env.get("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000"
).replace(/\/$/, "");

interface ReminderUser {
  id: string;
  email: string;
  full_name: string;
  check_in_due_at: string;
  check_in_interval_days: number | null;
}

interface ReminderResult {
  user_id: string;
  email_sent: boolean;
  time_remaining_ms: number;
  error?: string;
}

function formatTimeRemaining(ms: number): string {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  
  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} and ${hours} hour${hours > 1 ? "s" : ""}`;
  }
  return `${hours} hour${hours > 1 ? "s" : ""}`;
}

function getUserIntervalMs(intervalDays: number | null): number {
  const days = intervalDays ?? 30; // Default to 30 days if null
  
  // Handle special case: 1 = 1 minute testing period
  if (days === 1) {
    return 60 * 1000; // 1 minute
  }
  return days * 24 * 60 * 60 * 1000;
}

async function sendReminderEmail(
  user: ReminderUser,
  timeRemainingMs: number,
): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const timeFormatted = formatTimeRemaining(timeRemainingMs);
  const userIntervalMs = getUserIntervalMs(user.check_in_interval_days);
  const daysPercent = Math.round((timeRemainingMs / userIntervalMs) * 100);

  const emailSubject = `⏰ Reminder: Check in soon – ${daysPercent}% time remaining`;
  const emailBody = `Hi ${user.full_name || user.email},

This is a friendly reminder that your Cipherwill check-in deadline is approaching. You have approximately <strong>${timeFormatted}</strong> left to complete your check-in.

Once you check in, your recipients will be notified and can access your vault if anything happens to you. Don't leave them waiting!

<a href="${APP_URL}/dashboard" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">Check In Now</a>

— Cipherwill`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [user.email],
      subject: emailSubject,
      html: emailBody,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend error ${response.status}: ${text}`);
  }
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const now = new Date();
  const nowMs = now.getTime();
  const nowIso = now.toISOString();

  try {
    // Find all users with active check-ins whose deadline hasn't passed
    const { data: usersToNotify, error: queryError } = await supabase
      .from("profiles")
      .select("id, email, full_name, check_in_due_at, check_in_interval_days")
      .eq("check_in_active", true)
      .not("check_in_due_at", "is", null)
      .gt("check_in_due_at", nowIso) // Only future deadlines (not overdue)
      .order("check_in_due_at", { ascending: true });

    if (queryError) {
      return new Response(JSON.stringify({ error: queryError.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const results: ReminderResult[] = [];

    for (const user of usersToNotify ?? []) {
      const dueAtMs = new Date(user.check_in_due_at).getTime();
      const timeRemainingMs = dueAtMs - nowMs;

      // Calculate 50% threshold based on user's selected period
      const userIntervalMs = getUserIntervalMs(user.check_in_interval_days);
      const fiftyPercentThreshold = userIntervalMs / 2;

      // Only send reminder if less than 50% of time remains
      if (timeRemainingMs >= fiftyPercentThreshold) {
        continue;
      }

      try {
        await sendReminderEmail(user, timeRemainingMs);

        // Just log the reminder sent, don't mark as sent (so it sends every trigger)
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            last_reminder_notification_at: nowIso,
          })
          .eq("id", user.id);

        if (updateError) {
          results.push({
            user_id: user.id,
            email_sent: false,
            time_remaining_ms: timeRemainingMs,
            error: `Email sent but failed to update db: ${updateError.message}`,
          });
        } else {
          results.push({
            user_id: user.id,
            email_sent: true,
            time_remaining_ms: timeRemainingMs,
          });
        }
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : "Unknown error";
        results.push({
          user_id: user.id,
          email_sent: false,
          time_remaining_ms: timeRemainingMs,
          error: errorMsg,
        });
      }
    }

    return new Response(
      JSON.stringify({
        checked_at: nowIso,
        checked_users: usersToNotify?.length ?? 0,
        reminders_sent: results.filter((r) => r.email_sent).length,
        results,
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
