import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth Callback Route
 *
 * Handles auth redirects from Supabase:
 * - Password reset links (type=recovery)
 * - Magic links for grandfathered users
 * - OAuth callbacks
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/home";

  // Handle password recovery redirect
  if (type === "recovery") {
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check profile status
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("account_status, subscription_status")
          .eq("user_id", user.id)
          .single();

        // Grandfathered users with pending setup → send to setup page
        if (profile?.subscription_status === "grandfathered" && profile?.account_status === "pending_setup") {
          return NextResponse.redirect(`${origin}/setup?type=grandfathered`);
        }

        // Regular users with pending setup → send to setup
        if (!profile || profile.account_status === "pending_setup") {
          return NextResponse.redirect(`${origin}/setup`);
        }
      }

      // Redirect to intended destination
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If something went wrong, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
