export const VAULT_FILES_BUCKET = "vault-files";

export function vaultFileStoragePath(userId: string, fileId: string): string {
  return `${userId}/${fileId}.enc`;
}

export function isVaultFileStoragePathForUser(
  userId: string,
  storagePath: string,
  fileId: string,
): boolean {
  const expected = vaultFileStoragePath(userId, fileId);
  if (storagePath !== expected) {
    return false;
  }
  if (storagePath.includes("..") || storagePath.includes("//")) {
    return false;
  }
  return true;
}
