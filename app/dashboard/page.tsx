import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/dashboard-client";
import { DashboardVaultLayout } from "@/components/dashboard-vault-layout";
import { PremiumBadge } from "@/components/premium-badge";
import { SignOutButton } from "@/components/sign-out-button";
import { SubscriptionSection } from "@/components/subscription-section";
import { getOrCreateProfile } from "@/lib/profile";
import { syncUserSubscriptionOnLoad } from "@/lib/sync-user-subscription";
import { handleLifetimePurchase } from "@/lib/handle-lifetime-purchase";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Footer } from "../components/footer";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  console.log("[dashboard] Page loaded with params:", params);
  
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Handle lifetime purchase completion
  const subscription = Array.isArray(params.subscription)
    ? params.subscription[0]
    : params.subscription;
  const plan = Array.isArray(params.plan) ? params.plan[0] : params.plan;
  
  console.log("[dashboard] Parsed params:", { subscription, plan, userId: user.id });

  if (subscription === "success" && plan === "lifetime") {
    console.log("[dashboard] Activating lifetime purchase for user", user.id);
    const activated = await handleLifetimePurchase(user.id);
    console.log("[dashboard] Lifetime purchase activation result:", activated);
  }

  await syncUserSubscriptionOnLoad(user.id);

  const profile = await getOrCreateProfile(supabase, user);

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
              Profile Error
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Could not load your profile. Please try signing out and signing back in.
            </p>
            <a
              href="/auth/logout"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Sign Out
            </a>
          </div>
        </div>
      </div>
    );
  }

  const displayName =
    profile.full_name ??
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email ??
    "there";

  const isPremium = profile?.subscription_active === true;
  console.log("[dashboard] Final profile state:", {
    userId: user.id,
    isPremium,
    subscriptionActive: profile?.subscription_active,
  });

  return (
    <>
    <DashboardClient profile={profile}>
      <div className="flex flex-col min-h-screen bg-white dark:bg-black">
        {/* Header */}
        <header className="border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 select-none">
              <div className="flex items-center justify-between">
            <div className="w-[200px] h-12 select-none overflow-hidden -translate-x-4.5 flex justify-center items-center">
              <img className="min-w-full min-h-full object-cover scale-150" src="/textlogo.png" alt="yourcyberwill Logo" />
            </div>
            
          </div>
          </Link>
          </div>
                {isPremium && <PremiumBadge />}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Logged in via {user.email} as <span className="font-semibold">{displayName}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
            {/* <div className="w-4 h-2.5 animate-pulse translate-x-56 bg-green-300 rounded-full"></div> */}
            <Input className="w-60 not-sm:hidden" value="support@yourcyberwill.com" readOnly />
            <SignOutButton />
            
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-12">
            {!profile.recipients_notified_complete && <SubscriptionSection />}

            {/* Hi: {profile.recipients_notified_complete ? "Locked" : "Unlocked"} */}

            <DashboardVaultLayout profile={profile} />

            {/* Account Section */}
            <section className="rounded-xl border-2 border-slate-200 p-8 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="space-y-4">
                <div className="flex items-center gap-5">
                  {/* <div className="flex items-center justify-center rounded-lg bg-black dark:bg-white">
                    <span className="text-lg dark:text-black">🔒</span>
                  </div> */}
                  <div>
                    <h2 className="text-2xl text-black dark:text-white">
                      Account Settings
                    </h2>
                    <p className="text-md mt-2 text-zinc-600 dark:text-zinc-400">
                      View and manage your profile settings
                    </p>
                  </div>
                </div>
                <Link
                  href="/dashboard/profile"
                  // className="inline-flex h-10 items-center justify-center rounded-lg bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  <Button variant="secondary">
                    Go to Profile
                  </Button>
                </Link>
              </div>
            </section>

            
          </div>
        </main>
      </div>

      
    </DashboardClient>

    <Footer/>
    
    </>
  );
}
