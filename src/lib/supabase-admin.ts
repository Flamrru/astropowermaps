import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client
 *
 * This client uses the service_role key which bypasses Row Level Security.
 * ONLY use this in server-side code (API routes, server components).
 * NEVER import this in client-side code!
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
