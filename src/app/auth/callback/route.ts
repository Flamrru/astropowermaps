import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth Callback Route
 *
 * Handles auth redirects from Supabase:
 * - Password reset links (type=recovery)
 * - Email confirmation links
 * - Magic links (deprecated, but still handled)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/home";

  // Handle password recovery redirect
  // Supabase sends users here after clicking password reset link
  if (type === "recovery") {
    // Redirect to our reset-password page where user can set new password
    // The hash fragment contains the access token that Supabase client will use
    return NextResponse.redirect(`${origin}/reset-password`);
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if user needs to complete setup
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if profile exists and is set up
        const { data: profile } = await supabase
          .from("user_profiles")
          .select("account_status")
          .eq("user_id", user.id)
          .single();

        // If no profile or pending setup, redirect to setup
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
