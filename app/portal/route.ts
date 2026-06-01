import { CustomerPortal } from "@polar-sh/nextjs";
import { getAppUrl, getPolarAccessToken, polarServer } from "@/lib/polar";
import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/** Fresh Polar customer portal session (short-lived); redirect to billing management. */
export async function GET(request: NextRequest) {
  const accessToken = getPolarAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { error: "Polar is not configured" },
      { status: 503 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", getAppUrl()));
  }

  const externalCustomerId = user.id;

  const handler = CustomerPortal({
    accessToken,
    server: polarServer(),
    returnUrl: `${getAppUrl()}/dashboard/profile`,
    getExternalCustomerId: async () => externalCustomerId,
  });

  return handler(request);
}
