"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * DevAutoLogin
 *
 * Automatically signs in the dev user in development mode.
 * This component should be placed in the root layout.
 *
 * Only active when NODE_ENV === 'development'
 */

const DEV_EMAIL = "dev@stellaplus.app";
const DEV_PASSWORD = "devtest123";

export default function DevAutoLogin() {
  const [status, setStatus] = useState<"checking" | "signing-in" | "done">("checking");
  const router = useRouter();

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") {
      setStatus("done");
      return;
    }

    autoLogin();
  }, []);

  async function autoLogin() {
    try {
      const supabase = createClient();

      // Check if already logged in
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Already logged in
        setStatus("done");
        return;
      }

      // Not logged in, auto-sign in
      setStatus("signing-in");

      const { error } = await supabase.auth.signInWithPassword({
        email: DEV_EMAIL,
        password: DEV_PASSWORD,
      });

      if (error) {
        console.error("[DevAutoLogin] Failed:", error.message);
      } else {
        console.log("[DevAutoLogin] Signed in as dev user");
        // Refresh to pick up the new session
        router.refresh();
      }

      setStatus("done");
    } catch (err) {
      console.error("[DevAutoLogin] Error:", err);
      setStatus("done");
    }
  }

  // Show nothing - this is invisible
  // Optionally show a small indicator while signing in
  if (status === "signing-in") {
    return (
      <div className="fixed bottom-4 left-4 z-50 px-3 py-1.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
        Dev: Signing in...
      </div>
    );
  }

  return null;
}
