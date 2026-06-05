import { NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "notify@yourcyberwill.com";

export async function POST(request: Request) {
  try {
    if (!RESEND_API_KEY) {
      return NextResponse.json({ error: "Resend API key missing on server" }, { status: 500 });
    }

    const { recipientName, recipientEmail, ownerName } = await request.json();

    if (!recipientEmail || !recipientName || !ownerName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Your beautiful HTML template string
    const htmlBody = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: sans-serif; color: #09090b; padding: 24px;">
          <div style="max-width: 540px; margin: 0 auto; padding: 32px; border: 1px solid #e4e4e7; border-radius: 12px;">
            <span style="font-size: 14px; font-weight: 600;">YourCyberWill</span>
            <h1 style="font-size: 24px; margin: 24px 0 16px 0;">You have been added as a trusted beneficiary 🔒</h1>
            <p>Hi ${recipientName},</p>
            <p>${ownerName} has designated you as a secure beneficiary for their digital assets and legacy information using the YourCyberWill protocol.</p>
            <div style="background-color: #f4f4f5; border-left: 4px solid #18181b; padding: 16px; margin: 24px 0; border-radius: 8px;">
              <p style="margin: 0; font-weight: 500;">Action Needed right now: None.</p>
            </div>
            <p>YourCyberWill is a secure digital dead-man's switch. If ${ownerName} ever goes completely silent, our automated system will securely deliver their vault materials to you. Your access is currently locked, and data privacy is fully secure under zero-knowledge encryption.</p>
            <p style="margin-top: 32px;">Best regards,<br><strong>The YourCyberWill Team</strong></p>
          </div>
        </body>
      </html>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [recipientEmail],
        subject: `${ownerName} added you as a legacy contact on YourCyberWill`,
        html: htmlBody,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      return NextResponse.json({ error: `Resend error: ${errorText}` }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}