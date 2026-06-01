const PBKDF2_ITERATIONS = 310_000;

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function generateSalt(): string {
  return bytesToBase64(crypto.getRandomValues(new Uint8Array(16)));
}

export async function deriveVaultKey(
  masterPassword: string,
  saltBase64: string,
): Promise<CryptoKey> {
  const salt = new Uint8Array(base64ToBytes(saltBase64));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    true, // extractable so we can wrap the key for recipient release links
    ["encrypt", "decrypt"],
  );
}

export async function encryptField(
  plaintext: string,
  key: CryptoKey,
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12)) as Uint8Array<ArrayBuffer>;
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(plaintext),
  );

  return {
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
  };
}

export async function decryptField(
  ciphertextBase64: string,
  ivBase64: string,
  key: CryptoKey,
): Promise<string> {
  const plaintext = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(base64ToBytes(ivBase64)) as Uint8Array<ArrayBuffer>,
    },
    key,
    new Uint8Array(base64ToBytes(ciphertextBase64)),
  );
  return new TextDecoder().decode(plaintext);
}

export async function encryptBytes(
  data: ArrayBuffer,
  key: CryptoKey,
): Promise<{ ciphertext: string; ciphertextBytes: Uint8Array; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12)) as Uint8Array<ArrayBuffer>;
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data,
  );
  const ciphertextBytes = new Uint8Array(encrypted);

  return {
    ciphertext: bytesToBase64(ciphertextBytes),
    ciphertextBytes,
    iv: bytesToBase64(iv),
  };
}

export async function decryptBytes(
  ciphertextBase64: string,
  ivBase64: string,
  key: CryptoKey,
): Promise<ArrayBuffer> {
  return decryptBytesRaw(
    new Uint8Array(base64ToBytes(ciphertextBase64)),
    ivBase64,
    key,
  );
}

export async function decryptBytesRaw(
  ciphertext: Uint8Array,
  ivBase64: string,
  key: CryptoKey,
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(base64ToBytes(ivBase64)) as Uint8Array<ArrayBuffer>,
    },
    key,
    new Uint8Array(ciphertext) as Uint8Array<ArrayBuffer>,
  );
}
