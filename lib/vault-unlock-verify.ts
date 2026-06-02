import { decryptField, encryptField } from "@/lib/crypto/vault-crypto";

const VERIFIER_PLAINTEXT = "yourcyberwill-vault-v1";

export type PasswordVerifier = {
  ciphertext: string;
  iv: string;
};

export async function createPasswordVerifier(
  key: CryptoKey,
): Promise<PasswordVerifier> {
  const { ciphertext, iv } = await encryptField(VERIFIER_PLAINTEXT, key);
  return { ciphertext, iv };
}

export async function verifyVaultPassword(
  key: CryptoKey,
  verifier: PasswordVerifier,
): Promise<void> {
  const plaintext = await decryptField(verifier.ciphertext, verifier.iv, key);
  if (plaintext !== VERIFIER_PLAINTEXT) {
    throw new DOMException("Invalid master password", "OperationError");
  }
}

export type EncryptedSample = {
  ciphertext: string;
  iv: string;
};

/** Fallback for vaults created before the password verifier existed. */
export async function verifyVaultPasswordWithSample(
  key: CryptoKey,
  sample: EncryptedSample,
): Promise<void> {
  await decryptField(sample.ciphertext, sample.iv, key);
}
