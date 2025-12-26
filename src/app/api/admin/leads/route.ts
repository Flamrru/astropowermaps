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

    return NextResponse.json({
      leads: leads || [],
      stats: {
        total: leads?.length || 0,
        today: todayLeads.length,
      },
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
