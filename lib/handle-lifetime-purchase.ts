import { getPolarClient } from "@/lib/polar";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order } from "@polar-sh/sdk/models/components/order.js";
import { setProfileSubscription } from "@/lib/polar-subscription";

/**
 * Handle a successful one-time lifetime purchase.
 * Since lifetime purchases are not subscriptions, no webhook fires.
 * We manually activate the user's premium status based on the order.
 */
export async function handleLifetimePurchase(userId: string): Promise<boolean> {
  const polar = getPolarClient();
  if (!polar) {
    console.error("[lifetime] Polar is not configured");
    return false;
  }

  try {
    // Fetch one-time orders for this user
    // Use productBillingType to filter for one-time purchases only
    const pages = await polar.orders.list({
      externalCustomerId: userId,
      productBillingType: "one_time",
      limit: 10,
    });

    let lifetimeOrder: Order | null = null;

    for await (const page of pages) {
      const items = page.result?.items ?? [];
      console.log("[lifetime] Fetched one-time orders page with", items.length, "items");
      
      for (const order of items) {
        console.log("[lifetime] Checking one-time order", {
          id: order.id,
          paid: order.paid,
          status: order.status,
          productBillingType: order.product?.billingType,
        });

        // Check if order is paid
        if (order.paid === true) {
          lifetimeOrder = order;
          console.log("[lifetime] Found paid one-time order:", order.id);
          break;
        }
      }
      if (lifetimeOrder) break;
    }

    if (!lifetimeOrder) {
      console.warn("[lifetime] No paid one-time order found for user", { userId });
      return false;
    }

    // Mark user as premium with lifetime purchase
    // We don't track a subscription ID since it's a one-time purchase
    console.log("[lifetime] Marking user as premium", {
      userId,
      orderId: lifetimeOrder.id,
      customerId: lifetimeOrder.customerId,
    });

    await setProfileSubscription(userId, true, null, lifetimeOrder.customerId);

    console.log("[lifetime] Successfully activated premium for user", {
      userId,
      orderId: lifetimeOrder.id,
    });

    return true;
  } catch (error) {
    console.error("[lifetime] Error handling lifetime purchase", {
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}

/**
 * Check if user has a lifetime purchase (one-time order, not a subscription).
 * Returns true if they have paid for lifetime access.
 */
export async function hasLifetimePurchase(userId: string): Promise<boolean> {
  const polar = getPolarClient();
  if (!polar) {
    return false;
  }

  try {
    const pages = await polar.orders.list({
      externalCustomerId: userId,
      productBillingType: "one_time",
      limit: 100,
    });

    for await (const page of pages) {
      const items = page.result?.items ?? [];
      for (const order of items) {
        // One-time order with successful payment
        if (order.paid === true) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error("[lifetime] Error checking lifetime purchase", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}
