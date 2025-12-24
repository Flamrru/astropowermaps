import { NextRequest, NextResponse } from "next/server";

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

    // Log the lead (for debugging)
    console.log("New lead received:", {
      email: body.email,
      quiz: body.quiz,
      utm: body.utm,
      session_id: body.session_id,
      timestamp: body.timestamp,
    });

    // Forward to webhook if configured
    const webhookUrl = process.env.LEAD_WEBHOOK_URL;

    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!webhookResponse.ok) {
          console.error("Webhook failed:", webhookResponse.status);
          // Don't fail the request if webhook fails - we still captured the lead in logs
        }
      } catch (webhookError) {
        console.error("Webhook error:", webhookError);
        // Don't fail the request if webhook fails
      }
    } else {
      console.log("No LEAD_WEBHOOK_URL configured - lead captured in logs only");
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
