import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface BirthDataPayload {
  date: string;
  time: string;
  timeUnknown?: boolean;
  timeWindow?: string;
  location: {
    name: string;
    lat: number;
    lng: number;
    timezone: string;
  };
  birthDatetimeUtc?: string;
}

interface LeadPayload {
  email: string;
  quiz?: {
    q1: string | null;
    q2: string | null;
  };
  utm?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
  session_id: string;
  timestamp?: string;
  birthData?: BirthDataPayload;
}

/**
 * GET /api/lead?sid=xxx
 * Fetch lead data by session_id (only if has_purchased = true)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sid");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      );
    }

    // Fetch lead by session_id
    const { data: lead, error: dbError } = await supabaseAdmin
      .from("astro_leads")
      .select("*")
      .eq("session_id", sessionId)
      .single();

    if (dbError || !lead) {
      return NextResponse.json(
        { error: "Lead not found" },
        { status: 404 }
      );
    }

    // Build birth data if available
    // Strip seconds from time (database stores HH:MM:SS, API expects HH:MM)
    const formattedTime = lead.birth_time?.substring(0, 5) || null;
    const birthData = lead.birth_date ? {
      date: lead.birth_date,
      time: formattedTime,
      timeUnknown: lead.birth_time_unknown,
      timeWindow: lead.birth_time_window,
      location: {
        name: lead.birth_location_name,
        lat: parseFloat(lead.birth_location_lat),
        lng: parseFloat(lead.birth_location_lng),
        timezone: lead.birth_location_timezone,
      },
    } : null;

    // Return lead data (birth data available even pre-purchase for reveal flow)
    return NextResponse.json({
      success: true,
      email: lead.email,
      session_id: lead.session_id,
      has_purchased: lead.has_purchased || false,
      quiz_q1: lead.quiz_q1,
      quiz_q2: lead.quiz_q2,
      utm: {
        utm_source: lead.utm_source,
        utm_medium: lead.utm_medium,
        utm_campaign: lead.utm_campaign,
      },
      birthData,
    });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lead
 * Create or update lead with email, quiz answers, and birth data
 */
export async function POST(request: NextRequest) {
  try {
    const body: LeadPayload = await request.json();

    // Validate email
    if (!body.email || !isValidEmail(body.email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Build the insert/update payload
    const leadData: Record<string, unknown> = {
      email: body.email,
      session_id: body.session_id,
    };

    // Add quiz data if provided
    if (body.quiz) {
      leadData.quiz_q1 = body.quiz.q1;
      leadData.quiz_q2 = body.quiz.q2;
    }

    // Add UTM data if provided
    if (body.utm) {
      leadData.utm_source = body.utm.utm_source;
      leadData.utm_medium = body.utm.utm_medium;
      leadData.utm_campaign = body.utm.utm_campaign;
      leadData.utm_content = body.utm.utm_content;
      leadData.utm_term = body.utm.utm_term;
    }

    // Add birth data if provided
    if (body.birthData) {
      leadData.birth_date = body.birthData.date;
      leadData.birth_time = body.birthData.time;
      leadData.birth_time_unknown = body.birthData.timeUnknown || false;
      leadData.birth_time_window = body.birthData.timeWindow;
      leadData.birth_location_name = body.birthData.location.name;
      leadData.birth_location_lat = body.birthData.location.lat;
      leadData.birth_location_lng = body.birthData.location.lng;
      leadData.birth_location_timezone = body.birthData.location.timezone;
      leadData.birth_datetime_utc = body.birthData.birthDatetimeUtc;
    }

    // Try to update existing lead first (by session_id), otherwise insert
    const { data: existingLead } = await supabaseAdmin
      .from("astro_leads")
      .select("id")
      .eq("session_id", body.session_id)
      .single();

    let dbError;
    if (existingLead) {
      // Update existing lead
      const { error } = await supabaseAdmin
        .from("astro_leads")
        .update(leadData)
        .eq("session_id", body.session_id);
      dbError = error;
    } else {
      // Insert new lead
      const { error } = await supabaseAdmin
        .from("astro_leads")
        .insert(leadData);
      dbError = error;
    }

    if (dbError) {
      console.error("Supabase error:", dbError);
      return NextResponse.json(
        { error: "Failed to save lead" },
        { status: 500 }
      );
    }

    // Optional: Forward to webhook if configured
    const webhookUrl = process.env.LEAD_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch((err) => console.error("Webhook error:", err));
    }

    return NextResponse.json({
      success: true,
      sessionId: body.session_id,
    });
  } catch (error) {
    console.error("Error processing lead:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
