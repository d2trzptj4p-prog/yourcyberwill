import { Webhooks } from "@polar-sh/nextjs";
import {
  applySubscriptionWebhook,
  applyOrderWebhook,
} from "@/lib/polar-subscription";

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",
  onSubscriptionActive: async (payload) => {
    try {
      await applySubscriptionWebhook(payload.data, "active");
    } catch (error) {
      console.error("[polar] subscription.active webhook failed:", error);
      throw error;
    }
  },
  onSubscriptionCreated: async (payload) => {
    try {
      await applySubscriptionWebhook(payload.data, "created");
    } catch (error) {
      console.error("[polar] subscription.created webhook failed:", error);
      throw error;
    }
  },
  onSubscriptionUpdated: async (payload) => {
    try {
      await applySubscriptionWebhook(payload.data, "updated");
    } catch (error) {
      console.error("[polar] subscription.updated webhook failed:", error);
      throw error;
    }
  },
  onSubscriptionRevoked: async (payload) => {
    try {
      await applySubscriptionWebhook(payload.data, "revoked");
    } catch (error) {
      console.error("[polar] subscription.revoked webhook failed:", error);
      throw error;
    }
  },
  onOrderPaid: async (payload) => {
    try {
      await applyOrderWebhook(payload.data, "paid");
    } catch (error) {
      console.error("[polar] order.paid webhook failed:", error);
      throw error;
    }
  },
});