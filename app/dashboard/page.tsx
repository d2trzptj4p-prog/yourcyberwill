import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardVaultLayout } from "@/components/dashboard-vault-layout";
import { PremiumBadge } from "@/components/premium-badge";
import { SignOutButton } from "@/components/sign-out-button";
import { SubscriptionSection } from "@/components/subscription-section";
import { HandWavingIconClient } from "@/components/hand-waving-icon";
import { getOrCreateProfile } from "@/lib/profile";
import { syncUserSubscriptionOnLoad } from "@/lib/sync-user-subscription";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await syncUserSubscriptionOnLoad(user.id);

  const profile = await getOrCreateProfile(supabase, user);

  const displayName =
    profile?.full_name ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email ??
    "there";

  const isPremium = profile?.subscription_active === true;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="flex flex-wrap items-center gap-2 text-3xl tracking-tight">
            YourCyberWill
            {isPremium && <PremiumBadge />}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
            <HandWavingIconClient className="ml-2 size-5" />
            <span>Hey {displayName} <span className="">{isPremium ? " (Premium)" : "(Free User)"}</span></span> <span className="text-zinc-400 dark:text-zinc-600">({user.email})</span>
          
          </p>
        </div>
        <SignOutButton />
      </header>

      <SubscriptionSection />

      <DashboardVaultLayout />

      <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-medium">Your account</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          View and edit your profile, including your bio.
        </p>
        <Link
          href="/dashboard/profile"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          Profile
        </Link>
      </section>
    </div>
  );
}
