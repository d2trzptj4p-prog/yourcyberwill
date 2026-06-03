import { ManageSubscriptionButton } from "@/components/manage-subscription-button";
import type { Profile } from "@/lib/types";
import Link from "next/link";

type ProfileSubscriptionSectionProps = {
  profile: Pick<
    Profile,
    "subscription_active" | "polar_customer_id" | "polar_subscription_id"
  >;
};

export function ProfileSubscriptionSection({
  profile,
}: ProfileSubscriptionSectionProps) {
  const canManagePortal = Boolean(
    profile.subscription_active ||
      profile.polar_customer_id ||
      profile.polar_subscription_id,
  );

  return (
    <section className="rounded-2xl border-2 border-slate-200 p-6 dark:border-zinc-800">
      <h2 className="text-lg font-medium">Subscription</h2>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
        {profile.subscription_active
          ? "You’re on Premium. Update payment method, view invoices, or cancel in the Polar customer portal."
          : canManagePortal
            ? "View billing history or reactivate your plan in the customer portal."
            : "Subscribe on the dashboard to unlock Premium limits."}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {canManagePortal ? (
          <ManageSubscriptionButton visible />
        ) : (
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Subscribe on dashboard
          </Link>
        )}
      </div>
    </section>
  );
}
