export type TierName = "free" | "premium";

export type TierLimits = {
  maxFileUploadBytes: number;
  maxTotalStorageBytes: number;
  maxPasswords: number;
  maxNotes: number;
  maxRecipients: number;
};

export type TierUsage = {
  storageBytes: number;
  passwords: number;
  notes: number;
  recipients: number;
};

export type TierLimitsResponse = {
  tier: TierName;
  limits: TierLimits;
  usage: TierUsage;
};
