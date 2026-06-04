export const DEFAULT_RECIPIENT_EMAIL_TEMPLATE = `Hi {recipient_name},

{owner_name}, has tagged you as a benificiary for their digital assets in the YourCyberWill protocol. They were supposed to check in recently to confirm that they are doing okay, but they did not.

Their vault is now opened to you with view-only access. Please check the vault for any important information or instructions they may have left for you. The link below will self destruct in 15 days.

— YourCyberWill Team`

export const RECIPIENT_EMAIL_PLACEHOLDERS = [
  "{recipient_name}",
  "{owner_name}",
] as const;

export function renderRecipientEmailBody(
  template: string | null | undefined,
  recipientName: string,
  ownerName: string,
): string {
  const base = template?.trim() || DEFAULT_RECIPIENT_EMAIL_TEMPLATE;
  return base
    .replaceAll("{recipient_name}", recipientName)
    .replaceAll("{owner_name}", ownerName);
}

export function recipientEmailBodyToHtml(body: string): string {
  const escaped = body
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  return escaped.replaceAll("\n", "<br>\n");
}
