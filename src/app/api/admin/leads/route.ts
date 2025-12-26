import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase-admin";

const COOKIE_NAME = "admin_session";

export async function GET() {
  // Check authentication
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME);

  if (session?.value !== "authenticated") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Fetch all leads from Supabase
    const { data: leads, error } = await supabaseAdmin
      .from("astro_leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch leads" },
        { status: 500 }
      );
    }

    // Calculate stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLeads = leads?.filter((lead) => {
      const leadDate = new Date(lead.created_at);
      return leadDate >= today;
    }) || [];

    // Fetch funnel events for analytics
    const { data: funnelEvents } = await supabaseAdmin
      .from("astro_funnel_events")
      .select("event_name");

    // Count each funnel event type
    const funnelCounts: Record<string, number> = {
      page_view: leads?.length || 0, // Approximate from leads (they all visited)
      quiz_start: 0,
      q1_answered: 0,
      q2_answered: 0,
      email_screen: 0,
      lead: leads?.length || 0, // Leads are the conversions
    };

    funnelEvents?.forEach((event) => {
      if (event.event_name in funnelCounts) {
        funnelCounts[event.event_name]++;
      }
    });

    return NextResponse.json({
      leads: leads || [],
      stats: {
        total: leads?.length || 0,
        today: todayLeads.length,
      },
      funnel: funnelCounts,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
