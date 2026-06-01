import { requireAuthUser } from "@/lib/api/auth";
import { getUserIsPremium } from "@/lib/api/tier-enforce";
import { getTierLimits } from "@/lib/tier-limits";
import { getTierUsage } from "@/lib/tier-usage";
import type { TierLimitsResponse } from "@/lib/tier-types";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const supabase = await createClient();
  try {
    const isPremium = await getUserIsPremium(supabase, auth.user.id);
    const [limits, usage] = await Promise.all([
      Promise.resolve(getTierLimits(isPremium)),
      getTierUsage(supabase, auth.user.id),
    ]);

    const body: TierLimitsResponse = {
      tier: isPremium ? "premium" : "free",
      limits,
      usage,
    };
    return NextResponse.json(body);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load tier limits";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
