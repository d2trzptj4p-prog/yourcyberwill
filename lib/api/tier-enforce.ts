import { getTierLimits, formatBytes } from "@/lib/tier-limits";
import { getTierUsage } from "@/lib/tier-usage";
import type { TierLimits } from "@/lib/tier-types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function getUserIsPremium(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("subscription_active")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return data.subscription_active === true;
}

export function tierLimitError(message: string): NextResponse {
  return NextResponse.json({ error: message, code: "tier_limit" }, { status: 403 });
}

export async function enforceCountLimit(
  supabase: SupabaseClient,
  userId: string,
  isPremium: boolean,
  resource: "passwords" | "notes" | "recipients",
  limits?: TierLimits,
): Promise<NextResponse | null> {
  const tierLimits = limits ?? getTierLimits(isPremium);
  const usage = await getTierUsage(supabase, userId);

  const configs = {
    passwords: {
      max: tierLimits.maxPasswords,
      current: usage.passwords,
      label: "password entries",
    },
    notes: {
      max: tierLimits.maxNotes,
      current: usage.notes,
      label: "notes",
    },
    recipients: {
      max: tierLimits.maxRecipients,
      current: usage.recipients,
      label: "recipients",
    },
  } as const;

  const { max, current, label } = configs[resource];
  if (current >= max) {
    const tierLabel = isPremium ? "Premium" : "Free";
    const upgradeHint = isPremium
      ? ""
      : " Upgrade to Premium for a higher limit.";
    return tierLimitError(
      `${tierLabel} plan allows up to ${max} ${label}.${upgradeHint}`,
    );
  }
  return null;
}

export async function enforceFileUpload(
  supabase: SupabaseClient,
  userId: string,
  isPremium: boolean,
  newFileBytes: number,
): Promise<NextResponse | null> {
  const limits = getTierLimits(isPremium);
  const usage = await getTierUsage(supabase, userId);

  if (newFileBytes > limits.maxFileUploadBytes) {
    const tierLabel = isPremium ? "Premium" : "Free";
    return tierLimitError(
      `${tierLabel} plan allows up to ${formatBytes(limits.maxFileUploadBytes)} per file.`,
    );
  }

  if (usage.storageBytes + newFileBytes > limits.maxTotalStorageBytes) {
    const tierLabel = isPremium ? "Premium" : "Free";
    return tierLimitError(
      `${tierLabel} plan allows ${formatBytes(limits.maxTotalStorageBytes)} total file storage. You are using ${formatBytes(usage.storageBytes)}.`,
    );
  }

  return null;
}
