import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user;
  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/auth") || pathname.startsWith("/sitemap.xml") || pathname.startsWith("/sitemap.xml") ||  pathname.startsWith("/sitemap.xml") || pathname.startsWith("/privacy") || pathname.startsWith("/terms") || pathname.startsWith("/hero.mov")|| pathname.startsWith("/api") || pathname.startsWith("/api/webhooks/polar")|| pathname.startsWith("/blog");
  const isPublicReleaseRoute = pathname.startsWith("/release");
  const isProtectedRoute = pathname.startsWith("/dashboard");

  if (isProtectedRoute) {
    console.log("[proxy] Dashboard access attempt", {
      hasUser: !!user,
      pathname,
      userId: user?.id,
    });
  }

  if (!user && isProtectedRoute) {
    console.log("[proxy] Redirecting to login - no user found", {
      pathname,
    });
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (
    !user &&
    !isAuthRoute &&
    !isPublicReleaseRoute &&
    pathname !== "/" &&
    !pathname.startsWith("/api/release")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
