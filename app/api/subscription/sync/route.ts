import { requireAuthUser } from "@/lib/api/auth";
import { syncSubscriptionFromPolar } from "@/lib/polar-subscription";
import { NextResponse } from "next/server";

export async function POST() {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const result = await syncSubscriptionFromPolar(auth.user.id);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
