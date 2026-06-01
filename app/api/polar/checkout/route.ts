import { requireAuthUser } from "@/lib/api/auth";
import {
  getAppUrl,
  getPolarAccessToken,
  getPolarClient,
  isPolarAuthError,
  polarAuthHint,
  polarServer,
} from "@/lib/polar";
import { NextRequest, NextResponse } from "next/server";

type PlanType = "monthly" | "yearly" | "lifetime";

export async function POST(request: NextRequest) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json().catch(() => ({}));
  const plan: PlanType = body.plan || "monthly";

  const monthlyId = process.env.POLAR_PRODUCT_MONTHLY_ID;
  const yearlyId = process.env.POLAR_PRODUCT_YEARLY_ID;
  const lifetimeId = process.env.POLAR_PRODUCT_LIFETIME_ID;

  if (!monthlyId || !yearlyId || !lifetimeId) {
    return NextResponse.json(
      {
        error:
          "Polar products are not configured (missing POLAR_PRODUCT_MONTHLY_ID, POLAR_PRODUCT_YEARLY_ID, or POLAR_PRODUCT_LIFETIME_ID)",
      },
      { status: 503 },
    );
  }

  const token = getPolarAccessToken();
  if (!token) {
    return NextResponse.json(
      { error: "Polar is not configured (missing POLAR_ACCESS_TOKEN)" },
      { status: 503 },
    );
  }

  if (!token.startsWith("polar_oat_")) {
    return NextResponse.json(
      {
        error:
          "POLAR_ACCESS_TOKEN must be an Organization Access Token (starts with polar_oat_). Create one under Organization Settings → Access Tokens.",
      },
      { status: 503 },
    );
  }

  const polar = getPolarClient();
  if (!polar) {
    return NextResponse.json(
      { error: "Polar is not configured" },
      { status: 503 },
    );
  }

  const appUrl = getAppUrl();

  // Determine order of products: selected plan first, then others
  const productOrder = {
    monthly: [monthlyId, yearlyId, lifetimeId],
    yearly: [yearlyId, monthlyId, lifetimeId],
    lifetime: [lifetimeId, monthlyId, yearlyId],
  };

  const products = productOrder[plan] || productOrder.monthly;

  try {
    const checkout = await polar.checkouts.create({
      products,
      customerEmail: auth.user.email ?? undefined,
      externalCustomerId: auth.user.id,
      customerName:
        auth.user.user_metadata?.full_name ??
        auth.user.user_metadata?.name ??
        undefined,
      successUrl: `${appUrl}/dashboard?subscription=success&plan=${plan}`,
      returnUrl: `${appUrl}/dashboard`,
      metadata: { userId: auth.user.id, plan },
    });

    if (!checkout.url) {
      return NextResponse.json(
        { error: "Checkout URL was not returned" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: checkout.url });
  } catch (e) {
    if (isPolarAuthError(e)) {
      return NextResponse.json(
        {
          error: `Polar rejected your access token (${polarServer()}). ${polarAuthHint()} Token and products must come from the same environment. Restart the dev server after changing .env.local.`,
        },
        { status: 401 },
      );
    }
    const message = e instanceof Error ? e.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
