export const DEFAULT_RECIPIENT_EMAIL_TEMPLATE = `Hi {recipient_name},

{owner_name}, who tagged you as a check-in recipient on Cipherwill, has passed.

They did not complete their scheduled check-in in time.

— Cipherwill`;

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
