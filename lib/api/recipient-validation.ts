export type RecipientPayload = {
  name: string;
  email: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseRecipientPayload(body: unknown): RecipientPayload | null {
  if (!body || typeof body !== "object") {
    return null;
  }
  const { name, email } = body as Record<string, unknown>;
  if (typeof name !== "string" || typeof email !== "string") {
    return null;
  }
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedName || !EMAIL_RE.test(trimmedEmail)) {
    return null;
  }
  return { name: trimmedName, email: trimmedEmail };
}
