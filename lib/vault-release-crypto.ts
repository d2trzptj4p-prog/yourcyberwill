import {
  base64ToBytes,
  decryptBytesRaw,
  encryptBytes,
} from "@/lib/crypto/vault-crypto";

export function generateReleaseToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function deriveWrapKeyFromToken(releaseToken: string): Promise<CryptoKey> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(releaseToken),
  );
  return crypto.subtle.importKey(
    "raw",
    digest,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function wrapVaultKeyForRelease(
  vaultKey: CryptoKey,
  releaseToken: string,
): Promise<{ wrapped_vault_key: string; wrapped_vault_key_iv: string }> {
  const wrapKey = await deriveWrapKeyFromToken(releaseToken);
  const rawKey = await crypto.subtle.exportKey("raw", vaultKey);
  const { ciphertext, iv } = await encryptBytes(rawKey, wrapKey);
  return { wrapped_vault_key: ciphertext, wrapped_vault_key_iv: iv };
}

export async function unwrapVaultKeyFromRelease(
  wrappedKeyBase64: string,
  ivBase64: string,
  releaseToken: string,
): Promise<CryptoKey> {
  const wrapKey = await deriveWrapKeyFromToken(releaseToken);
  const rawKey = await decryptBytesRaw(
    base64ToBytes(wrappedKeyBase64),
    ivBase64,
    wrapKey,
  );
  return crypto.subtle.importKey(
    "raw",
    rawKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}
