import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PremiumBadge } from "@/components/premium-badge";
import { ProfileForm } from "@/components/profile-form";
import { ProfileSubscriptionSection } from "@/components/profile-subscription-section";
import { SignOutButton } from "@/components/sign-out-button";
import { getOrCreateProfile } from "@/lib/profile";
import { syncUserSubscriptionOnLoad } from "@/lib/sync-user-subscription";
import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/app/components/footer";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await syncUserSubscriptionOnLoad(user.id);

  const profile = await getOrCreateProfile(supabase, user);

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-red-600">
          Could not load your profile. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <header className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/dashboard"
            className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            ← Dashboard
          </Link>
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight">
            Profile
            {profile.subscription_active && <PremiumBadge />}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Your account details and bio.
          </p>
        </div>
        <SignOutButton />
      </header>

      {profile.avatar_url && (
        <Image
          src={profile.avatar_url}
          alt=""
          width={64}
          height={64}
          className="rounded-full"
          unoptimized
        />
      )}

      <ProfileSubscriptionSection profile={profile} />

      <ProfileForm profile={profile} />
      </div>

      <Footer/>
    </div>
  );
}
