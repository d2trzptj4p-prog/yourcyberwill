import type { TierLimits, TierName } from "@/lib/tier-types";

function mbToBytes(mb: number): number {
  return Math.floor(mb * 1024 * 1024);
}

function parseEnvInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function limitsForTier(tier: TierName): TierLimits {
  const prefix = tier === "premium" ? "TIER_PREMIUM" : "TIER_FREE";
  return {
    maxFileUploadBytes: mbToBytes(
      parseEnvInt(
        `${prefix}_MAX_FILE_UPLOAD_MB`,
        tier === "premium" ? 250 : 15,
      ),
    ),
    maxTotalStorageBytes: mbToBytes(
      parseEnvInt(
        `${prefix}_MAX_TOTAL_STORAGE_MB`,
        tier === "premium" ? 2048 : 50,
      ),
    ),
    maxPasswords: parseEnvInt(
      `${prefix}_MAX_PASSWORDS`,
      tier === "premium" ? 50 : 3,
    ),
    maxNotes: parseEnvInt(`${prefix}_MAX_NOTES`, tier === "premium" ? 50 : 1),
    maxRecipients: parseEnvInt(
      `${prefix}_MAX_RECIPIENTS`,
      tier === "premium" ? 20 : 2,
    ),
  };
}

export function getTierLimits(isPremium: boolean): TierLimits {
  return limitsForTier(isPremium ? "premium" : "free");
}

/** Largest per-file upload allowed (premium cap); used for Storage bucket ceiling. */
export function getStorageBucketFileSizeLimitBytes(): number {
  return getTierLimits(true).maxFileUploadBytes;
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${bytes} B`;
}
