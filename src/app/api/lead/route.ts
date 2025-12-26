import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

interface LeadPayload {
  email: string;
  quiz: {
    q1: string | null;
    q2: string | null;
  };
  utm: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
  };
  session_id: string;
  timestamp: string;
}

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

    // Insert lead into Supabase
    const { error: dbError } = await supabaseAdmin.from("astro_leads").insert({
      email: body.email,
      quiz_q1: body.quiz.q1,
      quiz_q2: body.quiz.q2,
      utm_source: body.utm.utm_source,
      utm_medium: body.utm.utm_medium,
      utm_campaign: body.utm.utm_campaign,
      utm_content: body.utm.utm_content,
      utm_term: body.utm.utm_term,
      session_id: body.session_id,
    });

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json(
        { error: "Failed to save lead" },
        { status: 500 }
      );
    }

    // Optional: Forward to webhook if configured (e.g., for Zapier automation)
    const webhookUrl = process.env.LEAD_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).catch((err) => console.error("Webhook error:", err));
    }

    return NextResponse.json({ success: true });
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
