import { requireAuthUser } from "@/lib/api/auth";
import type { SubscriptionState } from "@/lib/check-in-types";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("subscription_active, polar_subscription_id")
    .eq("id", auth.user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const state: SubscriptionState = {
    active: data.subscription_active,
    polar_subscription_id: data.polar_subscription_id,
  };

  return NextResponse.json(state);
}
