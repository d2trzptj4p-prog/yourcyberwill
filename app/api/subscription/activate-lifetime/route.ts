import { requireAuthUser } from "@/lib/api/auth";
import { handleLifetimePurchase } from "@/lib/handle-lifetime-purchase";
import { NextResponse } from "next/server";

/**
 * Activate lifetime premium for the authenticated user.
 * This endpoint is called after successful one-time lifetime purchase checkout.
 * Since one-time purchases don't trigger subscription webhooks, we manually activate here.
 */
export async function POST() {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const success = await handleLifetimePurchase(auth.user.id);

    if (!success) {
      return NextResponse.json(
        { error: "Could not find lifetime purchase order" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[activate-lifetime] Error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to activate",
      },
      { status: 500 },
    );
  }
}
