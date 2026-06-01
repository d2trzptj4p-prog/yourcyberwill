import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import { getPolarClient } from "@/lib/polar";
import { createAdminClient } from "@/lib/supabase/admin";

function metadataUserId(
  meta: Record<string, unknown> | undefined | null,
): string | null {
  if (!meta) {
    return null;
  }
  const id = meta.userId ?? meta.user_id;
  if (typeof id === "string" && id.trim()) {
    return id.trim();
  }
  return null;
}

/** Map a Polar subscription payload to the Supabase user id when present inline. */
export function resolveUserIdFromSubscription(
  subscription: Subscription,
): string | null {
  const external = subscription.customer?.externalId;
  if (typeof external === "string" && external.trim()) {
    return external.trim();
  }
  return (
    metadataUserId(subscription.metadata as Record<string, unknown>) ??
    metadataUserId(subscription.customer?.metadata as Record<string, unknown>)
  );
}

/** Resolve user id from payload or stored polar ids on profiles (revoke payloads often omit externalId). */
export async function resolveUserIdForSubscription(
  subscription: Subscription,
): Promise<string | null> {
  const fromPayload = resolveUserIdFromSubscription(subscription);
  if (fromPayload) {
    return fromPayload;
  }

  const supabase = createAdminClient();

  const { data: bySubscription } = await supabase
    .from("profiles")
    .select("id")
    .eq("polar_subscription_id", subscription.id)
    .maybeSingle();

  if (bySubscription?.id) {
    return bySubscription.id;
  }

  if (subscription.customerId) {
    const { data: byCustomer } = await supabase
      .from("profiles")
      .select("id")
      .eq("polar_customer_id", subscription.customerId)
      .maybeSingle();

    if (byCustomer?.id) {
      return byCustomer.id;
    }
  }

  return null;
}

function subscriptionGrantsPremium(subscription: Subscription): boolean {
  if (subscription.status !== "active" && subscription.status !== "trialing") {
    return false;
  }
  if (subscription.endedAt && new Date(subscription.endedAt) <= new Date()) {
    return false;
  }
  return true;
}

function subscriptionRevokedOrEnded(subscription: Subscription): boolean {
  if (subscription.status === "unpaid") {
    return true;
  }

  if (subscription.endedAt && new Date(subscription.endedAt) <= new Date()) {
    return true;
  }

  if (subscription.status === "canceled") {
    // Scheduled cancel: still active until endsAt / period end
    if (
      subscription.cancelAtPeriodEnd &&
      subscription.endsAt &&
      new Date(subscription.endsAt) > new Date()
    ) {
      return false;
    }
    return true;
  }

  return false;
}

export async function setProfileSubscription(
  userId: string,
  active: boolean,
  subscriptionId: string | null,
  customerId: string | null,
): Promise<void> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({
      subscription_active: active,
      polar_subscription_id: subscriptionId,
      polar_customer_id: customerId,
    })
    .eq("id", userId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update profile subscription: ${error.message}`);
  }
  if (!data) {
    throw new Error(`No profile found for user id ${userId}`);
  }
}

export async function revokePremiumFromSubscription(
  subscription: Subscription,
): Promise<boolean> {
  const userId = await resolveUserIdForSubscription(subscription);
  if (!userId) {
    console.warn("[polar] revoke: could not resolve user", {
      subscriptionId: subscription.id,
      customerId: subscription.customerId,
    });
    return false;
  }

  await setProfileSubscription(userId, false, null, subscription.customerId);
  return true;
}

export async function activateFromSubscription(
  subscription: Subscription,
): Promise<boolean> {
  const userId = await resolveUserIdForSubscription(subscription);
  if (!userId) {
    console.warn("[polar] activate: could not resolve user", {
      subscriptionId: subscription.id,
      customerId: subscription.customerId,
    });
    return false;
  }

  if (subscriptionRevokedOrEnded(subscription)) {
    await setProfileSubscription(userId, false, null, subscription.customerId);
    return false;
  }

  if (!subscriptionGrantsPremium(subscription)) {
    return false;
  }

  await setProfileSubscription(
    userId,
    true,
    subscription.id,
    subscription.customerId,
  );
  return true;
}

/** Apply subscription webhook — revoked always removes premium; updated respects cancel-at-period-end. */
export async function applySubscriptionWebhook(
  subscription: Subscription,
  event: "active" | "created" | "updated" | "revoked",
): Promise<void> {
  if (event === "revoked") {
    await revokePremiumFromSubscription(subscription);
    return;
  }

  if (subscriptionRevokedOrEnded(subscription)) {
    await revokePremiumFromSubscription(subscription);
    return;
  }

  await activateFromSubscription(subscription);
}

/** Pull active subscriptions from Polar for this user (fallback after checkout). */
export async function syncSubscriptionFromPolar(
  userId: string,
): Promise<{ active: boolean; subscriptionId: string | null }> {
  const polar = getPolarClient();
  if (!polar) {
    throw new Error("Polar is not configured");
  }

  const pages = await polar.subscriptions.list({
    externalCustomerId: userId,
    active: true,
    limit: 10,
  });

  let first: Subscription | null = null;
  for await (const page of pages) {
    const items = page.result?.items ?? [];
    if (items.length > 0) {
      first = items[0]!;
      break;
    }
  }

  if (!first || !subscriptionGrantsPremium(first)) {
    await setProfileSubscription(userId, false, null, null);
    return { active: false, subscriptionId: null };
  }

  await setProfileSubscription(userId, true, first.id, first.customerId);
  return { active: true, subscriptionId: first.id };
}
