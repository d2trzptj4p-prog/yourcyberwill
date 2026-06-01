import {
  generateReleaseToken,
  wrapVaultKeyForRelease,
} from "@/lib/vault-release-crypto";

type RecipientRow = { id: string };

/** While vault is unlocked, wrap the vault key for each recipient (bearer release links). */
export async function syncRecipientReleaseWrap(
  vaultKey: CryptoKey,
): Promise<{ updated: number; skipped: boolean }> {
  const recipientsRes = await fetch("/api/recipients");
  if (!recipientsRes.ok) {
    return { updated: 0, skipped: true };
  }

  const recipients = (await recipientsRes.json()) as RecipientRow[];
  if (!recipients.length) {
    return { updated: 0, skipped: false };
  }

  const wraps = await Promise.all(
    recipients.map(async (recipient) => {
      const release_token = generateReleaseToken();
      const wrapped = await wrapVaultKeyForRelease(vaultKey, release_token);
      return {
        recipient_id: recipient.id,
        release_token,
        ...wrapped,
      };
    }),
  );

  const response = await fetch("/api/recipients/release-wrap", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wraps }),
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(data.error ?? "Failed to save recipient access keys");
  }

  const result = (await response.json()) as { updated: number };
  if (result.updated === 0 && recipients.length > 0) {
    throw new Error(
      "Could not save recipient vault links. Try locking and unlocking again.",
    );
  }
  return { updated: result.updated, skipped: false };
}
