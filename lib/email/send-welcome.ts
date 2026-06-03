import { Resend } from "resend";
import { getWelcomeEmailHTML, getWelcomeEmailText } from "./welcome-template";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@yourcyberwill.com";

export async function sendWelcomeEmail(
  email: string,
  userName: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[Email] Attempting to send welcome email to", email);
    console.log("[Email] RESEND_API_KEY configured:", !!process.env.RESEND_API_KEY);
    console.log("[Email] From email:", fromEmail);

    if (!process.env.RESEND_API_KEY) {
      console.error("[Email] RESEND_API_KEY is not set");
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    const result = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Welcome to YourCyberWill! 🎉",
      html: getWelcomeEmailHTML(userName),
      text: getWelcomeEmailText(userName),
    });

    console.log("[Email] Resend API response:", {
      hasId: !!result.id,
      hasError: !!result.error,
      error: result.error?.message,
    });

    if (result.error) {
      console.error("[Email] Failed to send welcome email:", result.error);
      return { success: false, error: result.error.message };
    }

    console.log("[Email] Welcome email sent successfully to", email, "ID:", result.id);
    return { success: true };
  } catch (error) {
    console.error("[Email] Error sending welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
