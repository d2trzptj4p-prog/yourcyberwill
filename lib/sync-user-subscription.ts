import { getPolarClient } from "@/lib/polar";
import { syncSubscriptionFromPolar } from "@/lib/polar-subscription";

/** Reconcile profiles.subscription_active with Polar once per page load. */
export async function syncUserSubscriptionOnLoad(userId: string): Promise<void> {
  if (!getPolarClient()) {
    return;
  }
  try {
    await syncSubscriptionFromPolar(userId);
  } catch (e) {
    console.error("[polar] subscription sync on load failed:", e);
  }
}
