/**
 * TEST ENDPOINT - Delete before production!
 *
 * Test MailerLite integration:
 * - POST /api/test-mailerlite?action=add-lead&email=test@example.com
 * - POST /api/test-mailerlite?action=move-customer&email=test@example.com
 */

import { NextRequest, NextResponse } from "next/server";
import { addSubscriberToLeads, moveSubscriberToCustomers } from "@/lib/mailerlite";

export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  if (action === "add-lead") {
    const result = await addSubscriberToLeads({
      email,
      mapUrl: `https://astropowermaps.com/map?sid=test-${Date.now()}`,
      birthLocation: "Test City, Test Country",
      quizInterest: "Career / business growth, Adventure / feeling alive",
      utmSource: "test",
    });

    return NextResponse.json({
      action: "add-lead",
      email,
      result,
    });
  }

  if (action === "move-customer") {
    const result = await moveSubscriberToCustomers(email);

    return NextResponse.json({
      action: "move-customer",
      email,
      result,
    });
  }

  return NextResponse.json({
    error: "Invalid action. Use: add-lead or move-customer",
  }, { status: 400 });
}
