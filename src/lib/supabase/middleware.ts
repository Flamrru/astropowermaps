import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth bypass flag
 * Set to false to enable real authentication
 */
const BYPASS_AUTH = true;

/**
 * Refreshes the user's session and handles auth redirects.
 * Called from the main middleware.ts file.
 */
export async function updateSession(request: NextRequest) {
  // TEMPORARY: Skip all auth checks for testing
  if (BYPASS_AUTH) {
    return NextResponse.next({ request });
  }
  // Check for auth errors in URL (Supabase redirects here on magic link failures)
  const errorCode = request.nextUrl.searchParams.get("error_code");
  const error = request.nextUrl.searchParams.get("error");

  if (errorCode || error) {
    // Redirect to login with error message
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = ""; // Clear all params
    url.searchParams.set("error", errorCode || error || "auth_failed");
    url.searchParams.set("error_description", request.nextUrl.searchParams.get("error_description") || "");
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if route requires authentication
  const protectedRoutes = ["/dashboard", "/calendar", "/profile"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Allow dev mode bypass
  const isDevMode =
    request.nextUrl.searchParams.get("dev") === "true" ||
    request.nextUrl.searchParams.get("d") === "dashboard";

  // Redirect to login if accessing protected route without auth (and not dev mode)
  if (isProtectedRoute && !user && !isDevMode) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
