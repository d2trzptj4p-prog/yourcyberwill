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

const DEFAULT_TEMPLATE = `Hi {recipient_name},

{owner_name}, who tagged you as a check-in recipient on yourcyberwill, has passed.

They did not complete their scheduled check-in in time.

— yourcyberwill`;

type RecipientRow = {
  id: string;
  name: string;
  email: string;
  release_token: string | null;
};

function renderBody(
  template: string | null,
  recipientName: string,
  ownerName: string,
): string {
  const base = template?.trim() || DEFAULT_TEMPLATE;
  return base
    .replaceAll("{recipient_name}", recipientName)
    .replaceAll("{owner_name}", ownerName);
}

function bodyToHtml(body: string, releaseLink: string | null): string {
  const escaped = body
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\n", "<br>\n");

  if (!releaseLink) {
    return escaped;
  }

  const linkHtml = `<p style="margin-top:1.5em"><a href="${releaseLink}">Open their vault (view only)</a></p>`;
  return `${escaped}${linkHtml}`;
}

function releaseUrl(token: string): string {
  return `${APP_URL}/release/${encodeURIComponent(token)}`;
}

async function sendRecipientEmail(
  recipient: RecipientRow,
  ownerName: string,
  template: string | null,
): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const body = renderBody(template, recipient.name, ownerName);
  const link = recipient.release_token
    ? releaseUrl(recipient.release_token)
    : null;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [recipient.email],
      subject: `Important notice for ${recipient.name}`,
      html: bodyToHtml(body, link),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend error ${response.status}: ${text}`);
  }
}

async function sendOwnerNotificationEmail(
  ownerEmail: string,
  ownerName: string,
  recipientEmails: string[],
): Promise<void> {
  if (!RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const recipientList = recipientEmails.map((email) => `<li>${email}</li>`).join("\n");
  const emailBody = `Hi ${ownerName},

We have sent notification emails to your check-in recipients. They have been notified about your overdue check-in and have been given access to your vault.

Recipients notified:
<ul>
${recipientList}
</ul>

If you have any questions, please contact us.

— yourcyberwill`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [ownerEmail],
      subject: "Notification: Recipients have been contacted",
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
  const now = new Date().toISOString();

  const { data: overdueProfiles, error: profilesError } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, check_in_due_at, recipient_email_template, recipients_notified_complete",
    )
    .eq("check_in_active", true)
    .eq("recipients_notified_complete", false)
    .not("check_in_due_at", "is", null)
    .lt("check_in_due_at", now);

  if (profilesError) {
    return new Response(JSON.stringify({ error: profilesError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const results: {
    user_id: string;
    emails_sent: number;
    completed: boolean;
    owner_notified?: boolean;
    error?: string;
  }[] = [];

  for (const profile of overdueProfiles ?? []) {
    const { data: recipients, error: recipientsError } = await supabase
      .from("recipients")
      .select("id, name, email, release_token, wrapped_vault_key")
      .eq("user_id", profile.id)
      .is("notified_at", null);

    if (recipientsError) {
      results.push({
        user_id: profile.id,
        emails_sent: 0,
        completed: false,
        error: recipientsError.message,
      });
      continue;
    }

    if (!recipients?.length) {
      const { count: pendingCount } = await supabase
        .from("recipients")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.id)
        .is("notified_at", null);

      if (pendingCount === 0) {
        const { count: totalCount } = await supabase
          .from("recipients")
          .select("id", { count: "exact", head: true })
          .eq("user_id", profile.id);

        if (totalCount && totalCount > 0) {
          await supabase
            .from("profiles")
            .update({
              recipients_notified_complete: true,
              check_in_active: false,
              last_recipient_notification_at: now,
            })
            .eq("id", profile.id);
          results.push({
            user_id: profile.id,
            emails_sent: 0,
            completed: true,
          });
        }
      }
      continue;
    }

    const ownerName =
      profile.full_name?.trim() ||
      profile.email?.trim() ||
      "Someone you know";

    let sent = 0;
    let sendError: string | undefined;
    const notifiedEmails: string[] = [];

    for (const recipient of recipients as RecipientRow[]) {
      if (!recipient.release_token || !recipient.wrapped_vault_key) {
        sendError =
          "Recipient missing vault access link (owner must unlock vault after adding recipients)";
        break;
      }

      try {
        await sendRecipientEmail(
          recipient,
          ownerName,
          profile.recipient_email_template,
        );
        await supabase
          .from("recipients")
          .update({ notified_at: now })
          .eq("id", recipient.id);
        sent++;
        notifiedEmails.push(recipient.email);
      } catch (e) {
        sendError = e instanceof Error ? e.message : "Send failed";
        break;
      }
    }

    const { count: remaining } = await supabase
      .from("recipients")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .is("notified_at", null);

    let completed = false;
    let ownerNotified = false;
    if (remaining === 0 && !sendError) {
      await supabase
        .from("profiles")
        .update({
          recipients_notified_complete: true,
          check_in_active: false,
          last_recipient_notification_at: now,
        })
        .eq("id", profile.id);
      completed = true;

      if (notifiedEmails.length > 0) {
        try {
          await sendOwnerNotificationEmail(
            profile.email,
            ownerName,
            notifiedEmails,
          );
          ownerNotified = true;
        } catch (e) {
          sendError =
            e instanceof Error
              ? `Recipients notified but owner email failed: ${e.message}`
              : "Recipients notified but owner email failed";
        }
      }
    }

    results.push({
      user_id: profile.id,
      emails_sent: sent,
      completed,
      ...(ownerNotified ? { owner_notified: true } : {}),
      ...(sendError ? { error: sendError } : {}),
    });
  }

  return new Response(
    JSON.stringify({
      checked_at: now,
      overdue_count: overdueProfiles?.length ?? 0,
      results,
    }),
    { headers: { "Content-Type": "application/json" } },
  );
});
