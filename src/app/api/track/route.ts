import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * POST /api/track
 *
 * Ingests tracking events from the client.
 * Can be called authenticated (with user_id) or anonymous.
 *
 * Body: {
 *   event_name: string,
 *   event_category: string,
 *   properties?: Record<string, unknown>,
 *   session_id?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { event_name, event_category, properties = {}, session_id } = body;

    // Validate required fields
    if (!event_name || typeof event_name !== "string") {
      return NextResponse.json(
        { error: "event_name is required" },
        { status: 400 }
      );
    }

    if (!event_category || typeof event_category !== "string") {
      return NextResponse.json(
        { error: "event_category is required" },
        { status: 400 }
      );
    }

    // Try to get user_id from session (optional - tracking works for anonymous users too)
    let userId: string | null = null;
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch {
      // Anonymous user, that's fine
    }

    // Insert event
    const { error: insertError } = await supabaseAdmin.from("app_events").insert({
      user_id: userId,
      event_name,
      event_category,
      properties,
      session_id: session_id || null,
    });

    if (insertError) {
      console.error("Failed to insert tracking event:", insertError);
      // Don't fail the request - tracking should be non-blocking
      return NextResponse.json({ success: true, warning: "Event not stored" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track API error:", error);
    // Always return success - tracking should never break the app
    return NextResponse.json({ success: true, warning: "Tracking error" });
  }
}
