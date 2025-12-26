import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface FunnelEventPayload {
  session_id: string;
  event_name: string;
  step_number: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: FunnelEventPayload = await request.json();

    // Validate required fields
    if (!body.session_id || !body.event_name || body.step_number === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert funnel event into Supabase
    const { error: dbError } = await supabaseAdmin
      .from("astro_funnel_events")
      .insert({
        session_id: body.session_id,
        event_name: body.event_name,
        step_number: body.step_number,
      });

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to save event" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing funnel event:", error);
    return NextResponse.json(
      { error: "Failed to process event" },
      { status: 500 }
    );
  }
}
