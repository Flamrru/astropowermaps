import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth Callback Route
 *
 * Handles magic link redirects from Supabase Auth.
 * Exchanges the code for a session, then redirects to dashboard or setup.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

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
