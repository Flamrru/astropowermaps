import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Test endpoint for Meta Conversions API
 *
 * Usage:
 * 1. Go to Meta Events Manager → Your Pixel → Test Events
 * 2. Copy the test event code (e.g., "TEST12345")
 * 3. Call: POST /api/meta/test-capi
 *    Body: { "test_event_code": "TEST12345", "email": "test@example.com" }
 * 4. Check "Test Events" tab - event should appear instantly
 *
 * This endpoint is for debugging only - protected by admin password in production.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const API_VERSION = "v18.0";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function hashSHA256(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.toLowerCase().trim())
    .digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Simple auth check
    if (body.password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized - provide admin password" },
        { status: 401 }
      );
    }

    // Get test event code from request or env
    const testEventCode = body.test_event_code || process.env.META_TEST_EVENT_CODE;
    const email = body.email || "test@example.com";
    const eventName = body.event_name || "Purchase";
    const value = body.value || 9.99;

    if (!PIXEL_ID) {
      return NextResponse.json({
        error: "NEXT_PUBLIC_META_PIXEL_ID not set",
        fix: "Add NEXT_PUBLIC_META_PIXEL_ID to Vercel environment variables",
      }, { status: 500 });
    }

    if (!ACCESS_TOKEN) {
      return NextResponse.json({
        error: "META_CAPI_ACCESS_TOKEN not set",
        fix: "Add META_CAPI_ACCESS_TOKEN to Vercel environment variables",
      }, { status: 500 });
    }

    const endpoint = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;
    const eventId = `test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const eventData: Record<string, unknown> = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          action_source: "website",
          event_source_url: "https://www.astropowermap.com/reveal",
          user_data: {
            em: hashSHA256(email),
          },
          custom_data: eventName === "Purchase" ? {
            value: value,
            currency: "USD",
          } : undefined,
        },
      ],
      access_token: ACCESS_TOKEN,
    };

    // Add test event code if provided
    if (testEventCode) {
      eventData.test_event_code = testEventCode;
    }

    console.log("Meta CAPI Test - Sending event:", {
      pixel_id: PIXEL_ID,
      event_name: eventName,
      event_id: eventId,
      has_test_code: Boolean(testEventCode),
      email_hash: hashSHA256(email).substring(0, 10) + "...",
    });

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: "Meta API error",
        details: result,
        debug: {
          pixel_id: PIXEL_ID,
          endpoint,
          status: response.status,
        },
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: testEventCode
        ? "Event sent! Check Meta Events Manager → Test Events tab"
        : "Event sent! Check Meta Events Manager → Overview (may take up to 20 min)",
      data: {
        events_received: result.events_received,
        event_id: eventId,
        event_name: eventName,
        pixel_id: PIXEL_ID,
        used_test_code: Boolean(testEventCode),
      },
      next_steps: testEventCode
        ? [
            "1. Go to Meta Events Manager",
            "2. Select your Pixel (ID: " + PIXEL_ID + ")",
            "3. Click 'Test Events' tab",
            "4. You should see the event appear within seconds",
          ]
        : [
            "1. Go to Meta Events Manager",
            "2. Select your Pixel (ID: " + PIXEL_ID + ")",
            "3. Click 'Overview' tab",
            "4. Events may take up to 20 minutes to appear",
            "TIP: Use test_event_code for instant visibility",
          ],
    });
  } catch (error) {
    console.error("Meta CAPI Test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

// GET request shows instructions
export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/meta/test-capi",
    description: "Test Meta Conversions API integration",
    parameters: {
      password: "Required - your ADMIN_PASSWORD",
      test_event_code: "Optional - get from Meta Events Manager → Test Events",
      email: "Optional - defaults to test@example.com",
      event_name: "Optional - defaults to 'Purchase'",
      value: "Optional - defaults to 9.99",
    },
    example: {
      password: "your_admin_password",
      test_event_code: "TEST12345",
      email: "test@example.com",
      event_name: "Purchase",
      value: 5.99,
    },
    how_to_get_test_code: [
      "1. Go to business.facebook.com/events_manager",
      "2. Select your Pixel",
      "3. Click 'Test Events' tab",
      "4. Copy the 'Server' test event code",
    ],
  });
}
